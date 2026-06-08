import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { VolumeSlider } from '../components/VolumeSlider';
import { colors, radii, spacing } from '../theme';
import type { AppSettings } from '../types';

type Props = {
  settings: AppSettings;
  onBack: () => void;
  onSaveSettings: (settings: AppSettings) => void;
  onResetAllData: () => void;
  onNotify: (message: string) => void;
};

export function SettingsScreen({
  settings,
  onBack,
  onSaveSettings,
  onResetAllData,
  onNotify,
}: Props) {
  const update = (patch: Partial<AppSettings>, message = 'Settings saved.') => {
    onSaveSettings({ ...settings, ...patch });
    onNotify(message);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Settings" subtitle="Global play and storage options" onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.row}>
          <VolumeSlider
            value={settings.masterVolume}
            onChange={(masterVolume) => onSaveSettings({ ...settings, masterVolume })}
            onSlidingComplete={(masterVolume) => update({ masterVolume }, 'Master volume saved.')}
          />
        </View>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Show Hit Boxes</Text>
            <Text style={styles.help}>Display visible outlines on playable regions.</Text>
          </View>
          <Switch
            value={settings.showHitBoxes}
            onValueChange={(showHitBoxes) => update({ showHitBoxes }, 'Hit box setting saved.')}
            trackColor={{ true: colors.cyan, false: colors.border }}
          />
        </View>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Low Latency Mode</Text>
            <Text style={styles.help}>
              Experimental. Keeps a warmer audio player pool where supported.
            </Text>
          </View>
          <Switch
            value={settings.lowLatencyMode}
            onValueChange={(lowLatencyMode) =>
              update({ lowLatencyMode }, 'Low latency setting saved.')
            }
            trackColor={{ true: colors.cyan, false: colors.border }}
          />
        </View>
        <View style={styles.dangerZone}>
          <Text style={styles.label}>Local Data</Text>
          <Text style={styles.help}>
            Reset settings, drum layout, MIDI pads, and imported custom sounds.
          </Text>
          <AppButton label="Reset All Local App Data" variant="danger" onPress={onResetAllData} />
        </View>
      </ScrollView>
      <AdBannerPlaceholder />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowText: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  help: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  dangerZone: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: '#241016',
  },
});
