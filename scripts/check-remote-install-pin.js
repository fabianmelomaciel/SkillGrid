#!/usr/bin/env node
// Guards against the exact incident found 2026-09-26: package.json bumped to a new
// version via a direct commit (skipping scripts/release.sh), so remote-install.sh
// and remote-install.ps1 kept pinning a stale tag whose code still had a fixed
// vulnerability. Fails CI if the two installers disagree, or if the pinned tag
// doesn't actually exist as a git tag.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function extractTag(file, pattern) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf-8');
  const m = content.match(pattern);
  if (!m) {
    console.error(`ERROR: no se pudo extraer el tag pineado de ${file}`);
    process.exit(1);
  }
  return m[1];
}

const shTag = extractTag('remote-install.sh', /PINNED_TAG="(v[\d.]+)"/);
const ps1Tag = extractTag('remote-install.ps1', /\$pinnedTag = "(v[\d.]+)"/);

if (shTag !== ps1Tag) {
  console.error(`ERROR: remote-install.sh pinea ${shTag} pero remote-install.ps1 pinea ${ps1Tag} — deben coincidir.`);
  process.exit(1);
}

let tags;
try {
  tags = execFileSync('git', ['tag', '--list', shTag], { cwd: ROOT, encoding: 'utf-8' }).trim();
} catch {
  console.error('ERROR: no se pudo listar tags de git.');
  process.exit(1);
}

if (!tags) {
  console.error(
    `ERROR: el tag pineado ${shTag} no existe en el repo. ` +
    `Los instaladores remotos caerian a 'main' en vez de clonar un release fijo.`
  );
  process.exit(1);
}

console.log(`OK: remote-install.sh/.ps1 pineados a ${shTag}, tag existe.`);
