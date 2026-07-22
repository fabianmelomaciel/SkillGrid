#!/usr/bin/env node
// Best-effort graphify sync: skip silently if graphify isn't installed
// rather than failing every `npm install` for consumers who don't have it.
const { execFileSync } = require('child_process');

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
