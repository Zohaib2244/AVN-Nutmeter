# Art to generate

Drop files in this folder with the **exact filenames** below and they appear on the next page
reload. Nothing else to do — if a file is missing the look falls back to its painted-in-CSS version,
so you can add them one at a time.

Generate in ChatGPT, save as PNG, drop here.

---

## 1. `room.png` — the room behind the radio (radio look)

The biggest win. The clock radio currently floats on a dark gradient; this puts it in a room.
It is pushed well back (darkened ~65% and blurred by distance), so it should read as atmosphere,
not detail. **Landscape 1864 x 860** (2.17:1).

```
A cozy lofi anime-style bedroom at night, seen straight on, wide 2.17:1 landscape, soft painterly
shading with a slight grain. A desk against a warm muted purple-brown wall. On the wall: a corkboard
with notes, a couple of small framed prints, a shelf with books and a tiny plant. A warm desk lamp
glowing amber at the far left, a mug and a stack of cassette tapes on the desk. Out-of-focus and
softly lit, like a background plate — all detail gentle and low contrast, nothing sharp.
Muted warm palette: dusty purple, warm brown, cream, amber. Medium-dark, evenly lit.

Keep the middle of the image calm and empty — no objects in the central 60% width and the top 70%
height, because a clock radio sits there.

No text, no numbers, no letters, no clock, no radio, no monitor, no people, no cat, no logos,
no watermark, no border.
```

## 2. `wood.png` — the cabinet's wood (radio look)

Makes the cabinet cheeks real wood instead of a CSS gradient. Must **tile vertically** (top edge
continues into the bottom edge). It is drawn into a narrow vertical strip about 34 px wide, so the
grain should run **top to bottom**. **Square 512 x 512.**

```
A seamless tileable texture of warm walnut wood, grain running vertically from top to bottom,
rich mid-brown with darker grain lines and subtle age, soft even lighting, flat on with no
perspective and no shadows. The top edge must continue seamlessly into the bottom edge.
No text, no objects, no border, no watermark.
```

## 3. `grille.png` — speaker grille (optional, radio look)

Only if you want the cabinet to feel more like a real set. Not wired up yet — tell me when it's
here and I'll add it. Tileable, **512 x 512**, transparent background.

```
A seamless tileable speaker grille texture on a transparent background: a regular grid of small
dark round perforations with soft shading, flat on, no perspective, no border, no text.
```

---

## Not worth generating

- **Anything for the pixel look.** Image models do not produce clean pixel art — the grid comes out
  uneven and it would clash with the code-drawn digits. Dora and the digits stay hand-placed.
- **Anything for the handheld look.** It is meant to be a bare LCD; art would fight it.
- **Icons.** The Codex and Claude marks are the official vector logos already.

## Rules any art has to follow

- Landscape pieces are **2.17:1** (the screen is 932 x 430).
- No text, numbers or letters anywhere — the clock supplies those.
- Keep it mid-dark and low contrast. The screen is always on in a dark room, and bright pixels burn
  into OLED.
- Leave the centre calm. The clock is the biggest thing on screen and must stay readable.
