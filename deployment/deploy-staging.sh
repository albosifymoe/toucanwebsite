#!/bin/bash
# This command deliberately has no production target or target override.
set -euo pipefail
umask 022
cd -- "$(dirname -- "$0")/.."
target=/home/toucanly/staging.toucan.ly
backups=/home/toucanly/deployment-backups

test "$(id -un)" = toucanly
test -d "$target"
test ! -L "$target"
test "$(readlink -f -- "$target")" = /home/toucanly/staging.toucan.ly
test -f dist/index.html
test -f dist/contact.html
test -f deployment/staging.htaccess
test -z "$(find dist -type l -print -quit)"
test -z "$(find "$target" -type l -print -quit)"

# Preserve the previous staging files outside every public document root.
if test -f "$target/index.html"; then
  test ! -L "$backups"
  mkdir -p -- "$backups"
  chmod 700 -- "$backups"
  archive="$backups/staging-$(date -u +%Y%m%dT%H%M%SZ)-$$.tar.gz"
  tar -czf "$archive" -C "$target" .
  chmod 600 -- "$archive"
  tar -tzf "$archive" >/dev/null
  printf 'Previous staging saved to %s\n' "$archive"
fi

# Install only browser files; repository metadata and tools remain outside web roots.
# No deletion is performed. Certificate validation files remain in place.
cp -- deployment/staging.htaccess "$target/.htaccess"
cp -R -- dist/. "$target/"
printf 'Staging deployment complete: %s\n' "$(git rev-parse HEAD)"
