#!/bin/sh
# Updates application files already copied into this directory.
# Does not delete or replace the answer database, uploads, or server env files.
set -eu

cd "$(dirname "$0")/.."

test -f package.json
test -d data

echo "keeping data/"
if [ -f data/submissions.json ]; then echo "keeping data/submissions.json"; fi
if [ -f data/survey.json ]; then echo "keeping data/survey.json"; fi
if [ -d data/uploads ]; then echo "keeping data/uploads/"; fi
if [ -f data/cms.json ]; then echo "keeping data/cms.json"; fi
for envfile in .env .env.local .env.production; do
  if [ -f "$envfile" ]; then echo "keeping $envfile"; fi
done

answers_before=""
uploads_before=""
if [ -f data/submissions.json ]; then answers_before=$(wc -c < data/submissions.json); fi
if [ -d data/uploads ]; then uploads_before=$(find data/uploads -type f | wc -l); fi

npm install --omit=dev

answers_after=""
uploads_after=""
if [ -f data/submissions.json ]; then answers_after=$(wc -c < data/submissions.json); fi
if [ -d data/uploads ]; then uploads_after=$(find data/uploads -type f | wc -l); fi

if [ "$answers_before" != "$answers_after" ] || [ "$uploads_before" != "$uploads_after" ]; then
  echo "protected data changed during install, stop" >&2
  exit 1
fi

mkdir -p tmp
touch tmp/restart.txt

if command -v passenger-config >/dev/null 2>&1; then
  passenger-config restart-app "$(pwd)" || true
fi

echo "code updated, database and uploads left in place"
