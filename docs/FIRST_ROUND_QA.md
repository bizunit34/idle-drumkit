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

## Portrait and Landscape

- Test Home, Drum Set, MIDI Controller, and Settings in both orientations.
- Expected: content remains reachable, touch targets do not overlap, and play areas remain usable.

## Home Navigation

- Tap Start.
- Expected: mode cards expand below the Start/Settings controls.
- Tap Drum Set and MIDI Controller cards.
- Expected: each screen opens and Back returns Home.
- Tap the carousel dots.
- Expected: each placeholder card changes title, description, accent, and placeholder art.

## Drum Set Play Mode

- Open Drum Set with Edit Layout off.
- Tap kick, snare, hi-hat, crash, ride, high tom, mid tom, and floor tom.
- Expected: each visible piece plays its assigned bundled sound and shows a press state.
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
- Drag several pieces near each edge of the stage.
- Expected: pieces move smoothly, do not play while dragging, and cannot be saved permanently off-screen.
- Tap Done Editing.
- Expected: normal tap-to-play resumes.

## Drum Set Reset Layout

- Move at least one drum piece.
- Tap Reset Layout.
- Expected: pieces return to default positions and a status message appears.

## MIDI 3x4 Mode

- Open MIDI Controller and select 3x4.
- Tap every visible pad.
- Expected: 12 pads fill the controller surface cleanly, each pad plays, and selected pad state updates.

## MIDI 4x4 Mode

- Select 4x4.
- Tap every visible pad.
- Expected: 16 pads fill the controller surface cleanly and each pad plays.

## MIDI Pad Editing

- Select a pad.
- Rename the label, choose a new accent color, and select a different default sound.
- Expected: pad updates immediately and changes persist after leaving and returning to the screen.
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

## External Music Mix

- Start music or audio in another app.
- Open Drumkit and play drums/pads.
- Expected: Drumkit sounds mix with external audio where iOS/Android allow it.

## App Reload Persistence

- Move a drum piece, edit a MIDI pad, change settings, and import a custom sound.
- Fully reload/restart the app.
- Expected: saved layout, pad edits, custom sound file reference, and settings remain available.

## Ad Banner Spacing

- Open Drum Set and MIDI Controller.
- Expected: the placeholder banner reserves space at the bottom and does not overlap playable controls.

## Known Limitations

- Synthetic bundled sounds are placeholders, not production samples.
- Audio latency is still managed Expo audio latency, not a native low-latency sampler.
- Custom imported file playback depends on platform file support and selected file format.
- No real ads, purchases, backend, auth, or cloud sync are included.
- Automated tests are deferred until a stable test setup is selected.
