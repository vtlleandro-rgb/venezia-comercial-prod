#!/usr/bin/env node
// Prancha numerada (contact sheet) de todas as imagens de uma pasta, para conferência visual.
// Uso: node contact-sheet.mjs <pasta> <saida.png> [--cols 3] [--w 460] [--h 340] [--filtro REGEX]
// Requer: npm i sharp
import sharp from "sharp";
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const [pasta, saida] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!pasta || !saida) { console.error("uso: contact-sheet.mjs <pasta> <saida.png> [--cols N] [--filtro REGEX]"); process.exit(1); }
const COLS = Number(opt("--cols", 3)), W = Number(opt("--w", 460)), H = Number(opt("--h", 340));
const filtro = opt("--filtro", null) ? new RegExp(opt("--filtro"), "i") : null;

const files = fs.readdirSync(pasta, { recursive: true })
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !path.basename(f).startsWith("._"))
  .filter((f) => !filtro || filtro.test(path.basename(f).normalize("NFC")))
  .sort((a, b) => a.normalize("NFC").localeCompare(b.normalize("NFC"), undefined, { numeric: true }))
  .map((f) => path.join(pasta, f));
if (!files.length) { console.error("nenhuma imagem"); process.exit(1); }

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const comp = [];
for (let i = 0; i < files.length; i++) {
  const rotulo = `${i + 1}. ${path.basename(files[i]).normalize("NFC").replace(/\.\w+$/, "")}`;
  const img = await sharp(files[i]).rotate().resize(W, H - 30, { fit: "contain", background: "#1a1a2e" }).toBuffer();
  const lbl = Buffer.from(`<svg width="${W}" height="30"><rect width="${W}" height="30" fill="#c62828"/><text x="6" y="20" font-family="sans-serif" font-size="13" fill="white">${esc(rotulo)}</text></svg>`);
  const x = (i % COLS) * W, y = Math.floor(i / COLS) * H;
  comp.push({ input: lbl, left: x, top: y }, { input: img, left: x, top: y + 30 });
}
await sharp({ create: { width: W * COLS, height: H * Math.ceil(files.length / COLS), channels: 3, background: "#111" } })
  .composite(comp).png().toFile(saida);
console.log(`${saida}: ${files.length} imagens`);
