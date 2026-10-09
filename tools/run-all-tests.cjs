// tools/run-all-tests.cjs
// Runs vitest file by file to ensure clean isolated runs and detailed output
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testDir = path.resolve(__dirname, '../tests');
const files = fs.readdirSync(testDir)
  .filter(f => f.endsWith('.test.js'))
  .sort();

console.log(`Starting execution of ${files.length} test files...`);

let passed = 0;
let failed = 0;
const failedFiles = [];

for (const file of files) {
  process.stdout.write(`Running ${file}... `);
  try {
    const out = execSync(`node ./node_modules/vitest/vitest.mjs run tests/${file}`, {
      cwd: path.resolve(__dirname, '..'),
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 120000
    });
    console.log('✓ PASS');
    passed++;
  } catch (err) {
    console.log('✗ FAIL');
    failed++;
    failedFiles.push({ file, output: err.stdout || err.message });
  }
}

console.log('\n================================');
console.log(`Total: ${files.length} | Passed: ${passed} | Failed: ${failed}`);
if (failedFiles.length > 0) {
  console.log('Failed files:');
  for (const f of failedFiles) {
    console.log(`\n--- ${f.file} ---`);
    console.log(f.output);
  }
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED!');
  process.exit(0);
}
