import { Image } from 'react-native';
import { appImageAssets, assetPreloadGroups, type AppImageAssetKey } from './assetManifest';

type PreloadGroup = keyof typeof assetPreloadGroups;

const loadedGroups = new Set<PreloadGroup>();

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> =>
  Promise.race([
    promise,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    }),
  ]);

async function preloadImage(key: AppImageAssetKey): Promise<void> {
  const source = Image.resolveAssetSource(appImageAssets[key].source);
  if (!source?.uri) return;
  await Image.prefetch(source.uri);
}

export async function preloadAssetGroup(
  group: PreloadGroup,
  timeoutMs = 1800,
): Promise<{ ok: boolean }> {
  if (loadedGroups.has(group)) return { ok: true };

  const result = await withTimeout(
    Promise.allSettled(assetPreloadGroups[group].map((key) => preloadImage(key))),
    timeoutMs,
  );

  loadedGroups.add(group);
  return { ok: result !== null };
}

export function isAssetGroupLoaded(group: PreloadGroup): boolean {
  return loadedGroups.has(group);
}

export function preloadModeAssetsInBackground(): void {
  void preloadAssetGroup('drumSet', 3500);
  void preloadAssetGroup('midiController', 3500);
}
