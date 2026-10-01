#!/bin/bash
# Release script for SkillGrid
# Usage: bash scripts/release.sh <version>
# Example: bash scripts/release.sh 1.1.0

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 1.1.0"
  exit 1
fi

VERSION="$1"
TAG="v$VERSION"

# Validate version format
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Error: version must be semver (e.g. 1.1.0)"
  exit 1
fi

# Check working tree is clean
if ! git diff --quiet HEAD; then
  echo "Error: working tree is not clean. Commit or stash changes first."
  exit 1
fi

# Verify CHANGELOG.md has an entry for this version
if ! grep -q "## \[$VERSION\]" CHANGELOG.md; then
  echo "Error: CHANGELOG.md has no entry for [$VERSION]."
  echo "Add a section '## [$VERSION] - $(date +%Y-%m-%d)' before releasing."
  exit 1
fi

# Never tag a broken release
echo "Running validation and tests..."
npm run validate
npm test

# Update version in package.json. Node does this (not jq) because node is already
# a hard requirement of this whole toolchain, while jq is not preinstalled on
# macOS or most Windows setups.
node -e "
  const fs = require('fs');
  const p = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  p.version = '$VERSION';
  fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
"
git add package.json

# Keep remote installer pinned tags in sync with the release. Los instaladores
# pinean por variable (PINNED_TAG / $pinnedTag), no por un literal --branch v...,
# asi que un sed sobre --branch no los encontraria y dejaria el pin viejo.
# Si el patron no matchea, esto falla en vez de publicar un release con pin stale.
node -e '
  const fs = require("fs");
  const TAG = process.argv[1];
  const upd = (file, re) => {
    const src = fs.readFileSync(file, "utf8");
    const out = src.replace(re, m => m.replace(/v[\d.]+/, TAG));
    if (out === src) { console.error("ERROR: pin no encontrado en " + file); process.exit(1); }
    fs.writeFileSync(file, out);
  };
  upd("remote-install.sh", /^PINNED_TAG="v[\d.]+"$/m);
  upd("remote-install.ps1", /^\$pinnedTag = "v[\d.]+"$/m);
' "$TAG"
git add remote-install.sh remote-install.ps1

# catalog.json / catalog-lite.json / skills/index.json embed package.json's version
node scripts/generate-catalog.js
git add catalog.json catalog-lite.json skills/index.json

# Commit before tagging — an annotated tag on an empty commit would point at the
# PREVIOUS release and ship none of the bump above.
git commit -m "chore: release $TAG"

echo "Creating tag $TAG..."
git tag -a "$TAG" -m "Release $TAG"

# Push commit and tag together — a tag created but left unpushed means the pinned
# remote-install.sh/remote-install.ps1 one-liners break for every new user until
# someone notices and pushes it by hand.
echo "Pushing main and $TAG to origin..."
git push origin main
git push origin "$TAG"

echo ""
echo "Release $TAG pushed."
echo ""
echo "Create a GitHub Release:"
echo "  gh release create $TAG --generate-notes"
