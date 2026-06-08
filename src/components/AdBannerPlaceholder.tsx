import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  compact?: boolean;
};

export function AdBannerPlaceholder({ compact = false }: Props) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Text style={styles.text}>Ad banner placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    backgroundColor: colors.surfaceMuted,
  },
  compact: {
    height: 34,
  },
  text: {
    color: colors.mutedText,
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
