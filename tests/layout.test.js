const assert = require('node:assert/strict');
const test = require('node:test');

const { defaultDrumPieces } = require('../.qa-test-build/src/data/drumKit');
const { getResponsiveDrumScale } = require('../.qa-test-build/src/utils/drumSizing');
const { clampDrumPiecePosition } = require('../.qa-test-build/src/utils/layout');

test('default drum layout keeps a drummer-perspective arrangement', () => {
  const pieces = Object.fromEntries(defaultDrumPieces.map((piece) => [piece.id, piece]));

  assert.ok(pieces.kick.position.y > pieces.snare.position.y);
  assert.ok(pieces.hihat.position.x < pieces.snare.position.x);
  assert.ok(pieces.crash.position.x < pieces.kick.position.x);
  assert.ok(pieces.ride.position.x > pieces.kick.position.x);
  assert.ok(pieces.floorTom.position.x > pieces.midTom.position.x);
  assert.ok(pieces.highTom.position.y < pieces.snare.position.y);
  assert.ok(pieces.midTom.position.y < pieces.snare.position.y);
});

test('landscape responsive sizing gives priority drums taller hit boxes', () => {
  const kick = getResponsiveDrumScale('kick', true);
  const snare = getResponsiveDrumScale('snare', true);
  const hihat = getResponsiveDrumScale('hihat', true);
  const ride = getResponsiveDrumScale('ride', true);

  assert.ok(kick.hitBox.height > kick.hitBox.width);
  assert.ok(snare.hitBox.height > snare.hitBox.width);
  assert.ok(hihat.visual.height >= 1.2);
  assert.ok(ride.hitBox.width <= 1.05);
  assert.deepEqual(getResponsiveDrumScale('kick', false), {
    hitBox: { width: 1, height: 1 },
    visual: { width: 1, height: 1 },
  });
});

test('drum piece clamping keeps saved positions inside stage bounds', () => {
  const kick = defaultDrumPieces.find((piece) => piece.id === 'kick');

  assert.deepEqual(clampDrumPiecePosition({ x: -1, y: -1 }, kick, 1000, 700), {
    x: 0.13,
    y: 0.13,
  });
  assert.deepEqual(clampDrumPiecePosition({ x: 2, y: 2 }, kick, 1000, 700), {
    x: 0.87,
    y: 0.87,
  });
});
