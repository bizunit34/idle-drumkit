import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultDrumPieces } from '../data/drumKit';
import { buildResetMidiPads, mergeStoredMidiPads } from '../data/padUtils';
import { clearAllCustomSounds } from './customSoundFiles';
import type {
  AppSettings,
  HiHatArticulation,
  MidiGridSize,
  MidiPad,
  PersistedAppState,
  Point,
  SoundKey,
} from '../types';

const STORAGE_SCHEMA_VERSION = 1;
const SCHEMA_VERSION_KEY = 'drumkit:schemaVersion';
const SETTINGS_KEY = 'drumkit:settings';
const DRUM_POSITIONS_KEY = 'drumkit:drumPositions';
const MIDI_GRID_KEY = 'drumkit:midiGridSize';
const MIDI_PADS_KEY = 'drumkit:midiPads';

export const defaultSettings: AppSettings = {
  masterVolume: 0.85,
  showHitBoxes: true,
  lowLatencyMode: true,
  hiHatArticulation: 'closed',
};

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPoint = (value: unknown): value is Point => {
  if (!isRecord(value)) return false;
  return typeof value.x === 'number' && typeof value.y === 'number';
};

const soundKeys = new Set<SoundKey>([
  'kick',
  'snare',
  'closedHihat',
  'openHihat',
  'clap',
  'crash',
  'ride',
  'highTom',
  'midTom',
  'floorTom',
  'rim',
  'cowbell',
  'shaker',
  'perc',
  'metronome',
  'subKick',
]);

const isSoundKey = (value: unknown): value is SoundKey =>
  typeof value === 'string' && soundKeys.has(value as SoundKey);

const isHiHatArticulation = (value: unknown): value is HiHatArticulation =>
  value === 'closed' || value === 'open';

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function validateSettings(value: unknown): AppSettings {
  if (!isRecord(value)) return defaultSettings;

  return {
    masterVolume:
      typeof value.masterVolume === 'number'
        ? clampNumber(value.masterVolume, 0, 1)
        : defaultSettings.masterVolume,
    showHitBoxes:
      typeof value.showHitBoxes === 'boolean' ? value.showHitBoxes : defaultSettings.showHitBoxes,
    lowLatencyMode:
      typeof value.lowLatencyMode === 'boolean'
        ? value.lowLatencyMode
        : defaultSettings.lowLatencyMode,
    hiHatArticulation: isHiHatArticulation(value.hiHatArticulation)
      ? value.hiHatArticulation
      : defaultSettings.hiHatArticulation,
  };
}

function validateMidiGridSize(value: unknown): MidiGridSize {
  return value === '3x4' || value === '4x4' ? value : '4x4';
}

function validateDrumPositions(value: unknown): Record<string, Point> {
  if (!isRecord(value)) return {};

  const knownIds = new Set(defaultDrumPieces.map((piece) => piece.id));
  const positions: Record<string, Point> = {};
  for (const [id, point] of Object.entries(value)) {
    if (!knownIds.has(id) || !isPoint(point)) continue;
    positions[id] = {
      x: clampNumber(point.x, 0, 1),
      y: clampNumber(point.y, 0, 1),
    };
  }
  return positions;
}

function validateMidiPad(value: unknown): MidiPad | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== 'string' ||
    typeof value.label !== 'string' ||
    !isSoundKey(value.sound) ||
    typeof value.accentColor !== 'string'
  ) {
    return null;
  }

  return {
    id: value.id,
    label: value.label,
    sound: value.sound,
    accentColor: value.accentColor,
    customSoundUri: typeof value.customSoundUri === 'string' ? value.customSoundUri : undefined,
    customSoundName: typeof value.customSoundName === 'string' ? value.customSoundName : undefined,
  };
}

function validateMidiPads(value: unknown): MidiPad[] {
  if (!Array.isArray(value)) return buildResetMidiPads();
  const storedPads = value
    .map((pad) => validateMidiPad(pad))
    .filter((pad): pad is MidiPad => pad !== null);

  return mergeStoredMidiPads(storedPads);
}

export async function loadAppState(): Promise<PersistedAppState> {
  const [schemaVersion, settings, drumPositions, midiGridSize, midiPads] = await Promise.all([
    AsyncStorage.getItem(SCHEMA_VERSION_KEY),
    AsyncStorage.getItem(SETTINGS_KEY),
    AsyncStorage.getItem(DRUM_POSITIONS_KEY),
    AsyncStorage.getItem(MIDI_GRID_KEY),
    AsyncStorage.getItem(MIDI_PADS_KEY),
  ]);

  if (schemaVersion !== String(STORAGE_SCHEMA_VERSION)) {
    await AsyncStorage.setItem(SCHEMA_VERSION_KEY, String(STORAGE_SCHEMA_VERSION));
  }

  return {
    settings: validateSettings(parseJson<unknown>(settings, defaultSettings)),
    drumPositions: validateDrumPositions(parseJson<unknown>(drumPositions, {})),
    midiGridSize: validateMidiGridSize(parseJson<unknown>(midiGridSize, '4x4')),
    midiPads: validateMidiPads(parseJson<unknown>(midiPads, buildResetMidiPads())),
  };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function saveDrumPositions(positions: Record<string, Point>): Promise<void> {
  await AsyncStorage.setItem(DRUM_POSITIONS_KEY, JSON.stringify(positions));
}

export async function saveMidiGridSize(gridSize: MidiGridSize): Promise<void> {
  await AsyncStorage.setItem(MIDI_GRID_KEY, JSON.stringify(gridSize));
}

export async function saveMidiPads(pads: MidiPad[]): Promise<void> {
  await AsyncStorage.setItem(MIDI_PADS_KEY, JSON.stringify(pads));
}

export async function resetAllAppData(): Promise<PersistedAppState> {
  await Promise.all(
    [SCHEMA_VERSION_KEY, SETTINGS_KEY, DRUM_POSITIONS_KEY, MIDI_GRID_KEY, MIDI_PADS_KEY].map(
      (key) => AsyncStorage.removeItem(key),
    ),
  );
  clearAllCustomSounds();
  return loadAppState();
}
