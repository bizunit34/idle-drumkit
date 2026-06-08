import { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { AppButton } from '../components/AppButton';
import { ModeSelectOverlay } from '../components/ModeSelectOverlay';
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
  target?: ScreenName;
  image?: ImageSourcePropType;
  imageKey?: string;
};

const slides: HomeSlide[] = [
  {
    title: 'Play a drum kit',
    body: 'Tap kick, snare, cymbals, and toms with a starter acoustic layout.',
    accent: colors.cyan,
    target: 'drumSet',
    image: drumSetSource,
    imageKey: 'home-carousel-drum-set',
  },
  {
    title: 'Use MIDI pads',
    body: 'Switch between 3x4 and 4x4 controller layouts with bright pad accents.',
    accent: colors.yellow,
    target: 'midiController',
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

const modeOptions = [
  {
    title: 'Drum Set',
    body: 'Classic starter kit with movable pieces and articulation controls.',
    screen: 'drumSet' as const,
    image: drumSetSource,
    imageKey: 'home-carousel-drum-set',
  },
  {
    title: 'MIDI Controller',
    body: 'Neon pad controller with editable labels, colors, and custom sounds.',
    screen: 'midiController' as const,
    image: midiPadsSource,
    imageKey: 'home-carousel-midi-pads',
  },
];

export function HomeScreen({ navigate }: Props) {
  const carouselRef = useRef<ScrollView>(null);
  const [showModes, setShowModes] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(1);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const { width } = useWindowDimensions();
  const compact = width < 720;
  const shouldShowMascot = !failedImages.mascot;

  const setImageFailed = (key: string) =>
    setFailedImages((current) => ({ ...current, [key]: true }));

  const scrollToSlide = (index: number) => {
    const wrappedIndex = (index + slides.length) % slides.length;
    setSlideIndex(wrappedIndex);
    carouselRef.current?.scrollTo({ x: wrappedIndex * carouselWidth, animated: true });
  };

  const onCarouselMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / carouselWidth);
    setSlideIndex(Math.max(0, Math.min(slides.length - 1, nextIndex)));
  };

  const onSlidePress = (slide: HomeSlide) => {
    if (slide.target) {
      navigate(slide.target);
      return;
    }
    setShowModes(true);
  };

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
                onError={() => setImageFailed('mascot')}
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
            <AppButton label="Start" variant="primary" onPress={() => setShowModes(true)} />
            <AppButton label="Settings" onPress={() => navigate('settings')} />
          </View>
        </View>
        <View
          style={styles.carousel}
          onLayout={(event) => setCarouselWidth(event.nativeEvent.layout.width)}
        >
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onCarouselMomentumEnd}
            scrollEventThrottle={16}
          >
            {slides.map((slide) => {
              const shouldShowSlideImage =
                slide.image && slide.imageKey ? !failedImages[slide.imageKey] : false;
              return (
                <Pressable
                  key={slide.title}
                  onPress={() => onSlidePress(slide)}
                  style={({ pressed }) => [
                    styles.slide,
                    { width: carouselWidth },
                    pressed && styles.cardPressed,
                  ]}
                >
                  <View style={[styles.slideArt, { borderColor: slide.accent }]}>
                    {shouldShowSlideImage ? (
                      <Image
                        source={slide.image}
                        resizeMode="contain"
                        accessibilityIgnoresInvertColors
                        onError={() => {
                          if (slide.imageKey) setImageFailed(slide.imageKey);
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
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.carouselControls}>
            <AppButton
              label="Prev"
              variant="secondary"
              onPress={() => scrollToSlide(slideIndex - 1)}
            />
            <View style={styles.dots}>
              {slides.map((item, index) => (
                <Pressable
                  key={item.title}
                  accessibilityRole="button"
                  onPress={() => scrollToSlide(index)}
                  style={[styles.dot, index === slideIndex && styles.activeDot]}
                />
              ))}
            </View>
            <AppButton
              label="Next"
              variant="secondary"
              onPress={() => scrollToSlide(slideIndex + 1)}
            />
          </View>
        </View>
      </View>
      <ModeSelectOverlay
        visible={showModes}
        failedImages={failedImages}
        options={modeOptions}
        onClose={() => setShowModes(false)}
        onNavigate={navigate}
        onImageError={setImageFailed}
      />
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
  cardPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  carousel: {
    flex: 1,
    minHeight: 300,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  slide: {
    justifyContent: 'center',
    padding: spacing.xl,
  },
  slideArt: {
    height: 148,
    borderRadius: radii.lg,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
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
  carouselControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: spacing.sm,
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
