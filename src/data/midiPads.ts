import type { MidiPad } from '../types';

export const defaultMidiPads: MidiPad[] = [
  { id: 'pad-01', label: 'Kick', sound: 'kick', accentColor: '#22D3EE' },
  { id: 'pad-02', label: 'Snare', sound: 'snare', accentColor: '#FB923C' },
  { id: 'pad-03', label: 'Hat', sound: 'closedHihat', accentColor: '#FACC15' },
  { id: 'pad-04', label: 'Open Hat', sound: 'openHihat', accentColor: '#8B5CF6' },
  { id: 'pad-05', label: 'Clap', sound: 'clap', accentColor: '#5EEAD4' },
  { id: 'pad-06', label: 'Crash', sound: 'crash', accentColor: '#FACC15' },
  { id: 'pad-07', label: 'Ride', sound: 'ride', accentColor: '#22D3EE' },
  { id: 'pad-08', label: 'High Tom', sound: 'highTom', accentColor: '#8B5CF6' },
  { id: 'pad-09', label: 'Mid Tom', sound: 'midTom', accentColor: '#60A5FA' },
  { id: 'pad-10', label: 'Floor Tom', sound: 'floorTom', accentColor: '#34D399' },
  { id: 'pad-11', label: 'Rim', sound: 'rim', accentColor: '#5EEAD4' },
  { id: 'pad-12', label: 'Cowbell', sound: 'cowbell', accentColor: '#FACC15' },
  { id: 'pad-13', label: 'Shaker', sound: 'shaker', accentColor: '#22D3EE' },
  { id: 'pad-14', label: 'Perc', sound: 'perc', accentColor: '#8B5CF6' },
  { id: 'pad-15', label: 'Click', sound: 'metronome', accentColor: '#38BDF8' },
  { id: 'pad-16', label: 'Sub', sound: 'subKick', accentColor: '#5EEAD4' },
];
