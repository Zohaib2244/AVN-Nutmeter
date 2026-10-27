# AVN Nutmeter

A glanceable always-on screen for your AI quota limits (Codex and Claude, including the weekly Fable limit) plus a clock with a bit of personality. It reads the usage windows from your local T3 Code server and serves a small web page you open on a phone.

Built on the **avn-design** skill: the real AVN Family, Nutstyle and Pocket styles, swappable live from the in-app settings.

## Run

```
node server.mjs          # HOST=0.0.0.0 PORT=8787 by default in the LaunchAgent
```

| URL | What |
|---|---|
| `/family`, `/nut`, `/pocket` | the app, starting in that AVN style |
| `/app` | the app with your saved style |
| `/pick` | a chooser (also lists the earlier standalone designs `/classic`, `/v1` to `/v4`) |

Presets work in the URL: `/app?style=pocket&palette=grape&theme=night&layout=table&fable=0`.
`/app#settings` opens the settings; `/app#mock=low` (or `offline`, `empty`) shows the warning, offline and empty screens with fake data.

## Limits and clock faces

The limits column is optional: the chart button in the top bar (or `G`) fades the panels out one by one, closes the column, and the clock grows and settles in the middle. Turn it back on and the column opens and the panels pop in.

Five clock faces (face button, `C`, or Settings): **Dora** (the cat on the monitor), **Flip** (split-flap cards you can tap), **Sky** (a pixel sky; drag it sideways to look at another time), **Dash** (Dora runs along blocks; tap to jump; she plays herself until you do) and **Terminal** (a command line on the mini PC; tap the prompt and type `help`).
Each face scales with the room it has, so they are bigger when the limits are hidden.

## Settings (gear, or `S`)

Clock face · style · colour (every palette of the style) · day / night / auto-by-clock · show limits · Fable on or off · panels or table · 24-hour · seconds · flip clicks (sound) · dim at night (23:00 to 6:00) · keep the screen awake. Saved on the device. Reset has an Undo (secrets and nuts are kept).

Shortcuts: `S` settings, `G` limits, `C` next face, `F` Fable, `T` auto/day/night, `P` next colour, `Y` next style, `L` layout, `Space` or `Up` jump in Dash, `Esc` close.
Controller: `Y` Fable, `X` colour, bumpers style, triggers face, Back limits, Start settings.

## Self-hosted

The skill's CSS and fonts are vendored in `avn/` and served by `server.mjs` (`/avn/*`, path-traversal safe). Fonts are fetched once by `node scripts/vendor-fonts.mjs`, so the page makes no third-party requests.

## Secrets (spoilers)

Seventeen of them, tracked in Settings.

- Konami code (keys, swipes plus taps, or controller) · pet Dora three times · pet her too much · tap the logo five times · be here at 11:11 · be up in the small hours · see a tank hit 0% · try every colour of one style.
- Flip: flip the cards to read `2469` (the gamer tag), or flip 100 times. Tap the colon for seconds.
- Sky: drag through a full day (Time traveller), tap the sun three times (Two suns), tap five stars (Star gazer).
- Dash: collect 2469 nuts in total (Full stash), die nine times (Nine lives), score 100 in a run (Good run).
- Terminal: `sudo`, `ls`, `cat dora.txt`, `hello`, `reboot`, `2469` and a few more are not in `help`. `limits`, `fable`, `theme`, `style` and `face` drive the dashboard itself.
- Tapping a sleeping Dora wakes her for a few seconds.
