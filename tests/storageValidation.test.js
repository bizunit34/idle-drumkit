const assert = require('node:assert/strict');
const test = require('node:test');

const {
  defaultSettings,
  validateDrumPositions,
  validateSettings,
} = require('../.qa-test-build/src/storage/storageValidation');

test('old hiHatArticulation setting migrates to selected drum articulations', () => {
  const settings = validateSettings({
    masterVolume: 0.7,
    showHitBoxes: false,
    lowLatencyMode: true,
    hiHatArticulation: 'open',
  });

  assert.equal(settings.selectedDrumArticulations.hihat, 'hihatOpen');
  assert.equal(settings.masterVolume, 0.7);
  assert.equal(settings.showHitBoxes, false);
});

test('corrupted settings fall back to safe defaults', () => {
  const settings = validateSettings({
    masterVolume: 42,
    showHitBoxes: 'yes',
    lowLatencyMode: null,
    selectedDrumArticulations: {
      hihat: 'missing',
      crash: 'crashChoke',
    },
  });

  assert.equal(settings.masterVolume, 1);
  assert.equal(settings.showHitBoxes, defaultSettings.showHitBoxes);
  assert.equal(settings.lowLatencyMode, defaultSettings.lowLatencyMode);
  assert.equal(settings.selectedDrumArticulations.hihat, 'hihatClosed');
  assert.equal(settings.selectedDrumArticulations.crash, 'crashHit');
});

test('drum position validation ignores unknown pieces and clamps known positions', () => {
  assert.deepEqual(
    validateDrumPositions({
      kick: { x: -1, y: 2 },
      hihat: { x: 0.3, y: 0.4 },
      bogus: { x: 0.5, y: 0.5 },
      snare: { x: 'bad', y: 0.5 },
    }),
    {
      kick: { x: 0, y: 1 },
      hihat: { x: 0.3, y: 0.4 },
    },
  );
});
