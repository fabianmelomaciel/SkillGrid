const { execSync } = require("child_process");
const { readFileSync, existsSync } = require("fs");
const { join } = require("path");

const fixturesDir = join(__dirname, "fixtures");
const expectedDir = join(__dirname, "expected");
const scriptPath = join(__dirname, "scripts", "run-loop-fixture.ps1");

const fixtures = [
  "project-clean",
  "project-lint-errors",
  "project-type-errors",
  "project-ai-remnants",
  "project-mixed-findings",
  "project-yellow-only",
  "project-conflicting-fixes",
  "project-broken-after-fix",
  "project-stack-undetected",
];

let passed = 0;
let failed = 0;

for (const name of fixtures) {
  const fixturePath = join(fixturesDir, name);
  if (!existsSync(fixturePath)) {
    console.log(`  SKIP: ${name} \u2014 not found`);
    continue;
  }

  const answersPath = join(fixturePath, ".fixture-answers.json");
  let cmd = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -FixturePath "${fixturePath}"`;
  if (existsSync(answersPath)) {
    cmd += ` -AnswersPath "${answersPath}"`;
  }

  try {
    const output = execSync(cmd, { encoding: "utf8", timeout: 30000 }).trim();
    const snapshotFile = join(expectedDir, `${name}.snapshot.txt`);
    const expected = readFileSync(snapshotFile, "utf8").trim();

    const outputLines = output.split("\n").filter(l => l.trim());
    const expectedLines = expected.split("\n").filter(l => l.trim());

    let match = true;
    for (let i = 0; i < expectedLines.length; i++) {
      if (!outputLines[i] || !outputLines[i].includes(expectedLines[i].trim())) {
        match = false;
        break;
      }
    }

    if (match) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.log(`  FAIL: ${name}`);
      console.log(`    Got:      ${outputLines.join(" | ")}`);
      console.log(`    Expected: ${expectedLines.join(" | ")}`);
      failed++;
    }
  } catch (err) {
    console.log(`  FAIL: ${name} \u2014 ${err.message}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
