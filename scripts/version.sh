#!/usr/bin/env bash
set -euo pipefail

# Cuts a release for the DiceBear API: promotes the CHANGELOG's [Unreleased]
# section to a dated, versioned heading, then commits and tags v<version>.
#
# Unlike the dicebear/schema and dicebear/styles repos, this package is private
# and never published to a registry — its version lives only in the Git tag (the
# docker.yml workflow builds and pushes the image on a v* tag), so there is no
# manifest version field to bump. This script keeps the changelog and the tag in
# lockstep; otherwise it mirrors scripts/version.sh in those repos.
#
#   scripts/version.sh 4.5.3

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

version="${1:-}"
if [ -z "$version" ]; then
  echo "Usage: scripts/version.sh <version>" >&2
  exit 1
fi

# Sanity-check the shape (X.Y.Z with an optional -prerelease).
if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[A-Za-z0-9.]+)?$ ]]; then
  echo "Invalid version: $version" >&2
  exit 1
fi

tag="v$version"
if git -C "$ROOT" rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
  echo "Tag $tag already exists" >&2
  exit 1
fi

# Repository the changelog's compare links point at.
CHANGELOG_REPO_URL="https://github.com/dicebear/api"

# Promote the changelog's `## [Unreleased]` section to a released version:
# move its entries under a dated `## [<version>]` heading, keep a fresh empty
# Unreleased section on top, and update the bottom compare links. Mirrors
# promote_changelog() in scripts/version.sh of the dicebear/styles repo.
promote_changelog() {
  local file="$ROOT/CHANGELOG.md"
  [ -f "$file" ] || return 0

  if ! grep -Eq '^## \[Unreleased\]' "$file"; then
    echo "CHANGELOG.md: no [Unreleased] section (skipped)"
    return 0
  fi

  # Idempotent: if a previous run already promoted this version (e.g. it failed
  # after writing the changelog), don't promote the now-empty Unreleased again.
  if grep -Fq "## [$version]" "$file"; then
    echo "CHANGELOG.md: $version already present (skipped)"
    return 0
  fi

  local date tmp
  date="$(date +%F)"
  tmp="$(mktemp)"

  # POSIX awk only (no gawk-specific 3-arg match), for BSD/GNU portability. The
  # Unreleased compare link is only rewritten when it follows the conventional
  # `/compare/v<prev>...HEAD` shape; otherwise it (and the rest of the file) is
  # passed through untouched.
  awk -v version="$version" -v date="$date" -v repo="$CHANGELOG_REPO_URL" '
    /^## \[Unreleased\]/ {
      print
      print ""
      print "## [" version "] - " date
      next
    }
    /^\[Unreleased\]:.*\/compare\/v.*\.\.\.HEAD/ {
      prev = $0
      sub(/^.*\/compare\/v/, "", prev)
      sub(/\.\.\.HEAD.*$/, "", prev)
      print "[Unreleased]: " repo "/compare/v" version "...HEAD"
      print "[" version "]: " repo "/compare/v" prev "...v" version
      next
    }
    { print }
  ' "$file" > "$tmp"

  cat "$tmp" > "$file"
  rm -f "$tmp"
  echo
  echo "CHANGELOG.md: Unreleased → $version ($date)"
}

promote_changelog

echo
echo "Creating commit and tag $tag..."
cd "$ROOT"
git add -A
git commit -m "$tag"
git tag "$tag"

echo
echo "Done! Push with: git push && git push --tags"
