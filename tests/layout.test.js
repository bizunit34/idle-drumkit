const assert = require('node:assert/strict');
const test = require('node:test');

const { defaultDrumPieces } = require('../.qa-test-build/src/data/drumKit');
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

test('drum piece clamping keeps saved positions inside stage bounds', () => {
  const kick = defaultDrumPieces.find((piece) => piece.id === 'kick');

  assert.deepEqual(clampDrumPiecePosition({ x: -1, y: -1 }, kick, 1000, 700), {
    x: 0.11,
    y: 0.11,
  });
  assert.deepEqual(clampDrumPiecePosition({ x: 2, y: 2 }, kick, 1000, 700), {
    x: 0.89,
    y: 0.89,
  });
});
