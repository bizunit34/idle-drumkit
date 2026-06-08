# Drumkit

Drumkit is an Expo React Native mobile app for idle drum playing. Keep the app open, tap drum regions or MIDI-style pads, and play along with audio from another app.

## Setup

```sh
npm install
```

## Run

```sh
npm run ios
npm run android
```

You can also start Metro directly:

```sh
npm start
```

## Internal Alpha

Drumkit is configured for internal alpha preparation with placeholder app identifiers and EAS build profiles. See `docs/INTERNAL_ALPHA.md` for local run, Metro, Android internal build, iOS internal build, and tester distribution notes.

Current placeholder bundle/package identifier:

```text
com.idledrumkit.drumkit
```

Confirm the final bundle/package identifier before app store release.

## Placeholder Sounds

The bundled sounds are tiny synthetic WAV files generated for this project. They are not copyrighted samples.

```sh
npm run generate:sounds
```

Generated files are written to `assets/sounds`.

## Custom Sound Import

MIDI pads can import local audio files through the platform document picker. Drumkit copies supported audio files into app-owned document storage before saving the pad assignment, so imports are more durable than temporary picker cache URIs. If an imported file cannot be found or played later, the app falls back to the pad's bundled default sound and shows a non-blocking status message.

Supported import targets depend on the platform and selected file format. Common audio files such as WAV, MP3, M4A, AAC, and OGG are accepted by the app-level guard.

## Validation

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run validate
```

Formatting is enforced with Prettier. Use this command before submitting larger edits:

```sh
npm run format
```

`npm run validate` runs typecheck, Expo ESLint, Prettier check, and the pure logic test suite.

## Manual QA

Use `docs/FIRST_ROUND_QA.md` for the first-round alpha checklist covering iOS, Android, portrait/landscape, navigation, play modes, articulation regression, editing, persistence, custom sound import, external audio mixing, and ad banner spacing.

Use `docs/QA_RUN_TEMPLATE.md` to record internal tester results or copy details into GitHub QA findings.

## Assets

Build asset slots and expected filenames are documented in `assets/images/README.md`. The magenta-background transparency workflow and first recommended art assets are documented in `docs/ASSET_PIPELINE.md`.

First visual seed assets are integrated on the Home screen:

- `assets/images/mascot-source.png`
- `assets/images/home-carousel-drum-set.png`
- `assets/images/home-carousel-midi-pads.png`
- `assets/images/home-carousel-custom-sounds.png`
- `assets/images/sound-not-found.png`

App icon, splash icon, Android adaptive icons, and favicon are still the existing placeholder build assets.

## Asset Loading

Critical Home images are listed in `src/assets/assetManifest.ts` and preloaded during app startup with a short timeout so a bad asset cannot trap the app on a loading screen. Home also background-warms Drum Set and MIDI Controller image groups, and mode navigation shows a small loading overlay only when a requested group is not already ready.

This pass uses React Native `Image` plus `Image.prefetch`; no new native image dependency was added. Test packaged release builds as well as dev-client/Metro builds because asset loading behavior can differ between development and bundled app builds.

## CI

GitHub Actions runs on pushes to `main` and on pull requests. The workflow installs dependencies with `npm ci` and runs:

```sh
npm run validate
```

## MVP Status

- Home screen with Start, Settings, mode selection, and placeholder promo carousel.
- Home screen uses a swipeable carousel with contain-rendered artwork and a modal mode-selection overlay.
- Home uses a responsive mascot/title brand row with Start and Settings below it in portrait, and a two-column brand/action plus carousel layout in landscape.
- Play-surface-first cleanup removes carousel Prev/Next controls, makes mode cards fully tappable, and keeps Home artwork inside its card without inner borders.
- Drum Set screen with playable kick, snare, hi-hat, crash, ride, toms, editable dragged layout, local persistence, and reset.
- Drum Set includes a persisted articulation system for kick Normal/Sub, snare Center/Rimshot/Cross-stick, hi-hat Closed/Open, crash Hit/Choke, ride Bow/Bell, and tom Center/Rim variants.
- Hi-hat Closed/Open swaps the hi-hat artwork where assets are available; triggering Closed chokes any ringing bundled Open hi-hat pool where Expo audio allows.
- Crash Choke pauses and rewinds the bundled crash player pool as a performance action.
- Drum Set pieces use per-piece image assets through a central drum asset registry; current shape rendering remains the fallback and hit boxes stay data-driven.
- Drum Set controls live in a play controls overlay, with Default, Custom 1, and Custom 2 layout profiles plus per-piece size adjustment in edit mode.
- Drum Set applies larger landscape-only visual and hit-box scaling for priority pieces while preserving stored layout profiles.
- MIDI Controller screen with 3x4 and 4x4 pad layouts, playable pads, label/color/default sound/custom file editing, local persistence, and reset.
- MIDI Controller editing lives in a controls overlay so the pad grid stays dominant.
- MIDI Controller now uses a hardware-style surface with a dark body, recessed pad area, tactile pads, accent glows, and reduced default text clutter.
- MIDI Controller separates Performance Mode from Edit Pads Mode. Performance pads respond immediately on press; Edit Pads Mode opens Pad Edit without playing.
- Pad Edit includes per-pad playback behavior: Play once, Hold to play, Tap start/stop, retrigger mode, choke group, stop/release mode, and pad volume.
- MIDI pad display settings persist locally: show pad labels, show sound names, and show pad numbers.
- Settings screen with persisted master volume, hit box visibility, low latency mode, and reset-all local data.
- Settings uses a touch slider for master volume with a live percentage tooltip while dragging.
- Audio helper built on `expo-audio`, configured to mix with other app audio and pre-warm bundled sound players.
- Ad banner placeholder on play screens only. No real ad SDKs, IDs, secrets, purchases, auth, backend, or sync.
- Code quality baseline is configured with Expo ESLint, Prettier, stricter TypeScript guardrails, VS Code recommendations, and CI validation.
- First-round alpha polish includes persistent custom sound copies, safer storage parsing, schema versioning, reset confirmations, toast feedback, future image placeholder notes, and manual QA documentation.
- Internal alpha prep includes placeholder iOS/Android identifiers, EAS profiles, issue templates, internal build docs, asset pipeline docs, and a simple app error boundary.
- QA hardening includes pure logic tests for articulation mappings, selected articulation validation, old hi-hat setting migration, corrupted settings fallback, and drum position validation.
- Physical-device layout QA fixes include Settings scrolling, Android top safe-area padding, and a landscape Drum Set layout that prioritizes the kit surface.
- Standardized ad banner placeholder appears across app screens as a quiet reserved bottom area. Future real ads should use provider test ads during development and adaptive banner sizing.
- Asset preloading foundation covers critical Home images plus background-warmed Drum Set and MIDI image groups without adding `expo-image`, `expo-asset`, or `expo-splash-screen`.

## Known Limitations

- Audio latency is acceptable for an MVP but not yet tuned like a native low-latency sampler.
- Overlapping playback uses a small player pool and can be improved later.
- MIDI pad gate/toggle/choke behavior is best-effort with Expo audio pooled players; exact envelopes, loop points, and native sampler choke groups are future work.
- Cymbal choke behavior is implemented by pausing and rewinding pooled Expo audio players, not by dedicated native sampler choke groups.
- Several articulation variants reuse synthetic placeholder sounds until higher-quality sample packs are selected.
- Imported custom audio uses app-owned document storage, but playback still depends on platform codec support and selected file format.
- Real ad provider integration is future work.
- Deeper accessibility and automated tests need follow-up passes.
- Haptic feedback is deferred until real-device timing and dependency impact are reviewed.
- `npm audit` reports moderate Expo CLI/config transitive advisories. The available npm fix requires a breaking Expo version change, so this should be handled during a controlled Expo upgrade.
- MIDI controller frame artwork is not required yet; future frame assets should remain separate from dynamic pad components.
