# Honeybrook dialogue coverage review

Reviewed the current repository's 182 JavaScript/HTML files and the live front-page voice controls. This is a source coverage review plus targeted regression checks, not an audition of all 227 character profiles or a completed playthrough of every saved story path.

## Adjustments

- Town-walk `#hbWalkResponse` now identifies its active bear and joins the shared caption scanner. Revealing, changing and closing this panel use the same voice owner as the other conversations.
- Nell's older “Nell. Nell. Come and see.” replay now uses the Guardian Goddess profile through the shared owner instead of picking the first British browser voice.
- Remaining legacy speech-synthesis calls inside the persistent player route through the shared owner as narration unless they explicitly identify a character. This includes embedded office read-aloud functions; an unknown caller is not silently cast as an established bear.
- Quoted conversations split into ordered narration and named-character turns. Attribution covers the authored cast aliases rather than only seven main characters. Unknown voices retain the explicitly supplied context or Narrator. Non-speaking roles do not gain a voice. Goldilocks and adult Baby Bear retain their chapter-selected age stage.
- Active service speech stops if its originating caption is removed, hidden or replaced. Cinematic Pause, Next and Close stop speech, and automatic cinematic advance waits while its caption is still speaking.
- The next voice turn can prepare while the current turn plays. Initial prefetch uses the actual first planned turn, and canceled scenes cannot restart a delayed prefetch after configuration loading.
- Fixed automatic browser fallback being suppressed by the service request's duplicate-detection stamp when no Narakeet key is configured.

## Validation and limits

`tests/dialogue-lines.cjs`, `tests/character-voices.cjs`, `tests/service-voices.cjs` and `tests/audio-ducking.cjs` pass. The new planner checks turn order, unchanged spoken words, adult/elder stages, unknown-speaker fallback and non-speaking roles. The existing audio tests check one speaker, cancellation, mute, volume and 12% soundtrack ducking.

The live browser displayed Game Sound, Music, Connect voices, Dialogue Auto, Stop voice, Character voices, and Hear this on Sammy's welcome caption. No credential was inspected. Actual Narakeet voice quality, all individual voice IDs and every branching story scene have not been auditioned end to end. Ambiguous untagged prose can still use Narrator. Plain instructional text is not automatically treated as a named character speaking. Honeybrook's ten-scene opening overview now uses a dedicated older female storyteller (Narakeet Martha, pace 0.94), chosen for warm, expressive grandmother narration. The unchanged caption is its speech source. Automatic advance waits for narration; Pause/Resume, manual scene changes and Skip control speech. `tests/intro-narration.cjs` covers the ten scenes and preserves Journey records; the service tests cover pause before prepared audio begins. Live listening review of this selected voice remains outstanding. Earlier uploaded MP3 samples have not been identified as the source of generated voices.

Existing save keys, finances, story progression and manuscript text were not changed.
