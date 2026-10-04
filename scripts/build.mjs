// Builds the site into _site/, replacing {{PLACEHOLDERS}} in .html files with the values
// from site.config.json. No dependencies; needs Node 18+.
//
//   node scripts/build.mjs                build (fails if the config is incomplete)
//   node scripts/build.mjs --preview      build even with an empty config (placeholders stay visible)
//   node scripts/build.mjs --config x.json --out dir

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);

const configPath = resolve(root, option("--config", "site.config.json"));
const outDir = resolve(root, option("--out", "_site"));
const preview = flag("--preview");

// config key -> placeholder used in the HTML
const placeholders = {
  contactEmail: "CONTACT_EMAIL",
  countryOrState: "COUNTRY_OR_STATE",
};

// Everything in the repo is published except these.
const excluded = new Set([".git", ".github", ".gitignore", "node_modules", "scripts", "_site", "README.md", "site.config.json", "package.json"]);

const config = JSON.parse(readFileSync(configPath, "utf8"));

const problems = [];
for (const key of Object.keys(placeholders)) {
  if (typeof config[key] !== "string" || config[key].trim() === "") problems.push(`"${key}" is empty in ${configPath}`);
}
if (config.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) {
  problems.push(`"contactEmail" does not look like an email address: ${config.contactEmail}`);
}
if (problems.length && !preview) {
  console.error("Cannot build:\n  - " + problems.join("\n  - ") + "\n(Use --preview to build anyway.)");
  process.exit(1);
}

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
// Copy entry by entry: cpSync refuses to copy the repo root into a subfolder of itself (_site).
for (const name of readdirSync(root)) {
  if (excluded.has(name) || resolve(root, name) === outDir) continue;
  cpSync(join(root, name), join(outDir, name), { recursive: true });
}

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith(".html")) yield p;
  }
}

for (const file of htmlFiles(outDir)) {
  let html = readFileSync(file, "utf8");
  for (const [key, token] of Object.entries(placeholders)) {
    const value = (config[key] ?? "").trim();
    if (value) html = html.replaceAll(`{{${token}}}`, escapeHtml(value));
  }
  const left = html.match(/\{\{[A-Z_]+\}\}/g);
  if (left && !preview) {
    console.error(`Unreplaced placeholder(s) in ${file}: ${[...new Set(left)].join(", ")}`);
    process.exit(1);
  }
  writeFileSync(file, html);
}

console.log(`Built ${existsSync(outDir) ? outDir : ""}${preview && problems.length ? " (preview: placeholders left in place)" : ""}`);
