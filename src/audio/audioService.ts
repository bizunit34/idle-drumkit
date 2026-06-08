import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioPlayerOptions,
} from 'expo-audio';
import { bundledSounds } from '../data/sounds';
import { customSoundExists } from '../storage/customSoundFiles';
import type { AppSettings, MidiPad, SoundKey } from '../types';

const STANDARD_PLAYERS_PER_SOURCE = 3;
const LOW_LATENCY_PLAYERS_PER_SOURCE = 5;

type PlayerBucket = {
  players: AudioPlayer[];
  cursor: number;
};

type ActiveMidiPad = {
  source: number | string;
  player: AudioPlayer;
  chokeGroup: MidiPad['behavior']['chokeGroup'];
};

const buckets = new Map<string, PlayerBucket>();
const activeMidiPads = new Map<string, ActiveMidiPad>();
let currentLowLatencyMode = true;

export async function configureDrumkitAudio(settings: AppSettings): Promise<void> {
  const shouldRebuildPlayers = currentLowLatencyMode !== settings.lowLatencyMode;
  currentLowLatencyMode = settings.lowLatencyMode;

  if (shouldRebuildPlayers) {
    releaseAudioPlayers();
  }

  await setAudioModeAsync({
    interruptionMode: 'mixWithOthers',
    allowsRecording: false,
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
  });

  warmBundledSounds(settings.masterVolume);
}

function getSourceId(source: number | string): string {
  return typeof source === 'number' ? `asset:${source}` : `uri:${source}`;
}

function getBucket(source: number | string, volume: number): PlayerBucket {
  const id = getSourceId(source);
  const existing = buckets.get(id);
  if (existing) return existing;

  const options: AudioPlayerOptions = {
    downloadFirst: true,
    keepAudioSessionActive: currentLowLatencyMode,
    preferredForwardBufferDuration: currentLowLatencyMode ? 0 : 0.25,
  };
  const poolSize = currentLowLatencyMode
    ? LOW_LATENCY_PLAYERS_PER_SOURCE
    : STANDARD_PLAYERS_PER_SOURCE;

  const players = Array.from({ length: poolSize }, () => {
    const player = createAudioPlayer(
      typeof source === 'number' ? source : { uri: source },
      options,
    );
    player.volume = volume;
    return player;
  });
  const bucket = { players, cursor: 0 };
  buckets.set(id, bucket);
  return bucket;
}

function getNextPlayer(source: number | string, volume: number): AudioPlayer {
  const bucket = getBucket(source, volume);
  const player = bucket.players[bucket.cursor] ?? bucket.players[0];
  if (!player) {
    throw new Error('No audio players are available.');
  }
  bucket.cursor = (bucket.cursor + 1) % bucket.players.length;
  player.volume = volume;
  return player;
}

async function startPlayer(player: AudioPlayer): Promise<void> {
  await player.seekTo(0);
  player.play();
}

async function playSource(source: number | string, volume: number): Promise<void> {
  await startPlayer(getNextPlayer(source, volume));
}

async function stopPlayer(player: AudioPlayer): Promise<void> {
  player.pause();
  await player.seekTo(0);
}

async function chokeSource(source: number | string): Promise<void> {
  const bucket = buckets.get(getSourceId(source));
  if (!bucket) return;

  await Promise.all(bucket.players.map((player) => stopPlayer(player)));
}

export async function chokeDrumSound(sound: SoundKey): Promise<void> {
  await chokeSource(bundledSounds[sound]);
}

async function resolvePadSource(
  pad: MidiPad,
): Promise<{ source: number | string; fallbackUsed: boolean }> {
  if (!pad.customSoundUri) return { source: bundledSounds[pad.sound], fallbackUsed: false };
  if (!customSoundExists(pad.customSoundUri)) {
    return { source: bundledSounds[pad.sound], fallbackUsed: true };
  }
  return { source: pad.customSoundUri, fallbackUsed: false };
}

async function stopActiveMidiPad(padId: string, stopMode: MidiPad['behavior']['stopMode']) {
  const active = activeMidiPads.get(padId);
  if (!active) return;
  activeMidiPads.delete(padId);

  // Expo audio has no precise sampler envelope here. Short/medium fade are best-effort delayed
  // stops for now; a native sampler should replace this boundary if tester timing requires it.
  const delayMs = stopMode === 'shortFade' ? 90 : stopMode === 'mediumFade' ? 220 : 0;
  if (delayMs > 0) {
    await new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }
  await stopPlayer(active.player);
}

async function chokeMidiGroup(
  chokeGroup: MidiPad['behavior']['chokeGroup'],
  exceptPadId?: string,
): Promise<void> {
  if (chokeGroup === 'none') return;

  const matchingPads = [...activeMidiPads.entries()].filter(
    ([padId, active]) => active.chokeGroup === chokeGroup && padId !== exceptPadId,
  );
  await Promise.all(matchingPads.map(([padId]) => stopActiveMidiPad(padId, 'immediate')));
}

async function chokeKnownGroupSources(
  chokeGroup: MidiPad['behavior']['chokeGroup'],
): Promise<void> {
  if (chokeGroup === 'hihat') {
    await Promise.all([chokeDrumSound('closedHihat'), chokeDrumSound('openHihat')]);
  }
  if (chokeGroup === 'cymbal') {
    await Promise.all([chokeDrumSound('crash'), chokeDrumSound('ride')]);
  }
}

function warmBundledSounds(volume: number): void {
  for (const source of Object.values(bundledSounds)) {
    getBucket(source, volume);
  }
}

export async function playDrumSound(
  sound: SoundKey,
  settings: AppSettings,
  customSoundUri?: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const volume = Math.max(0, Math.min(1, settings.masterVolume));
  if (sound === 'closedHihat') {
    await chokeDrumSound('openHihat');
  }

  if (customSoundUri) {
    try {
      if (!customSoundExists(customSoundUri)) {
        throw new Error('Custom sound file is missing.');
      }
      await playSource(customSoundUri, volume);
      return { ok: true };
    } catch {
      await playSource(bundledSounds[sound], volume);
      return { ok: false, message: 'Custom sound failed. Played default sound.' };
    }
  }

  await playSource(bundledSounds[sound], volume);
  return { ok: true };
}

export async function pressMidiPad(
  pad: MidiPad,
  settings: AppSettings,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const volume =
    (Math.max(0, Math.min(1, settings.masterVolume)) *
      Math.max(0, Math.min(100, pad.behavior.padVolume))) /
    100;
  const active = activeMidiPads.get(pad.id);

  if (pad.behavior.playbackMode === 'toggle' && active) {
    await stopActiveMidiPad(pad.id, pad.behavior.stopMode);
    return { ok: true };
  }

  if (active) {
    if (pad.behavior.retriggerMode === 'ignoreWhilePlaying') return { ok: true };
    if (pad.behavior.retriggerMode === 'restart' || pad.behavior.playbackMode === 'gate') {
      await stopActiveMidiPad(pad.id, 'immediate');
    }
  }

  await chokeMidiGroup(pad.behavior.chokeGroup, pad.id);
  await chokeKnownGroupSources(pad.behavior.chokeGroup);

  const { source, fallbackUsed } = await resolvePadSource(pad);
  const player = getNextPlayer(source, volume);
  await startPlayer(player);

  if (pad.behavior.playbackMode === 'gate' || pad.behavior.playbackMode === 'toggle') {
    activeMidiPads.set(pad.id, {
      source,
      player,
      chokeGroup: pad.behavior.chokeGroup,
    });
  }

  return fallbackUsed
    ? { ok: false, message: 'Custom sound failed. Played default sound.' }
    : { ok: true };
}

export async function releaseMidiPad(pad: MidiPad): Promise<void> {
  if (pad.behavior.playbackMode !== 'gate') return;
  await stopActiveMidiPad(pad.id, pad.behavior.stopMode);
}

// Expo audio is enough for this alpha and keeps the app managed. If real-device testing shows
// unacceptable latency, replace this pooled-player boundary with a native low-latency sampler.
export function releaseAudioPlayers(): void {
  activeMidiPads.clear();
  for (const bucket of buckets.values()) {
    for (const player of bucket.players) {
      player.remove();
    }
  }
  buckets.clear();
}
