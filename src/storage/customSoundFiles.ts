import { Directory, File, Paths } from 'expo-file-system';
import type { DocumentPickerAsset } from 'expo-document-picker';

export type ImportedCustomSound = {
  uri: string;
  name: string;
};

const AUDIO_EXTENSIONS = new Set(['aac', 'aif', 'aiff', 'caf', 'flac', 'm4a', 'mp3', 'ogg', 'wav']);

const customSoundsDirectory = new Directory(Paths.document, 'custom-sounds');

function ensureCustomSoundsDirectory(): Directory {
  customSoundsDirectory.create({ intermediates: true, idempotent: true });
  return customSoundsDirectory;
}

function sanitizeFileName(name: string): string {
  const fallbackName = 'custom-sound.wav';
  const safeName = name.trim().replace(/[^a-zA-Z0-9._-]/g, '-');
  return safeName || fallbackName;
}

function getExtension(name: string): string | null {
  const extension = name.split('.').pop();
  return extension ? extension.toLowerCase() : null;
}

export function isSupportedAudioAsset(asset: DocumentPickerAsset): boolean {
  if (asset.mimeType?.toLowerCase().startsWith('audio/')) return true;
  const extension = getExtension(asset.name);
  return extension ? AUDIO_EXTENSIONS.has(extension) : false;
}

export async function importCustomSoundFile(
  asset: DocumentPickerAsset,
): Promise<ImportedCustomSound> {
  if (!isSupportedAudioAsset(asset)) {
    throw new Error('Choose an audio file such as WAV, MP3, M4A, AAC, or OGG.');
  }

  const directory = ensureCustomSoundsDirectory();
  const safeName = sanitizeFileName(asset.name);
  const destinationName = `${Date.now()}-${safeName}`;
  const source = new File(asset.uri);
  const destination = new File(directory, destinationName);

  await source.copy(destination, { overwrite: true });

  return {
    uri: destination.uri,
    name: asset.name,
  };
}

export function customSoundExists(uri: string): boolean {
  return new File(uri).exists;
}

export function deleteCustomSound(uri?: string): void {
  if (!uri) return;

  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}

export function clearAllCustomSounds(): void {
  if (customSoundsDirectory.exists) {
    customSoundsDirectory.delete();
  }
}
