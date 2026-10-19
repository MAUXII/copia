#!/usr/bin/env bash
# Installs registry items into a fresh Next.js + shadcn app and type-checks it.
# Usage: bash scripts/smoke-install.sh <slug> [slug...]   (run `npm run registry` first)
set -euo pipefail

if [ $# -eq 0 ]; then
  echo "usage: bash scripts/smoke-install.sh <slug> [slug...]" >&2
  exit 2
fi

ROOT="$(pwd)"
APP="$(mktemp -d)/smoke-app"

npx --yes create-next-app@15 "$APP" --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm --turbopack --yes >/dev/null
cd "$APP"
npx --yes shadcn@latest init -y -b radix -p nova --no-monorepo >/dev/null
for slug in "$@"; do
  # Copy the item next to the app: shadcn treats Windows absolute paths as URLs.
  cp "$ROOT/public/r/$slug.json" "./_$slug.json"
  npx --yes shadcn@latest add -y "./_$slug.json" >/dev/null
  echo "✓ installed $slug"
done
npx tsc --noEmit
echo "✓ type-check passed for: $*"
