#!/usr/bin/env bash
# Verifica referências a assets no código: cada "/assets/<pasta>/arquivo" tem arquivo? Há arquivos sem uso?
# Uso: verificar-assets.sh [pasta-de-assets=venezia] [--remover-orfaos]
# Rode na raiz do repositório.
set -u
PASTA="${1:-venezia}"; REMOVER="${2:-}"
SRC="client/src"; PUB="client/public"
miss=0
echo "=== referências sem arquivo ==="
for r in $(grep -rhoE "\"/assets/${PASTA}/[A-Za-z0-9._/-]+\.(webp|mp4|jpe?g|png|svg)\"" "$SRC" | tr -d '"' | sort -u); do
  [ -f "$PUB$r" ] || { echo "  FALTA: $r"; miss=1; }
done
[ $miss = 0 ] && echo "  OK — $(grep -rhoE "\"/assets/${PASTA}/[A-Za-z0-9._/-]+\.(webp|mp4|jpe?g|png|svg)\"" "$SRC" | sort -u | wc -l) referências únicas resolvem"
echo "=== arquivos sem referência (órfãos) ==="
orf=0
for a in "$PUB/assets/$PASTA"/*; do
  [ -f "$a" ] || continue
  b=$(basename "$a")
  if ! grep -rq "/assets/$PASTA/$b" "$SRC"; then
    orf=$((orf+1)); echo "  órfão: $b ($(du -h "$a" | cut -f1))"
    [ "$REMOVER" = "--remover-orfaos" ] && rm -f "$a" && echo "    removido"
  fi
done
[ $orf = 0 ] && echo "  nenhum"
echo "=== peso ==="; du -sh "$PUB/assets/$PASTA"
exit $miss
