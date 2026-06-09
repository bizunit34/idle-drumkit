import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildResetMidiPads } from '../data/padUtils';
import { clearAllCustomSounds } from './customSoundFiles';
import {
  defaultSettings,
  validateActiveDrumProfileId,
  validateDrumPositions,
  validateStoredDrumLayoutProfiles,
  validateMidiGridSize,
  validateMidiPads,
  validateSettings,
} from './storageValidation';
import type {
  AppSettings,
  DrumLayoutProfile,
  DrumLayoutProfileId,
  MidiGridSize,
  MidiPad,
  PersistedAppState,
  Point,
} from '../types';

const STORAGE_SCHEMA_VERSION = 5;
const SCHEMA_VERSION_KEY = 'drumkit:schemaVersion';
const SETTINGS_KEY = 'drumkit:settings';
const DRUM_POSITIONS_KEY = 'drumkit:drumPositions';
const ACTIVE_DRUM_PROFILE_KEY = 'drumkit:activeDrumProfile';
const DRUM_LAYOUT_PROFILES_KEY = 'drumkit:drumLayoutProfiles';
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
  const [
    schemaVersion,
    settings,
    drumPositions,
    activeDrumProfileId,
    drumLayoutProfiles,
    midiGridSize,
    midiPads,
  ] = await Promise.all([
    AsyncStorage.getItem(SCHEMA_VERSION_KEY),
    AsyncStorage.getItem(SETTINGS_KEY),
    AsyncStorage.getItem(DRUM_POSITIONS_KEY),
    AsyncStorage.getItem(ACTIVE_DRUM_PROFILE_KEY),
    AsyncStorage.getItem(DRUM_LAYOUT_PROFILES_KEY),
    AsyncStorage.getItem(MIDI_GRID_KEY),
    AsyncStorage.getItem(MIDI_PADS_KEY),
  ]);

  if (schemaVersion !== String(STORAGE_SCHEMA_VERSION)) {
    await AsyncStorage.setItem(SCHEMA_VERSION_KEY, String(STORAGE_SCHEMA_VERSION));
  }

  const hasStoredProfiles = drumLayoutProfiles !== null;
  const migratedPositions = hasStoredProfiles
    ? {}
    : validateDrumPositions(parseJson<unknown>(drumPositions, {}));
  const profiles = validateStoredDrumLayoutProfiles(
    parseJson<unknown>(drumLayoutProfiles, {}),
    migratedPositions,
  );
  const hasMigratedLayout = Object.keys(migratedPositions).length > 0;

  return {
    settings: validateSettings(parseJson<unknown>(settings, defaultSettings)),
    drumPositions: profiles[hasMigratedLayout ? 'custom1' : 'default'].layouts.portrait.pieces,
    activeDrumProfileId: hasMigratedLayout
      ? 'custom1'
      : validateActiveDrumProfileId(parseJson<unknown>(activeDrumProfileId, 'default')),
    drumLayoutProfiles: profiles,
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

export async function saveActiveDrumProfile(profileId: DrumLayoutProfileId): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_DRUM_PROFILE_KEY, JSON.stringify(profileId));
}

export async function saveDrumLayoutProfiles(
  profiles: Record<DrumLayoutProfileId, DrumLayoutProfile>,
): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(DRUM_LAYOUT_PROFILES_KEY, JSON.stringify(profiles)),
    AsyncStorage.removeItem(DRUM_POSITIONS_KEY),
  ]);
}

export async function saveMidiGridSize(gridSize: MidiGridSize): Promise<void> {
  await AsyncStorage.setItem(MIDI_GRID_KEY, JSON.stringify(gridSize));
}

export async function saveMidiPads(pads: MidiPad[]): Promise<void> {
  await AsyncStorage.setItem(MIDI_PADS_KEY, JSON.stringify(pads));
}

export async function resetAllAppData(): Promise<PersistedAppState> {
  await Promise.all(
    [
      SCHEMA_VERSION_KEY,
      SETTINGS_KEY,
      DRUM_POSITIONS_KEY,
      ACTIVE_DRUM_PROFILE_KEY,
      DRUM_LAYOUT_PROFILES_KEY,
      MIDI_GRID_KEY,
      MIDI_PADS_KEY,
    ].map((key) => AsyncStorage.removeItem(key)),
  );
  clearAllCustomSounds();
  return loadAppState();
}
