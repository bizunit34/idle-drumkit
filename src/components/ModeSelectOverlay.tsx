import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import { AppButton } from './AppButton';
import { colors, radii, spacing } from '../theme';
import type { ScreenName } from '../types';

type ModeOption = {
  title: string;
  body: string;
  screen: ScreenName;
  image?: ImageSourcePropType;
  imageKey?: string;
};

type Props = {
  visible: boolean;
  failedImages: Record<string, boolean>;
  onClose: () => void;
  onNavigate: (screen: ScreenName) => void;
  onImageError: (key: string) => void;
  options: ModeOption[];
};

export function ModeSelectOverlay({
  visible,
  failedImages,
  onClose,
  onNavigate,
  onImageError,
  options,
}: Props) {
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const panelWidth = Math.min(width - spacing.lg * 2, landscape ? 860 : 520);
  const sideBySide = landscape && panelWidth >= 680;

  const openMode = (screen: ScreenName) => {
    onClose();
    onNavigate(screen);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: height - spacing.lg * 2, width: panelWidth }]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Start Playing</Text>
              <Text style={styles.title}>Choose a mode</Text>
            </View>
            <AppButton label="Close" variant="secondary" onPress={onClose} />
          </View>
          <ScrollView
            style={styles.scroller}
            contentContainerStyle={[styles.options, sideBySide && styles.landscapeOptions]}
          >
            {options.map((option) => {
              const showImage =
                option.image && option.imageKey ? !failedImages[option.imageKey] : false;
              return (
                <Pressable
                  key={option.title}
                  accessibilityRole="button"
                  onPress={() => openMode(option.screen)}
                  style={({ pressed }) => [
                    styles.card,
                    sideBySide && styles.landscapeCard,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <View style={styles.imageFrame}>
                    {showImage ? (
                      <Image
                        source={option.image}
                        resizeMode="contain"
                        accessibilityIgnoresInvertColors
                        onError={() => {
                          if (option.imageKey) onImageError(option.imageKey);
                        }}
                        style={styles.image}
                      />
                    ) : (
                      <View style={styles.imageFallback} />
                    )}
                  </View>
                  <Text style={styles.cardTitle}>{option.title}</Text>
                  <Text style={styles.cardBody}>{option.body}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.66)',
  },
  sheet: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.backgroundAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  options: {
    gap: spacing.md,
  },
  scroller: {
    flexShrink: 1,
  },
  landscapeOptions: {
    flexDirection: 'row',
  },
  card: {
    minHeight: 188,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  landscapeCard: {
    flex: 1,
    minHeight: 196,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  imageFrame: {
    height: 104,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: `${colors.cyan}24`,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  cardBody: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
});
