#!/usr/bin/env bash
# Comprime um vídeo de apresentação para web (H.264 1080p, CRF 26) e gera o poster.
# Uso: comprimir-video.sh <entrada.mp4> <saida.mp4> [largura=1080] [crf=26]
# Requer ffmpeg (ou: npm i ffmpeg-static e exporte FFMPEG=$(node -p "require('ffmpeg-static')")).
set -euo pipefail
IN="$1"; OUT="$2"; W="${3:-1080}"; CRF="${4:-26}"
FF="${FFMPEG:-ffmpeg}"
POSTER="${OUT%.mp4}-poster.webp"

"$FF" -y -hide_banner -loglevel error -i "$IN" \
  -vf "scale=${W}:-2" -c:v libx264 -preset medium -crf "$CRF" -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 128k "$OUT"

# poster do segundo 3 (PNG via pipe -> WebP); se não houver sharp, gera JPEG com o próprio ffmpeg
if node -e "require.resolve('sharp')" 2>/dev/null; then
  "$FF" -y -hide_banner -loglevel error -ss 3 -i "$OUT" -frames:v 1 -f image2 -c:v png - \
    | node -e "const s=require('sharp');let b=[];process.stdin.on('data',c=>b.push(c)).on('end',()=>s(Buffer.concat(b)).webp({quality:80}).toFile('$POSTER'))"
else
  POSTER="${OUT%.mp4}-poster.jpg"
  "$FF" -y -hide_banner -loglevel error -ss 3 -i "$OUT" -frames:v 1 -q:v 4 "$POSTER"
fi

echo "video : $OUT ($(du -h "$OUT" | cut -f1))"
echo "poster: $POSTER ($(du -h "$POSTER" | cut -f1))"
"$FF" -hide_banner -i "$OUT" 2>&1 | grep -E "Duration|Video:" | sed 's/^ *//'
echo 'no JSX: <video controls playsInline preload="none" poster="/assets/.../poster.webp" src="/assets/.../video.mp4" />'
