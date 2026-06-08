import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function AdBannerPlaceholder() {
  return (
    <View style={styles.container}>
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
  text: {
    color: colors.mutedText,
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
