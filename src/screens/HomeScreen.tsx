import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radii, spacing } from '../theme';
import type { ScreenName } from '../types';

type Props = {
  navigate: (screen: ScreenName) => void;
};

const mascotSource = require('../../assets/images/mascot-source.png') as ImageSourcePropType;
const drumSetSource =
  require('../../assets/images/home-carousel-drum-set.png') as ImageSourcePropType;
const midiPadsSource =
  require('../../assets/images/home-carousel-midi-pads.png') as ImageSourcePropType;
const customSoundsSource =
  require('../../assets/images/home-carousel-custom-sounds.png') as ImageSourcePropType;

type HomeSlide = {
  title: string;
  body: string;
  accent: string;
  image?: ImageSourcePropType;
  imageKey?: string;
};

const slides: HomeSlide[] = [
  {
    title: 'Play a drum kit',
    body: 'Tap kick, snare, cymbals, and toms with a starter acoustic layout.',
    accent: colors.cyan,
    image: drumSetSource,
    imageKey: 'home-carousel-drum-set',
  },
  {
    title: 'Use MIDI pads',
    body: 'Switch between 3x4 and 4x4 controller layouts with bright pad accents.',
    accent: colors.yellow,
    image: midiPadsSource,
    imageKey: 'home-carousel-midi-pads',
  },
  {
    title: 'Import your own sounds',
    body: 'Assign local audio files to pads and keep them available after reload.',
    accent: colors.violet,
    image: customSoundsSource,
    imageKey: 'home-carousel-custom-sounds',
  },
];

export function HomeScreen({ navigate }: Props) {
  const [showModes, setShowModes] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const { width } = useWindowDimensions();
  const compact = width < 720;
  const slide = slides[slideIndex] ?? {
    title: 'Drumkit',
    body: 'Tap into a compact kit or MIDI-style controller.',
    accent: colors.cyan,
  };
  const shouldShowSlideImage =
    slide.image && slide.imageKey ? !failedImages[slide.imageKey] : false;
  const shouldShowMascot = !failedImages.mascot;

  return (
    <ScreenContainer>
      <View style={[styles.container, compact && styles.compact]}>
        <View style={styles.leftPanel}>
          <View style={styles.mascotPlaceholder}>
            {shouldShowMascot ? (
              <Image
                source={mascotSource}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
                onError={() => setFailedImages((current) => ({ ...current, mascot: true }))}
                style={styles.mascotImage}
              />
            ) : (
              <>
                <View style={styles.mascotHead} />
                <View style={styles.mascotDrum} />
              </>
            )}
          </View>
          <Text style={styles.brand}>Drumkit</Text>
          <Text style={styles.subtitle}>Tap-ready drums for playing along anywhere.</Text>
          <View style={styles.actions}>
            <AppButton
              label={showModes ? 'Modes Open' : 'Start'}
              variant="primary"
              onPress={() => setShowModes((value) => !value)}
            />
            <AppButton label="Settings" onPress={() => navigate('settings')} />
          </View>
          {showModes && (
            <View style={styles.modeList}>
              <Pressable
                onPress={() => navigate('drumSet')}
                style={({ pressed }) => [styles.modeCard, pressed && styles.cardPressed]}
              >
                <Text style={styles.modeTitle}>Drum Set</Text>
                <Text style={styles.modeBody}>Classic kit layout with draggable pieces.</Text>
              </Pressable>
              <Pressable
                onPress={() => navigate('midiController')}
                style={({ pressed }) => [styles.modeCard, pressed && styles.cardPressed]}
              >
                <Text style={styles.modeTitle}>MIDI Controller</Text>
                <Text style={styles.modeBody}>Neon pad bank with editable labels and sounds.</Text>
              </Pressable>
            </View>
          )}
        </View>
        <View style={styles.carousel}>
          <View style={[styles.slideArt, { borderColor: slide.accent }]}>
            {shouldShowSlideImage ? (
              <Image
                source={slide.image}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
                onError={() => {
                  const imageKey = slide.imageKey;
                  if (imageKey) {
                    setFailedImages((current) => ({ ...current, [imageKey]: true }));
                  }
                }}
                style={styles.slideImage}
              />
            ) : (
              <>
                <View style={[styles.slidePad, { backgroundColor: `${slide.accent}33` }]} />
                <View style={[styles.slideDot, { backgroundColor: slide.accent }]} />
              </>
            )}
          </View>
          <Text style={[styles.carouselLabel, { color: slide.accent }]}>Alpha loop</Text>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideBody}>{slide.body}</Text>
          <View style={styles.dots}>
            {slides.map((item, index) => (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                onPress={() => setSlideIndex(index)}
                style={[styles.dot, index === slideIndex && styles.activeDot]}
              />
            ))}
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xl,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  compact: {
    flexDirection: 'column',
  },
  leftPanel: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 260,
  },
  mascotPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  mascotHead: {
    width: 34,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cyan,
  },
  mascotDrum: {
    width: 54,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.electricBlue,
    marginTop: -2,
  },
  mascotImage: {
    width: 86,
    height: 86,
  },
  brand: {
    color: colors.text,
    fontSize: 48,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 18,
    marginTop: spacing.sm,
    maxWidth: 420,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modeList: {
    gap: spacing.md,
    marginTop: spacing.lg,
    maxWidth: 360,
  },
  modeCard: {
    minHeight: 76,
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  cardPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  modeTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  modeBody: {
    color: colors.mutedText,
    fontSize: 13,
  },
  carousel: {
    flex: 1,
    minHeight: 280,
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  slideArt: {
    height: 96,
    borderRadius: radii.lg,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  slidePad: {
    width: 96,
    height: 52,
    borderRadius: radii.md,
  },
  slideDot: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  slideImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  carouselLabel: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  slideTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  slideBody: {
    color: colors.mutedText,
    fontSize: 17,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  activeDot: {
    backgroundColor: colors.cyan,
  },
});
