import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { buildResetMidiPads } from '../data/padUtils';
import {
  deleteCustomSound,
  importCustomSoundFile,
  isSupportedAudioAsset,
} from '../storage/customSoundFiles';
import { midiAccentColors, colors, radii, spacing } from '../theme';
import type { AppSettings, MidiGridSize, MidiPad, SoundKey } from '../types';

type Props = {
  settings: AppSettings;
  gridSize: MidiGridSize;
  pads: MidiPad[];
  onBack: () => void;
  onPlayPad: (pad: MidiPad) => void;
  onSaveGridSize: (gridSize: MidiGridSize) => void;
  onSavePads: (pads: MidiPad[]) => void;
  onNotify: (message: string) => void;
};

const soundOptions: SoundKey[] = [
  'kick',
  'snare',
  'closedHihat',
  'openHihat',
  'clap',
  'crash',
  'ride',
  'highTom',
  'midTom',
  'floorTom',
  'rim',
  'cowbell',
  'shaker',
  'perc',
  'metronome',
  'subKick',
];

const formatSound = (sound: SoundKey) =>
  sound.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());

const soundNotFoundSource =
  require('../../assets/images/sound-not-found.png') as ImageSourcePropType;

export function MidiControllerScreen({
  settings,
  gridSize,
  pads,
  onBack,
  onPlayPad,
  onSaveGridSize,
  onSavePads,
  onNotify,
}: Props) {
  const [selectedPadId, setSelectedPadId] = useState(pads[0]?.id);
  const [soundImageFailed, setSoundImageFailed] = useState(false);
  const { width } = useWindowDimensions();
  const columns = gridSize === '3x4' ? 3 : 4;
  const visiblePads = pads.slice(0, gridSize === '3x4' ? 12 : 16);
  const selectedPad = useMemo(
    () => pads.find((pad) => pad.id === selectedPadId) ?? pads[0],
    [pads, selectedPadId],
  );

  const updatePad = (padId: string, patch: Partial<MidiPad>) => {
    onSavePads(pads.map((pad) => (pad.id === padId ? { ...pad, ...patch } : pad)));
  };

  const chooseSoundFile = async () => {
    if (!selectedPad) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets[0]) {
        onNotify('Custom sound import cancelled.');
        return;
      }

      const asset = result.assets[0];
      if (!isSupportedAudioAsset(asset)) {
        onNotify('Choose a supported audio file.');
        return;
      }

      const importedSound = await importCustomSoundFile(asset);
      deleteCustomSound(selectedPad.customSoundUri);
      updatePad(selectedPad.id, {
        customSoundUri: importedSound.uri,
        customSoundName: importedSound.name,
      });
      onNotify('Custom sound assigned.');
    } catch {
      onNotify('Could not import that audio file.');
    }
  };

  const clearCustomSound = () => {
    if (!selectedPad) return;
    deleteCustomSound(selectedPad.customSoundUri);
    updatePad(selectedPad.id, {
      customSoundUri: undefined,
      customSoundName: undefined,
    });
    onNotify('Custom sound cleared.');
  };

  const resetPads = () => {
    Alert.alert(
      'Reset pads?',
      'This restores all pad labels, colors, sounds, and custom imports.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            for (const pad of pads) {
              deleteCustomSound(pad.customSoundUri);
            }
            onSavePads(buildResetMidiPads());
            onNotify('Pads reset.');
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="MIDI Controller"
        subtitle="Tap pads to play, edit the selected pad"
        onBack={onBack}
      />
      <View style={styles.toolbar}>
        <View style={styles.segmented}>
          <Pressable
            onPress={() => onSaveGridSize('3x4')}
            style={[styles.segment, gridSize === '3x4' && styles.activeSegment]}
          >
            <Text style={[styles.segmentText, gridSize === '3x4' && styles.activeSegmentText]}>
              3x4
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onSaveGridSize('4x4')}
            style={[styles.segment, gridSize === '4x4' && styles.activeSegment]}
          >
            <Text style={[styles.segmentText, gridSize === '4x4' && styles.activeSegmentText]}>
              4x4
            </Text>
          </Pressable>
        </View>
        <AppButton label="Reset Pads" variant="danger" onPress={resetPads} />
      </View>
      <View style={[styles.content, width < 760 && styles.stacked]}>
        <View style={styles.controllerSurface}>
          <View style={styles.padGrid}>
            {visiblePads.map((pad) => (
              <Pressable
                key={pad.id}
                onLongPress={() => setSelectedPadId(pad.id)}
                onPress={() => {
                  setSelectedPadId(pad.id);
                  onPlayPad(pad);
                }}
                style={({ pressed }) => [
                  styles.pad,
                  {
                    flexBasis: `${100 / columns - 3}%`,
                    borderColor: settings.showHitBoxes ? pad.accentColor : '#303541',
                    backgroundColor: settings.showHitBoxes ? '#171D27' : '#151922',
                    shadowColor: pad.accentColor,
                  },
                  pressed && styles.padPressed,
                  selectedPad?.id === pad.id && styles.selectedPad,
                ]}
              >
                <View style={[styles.padLight, { backgroundColor: pad.accentColor }]} />
                <Text style={styles.padLabel}>{pad.label}</Text>
                <Text style={styles.padSound}>{formatSound(pad.sound)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {selectedPad && (
          <ScrollView style={styles.editor} contentContainerStyle={styles.editorContent}>
            <Text style={styles.editorTitle}>Pad Edit</Text>
            <Text style={styles.editorHelp}>
              Changes save automatically and survive app reloads.
            </Text>
            <Text style={styles.fieldLabel}>Label</Text>
            <TextInput
              value={selectedPad.label}
              onChangeText={(label) => updatePad(selectedPad.id, { label })}
              placeholder="Pad label"
              placeholderTextColor={colors.mutedText}
              style={styles.input}
            />
            <Text style={styles.fieldLabel}>Accent</Text>
            <View style={styles.swatches}>
              {midiAccentColors.map((accentColor) => (
                <Pressable
                  key={accentColor}
                  accessibilityRole="button"
                  onPress={() => updatePad(selectedPad.id, { accentColor })}
                  style={[
                    styles.swatch,
                    { backgroundColor: accentColor },
                    selectedPad.accentColor === accentColor && styles.activeSwatch,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.fieldLabel}>Default Sound</Text>
            <View style={styles.soundList}>
              {soundOptions.map((sound) => (
                <Pressable
                  key={sound}
                  onPress={() => updatePad(selectedPad.id, { sound })}
                  style={[styles.soundChip, selectedPad.sound === sound && styles.activeSoundChip]}
                >
                  <Text style={styles.soundChipText}>{formatSound(sound)}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Custom Audio</Text>
            <View style={styles.importIllustration}>
              {!soundImageFailed ? (
                <Image
                  source={soundNotFoundSource}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                  onError={() => setSoundImageFailed(true)}
                  style={styles.importImage}
                />
              ) : (
                <>
                  <View style={styles.importBar} />
                  <View style={styles.importDot} />
                </>
              )}
            </View>
            <AppButton label="Assign Audio File" onPress={chooseSoundFile} />
            {selectedPad.customSoundUri ? (
              <View style={styles.customFileRow}>
                <Text style={styles.customFileName}>
                  {selectedPad.customSoundName ?? 'Custom sound selected'}
                </Text>
                <AppButton label="Clear" onPress={clearCustomSound} />
              </View>
            ) : null}
          </ScrollView>
        )}
      </View>
      <AdBannerPlaceholder />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: radii.md,
    overflow: 'hidden',
    borderColor: colors.border,
    borderWidth: 1,
  },
  segment: {
    minWidth: 72,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  activeSegment: {
    backgroundColor: colors.cyan,
  },
  segmentText: {
    color: colors.text,
    fontWeight: '800',
  },
  activeSegmentText: {
    color: colors.black,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  stacked: {
    flexDirection: 'column',
  },
  controllerSurface: {
    flex: 2,
    minHeight: 300,
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: '#090B10',
    borderWidth: 1,
    borderColor: '#303541',
  },
  padGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignContent: 'stretch',
  },
  pad: {
    flexGrow: 1,
    minHeight: 84,
    aspectRatio: 1.18,
    borderRadius: radii.md,
    borderWidth: 2,
    padding: spacing.md,
    justifyContent: 'space-between',
    backgroundColor: '#171A22',
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  selectedPad: {
    borderWidth: 3,
  },
  padPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.82,
  },
  padLight: {
    width: 24,
    height: 5,
    borderRadius: 3,
  },
  padLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  padSound: {
    color: colors.mutedText,
    fontSize: 11,
  },
  editor: {
    flex: 1,
    minWidth: 260,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  editorContent: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  editorTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  editorHelp: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  fieldLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.background,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  activeSwatch: {
    borderWidth: 3,
    borderColor: colors.text,
  },
  soundList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  soundChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  activeSoundChip: {
    borderColor: colors.cyan,
  },
  soundChipText: {
    color: colors.text,
    fontWeight: '700',
  },
  customFileRow: {
    gap: spacing.sm,
  },
  customFileName: {
    color: colors.mutedText,
  },
  importIllustration: {
    height: 62,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  importImage: {
    width: '100%',
    height: 58,
  },
  importBar: {
    width: 88,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.electricBlue,
  },
  importDot: {
    position: 'absolute',
    right: spacing.lg,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.lime,
  },
});
