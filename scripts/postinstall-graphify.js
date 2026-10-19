#!/usr/bin/env node
// Best-effort graphify sync: skip silently if graphify isn't installed
// rather than failing every `npm install` for consumers who don't have it.
//
// El sync sólo tiene sentido en el repo del dev, que es el único con
// graphify-out/. Para el consumidor de npm el hook corría un binario resuelto
// por PATH (npm mete node_modules/.bin al frente, así que cualquier
// dependencia podía poner un "graphify" homónimo y se ejecutaba con los
// permisos de quien instala) y además indexaba el proyecto del consumidor sin
// que nadie lo pidiera. Con el gate, en un install de consumo no se ejecuta
// nada.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

if (!fs.existsSync(path.join(process.cwd(), 'graphify-out'))) {
  process.exit(0);
}

try {
  execFileSync('graphify', ['update', '.'], { stdio: 'inherit' });
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('graphify not found on PATH — skipping knowledge graph sync (optional).');
    process.exit(0);
  }
  console.warn('graphify update failed (non-blocking):', err.message);
  process.exit(0);
}
