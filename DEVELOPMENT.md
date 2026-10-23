# Honeybrook development

This is a static HTML/CSS/JavaScript site. Node 24, npm, Python 3 and `/usr/bin/chromium` are available in the prepared cloud environment. No application dependencies, build step, new database or paid service are required for local play.

Use this existing isolated checkout at `/workspace/Honeybrook`. Do not create a Git worktree unless requested.

## Prepare browser checks

```sh
npm install --cache /workspace/.honeybrook-tools/npm-cache --prefix /workspace/.honeybrook-tools --no-save --package-lock=false playwright@1.64.1
```

The test dependency stays outside the checkout. Do not create or modify the site's dependency declarations or lockfiles for this operation.

## Start

```sh
cd /workspace/Honeybrook
python3 -m http.server 8792 --bind 127.0.0.1
```

Use local requests and browser checks. This is a development server, not the production host. Do not publish loopback preview links. Verify `curl --fail http://127.0.0.1:8792/` and check that `/life-engine.js` and `/honeybrook-life.js` return successfully.

## Validate

```sh
cd /workspace/Honeybrook
export PLAYWRIGHT_MODULE=/workspace/.honeybrook-tools/node_modules/playwright/index.mjs
export CHROMIUM_PATH=/usr/bin/chromium
node tests/daily-life.cjs
node tests/life-engine.cjs
node tests/browser.mjs
node tests/life.mjs
node tests/destinations.mjs
node tests/living-places.mjs
node tests/adventure.mjs
node tests/venues.mjs
node tests/venue-recovery.mjs
```

Browser tests use separate synthetic contexts and a local server; they do not access production saves or a database. The default test URL is the loopback server on port 8792. Chromium is preinstalled; no browser download or verification bypass is necessary.

`tests/life-engine.cjs` exercises every activity and enterprise, rewards, limits, camping prerequisites, calendar distinctions, weather restrictions and validation. `tests/life.mjs` covers desktop/phone navigation, every new location image, state/reload, business accounts, unread mail, camping, backup preview/restore, sound controls and cross-tab conflicts.

## Render and private saves

The owner supplied https://honeybrook.onrender.com/. This checkout contains no Render service ID, Render API binding, save API, authentication system or database configuration. Local validation does not prove live deployment. The environment proxy denied the live-site request; a domain addition was saved to the environment draft for review.

Serve the repository root as the existing Render static site does; no new runtime service is needed for the additive life UI. Deployment must use the owner's existing GitHub/Render connection. Do not invent a deploy hook, change services, add paid infrastructure or claim the production version changed without checking the actual deployment.

The new life record is `honeybrook_life_v1`; its previous-state checkpoint is `honeybrook_life_checkpoint_v1`. Legacy town and Fair save keys remain intact. World backups preserve the original string formats of matching `honeybrook_` keys and `honeybrookTownJournal`, rather than assuming every older record is JSON. Checkpoints apply to the new life record; they are not full legacy-world snapshots.

Import previews explain what will be replaced. Confirming restore downloads the current browser's backup, applies the selected records with rollback on storage-write failure, and reloads before legacy modules can continue with stale in-memory data. Changes from another tab stop a stale save. Supported browsers serialize life writes with Web Locks; other browsers use a synchronous revision comparison. Private cross-device synchronization remains unimplemented until the existing authenticated save service can be inspected.

## Unified city map checks

Run `node tests/city-map.mjs` with the same Playwright environment above. It checks the shared fifteen-area city map at desktop and phone widths, all thirteen district round trips, searchable classroom/venue entrances, real legacy town and Bear Hollow rooms, automatic continuation of an existing save, city-map returns, the separate Fair gate, keyboard/zoom and preservation of existing learning/life/game progress. `tests/connected-town.mjs` and `tests/browser.mjs` also cover the pre-existing routes and save/backup flows.

## Focused navigation checks

`tests/navigation-usability.mjs` checks all fifteen top area tabs, all 86 venues in the direct selector, focused district views, real classroom exercises, accent-insensitive popup search, favorites/recent places and Escape. It instruments scroll methods and verifies that map, district, room and walking-view refreshes do not call scripted scrolling. The earlier city-map, connected-town, world-routes and browser regression checks remain applicable; their entry selectors now use the top tabs and direct selector.

## Town assignment extension

`town-activity-data.js` defines the 86 town work orders and their typed preparation/work/inspection rules. `daily-quiz.js` generates reproducible twenty-question real-date sessions at six levels. Load both before `life-engine.js`; `town-activities.js` adds the work dialog after the existing destination/navigation modules. The controller in `honeybrook-life.js` remains the sole life-save writer, using its existing lock, revision/conflict checks and checkpoint. Optional `townPlans`, `townWorks`, `townResults` and `dailyQuiz` fields preserve compatibility with earlier life saves. Never create another wallet or reset existing keys for these activities.

## Bear Hollow country interface

`bear-hollow-data.js` contains the six households, neighborhood geography, fourteen work orders, strict typed work/draft validation and completion rules. It loads before the shared `life-engine.js` on both entry pages. Optional `hollow` state extends the existing life save without changing its version or existing keys. `games/honeybrook-craft-fair/bear-country.js` presents only town-portal Hollow locations; it does not activate in the Fair. Its save adapter uses the same `honeybrook-life-write` Web Lock, raw-save conflict guard and previous-state checkpoint as the life dashboard. The legacy town/Fair engine and save keys remain intact.

Cottage/venue deep links use the existing `place=` parameter; within the Hollow, `#place=…&view=inside` preserves the chosen view across refresh. Geography supplies the city-wide finder and direct selector. Original `hollow-work` entry links resolve to the new Honey House, with the porridge kitchen separately reachable. Assets and locally hosted font licenses are documented in `assets/bear-country/README.md`.

### Shared bear-country presentation

`country-scenes.js` extends the existing photo registry before scene rendering. `country-style.css` shares the approved Bear Hollow palette, bundled fonts and photographic framing across the main site and the native town/Fair portal. `country-interface.js` decorates existing district controls, adds photographic links for nested destinations and listens to the existing scene-change event. It does not write saves or change rewards. Native scene images reserve their layout; inactive images and district thumbnails load lazily. The Fair's formerly overlapping invisible hotspots are now a readable directory using their original button handlers. `honeybrook-life.js` selects a scene-specific registry photo for every existing life room.

`assets/bear-country/world-scene-manifest.json` documents the 46 generated sheets (184 views), view/tile assignments and SHA-256 hashes. Preserve the four-tile photo-helper geometry when replacing a sheet. Original Hollow scenery, local font licenses, gameplay canvases, editable paintings and geographic maps remain available. New scenery requires no external runtime service.

Run `tests/world-country.mjs` for district photographic doors, room/catalog coverage, local fonts, preserved saves and real Fair controls. `tests/district-scenery.mjs` delegates to these checks because the old absolute-hotspot geometry has been replaced with photographic destination cards. Also run navigation, classroom, city-map, life, town activity, venue, Bear Hollow and legacy browser regressions as documented above.
