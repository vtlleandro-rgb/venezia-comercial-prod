#!/usr/bin/env node
// Converte PNG/JPG de uma pasta em WebP leves, com nome em slug, e grava manifest.json.
// Uso: node comprimir-imagens.mjs <origem> <destino> [--max 1800] [--q 82] [--plantas-q 86] [--plantas-max 2400]
// Requer: npm i sharp   (rode numa pasta de trabalho fora do repositório)
import sharp from "sharp";
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? Number(args[i + 1]) : d; };
const [origem, destino] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!origem || !destino) { console.error("uso: comprimir-imagens.mjs <origem> <destino> [--max N] [--q N]"); process.exit(1); }
const MAX = opt("--max", 1800), Q = opt("--q", 82), PMAX = opt("--plantas-max", 2400), PQ = opt("--plantas-q", 86);

const slug = (s) => s.replace(/\.(png|jpe?g)$/i, "").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/\s*-\s*/g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
const arquivos = fs.readdirSync(origem, { recursive: true })
  .filter((f) => /\.(png|jpe?g)$/i.test(f) && !path.basename(f).startsWith("._"))
  .map((f) => path.join(origem, f));
fs.mkdirSync(destino, { recursive: true });

let antes = 0, depois = 0; const manifest = [];
for (const f of arquivos.sort()) {
  const nome = path.basename(f).normalize("NFC"), id = slug(nome);
  const planta = /planta|implanta/i.test(nome);
  const out = path.join(destino, `${id}.webp`);
  await sharp(f).rotate()
    .resize({ width: planta ? PMAX : MAX, height: planta ? PMAX : MAX, fit: "inside", withoutEnlargement: true })
    .webp({ quality: planta ? PQ : Q, effort: 6, alphaQuality: 100 })
    .toFile(out);
  const a = fs.statSync(f).size, d = fs.statSync(out).size; antes += a; depois += d;
  const m = await sharp(out).metadata();
  manifest.push({ id, origem: nome, file: `${id}.webp`, kb: Math.round(d / 1024), dim: `${m.width}x${m.height}` });
  console.log(id.padEnd(40), `${Math.round(a / 1024)} KB`.padStart(9), "->", `${Math.round(d / 1024)} KB`.padStart(8), `${m.width}x${m.height}`.padStart(11));
}
fs.writeFileSync(path.join(destino, "manifest.json"), JSON.stringify(manifest, null, 1));
console.log(`\n${manifest.length} imagens | ${(antes / 1048576).toFixed(1)} MB -> ${(depois / 1048576).toFixed(2)} MB (-${100 - Math.round((depois / antes) * 100)}%)`);
console.log(`manifest: ${path.join(destino, "manifest.json")}`);
