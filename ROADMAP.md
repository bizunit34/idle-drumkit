# Drumkit Roadmap

## Phase 1: MVP Polish

- Code quality baseline complete: Expo ESLint flat config, Prettier, stricter TypeScript options, VS Code recommendations, and GitHub Actions validation are in place.
- First-round alpha polish complete: Home cards, clearer Drum Set edit mode, MIDI reset confirmation, durable custom sound imports, toast feedback, storage schema versioning, future image placeholder notes, and manual QA checklist are in place.
- Internal alpha prep complete: app identifier placeholders, build metadata, EAS profiles, internal alpha docs, asset pipeline docs, QA issue templates, and app-level error boundary are in place.
- Drum-piece image architecture complete: optional per-piece image metadata and central registry are in place while current shape hit boxes remain the fallback.
- Hi-hat articulation complete: Drum Set has a persisted Closed/Open toggle and closed hi-hat chokes the bundled open hi-hat player pool.
- Improve touch ergonomics and responsive layout with real device feedback.
- Add better accessibility labels and screen reader hints.
- Add unit tests around data persistence, layout bounds, MIDI pad reset behavior, and audio fallback behavior.
- Add visual polish for hit feedback and edit states.
- Review custom sound persistence behavior on iOS and Android physical devices.
- Track Expo audit advisories and resolve them during a controlled Expo SDK upgrade instead of forcing npm's breaking fix.
- Test setup deferred: avoid adding Jest/React Native test dependencies until the Expo SDK 56-compatible preset and CI runtime are selected deliberately.
- Haptics deferred: add only after real-device testing confirms it does not interfere with tap/audio timing.
- Confirm final bundle/package identifier, app icon, splash art, and publisher/store metadata before external release.
- Run internal alpha on real iOS and Android devices, including external music playback and custom audio import.
- Consider typed route/navigation structure once screen count grows.

## Phase 2: Real Ad Provider Integration

- Choose an ad provider such as AdMob.
- Replace `AdBannerPlaceholder` behind a provider abstraction.
- Keep ad IDs and secrets out of source control.
- Add environment-specific configuration and test IDs only.

## Phase 3: Paid and Video-Ad Support Tier

- Add an optional support tier.
- Explore rewarded video ads for temporary ad removal or extra content.
- Add purchase state handling only after a clear product decision.

## Phase 4: Extra Instruments and Expanded MIDI Control

- Add alternate kits such as steel drum, electronic, and percussion.
- Expand MIDI pad banks and preset layouts.
- Add pad velocity options and more assignment controls.

## Phase 5: Improved Low-Latency Audio Engine

- Measure real device latency.
- Investigate native audio engine options if Expo audio pooling is not enough.
- Improve sample preloading, overlapping playback, and lifecycle cleanup.
