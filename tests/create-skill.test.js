const { toKebabCase } = require('../scripts/create-skill.js');

let passed = 0;
let failed = 0;

function check(condition, msg) {
  if (!condition) throw new Error(msg);
}

function test(name, fn) {
  try {
    fn();
    console.log(`  OK    ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL  ${name}: ${e.message}`);
    failed++;
  }
}

console.log('\nTesting create-skill.js...\n');

test('toKebabCase: lowercases and hyphenates spaces', () => {
  check(toKebabCase('My New Skill') === 'my-new-skill', toKebabCase('My New Skill'));
});

test('toKebabCase: strips non-alphanumeric characters', () => {
  check(toKebabCase('Skill!! v2.0 (beta)') === 'skill-v2-0-beta', toKebabCase('Skill!! v2.0 (beta)'));
});

test('toKebabCase: collapses repeated separators', () => {
  check(toKebabCase('foo   bar___baz') === 'foo-bar-baz', toKebabCase('foo   bar___baz'));
});

test('toKebabCase: trims leading/trailing hyphens', () => {
  check(toKebabCase('  -leading and trailing-  ') === 'leading-and-trailing', toKebabCase('  -leading and trailing-  '));
});

test('toKebabCase: empty input returns empty string', () => {
  check(toKebabCase('') === '', toKebabCase(''));
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
