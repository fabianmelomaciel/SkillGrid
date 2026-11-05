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

# Check working tree is clean. La única excepción es CHANGELOG.md: la sección de
# la versión nueva tiene que existir antes de correr esto, pero sólo pasa
# paquete.test.js después del bump, así que se commitea junto con el release.
# `git diff --quiet` ignora los untracked, y un archivo suelto se colaría en el
# commit con el git add -A de abajo.
if [ -n "$(git status --porcelain -- . ':!CHANGELOG.md')" ]; then
  echo "Error: working tree is not clean. Commit or stash changes first."
  exit 1
fi

# Verify CHANGELOG.md has an entry for this version
if ! grep -q "## \[$VERSION\]" CHANGELOG.md; then
  echo "Error: CHANGELOG.md has no entry for [$VERSION]."
  echo "Add a section '## [$VERSION] - $(date +%Y-%m-%d)' before releasing."
  exit 1
fi

# Update version in package.json. Node does this (not jq) because node is already
# a hard requirement of this whole toolchain, while jq is not preinstalled on
# macOS or most Windows setups. package-lock carries the same version: si no se
# bumpea acá queda en la versión anterior y nadie lo nota hasta un npm ci.
node -e "
  const fs = require('fs');
  const write = (file, obj) => fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n');
  const p = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  p.version = '$VERSION';
  write('package.json', p);
  const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf-8'));
  lock.version = '$VERSION';
  if (lock.packages && lock.packages['']) lock.packages[''].version = '$VERSION';
  write('package-lock.json', lock);
"

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

# catalog.json / catalog-lite.json / skills/index.json embed package.json's
# version, así que se regeneran después del bump.
node scripts/generate-catalog.js

# Never tag a broken release. Los tests corren DESPUÉS del bump: paquete.test.js
# exige que package.json, catalog.json y la última sección del CHANGELOG coincidan,
# así que validar antes del bump da rojo con el release a medio hacer.
echo "Running validation and tests..."
npm run validate
npm test

# El árbol arrancó limpio y lo único modificado es lo que tocó este script.
git add -A

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

# Publicar en npm. El OTP/web-auth exige TTY: sin terminal interactiva npm falla
# con EOTP y enmascara la URL de autorizacion, asi que ahi solo avisamos y el
# release queda completo igual (el tag de GitHub es la fuente de verdad).
NAME=$(node -p "require('./package.json').name")
if [ -t 1 ]; then
  echo "Publicando $NAME@$VERSION en npm..."
  if ! npm publish; then
    echo "Aviso: npm publish no salio (¿OTP pendiente o version ya publicada?). Publicalo a mano: npm publish" >&2
  fi
else
  echo "Aviso: sin TTY no corre npm publish (OTP). Correlo desde una ventana interactiva: npm publish"
fi

# GitHub Release. gh usa la sesión local de GitHub (no necesita TTY); si falta
# el CLI o el permiso, el release de git+npm ya quedó y solo avisamos.
echo ""
if command -v gh >/dev/null 2>&1; then
  echo "Creando GitHub Release $TAG..."
  if ! gh release create "$TAG" --generate-notes; then
    echo "Aviso: no se pudo crear el GH release. Correlo a mano: gh release create $TAG --generate-notes" >&2
  fi
else
  echo "Aviso: gh CLI ausente. Creá el release a mano: gh release create $TAG --generate-notes"
fi

echo ""
echo "Release $TAG completado (git + tag + npm + GitHub)."
