#!/bin/bash
# Vérify SHA-256 integrity of reference/ directory
# Usage: bash tools/check-reference-integrity.sh [--update]

set -e

CHECKSUMS_FILE="reference/.checksums"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if [ "$1" = "--update" ]; then
  echo "Updating reference/ checksums..."
  find reference -type f -name "*.md" | sort | xargs sha256sum > "$CHECKSUMS_FILE"
  echo "✓ Checksums updated in $CHECKSUMS_FILE"
  exit 0
fi

if [ ! -f "$CHECKSUMS_FILE" ]; then
  echo "✗ Checksums file not found: $CHECKSUMS_FILE"
  echo "  Run: bash tools/check-reference-integrity.sh --update"
  exit 1
fi

echo "Checking reference/ integrity..."
cd "$REPO_ROOT"

# Recalculate current checksums and compare
TEMP_FILE=$(mktemp)
find reference -type f -name "*.md" | sort | xargs sha256sum > "$TEMP_FILE"

if diff -q "$CHECKSUMS_FILE" "$TEMP_FILE" > /dev/null 2>&1; then
  echo "✓ reference/ integrity verified"
  rm "$TEMP_FILE"
  exit 0
else
  echo "✗ reference/ has been modified:"
  diff "$CHECKSUMS_FILE" "$TEMP_FILE" || true
  rm "$TEMP_FILE"
  echo ""
  echo "If this is intentional, run:"
  echo "  bash tools/check-reference-integrity.sh --update"
  exit 1
fi
