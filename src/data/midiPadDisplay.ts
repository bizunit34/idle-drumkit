import type { MidiDisplaySettings, MidiPad } from '../types';

const formatSound = (sound: string) =>
  sound.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());

export function formatPadPlaybackMode(mode: MidiPad['behavior']['playbackMode']): string {
  if (mode === 'gate') return 'Hold to play';
  if (mode === 'toggle') return 'Tap start stop';
  return 'Play once';
}

export function getMidiPadDisplayText(
  pad: MidiPad,
  index: number,
  settings: MidiDisplaySettings,
  editMode = false,
): {
  label: string | undefined;
  soundName: string | undefined;
  number: string | undefined;
  accessibilityLabel: string;
  accessibilityHint: string;
} {
  const number = `#${index + 1}`;
  const soundName = formatSound(pad.sound);
  const playbackMode = formatPadPlaybackMode(pad.behavior.playbackMode);
  const parts = [pad.label, soundName, playbackMode, number];

  return {
    label: settings.showPadLabels ? pad.label : undefined,
    soundName: settings.showPadSoundNames ? soundName : undefined,
    number: settings.showPadNumbers ? number : undefined,
    accessibilityLabel: `${parts.join(', ')} pad`,
    accessibilityHint: editMode
      ? 'Tap to edit this pad.'
      : 'Press to play this pad. Hold behavior depends on its playback mode.',
  };
}

export { formatSound };
