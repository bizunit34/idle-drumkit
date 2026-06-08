const assert = require('node:assert/strict');
const test = require('node:test');

const {
  drumArticulationConfigs,
  getDefaultSelectedDrumArticulations,
  resolveSelectedArticulation,
  validateDrumArticulationMappings,
  validateSelectedDrumArticulations,
} = require('../.qa-test-build/src/data/drumArticulations');

const availableSounds = new Set([
  'kick',
  'snare',
  'closedHihat',
  'openHihat',
  'clap',
  'crash',
  'ride',
  'highTom',
  'midTom',
  'floorTom',
  'rim',
  'cowbell',
  'shaker',
  'perc',
  'metronome',
  'subKick',
]);

test('drum articulation mappings are internally valid', () => {
  assert.deepEqual(validateDrumArticulationMappings(availableSounds), []);
});

test('default selected articulations match the expected alpha defaults', () => {
  assert.deepEqual(getDefaultSelectedDrumArticulations(), {
    kick: 'kickNormal',
    snare: 'snareCenter',
    hihat: 'hihatClosed',
    crash: 'crashHit',
    ride: 'rideBow',
    highTom: 'highTomCenter',
    midTom: 'midTomCenter',
    floorTom: 'floorTomCenter',
  });
});

test('selected articulation resolution falls back to the piece default', () => {
  assert.equal(resolveSelectedArticulation('hihat', { hihat: 'hihatOpen' }).id, 'hihatOpen');
  assert.equal(resolveSelectedArticulation('snare', { hihat: 'hihatOpen' }).id, 'snareCenter');
});

test('persisted articulation validation rejects unknown and action-only selections', () => {
  assert.deepEqual(
    validateSelectedDrumArticulations({
      hihat: 'hihatOpen',
      crash: 'crashChoke',
      snare: 'notReal',
      unknown: 'kickSub',
    }),
    {
      kick: 'kickNormal',
      snare: 'snareCenter',
      hihat: 'hihatOpen',
      crash: 'crashHit',
      ride: 'rideBow',
      highTom: 'highTomCenter',
      midTom: 'midTomCenter',
      floorTom: 'floorTomCenter',
    },
  );
});

test('action-only crash choke does not require a playable sound', () => {
  const crashChoke = drumArticulationConfigs.crash.articulations.find(
    (articulation) => articulation.id === 'crashChoke',
  );

  assert.equal(crashChoke.actionOnly, true);
  assert.equal(crashChoke.sound, undefined);
  assert.deepEqual(crashChoke.chokes, ['crash']);
});
