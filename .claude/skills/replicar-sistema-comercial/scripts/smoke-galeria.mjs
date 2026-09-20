#!/usr/bin/env node
// Abre o site no Chromium, clica em cada aba da galeria e reporta imagens quebradas e respostas HTTP >= 400.
// Uso: node smoke-galeria.mjs http://127.0.0.1:8090/ [--chromium /opt/pw-browsers/chromium-1194/chrome-linux/chrome]
// Requer: npm i playwright  (em ambientes com Chromium pré-instalado, passe --chromium em vez de "playwright install")
// Sirva o build antes: (cd dist/public && python3 -m http.server 8090 & echo $! > srv.pid); ... ; kill $(cat srv.pid)
import { chromium } from "playwright";

const args = process.argv.slice(2);
const url = args.find((a) => a.startsWith("http"));
const i = args.indexOf("--chromium");
const launch = i >= 0 ? { executablePath: args[i + 1] } : {};
if (!url) { console.error("uso: smoke-galeria.mjs <url> [--chromium <caminho>]"); process.exit(1); }

const b = await chromium.launch(launch);
const p = await b.newPage({ viewport: { width: 1360, height: 900 } });
const falhas = [];
p.on("response", (r) => { if (r.status() >= 400 && /\/assets\//.test(r.url())) falhas.push(`${r.status()} ${r.url().split("/").pop()}`); });
await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } });

const abas = await p.locator("#galeria button").allInnerTexts();
const porAba = {};
for (const a of abas) {
  const nome = a.replace(/\s*\(\d+\)\s*$/, "").trim();
  await p.locator("#galeria button", { hasText: nome }).first().click();
  await p.waitForTimeout(600);
  porAba[nome] = await p.evaluate(() => document.querySelectorAll("#galeria img").length);
}
await p.waitForTimeout(1200);
const info = await p.evaluate(() => ({
  quebradas: [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src")),
  video: document.querySelector("#galeria video")?.getAttribute("src") || null,
  preload: document.querySelector("#galeria video")?.getAttribute("preload") || null,
  plantas: document.querySelectorAll("#plantas h3").length,
  contador: document.body.innerText.match(/\d+ imagens em \d+ categorias/)?.[0] || null,
}));
console.log("imagens por aba:", JSON.stringify(porAba));
console.log(JSON.stringify(info));
console.log("HTTP>=400:", falhas.length, falhas.slice(0, 10));
await b.close();
process.exit(info.quebradas.length || falhas.length ? 1 : 0);
