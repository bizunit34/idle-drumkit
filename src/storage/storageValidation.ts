import {
  getDefaultSelectedDrumArticulations,
  isDrumPieceId,
  validateSelectedDrumArticulations,
} from '../data/drumArticulations';
import { defaultDrumPieces } from '../data/drumKit';
import { buildResetMidiPads, mergeStoredMidiPads } from '../data/padUtils';
import type {
  AppSettings,
  HiHatArticulation,
  MidiGridSize,
  MidiPad,
  Point,
  SelectedDrumArticulations,
  SoundKey,
} from '../types';

export const defaultSettings: AppSettings = {
  masterVolume: 0.85,
  showHitBoxes: false,
  lowLatencyMode: true,
  selectedDrumArticulations: getDefaultSelectedDrumArticulations(),
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
  };
}

export function validateMidiGridSize(value: unknown): MidiGridSize {
  return value === '3x4' || value === '4x4' ? value : '4x4';
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

export function validateMidiPads(value: unknown): MidiPad[] {
  if (!Array.isArray(value)) return buildResetMidiPads();
  const storedPads = value
    .map((pad) => validateMidiPad(pad))
    .filter((pad): pad is MidiPad => pad !== null);

  return mergeStoredMidiPads(storedPads);
}
