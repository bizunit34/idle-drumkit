import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors } from '../theme';

type Props = {
  compact?: boolean;
};

export function AdBannerPlaceholder({ compact = false }: Props) {
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  return (
    <View style={[styles.container, (compact || landscape) && styles.compact]}>
      <Text style={styles.text}>Ad banner placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    backgroundColor: colors.surfaceMuted,
  },
  compact: {
    minHeight: 48,
  },
  text: {
    color: colors.mutedText,
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
