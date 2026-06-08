import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildResetMidiPads } from '../data/padUtils';
import { clearAllCustomSounds } from './customSoundFiles';
import {
  defaultSettings,
  validateDrumPositions,
  validateMidiGridSize,
  validateMidiPads,
  validateSettings,
} from './storageValidation';
import type { AppSettings, MidiGridSize, MidiPad, PersistedAppState, Point } from '../types';

const STORAGE_SCHEMA_VERSION = 2;
const SCHEMA_VERSION_KEY = 'drumkit:schemaVersion';
const SETTINGS_KEY = 'drumkit:settings';
const DRUM_POSITIONS_KEY = 'drumkit:drumPositions';
const MIDI_GRID_KEY = 'drumkit:midiGridSize';
const MIDI_PADS_KEY = 'drumkit:midiPads';

export { defaultSettings } from './storageValidation';

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

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
