# Local browser checks

Honeybrook is a static site and has no build step. Serve the repository locally:

```sh
python3 -m http.server 8792 --bind 127.0.0.1
```

In another terminal, install Playwright in a temporary directory, then point the test to its module:

```sh
npm install --prefix /tmp/honeybrook-test playwright
/tmp/honeybrook-test/node_modules/.bin/playwright install chromium
PLAYWRIGHT_MODULE=/tmp/honeybrook-test/node_modules/playwright/index.mjs node tests/browser.mjs
```

Optional: set CHROMIUM_PATH to an installed Chromium binary and TEST_URL to a different local server. Use only a local test server.

The test uses fresh browser contexts, synthetic game data, and clears test storage. It checks desktop and phone layouts, walking persistence and blur handling, school visits and journal entries, dialog accessibility, saved display preferences, Fair saves and backups, invalid backup rejection, shop balances and purchase persistence, and Bakery entry. It does not connect to a database or verify every activity in the game.

Fair progress is stored in this browser, not in a signed-in cloud account. Export a backup before clearing browser data or changing devices.

For every district door and the new destination activities, run the same command with `tests/destinations.mjs`. It checks every scene and image, Back and return navigation, garden persistence, café serving, local mail, painting and download, piano keys, the care checklist, learning puzzle, and arcade round on desktop and phone.

Run `tests/living-places.mjs` for Wally’s baking stages and one-time sharing, room decorations and wall color, timed crop growth across visits, and neighbor conversations. It uses Playwright’s clock to advance time, with isolated synthetic browser saves.

Run `tests/adventure.mjs` for house rooms and object changes, native map entry, the complete Lantern Trail, wrong-answer recovery, progress after reload, the single reward, and lantern display at home. All data stays in isolated local browser contexts.

Run `tests/venues.mjs` for the 24 venue-specific activities: bowling and golf scoring, memory pairs, quiz answers, directional sequences, film choices, orchard harvest, picnic serving, the mill, field journals, dental cleaning, station kits, clinic requests, quiet modes, sports shots, and playground movement. Use only local TEST_URL values.

Run `tests/venue-recovery.mjs` for memory-card reload recovery and a full playground run, including jumping both obstacles, saved completion, restart, and stopping held movement when the window loses focus.

`node tests/town-activities.cjs` verifies all 86 town assignments: preparation costs, typed hands-on work, delivery-only rewards, step/bypass guards, histories, relationships, valid serialized saves, three-per-day limits, unfinished preparations across rest, and all six real-date twenty-question quiz levels.

`PLAYWRIGHT_MODULE=/workspace/.honeybrook-tools/node_modules/playwright/index.mjs CHROMIUM_PATH=/usr/bin/chromium node tests/town-activities.mjs` checks every town activity entrance and exercises every work-interaction type through its actual controls at 1440px and 390px. It verifies photos, payments, recorded results, reload, quiz interruption/resume and deliberate rest. Isolated browser contexts contain only synthetic test saves.

Run `node tests/bear-country.cjs` for all fourteen Hollow projects: strict tools/work/inspection/delivery, costs and rewards, saved drafts/results, daily limits, rest, weather closures, sunset fellowship and invalid-save rejection. Run `tests/bear-country.mjs` with the Playwright environment above for all six cottage doors/interiors and all fourteen projects through actual controls at 1440px and 390px, including partial reload, backup, stale-tab protection, main-city direct routes and corrupt-save preservation. The city-map/connected-town checks now use the new Hollow interface while retaining their district, original-town, save-preservation and separate-Fair checks.

`world-country.mjs` checks the shared whole-game Bear Hollow design at 1440px and 390px: thirteen distinct district panoramas, all 86 photographic destination cards, actual entry/return, all 86 town/30 camp-room catalog records, classroom/home photos, local country fonts and unchanged synthetic save data. It also exercises the separate Fair's photographed midway games, rides, treat purchase, ribbon exchange, circus and saved reload. `district-scenery.mjs` runs these replacement integration checks rather than asserting the retired absolute-hotspot layout.

`node tests/story-engine.cjs` verifies all 71 original story sections and source Word hash, every observation/decision path, retries, once-only memories, serialization, species/history distinctions and old paid Hollow-work fixtures. `tests/story-integration.mjs` checks all 71 actual UI practices, every full chapter paragraph, all photos, 41 cast entries, 29 places, partial reload, notes, backup preview, malformed saves, newer-tab restore conflicts and untouched earlier game keys at 1440px/390px. `tests/canon-world.mjs` checks restored companions, archived finances/relationships/work, source-linked rooms, two distinct bridges, native original neighbors and supported nonspeaking Lena visits. These use isolated synthetic browser contexts, not the owner's account. `story/scene-coverage.json` and `assets/story-scenes/manifest.json` record the exact source and images.

## Book, place activities, learning and 25-cub camp

Rule checks: `node tests/chapter-games.cjs`, `node tests/map-activities.cjs`, `node tests/learning.cjs`, `node tests/camp-engine.cjs`. Browser checks: `tests/book-and-games.mjs`, `tests/map-activities.mjs`, `tests/activity-connections.mjs`, `tests/learning-camp.mjs`, `tests/camp-visit.mjs`. Use the Playwright/Chromium environment above. The camp browser test uses synthetic inventory/accounts, performs actual controls through an entire Sunday-to-Sunday visit, and verifies both desktop/phone layouts, all 35 photographic facilities, real purchases, 36 supply assignments, Wednesday notification departure, Friday prizes, Saturday family portions, Sunday farewell, next cohort, backups/reload and preserved old account data. No owner’s save is accessed.

`tests/nell.cjs` checks 22 deliberate Nell story moments and save invariants. `tests/nell.mjs` plays every moment at desktop/phone widths, including the actual post-office entrance, explicit first Harold conversation, letter gates, written response, reload/backup recovery and unchanged legacy save bytes. `tests/lingo.mjs` checks 24 words/16 sayings, Nell’s human golden-haired beekeeper profile and the real Bear Hollow elders’ immediate welcome and reincarnation belief before and after Harold. These do not modify the author’s actual saved game.

`tests/nell-research.cjs` checks fourteen files/42 decisions/eight evidence-order boards, research-before-Harold, letter-read gating and fictional family post. Expanded `tests/nell.mjs` enters every real place, handles retries and movable evidence cards, reloads, reads/tears/posts home, and preserves legacy saves. `tests/refresh.mjs` checks frame samples on five page types, stable restored routes and night mode at both viewport widths.

`tests/journey.cjs` covers the ordered opening and full 40-case community progression, seasons, supply deliveries, household projects, crew work, promises, storm priority and future-family/author-release gates. `tests/journey.mjs` plays the actual introduction, eight opening scenes, a complete citizen case with reordered evidence and a six-object room project at desktop/phone widths, including reload and other-save preservation. `tests/button-layout.mjs` audits visible control hit targets and horizontal overflow across the primary pages and Fair menu/sound states at 1440/1024/390px; it ignores controls correctly hidden in closed details and clipped scroll areas. This is a finite state audit, not exhaustive coverage of every historical mini-game state. `tests/fair-economy.cjs` and `.mjs` check actual ticket purchases, ride wristbands, game admission, prize-ticket separation, concession receipts, city revenue and Fair save/Town Hall ledger reload.
