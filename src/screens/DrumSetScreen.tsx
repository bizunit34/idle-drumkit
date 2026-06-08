import { useMemo, useState } from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { drumAssets } from '../data/drumAssets';
import { defaultDrumPieces } from '../data/drumKit';
import { colors, radii, spacing } from '../theme';
import { clampDrumPiecePosition } from '../utils/layout';
import type { AppSettings, HiHatArticulation, Point, SoundKey } from '../types';

type Props = {
  settings: AppSettings;
  drumPositions: Record<string, Point>;
  onBack: () => void;
  onPlaySound: (sound: SoundKey) => void;
  onSavePositions: (positions: Record<string, Point>) => void;
  onSetHiHatArticulation: (articulation: HiHatArticulation) => void;
  onNotify: (message: string) => void;
};

type BoardSize = {
  width: number;
  height: number;
};

export function DrumSetScreen({
  settings,
  drumPositions,
  onBack,
  onPlaySound,
  onSavePositions,
  onSetHiHatArticulation,
  onNotify,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [positions, setPositions] = useState<Record<string, Point>>(drumPositions);
  const [boardSize, setBoardSize] = useState<BoardSize>({ width: 1, height: 1 });
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const pieces = useMemo(
    () =>
      defaultDrumPieces
        .map((piece) => ({
          ...piece,
          position: positions[piece.id] ?? piece.position,
        }))
        .sort((left, right) => (left.zIndex ?? 0) - (right.zIndex ?? 0)),
    [positions],
  );

  const persistPositions = (next: Record<string, Point>) => {
    setPositions(next);
    onSavePositions(next);
  };

  const resetLayout = () => {
    persistPositions({});
    onNotify('Drum layout reset.');
  };

  const onBoardLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBoardSize({ width, height });
  };

  const playPiece = (pieceId: string, sound: SoundKey) => {
    if (pieceId === 'hihat') {
      onPlaySound(settings.hiHatArticulation === 'open' ? 'openHihat' : 'closedHihat');
      return;
    }

    onPlaySound(sound);
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Drum Set"
        subtitle={editMode ? 'Drag pieces to arrange your kit' : 'Tap a piece to play'}
        onBack={onBack}
      />
      <View style={styles.toolbar}>
        <AppButton
          label={editMode ? 'Done Editing' : 'Edit Layout'}
          variant={editMode ? 'primary' : 'secondary'}
          onPress={() => setEditMode((value) => !value)}
        />
        <AppButton label="Reset Layout" variant="danger" onPress={resetLayout} />
        <View style={styles.articulationControl}>
          <Text style={styles.articulationLabel}>Hi-hat</Text>
          <View style={styles.segmented}>
            <Pressable
              onPress={() => onSetHiHatArticulation('closed')}
              style={[
                styles.segment,
                settings.hiHatArticulation === 'closed' && styles.activeSegment,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  settings.hiHatArticulation === 'closed' && styles.activeSegmentText,
                ]}
              >
                Closed
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onSetHiHatArticulation('open')}
              style={[
                styles.segment,
                settings.hiHatArticulation === 'open' && styles.activeSegment,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  settings.hiHatArticulation === 'open' && styles.activeSegmentText,
                ]}
              >
                Open
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      {editMode ? (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Edit mode is on. Drag pieces; taps will not play sounds.
          </Text>
        </View>
      ) : null}
      <View style={styles.stage} onLayout={onBoardLayout}>
        {pieces.map((piece) => {
          const asset = piece.imageAssetKey ? drumAssets[piece.imageAssetKey] : undefined;
          const imageSource = piece.imageSource ?? asset?.source;
          const imageKey = piece.imageAssetKey ?? piece.id;
          const resolvedImageSource =
            imageSource && !failedImages[imageKey] ? imageSource : undefined;
          const visualSize = piece.defaultVisualSize ?? asset?.defaultVisualSize ?? piece.size;
          const visualWidth = visualSize.width * boardSize.width;
          const visualHeight = visualSize.height * boardSize.height;
          const width = piece.size.width * boardSize.width;
          const height = piece.size.height * boardSize.height;
          const left = piece.position.x * boardSize.width - width / 2;
          const top = piece.position.y * boardSize.height - height / 2;
          const dragOrigin = piece.position;
          const hitBoxShape = piece.hitBoxShape ?? piece.shape;
          const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => editMode,
            onMoveShouldSetPanResponder: () => editMode,
            onPanResponderTerminationRequest: () => false,
            onPanResponderMove: (_, gesture) => {
              const nextPosition = clampDrumPiecePosition(
                {
                  x: dragOrigin.x + gesture.dx / boardSize.width,
                  y: dragOrigin.y + gesture.dy / boardSize.height,
                },
                piece,
                boardSize.width,
                boardSize.height,
              );
              setPositions((current) => ({ ...current, [piece.id]: nextPosition }));
            },
            onPanResponderRelease: (_, gesture) => {
              const nextPosition = clampDrumPiecePosition(
                {
                  x: dragOrigin.x + gesture.dx / boardSize.width,
                  y: dragOrigin.y + gesture.dy / boardSize.height,
                },
                piece,
                boardSize.width,
                boardSize.height,
              );
              persistPositions({ ...positions, [piece.id]: nextPosition });
              onNotify('Drum layout saved.');
            },
          });

          return (
            <Pressable
              key={piece.id}
              {...panResponder.panHandlers}
              onPress={() => {
                if (!editMode) playPiece(piece.id, piece.sound);
              }}
              style={({ pressed }) => [
                styles.piece,
                {
                  width,
                  height,
                  left,
                  top,
                  zIndex: piece.zIndex ?? 0,
                },
                pressed && !editMode && styles.hit,
              ]}
            >
              {resolvedImageSource ? (
                <Image
                  source={resolvedImageSource}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                  onError={() => setFailedImages((current) => ({ ...current, [imageKey]: true }))}
                  style={[
                    styles.pieceImage,
                    {
                      width: visualWidth,
                      height: visualHeight,
                      left: (width - visualWidth) / 2,
                      top: (height - visualHeight) / 2,
                    },
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.fallbackVisual,
                    hitBoxShape === 'circle' && styles.circle,
                    hitBoxShape === 'oval' && styles.oval,
                    {
                      borderColor: settings.showHitBoxes || editMode ? piece.color : 'transparent',
                      backgroundColor:
                        settings.showHitBoxes || editMode ? `${piece.color}36` : `${piece.color}1D`,
                    },
                    editMode && styles.editing,
                  ]}
                />
              )}
              {resolvedImageSource && (settings.showHitBoxes || editMode) ? (
                <View
                  pointerEvents="none"
                  style={[
                    styles.hitBoxOverlay,
                    hitBoxShape === 'circle' && styles.circle,
                    hitBoxShape === 'oval' && styles.oval,
                    {
                      borderColor: piece.color,
                      backgroundColor: `${piece.color}16`,
                    },
                    editMode && styles.editing,
                  ]}
                />
              ) : null}
              <Text style={styles.pieceLabel}>{piece.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <AdBannerPlaceholder />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    backgroundColor: colors.backgroundAlt,
  },
  articulationControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: 'auto',
  },
  articulationLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  segmented: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segment: {
    minHeight: 40,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  activeSegment: {
    backgroundColor: colors.cyan,
  },
  segmentText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  activeSegmentText: {
    color: colors.black,
  },
  hint: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.electricBlue,
    backgroundColor: `${colors.electricBlue}18`,
  },
  hintText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  stage: {
    flex: 1,
    margin: spacing.md,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#0B0D12',
  },
  piece: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    minHeight: 54,
  },
  fallbackVisual: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 2,
  },
  hitBoxOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 2,
  },
  pieceImage: {
    position: 'absolute',
  },
  circle: {
    borderRadius: 999,
  },
  oval: {
    borderRadius: 999,
    transform: [{ rotate: '-8deg' }],
  },
  pieceLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: colors.black,
    textShadowRadius: 4,
  },
  hit: {
    transform: [{ scale: 0.95 }],
  },
  editing: {
    borderStyle: 'dashed',
  },
});
