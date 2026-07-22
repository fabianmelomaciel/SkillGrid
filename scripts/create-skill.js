const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const TEMPLATE_PATH = path.join(SKILLS_DIR, 'template', 'SKILL.md');

const VALID_CATEGORIES = ['core', 'design', 'agent'];
const VALID_RISK_LEVELS = ['safe', 'critical'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question, defaultValue) {
  return new Promise((resolve) => {
    const formatted = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(formatted, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('\n🧠 SkillGrid - Nuevo Creador de Skills\n');

  let name = process.argv[2];
  let category = process.argv[3];

  if (!name) {
    name = await ask('Nombre de la skill (ej. my-new-skill)');
  }
  name = toKebabCase(name);

  if (!name) {
    console.error('❌ Error: El nombre de la skill es requerido.');
    rl.close();
    process.exit(1);
  }

  if (!category) {
    category = await ask('Categoría (core | design | agent)', 'core');
  }
  category = category.toLowerCase();

  if (!VALID_CATEGORIES.includes(category)) {
    console.error(`❌ Error: Categoría inválida. Debe ser una de: ${VALID_CATEGORIES.join(', ')}`);
    rl.close();
    process.exit(1);
  }

  const description = await ask('Descripción (Sugerido comenzar con "Use when...")', 'Use when you need to...');
  const riskLevel = await ask('Nivel de riesgo (safe | critical)', 'safe');

  if (!VALID_RISK_LEVELS.includes(riskLevel)) {
    console.error(`❌ Error: Nivel de riesgo inválido. Debe ser uno de: ${VALID_RISK_LEVELS.join(', ')}`);
    rl.close();
    process.exit(1);
  }

  rl.close();

  // Create paths
  const targetDir = path.join(SKILLS_DIR, category, name);
  const targetFile = path.join(targetDir, 'SKILL.md');

  if (fs.existsSync(targetDir)) {
    console.error(`❌ Error: Ya existe una carpeta para la skill en "${path.relative(ROOT, targetDir)}".`);
    process.exit(1);
  }

  // Load template
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`❌ Error: No se encontró la plantilla en "${path.relative(ROOT, TEMPLATE_PATH)}".`);
    process.exit(1);
  }

  let templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  // Replace frontmatter fields
  // Enforce correct replacement of YAML fields
  templateContent = templateContent
    .replace(/^name:\s*.*$/m, `name: ${name}`)
    .replace(/^description:\s*.*$/m, `description: "${description}"`)
    .replace(/^category:\s*.*$/m, `category: ${category}`)
    .replace(/^status:\s*.*$/m, `status: draft`)
    .replace(/^risk_level:\s*.*$/m, `risk_level: ${riskLevel}`)
    .replace(/^# \{Skill Title\} Agent$/m, `# ${name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`);

  // Ensure target folder exists
  fs.mkdirSync(targetDir, { recursive: true });

  // Write new skill
  fs.writeFileSync(targetFile, templateContent, 'utf-8');
  console.log(`\n✅ Skill creada en: ${path.relative(ROOT, targetFile)}`);

  // Run validation and catalog indexers
  console.log('\nSincronizando y validando el catálogo...');
  try {
    execSync('npm run catalog', { stdio: 'inherit', cwd: ROOT });
    execSync('npm run validate', { stdio: 'inherit', cwd: ROOT });
    console.log('\n🎉 ¡Skill registrada y validada correctamente!');
  } catch (error) {
    console.error('\n⚠️ Advertencia: Ocurrió un error al ejecutar validaciones automáticas. Revisa el frontmatter.');
  }
}

if (require.main === module) {
  main();
} else {
  rl.close();
}

module.exports = { toKebabCase };
