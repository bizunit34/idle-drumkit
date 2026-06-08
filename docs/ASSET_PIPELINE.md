# Asset Pipeline

Drumkit does not include final generated art yet. Keep placeholder assets until final app-safe PNGs are approved.

## Magenta-Background Workflow

Source images may use a flat pure magenta `#FF00FF` background for external transparency removal.

Rules:

- The subject must not contain magenta, pink, fuchsia, or purple-pink colors.
- Remove the magenta background outside the app build process.
- Export final transparent PNGs to the filenames documented in `assets/images/README.md`.
- Do not commit copyrighted images.
- Do not bake labels, titles, or marketing copy into images. Text should remain native UI text.

## Recommended First Assets

- Mascot/icon source: chibi-style drummer or compact drum mascot.
- Splash source: larger mascot pose for launch/splash treatment.
- Drum set carousel card: visual support for “Play a drum kit”.
- MIDI pad carousel card: controller surface and neon pads.
- Custom sound fallback image: friendly “sound missing” or file-waveform illustration.

## Store-Release Reminder

Before app store release, replace the generated Expo placeholders in `assets/` with final app icon, adaptive icon, splash, and favicon exports.
