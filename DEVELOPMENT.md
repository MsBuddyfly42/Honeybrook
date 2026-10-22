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
