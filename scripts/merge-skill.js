#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const [,, skillPath, modelArg, platform, modelsJson, outputPath, degradation = 'full'] = process.argv;

if (!skillPath || !fs.existsSync(skillPath)) {
  console.error('Usage: node merge-skill.js <skill-path> [model] [platform] [models-json] [output-path] [degradation]');
  console.error('Error: skill file not found or not specified');
  process.exit(1);
}

let targetModel = modelArg || '';
if (!targetModel && platform && modelsJson && fs.existsSync(modelsJson)) {
  const data = JSON.parse(fs.readFileSync(modelsJson, 'utf-8'));
  targetModel = data.platforms?.[platform]?.default_model || '';
}

const content = fs.readFileSync(skillPath, 'utf-8');
const lines = content.replace(/\r/g, '').split('\n');

const fmStart = lines.findIndex(l => l.trim() === '---');
if (fmStart !== 0) { console.error('Invalid SKILL.md: must start with --- frontmatter'); process.exit(1); }
const fmEnd = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
if (fmEnd === -1) { console.error('Invalid SKILL.md: no closing ---'); process.exit(1); }

const coreStart = lines.findIndex((l, i) => i > fmEnd && l.trim() === '## Core');
if (coreStart === -1) { console.error('Invalid SKILL.md: no ## Core section'); process.exit(1); }

const modulesStart = lines.findIndex((l, i) => i > coreStart && l.trim() === '## Modules');
const frontmatter = lines.slice(0, fmEnd + 1).join('\n');
const coreBody = lines.slice(coreStart + 1, modulesStart > -1 ? modulesStart : undefined).join('\n').trimEnd();

let output = frontmatter + '\n\n## Core\n\n' + coreBody;

if (degradation !== 'stripped' && modulesStart > -1) {
  const moduleBody = lines.slice(modulesStart + 1).join('\n');
  const moduleRegex = /^\[(model|platform):([^\]]+)\]$(.*?)(?=^\[(?:model|platform):|\n*\Z)/gms;
  const matches = [...moduleBody.matchAll(moduleRegex)];

  const selected = matches
    .filter(m => {
      const type = m[1], key = m[2].trim();
      if (!targetModel && !platform) return true;
      if (type === 'model' && targetModel && key === targetModel) return true;
      if (type === 'platform' && platform && key === platform) return true;
      return false;
    })
    .map(m => m[0].trim());

  if (selected.length) {
    output += '\n\n## Modules\n\n' + selected.join('\n\n');
  }
}

if (outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`Written: ${outputPath}`);
} else {
  process.stdout.write(output);
}
