import type { MidiGridSize } from '../types';

export type MidiGridDimensions = {
  columns: number;
  rows: number;
  scrollVertical: boolean;
};

export function getMidiGridDimensions(
  gridSize: MidiGridSize,
  landscape: boolean,
  availableWidth: number,
): MidiGridDimensions {
  const padCount = gridSize === '3x4' ? 12 : 16;
  if (!landscape) {
    const columns = gridSize === '3x4' ? 3 : 4;
    return {
      columns,
      rows: Math.ceil(padCount / columns),
      scrollVertical: true,
    };
  }

  const preferredColumns = gridSize === '3x4' ? 6 : 8;
  const minPadWidth = 68;
  const columns = availableWidth / preferredColumns >= minPadWidth ? preferredColumns : 4;

  return {
    columns,
    rows: Math.ceil(padCount / columns),
    scrollVertical: columns !== preferredColumns,
  };
}
