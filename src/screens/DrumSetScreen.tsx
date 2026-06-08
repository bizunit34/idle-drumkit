import { useMemo, useState } from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  getArticulationConfig,
  getChokedSounds,
  resolveSelectedArticulation,
} from '../data/drumArticulations';
import { drumAssets } from '../data/drumAssets';
import { defaultDrumPieces } from '../data/drumKit';
import { colors, radii, spacing } from '../theme';
import { clampDrumPiecePosition } from '../utils/layout';
import type {
  AppSettings,
  DrumArticulation,
  DrumAssetKey,
  DrumPiece,
  DrumPieceId,
  Point,
  SelectedDrumArticulations,
  SoundKey,
} from '../types';

type Props = {
  settings: AppSettings;
  drumPositions: Record<string, Point>;
  onBack: () => void;
  onPlaySound: (sound: SoundKey) => void;
  onChokeSound: (sound: SoundKey) => void;
  onSavePositions: (positions: Record<string, Point>) => void;
  onSaveSelectedArticulations: (articulations: SelectedDrumArticulations) => void;
  onNotify: (message: string) => void;
};

type BoardSize = {
  width: number;
  height: number;
};

type ResolvedImage = {
  key: string;
  source: NonNullable<DrumPiece['imageSource']>;
  defaultVisualSize: {
    width: number;
    height: number;
  };
};

const getImageCandidate = (
  imageKey: DrumAssetKey | undefined,
  failedImages: Record<string, boolean>,
): ResolvedImage | undefined => {
  if (!imageKey || failedImages[imageKey]) return undefined;
  const asset = drumAssets[imageKey];
  if (!asset.source) return undefined;
  return {
    key: imageKey,
    source: asset.source,
    defaultVisualSize: asset.defaultVisualSize,
  };
};

const resolvePieceImage = (
  piece: DrumPiece,
  articulation: DrumArticulation,
  failedImages: Record<string, boolean>,
): ResolvedImage | undefined => {
  const articulationImage = getImageCandidate(articulation.imageAssetKey, failedImages);
  if (articulationImage) return articulationImage;

  const pieceImage = getImageCandidate(piece.imageAssetKey, failedImages);
  if (pieceImage) return pieceImage;

  if (!piece.imageSource || failedImages[piece.id]) return undefined;
  return {
    key: piece.id,
    source: piece.imageSource,
    defaultVisualSize: piece.defaultVisualSize ?? piece.size,
  };
};

export function DrumSetScreen({
  settings,
  drumPositions,
  onBack,
  onPlaySound,
  onChokeSound,
  onSavePositions,
  onSaveSelectedArticulations,
  onNotify,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [positions, setPositions] = useState<Record<string, Point>>(drumPositions);
  const [boardSize, setBoardSize] = useState<BoardSize>({ width: 1, height: 1 });
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [selectedPieceId, setSelectedPieceId] = useState<DrumPieceId>('hihat');
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const landscape = windowWidth > windowHeight;

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

  const saveSelectedArticulation = (pieceId: DrumPieceId, articulation: DrumArticulation) => {
    if (articulation.actionOnly) return;
    onSaveSelectedArticulations({
      ...settings.selectedDrumArticulations,
      [pieceId]: articulation.id,
    });
    onNotify(
      `${defaultDrumPieces.find((piece) => piece.id === pieceId)?.label ?? 'Piece'} set to ${
        articulation.label
      }.`,
    );
  };

  const chokeArticulation = (articulation: DrumArticulation) => {
    for (const sound of getChokedSounds(articulation)) {
      onChokeSound(sound);
    }
    onNotify(`${articulation.label} sent.`);
  };

  const playPiece = (piece: DrumPiece) => {
    const articulation = resolveSelectedArticulation(piece.id, settings.selectedDrumArticulations);
    setSelectedPieceId(piece.id);
    if (!articulation.sound) return;
    onPlaySound(articulation.sound);
  };

  const selectedPiece = pieces.find((piece) => piece.id === selectedPieceId) ?? pieces[0];
  const selectedConfig = selectedPiece ? getArticulationConfig(selectedPiece.id) : undefined;
  const selectedArticulation = selectedPiece
    ? resolveSelectedArticulation(selectedPiece.id, settings.selectedDrumArticulations)
    : undefined;
  const hiHatArticulation = resolveSelectedArticulation(
    'hihat',
    settings.selectedDrumArticulations,
  );
  const hiHatConfig = getArticulationConfig('hihat');

  const renderHiHatControl = () => (
    <View style={styles.articulationControl}>
      <Text style={styles.articulationLabel}>Hi-hat</Text>
      <View style={styles.segmented}>
        {hiHatConfig.articulations
          .filter((articulation) => !articulation.actionOnly)
          .map((articulation) => (
            <Pressable
              key={articulation.id}
              onPress={() => saveSelectedArticulation('hihat', articulation)}
              style={[
                styles.segment,
                hiHatArticulation.id === articulation.id && styles.activeSegment,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  hiHatArticulation.id === articulation.id && styles.activeSegmentText,
                ]}
              >
                {articulation.shortLabel ?? articulation.label}
              </Text>
            </Pressable>
          ))}
      </View>
    </View>
  );

  const renderPerformancePanel = () =>
    selectedConfig && selectedPiece && selectedArticulation ? (
      <View style={[styles.performancePanel, landscape && styles.landscapePerformancePanel]}>
        <View style={styles.performanceHeader}>
          <Text style={styles.performanceTitle}>Articulation</Text>
          <Text style={styles.performanceSubtitle}>
            {selectedPiece.label}: {selectedArticulation.label}
          </Text>
        </View>
        <View style={styles.articulationChoices}>
          {selectedConfig.articulations.map((articulation) => {
            const active = selectedArticulation.id === articulation.id;
            return (
              <Pressable
                key={articulation.id}
                onPress={() =>
                  articulation.actionOnly
                    ? chokeArticulation(articulation)
                    : saveSelectedArticulation(selectedConfig.pieceId, articulation)
                }
                style={[
                  styles.articulationChoice,
                  active && !articulation.actionOnly && styles.activeArticulationChoice,
                  articulation.actionOnly && styles.actionArticulationChoice,
                ]}
              >
                <Text
                  style={[
                    styles.articulationChoiceText,
                    active && !articulation.actionOnly && styles.activeArticulationChoiceText,
                  ]}
                >
                  {articulation.shortLabel ?? articulation.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    ) : null;

  const renderStage = () => (
    <View style={[styles.stage, landscape && styles.landscapeStage]} onLayout={onBoardLayout}>
      {pieces.map((piece) => {
        const articulation = resolveSelectedArticulation(
          piece.id,
          settings.selectedDrumArticulations,
        );
        const resolvedImage = resolvePieceImage(piece, articulation, failedImages);
        const visualSize =
          resolvedImage?.defaultVisualSize ?? piece.defaultVisualSize ?? piece.size;
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
              if (!editMode) playPiece(piece);
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
            {resolvedImage ? (
              <Image
                source={resolvedImage.source}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
                onError={() =>
                  setFailedImages((current) => ({ ...current, [resolvedImage.key]: true }))
                }
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
                      settings.showHitBoxes || editMode ? `${piece.color}24` : `${piece.color}14`,
                  },
                  editMode && styles.editing,
                ]}
              />
            )}
            {resolvedImage && (settings.showHitBoxes || editMode) ? (
              <View
                pointerEvents="none"
                style={[
                  styles.hitBoxOverlay,
                  hitBoxShape === 'circle' && styles.circle,
                  hitBoxShape === 'oval' && styles.oval,
                  {
                    borderColor: piece.color,
                    backgroundColor: `${piece.color}0D`,
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
  );

  if (landscape) {
    return (
      <ScreenContainer>
        <View style={styles.landscapeShell}>
          {renderStage()}
          <View style={styles.sideRail}>
            <View style={styles.sideHeader}>
              <AppButton label="Back" variant="secondary" onPress={onBack} />
              <View style={styles.sideTitleBlock}>
                <Text style={styles.sideTitle}>Drum Set</Text>
                <Text style={styles.sideSubtitle}>{editMode ? 'Drag pieces' : 'Tap to play'}</Text>
              </View>
            </View>
            <View style={styles.sideActions}>
              <AppButton
                label={editMode ? 'Done' : 'Edit'}
                variant={editMode ? 'primary' : 'secondary'}
                onPress={() => setEditMode((value) => !value)}
              />
              <AppButton label="Reset" variant="danger" onPress={resetLayout} />
            </View>
            {renderHiHatControl()}
            {renderPerformancePanel()}
            {editMode ? (
              <View style={styles.hint}>
                <Text style={styles.hintText}>Drag pieces; taps will not play.</Text>
              </View>
            ) : null}
          </View>
        </View>
        <AdBannerPlaceholder compact />
      </ScreenContainer>
    );
  }

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
        {renderHiHatControl()}
      </View>
      {renderPerformancePanel()}
      {editMode ? (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Edit mode is on. Drag pieces; taps will not play sounds.
          </Text>
        </View>
      ) : null}
      {renderStage()}
      <AdBannerPlaceholder />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  landscapeShell: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  sideRail: {
    width: 270,
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  sideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sideTitleBlock: {
    flex: 1,
  },
  sideTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  sideSubtitle: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 2,
  },
  sideActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
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
    flexWrap: 'wrap',
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
  performancePanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  landscapePerformancePanel: {
    marginHorizontal: 0,
    marginTop: 0,
    padding: spacing.sm,
  },
  performanceHeader: {
    minWidth: 136,
  },
  performanceTitle: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  performanceSubtitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  articulationChoices: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  articulationChoice: {
    minHeight: 36,
    minWidth: 66,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  activeArticulationChoice: {
    borderColor: colors.cyan,
    backgroundColor: `${colors.cyan}22`,
  },
  actionArticulationChoice: {
    borderColor: colors.yellow,
    backgroundColor: `${colors.yellow}18`,
  },
  articulationChoiceText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  activeArticulationChoiceText: {
    color: colors.cyan,
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
  landscapeStage: {
    margin: 0,
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
    borderWidth: 1,
  },
  hitBoxOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 1,
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
