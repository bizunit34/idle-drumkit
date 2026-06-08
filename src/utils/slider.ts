export const clampSliderValue = (value: number) => Math.min(1, Math.max(0, value));

export function positionToSliderValue(x: number, width: number): number {
  if (width <= 0) return 0;
  return clampSliderValue(x / width);
}
