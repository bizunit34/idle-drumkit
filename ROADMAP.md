# Drumkit Roadmap

## Phase 1: MVP Polish

- Code quality baseline complete: Expo ESLint flat config, Prettier, stricter TypeScript options, VS Code recommendations, and GitHub Actions validation are in place.
- First-round alpha polish complete: Home cards, clearer Drum Set edit mode, MIDI reset confirmation, durable custom sound imports, toast feedback, storage schema versioning, future image placeholder notes, and manual QA checklist are in place.
- Internal alpha prep complete: app identifier placeholders, build metadata, EAS profiles, internal alpha docs, asset pipeline docs, QA issue templates, and app-level error boundary are in place.
- Drum-piece image architecture complete: optional per-piece image metadata and central registry are in place while current shape hit boxes remain the fallback.
- Drum articulation foundation complete: Drum Set now has persisted per-piece articulation selections, hi-hat closed/open visual swapping, crash choke action support, and reusable articulation helpers for future variants.
- QA hardening complete: articulation mapping validation, storage migration tests, QA run template, expanded articulation regression checklist, and internal alpha pre-share checklist are in place.
- Physical-device layout QA pass complete: Home carousel image containment, modal mode picker, Settings scrolling, Android safe-area padding, and landscape-first Drum Set controls are in place.
- Play-surface-first UX cleanup complete: Home carousel is swipe/dot driven, mode cards are tappable, master volume uses a slider, Drum Set and MIDI controls moved into overlays, drum layout profiles and piece sizing are persisted, and the ad placeholder is standardized.
- Improve touch ergonomics and responsive layout with real device feedback.
- Add better accessibility labels and screen reader hints.
- Expand automated tests around MIDI pad reset behavior, custom audio fallback, and additional layout edge cases.
- Add visual polish for hit feedback and edit states.
- Add tap-zone articulations so rim/bell/choke regions can be triggered directly on the drum images.
- Add advanced layout/profile export and import once internal testers settle on useful kit arrangements.
- Add velocity simulation from touch patterns or future gesture data.
- Add more articulation-specific images beyond closed/open hi-hat.
- Replace reused placeholder articulation sounds with higher-quality sample packs that are licensed for the app.
- Evaluate native low-latency sampler and true choke groups after real-device timing measurements.
- Review custom sound persistence behavior on iOS and Android physical devices.
- Track Expo audit advisories and resolve them during a controlled Expo SDK upgrade instead of forcing npm's breaking fix.
- React Native rendering tests deferred: keep current tests focused on pure logic until the Expo SDK 56-compatible Jest or component testing setup is selected deliberately.
- Dev-only QA helper deferred: manual QA docs and pure tests cover this pass without adding production-leakage risk.
- True infinite Home carousel looping deferred: current carousel supports horizontal snap swiping and dots without adding a carousel dependency.
- Real ad integration remains future work behind the placeholder component; use test ads during development and adaptive banners when integrating.
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
