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
    hitBox: { width: 1.08, height: 1.2 },
    visual: { width: 1.1, height: 1.18 },
  },
  snare: {
    hitBox: { width: 1.08, height: 1.18 },
    visual: { width: 1.1, height: 1.16 },
  },
  hihat: {
    hitBox: { width: 1.08, height: 1.2 },
    visual: { width: 1.14, height: 1.2 },
  },
  floorTom: {
    hitBox: { width: 1.06, height: 1.16 },
    visual: { width: 1.08, height: 1.14 },
  },
  highTom: {
    hitBox: { width: 1.03, height: 1.12 },
    visual: { width: 1.05, height: 1.1 },
  },
  midTom: {
    hitBox: { width: 1.03, height: 1.12 },
    visual: { width: 1.05, height: 1.1 },
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
