#!/usr/bin/env bash
set -euo pipefail

echo "== NEXA setup =="

for dir in backend indexer storefront admin; do
  echo ""
  echo "-- $dir --"
  (cd "$dir" && npm install)
  if [ -f "$dir/.env.example" ] && [ ! -f "$dir/.env" ]; then
    cp "$dir/.env.example" "$dir/.env"
    echo "created $dir/.env from .env.example — fill in the real values before running"
  fi
done

echo ""
echo "-- contracts --"
if command -v forge >/dev/null 2>&1; then
  (cd contracts && forge install foundry-rs/forge-std --no-commit 2>/dev/null || true && forge build)
else
  echo "forge not found — install Foundry first: curl -L https://foundry.paradigm.xyz | bash && foundryup"
fi

echo ""
echo "== done =="
echo "Next: fill in each subproject's .env, then see DEPLOY.md for local run order and Vercel deployment."
