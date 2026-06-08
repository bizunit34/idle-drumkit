# Drumkit Image Asset Slots

First visual seed assets are committed and integrated on the Home screen. Do not add copyrighted images.

Current Expo placeholder PNGs live in `assets/` and should remain until final replacements are ready.

## Required Build Assets

- `assets/icon.png`: app icon, 1024x1024 PNG.
- `assets/splash-icon.png`: splash icon/mascot, recommended 1024x1024 PNG with transparent-safe subject.
- `assets/android-icon-foreground.png`: Android adaptive icon foreground, 432x432 PNG safe within the central mask.
- `assets/android-icon-background.png`: Android adaptive icon background, 432x432 PNG or solid-color background.
- `assets/android-icon-monochrome.png`: Android monochrome icon, 432x432 PNG.
- `assets/favicon.png`: web favicon, 48x48 or larger PNG.

## Future App Art Slots

- `assets/images/mascot-source.png`: mascot source art for icon/splash derivations and current Home brand art.
- `assets/images/home-carousel-drum-set.png`: drum set carousel art, currently used by the Home carousel.
- `assets/images/home-carousel-midi-pads.png`: MIDI pad carousel art, currently used by the Home carousel.
- `assets/images/home-carousel-custom-sounds.png`: custom sound import carousel art, currently used by the Home carousel.
- `assets/images/sound-not-found.png`: missing/deleted custom sound illustration, currently used in the MIDI custom audio editor.
- `assets/images/custom-sound-import.png`: file/audio waveform import illustration.
- `assets/images/empty-preset-bank.png`: empty preset/bank illustration.

## Drum Piece Assets

The Drum Set screen uses individual movable piece PNGs. Keep hit boxes data-driven in code; these images are visuals only and the shape-based kit remains the fallback.

- `assets/images/drum-pieces/kick.png`: currently used by Drum Set.
- `assets/images/drum-pieces/snare.png`: currently used by Drum Set.
- `assets/images/drum-pieces/hi-hat.png`: currently used by Drum Set.
- `assets/images/drum-pieces/hi-hat-closed.png`: currently used for the Closed hi-hat articulation when available.
- `assets/images/drum-pieces/hi-hat-open.png`: currently used for the Open hi-hat articulation when available.
- `assets/images/drum-pieces/crash.png`: currently used by Drum Set.
- `assets/images/drum-pieces/ride.png`: currently used by Drum Set.
- `assets/images/drum-pieces/high-tom.png`: currently used by Drum Set.
- `assets/images/drum-pieces/mid-tom.png`: currently used by Drum Set.
- `assets/images/drum-pieces/floor-tom.png`: currently used by Drum Set.

## Articulation Image Naming

Use the base drum-piece filename for default artwork, then add a lowercase hyphenated articulation suffix when a variant needs distinct art:

- `assets/images/drum-pieces/{piece}.png`: default piece art.
- `assets/images/drum-pieces/{piece}-{articulation}.png`: articulation-specific art.

Current articulation-specific examples:

- `assets/images/drum-pieces/hi-hat-closed.png`
- `assets/images/drum-pieces/hi-hat-open.png`

Do not use misspelled variants such as `hi-hat-clsed.png`; rename them to the preferred filename before wiring references.

Future examples can include `snare-rimshot.png`, `ride-bell.png`, `crash-choke.png`, or `floor-tom-rim.png`. If an articulation image is missing or fails to load, the app should fall back to the base piece image and then the shape renderer.

Keep titles and descriptions as native UI text, not baked into images.

Avoid pure magenta backgrounds or subject colors for assets that may use a magenta-background transparency workflow later.
