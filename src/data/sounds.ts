import type { SoundKey } from '../types';

export const bundledSounds: Record<SoundKey, number> = {
  kick: require('../../assets/sounds/kick.wav'),
  snare: require('../../assets/sounds/snare.wav'),
  closedHihat: require('../../assets/sounds/closed-hihat.wav'),
  openHihat: require('../../assets/sounds/open-hihat.wav'),
  clap: require('../../assets/sounds/clap.wav'),
  crash: require('../../assets/sounds/crash.wav'),
  ride: require('../../assets/sounds/ride.wav'),
  highTom: require('../../assets/sounds/high-tom.wav'),
  midTom: require('../../assets/sounds/mid-tom.wav'),
  floorTom: require('../../assets/sounds/floor-tom.wav'),
  rim: require('../../assets/sounds/rim.wav'),
  cowbell: require('../../assets/sounds/cowbell.wav'),
  shaker: require('../../assets/sounds/shaker.wav'),
  perc: require('../../assets/sounds/perc.wav'),
  metronome: require('../../assets/sounds/metronome.wav'),
  subKick: require('../../assets/sounds/sub-kick.wav'),
};
