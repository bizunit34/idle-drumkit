import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  children?: ReactNode;
};

export function AppButton({ label, onPress, variant = 'secondary', style, children }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, style]}
    >
      {children}
      <Text style={[styles.label, variant === 'primary' && styles.primaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  primary: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
  },
  danger: {
    backgroundColor: '#351822',
    borderColor: colors.danger,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  primaryLabel: {
    color: colors.black,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
