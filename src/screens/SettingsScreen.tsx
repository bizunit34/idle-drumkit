import { StyleSheet, Switch, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
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
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Master Volume</Text>
            <Text style={styles.value}>{Math.round(settings.masterVolume * 100)}%</Text>
          </View>
          <View style={styles.volumeButtons}>
            <AppButton
              label="-"
              onPress={() =>
                update(
                  { masterVolume: Math.max(0, settings.masterVolume - 0.1) },
                  'Master volume saved.',
                )
              }
            />
            <AppButton
              label="+"
              onPress={() =>
                update(
                  { masterVolume: Math.min(1, settings.masterVolume + 0.1) },
                  'Master volume saved.',
                )
              }
            />
          </View>
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
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
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
  value: {
    color: colors.cyan,
    fontSize: 15,
    marginTop: spacing.xs,
  },
  help: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  volumeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
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
