const assert = require('node:assert/strict');
const test = require('node:test');

const {
  getMidiPadDisplayText,
  formatPadPlaybackMode,
} = require('../.qa-test-build/src/data/midiPadDisplay');
const {
  defaultMidiPadBehavior,
  getMidiPadPressAction,
  shouldReleaseStopPad,
} = require('../.qa-test-build/src/data/midiPadBehavior');
const { validateMidiDisplaySettings } = require('../.qa-test-build/src/storage/storageValidation');

const pad = {
  id: 'pad-01',
  label: 'Kick',
  sound: 'subKick',
  accentColor: '#22D3EE',
  behavior: defaultMidiPadBehavior,
};

test('MIDI display settings default to labels only', () => {
  assert.deepEqual(validateMidiDisplaySettings({}), {
    showPadLabels: true,
    showPadSoundNames: false,
    showPadNumbers: false,
  });
});

test('MIDI pad display resolver supports label and sound visibility', () => {
  assert.deepEqual(
    getMidiPadDisplayText(pad, 0, {
      showPadLabels: true,
      showPadSoundNames: false,
      showPadNumbers: false,
    }),
    {
      label: 'Kick',
      soundName: undefined,
      number: undefined,
      accessibilityLabel: 'Kick, Sub Kick, Play once, #1 pad',
      accessibilityHint: 'Press to play this pad. Hold behavior depends on its playback mode.',
    },
  );

  assert.deepEqual(
    getMidiPadDisplayText(pad, 0, {
      showPadLabels: false,
      showPadSoundNames: false,
      showPadNumbers: false,
    }),
    {
      label: undefined,
      soundName: undefined,
      number: undefined,
      accessibilityLabel: 'Kick, Sub Kick, Play once, #1 pad',
      accessibilityHint: 'Press to play this pad. Hold behavior depends on its playback mode.',
    },
  );

  assert.deepEqual(
    getMidiPadDisplayText(
      { ...pad, behavior: { ...defaultMidiPadBehavior, playbackMode: 'gate' } },
      0,
      {
        showPadLabels: true,
        showPadSoundNames: true,
        showPadNumbers: true,
      },
      true,
    ),
    {
      label: 'Kick',
      soundName: 'Sub Kick',
      number: '#1',
      accessibilityLabel: 'Kick, Sub Kick, Hold to play, #1 pad',
      accessibilityHint: 'Tap to edit this pad.',
    },
  );
});

test('MIDI pad behavior helpers describe press and release decisions', () => {
  assert.equal(formatPadPlaybackMode('toggle'), 'Tap start stop');
  assert.equal(getMidiPadPressAction(defaultMidiPadBehavior, false), 'start');
  assert.equal(
    getMidiPadPressAction({ ...defaultMidiPadBehavior, retriggerMode: 'ignoreWhilePlaying' }, true),
    'ignore',
  );
  assert.equal(
    getMidiPadPressAction({ ...defaultMidiPadBehavior, playbackMode: 'toggle' }, true),
    'stop',
  );
  assert.equal(shouldReleaseStopPad({ ...defaultMidiPadBehavior, playbackMode: 'gate' }), true);
  assert.equal(shouldReleaseStopPad(defaultMidiPadBehavior), false);
});
