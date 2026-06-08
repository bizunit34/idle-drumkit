import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  isAssetGroupLoaded,
  preloadAssetGroup,
  preloadModeAssetsInBackground,
} from './src/assets/preloadAssets';
import {
  chokeDrumSound,
  configureDrumkitAudio,
  playDrumSound,
  pressMidiPad,
  releaseAudioPlayers,
  releaseMidiPad,
} from './src/audio/audioService';
import { AppToast } from './src/components/AppToast';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { buildDefaultDrumLayoutProfiles } from './src/data/drumLayoutProfiles';
import { defaultMidiPads } from './src/data/midiPads';
import { DrumSetScreen } from './src/screens/DrumSetScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MidiControllerScreen } from './src/screens/MidiControllerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import {
  defaultSettings,
  loadAppState,
  resetAllAppData,
  saveActiveDrumProfile,
  saveDrumLayoutProfiles,
  saveMidiGridSize,
  saveMidiPads,
  saveSettings,
} from './src/storage/appStorage';
import { colors } from './src/theme';
import type {
  AppSettings,
  DrumLayoutProfile,
  DrumLayoutProfileId,
  MidiGridSize,
  MidiPad,
  ScreenName,
  SelectedDrumArticulations,
  SoundKey,
} from './src/types';

function DrumkitApp() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [activeDrumProfileId, setActiveDrumProfileId] = useState<DrumLayoutProfileId>('default');
  const [drumLayoutProfiles, setDrumLayoutProfiles] = useState<
    Record<DrumLayoutProfileId, DrumLayoutProfile>
  >(buildDefaultDrumLayoutProfiles);
  const [midiGridSize, setMidiGridSize] = useState<MidiGridSize>('4x4');
  const [midiPads, setMidiPads] = useState<MidiPad[]>(defaultMidiPads);
  const [loaded, setLoaded] = useState(false);
  const [modeLoading, setModeLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadAppState(), preloadAssetGroup('critical', 2200)])
      .then(([state]) => {
        if (!mounted) return;
        setSettings(state.settings);
        setActiveDrumProfileId(state.activeDrumProfileId);
        setDrumLayoutProfiles(state.drumLayoutProfiles);
        setMidiGridSize(state.midiGridSize);
        setMidiPads(state.midiPads);
      })
      .finally(() => {
        if (mounted) setLoaded(true);
      });
    return () => {
      mounted = false;
      releaseAudioPlayers();
    };
  }, []);

  useEffect(() => {
    configureDrumkitAudio(settings).catch(() => {
      setNotice('Audio setup failed. Sounds may still play.');
    });
  }, [settings]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(timeout);
  }, [notice]);

  const persistSettings = (next: AppSettings) => {
    setSettings(next);
    saveSettings(next).catch(() => setNotice('Could not save settings.'));
  };

  const persistActiveDrumProfile = (next: DrumLayoutProfileId) => {
    setActiveDrumProfileId(next);
    saveActiveDrumProfile(next).catch(() => setNotice('Could not save drum profile.'));
  };

  const persistDrumLayoutProfiles = (next: Record<DrumLayoutProfileId, DrumLayoutProfile>) => {
    setDrumLayoutProfiles(next);
    saveDrumLayoutProfiles(next).catch(() => setNotice('Could not save drum profile layout.'));
  };

  const persistMidiGridSize = (next: MidiGridSize) => {
    setMidiGridSize(next);
    saveMidiGridSize(next).catch(() => setNotice('Could not save grid size.'));
  };

  const persistMidiPads = (next: MidiPad[]) => {
    setMidiPads(next);
    saveMidiPads(next).catch(() => setNotice('Could not save pad edits.'));
  };

  const playSound = (sound: SoundKey, customSoundUri?: string) => {
    playDrumSound(sound, settings, customSoundUri)
      .then((result) => {
        if (!result.ok) setNotice(result.message);
      })
      .catch(() => setNotice('Sound failed to play.'));
  };

  const pressPad = (pad: MidiPad) => {
    pressMidiPad(pad, settings)
      .then((result) => {
        if (!result.ok) setNotice(result.message);
      })
      .catch(() => setNotice('Pad failed to play.'));
  };

  const releasePad = (pad: MidiPad) => {
    releaseMidiPad(pad).catch(() => setNotice('Could not stop pad.'));
  };

  const chokeSound = (sound: SoundKey) => {
    chokeDrumSound(sound).catch(() => setNotice('Could not choke sound.'));
  };

  const resetAll = () => {
    Alert.alert('Reset local data?', 'This restores settings, drum layout, and MIDI pads.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetAllAppData()
            .then((state) => {
              setSettings(state.settings);
              setActiveDrumProfileId(state.activeDrumProfileId);
              setDrumLayoutProfiles(state.drumLayoutProfiles);
              setMidiGridSize(state.midiGridSize);
              setMidiPads(state.midiPads);
              setScreen('home');
              setNotice('Local app data reset.');
            })
            .catch(() => setNotice('Could not reset local data.'));
        },
      },
    ]);
  };

  const navigate = (next: ScreenName) => {
    if (next !== 'drumSet' && next !== 'midiController') {
      setScreen(next);
      return;
    }

    const group = next === 'drumSet' ? 'drumSet' : 'midiController';
    if (!isAssetGroupLoaded(group)) {
      setModeLoading(next === 'drumSet' ? 'Loading drum kit...' : 'Loading MIDI controller...');
    }

    preloadAssetGroup(group, 1200)
      .catch(() => undefined)
      .finally(() => {
        setScreen(next);
        setModeLoading(null);
      });
  };

  const renderScreen = () => {
    if (!loaded) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.cyan} />
          <Text style={styles.loadingText}>Loading Drumkit</Text>
        </View>
      );
    }

    if (screen === 'drumSet') {
      return (
        <DrumSetScreen
          settings={settings}
          activeProfileId={activeDrumProfileId}
          drumLayoutProfiles={drumLayoutProfiles}
          onBack={() => setScreen('home')}
          onPlaySound={(sound) => playSound(sound)}
          onChokeSound={chokeSound}
          onSaveActiveProfile={persistActiveDrumProfile}
          onSaveLayoutProfiles={persistDrumLayoutProfiles}
          onSaveSelectedArticulations={(selectedDrumArticulations: SelectedDrumArticulations) => {
            persistSettings({ ...settings, selectedDrumArticulations });
          }}
          onNotify={setNotice}
        />
      );
    }

    if (screen === 'midiController') {
      return (
        <MidiControllerScreen
          settings={settings}
          gridSize={midiGridSize}
          pads={midiPads}
          onBack={() => setScreen('home')}
          onPressPad={pressPad}
          onReleasePad={releasePad}
          onSaveGridSize={persistMidiGridSize}
          onSavePads={persistMidiPads}
          onSaveSettings={persistSettings}
          onNotify={setNotice}
        />
      );
    }

    if (screen === 'settings') {
      return (
        <SettingsScreen
          settings={settings}
          onBack={() => setScreen('home')}
          onSaveSettings={persistSettings}
          onResetAllData={resetAll}
          onNotify={setNotice}
        />
      );
    }

    return <HomeScreen navigate={navigate} onWarmModeAssets={preloadModeAssetsInBackground} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderScreen()}
      {modeLoading ? (
        <View style={styles.modeLoading}>
          <ActivityIndicator color={colors.cyan} />
          <Text style={styles.loadingText}>{modeLoading}</Text>
        </View>
      ) : null}
      <AppToast message={notice} />
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DrumkitApp />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (NativeStatusBar.currentHeight ?? 0) : 0,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.text,
    fontWeight: '700',
  },
  modeLoading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 7, 10, 0.74)',
  },
});
