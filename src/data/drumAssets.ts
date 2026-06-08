import type { ImageSourcePropType } from 'react-native';
import type { DrumAssetKey } from '../types';

export type DrumAssetDefinition = {
  key: DrumAssetKey;
  expectedPath: string;
  source?: ImageSourcePropType;
  aspectRatio: number;
  defaultVisualSize: {
    width: number;
    height: number;
  };
};

export const drumAssets: Record<DrumAssetKey, DrumAssetDefinition> = {
  kick: {
    key: 'kick',
    expectedPath: 'assets/images/drum-pieces/kick.png',
    source: require('../../assets/images/drum-pieces/kick.png') as ImageSourcePropType,
    aspectRatio: 1,
    defaultVisualSize: { width: 0.24, height: 0.24 },
  },
  snare: {
    key: 'snare',
    expectedPath: 'assets/images/drum-pieces/snare.png',
    source: require('../../assets/images/drum-pieces/snare.png') as ImageSourcePropType,
    aspectRatio: 1,
    defaultVisualSize: { width: 0.2, height: 0.2 },
  },
  hiHat: {
    key: 'hiHat',
    expectedPath: 'assets/images/drum-pieces/hi-hat.png',
    source: require('../../assets/images/drum-pieces/hi-hat.png') as ImageSourcePropType,
    aspectRatio: 1.35,
    defaultVisualSize: { width: 0.2, height: 0.15 },
  },
  hiHatClosed: {
    key: 'hiHatClosed',
    expectedPath: 'assets/images/drum-pieces/hi-hat-closed.png',
    source: require('../../assets/images/drum-pieces/hi-hat-closed.png') as ImageSourcePropType,
    aspectRatio: 1.35,
    defaultVisualSize: { width: 0.2, height: 0.15 },
  },
  hiHatOpen: {
    key: 'hiHatOpen',
    expectedPath: 'assets/images/drum-pieces/hi-hat-open.png',
    source: require('../../assets/images/drum-pieces/hi-hat-open.png') as ImageSourcePropType,
    aspectRatio: 1.35,
    defaultVisualSize: { width: 0.2, height: 0.15 },
  },
  crash: {
    key: 'crash',
    expectedPath: 'assets/images/drum-pieces/crash.png',
    source: require('../../assets/images/drum-pieces/crash.png') as ImageSourcePropType,
    aspectRatio: 1.35,
    defaultVisualSize: { width: 0.22, height: 0.16 },
  },
  ride: {
    key: 'ride',
    expectedPath: 'assets/images/drum-pieces/ride.png',
    source: require('../../assets/images/drum-pieces/ride.png') as ImageSourcePropType,
    aspectRatio: 1.35,
    defaultVisualSize: { width: 0.23, height: 0.17 },
  },
  highTom: {
    key: 'highTom',
    expectedPath: 'assets/images/drum-pieces/high-tom.png',
    source: require('../../assets/images/drum-pieces/high-tom.png') as ImageSourcePropType,
    aspectRatio: 1,
    defaultVisualSize: { width: 0.18, height: 0.18 },
  },
  midTom: {
    key: 'midTom',
    expectedPath: 'assets/images/drum-pieces/mid-tom.png',
    source: require('../../assets/images/drum-pieces/mid-tom.png') as ImageSourcePropType,
    aspectRatio: 1,
    defaultVisualSize: { width: 0.18, height: 0.18 },
  },
  floorTom: {
    key: 'floorTom',
    expectedPath: 'assets/images/drum-pieces/floor-tom.png',
    source: require('../../assets/images/drum-pieces/floor-tom.png') as ImageSourcePropType,
    aspectRatio: 1,
    defaultVisualSize: { width: 0.21, height: 0.21 },
  },
};
