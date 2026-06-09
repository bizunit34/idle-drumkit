const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildDefaultDrumLayoutProfiles,
  getOrientationKey,
  clampPieceScale,
  clampHitBoxScale,
  resizePieceLayoutFromCorner,
  resetOrientationLayout,
  resetPieceLayout,
  validateDrumLayoutProfileId,
  validateDrumLayoutProfiles,
} = require('../.qa-test-build/src/data/drumLayoutProfiles');
const { clampSliderValue, positionToSliderValue } = require('../.qa-test-build/src/utils/slider');

test('volume slider helpers clamp values and map positions', () => {
  assert.equal(clampSliderValue(-1), 0);
  assert.equal(clampSliderValue(2), 1);
  assert.equal(positionToSliderValue(50, 200), 0.25);
  assert.equal(positionToSliderValue(300, 200), 1);
  assert.equal(positionToSliderValue(10, 0), 0);
});

test('drum profile defaults include two custom layout slots', () => {
  const profiles = buildDefaultDrumLayoutProfiles();

  assert.deepEqual(Object.keys(profiles), ['default', 'custom1', 'custom2']);
  assert.deepEqual(Object.keys(profiles.custom1.layouts), ['portrait', 'landscape']);
  assert.deepEqual(profiles.custom1.layouts.portrait.pieces, {});
  assert.deepEqual(profiles.custom1.layouts.landscape.pieces, {});
});

test('drum profile validation migrates old positions into both orientations', () => {
  const profiles = validateDrumLayoutProfiles({}, { kick: { x: 0.2, y: 0.8 } });

  assert.equal(profiles.custom1.layouts.portrait.pieces.kick.x, 0.2);
  assert.equal(profiles.custom1.layouts.portrait.pieces.kick.y, 0.8);
  assert.equal(profiles.custom1.layouts.landscape.pieces.kick.x, 0.2);
  assert.equal(profiles.custom1.layouts.landscape.pieces.kick.y, 0.8);
});

test('drum profile validation keeps portrait and landscape layouts separate', () => {
  const profiles = validateDrumLayoutProfiles(
    {
      custom2: {
        layouts: {
          portrait: {
            pieces: {
              kick: {
                x: -2,
                y: 4,
                visualScale: 5,
                hitBoxScaleX: 0.1,
                hitBoxScaleY: 4,
              },
              nope: { x: 0.5, y: 0.5 },
            },
          },
          landscape: {
            pieces: {
              snare: {
                x: 0.3,
                y: 0.4,
                visualScale: 1.2,
                hitBoxScaleX: 1.3,
                hitBoxScaleY: 1.4,
              },
            },
          },
        },
      },
    },
    {},
  );

  assert.equal(validateDrumLayoutProfileId('missing'), 'default');
  assert.equal(clampPieceScale(5), 1.65);
  assert.equal(clampPieceScale(0.1), 0.72);
  assert.equal(clampHitBoxScale(5), 1.9);
  assert.equal(clampHitBoxScale(0.1), 0.6);
  assert.equal(profiles.custom2.layouts.portrait.pieces.kick.x, 0);
  assert.equal(profiles.custom2.layouts.portrait.pieces.kick.y, 1);
  assert.equal(profiles.custom2.layouts.portrait.pieces.kick.visualScale, 1.65);
  assert.equal(profiles.custom2.layouts.portrait.pieces.kick.hitBoxScaleX, 0.6);
  assert.equal(profiles.custom2.layouts.portrait.pieces.kick.hitBoxScaleY, 1.9);
  assert.equal(profiles.custom2.layouts.landscape.pieces.snare.x, 0.3);
  assert.equal(profiles.custom2.layouts.landscape.pieces.snare.hitBoxScaleY, 1.4);
  assert.equal(profiles.custom2.layouts.portrait.pieces.snare, undefined);
});

test('orientation helpers and reset helpers target the requested layout only', () => {
  assert.equal(getOrientationKey(800, 400), 'landscape');
  assert.equal(getOrientationKey(400, 800), 'portrait');

  const profile = validateDrumLayoutProfiles(
    {
      custom1: {
        layouts: {
          portrait: {
            pieces: {
              kick: { x: 0.2, y: 0.7, visualScale: 1.2, hitBoxScaleX: 1.1, hitBoxScaleY: 1.2 },
            },
          },
          landscape: {
            pieces: {
              kick: { x: 0.4, y: 0.8, visualScale: 1.3, hitBoxScaleX: 1.4, hitBoxScaleY: 1.5 },
            },
          },
        },
      },
    },
    {},
  ).custom1;

  const resetPiece = resetPieceLayout(profile, 'portrait', 'kick');
  assert.equal(resetPiece.layouts.portrait.pieces.kick, undefined);
  assert.equal(resetPiece.layouts.landscape.pieces.kick.x, 0.4);

  const resetOrientation = resetOrientationLayout(profile, 'landscape');
  assert.equal(resetOrientation.layouts.portrait.pieces.kick.x, 0.2);
  assert.deepEqual(resetOrientation.layouts.landscape.pieces, {});
});

test('drum resize target helper changes only the requested layout dimensions', () => {
  const layout = {
    x: 0.5,
    y: 0.5,
    visualScale: 1,
    hitBoxScaleX: 1,
    hitBoxScaleY: 1,
  };

  const itemOnly = resizePieceLayoutFromCorner(layout, {
    target: 'item',
    horizontalDelta: 0.2,
    verticalDelta: 0.1,
  });
  assert.ok(itemOnly.visualScale > 1);
  assert.equal(itemOnly.hitBoxScaleX, 1);
  assert.equal(itemOnly.hitBoxScaleY, 1);

  const hitBoxOnly = resizePieceLayoutFromCorner(layout, {
    target: 'hitBox',
    horizontalDelta: 0.2,
    verticalDelta: 0.1,
  });
  assert.equal(hitBoxOnly.visualScale, 1);
  assert.ok(hitBoxOnly.hitBoxScaleX > 1);
  assert.ok(hitBoxOnly.hitBoxScaleY > 1);

  const both = resizePieceLayoutFromCorner(layout, {
    target: 'both',
    horizontalDelta: 0.2,
    verticalDelta: 0.1,
  });
  assert.ok(both.visualScale > 1);
  assert.ok(both.hitBoxScaleX > 1);
  assert.ok(both.hitBoxScaleY > 1);
});

test('drum resize target helper clamps extreme resize requests', () => {
  const layout = {
    x: 0.5,
    y: 0.5,
    visualScale: 1,
    hitBoxScaleX: 1,
    hitBoxScaleY: 1,
  };

  const maxed = resizePieceLayoutFromCorner(layout, {
    target: 'both',
    horizontalDelta: 10,
    verticalDelta: 10,
  });
  assert.equal(maxed.visualScale, 1.65);
  assert.equal(maxed.hitBoxScaleX, 1.9);
  assert.equal(maxed.hitBoxScaleY, 1.9);

  const mined = resizePieceLayoutFromCorner(layout, {
    target: 'both',
    horizontalDelta: -10,
    verticalDelta: -10,
  });
  assert.equal(mined.visualScale, 0.72);
  assert.equal(mined.hitBoxScaleX, 0.6);
  assert.equal(mined.hitBoxScaleY, 0.6);
});
