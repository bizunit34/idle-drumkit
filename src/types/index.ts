import type { ImageSourcePropType } from 'react-native';

export type ScreenName = 'home' | 'drumSet' | 'midiController' | 'settings';

export type SoundKey =
  | 'kick'
  | 'snare'
  | 'closedHihat'
  | 'openHihat'
  | 'clap'
  | 'crash'
  | 'ride'
  | 'highTom'
  | 'midTom'
  | 'floorTom'
  | 'rim'
  | 'cowbell'
  | 'shaker'
  | 'perc'
  | 'metronome'
  | 'subKick';

export type Point = {
  x: number;
  y: number;
};

export type DrumPieceShape = 'circle' | 'oval' | 'rect';

export type DrumAssetKey =
  | 'kick'
  | 'snare'
  | 'hiHat'
  | 'crash'
  | 'ride'
  | 'highTom'
  | 'midTom'
  | 'floorTom';

export type DrumPiece = {
  id: string;
  label: string;
  sound: SoundKey;
  position: Point;
  /**
   * Tappable hit box size as a fraction of the stage. This remains independent
   * from optional PNG visual bounds.
   */
  size: {
    width: number;
    height: number;
  };
  shape: DrumPieceShape;
  color: string;
  imageAssetKey?: DrumAssetKey;
  imageSource?: ImageSourcePropType;
  imageAspectRatio?: number;
  defaultVisualSize?: {
    width: number;
    height: number;
  };
  hitBoxShape?: DrumPieceShape;
  zIndex?: number;
};

export type MidiGridSize = '3x4' | '4x4';

export type HiHatArticulation = 'closed' | 'open';

export type MidiPad = {
  id: string;
  label: string;
  sound: SoundKey;
  accentColor: string;
  customSoundUri?: string | undefined;
  customSoundName?: string | undefined;
};

export type AppSettings = {
  masterVolume: number;
  showHitBoxes: boolean;
  lowLatencyMode: boolean;
  hiHatArticulation: HiHatArticulation;
};

export type PersistedAppState = {
  settings: AppSettings;
  drumPositions: Record<string, Point>;
  midiGridSize: MidiGridSize;
  midiPads: MidiPad[];
};
