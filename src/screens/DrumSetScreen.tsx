import { useMemo, useState } from 'react';
import {
  Alert,
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
import { AppModalSheet } from '../components/AppModalSheet';
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
import {
  createDefaultPieceLayout,
  getOrientationKey,
  getResetProfile,
  resetOrientationLayout,
  resetPieceLayout,
  resolvePieceLayout,
  clampHitBoxScale,
  clampPieceScale,
} from '../data/drumLayoutProfiles';
import { colors, radii, spacing } from '../theme';
import { getResponsiveDrumScale } from '../utils/drumSizing';
import { clampDrumPiecePosition } from '../utils/layout';
import type {
  AppSettings,
  DrumArticulation,
  DrumAssetKey,
  DrumLayoutOrientation,
  DrumLayoutProfile,
  DrumLayoutProfileId,
  DrumPiece,
  DrumPieceId,
  DrumPieceLayout,
  SelectedDrumArticulations,
  SoundKey,
} from '../types';

type Props = {
  settings: AppSettings;
  activeProfileId: DrumLayoutProfileId;
  drumLayoutProfiles: Record<DrumLayoutProfileId, DrumLayoutProfile>;
  onBack: () => void;
  onPlaySound: (sound: SoundKey) => void;
  onChokeSound: (sound: SoundKey) => void;
  onSaveActiveProfile: (profileId: DrumLayoutProfileId) => void;
  onSaveLayoutProfiles: (profiles: Record<DrumLayoutProfileId, DrumLayoutProfile>) => void;
  onSaveSelectedArticulations: (articulations: SelectedDrumArticulations) => void;
  onNotify: (message: string) => void;
};

type BoardSize = {
  width: number;
  height: number;
};

type EditTarget = 'item' | 'hitBox' | 'both';

type ResizeCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

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
  activeProfileId,
  drumLayoutProfiles,
  onBack,
  onPlaySound,
  onChokeSound,
  onSaveActiveProfile,
  onSaveLayoutProfiles,
  onSaveSelectedArticulations,
  onNotify,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const activeProfile = drumLayoutProfiles[activeProfileId];
  const [draftLayout, setDraftLayout] = useState<{
    profileId: DrumLayoutProfileId;
    orientation: DrumLayoutOrientation;
    pieces: Partial<Record<DrumPieceId, DrumPieceLayout>>;
  } | null>(null);
  const [boardSize, setBoardSize] = useState<BoardSize>({ width: 1, height: 1 });
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [selectedPieceId, setSelectedPieceId] = useState<DrumPieceId>('hihat');
  const [selectedEditPieceId, setSelectedEditPieceId] = useState<DrumPieceId | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget>('both');
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const landscape = windowWidth > windowHeight;
  const orientation = getOrientationKey(windowWidth, windowHeight);

  const activeOrientationPieces =
    draftLayout?.profileId === activeProfileId && draftLayout.orientation === orientation
      ? draftLayout.pieces
      : activeProfile.layouts[orientation].pieces;

  const pieces = useMemo(
    () =>
      defaultDrumPieces
        .map((piece): DrumPiece => {
          const layout = activeOrientationPieces[piece.id] ?? createDefaultPieceLayout(piece.id);
          const responsiveScale = getResponsiveDrumScale(piece.id, landscape);
          const scaledPiece: DrumPiece = {
            ...piece,
            position: { x: layout.x, y: layout.y },
            size: {
              width: piece.size.width * layout.hitBoxScaleX * responsiveScale.hitBox.width,
              height: piece.size.height * layout.hitBoxScaleY * responsiveScale.hitBox.height,
            },
          };

          if (piece.defaultVisualSize) {
            scaledPiece.defaultVisualSize = {
              width:
                piece.defaultVisualSize.width * layout.visualScale * responsiveScale.visual.width,
              height:
                piece.defaultVisualSize.height * layout.visualScale * responsiveScale.visual.height,
            };
          }

          return scaledPiece;
        })
        .sort((left, right) => (left.zIndex ?? 0) - (right.zIndex ?? 0)),
    [activeOrientationPieces, landscape],
  );

  const persistProfilePatch = (patch: Partial<DrumLayoutProfile>) => {
    onSaveLayoutProfiles({
      ...drumLayoutProfiles,
      [activeProfileId]: {
        ...activeProfile,
        ...patch,
      },
    });
  };

  const persistOrientationPieces = (next: Partial<Record<DrumPieceId, DrumPieceLayout>>) => {
    setDraftLayout({ profileId: activeProfileId, orientation, pieces: next });
    persistProfilePatch({
      layouts: {
        ...activeProfile.layouts,
        [orientation]: { pieces: next },
      },
    });
  };

  const persistPieceLayout = (pieceId: DrumPieceId, next: DrumPieceLayout) => {
    persistOrientationPieces({ ...activeOrientationPieces, [pieceId]: next });
  };

  const resetLayout = () => {
    Alert.alert(
      'Reset current orientation?',
      `This resets ${activeProfile.label} ${orientation}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const nextProfile = resetOrientationLayout(activeProfile, orientation);
            onSaveLayoutProfiles({ ...drumLayoutProfiles, [activeProfileId]: nextProfile });
            setDraftLayout({ profileId: activeProfileId, orientation, pieces: {} });
            onNotify('Current orientation reset.');
          },
        },
      ],
    );
  };

  const resetSelectedPiece = () => {
    if (!selectedEditPieceId) return;
    Alert.alert(
      'Reset selected drum?',
      'This resets the selected drum in the current orientation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const nextProfile = resetPieceLayout(activeProfile, orientation, selectedEditPieceId);
            onSaveLayoutProfiles({ ...drumLayoutProfiles, [activeProfileId]: nextProfile });
            setDraftLayout({
              profileId: activeProfileId,
              orientation,
              pieces: nextProfile.layouts[orientation].pieces,
            });
            onNotify('Selected drum reset.');
          },
        },
      ],
    );
  };

  const resetEntireProfile = () => {
    Alert.alert('Reset entire profile?', `This resets all ${activeProfile.label} layouts.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          const nextProfile = getResetProfile(activeProfileId);
          onSaveLayoutProfiles({ ...drumLayoutProfiles, [activeProfileId]: nextProfile });
          setDraftLayout({ profileId: activeProfileId, orientation, pieces: {} });
          onNotify('Profile reset.');
        },
      },
    ]);
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

  const setDraftPieceLayout = (pieceId: DrumPieceId, next: DrumPieceLayout) => {
    setDraftLayout({
      profileId: activeProfileId,
      orientation,
      pieces: { ...activeOrientationPieces, [pieceId]: next },
    });
  };

  const clampLayoutPosition = (piece: DrumPiece, layout: DrumPieceLayout): DrumPieceLayout => {
    const nextPosition = clampDrumPiecePosition(
      { x: layout.x, y: layout.y },
      piece,
      boardSize.width,
      boardSize.height,
    );
    return { ...layout, x: nextPosition.x, y: nextPosition.y };
  };

  const resizeLayoutFromCorner = (
    piece: DrumPiece,
    layout: DrumPieceLayout,
    corner: ResizeCorner,
    dx: number,
    dy: number,
  ): DrumPieceLayout => {
    const horizontal = corner === 'topRight' || corner === 'bottomRight' ? dx : -dx;
    const vertical = corner === 'bottomLeft' || corner === 'bottomRight' ? dy : -dy;
    const next = { ...layout };

    if (editTarget === 'item' || editTarget === 'both') {
      const delta = (horizontal / boardSize.width + vertical / boardSize.height) * 1.6;
      next.visualScale = clampPieceScale(layout.visualScale + delta);
    }

    if (editTarget === 'hitBox' || editTarget === 'both') {
      next.hitBoxScaleX = clampHitBoxScale(
        layout.hitBoxScaleX + (horizontal / boardSize.width) * 3,
      );
      next.hitBoxScaleY = clampHitBoxScale(layout.hitBoxScaleY + (vertical / boardSize.height) * 3);
    }

    const widthRatio = next.hitBoxScaleX / Math.max(0.01, layout.hitBoxScaleX);
    const heightRatio = next.hitBoxScaleY / Math.max(0.01, layout.hitBoxScaleY);
    return clampLayoutPosition(
      {
        ...piece,
        size: {
          width: piece.size.width * widthRatio,
          height: piece.size.height * heightRatio,
        },
      },
      next,
    );
  };

  const activeSelectedPieceId = selectedEditPieceId ?? selectedPieceId;
  const selectedPiece = pieces.find((piece) => piece.id === activeSelectedPieceId) ?? pieces[0];
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

  const renderProfileControl = () => (
    <View style={styles.controlGroup}>
      <Text style={styles.controlGroupTitle}>Layout Profile</Text>
      <View style={styles.profileRow}>
        {Object.values(drumLayoutProfiles).map((profile) => (
          <Pressable
            key={profile.id}
            onPress={() => onSaveActiveProfile(profile.id)}
            style={[styles.profileChip, activeProfileId === profile.id && styles.activeProfileChip]}
          >
            <Text
              style={[
                styles.profileChipText,
                activeProfileId === profile.id && styles.activeProfileChipText,
              ]}
            >
              {profile.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderSizeControl = () => {
    if (!editMode || !selectedPiece) return null;
    const currentLayout = resolvePieceLayout(activeProfile, orientation, selectedPiece.id);
    return (
      <View style={styles.controlGroup}>
        <Text style={styles.controlGroupTitle}>Edit Target</Text>
        <View style={styles.profileRow}>
          {(['item', 'hitBox', 'both'] as EditTarget[]).map((target) => (
            <Pressable
              key={target}
              onPress={() => setEditTarget(target)}
              style={[styles.profileChip, editTarget === target && styles.activeProfileChip]}
            >
              <Text
                style={[
                  styles.profileChipText,
                  editTarget === target && styles.activeProfileChipText,
                ]}
              >
                {target === 'hitBox' ? 'Hit Box' : target === 'both' ? 'Both' : 'Item'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.controlHelp}>
          {selectedPiece.label}: item {Math.round(currentLayout.visualScale * 100)}%, hit box{' '}
          {Math.round(currentLayout.hitBoxScaleX * 100)}% x{' '}
          {Math.round(currentLayout.hitBoxScaleY * 100)}%
        </Text>
      </View>
    );
  };

  const renderControlsContent = () => (
    <>
      <View style={styles.controlGroup}>
        <Text style={styles.controlGroupTitle}>Layout</Text>
        <Text style={styles.controlHelp}>
          Editing {orientation === 'landscape' ? 'Landscape' : 'Portrait'} Layout
        </Text>
        <View style={styles.sizeButtons}>
          <AppButton
            label={editMode ? 'Done Editing' : 'Edit Layout'}
            variant={editMode ? 'primary' : 'secondary'}
            onPress={() => {
              setEditMode((value) => !value);
              setSelectedEditPieceId((value) => value ?? selectedPieceId);
            }}
          />
          <AppButton label="Reset Selected" variant="secondary" onPress={resetSelectedPiece} />
          <AppButton label="Reset Orientation" variant="danger" onPress={resetLayout} />
          <AppButton label="Reset Profile" variant="danger" onPress={resetEntireProfile} />
        </View>
      </View>
      {renderProfileControl()}
      {renderHiHatControl()}
      {renderPerformancePanel()}
      {renderSizeControl()}
      <View style={styles.controlGroup}>
        <Text style={styles.controlGroupTitle}>Hit Boxes</Text>
        <Text style={styles.controlHelp}>
          Use Settings to turn hit-box overlays on or off globally.
        </Text>
      </View>
    </>
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
      {editMode ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Deselect drum piece"
          onPress={() => setSelectedEditPieceId(null)}
          style={styles.stageDeselect}
        />
      ) : null}
      {pieces.map((piece) => {
        const pieceLayout = activeOrientationPieces[piece.id] ?? createDefaultPieceLayout(piece.id);
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
        const selectedInEdit = editMode && selectedEditPieceId === piece.id;
        const dragOrigin = pieceLayout;
        const hitBoxShape = piece.hitBoxShape ?? piece.shape;
        const panResponder = PanResponder.create({
          onStartShouldSetPanResponder: () => editMode,
          onMoveShouldSetPanResponder: () => editMode,
          onPanResponderTerminationRequest: () => false,
          onPanResponderGrant: () => {
            setSelectedEditPieceId(piece.id);
            setSelectedPieceId(piece.id);
          },
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
            setDraftPieceLayout(piece.id, { ...dragOrigin, ...nextPosition });
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
            persistPieceLayout(piece.id, { ...dragOrigin, ...nextPosition });
            onNotify('Drum layout saved.');
          },
        });
        const resizeResponders: Record<ResizeCorner, ReturnType<typeof PanResponder.create>> = {
          topLeft: PanResponder.create({
            onStartShouldSetPanResponder: () => selectedInEdit,
            onMoveShouldSetPanResponder: () => selectedInEdit,
            onPanResponderMove: (_, gesture) =>
              setDraftPieceLayout(
                piece.id,
                resizeLayoutFromCorner(piece, pieceLayout, 'topLeft', gesture.dx, gesture.dy),
              ),
            onPanResponderRelease: (_, gesture) => {
              persistPieceLayout(
                piece.id,
                resizeLayoutFromCorner(piece, pieceLayout, 'topLeft', gesture.dx, gesture.dy),
              );
              onNotify('Drum layout saved.');
            },
          }),
          topRight: PanResponder.create({
            onStartShouldSetPanResponder: () => selectedInEdit,
            onMoveShouldSetPanResponder: () => selectedInEdit,
            onPanResponderMove: (_, gesture) =>
              setDraftPieceLayout(
                piece.id,
                resizeLayoutFromCorner(piece, pieceLayout, 'topRight', gesture.dx, gesture.dy),
              ),
            onPanResponderRelease: (_, gesture) => {
              persistPieceLayout(
                piece.id,
                resizeLayoutFromCorner(piece, pieceLayout, 'topRight', gesture.dx, gesture.dy),
              );
              onNotify('Drum layout saved.');
            },
          }),
          bottomLeft: PanResponder.create({
            onStartShouldSetPanResponder: () => selectedInEdit,
            onMoveShouldSetPanResponder: () => selectedInEdit,
            onPanResponderMove: (_, gesture) =>
              setDraftPieceLayout(
                piece.id,
                resizeLayoutFromCorner(piece, pieceLayout, 'bottomLeft', gesture.dx, gesture.dy),
              ),
            onPanResponderRelease: (_, gesture) => {
              persistPieceLayout(
                piece.id,
                resizeLayoutFromCorner(piece, pieceLayout, 'bottomLeft', gesture.dx, gesture.dy),
              );
              onNotify('Drum layout saved.');
            },
          }),
          bottomRight: PanResponder.create({
            onStartShouldSetPanResponder: () => selectedInEdit,
            onMoveShouldSetPanResponder: () => selectedInEdit,
            onPanResponderMove: (_, gesture) =>
              setDraftPieceLayout(
                piece.id,
                resizeLayoutFromCorner(piece, pieceLayout, 'bottomRight', gesture.dx, gesture.dy),
              ),
            onPanResponderRelease: (_, gesture) => {
              persistPieceLayout(
                piece.id,
                resizeLayoutFromCorner(piece, pieceLayout, 'bottomRight', gesture.dx, gesture.dy),
              );
              onNotify('Drum layout saved.');
            },
          }),
        };

        const pieceContent = (
          <>
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
                  selectedInEdit ? styles.selectedHitBoxOverlay : null,
                  {
                    borderColor: selectedInEdit ? colors.cyan : piece.color,
                    backgroundColor: selectedInEdit ? `${colors.cyan}16` : `${piece.color}0D`,
                  },
                  editMode && styles.editing,
                ]}
              />
            ) : null}
            {selectedInEdit ? (
              <>
                <View pointerEvents="none" style={styles.selectedItemOutline} />
                <Text style={styles.selectedBadge}>
                  {piece.label} ·{' '}
                  {editTarget === 'hitBox' ? 'Hit Box' : editTarget === 'both' ? 'Both' : 'Item'}
                </Text>
                {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as ResizeCorner[]).map(
                  (corner) => (
                    <View
                      key={corner}
                      {...resizeResponders[corner].panHandlers}
                      style={[styles.resizeHandle, styles[corner]]}
                    >
                      <View style={styles.resizeHandleDot} />
                    </View>
                  ),
                )}
              </>
            ) : null}
            <Text style={styles.pieceLabel}>{piece.label}</Text>
          </>
        );

        const pieceStyle = [
          styles.piece,
          {
            width,
            height,
            left,
            top,
            zIndex: (piece.zIndex ?? 0) + (selectedInEdit ? 50 : 1),
          },
        ];

        if (editMode) {
          return (
            <View key={piece.id} {...panResponder.panHandlers} style={pieceStyle}>
              {pieceContent}
            </View>
          );
        }

        return (
          <Pressable
            key={piece.id}
            onPress={() => playPiece(piece)}
            style={({ pressed }) => [...pieceStyle, pressed && styles.hit]}
          >
            {pieceContent}
          </Pressable>
        );
      })}
    </View>
  );

  if (landscape) {
    return (
      <ScreenContainer>
        <View style={styles.landscapeShell}>
          <View style={styles.floatingHeader}>
            <AppButton label="Back" variant="secondary" onPress={onBack} />
            <AppButton label="Controls" variant="secondary" onPress={() => setControlsOpen(true)} />
          </View>
          {editMode ? (
            <View style={styles.landscapeEditHint}>
              <Text style={styles.hintText}>
                Tap to select. Drag body to move. Drag handles to resize.
              </Text>
            </View>
          ) : null}
          {renderStage()}
        </View>
        <AppModalSheet
          visible={controlsOpen}
          title="Drum Controls"
          presentation="playControls"
          onClose={() => setControlsOpen(false)}
        >
          {renderControlsContent()}
        </AppModalSheet>
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
        <AppButton label="Controls" variant="secondary" onPress={() => setControlsOpen(true)} />
      </View>
      {editMode ? (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Tap a drum to select it. Drag to move. Use handles to resize.
          </Text>
        </View>
      ) : null}
      {renderStage()}
      <AppModalSheet
        visible={controlsOpen}
        title="Drum Controls"
        presentation="playControls"
        onClose={() => setControlsOpen(false)}
      >
        {renderControlsContent()}
      </AppModalSheet>
      <AdBannerPlaceholder />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  landscapeShell: {
    flex: 1,
    padding: spacing.sm,
  },
  floatingHeader: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  landscapeEditHint: {
    position: 'absolute',
    top: spacing.md,
    left: 128,
    right: 128,
    zIndex: 18,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.electricBlue,
    backgroundColor: `${colors.electricBlue}18`,
  },
  controlGroup: {
    gap: spacing.sm,
  },
  controlGroupTitle: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  controlHelp: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  profileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  profileChip: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  activeProfileChip: {
    borderColor: colors.cyan,
    backgroundColor: `${colors.cyan}22`,
  },
  profileChipText: {
    color: colors.text,
    fontWeight: '800',
  },
  activeProfileChipText: {
    color: colors.cyan,
  },
  sizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  stageDeselect: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
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
  selectedHitBoxOverlay: {
    borderWidth: 2,
  },
  pieceImage: {
    position: 'absolute',
  },
  selectedItemOutline: {
    position: 'absolute',
    top: -5,
    right: -5,
    bottom: -5,
    left: -5,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.cyan,
    backgroundColor: `${colors.cyan}08`,
  },
  selectedBadge: {
    position: 'absolute',
    top: -26,
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    color: colors.black,
    backgroundColor: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
  },
  resizeHandle: {
    position: 'absolute',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 80,
  },
  resizeHandleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.black,
    backgroundColor: colors.cyan,
  },
  topLeft: {
    top: -24,
    left: -24,
  },
  topRight: {
    top: -24,
    right: -24,
  },
  bottomLeft: {
    bottom: -24,
    left: -24,
  },
  bottomRight: {
    right: -24,
    bottom: -24,
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
