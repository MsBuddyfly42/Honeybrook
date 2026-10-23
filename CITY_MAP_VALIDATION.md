# Unified Honeybrook city map

The previous release connected districts through links but did not show the whole city on one map. `city-map.js` adds a single scenic map containing the thirteen districts, Honeybrook town centre and Bear Hollow. The existing district graph is retained and extended in this map with town-centre streets and the Bridgeview/Outskirts routes to Bear Hollow. Selecting an area shows the connected route and its existing places. City-wide search opens the real venue or original room engine. The Fair remains a separate gate outside the city graph.

Enter Honeybrook and the Town/Map/Walk controls open the shared map. Existing district scenes and venue entrances have a return to the city map. Original town-engine rooms also have a city-map link; entries from this map continue an existing valid save automatically instead of asking the same player to start again. First-time visitors still use the existing name/start flow. Individual scenic neighborhood views remain available as detailed local views.

This is an additive navigation change. Existing classroom/room images, game mechanics, save keys and progress formats are unchanged. Only a new session-storage position is stored by the map. No new service, backend, database or runtime cost is introduced. The new scenic map is generated using the original Honeybrook town image as reference and stored locally in `assets/honeybrook-city.webp`.

Local checks run at 1440px and 390px:

- `tests/city-map.mjs`: all fifteen city areas, all thirteen district entrance/return journeys, searchable classroom and venue scenes, town-centre and Bear Hollow cottage/workshop entrances, existing-player continuation, separate Fair gate and return, keyboard selection, zoom/fit and no page overflow. Existing game identity/coins/ribbons/property, learning status and life records are retained.
- `tests/connected-town.mjs`: all thirteen districts round-trip through the established room engine; all 86 venues expose their original town connection; Bear Hollow cottage/workshop/footbridge trips; separate Fair; existing progress retained.
- `tests/browser.mjs`: previous visits/actions/journal, walk/save/reload, display settings, keyboard/dialogs, Fair start/continue, backup export/restore validation, purchase prices/funds and bakery entry remain working.

Live verification is reported after deployment; these local checks do not constitute exhaustive live testing of every activity or the broader standing world-system preferences.
