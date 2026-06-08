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
  chokeDrumSound,
  configureDrumkitAudio,
  playDrumSound,
  releaseAudioPlayers,
} from './src/audio/audioService';
import { AppToast } from './src/components/AppToast';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { defaultMidiPads } from './src/data/midiPads';
import { DrumSetScreen } from './src/screens/DrumSetScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MidiControllerScreen } from './src/screens/MidiControllerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import {
  defaultSettings,
  loadAppState,
  resetAllAppData,
  saveDrumPositions,
  saveMidiGridSize,
  saveMidiPads,
  saveSettings,
} from './src/storage/appStorage';
import { colors } from './src/theme';
import type {
  AppSettings,
  MidiGridSize,
  MidiPad,
  Point,
  ScreenName,
  SelectedDrumArticulations,
  SoundKey,
} from './src/types';

function DrumkitApp() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [drumPositions, setDrumPositions] = useState<Record<string, Point>>({});
  const [midiGridSize, setMidiGridSize] = useState<MidiGridSize>('4x4');
  const [midiPads, setMidiPads] = useState<MidiPad[]>(defaultMidiPads);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadAppState()
      .then((state) => {
        if (!mounted) return;
        setSettings(state.settings);
        setDrumPositions(state.drumPositions);
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

  const persistDrumPositions = (next: Record<string, Point>) => {
    setDrumPositions(next);
    saveDrumPositions(next).catch(() => setNotice('Could not save drum layout.'));
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
              setDrumPositions(state.drumPositions);
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
          drumPositions={drumPositions}
          onBack={() => setScreen('home')}
          onPlaySound={(sound) => playSound(sound)}
          onChokeSound={chokeSound}
          onSavePositions={persistDrumPositions}
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
          onPlayPad={(pad) => playSound(pad.sound, pad.customSoundUri)}
          onSaveGridSize={persistMidiGridSize}
          onSavePads={persistMidiPads}
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

    return <HomeScreen navigate={setScreen} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderScreen()}
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
});
