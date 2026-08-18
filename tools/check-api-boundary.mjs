import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const sourceRoot = join(root, 'src');
const canonicalAxios = join(sourceRoot, 'lib', 'axios.js');
const violations = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      const source = await readFile(path, 'utf8');
      const name = relative(root, path);
      if (path !== canonicalAxios && /axios\.create\s*\(|from\s+['"]axios['"]/.test(source)) {
        violations.push(`${name}: use src/lib/axios.js; do not create/import another Axios client`);
      }
      if (path !== canonicalAxios && /\/api\/v1(?:\/|['"`]|$)/.test(source)) {
        violations.push(`${name}: API calls must be relative to the canonical /api/v1 base URL`);
      }
      if (/localhost:8099|legacy-monolith|(?:auth|user|event|ticket|order|payment|marketplace|notification|chat|ai)-service:\d+/.test(source)) {
        violations.push(`${name}: direct legacy/service URL is forbidden; call the gateway`);
      }
    }
  }
}

await walk(sourceRoot);
const canonicalSource = await readFile(canonicalAxios, 'utf8');
if ((canonicalSource.match(/axios\.create\s*\(/g) || []).length !== 1) {
  violations.push('src/lib/axios.js: expected exactly one Axios instance');
}

if (violations.length) {
  console.error(['API boundary check failed:', ...violations.map((item) => `- ${item}`)].join('\n'));
  process.exit(1);
}
console.log('PASS: frontend uses one gateway Axios instance and contains no direct legacy/service URL.');
