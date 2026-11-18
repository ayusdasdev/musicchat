#!/usr/bin/env bash
# Run MusicChat locally: MongoDB + backend (:5000) + frontend (:3000).
#   ./start.sh           start everything (Ctrl+C stops it all)
#   ./start.sh --reset   wipe the local database first
# Set MONGO_URI to use an external database instead of the local one.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEV="$ROOT/.dev"

if [[ "${1:-}" == "--reset" ]]; then
  rm -rf "$DEV/db-data"
  echo "Local database cleared."
fi

# Install dependencies on first run
for dir in "$DEV" "$ROOT/musicchat-be" "$ROOT/musicchat-fe"; do
  [[ -d "$dir/node_modules" ]] || (cd "$dir" && npm install)
done

# Keep one JWT secret across runs so logins survive restarts
[[ -f "$DEV/jwt_secret" ]] || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" > "$DEV/jwt_secret"

# Job control gives each service its own process group, so stopping a group
# also stops its children (npm -> react-scripts -> webpack)
set -m
pids=()
cleanup() {
  trap - EXIT INT TERM
  echo; echo "Stopping MusicChat..."
  for pid in "${pids[@]}"; do kill -- "-$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

if [[ -z "${MONGO_URI:-}" ]]; then
  node "$DEV/mongo.js" &
  pids+=($!)
  until (echo > /dev/tcp/127.0.0.1/27017) 2>/dev/null; do sleep 0.5; done
  MONGO_URI="mongodb://127.0.0.1:27017/musicChatDatabase"
fi

(cd "$ROOT/musicchat-be" && MONGO_URI="$MONGO_URI" JWT_SECRET="$(cat "$DEV/jwt_secret")" \
  CLIENT_URL=http://localhost:3000 PORT=5000 exec node app) &
pids+=($!)

(cd "$ROOT/musicchat-fe" && BROWSER=none PORT=3000 exec npm start) &
pids+=($!)

echo "MusicChat starting -> http://localhost:3000  (Ctrl+C to stop)"
wait -n
