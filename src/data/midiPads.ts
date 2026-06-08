import type { MidiPad } from '../types';
import { getDefaultMidiPadBehavior } from './midiPadBehavior';

const createPad = (
  id: string,
  label: string,
  sound: MidiPad['sound'],
  accentColor: string,
): MidiPad => ({
  id,
  label,
  sound,
  accentColor,
  behavior: getDefaultMidiPadBehavior(sound),
});

export const defaultMidiPads: MidiPad[] = [
  createPad('pad-01', 'Kick', 'kick', '#22D3EE'),
  createPad('pad-02', 'Snare', 'snare', '#FB923C'),
  createPad('pad-03', 'Hat', 'closedHihat', '#FACC15'),
  createPad('pad-04', 'Open Hat', 'openHihat', '#8B5CF6'),
  createPad('pad-05', 'Clap', 'clap', '#5EEAD4'),
  createPad('pad-06', 'Crash', 'crash', '#FACC15'),
  createPad('pad-07', 'Ride', 'ride', '#22D3EE'),
  createPad('pad-08', 'High Tom', 'highTom', '#8B5CF6'),
  createPad('pad-09', 'Mid Tom', 'midTom', '#60A5FA'),
  createPad('pad-10', 'Floor Tom', 'floorTom', '#34D399'),
  createPad('pad-11', 'Rim', 'rim', '#5EEAD4'),
  createPad('pad-12', 'Cowbell', 'cowbell', '#FACC15'),
  createPad('pad-13', 'Shaker', 'shaker', '#22D3EE'),
  createPad('pad-14', 'Perc', 'perc', '#8B5CF6'),
  createPad('pad-15', 'Click', 'metronome', '#38BDF8'),
  createPad('pad-16', 'Sub', 'subKick', '#5EEAD4'),
];
