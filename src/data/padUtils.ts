import { defaultMidiPads } from './midiPads';
import type { MidiPad } from '../types';

export function buildResetMidiPads(): MidiPad[] {
  return defaultMidiPads.map((pad) => ({ ...pad }));
}

export function mergeStoredMidiPads(storedPads: MidiPad[]): MidiPad[] {
  return defaultMidiPads.map((defaultPad) => {
    const storedPad = storedPads.find((pad) => pad.id === defaultPad.id);
    return storedPad ? { ...defaultPad, ...storedPad } : { ...defaultPad };
  });
}
