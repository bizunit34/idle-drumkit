import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { AppModalSheet } from '../components/AppModalSheet';
import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { appImageAssets } from '../assets/assetManifest';
import { formatPadPlaybackMode, formatSound, getMidiPadDisplayText } from '../data/midiPadDisplay';
import { buildResetMidiPads } from '../data/padUtils';
import {
  deleteCustomSound,
  importCustomSoundFile,
  isSupportedAudioAsset,
} from '../storage/customSoundFiles';
import { midiAccentColors, colors, radii, spacing } from '../theme';
import type {
  AppSettings,
  MidiGridSize,
  MidiPad,
  MidiPadBehaviorSettings,
  SoundKey,
} from '../types';

type Props = {
  settings: AppSettings;
  gridSize: MidiGridSize;
  pads: MidiPad[];
  onBack: () => void;
  onPressPad: (pad: MidiPad) => void;
  onReleasePad: (pad: MidiPad) => void;
  onSaveGridSize: (gridSize: MidiGridSize) => void;
  onSavePads: (pads: MidiPad[]) => void;
  onSaveSettings: (settings: AppSettings) => void;
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

const playbackModeOptions: {
  value: MidiPadBehaviorSettings['playbackMode'];
  label: string;
  help: string;
}[] = [
  { value: 'oneShot', label: 'Play once', help: 'Press plays the sound to completion.' },
  { value: 'gate', label: 'Hold to play', help: 'Press starts, release stops.' },
  { value: 'toggle', label: 'Tap start/stop', help: 'Press toggles playback on or off.' },
];

const retriggerModeOptions: {
  value: MidiPadBehaviorSettings['retriggerMode'];
  label: string;
}[] = [
  { value: 'overlap', label: 'Layer hits' },
  { value: 'restart', label: 'Restart' },
  { value: 'ignoreWhilePlaying', label: 'Ignore while playing' },
];

const chokeGroupOptions: {
  value: MidiPadBehaviorSettings['chokeGroup'];
  label: string;
}[] = [
  { value: 'none', label: 'None' },
  { value: 'hihat', label: 'Hi-hat' },
  { value: 'cymbal', label: 'Cymbal' },
  { value: 'group1', label: 'Group 1' },
  { value: 'group2', label: 'Group 2' },
  { value: 'group3', label: 'Group 3' },
  { value: 'group4', label: 'Group 4' },
];

const stopModeOptions: {
  value: MidiPadBehaviorSettings['stopMode'];
  label: string;
}[] = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'shortFade', label: 'Short fade' },
  { value: 'mediumFade', label: 'Medium fade' },
];

const soundNotFoundSource = appImageAssets.soundNotFound.source as ImageSourcePropType;

export function MidiControllerScreen({
  settings,
  gridSize,
  pads,
  onBack,
  onPressPad,
  onReleasePad,
  onSaveGridSize,
  onSavePads,
  onSaveSettings,
  onNotify,
}: Props) {
  const [selectedPadId, setSelectedPadId] = useState(pads[0]?.id);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [padEditOpen, setPadEditOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [soundImageFailed, setSoundImageFailed] = useState(false);
  const columns = gridSize === '3x4' ? 3 : 4;
  const visiblePads = pads.slice(0, gridSize === '3x4' ? 12 : 16);
  const selectedPad = useMemo(
    () => pads.find((pad) => pad.id === selectedPadId) ?? pads[0],
    [pads, selectedPadId],
  );

  const updatePad = (padId: string, patch: Partial<MidiPad>) => {
    onSavePads(pads.map((pad) => (pad.id === padId ? { ...pad, ...patch } : pad)));
  };

  const updatePadBehavior = (padId: string, patch: Partial<MidiPadBehaviorSettings>) => {
    onSavePads(
      pads.map((pad) =>
        pad.id === padId
          ? {
              ...pad,
              behavior: {
                ...pad.behavior,
                ...patch,
              },
            }
          : pad,
      ),
    );
  };

  const updateDisplaySetting = (patch: Partial<AppSettings['midiDisplay']>) => {
    onSaveSettings({
      ...settings,
      midiDisplay: {
        ...settings.midiDisplay,
        ...patch,
      },
    });
    onNotify('MIDI display saved.');
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
        subtitle={editMode ? 'Edit Pads Mode' : 'Performance Mode'}
        onBack={onBack}
      />
      <View style={styles.toolbar}>
        <Text style={styles.toolbarHint}>
          {editMode
            ? 'Tap a pad to edit it'
            : 'Press pads to play · hold behavior follows pad settings'}
        </Text>
        <AppButton label="Controls" variant="secondary" onPress={() => setControlsOpen(true)} />
      </View>
      <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridScrollContent}>
        <View style={styles.controllerBody}>
          <View style={styles.controllerTopBar}>
            <View style={styles.brandMark} />
            <Text style={styles.controllerBrand}>DRUMKIT PAD</Text>
            <View style={styles.statusLights}>
              <View style={[styles.statusLight, { backgroundColor: colors.cyan }]} />
              <View style={[styles.statusLight, { backgroundColor: colors.lime }]} />
            </View>
          </View>
          <View style={styles.controllerSurface}>
            <View style={styles.padGrid}>
              {visiblePads.map((pad, index) => {
                const display = getMidiPadDisplayText(pad, index, settings.midiDisplay, editMode);
                return (
                  <Pressable
                    key={pad.id}
                    accessibilityRole="button"
                    accessibilityLabel={display.accessibilityLabel}
                    accessibilityHint={display.accessibilityHint}
                    onPressIn={() => {
                      setSelectedPadId(pad.id);
                      if (editMode) {
                        setPadEditOpen(true);
                        return;
                      }
                      onPressPad(pad);
                    }}
                    onPressOut={() => {
                      if (!editMode) onReleasePad(pad);
                    }}
                    style={({ pressed }) => [
                      styles.pad,
                      {
                        flexBasis: `${100 / columns - 3}%`,
                        borderColor: selectedPad?.id === pad.id ? pad.accentColor : '#343A48',
                        shadowColor: pad.accentColor,
                      },
                      pressed && styles.padPressed,
                      selectedPad?.id === pad.id && styles.selectedPad,
                      editMode && styles.editablePad,
                    ]}
                  >
                    <View style={[styles.padGlow, { borderColor: pad.accentColor }]} />
                    <View style={[styles.padLight, { backgroundColor: pad.accentColor }]} />
                    <View style={styles.padTextBlock}>
                      {display.number ? (
                        <Text style={styles.padNumber}>{display.number}</Text>
                      ) : null}
                      {display.label ? <Text style={styles.padLabel}>{display.label}</Text> : null}
                      {display.soundName ? (
                        <Text style={styles.padSound}>{display.soundName}</Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
      <AppModalSheet
        visible={controlsOpen}
        title="MIDI Controls"
        presentation="playControls"
        onClose={() => setControlsOpen(false)}
      >
        <Text style={styles.editorHelp}>
          {editMode
            ? 'Edit Pads Mode is on. Tap a pad to edit it; pads will not play.'
            : 'Performance Mode is on. Tap pads to play. Hold behavior depends on each pad.'}
        </Text>
        <AppButton
          label={editMode ? 'Done Editing' : 'Edit Pads'}
          variant={editMode ? 'primary' : 'secondary'}
          onPress={() => {
            setEditMode((value) => !value);
            setControlsOpen(false);
          }}
        />
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
        {selectedPad ? (
          <View style={styles.selectedSummary}>
            <View style={[styles.summaryAccent, { backgroundColor: selectedPad.accentColor }]} />
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryTitle}>{selectedPad.label}</Text>
              <Text style={styles.summaryBody}>
                Selected · {formatSound(selectedPad.sound)} ·{' '}
                {formatPadPlaybackMode(selectedPad.behavior.playbackMode)}
                {selectedPad.customSoundName ? ` · ${selectedPad.customSoundName}` : ''}
              </Text>
            </View>
            <AppButton
              label="Edit Pad"
              variant="secondary"
              onPress={() => {
                setControlsOpen(false);
                setPadEditOpen(true);
              }}
            />
          </View>
        ) : null}
        <View style={styles.displaySettings}>
          <Text style={styles.fieldLabel}>Pad Display</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show Pad Labels</Text>
            <Switch
              value={settings.midiDisplay.showPadLabels}
              onValueChange={(showPadLabels) => updateDisplaySetting({ showPadLabels })}
              trackColor={{ true: colors.cyan, false: colors.border }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show Sound Names</Text>
            <Switch
              value={settings.midiDisplay.showPadSoundNames}
              onValueChange={(showPadSoundNames) => updateDisplaySetting({ showPadSoundNames })}
              trackColor={{ true: colors.cyan, false: colors.border }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show Pad Numbers</Text>
            <Switch
              value={settings.midiDisplay.showPadNumbers}
              onValueChange={(showPadNumbers) => updateDisplaySetting({ showPadNumbers })}
              trackColor={{ true: colors.cyan, false: colors.border }}
            />
          </View>
        </View>
      </AppModalSheet>
      <AppModalSheet
        visible={padEditOpen}
        title={selectedPad ? `Edit ${selectedPad.label}` : 'Pad Edit'}
        presentation="playControls"
        onClose={() => setPadEditOpen(false)}
      >
        {selectedPad && (
          <ScrollView style={styles.editor} contentContainerStyle={styles.editorContent}>
            <Text style={styles.editorHelp}>
              Label, accent, default sound, playback behavior, and custom audio changes save
              automatically.
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
            <Text style={styles.fieldLabel}>Playback Behavior</Text>
            <Text style={styles.editorHelp}>
              Loop-point editing is deferred. Chokes and fades are best-effort in Expo audio.
            </Text>
            <Text style={styles.subFieldLabel}>Playback Mode</Text>
            <View style={styles.optionList}>
              {playbackModeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => updatePadBehavior(selectedPad.id, { playbackMode: option.value })}
                  style={[
                    styles.behaviorOption,
                    selectedPad.behavior.playbackMode === option.value && styles.activeSoundChip,
                  ]}
                >
                  <Text style={styles.soundChipText}>{option.label}</Text>
                  <Text style={styles.behaviorHelp}>{option.help}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.subFieldLabel}>Retrigger</Text>
            <View style={styles.soundList}>
              {retriggerModeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => updatePadBehavior(selectedPad.id, { retriggerMode: option.value })}
                  style={[
                    styles.soundChip,
                    selectedPad.behavior.retriggerMode === option.value && styles.activeSoundChip,
                  ]}
                >
                  <Text style={styles.soundChipText}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.subFieldLabel}>Choke Group</Text>
            <View style={styles.soundList}>
              {chokeGroupOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => updatePadBehavior(selectedPad.id, { chokeGroup: option.value })}
                  style={[
                    styles.soundChip,
                    selectedPad.behavior.chokeGroup === option.value && styles.activeSoundChip,
                  ]}
                >
                  <Text style={styles.soundChipText}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.subFieldLabel}>Stop / Release</Text>
            <View style={styles.soundList}>
              {stopModeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => updatePadBehavior(selectedPad.id, { stopMode: option.value })}
                  style={[
                    styles.soundChip,
                    selectedPad.behavior.stopMode === option.value && styles.activeSoundChip,
                  ]}
                >
                  <Text style={styles.soundChipText}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.subFieldLabel}>Pad Volume</Text>
            <View style={styles.volumeRow}>
              <AppButton
                label="-"
                variant="secondary"
                onPress={() =>
                  updatePadBehavior(selectedPad.id, {
                    padVolume: Math.max(0, selectedPad.behavior.padVolume - 5),
                  })
                }
              />
              <Text style={styles.volumeValue}>{selectedPad.behavior.padVolume}%</Text>
              <AppButton
                label="+"
                variant="secondary"
                onPress={() =>
                  updatePadBehavior(selectedPad.id, {
                    padVolume: Math.min(100, selectedPad.behavior.padVolume + 5),
                  })
                }
              />
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
      </AppModalSheet>
      <AdBannerPlaceholder />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  toolbarHint: {
    flex: 1,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
  gridScroll: {
    flex: 1,
  },
  gridScrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  controllerBody: {
    flex: 1,
    minHeight: 360,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#3B4352',
    backgroundColor: '#07090D',
    shadowColor: colors.black,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 5,
  },
  controllerTopBar: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  brandMark: {
    width: 28,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.cyan,
  },
  controllerBrand: {
    flex: 1,
    color: colors.subduedText,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  statusLights: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statusLight: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  controllerSurface: {
    flex: 1,
    minHeight: 300,
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: '#0B0E14',
    borderWidth: 1,
    borderColor: '#202633',
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
    borderRadius: radii.lg,
    borderWidth: 2,
    padding: spacing.md,
    justifyContent: 'space-between',
    backgroundColor: '#171B23',
    shadowOpacity: 0.3,
    shadowRadius: 9,
    elevation: 3,
    overflow: 'hidden',
  },
  selectedPad: {
    borderWidth: 3,
    backgroundColor: '#1B2230',
  },
  editablePad: {
    borderStyle: 'dashed',
    backgroundColor: '#202635',
  },
  padPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
  padGlow: {
    position: 'absolute',
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
    borderWidth: 1,
    borderRadius: radii.md,
    opacity: 0.34,
  },
  padLight: {
    width: 34,
    height: 6,
    borderRadius: 4,
  },
  padTextBlock: {
    gap: spacing.xs,
  },
  padNumber: {
    color: colors.subduedText,
    fontSize: 10,
    fontWeight: '900',
  },
  padLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  padSound: {
    color: colors.mutedText,
    fontSize: 11,
  },
  displaySettings: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectedSummary: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  summaryAccent: {
    width: 10,
    alignSelf: 'stretch',
    borderRadius: 5,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  summaryBody: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  switchRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
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
  subFieldLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
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
  optionList: {
    gap: spacing.sm,
  },
  behaviorOption: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  behaviorHelp: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 16,
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
  volumeRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  volumeValue: {
    minWidth: 72,
    color: colors.cyan,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
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
