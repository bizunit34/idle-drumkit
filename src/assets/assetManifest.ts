import type { ImageSourcePropType } from 'react-native';
import type { DrumAssetKey } from '../types';

export type AppImageAssetKey =
  | 'mascotSource'
  | 'homeCarouselDrumSet'
  | 'homeCarouselMidiPads'
  | 'homeCarouselCustomSounds'
  | 'soundNotFound'
  | `drumPiece.${DrumAssetKey}`;

export type AppImageAsset = {
  key: AppImageAssetKey;
  source: ImageSourcePropType;
  group: 'critical' | 'home' | 'drumSet' | 'midiController';
};

export const appImageAssets: Record<AppImageAssetKey, AppImageAsset> = {
  mascotSource: {
    key: 'mascotSource',
    source: require('../../assets/images/mascot-source.png') as ImageSourcePropType,
    group: 'critical',
  },
  homeCarouselDrumSet: {
    key: 'homeCarouselDrumSet',
    source: require('../../assets/images/home-carousel-drum-set.png') as ImageSourcePropType,
    group: 'critical',
  },
  homeCarouselMidiPads: {
    key: 'homeCarouselMidiPads',
    source: require('../../assets/images/home-carousel-midi-pads.png') as ImageSourcePropType,
    group: 'critical',
  },
  homeCarouselCustomSounds: {
    key: 'homeCarouselCustomSounds',
    source: require('../../assets/images/home-carousel-custom-sounds.png') as ImageSourcePropType,
    group: 'critical',
  },
  soundNotFound: {
    key: 'soundNotFound',
    source: require('../../assets/images/sound-not-found.png') as ImageSourcePropType,
    group: 'midiController',
  },
  'drumPiece.kick': {
    key: 'drumPiece.kick',
    source: require('../../assets/images/drum-pieces/kick.png') as ImageSourcePropType,
    group: 'drumSet',
  },
  'drumPiece.snare': {
    key: 'drumPiece.snare',
    source: require('../../assets/images/drum-pieces/snare.png') as ImageSourcePropType,
    group: 'drumSet',
  },
  'drumPiece.hiHat': {
    key: 'drumPiece.hiHat',
    source: require('../../assets/images/drum-pieces/hi-hat.png') as ImageSourcePropType,
    group: 'drumSet',
  },
  'drumPiece.hiHatClosed': {
    key: 'drumPiece.hiHatClosed',
    source: require('../../assets/images/drum-pieces/hi-hat-closed.png') as ImageSourcePropType,
    group: 'drumSet',
  },
  'drumPiece.hiHatOpen': {
    key: 'drumPiece.hiHatOpen',
    source: require('../../assets/images/drum-pieces/hi-hat-open.png') as ImageSourcePropType,
    group: 'drumSet',
  },
  'drumPiece.crash': {
    key: 'drumPiece.crash',
    source: require('../../assets/images/drum-pieces/crash.png') as ImageSourcePropType,
    group: 'drumSet',
  },
  'drumPiece.ride': {
    key: 'drumPiece.ride',
    source: require('../../assets/images/drum-pieces/ride.png') as ImageSourcePropType,
    group: 'drumSet',
  },
  'drumPiece.highTom': {
    key: 'drumPiece.highTom',
    source: require('../../assets/images/drum-pieces/high-tom.png') as ImageSourcePropType,
    group: 'drumSet',
  },
  'drumPiece.midTom': {
    key: 'drumPiece.midTom',
    source: require('../../assets/images/drum-pieces/mid-tom.png') as ImageSourcePropType,
    group: 'drumSet',
  },
  'drumPiece.floorTom': {
    key: 'drumPiece.floorTom',
    source: require('../../assets/images/drum-pieces/floor-tom.png') as ImageSourcePropType,
    group: 'drumSet',
  },
};

export const assetPreloadGroups = {
  critical: [
    'mascotSource',
    'homeCarouselDrumSet',
    'homeCarouselMidiPads',
    'homeCarouselCustomSounds',
  ],
  drumSet: [
    'drumPiece.kick',
    'drumPiece.snare',
    'drumPiece.hiHat',
    'drumPiece.hiHatClosed',
    'drumPiece.hiHatOpen',
    'drumPiece.crash',
    'drumPiece.ride',
    'drumPiece.highTom',
    'drumPiece.midTom',
    'drumPiece.floorTom',
  ],
  midiController: ['homeCarouselMidiPads', 'soundNotFound'],
} satisfies Record<string, AppImageAssetKey[]>;
