import type { DrumPiece, Point } from '../types';

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function clampPoint(point: Point): Point {
  return {
    x: clamp(point.x, 0, 1),
    y: clamp(point.y, 0, 1),
  };
}

export function clampDrumPiecePosition(
  point: Point,
  piece: Pick<DrumPiece, 'size'>,
  boardWidth: number,
  boardHeight: number,
): Point {
  const minX = boardWidth > 0 ? piece.size.width / 2 : 0.08;
  const minY = boardHeight > 0 ? piece.size.height / 2 : 0.08;

  return {
    x: clamp(point.x, minX, 1 - minX),
    y: clamp(point.y, minY, 1 - minY),
  };
}
