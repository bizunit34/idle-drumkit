import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { AppModalSheet } from '../components/AppModalSheet';
import { AppButton } from '../components/AppButton';
import { VolumeSlider } from '../components/VolumeSlider';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { formatPadPlaybackMode, formatSound, getMidiPadDisplayText } from '../data/midiPadDisplay';
import { buildResetMidiPads } from '../data/padUtils';
import {
  deleteCustomSound,
  importCustomSoundFile,
  isSupportedAudioAsset,
} from '../storage/customSoundFiles';
import { midiAccentColors, colors, radii, spacing } from '../theme';
import { getMidiGridDimensions } from '../utils/midiLayout';
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

type OptionSelectProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

function OptionSelect<T extends string>({ label, value, options, onChange }: OptionSelectProps<T>) {
  const fallback = options[0];
  if (!fallback) return null;

  const currentIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const current = options[currentIndex] ?? fallback;
  const next = options[(currentIndex + 1) % options.length] ?? fallback;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${current.label}`}
      accessibilityHint="Tap to cycle to the next option."
      onPress={() => onChange(next.value)}
      style={styles.selectRow}
    >
      <View>
        <Text style={styles.selectLabel}>{label}</Text>
        <Text style={styles.selectValue}>{current.label}</Text>
      </View>
      <Text style={styles.selectAction}>Change</Text>
    </Pressable>
  );
}

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
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const gridDimensions = getMidiGridDimensions(gridSize, landscape, width - spacing.md * 2);
  const columns = gridDimensions.columns;
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
      <ScrollView
        style={styles.gridScroll}
        scrollEnabled={gridDimensions.scrollVertical}
        contentContainerStyle={[
          styles.gridScrollContent,
          landscape && styles.landscapeGridScrollContent,
        ]}
      >
        <View style={[styles.controllerBody, landscape && styles.landscapeControllerBody]}>
          <View style={styles.controllerTopBar}>
            <View style={styles.brandMark} />
            <Text style={styles.controllerBrand}>DRUMKIT PAD</Text>
            <View style={styles.statusLights}>
              <View style={[styles.statusLight, { backgroundColor: colors.cyan }]} />
              <View style={[styles.statusLight, { backgroundColor: colors.lime }]} />
            </View>
          </View>
          <View style={[styles.controllerSurface, landscape && styles.landscapeControllerSurface]}>
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
                      landscape && styles.landscapePad,
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
            <OptionSelect
              label="Sound"
              value={selectedPad.sound}
              options={soundOptions.map((sound) => ({ value: sound, label: formatSound(sound) }))}
              onChange={(sound) => updatePad(selectedPad.id, { sound })}
            />
            <Text style={styles.fieldLabel}>Playback Behavior</Text>
            <Text style={styles.editorHelp}>
              Loop-point editing is deferred. Chokes and fades are best-effort in Expo audio.
            </Text>
            <Text style={styles.subFieldLabel}>Playback Mode</Text>
            <View style={styles.modeSegments}>
              {playbackModeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => updatePadBehavior(selectedPad.id, { playbackMode: option.value })}
                  style={[
                    styles.modeSegment,
                    selectedPad.behavior.playbackMode === option.value && styles.activeSegment,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      selectedPad.behavior.playbackMode === option.value &&
                        styles.activeSegmentText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.behaviorHelp}>
              {playbackModeOptions.find(
                (option) => option.value === selectedPad.behavior.playbackMode,
              )?.help ?? ''}
            </Text>
            <Text style={styles.subFieldLabel}>Retrigger</Text>
            <OptionSelect
              label="Retrigger"
              value={selectedPad.behavior.retriggerMode}
              options={retriggerModeOptions}
              onChange={(retriggerMode) => updatePadBehavior(selectedPad.id, { retriggerMode })}
            />
            <Text style={styles.subFieldLabel}>Choke Group</Text>
            <OptionSelect
              label="Choke Group"
              value={selectedPad.behavior.chokeGroup}
              options={chokeGroupOptions}
              onChange={(chokeGroup) => updatePadBehavior(selectedPad.id, { chokeGroup })}
            />
            <Text style={styles.subFieldLabel}>Stop / Release</Text>
            <OptionSelect
              label="Stop / Release"
              value={selectedPad.behavior.stopMode}
              options={stopModeOptions}
              onChange={(stopMode) => updatePadBehavior(selectedPad.id, { stopMode })}
            />
            <Text style={styles.subFieldLabel}>Pad Volume</Text>
            <VolumeSlider
              label="Pad Volume"
              value={selectedPad.behavior.padVolume / 100}
              onChange={(padVolume) =>
                updatePadBehavior(selectedPad.id, { padVolume: Math.round(padVolume * 100) })
              }
            />
            <Text style={styles.fieldLabel}>Custom Audio</Text>
            <View style={styles.customAudioPanel}>
              <View style={styles.customAudioGlyph}>
                <View
                  style={[styles.customAudioBar, { backgroundColor: selectedPad.accentColor }]}
                />
                <View style={styles.customAudioDot} />
              </View>
              <View style={styles.customAudioCopy}>
                <Text style={styles.customAudioTitle}>Custom Audio</Text>
                <Text style={styles.customAudioBody}>
                  {selectedPad.customSoundName ?? 'No custom sound assigned'}
                </Text>
              </View>
            </View>
            <AppButton label="Assign Audio File" onPress={chooseSoundFile} />
            {selectedPad.customSoundUri ? (
              <AppButton
                label="Clear Custom Sound"
                variant="secondary"
                onPress={clearCustomSound}
              />
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
  landscapeGridScrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
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
  landscapeControllerBody: {
    minHeight: 0,
    padding: spacing.sm,
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
  landscapeControllerSurface: {
    minHeight: 0,
    padding: spacing.sm,
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
  landscapePad: {
    minHeight: 66,
    padding: spacing.sm,
    aspectRatio: 1.5,
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
  selectRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  selectLabel: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  selectValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  selectAction: {
    color: colors.cyan,
    fontSize: 12,
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
  modeSegments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modeSegment: {
    minHeight: 44,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
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
  customAudioPanel: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  customAudioGlyph: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  customAudioBar: {
    width: 30,
    height: 8,
    borderRadius: 4,
  },
  customAudioDot: {
    position: 'absolute',
    right: 9,
    bottom: 9,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.lime,
  },
  customAudioCopy: {
    flex: 1,
    minWidth: 0,
  },
  customAudioTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  customAudioBody: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});
