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

  const getObject = (key) => {
    const m = fm.match(new RegExp(`^${key}:\\s*(\\{[^\\}]+\\})`, 'm'));
    if (!m) return null;
    try {
      const jsonStr = m[1].replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
      return JSON.parse(jsonStr);
    } catch (_) {
      return null;
    }
  };

  return {
    name: get('name'),
    description: get('description'),
    category: get('category'),
    status: get('status'),
    risk_level: get('risk_level'),
    token_estimate: getObject('token_estimate'),
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

// Prepare clean skills array for catalog.json (omit token_estimate)
const catalogSkills = skills.map(({ name, description, category, status, risk_level }) => ({
  name,
  description,
  category,
  status,
  risk_level,
})).sort((a, b) => a.name.localeCompare(b.name));

const catalog = {
  version: resolveCatalogVersion(),
  generated: new Date().toISOString().split('T')[0],
  summary: {
    total: skills.length,
    categories,
  },
  skills: catalogSkills,
};

fs.writeFileSync(
  path.join(ROOT, 'catalog.json'),
  JSON.stringify(catalog, null, 2) + '\n'
);
console.log(`Catalog generated: ${skills.length} skills`);

// === Tier-3: Auto-sync skills/index.json summary and details ===
const INDEX_PATH = path.join(ROOT, 'skills', 'index.json');
if (fs.existsSync(INDEX_PATH)) {
  try {
    const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
    index.generated = catalog.generated;
    index.summary = { total: skills.length, categories };

    const existingSkills = index.skills || {};
    const updatedSkills = {};

    // Sort skills by name
    const sortedSkills = [...skills].sort((a, b) => a.name.localeCompare(b.name));

    sortedSkills.forEach(s => {
      const existing = existingSkills[s.name] || {};

      let costTier = existing.cost_tier;
      if (!costTier && s.token_estimate && s.token_estimate.input) {
        const inputTokens = s.token_estimate.input;
        if (inputTokens <= 2500) costTier = 'low';
        else if (inputTokens <= 4500) costTier = 'medium';
        else costTier = 'high';
      }
      if (!costTier) costTier = 'low';

      updatedSkills[s.name] = {
        name: s.name,
        description: s.description,
        category: s.category,
        status: s.status,
        risk_level: s.risk_level,
        token_estimate: s.token_estimate || existing.token_estimate || { input: 2000, output: 800 },
        cost_tier: costTier,
        invokes: existing.invokes || []
      };
    });

    index.skills = updatedSkills;

    // Bump patch version of index.json automatically
    const [maj, min, pat] = (index.version || '1.0.0').split('.').map(Number);
    index.version = `${maj}.${min}.${pat + 1}`;

    fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + '\n');
    console.log(`skills/index.json fully synced: v${index.version}, ${skills.length} skills`);
  } catch (e) {
    console.warn(`Warning: could not sync skills/index.json — ${e.message}`);
  }
}
