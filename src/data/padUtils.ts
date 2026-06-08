import { defaultMidiPads } from './midiPads';
import type { MidiPad } from '../types';

export function buildResetMidiPads(): MidiPad[] {
  return defaultMidiPads.map((pad) => ({ ...pad, behavior: { ...pad.behavior } }));
}

export function mergeStoredMidiPads(storedPads: MidiPad[]): MidiPad[] {
  return defaultMidiPads.map((defaultPad) => {
    const storedPad = storedPads.find((pad) => pad.id === defaultPad.id);
    return storedPad
      ? {
          ...defaultPad,
          ...storedPad,
          behavior: {
            ...defaultPad.behavior,
            ...storedPad.behavior,
          },
        }
      : { ...defaultPad, behavior: { ...defaultPad.behavior } };
  });
}
