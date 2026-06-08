import type {
  DrumArticulation,
  DrumArticulationId,
  DrumChokeGroup,
  DrumPieceArticulationConfig,
  DrumPieceId,
  SelectedDrumArticulations,
  SoundKey,
} from '../types';

export const chokeGroupSounds: Record<DrumChokeGroup, SoundKey[]> = {
  openHiHat: ['openHihat'],
  crash: ['crash'],
};

export const drumArticulationConfigs: Record<DrumPieceId, DrumPieceArticulationConfig> = {
  kick: {
    pieceId: 'kick',
    defaultArticulationId: 'kickNormal',
    articulations: [
      { id: 'kickNormal', label: 'Normal', shortLabel: 'Normal', sound: 'kick', isDefault: true },
      { id: 'kickSub', label: 'Sub Kick', shortLabel: 'Sub', sound: 'subKick' },
    ],
  },
  snare: {
    pieceId: 'snare',
    defaultArticulationId: 'snareCenter',
    articulations: [
      { id: 'snareCenter', label: 'Center', shortLabel: 'Center', sound: 'snare', isDefault: true },
      { id: 'snareRimshot', label: 'Rimshot', shortLabel: 'Rim', sound: 'rim' },
      { id: 'snareCrossStick', label: 'Cross-stick', shortLabel: 'X-stick', sound: 'perc' },
    ],
  },
  hihat: {
    pieceId: 'hihat',
    defaultArticulationId: 'hihatClosed',
    articulations: [
      {
        id: 'hihatClosed',
        label: 'Closed',
        shortLabel: 'Closed',
        sound: 'closedHihat',
        imageAssetKey: 'hiHatClosed',
        chokes: ['openHiHat'],
        isDefault: true,
      },
      {
        id: 'hihatOpen',
        label: 'Open',
        shortLabel: 'Open',
        sound: 'openHihat',
        imageAssetKey: 'hiHatOpen',
        chokeGroup: 'openHiHat',
      },
    ],
  },
  crash: {
    pieceId: 'crash',
    defaultArticulationId: 'crashHit',
    articulations: [
      {
        id: 'crashHit',
        label: 'Hit',
        shortLabel: 'Hit',
        sound: 'crash',
        chokeGroup: 'crash',
        isDefault: true,
      },
      {
        id: 'crashChoke',
        label: 'Choke',
        shortLabel: 'Choke',
        chokes: ['crash'],
        actionOnly: true,
      },
    ],
  },
  ride: {
    pieceId: 'ride',
    defaultArticulationId: 'rideBow',
    articulations: [
      { id: 'rideBow', label: 'Bow', shortLabel: 'Bow', sound: 'ride', isDefault: true },
      { id: 'rideBell', label: 'Bell', shortLabel: 'Bell', sound: 'cowbell' },
    ],
  },
  highTom: {
    pieceId: 'highTom',
    defaultArticulationId: 'highTomCenter',
    articulations: [
      {
        id: 'highTomCenter',
        label: 'Center',
        shortLabel: 'Center',
        sound: 'highTom',
        isDefault: true,
      },
      { id: 'highTomRim', label: 'Rim', shortLabel: 'Rim', sound: 'rim' },
    ],
  },
  midTom: {
    pieceId: 'midTom',
    defaultArticulationId: 'midTomCenter',
    articulations: [
      {
        id: 'midTomCenter',
        label: 'Center',
        shortLabel: 'Center',
        sound: 'midTom',
        isDefault: true,
      },
      { id: 'midTomRim', label: 'Rim', shortLabel: 'Rim', sound: 'rim' },
    ],
  },
  floorTom: {
    pieceId: 'floorTom',
    defaultArticulationId: 'floorTomCenter',
    articulations: [
      {
        id: 'floorTomCenter',
        label: 'Center',
        shortLabel: 'Center',
        sound: 'floorTom',
        isDefault: true,
      },
      { id: 'floorTomRim', label: 'Rim', shortLabel: 'Rim', sound: 'rim' },
    ],
  },
};

const drumPieceIds = Object.keys(drumArticulationConfigs) as DrumPieceId[];
const articulationIds = new Set<DrumArticulationId>(
  drumPieceIds.flatMap((pieceId) =>
    drumArticulationConfigs[pieceId].articulations.map((articulation) => articulation.id),
  ),
);

export function isDrumPieceId(value: unknown): value is DrumPieceId {
  return typeof value === 'string' && value in drumArticulationConfigs;
}

export function isDrumArticulationId(value: unknown): value is DrumArticulationId {
  return typeof value === 'string' && articulationIds.has(value as DrumArticulationId);
}

export function getDefaultSelectedDrumArticulations(): SelectedDrumArticulations {
  return Object.fromEntries(
    drumPieceIds.map((pieceId) => [
      pieceId,
      drumArticulationConfigs[pieceId].defaultArticulationId,
    ]),
  ) as SelectedDrumArticulations;
}

export function getArticulationConfig(pieceId: DrumPieceId): DrumPieceArticulationConfig {
  return drumArticulationConfigs[pieceId];
}

export function resolveSelectedArticulation(
  pieceId: DrumPieceId,
  selectedArticulations: SelectedDrumArticulations,
): DrumArticulation {
  const config = getArticulationConfig(pieceId);
  const selectedId = selectedArticulations[pieceId] ?? config.defaultArticulationId;
  const fallback = config.articulations[0];
  if (!fallback) {
    throw new Error(`Drum piece ${pieceId} has no articulations.`);
  }
  return (
    config.articulations.find(
      (articulation) => articulation.id === selectedId && !articulation.actionOnly,
    ) ??
    config.articulations.find((articulation) => articulation.id === config.defaultArticulationId) ??
    fallback
  );
}

export function validateSelectedDrumArticulations(value: unknown): SelectedDrumArticulations {
  const defaults = getDefaultSelectedDrumArticulations();
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return defaults;

  const result: SelectedDrumArticulations = { ...defaults };
  for (const [pieceId, articulationId] of Object.entries(value)) {
    if (!isDrumPieceId(pieceId) || !isDrumArticulationId(articulationId)) continue;
    const config = drumArticulationConfigs[pieceId];
    const articulation = config.articulations.find((candidate) => candidate.id === articulationId);
    if (!articulation || articulation.actionOnly) continue;
    result[pieceId] = articulation.id;
  }
  return result;
}

export function getChokedSounds(articulation: DrumArticulation): SoundKey[] {
  const groupedSounds =
    articulation.chokes?.flatMap((group) => chokeGroupSounds[group] ?? []) ?? [];
  return [...groupedSounds, ...(articulation.chokeSounds ?? [])];
}

export function validateDrumArticulationMappings(availableSounds: ReadonlySet<SoundKey>): string[] {
  const issues: string[] = [];

  for (const pieceId of drumPieceIds) {
    const config = drumArticulationConfigs[pieceId];
    const defaultArticulation = config.articulations.find(
      (articulation) => articulation.id === config.defaultArticulationId,
    );

    if (!defaultArticulation) {
      issues.push(`${pieceId} is missing its default articulation.`);
    }

    if (!config.articulations.some((articulation) => articulation.isDefault)) {
      issues.push(`${pieceId} has no articulation marked as default.`);
    }

    for (const articulation of config.articulations) {
      if (!articulation.actionOnly && !articulation.sound) {
        issues.push(`${pieceId}:${articulation.id} is playable but has no sound.`);
      }

      if (articulation.sound && !availableSounds.has(articulation.sound)) {
        issues.push(
          `${pieceId}:${articulation.id} references missing sound ${articulation.sound}.`,
        );
      }
    }
  }

  return issues;
}
