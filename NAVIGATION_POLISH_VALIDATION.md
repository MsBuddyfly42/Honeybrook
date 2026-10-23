# Direct travel and photographic polish

The owner requested all area tabs together at the top of Enter Honeybrook, direct entry instead of scrolling between sections, and no refresh-time scrolling. They also requested Honeybrook's photographic bear-world identity combined with Eldoria's photographic presentation.

Both live sites were inspected. Eldoria's entrance and active photographic city screen provided the reference for the compact dark green/gold control bar, cream play area and city panel. Honeybrook's existing photographs, bears, authored places and activities are retained; no Eldoria artwork, elves or game systems were imported.

The top panel contains fifteen direct area tabs (thirteen districts, established Honeybrook town and Bear Hollow) plus a grouped selector for public rooms, original activity rooms and the original bear walking scene. The selected district appears on its own in a bounded play area; unrelated sections no longer sit between destinations. The page itself does not scroll during city play. Long activities can be read within their own content area. Home and other non-location dashboards retain their existing content.

A popup finder supports names without accents, area/activity filters, favorites and recent places. The finder opens without moving the underlying page, Escape closes it before leaving a room, and return labels match the actual map/district context. Original room-engine scenes also link directly to this finder. The Fair remains separate.

Route layout is selected before paint. Startup map/district/room restoration no longer calls scrolling or moves focus to a heading. Refresh restores the correct place without the earlier traversal of the long town page. New preferences use separate navigation keys; existing game, learning, activity and life save formats remain unchanged.

Desktop (1440px) and phone (390px) validation includes `tests/navigation-usability.mjs`, `tests/city-map.mjs`, `tests/connected-town.mjs`, `tests/world-routes.mjs` and `tests/browser.mjs`. These cover top-tab entry, direct room travel, real classroom responses, original walking/settings/journal, Bear Hollow cottage/workshop/footbridge routes, Fair separation, purchases/funds, backup validation and preservation of existing progress. Live verification is reported separately after deployment.
