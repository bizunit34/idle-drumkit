import {
  buildDefaultDrumLayoutProfiles,
  validateDrumLayoutProfileId,
  validateDrumLayoutProfiles,
} from '../data/drumLayoutProfiles';
import {
  getDefaultSelectedDrumArticulations,
  isDrumPieceId,
  validateSelectedDrumArticulations,
} from '../data/drumArticulations';
import { defaultDrumPieces } from '../data/drumKit';
import { getDefaultMidiPadBehavior } from '../data/midiPadBehavior';
import { buildResetMidiPads, mergeStoredMidiPads } from '../data/padUtils';
import type {
  AppSettings,
  DrumLayoutProfile,
  DrumLayoutProfileId,
  HiHatArticulation,
  MidiGridSize,
  MidiPad,
  MidiDisplaySettings,
  Point,
  SelectedDrumArticulations,
  SoundKey,
  MidiPadBehaviorSettings,
  MidiPadChokeGroup,
  MidiPadPlaybackMode,
  MidiPadRetriggerMode,
  MidiPadStopMode,
} from '../types';

export const defaultSettings: AppSettings = {
  masterVolume: 0.85,
  showHitBoxes: false,
  lowLatencyMode: true,
  selectedDrumArticulations: getDefaultSelectedDrumArticulations(),
  midiDisplay: {
    showPadLabels: true,
    showPadSoundNames: false,
    showPadNumbers: false,
  },
};

export const defaultDrumLayoutProfiles = buildDefaultDrumLayoutProfiles();

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

const playbackModes = new Set<MidiPadPlaybackMode>(['oneShot', 'gate', 'toggle']);
const retriggerModes = new Set<MidiPadRetriggerMode>(['overlap', 'restart', 'ignoreWhilePlaying']);
const chokeGroups = new Set<MidiPadChokeGroup>([
  'none',
  'hihat',
  'cymbal',
  'group1',
  'group2',
  'group3',
  'group4',
]);
const stopModes = new Set<MidiPadStopMode>(['immediate', 'shortFade', 'mediumFade']);

export function validateSettings(value: unknown): AppSettings {
  if (!isRecord(value)) return defaultSettings;
  const hasStoredSelections = isRecord(value.selectedDrumArticulations);
  const selectedDrumArticulations: SelectedDrumArticulations = hasStoredSelections
    ? validateSelectedDrumArticulations(value.selectedDrumArticulations)
    : getDefaultSelectedDrumArticulations();

  if (!hasStoredSelections && isHiHatArticulation(value.hiHatArticulation)) {
    selectedDrumArticulations.hihat =
      value.hiHatArticulation === 'open' ? 'hihatOpen' : 'hihatClosed';
  }

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
    selectedDrumArticulations,
    midiDisplay: validateMidiDisplaySettings(value.midiDisplay),
  };
}

export function validateMidiDisplaySettings(value: unknown): MidiDisplaySettings {
  if (!isRecord(value)) return defaultSettings.midiDisplay;

  return {
    showPadLabels:
      typeof value.showPadLabels === 'boolean'
        ? value.showPadLabels
        : defaultSettings.midiDisplay.showPadLabels,
    showPadSoundNames:
      typeof value.showPadSoundNames === 'boolean'
        ? value.showPadSoundNames
        : defaultSettings.midiDisplay.showPadSoundNames,
    showPadNumbers:
      typeof value.showPadNumbers === 'boolean'
        ? value.showPadNumbers
        : defaultSettings.midiDisplay.showPadNumbers,
  };
}

export function validateMidiGridSize(value: unknown): MidiGridSize {
  return value === '3x4' || value === '4x4' ? value : '4x4';
}

export function validateMidiPadBehaviorSettings(
  value: unknown,
  sound: SoundKey,
): MidiPadBehaviorSettings {
  const fallback = getDefaultMidiPadBehavior(sound);
  if (!isRecord(value)) return fallback;

  return {
    playbackMode:
      typeof value.playbackMode === 'string' &&
      playbackModes.has(value.playbackMode as MidiPadPlaybackMode)
        ? (value.playbackMode as MidiPadPlaybackMode)
        : fallback.playbackMode,
    retriggerMode:
      typeof value.retriggerMode === 'string' &&
      retriggerModes.has(value.retriggerMode as MidiPadRetriggerMode)
        ? (value.retriggerMode as MidiPadRetriggerMode)
        : fallback.retriggerMode,
    chokeGroup:
      typeof value.chokeGroup === 'string' && chokeGroups.has(value.chokeGroup as MidiPadChokeGroup)
        ? (value.chokeGroup as MidiPadChokeGroup)
        : fallback.chokeGroup,
    stopMode:
      typeof value.stopMode === 'string' && stopModes.has(value.stopMode as MidiPadStopMode)
        ? (value.stopMode as MidiPadStopMode)
        : fallback.stopMode,
    padVolume:
      typeof value.padVolume === 'number'
        ? Math.round(clampNumber(value.padVolume, 0, 100))
        : fallback.padVolume,
  };
}

export function validateDrumPositions(value: unknown): Record<string, Point> {
  if (!isRecord(value)) return {};

  const knownIds = new Set(defaultDrumPieces.map((piece) => piece.id));
  const positions: Record<string, Point> = {};
  for (const [id, point] of Object.entries(value)) {
    if (!isDrumPieceId(id) || !knownIds.has(id) || !isPoint(point)) continue;
    positions[id] = {
      x: clampNumber(point.x, 0, 1),
      y: clampNumber(point.y, 0, 1),
    };
  }
  return positions;
}

export function validateActiveDrumProfileId(value: unknown): DrumLayoutProfileId {
  return validateDrumLayoutProfileId(value);
}

export function validateStoredDrumLayoutProfiles(
  value: unknown,
  migratedPositions: Record<string, Point>,
): Record<DrumLayoutProfileId, DrumLayoutProfile> {
  return validateDrumLayoutProfiles(value, migratedPositions);
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
    behavior: validateMidiPadBehaviorSettings(value.behavior, value.sound),
    customSoundUri: typeof value.customSoundUri === 'string' ? value.customSoundUri : undefined,
    customSoundName: typeof value.customSoundName === 'string' ? value.customSoundName : undefined,
  };
}

export function validateMidiPads(value: unknown): MidiPad[] {
  if (!Array.isArray(value)) return buildResetMidiPads();
  const storedPads = value
    .map((pad) => validateMidiPad(pad))
    .filter((pad): pad is MidiPad => pad !== null);

  return mergeStoredMidiPads(storedPads);
}
