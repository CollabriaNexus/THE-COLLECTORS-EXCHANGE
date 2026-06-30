import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const dirs = ['.', 'backend', 'admin'];

let allPassed = true;
for (const dir of dirs) {
  console.log(`\n========== Running tests in ${dir === '.' ? 'root (user frontend)' : dir} ==========\n`);
  try {
    execSync('npx vitest run', { cwd: path.join(root, dir), stdio: 'inherit' });
  } catch {
    allPassed = false;
  }
}

process.exit(allPassed ? 0 : 1);
