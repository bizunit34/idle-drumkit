import type { DrumPieceId } from '../types';

type SizeScale = {
  width: number;
  height: number;
};

type ResponsiveDrumScale = {
  hitBox: SizeScale;
  visual: SizeScale;
};

const defaultScale: ResponsiveDrumScale = {
  hitBox: { width: 1, height: 1 },
  visual: { width: 1, height: 1 },
};

const landscapeScales: Partial<Record<DrumPieceId, ResponsiveDrumScale>> = {
  kick: {
    hitBox: { width: 1.1, height: 1.28 },
    visual: { width: 1.12, height: 1.25 },
  },
  snare: {
    hitBox: { width: 1.1, height: 1.25 },
    visual: { width: 1.12, height: 1.22 },
  },
  hihat: {
    hitBox: { width: 1.1, height: 1.28 },
    visual: { width: 1.16, height: 1.26 },
  },
  floorTom: {
    hitBox: { width: 1.08, height: 1.24 },
    visual: { width: 1.1, height: 1.2 },
  },
  highTom: {
    hitBox: { width: 1.06, height: 1.2 },
    visual: { width: 1.08, height: 1.18 },
  },
  midTom: {
    hitBox: { width: 1.06, height: 1.2 },
    visual: { width: 1.08, height: 1.18 },
  },
  crash: {
    hitBox: { width: 1.02, height: 1.08 },
    visual: { width: 1.03, height: 1.08 },
  },
  ride: {
    hitBox: { width: 1.02, height: 1.08 },
    visual: { width: 1.03, height: 1.08 },
  },
};

export function getResponsiveDrumScale(
  pieceId: DrumPieceId,
  landscape: boolean,
): ResponsiveDrumScale {
  if (!landscape) return defaultScale;
  return landscapeScales[pieceId] ?? defaultScale;
}
