# Drumkit Agent Notes

## App

Drumkit is a mobile idle drumkit app. Users tap a drum set layout or MIDI-style controller pads to play drum sounds while the app remains open.

## Stack

- Expo
- React Native
- TypeScript with strict typing
- npm
- `expo-audio` for playback
- `@react-native-async-storage/async-storage` for local persistence
- `expo-document-picker` for custom pad sound assignment
- `expo-file-system` for app-owned custom sound copies

## Conventions

- Keep features data-driven.
- Preserve current app behavior unless the work is explicitly fixing a bug.
- Centralize shared types in `src/types`.
- Centralize kit and pad defaults in `src/data`.
- Centralize storage helpers in `src/storage`.
- Centralize audio helpers in `src/audio`.
- Prefer simple React Native components and built-in APIs before adding dependencies.
- Keep comments sparse and only add them where they clarify non-obvious behavior.
- Follow the configured ESLint and Prettier rules.
- Do not use explicit `any` unless the boundary is unavoidable and the reason is documented near the code.
- Prefer type-only imports for TypeScript-only symbols.
- Do not add copyrighted audio or visual assets.
- Do not add real ad IDs, secrets, purchase credentials, or backend credentials.
- Avoid magenta/pink subject art when preparing assets for a magenta-background transparency workflow.
- Confirm bundle/package identifiers before store release; current placeholder is `com.idledrumkit.drumkit`.

## Validation

Run:

```sh
npm run format:check
npm run lint
npm run typecheck
npm run validate
```

Also start Expo during app work:

```sh
npm start
```

Before finishing code changes, `npm run validate` should pass. If a command cannot run in the local environment, document the exact failure and the command the next engineer should run.

For first-round alpha work, also review `docs/FIRST_ROUND_QA.md` and update it when the user loop changes.

For internal alpha work, also review `docs/INTERNAL_ALPHA.md`, `docs/ASSET_PIPELINE.md`, and `assets/images/README.md`.

Tests are not configured yet.

## Current MVP Scope

- Home screen with mode selection and settings entry.
- Playable Drum Set screen with editable persisted layout.
- Playable MIDI Controller with 3x4/4x4 layouts and persisted pad edits.
- Global settings persisted locally.
- Synthetic bundled placeholder sounds.
- Imported MIDI pad sounds copied into app-owned storage.
- Ad banner placeholder only.
- EAS profiles exist for development, preview/internal testing, and production placeholder builds.

Out of scope for the first pass: authentication, backend, cloud sync, real purchases, real ads, and production-grade native audio latency.
