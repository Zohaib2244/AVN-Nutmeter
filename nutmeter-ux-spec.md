# Nutmeter: UX and layout spec (locked)

Handoff for whoever builds or styles the screen. **The UX below is final. The visual style (room art, clock face style, weather, day theme) is NOT designed yet.** `index.html` next to this file is a working reference implementation of everything here, on a flat dark background. Restyle it, but keep the geometry, behaviour and states.

## 1. What it is

An always-on, landscape-only HUD for a phone propped on a desk (target: 6.7 inch, about 932 x 430 CSS px). It shows:

1. The time (the most important thing, always the biggest element).
2. The remaining 5-hour quota of four AI coding accounts (the main limits info).
3. Weekly quota and extras on demand (secondary).

Plain HTML, CSS and JS. No framework needed. OLED friendly (near-black background, few bright pixels).

## 2. Accounts and order (fixed)

Two provider groups of two. Left to right:

| Slot | Provider | Label | Notes |
|---|---|---|---|
| 0 | Codex | Work | 2 spare resets |
| 1 | Codex | Halal | 1 spare reset |
| 2 | Claude | Work | has a Fable (weekly single-model) quota |
| 3 | Claude | Halal | |

The server may return them in any order. Sort by provider (Codex first), then label (Work first).

## 3. Screen modes

Two modes, switched with a button, remembered on the device (`localStorage`, key `nutmeter.v1`, field `showLimits`).

**Limits shown (default)**
- Clock, centred in the upper area. 24-hour `HH:MM`, no seconds, no AM/PM. **No date.**
- Four limit slots along the bottom.
- Hide icon (eye-off) top left. Status dot top right.

**Clock only**
- Clock grows to fill the screen, date appears under it (`Tue 27 Oct`).
- "Show limits" button at the bottom centre.
- Status dot still top right.
- Alert pill top left, **only** when some 5-hour limit is under 25%: `Claude Halal · 7% · 1h 22m`, coloured yellow or red by the same rules as the pills. Nothing else changes. If status is offline, do not show the pill (the data is untrusted).

## 4. Geometry

Everything is sized in `cqw` (1% of stage width). The stage is always 932:430 and is scaled to fit the screen. Values at 932 px wide in brackets.

| Element | Spec |
|---|---|
| Stage | aspect 932:430, container-type inline-size, background `--bg` |
| Clock (limits shown) | font-size 23cqw (214 px), weight 500, tabular numerals, centred in the box from top to 17cqw above the bottom |
| Clock (clock only) | font-size 28cqw, box ends 6cqw above the bottom. Date 3.4cqw, 1.4cqw below the clock |
| Slot | 21.5cqw wide (200 px) x 10.4cqw tall (97 px), bottom edge 4.2cqw (39 px) above the stage bottom |
| Slot left edges | 1.7, 24.5, 51.4, 74.2 cqw (1.3cqw gap inside a pair, 5.4cqw between pairs) |
| "resets in" line | top of the slot, 3.4cqw tall, font 2.1cqw, centred, muted |
| Pill | 7cqw tall (65 px), fully rounded, starts 3.4cqw below the slot top |
| Pill contents | left: provider icon in a 4.4cqw box (glyph 3.2cqw) then label (Work / Halal) at 2.6cqw; right: 5-hour % at 3.2cqw, weight 500 |
| Fill | from the left, width = % left. The track behind is `--track` |
| Hide icon | 5cqw (47 px) round button, top 1.6cqw, left 1.6cqw, glyph 3cqw |
| Status dot button | 5cqw tall, right 1.6cqw, top 1.6cqw. Dot is 1.6cqw. Optional word at 2.1cqw to its left |
| Show limits button | bottom 0.8cqw, 4.8cqw tall, min-width 22cqw, centred |
| Minimum touch target | 44 px. Slot is 200x97, buttons 47 px. Keep it that way. |

## 5. Slot content

Resting (what you see by default):

```
        resets in 3h 03m        <- 5-hour reset countdown, small and muted
 ( icon  Work             94% )  <- pill: icon, label, 5-hour % left
```

The reset countdown must always be visible by default. The pill is the main focus, so the countdown stays small and quiet.

Formats:
- 5-hour reset: `resets in 3h 03m` (>= 1 h), `resets in 42m`, `resets in <1m`, and `resetting now` when the time has passed.
- Weekly reset: `5d 17h` (>= 1 day), then `3h 03m`, `42m`, `<1m`, `now`.
- Percent values are integers, clamped 0 to 100.

## 6. Tap to peek at weekly

Tap a slot:
1. The "resets in" line fades out.
2. The pill slides up 3.4cqw into its place (`transform`, 250 ms).
3. Under it fades in one line: `7D  64%  5d 17h` (muted label, bright %, muted reset). If weekly is under 25% the % takes the yellow or red tone.
4. If the account has extras, a second smaller line fades in below: `Fable 100%` and/or `2 spare resets`, joined by ` · `.
5. A thin countdown line at the bottom edge of the stage shows the time until it closes.

Rules:
- Only one slot can be open at a time. Tapping another slot switches to it.
- Closes after 6 s, or when you tap the same slot again.
- Nothing else shifts. The slot's box is reserved, so layout never jumps.
- Do not re-render the slots while one is open (the reference defers it).
- Reduced motion: no slide, no fades, no countdown animation. State changes instantly.
- Keyboard: slots are focusable, Enter or Space toggles.

## 7. Low quota (5-hour %, and weekly % when shown)

| % left | Fill | Notes |
|---|---|---|
| 25 and above | provider tint at 40% opacity | normal |
| under 25 | yellow `--warn` at 80% | plus a very faint diagonal hatch on the fill |
| under 10 | red `--crit` at 80% | plus the same hatch |

- **No icons or badges** for low states (a decision). The % number is always shown as a number, and the faint hatch is the non-colour cue. Do not make the hatch louder: the earlier bold version was rejected as "out of the whole theme".
- Pill size never changes. Text colour does not change (stays cream).
- The "resets in" line keeps its normal muted colour.
- Thresholds are strict: `< 25` yellow, `< 10` red.

## 8. Provider colours and icons

- Treatment: **tinted fill.** Codex fill is periwinkle, Claude fill is mauve. The icon is cream.
- Icons: use the official **Codex** and **Claude** icons. Put each in `ICONS.cx` and `ICONS.cl` in the reference file as an `<svg viewBox>` using `currentColor`. The two in the reference are placeholders, not the real logos.
- The tints must stay clearly separate from the warning yellow and red at every point of the colour drift.

## 9. Colour drift (burn-in protection, a decision)

The accent colours slowly travel and return, so no pixel stays one colour. Nothing moves.

- `--ok` (shared accent, also gives the clock a 10% tint): hue 262 to 292 and back. 42% saturation, 72% lightness.
- `--cx` (Codex): hue 232 to 262, 46%, 74%.
- `--cl` (Claude): hue 322 to 292, 42%, 74%.
- One full loop is 2 hours, using a cosine ease. Updated every 20 s. Add `?fast=1` to the URL to see a 14 s loop.
- Keep Codex and Claude hues at least 30 degrees apart, and away from yellow (about 45) and red (about 5).

## 10. Status (top right)

Tapping the status dot shows a small toast with the message for 5 s (tap again to close).

| State | Dot | Word | Limits | Toast text |
|---|---|---|---|---|
| LIVE | small filled dim dot | none | normal | `Updated just now.` |
| STALE (data older than 15 min) | filled yellow | `20m ago` | 78% opacity | `Last update was 20m ago. Retrying every 30 s.` |
| OFFLINE (last fetch failed) | hollow ring | `offline` | last known values at 50% opacity | `Can't reach the Nutmeter server. Nothing is lost; retrying every 30 s.` |
| EMPTY (fetch ok, no accounts) | hollow ring, dim | none | replaced by a message | `No limits reported yet.` |
| BOOT (first fetch pending) | filled mute dot | `reading` | four skeleton pills | `Reading limits…` |

- EMPTY message, centred in the slot area: **"No limits reported yet. They show up once T3 Code has checked Codex or Claude."**
- BOOT shows `Reading limits…` above the skeleton pills.
- OFFLINE with no data at all ever loaded: show the offline message in the slot area instead.
- The clock never depends on the server and always works.
- Never use a banner over the clock.

## 11. Data

Poll every 30 s, 8 s timeout, `cache: no-store`. The UI only knows this internal shape:

```
account = { id, provider:'cx'|'cl', label:'Work'|'Halal', spare:int,
            five:{pct, resetsAt:ms}, week:{pct, resetsAt:ms}, fable:{pct}|null }
```

`adapt()` in the reference converts the server response into it. **The real server response format is not known yet.** This is the proposal the reference expects (change `adapt()` if the real one differs):

```json
{ "updated": "2026-10-27T15:40:00Z",
  "accounts": [
    { "id": "codex-work", "provider": "codex", "label": "Work", "spareResets": 2,
      "fiveHour": { "pct": 94, "resetsAt": "2026-10-27T18:43:00Z" },
      "weekly":   { "pct": 64, "resetsAt": "2026-11-02T08:40:00Z" } },
    { "id": "claude-work", "provider": "claude", "label": "Work", "spareResets": 0,
      "fiveHour": { "pct": 82, "resetsAt": "..." },
      "weekly":   { "pct": 89, "resetsAt": "..." },
      "fable":    { "pct": 100 } }
  ] }
```

Reset countdowns are computed from `resetsAt` and the device clock, so they stay correct between polls. Set `CFG.limitsUrl` to use a real server. With `null` it uses built-in sample data.

## 12. Testing the states

Add `?demo=` to the page URL: `low`, `stale`, `offline`, `empty`, `boot`. `?fast=1` speeds up the colour drift. To reset the remembered mode, clear `localStorage`.

## 13. Accessibility and quality bar

- Touch targets at least 44 px, visible focus states (a 0.4cqw cream ring on the pill), buttons labelled with `aria-label`.
- Respect `prefers-reduced-motion`.
- Warnings never rely on colour alone: the number is always shown and the hatch is the extra cue.
- Text on fills has a dark text-shadow outline for legibility. Keep some form of that when restyling.
- No text smaller than about 2cqw (19 px at 932 wide).

## 14. Not decided yet (needs input before or during the visual phase)

1. **Visual style:** clock face style (plain, flip, glow), the lofi room and weather scene behind it, and the cat, lamp and window art. The earlier art brief (`nutmeter-art-brief.md`) predates this UX, and the CRT screen in it is no longer needed because the quota UI sits directly on the screen. It will need updating.
2. **Day theme:** the reference only has the dark palette. Theme (Auto, Day, Night, saved on the device) was in the original brief but has no control in this UX yet. Suggestion: a long press on the clock opens a small settings sheet.
3. **Colon:** static in the reference. A slow blink is possible but not decided.
4. **Reset-time rounding and the exact "now" behaviour** at the moment a window resets.
5. **Real server response format and the real logos** (see sections 8 and 11).
