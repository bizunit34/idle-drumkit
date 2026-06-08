# Internal Alpha

This project is prepared for internal alpha builds, but no cloud build, app store submit, signing credential, secret, real ad ID, purchase setup, backend, or auth integration is included.

## Prerequisites

- Node compatible with Expo SDK 56.
- npm.
- Expo account access for EAS cloud builds.
- Apple Developer access for iOS device distribution.
- Google Play or direct APK distribution process for Android testers.
- Final bundle/package identifier confirmation before store release. Current placeholder: `com.idledrumkit.drumkit`.

## Local Run

```sh
npm ci
npm start
```

Then open the project in Expo Go or the appropriate development client.

Platform shortcuts:

```sh
npm run ios
npm run android
```

## Start Metro

```sh
npm start
```

Metro should report `Waiting on http://localhost:8081`.

## Android Internal Build

Preview APK profile:

```sh
npx eas-cli build --platform android --profile preview
```

Development APK profile:

```sh
npx eas-cli build --platform android --profile development
```

The development profile builds an internal APK and does not install `expo-dev-client` in this repo.

## iOS Internal Build

iOS simulator build:

```sh
npx eas-cli build --platform ios --profile development
```

iOS device/internal distribution build:

```sh
npx eas-cli build --platform ios --profile preview
```

The iOS preview build requires Expo login and Apple credentials/provisioning. Do not commit credentials.

## Distribution To Testers

- Android: share the EAS build artifact link or upload the APK/AAB through the chosen internal testing process.
- iOS: use EAS internal distribution or TestFlight once Apple credentials and app record are configured.
- Include the build version, platform, and known limitations in tester instructions.

## Tester Bug Reports

Ask testers to file GitHub issues using the QA finding template. Include:

- Device and OS version.
- Build version.
- Screen.
- Steps to reproduce.
- Expected and actual result.
- Screenshot or video if possible.

## Alpha QA Reminder

Run through `docs/FIRST_ROUND_QA.md`, including the external-music scenario: start music/audio from another app before playing Drumkit sounds.

## Before Sharing With Testers

- Run `npm run validate`.
- Run `npm start` and confirm Metro reports `Waiting on http://localhost:8081`.
- Confirm the app launches on iOS.
- Confirm the app launches on Android.
- Confirm Drum Set plays all default pieces.
- Confirm Drum Set articulation defaults and hi-hat closed/open visual swap.
- Confirm MIDI pads play in 3x4 and 4x4 layouts.
- Confirm settings persist after app reload.
- Confirm no broken asset references are visible on Home, Drum Set, or MIDI custom audio UI.
- Confirm known limitations are included in tester instructions.

## Known Limitations

- Placeholder synthetic sounds and generated Expo icons are not final assets.
- Audio latency is managed Expo audio latency, not a native low-latency sampler.
- No real ads, purchases, backend, auth, or cloud sync.
- Imported custom audio depends on selected file format and platform codec support.
- Automated tests currently cover pure articulation and storage validation logic only.
