const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildDefaultDrumLayoutProfiles,
  clampPieceScale,
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
  assert.deepEqual(Object.keys(buildDefaultDrumLayoutProfiles()), [
    'default',
    'custom1',
    'custom2',
  ]);
});

test('drum profile validation migrates old positions into Custom 1', () => {
  const profiles = validateDrumLayoutProfiles({}, { kick: { x: 0.2, y: 0.8 } });

  assert.deepEqual(profiles.custom1.positions.kick, { x: 0.2, y: 0.8 });
});

test('drum profile validation clamps piece scales and rejects unknown profiles', () => {
  const profiles = validateDrumLayoutProfiles(
    {
      custom2: {
        positions: { kick: { x: -2, y: 4 }, nope: { x: 0.5, y: 0.5 } },
        scales: { kick: 5, snare: 0.1, nope: 1.2 },
      },
    },
    {},
  );

  assert.equal(validateDrumLayoutProfileId('missing'), 'default');
  assert.equal(clampPieceScale(5), 1.45);
  assert.equal(clampPieceScale(0.1), 0.72);
  assert.deepEqual(profiles.custom2.positions.kick, { x: 0, y: 1 });
  assert.equal(profiles.custom2.scales.kick, 1.45);
  assert.equal(profiles.custom2.scales.snare, 0.72);
});
