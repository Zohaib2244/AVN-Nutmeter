// One-off: self-host Nunito (rounded, warm) for the lofi look. Writes avn/fonts/nunito-*.woff2 and looks/fonts-lofi.css.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const css = await (await fetch("https://fonts.googleapis.com/css2?family=Nunito:wght@500..800&display=swap", { headers: { "User-Agent": UA } })).text();
const blocks = [...css.matchAll(/\/\* ([a-z-]+) \*\/\s*(@font-face \{[^}]+\})/g)].filter((m) => m[1] === "latin" || m[1] === "latin-ext");
const out = ["/* Nunito, self-hosted by scripts/vendor-lofi-font.mjs (latin + latin-ext). */"];
for (const [, subset, face] of blocks) {
  const remote = /url\((https:[^)]+\.woff2)\)/.exec(face)[1];
  const name = `nunito-${subset}.woff2`;
  fs.writeFileSync(path.join(ROOT, "avn", "fonts", name), Buffer.from(await (await fetch(remote)).arrayBuffer()));
  out.push(`/* ${subset} */\n${face.replace(remote, `/avn/fonts/${name}`)}`);
}
fs.writeFileSync(path.join(ROOT, "looks", "fonts-lofi.css"), out.join("\n") + "\n");
console.log(blocks.length, "faces");
