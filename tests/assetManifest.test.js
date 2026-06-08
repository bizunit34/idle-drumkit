const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const manifestSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'assets', 'assetManifest.ts'),
  'utf8',
);

test('asset manifest defines critical and mode preload groups', () => {
  for (const required of [
    'mascotSource',
    'homeCarouselDrumSet',
    'homeCarouselMidiPads',
    'homeCarouselCustomSounds',
    'drumPiece.hiHatClosed',
    'drumPiece.hiHatOpen',
    'soundNotFound',
    'critical:',
    'drumSet:',
    'midiController:',
  ]) {
    assert.ok(manifestSource.includes(required), `Expected manifest to include ${required}`);
  }
});
