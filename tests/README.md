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
