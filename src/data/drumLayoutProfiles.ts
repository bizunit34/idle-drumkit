import { defaultDrumPieces } from './drumKit';
import type { DrumLayoutProfile, DrumLayoutProfileId, DrumPieceId, Point } from '../types';

export const drumLayoutProfileIds: DrumLayoutProfileId[] = ['default', 'custom1', 'custom2'];

const profileLabels: Record<DrumLayoutProfileId, string> = {
  default: 'Default',
  custom1: 'Custom 1',
  custom2: 'Custom 2',
};

const knownPieceIds = new Set<DrumPieceId>(defaultDrumPieces.map((piece) => piece.id));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPoint = (value: unknown): value is Point =>
  isRecord(value) && typeof value.x === 'number' && typeof value.y === 'number';

export const clampPieceScale = (value: number) => Math.min(1.45, Math.max(0.72, value));

export function buildDefaultDrumLayoutProfiles(): Record<DrumLayoutProfileId, DrumLayoutProfile> {
  return {
    default: {
      id: 'default',
      label: profileLabels.default,
      positions: {},
      scales: {},
    },
    custom1: {
      id: 'custom1',
      label: profileLabels.custom1,
      positions: {},
      scales: {},
    },
    custom2: {
      id: 'custom2',
      label: profileLabels.custom2,
      positions: {},
      scales: {},
    },
  };
}

function validateProfile(id: DrumLayoutProfileId, value: unknown): DrumLayoutProfile {
  const fallback = buildDefaultDrumLayoutProfiles()[id];
  if (!isRecord(value)) return fallback;

  const positions: DrumLayoutProfile['positions'] = {};
  if (isRecord(value.positions)) {
    for (const [pieceId, point] of Object.entries(value.positions)) {
      if (!knownPieceIds.has(pieceId as DrumPieceId) || !isPoint(point)) continue;
      positions[pieceId as DrumPieceId] = {
        x: Math.min(1, Math.max(0, point.x)),
        y: Math.min(1, Math.max(0, point.y)),
      };
    }
  }

  const scales: DrumLayoutProfile['scales'] = {};
  if (isRecord(value.scales)) {
    for (const [pieceId, scale] of Object.entries(value.scales)) {
      if (!knownPieceIds.has(pieceId as DrumPieceId) || typeof scale !== 'number') continue;
      scales[pieceId as DrumPieceId] = clampPieceScale(scale);
    }
  }

  return {
    id,
    label: profileLabels[id],
    positions,
    scales,
  };
}

export function validateDrumLayoutProfiles(
  value: unknown,
  migratedPositions: Record<string, Point>,
): Record<DrumLayoutProfileId, DrumLayoutProfile> {
  const defaults = buildDefaultDrumLayoutProfiles();
  const profiles = { ...defaults };

  if (isRecord(value)) {
    for (const id of drumLayoutProfileIds) {
      profiles[id] = validateProfile(id, value[id]);
    }
  }

  if (
    Object.keys(migratedPositions).length > 0 &&
    Object.keys(profiles.custom1.positions).length === 0
  ) {
    profiles.custom1 = {
      ...profiles.custom1,
      positions: migratedPositions as DrumLayoutProfile['positions'],
    };
  }

  return profiles;
}

export function validateDrumLayoutProfileId(value: unknown): DrumLayoutProfileId {
  return value === 'default' || value === 'custom1' || value === 'custom2' ? value : 'default';
}

export function getResetProfile(id: DrumLayoutProfileId): DrumLayoutProfile {
  return buildDefaultDrumLayoutProfiles()[id];
}
