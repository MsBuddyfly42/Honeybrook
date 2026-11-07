# November 7 activity repair

## Repaired

- Every opening hotspot now opens a visible workspace before the existing observation can be saved. Sixteen scene-specific activities use notebook pages, family papers, conversation responses, satchel packing, a guest-book check-in, an ordered first afternoon and a research route board.
- New openings follow expanded Chapter 31: promise/dream, arrival, Sammy and the resemblance, Mabel’s check-in, washing and eating, then Amelia’s apiary walk. Earlier mid-scene saves retain their completed observations; no campaign is restarted automatically.
- Journey’s 24 later community scenes, 40 citizen cases, 32 apiary practice steps, 24 room-project steps, 60 job steps and three deliveries now open workspaces appropriate to the action. Inspect records and objects; match checked evidence to sources; move materials; clean marked surfaces; join stitches; work with the prepared vessel; count practice supplies; follow a route diagram; keep an actual written handover. Personal wording is not semantically graded.
- Nell’s existing family-story step buttons use the same workspaces, including arranging the family branch, physically opening an envelope and turning through the actual letter text. Her existing response form remains.
- Visit reflections keep the player’s actual words. Case theories still use their existing checked explanations. Accepting a request, choosing a response, resting and navigating remain deliberate one-step decisions.
- Travel in Journey changes the displayed location photograph. “You are here” replaces a redundant travel button. Equipment actions remain disabled until arriving at their destination.
- An independently saved activity notebook keeps drafts and object positions, supports reopening and downloads, and refuses to overwrite a record changed by another tab. The existing campaign saves retain their keys and validation. Restart archives this notebook before deliberately beginning again. Activity-note downloads are separate from older campaign backups.
- Cinematic popups are opt-in by default and cannot interrupt a workbench. Existing explicit cinematic preferences are retained.

- Removed the twelve old Learning Passport “Mark complete” controls. Start/Open retains the existing classroom launch; a passport button cannot claim completion without doing its work. Existing passport records remain saved.

## Existing systems reviewed

The town workbench (`town-activities.js`), connected-room hands-on work (`interior-hands-on.js` / `interiors.js`), ten location games (`map-activities.js`), venue minigames (`venue-activities.js`), fourteen research files (`nell-research-ui.js`) and continuation activities (`finale-ui.js`) already have material selection, arrangements, physical controls, evidence boards or checked forms. They are kept, rather than replaced by the Journey workspace. Shops, calendar controls and accepting a task are not treated as physical activities.

## Evidence and limits

The pure regression suite exercises 134 opening/step activity plans, all workspace mechanics, wrong-order retries, JSON draft reload and 24 legacy opening-save positions. Existing full Journey logic tests and the 729-route regression pass. Syntax checks pass for the changed runtime scripts.

This is a shared-workspace retrofit, not a physics simulation, 3D walking system, new voice production, or a new individual photograph for each step. Existing scene and action photographs accompany manipulable HTML/SVG objects. Some practical source records are explicitly prepared game exercises. No manuscript prose is rewritten by a personal reflection, and no simulated inventory becomes a real-world safety instruction.

The local Chromium process cannot launch in this executor. Production browser checks are performed separately; automated engine coverage does not certify every legacy activity or every photographic composition.
