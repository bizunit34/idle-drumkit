# First-Round QA Checklist

Use this checklist before calling a first alpha pass complete. Run `npm run validate` before manual QA.

## iOS Simulator

- Start with `npm run ios`.
- Expected: app launches to Home without redbox errors.
- Navigate Home -> Drum Set -> Back -> MIDI Controller -> Back -> Settings.
- Expected: all screens are reachable, safe areas look correct, and the ad placeholder stays at the bottom of play screens.

## Android Emulator

- Start with `npm run android`.
- Expected: app launches to Home without redbox errors.
- Repeat the same navigation loop as iOS.
- Expected: pad/drum taps produce sounds, switches work, and file picker opens for custom audio import.

## Physical Device

- Start with `npm start` and open in Expo Go or a dev client when available.
- Expected: audio plays from device speaker/headphones, taps remain responsive, and external music can continue where the platform allows.
- Also test a packaged internal build before wider tester distribution.
- Expected: Home, Drum Set, and MIDI image assets appear without dev-client-only assumptions; release builds can load assets differently from Metro.

## Portrait and Landscape

- Test Home, Drum Set, MIDI Controller, and Settings in both orientations.
- Expected: content remains reachable, touch targets do not overlap, and play areas remain usable.

## Home Navigation

- In portrait, confirm the mascot/logo sits left of the Drumkit title/tagline, with Start and Settings below the brand row.
- Expected: Start and Settings are fully visible, not clipped, and separated from the carousel by a clear gap.
- In landscape, confirm Home uses a two-column layout with brand/actions on the left and a wider carousel/info panel on the right.
- Expected: carousel image and native title/body text do not overflow, and the left edge of the brand/action area is not clipped.
- Tap Start.
- Expected: a dimmed mode-selection overlay opens without shifting the Home layout.
- Expected: the Choose a mode panel is centered vertically and horizontally.
- Tap outside the overlay or Close.
- Expected: overlay dismisses cleanly.
- Tap Drum Set and MIDI Controller cards in the overlay.
- Expected: each full card is tappable, no separate Open link appears, each screen opens, and Back returns Home.
- Tap Drum Set and MIDI Controller carousel cards.
- Expected: each screen opens and Back returns Home.
- Swipe the carousel horizontally.
- Expected: cards snap cleanly, artwork is fully visible, and titles/descriptions remain native text.
- Tap the carousel dots.
- Expected: navigation changes cards and no Prev/Next buttons are visible.
- Tap the drum kit and MIDI carousel cards.
- Expected: the relevant mode opens. Tap the custom sounds carousel card.
- Expected: the mode-selection overlay opens.

## Drum Set Play Mode

- Open Drum Set with Edit Layout off.
- Tap kick, snare, hi-hat, crash, ride, high tom, mid tom, and floor tom.
- Expected: each visible piece plays its assigned bundled sound and shows a press state.
- In landscape, confirm the kit surface dominates the screen and controls are hidden until opened.
- In landscape, confirm kick, snare, hi-hat, and floor tom are large enough vertically for comfortable tapping.
- Expected: hit-box overlays are taller than before in landscape while widths remain sensible.
- Tap Controls.
- Expected: the overlay includes Edit Layout, Reset Layout, profile selection, hi-hat Closed/Open, selected piece articulations, and piece sizing in edit mode.
- Toggle hi-hat between Closed and Open, then tap the hi-hat.
- Expected: Closed plays the staccato closed hi-hat sample and Open plays the ringing open hi-hat sample.
- Expected: the visible hi-hat swaps between closed/open artwork when both articulation images are available, and falls back gracefully if either image fails.
- While Open is ringing, switch to Closed and tap hi-hat.
- Expected: the ringing open hi-hat is choked where Expo audio supports pausing the pooled players.
- Tap snare, then choose Center, Rimshot, and Cross-stick in the articulation panel.
- Expected: each selection persists as the active snare articulation and plays without opening a modal.
- Tap ride, then choose Bow and Bell.
- Expected: Bow plays the ride placeholder and Bell plays the bundled bell-like placeholder.
- Tap crash, then use Hit and Choke.
- Expected: Hit plays crash; Choke stops or rewinds ringing crash players where Expo audio supports it.
- Tap high tom, mid tom, and floor tom, then choose Center and Rim for each.
- Expected: each tom keeps its selected articulation and remains draggable only in edit mode.
- Fully reload the app after changing several articulations.
- Expected: selected articulations persist after reload, including hi-hat Closed/Open.
- Switch Default, Custom 1, and Custom 2 profiles.
- Expected: each profile preserves its own positions and piece sizing.
- In Edit Layout, select kick, snare, or hi-hat and use Larger/Smaller.
- Expected: the piece resizes, stays on-screen, and the size persists after leaving and returning.

## Drum Set Articulation Regression

- Start from clean local data or use Reset All Local App Data.
- Expected: default articulations are Kick Normal, Snare Center, Hi-hat Closed, Crash Hit, Ride Bow, High Tom Center, Mid Tom Center, and Floor Tom Center.
- Select each drum piece by tapping it in play mode.
- Expected: the articulation panel changes to that piece without delaying playback.
- Change every available articulation once.
- Expected: selected articulations update immediately, remain visible in the panel, and playable choices produce sound.
- Switch hi-hat Closed -> Open -> Closed.
- Expected: open hi-hat shows open art and rings; closed hi-hat shows closed art and chokes the ringing open hi-hat where Expo audio supports pooled pause/rewind.
- Trigger Crash Hit, then press Choke.
- Expected: crash sound starts, then Choke stops or rewinds the pooled crash players where supported.
- Change Snare Center, Rimshot, and Cross-stick.
- Expected: each choice is selectable and plays its mapped placeholder sound.
- Change Ride Bow and Bell.
- Expected: Bow and Bell remain distinct choices and play their mapped placeholder sounds.
- Change High Tom, Mid Tom, and Floor Tom Center/Rim.
- Expected: selections persist and the toms remain playable.
- Turn Show Hit Boxes off and on.
- Expected: overlays reflect the actual tappable region, not the current image bounds.
- Enter Edit Layout and drag each drum near the stage edges.
- Expected: no accidental playback while dragging, and pieces cannot be saved permanently off-screen.
- Reset Layout.
- Expected: positions return to defaults while articulation selections remain unchanged.
- Reset All Local App Data from Settings.
- Expected: positions, MIDI pads, settings, and selected drum articulations return to defaults.
- Repeat the articulation checks in portrait and landscape.
- Expected: controls remain reachable and do not cover the playable pieces in a blocking way.
- Rapidly tap kick, snare, hi-hat, crash, and toms.
- Expected: sounds remain responsive and pooled playback continues to overlap within current Expo audio limits.
- Start external music and repeat hi-hat, crash, and MIDI pad playback.
- Expected: Drumkit mixes with external audio where the platform allows.
- Recheck MIDI custom imported sound playback.
- Expected: MIDI pad custom audio still plays or falls back to the default sound with a non-blocking message.

Failure notes to capture: device, OS, build number, orientation, selected articulation, exact steps, expected result, actual result, severity, and screenshot/video if possible. Use `docs/QA_RUN_TEMPLATE.md` or the GitHub QA finding issue template.

## Drum Set Edit Mode

- Tap Edit Layout.
- Expected: compact instructions appear and drum taps no longer play sounds.
- Tap a drum piece.
- Expected: the piece is selected with a clear item outline, selected hit-box outline, label badge, and four resize handles.
- Expected: the Item / Hit Box / Both resize target toolbar is visible on the stage while Edit Layout is on.
- Tap empty stage.
- Expected: selected piece is cleared.
- Tap another drum piece.
- Expected: selection moves to that piece.
- Drag the selected drum body.
- Expected: the drum moves smoothly, item and hit box move together, and the saved position is clamped inside the stage.
- Choose Item from the stage toolbar or Controls. Drag a corner resize handle.
- Expected: only the visual drum image/bounds resize with preserved visual aspect ratio.
- Choose Hit Box. Drag a corner resize handle.
- Expected: only the tappable hit box resizes; Show Hit Boxes confirms the new tap area in performance mode.
- Choose Both. Drag a corner resize handle.
- Expected: visual item and hit box resize together.
- Drag the selected drum body after resizing.
- Expected: body drag moves the piece; touching resize handles does not accidentally move the piece.
- Use Reset Selected, Reset Orientation, and Reset Profile.
- Expected: each action confirms before destructive reset and affects only the requested scope.
- Tap Done Editing.
- Expected: normal tap-to-play resumes.
- Edit a portrait layout, then rotate to landscape.
- Expected: portrait edits do not affect landscape.
- Edit a landscape layout, then rotate to portrait.
- Expected: landscape edits do not affect portrait.

## Drum Set Reset Layout

- Move at least one drum piece.
- Tap Reset Orientation.
- Expected: pieces in the current orientation return to defaults and a status message appears.

## MIDI 3x4 Mode

- Open MIDI Controller and select 3x4.
- Tap every visible pad.
- Expected: 12 tactile pads fill the recessed controller surface cleanly, each pad plays, and selected pad state updates with outline/scale/accent treatment.
- Rotate to landscape.
- Expected: 3x4 mode uses a two-row, six-column layout where the device width allows it, without vertical scrolling when controls are closed.

## MIDI 4x4 Mode

- Select 4x4.
- Tap every visible pad.
- Expected: 16 tactile pads fill the controller surface cleanly and each pad plays.
- Rotate to landscape.
- Expected: 4x4 mode uses a two-row, eight-column layout where the device width allows it; constrained devices may fall back but should avoid awkward vertical stacking.

## MIDI Pad Editing

- Tap a pad.
- Expected: in Performance Mode, the pad plays immediately on press and becomes selected; playback does not wait for long-press detection.
- Hold a pad in Performance Mode.
- Expected: holding does not open Pad Edit. Hold/release behavior follows that pad's Playback Mode.
- Open Controls and tap Edit Pads.
- Expected: Edit Pads Mode turns on and the controls sheet closes.
- Tap a pad in Edit Pads Mode.
- Expected: Pad Edit opens for that exact pad and the pad does not play.
- Rename the label, choose a new accent color, and select a different default sound.
- Expected: pad updates immediately and changes persist after leaving and returning to the screen.
- Open Controls.
- Expected: the General MIDI Controls sheet contains Performance/Edit Pads mode toggle, grid size, display settings, Reset Pads, selected pad summary, and mode-specific instructions.
- Set Playback Mode to Play once.
- Expected: playback mode choices use a compact segmented control rather than a large button wall.
- Expected: pressing the pad starts playback and release does not stop it.
- Set Playback Mode to Hold to play.
- Expected: pressing starts playback and releasing stops using the selected Stop/Release setting.
- Set Playback Mode to Tap start/stop.
- Expected: first press starts playback and the next press stops it.
- Set Retrigger to Layer hits, Restart, and Ignore while playing.
- Expected: repeated presses follow the selected behavior within current Expo audio limits.
- Set closed hat and open hat pads to Choke Group Hi-hat.
- Expected: pressing one chokes the other where pooled Expo audio allows.
- Change Pad Volume.
- Expected: Pad Volume uses a slider, that pad plays quieter/louder relative to the master volume, and the value persists after reload.
- Toggle Show Pad Labels, Show Sound Names, and Show Pad Numbers.
- Expected: visible pad text changes immediately, settings persist after app reload, and pads remain identifiable by accent/selected state when most text is hidden.
- Turn off all visible pad text.
- Expected: pads still have useful accessibility labels with pad label and assigned sound.
- Tap Reset Pads and cancel.
- Expected: no changes are reset.
- Tap Reset Pads and confirm.
- Expected: defaults are restored and a status message appears.

## Custom Audio Import

- Select a pad and tap Assign Audio File.
- Cancel the picker.
- Expected: app stays stable and shows a non-blocking cancellation message.
- Import a supported local audio file.
- Expected: app copies it into app-owned storage, shows the original file name, and the pad plays it.
- Clear the custom audio.
- Expected: pad returns to its default bundled sound.

## Settings Persistence

- Change master volume, Show Hit Boxes, and Low Latency Mode.
- Leave Settings and return.
- Expected: settings remain changed.
- Expected: Show Hit Boxes visibly affects outlines on Drum Set and MIDI Controller screens.
- Drag the Master Volume slider.
- Expected: the percentage tooltip appears while dragging and the value persists.
- In portrait and landscape, scroll Settings to Local Data.
- Expected: Local Data and Reset All Local App Data are reachable and not hidden behind the navigation/gesture area.

## External Music Mix

- Start music or audio in another app.
- Open Drumkit and play drums/pads.
- Expected: Drumkit sounds mix with external audio where iOS/Android allow it.

## App Reload Persistence

- Move a drum piece, edit a MIDI pad, change settings, and import a custom sound.
- Fully reload/restart the app.
- Expected: saved layout, pad edits, custom sound file reference, and settings remain available.

## Ad Banner Spacing

- Open Home, Drum Set, MIDI Controller, and Settings.
- Expected: the standardized placeholder banner reserves bottom space and does not overlap primary controls or play surfaces.

## MIDI Controls Overlay

- Open MIDI Controller.
- Expected: the dark controller body, recessed pad surface, and pad grid are the dominant visible content and the large editor panel is hidden.
- Tap a pad.
- Expected: the pad plays immediately and becomes selected for editing.
- Tap Controls.
- Expected: a readable General MIDI Controls overlay opens with Performance/Edit Pads mode, 3x4/4x4, Reset Pads, pad display toggles, selected pad summary, and an Edit Pad action.
- Tap Edit Pad from Controls or tap a pad while Edit Pads Mode is on.
- Expected: a separate readable Pad Edit overlay opens with label, accent color, default sound, playback behavior, custom audio import, and clear custom sound controls.
- Expected: Default Sound, Retrigger, Choke Group, and Stop / Release use compact select rows; Custom Audio uses a clean empty state rather than a bordered broken-image card.

## Asset Preload And Loading

- Cold start the app.
- Expected: a dark Drumkit loading state appears only while persisted state and critical Home assets are prepared or timed out.
- Let Home sit for a few seconds, then open Drum Set and MIDI Controller.
- Expected: mode entry is quick because Home background-warms mode image groups.
- Immediately open Drum Set or MIDI Controller after Home appears.
- Expected: if mode assets are not ready, a small loading overlay appears briefly and then the screen opens even if an asset fails.
- Simulate a missing optional image only in a local test branch.
- Expected: screens fall back to existing placeholder/shape rendering rather than blocking play or sound.

## Safe Area And Floating Controls

- Check Home, Drum Set, MIDI Controller, and Settings near the status bar and gesture/navigation bar.
- Expected: content is not tucked under the status bar, camera cutout, or gesture bar.
- Confirm no floating settings gear appears over Settings or play-screen content.
- Expected: Settings is reached through normal buttons/navigation and does not overlap content.
- If old Home Prev/Next buttons or mode Open buttons appear during QA, clear the Metro cache with `npx expo start --dev-client -c` and retest.
- For polish screenshots, turn off Android developer Pointer Location and Show taps overlays.

## Known Limitations

- Synthetic bundled sounds are placeholders, not production samples.
- Audio latency is still managed Expo audio latency, not a native low-latency sampler.
- MIDI gate/toggle/choke/fade behavior is best-effort with Expo audio pooled players, not exact native sampler envelopes.
- Custom imported file playback depends on platform file support and selected file format.
- No real ads, purchases, backend, auth, or cloud sync are included.
- Automated tests are deferred until a stable test setup is selected.
- Component rendering tests are deferred; current automated coverage focuses on stable pure logic for storage, articulation, MIDI display, assets, and layout helpers.
