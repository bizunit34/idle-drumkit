const assert = require('node:assert/strict');
const test = require('node:test');

const {
  defaultSettings,
  validateDrumPositions,
  validateMidiPadBehaviorSettings,
  validateMidiPads,
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
  assert.deepEqual(settings.midiDisplay, defaultSettings.midiDisplay);
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

test('MIDI pad behavior validation migrates existing pads safely', () => {
  assert.deepEqual(validateMidiPadBehaviorSettings({}, 'closedHihat'), {
    playbackMode: 'oneShot',
    retriggerMode: 'overlap',
    chokeGroup: 'hihat',
    stopMode: 'immediate',
    padVolume: 100,
  });

  assert.deepEqual(
    validateMidiPadBehaviorSettings(
      {
        playbackMode: 'gate',
        retriggerMode: 'restart',
        chokeGroup: 'group2',
        stopMode: 'mediumFade',
        padVolume: 140,
      },
      'kick',
    ),
    {
      playbackMode: 'gate',
      retriggerMode: 'restart',
      chokeGroup: 'group2',
      stopMode: 'mediumFade',
      padVolume: 100,
    },
  );

  const pads = validateMidiPads([
    {
      id: 'pad-01',
      label: 'Stored Kick',
      sound: 'kick',
      accentColor: '#fff',
      behavior: {
        playbackMode: 'toggle',
        retriggerMode: 'ignoreWhilePlaying',
        chokeGroup: 'group1',
        stopMode: 'shortFade',
        padVolume: 65,
      },
    },
    {
      id: 'pad-03',
      label: 'Hat',
      sound: 'closedHihat',
      accentColor: '#fff',
    },
  ]);

  assert.equal(pads[0].label, 'Stored Kick');
  assert.equal(pads[0].behavior.playbackMode, 'toggle');
  assert.equal(pads[0].behavior.padVolume, 65);
  assert.equal(pads[2].behavior.chokeGroup, 'hihat');
});
