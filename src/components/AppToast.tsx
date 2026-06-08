import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../theme';

type Props = {
  message: string | null;
};

export function AppToast({ message }: Props) {
  if (!message) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 16,
  },
  text: {
    color: colors.text,
    fontWeight: '800',
    textAlign: 'center',
  },
});
