// Self-host the fonts the AVN styles import from Google Fonts, so the dashboard
// never waits on (or leaks requests to) a third party. Re-run after updating avn/styles.
// Keeps the latin and latin-ext subsets only.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "avn");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const FONT_DIR = path.join(ROOT, "fonts");
fs.mkdirSync(FONT_DIR, { recursive: true });

for (const style of fs.readdirSync(path.join(ROOT, "styles"))) {
  const file = path.join(ROOT, "styles", style, "fonts.css");
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, "utf8");
  const url = /@import url\("([^"]+)"\)/.exec(src)?.[1];
  if (!url) { console.log(style, "already local"); continue; }
  const css = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
  const blocks = [...css.matchAll(/\/\* ([a-z-]+) \*\/\s*(@font-face \{[^}]+\})/g)].filter((m) => m[1] === "latin" || m[1] === "latin-ext");
  const out = [`/* ${style} fonts, self-hosted by scripts/vendor-fonts.mjs (latin + latin-ext). */`];
  for (const [, subset, face] of blocks) {
    const remote = /url\((https:[^)]+\.woff2)\)/.exec(face)[1];
    const name = crypto.createHash("sha1").update(remote).digest("hex").slice(0, 12) + ".woff2";
    const dest = path.join(FONT_DIR, name);
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, Buffer.from(await (await fetch(remote)).arrayBuffer()));
    out.push(`/* ${subset} */\n${face.replace(remote, `/avn/fonts/${name}`)}`);
  }
  fs.writeFileSync(file, out.join("\n") + "\n");
  console.log(style, blocks.length, "faces");
}
