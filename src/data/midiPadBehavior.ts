import type { MidiPadBehaviorSettings, SoundKey } from '../types';

export const defaultMidiPadBehavior: MidiPadBehaviorSettings = {
  playbackMode: 'oneShot',
  retriggerMode: 'overlap',
  chokeGroup: 'none',
  stopMode: 'immediate',
  padVolume: 100,
};

export function getDefaultMidiPadBehavior(sound: SoundKey): MidiPadBehaviorSettings {
  return {
    ...defaultMidiPadBehavior,
    chokeGroup: sound === 'closedHihat' || sound === 'openHihat' ? 'hihat' : 'none',
  };
}

export function getMidiPadPressAction(
  behavior: MidiPadBehaviorSettings,
  active: boolean,
): 'start' | 'stop' | 'ignore' {
  if (behavior.playbackMode === 'toggle' && active) return 'stop';
  if (active && behavior.retriggerMode === 'ignoreWhilePlaying') return 'ignore';
  return 'start';
}

export function shouldReleaseStopPad(behavior: MidiPadBehaviorSettings): boolean {
  return behavior.playbackMode === 'gate';
}
