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

export type DrumPieceId =
  | 'kick'
  | 'snare'
  | 'hihat'
  | 'crash'
  | 'ride'
  | 'highTom'
  | 'midTom'
  | 'floorTom';

export type Point = {
  x: number;
  y: number;
};

export type DrumLayoutProfileId = 'default' | 'custom1' | 'custom2';

export type DrumLayoutProfile = {
  id: DrumLayoutProfileId;
  label: string;
  positions: Partial<Record<DrumPieceId, Point>>;
  scales: Partial<Record<DrumPieceId, number>>;
};

export type DrumPieceShape = 'circle' | 'oval' | 'rect';

export type DrumAssetKey =
  | 'kick'
  | 'snare'
  | 'hiHat'
  | 'hiHatClosed'
  | 'hiHatOpen'
  | 'crash'
  | 'ride'
  | 'highTom'
  | 'midTom'
  | 'floorTom';

export type DrumChokeGroup = 'openHiHat' | 'crash';

export type DrumArticulationId =
  | 'kickNormal'
  | 'kickSub'
  | 'snareCenter'
  | 'snareRimshot'
  | 'snareCrossStick'
  | 'hihatClosed'
  | 'hihatOpen'
  | 'crashHit'
  | 'crashChoke'
  | 'rideBow'
  | 'rideBell'
  | 'highTomCenter'
  | 'highTomRim'
  | 'midTomCenter'
  | 'midTomRim'
  | 'floorTomCenter'
  | 'floorTomRim';

export type DrumArticulation = {
  id: DrumArticulationId;
  label: string;
  shortLabel?: string;
  sound?: SoundKey;
  imageAssetKey?: DrumAssetKey;
  chokeGroup?: DrumChokeGroup;
  chokes?: DrumChokeGroup[];
  chokeSounds?: SoundKey[];
  isDefault?: boolean;
  actionOnly?: boolean;
};

export type DrumPieceArticulationConfig = {
  pieceId: DrumPieceId;
  defaultArticulationId: DrumArticulationId;
  articulations: DrumArticulation[];
};

export type SelectedDrumArticulations = Partial<Record<DrumPieceId, DrumArticulationId>>;

export type DrumPiece = {
  id: DrumPieceId;
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
  articulationConfig?: DrumPieceArticulationConfig;
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
  selectedDrumArticulations: SelectedDrumArticulations;
};

export type PersistedAppState = {
  settings: AppSettings;
  drumPositions: Record<string, Point>;
  activeDrumProfileId: DrumLayoutProfileId;
  drumLayoutProfiles: Record<DrumLayoutProfileId, DrumLayoutProfile>;
  midiGridSize: MidiGridSize;
  midiPads: MidiPad[];
};
