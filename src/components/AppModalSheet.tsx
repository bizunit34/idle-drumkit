import type { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { AppButton } from './AppButton';
import { colors, radii, spacing } from '../theme';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  presentation?: 'center' | 'playControls';
};

export function AppModalSheet({
  visible,
  title,
  onClose,
  children,
  presentation = 'center',
}: Props) {
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const playControls = presentation === 'playControls';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={[
          styles.backdrop,
          playControls && !landscape && styles.bottomBackdrop,
          playControls && landscape && styles.sideBackdrop,
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            playControls && !landscape && styles.bottomSheet,
            playControls && landscape && styles.sideSheet,
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <AppButton label="Close" variant="secondary" onPress={onClose} />
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.66)',
  },
  bottomBackdrop: {
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    padding: spacing.md,
  },
  sideBackdrop: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: spacing.md,
  },
  sheet: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '90%',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.backgroundAlt,
  },
  bottomSheet: {
    maxWidth: '100%',
    maxHeight: '78%',
  },
  sideSheet: {
    width: 340,
    maxHeight: '96%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  scroll: {
    maxHeight: '100%',
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
