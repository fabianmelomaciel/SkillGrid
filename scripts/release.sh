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

# Update version in package.json
if command -v jq &>/dev/null; then
  jq ".version = \"$VERSION\"" package.json > package.json.tmp
  mv package.json.tmp package.json
  git add package.json
fi

# Keep remote installer pinned tags in sync with the release
sed -i.bak "s/--branch v[0-9]\+\.[0-9]\+\.[0-9]\+/--branch $TAG/" remote-install.sh remote-install.ps1
rm -f remote-install.sh.bak remote-install.ps1.bak
git add remote-install.sh remote-install.ps1

# Create tag
echo "Creating tag $TAG..."
git tag -a "$TAG" -m "Release $TAG"

echo ""
echo "Release $TAG ready."
echo "Run: git push origin main --tags"
echo ""
echo "Then create a GitHub Release:"
echo "  gh release create $TAG --generate-notes"
