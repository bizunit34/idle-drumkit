import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioPlayerOptions,
} from 'expo-audio';
import { bundledSounds } from '../data/sounds';
import { customSoundExists } from '../storage/customSoundFiles';
import type { AppSettings, SoundKey } from '../types';

const STANDARD_PLAYERS_PER_SOURCE = 3;
const LOW_LATENCY_PLAYERS_PER_SOURCE = 5;

type PlayerBucket = {
  players: AudioPlayer[];
  cursor: number;
};

const buckets = new Map<string, PlayerBucket>();
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

async function playSource(source: number | string, volume: number): Promise<void> {
  const bucket = getBucket(source, volume);
  const player = bucket.players[bucket.cursor] ?? bucket.players[0];
  if (!player) {
    throw new Error('No audio players are available.');
  }
  bucket.cursor = (bucket.cursor + 1) % bucket.players.length;
  player.volume = volume;
  await player.seekTo(0);
  player.play();
}

async function chokeSource(source: number | string): Promise<void> {
  const bucket = buckets.get(getSourceId(source));
  if (!bucket) return;

  await Promise.all(
    bucket.players.map(async (player) => {
      player.pause();
      await player.seekTo(0);
    }),
  );
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
    await chokeSource(bundledSounds.openHihat);
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

// Expo audio is enough for this alpha and keeps the app managed. If real-device testing shows
// unacceptable latency, replace this pooled-player boundary with a native low-latency sampler.
export function releaseAudioPlayers(): void {
  for (const bucket of buckets.values()) {
    for (const player of bucket.players) {
      player.remove();
    }
  }
  buckets.clear();
}
