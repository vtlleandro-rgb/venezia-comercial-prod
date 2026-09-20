#!/usr/bin/env node
// Gera o array `GALERIA` (GaleriaSection.tsx) a partir de um JSON de categorias.
// Uso: node gerar-galeria.mjs categorias.json [--pasta /assets/venezia] [--video apresentacao.mp4] > galeria.tsx
//
// categorias.json:
// [
//   { "id": "fachadas-diurnas", "titulo": "Fachadas Diurnas",
//     "imagens": [["fachada-01-dia", "Fachada 01 — diurna"], ["fachada-02", "Fachada 02"]] },
//   ...
// ]
// Cada imagem é [idDoArquivoSemExtensao, textoAlt]. Verifica se o arquivo existe quando --public é informado.
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const json = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!json) { console.error("uso: gerar-galeria.mjs categorias.json [--pasta /assets/x] [--video nome.mp4] [--public client/public]"); process.exit(1); }
const PASTA = opt("--pasta", "/assets/venezia"), VIDEO = opt("--video", null), PUBLIC = opt("--public", null);

const cats = JSON.parse(fs.readFileSync(json, "utf8"));
let out = "const GALERIA: GaleriaCategory[] = [\n", n = 0, faltando = [];
if (VIDEO) out += `  {\n    id: "video",\n    titulo: "Vídeo de Apresentação",\n    imagens: [],\n    video: "${PASTA}/${VIDEO}",\n  },\n`;
for (const c of cats) {
  out += `  {\n    id: "${c.id}",\n    titulo: "${c.titulo}",\n    imagens: [\n`;
  for (const [id, alt] of c.imagens) {
    n++;
    const src = `${PASTA}/${id}.webp`;
    if (PUBLIC && !fs.existsSync(path.join(PUBLIC, src))) faltando.push(src);
    out += `      { id: "IMG-${String(n).padStart(2, "0")}", src: "${src}", alt: "${alt.replace(/"/g, "'")}" },\n`;
  }
  out += `    ],\n  },\n`;
}
out += "];\n";
process.stdout.write(out);
console.error(`${n} imagens em ${cats.length} categorias${VIDEO ? " + vídeo" : ""}`);
if (faltando.length) { console.error("ARQUIVOS FALTANDO:\n  " + faltando.join("\n  ")); process.exit(2); }
