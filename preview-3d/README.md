# Honeybrook — separate 3D Welcome House preview

A small browser-based 3D area, served at `/preview-3d/` by the existing static Render service. No original game page, manuscript, image, save format or script is changed. It does not load the original game engines. This is a first interaction/performance trial with simplified meshes and generated material textures, not a completed photorealistic conversion of Honeybrook.

## Included

- First-person walking and looking, collision with walls, furniture and trees; opening/closing doors and physically connected reception/kitchen and bakery interiors.
- A steerable runabout with entry, parked exit, braking/reverse, collision and moving wheels. The vehicle camera follows its heading. Home safely returns the player without resetting work; settings can recover the vehicle to its initial parking spot.
- Three simplified bear neighbors, one moving along a routine path, limb animation and an optional game-extension welcome conversation. No new manuscript identities or reveal spoilers.
- An optional ordered garden delivery: accept at reception, collect basket, harvest, deliver to kitchen, inspect. Basket, garden beds and delivered food change visibly; inventory and completion persist.
- Day/sunset/night selection, rain/snow particles, lamps, optional synthesized ambience and volume, camera scene with skip, laptop/balanced rendering settings, real Chicago calendar/time and an accessible field journal.
- Separate validated preview saves, previous-record checkpoint, backup export, reviewed restore, corrupt-record protection and stale-tab write protection. No existing wallet, ledger, grade, Journey or guest record is read or written. Browser-local only; no cloud synchronization.
- Existing arrival rule: refresh starts outside Welcome House, while keeping the preview task, inventory, journal and vehicle. Original-world links return to the original front page.

## Controls

W/S or Up/Down move forward/back; A/D or Left/Right turn; Q/R step sideways; drag to look; wheel changes field of view; E interacts with a nearby object in view. Escape pauses. While driving, W accelerates, S brakes/reverses, A/D steer, E exits only near a stop. Stand near and face an object to expose its action. The garden is left of Welcome House; the kitchen is inside toward the back-right.

## Preservation and rollback

Original baseline: `f15a89ce860ca47a81b06827743c26a6a0822b0a`, retained on `backup/pre-3d-2026-10-29`. The original home page and every pre-existing tracked file are unchanged. The preview is isolated under `preview-3d/`, with two additional test files. It is not linked into the original front page pending the owner's trial.

No legacy save migration exists or is needed. Only `honeybrook_3d_preview_v1` and `honeybrook_3d_preview_checkpoint_v1` are written. Existing broad world-backup tools may include those new prefixed records, but this preview does not execute those tools. Do not clear site data to remove the preview: doing so could remove the owner's original game progress. Removing this directory and the two tests, or reverting only the additive preview commit, withdraws the preview while retaining later unrelated Honeybrook work. A full old-commit rollback should only be used if later changes are intentionally included in the rollback scope.

## Checks and limitations

`node tests/preview-3d-state.mjs` checks the ordered task, invalid states, duplicate prevention, save isolation, import-text escaping and bundled files.

`node tests/preview-3d-runtime.mjs` is a Node geometry/logic harness requiring `@napi-rs/canvas` (or its absolute module path in `CANVAS_MODULE`). It substitutes a non-rendering renderer and simulates controls through the application's handlers. It checks wall/door collision, enterable interior, actual vehicle entry/movement/stop-before-exit, all five garden interactions, inventory, save output, legacy sentinels and stale-tab protection. It constructs 30,772 triangles and 191 mesh draws before visibility culling. This is **not** a GPU rendering or visual-quality test.

The available cloud browser returned “Error creating WebGL context.” Its graceful error page was observed, but actual graphical appearance, GPU performance, phone layout, audio output and fully rendered gameplay remain unverified. Trial on the owner's laptop is required. Low graphics quality is the default, with static scenery merged by material and no real-time shadows. Graphics quality is deliberately below the original photographic scenes; no frame-rate promise is made.

Not included: the complete city/699 rooms, realistic fur or acted facial dialogue, combat, traffic AI, full citizen relationship simulation, seasons, integration of existing reception/film-school work into 3D, or cross-device saves. Honeybrook remains peaceful and its original game systems stay in the original version.

## Dependencies

Three.js 0.160.1 and its BufferGeometryUtils are pinned and vendored locally, under the accompanying MIT license. Nunito is copied from Honeybrook's established bundled font, with its SIL Open Font License. No CDN, analytics, API, build step, new Render service or paid resource is required at runtime.
