#!/usr/bin/env bash
set -e

TMPFILE="/tmp/vercel-deploy-$$-output.json"

# Deploy — capture stderr (where JSON is emitted) to a temp file
vercel deploy --prod -b NODE_ENV=production --json --non-interactive 2>"$TMPFILE"

# Print stdout (progress info) to the user
# Parse the JSON from the stderr capture file
PROD_URL=$(python3 -c "import json; print(json.load(open('$TMPFILE'))['deployment']['url'])")

if [ -n "$PROD_URL" ]; then
  echo "Opening $PROD_URL"
  open "$PROD_URL"
else
  echo "Deployment complete — check Vercel dashboard"
fi

rm -f "$TMPFILE"
