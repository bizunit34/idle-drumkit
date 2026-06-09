import { defaultDrumPieces } from './drumKit';
import type {
  DrumLayoutOrientation,
  DrumLayoutProfile,
  DrumLayoutProfileId,
  DrumPieceId,
  DrumPieceLayout,
  Point,
} from '../types';

export const drumLayoutProfileIds: DrumLayoutProfileId[] = ['default', 'custom1', 'custom2'];
export const drumLayoutOrientations: DrumLayoutOrientation[] = ['portrait', 'landscape'];

const profileLabels: Record<DrumLayoutProfileId, string> = {
  default: 'Default',
  custom1: 'Custom 1',
  custom2: 'Custom 2',
};

const knownPieceIds = new Set<DrumPieceId>(defaultDrumPieces.map((piece) => piece.id));
const defaultPiecePositions = Object.fromEntries(
  defaultDrumPieces.map((piece) => [piece.id, piece.position]),
) as Record<DrumPieceId, Point>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPoint = (value: unknown): value is Point =>
  isRecord(value) && typeof value.x === 'number' && typeof value.y === 'number';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const clampPieceScale = (value: number) => clamp(value, 0.72, 1.65);
export const clampHitBoxScale = (value: number) => clamp(value, 0.6, 1.9);

export function getOrientationKey(width: number, height: number): DrumLayoutOrientation {
  return width > height ? 'landscape' : 'portrait';
}

export function createDefaultPieceLayout(pieceId: DrumPieceId): DrumPieceLayout {
  const position = defaultPiecePositions[pieceId];
  return {
    x: position.x,
    y: position.y,
    visualScale: 1,
    hitBoxScaleX: 1,
    hitBoxScaleY: 1,
  };
}

export function resizePieceLayoutFromCorner(
  layout: DrumPieceLayout,
  options: {
    target: 'item' | 'hitBox' | 'both';
    horizontalDelta: number;
    verticalDelta: number;
  },
): DrumPieceLayout {
  const next = { ...layout };

  if (options.target === 'item' || options.target === 'both') {
    next.visualScale = clampPieceScale(
      layout.visualScale + (options.horizontalDelta + options.verticalDelta) * 0.8,
    );
  }

  if (options.target === 'hitBox' || options.target === 'both') {
    next.hitBoxScaleX = clampHitBoxScale(layout.hitBoxScaleX + options.horizontalDelta * 1.5);
    next.hitBoxScaleY = clampHitBoxScale(layout.hitBoxScaleY + options.verticalDelta * 1.5);
  }

  return next;
}

export function buildDefaultDrumLayoutProfiles(): Record<DrumLayoutProfileId, DrumLayoutProfile> {
  return {
    default: {
      id: 'default',
      label: profileLabels.default,
      layouts: {
        portrait: { pieces: {} },
        landscape: { pieces: {} },
      },
    },
    custom1: {
      id: 'custom1',
      label: profileLabels.custom1,
      layouts: {
        portrait: { pieces: {} },
        landscape: { pieces: {} },
      },
    },
    custom2: {
      id: 'custom2',
      label: profileLabels.custom2,
      layouts: {
        portrait: { pieces: {} },
        landscape: { pieces: {} },
      },
    },
  };
}

export function resolvePieceLayout(
  profile: DrumLayoutProfile,
  orientation: DrumLayoutOrientation,
  pieceId: DrumPieceId,
): DrumPieceLayout {
  return profile.layouts[orientation].pieces[pieceId] ?? createDefaultPieceLayout(pieceId);
}

export function resetPieceLayout(
  profile: DrumLayoutProfile,
  orientation: DrumLayoutOrientation,
  pieceId: DrumPieceId,
): DrumLayoutProfile {
  const nextPieces = { ...profile.layouts[orientation].pieces };
  delete nextPieces[pieceId];
  return {
    ...profile,
    layouts: {
      ...profile.layouts,
      [orientation]: { pieces: nextPieces },
    },
  };
}

export function resetOrientationLayout(
  profile: DrumLayoutProfile,
  orientation: DrumLayoutOrientation,
): DrumLayoutProfile {
  return {
    ...profile,
    layouts: {
      ...profile.layouts,
      [orientation]: { pieces: {} },
    },
  };
}

function validatePieceLayout(pieceId: DrumPieceId, value: unknown): DrumPieceLayout | null {
  if (!isRecord(value)) return null;

  const fallback = createDefaultPieceLayout(pieceId);
  return {
    x: typeof value.x === 'number' ? clamp(value.x, 0, 1) : fallback.x,
    y: typeof value.y === 'number' ? clamp(value.y, 0, 1) : fallback.y,
    visualScale: typeof value.visualScale === 'number' ? clampPieceScale(value.visualScale) : 1,
    hitBoxScaleX: typeof value.hitBoxScaleX === 'number' ? clampHitBoxScale(value.hitBoxScaleX) : 1,
    hitBoxScaleY: typeof value.hitBoxScaleY === 'number' ? clampHitBoxScale(value.hitBoxScaleY) : 1,
  };
}

function validateLayoutPieces(value: unknown): Partial<Record<DrumPieceId, DrumPieceLayout>> {
  if (!isRecord(value)) return {};

  const pieces: Partial<Record<DrumPieceId, DrumPieceLayout>> = {};
  for (const [pieceId, layout] of Object.entries(value)) {
    if (!knownPieceIds.has(pieceId as DrumPieceId)) continue;
    const pieceLayout = validatePieceLayout(pieceId as DrumPieceId, layout);
    if (pieceLayout) pieces[pieceId as DrumPieceId] = pieceLayout;
  }
  return pieces;
}

function buildLegacyLayout(value: unknown): Partial<Record<DrumPieceId, DrumPieceLayout>> {
  if (!isRecord(value)) return {};

  const pieces: Partial<Record<DrumPieceId, DrumPieceLayout>> = {};
  const positions = isRecord(value.positions) ? value.positions : {};
  const scales = isRecord(value.scales) ? value.scales : {};
  for (const piece of defaultDrumPieces) {
    const position = positions[piece.id];
    const scale = scales[piece.id];
    if (!isPoint(position) && typeof scale !== 'number') continue;

    pieces[piece.id] = {
      ...createDefaultPieceLayout(piece.id),
      ...(isPoint(position)
        ? {
            x: clamp(position.x, 0, 1),
            y: clamp(position.y, 0, 1),
          }
        : {}),
      ...(typeof scale === 'number'
        ? {
            visualScale: clampPieceScale(scale),
            hitBoxScaleX: clampHitBoxScale(scale),
            hitBoxScaleY: clampHitBoxScale(scale),
          }
        : {}),
    };
  }
  return pieces;
}

function validateProfile(id: DrumLayoutProfileId, value: unknown): DrumLayoutProfile {
  const fallback = buildDefaultDrumLayoutProfiles()[id];
  if (!isRecord(value)) return fallback;

  const legacyPieces = buildLegacyLayout(value);
  const layouts = isRecord(value.layouts) ? value.layouts : null;

  return {
    id,
    label: profileLabels[id],
    layouts: {
      portrait: {
        pieces:
          layouts && isRecord(layouts.portrait)
            ? validateLayoutPieces(layouts.portrait.pieces)
            : legacyPieces,
      },
      landscape: {
        pieces:
          layouts && isRecord(layouts.landscape)
            ? validateLayoutPieces(layouts.landscape.pieces)
            : legacyPieces,
      },
    },
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
    Object.keys(profiles.custom1.layouts.portrait.pieces).length === 0
  ) {
    const migratedPieces: Partial<Record<DrumPieceId, DrumPieceLayout>> = {};
    for (const [pieceId, point] of Object.entries(migratedPositions)) {
      if (!knownPieceIds.has(pieceId as DrumPieceId)) continue;
      migratedPieces[pieceId as DrumPieceId] = {
        ...createDefaultPieceLayout(pieceId as DrumPieceId),
        x: clamp(point.x, 0, 1),
        y: clamp(point.y, 0, 1),
      };
    }
    profiles.custom1 = {
      ...profiles.custom1,
      layouts: {
        portrait: { pieces: migratedPieces },
        landscape: { pieces: migratedPieces },
      },
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
