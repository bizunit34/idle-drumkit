import {
  Image,
  Modal,
  Pressable,
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

  const openMode = (screen: ScreenName) => {
    onClose();
    onNavigate(screen);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, landscape && styles.landscapeSheet]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Start Playing</Text>
              <Text style={styles.title}>Choose a mode</Text>
            </View>
            <AppButton label="Close" variant="secondary" onPress={onClose} />
          </View>
          <View style={[styles.options, landscape && styles.landscapeOptions]}>
            {options.map((option) => {
              const showImage =
                option.image && option.imageKey ? !failedImages[option.imageKey] : false;
              return (
                <Pressable
                  key={option.title}
                  onPress={() => openMode(option.screen)}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
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
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.66)',
  },
  sheet: {
    maxHeight: '92%',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.backgroundAlt,
  },
  landscapeSheet: {
    alignSelf: 'center',
    width: '88%',
    maxWidth: 860,
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
  landscapeOptions: {
    flexDirection: 'row',
  },
  card: {
    flex: 1,
    minHeight: 210,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
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
