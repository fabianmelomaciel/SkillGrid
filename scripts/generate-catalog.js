const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CATALOG_JSON_PATH = path.join(ROOT, 'catalog.json');
const PACKAGE_JSON_PATH = path.join(ROOT, 'package.json');

function resolveCatalogVersion() {
  if (fs.existsSync(CATALOG_JSON_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(CATALOG_JSON_PATH, 'utf-8'));
      if (existing && typeof existing.version === 'string' && existing.version.trim().length > 0) {
        return existing.version.trim();
      }
    } catch (_) {}
  }

  if (fs.existsSync(PACKAGE_JSON_PATH)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
      if (pkg && typeof pkg.version === 'string' && pkg.version.trim().length > 0) {
        return pkg.version.trim();
      }
    } catch (_) {}
  }

  return '1.0.0';
}

function parseFrontmatter(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const fm = match[1];
  const get = (key) => {
    const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim().replace(/^"(.*)"$/, '$1') : null;
  };

  return {
    name: get('name'),
    description: get('description'),
    category: get('category'),
    status: get('status'),
    risk_level: get('risk_level'),
  };
}

function walk(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (entry.name === 'SKILL.md') {
      // skip the template placeholder
      const rel = path.relative(path.join(ROOT, 'skills'), full).replace(/\\/g, '/');
      if (rel.startsWith('template/')) return;
      const meta = parseFrontmatter(full);
      if (meta) results.push(meta);
    }
  }
  return results;
}

const skills = walk(path.join(ROOT, 'skills'));
const categories = {};
skills.forEach(s => {
  categories[s.category] = (categories[s.category] || 0) + 1;
});

const catalog = {
  version: resolveCatalogVersion(),
  generated: new Date().toISOString().split('T')[0],
  summary: {
    total: skills.length,
    categories,
  },
  skills: skills.sort((a, b) => a.name.localeCompare(b.name)),
};

fs.writeFileSync(
  path.join(ROOT, 'catalog.json'),
  JSON.stringify(catalog, null, 2) + '\n'
);
console.log(`Catalog generated: ${skills.length} skills`);
