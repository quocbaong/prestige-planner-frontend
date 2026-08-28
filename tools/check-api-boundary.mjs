import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const sourceRoot = join(root, 'src');
const canonicalAxios = join(sourceRoot, 'lib', 'axios.js');
const violations = [];
const uiRoots = [`${join(sourceRoot, 'pages')}${process.platform === 'win32' ? '\\' : '/'}`, `${join(sourceRoot, 'components')}${process.platform === 'win32' ? '\\' : '/'}`, `${join(sourceRoot, 'stores')}${process.platform === 'win32' ? '\\' : '/'}`];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      const source = await readFile(path, 'utf8');
      const name = relative(root, path);
      const isUiLayer = uiRoots.some(prefix => path.startsWith(prefix));
      if (path !== canonicalAxios && /axios\.create\s*\(|from\s+['"]axios['"]/.test(source)) {
        violations.push(`${name}: use src/lib/axios.js; do not create/import another Axios client`);
      }
      if (isUiLayer && /from\s+['"][^'"]*lib[\\/]axios['"]|\baxios\.(get|post|put|patch|delete|request)\s*\(/.test(source)) {
        violations.push(`${name}: page/component/store must call a domain service, not the canonical Axios client`);
      }
      if (isUiLayer && /\b(fetch|XMLHttpRequest)\s*\(/.test(source)) {
        violations.push(`${name}: backend calls must use a domain service and the canonical Axios client`);
      }
      if (path !== canonicalAxios && /\/api\/v1(?:\/|['"`]|$)/.test(source)) {
        violations.push(`${name}: API calls must be relative to the canonical /api/v1 base URL`);
      }
      if (/localhost:8099|legacy-monolith|(?:auth|user|event|ticket|order|payment|marketplace|notification|chat|ai)-service:\d+/.test(source)) {
        violations.push(`${name}: direct legacy/service URL is forbidden; call the gateway`);
      }
      if (path !== canonicalAxios && /VITE_[A-Z0-9_]+/.test(source)) {
        violations.push(`${name}: backend URL configuration must use VITE_API_URL only in src/lib/axios.js`);
      }
    }
  }
}

await walk(sourceRoot);
const canonicalSource = await readFile(canonicalAxios, 'utf8');
if ((canonicalSource.match(/axios\.create\s*\(/g) || []).length !== 1) {
  violations.push('src/lib/axios.js: expected exactly one Axios instance');
}
if (/https?:\/\/(?:localhost|127\.0\.0\.1)/.test(canonicalSource)) {
  violations.push('src/lib/axios.js: do not hard-code a Gateway fallback; configure VITE_API_URL');
}

if (violations.length) {
  console.error(['API boundary check failed:', ...violations.map((item) => `- ${item}`)].join('\n'));
  process.exit(1);
}
console.log('PASS: frontend uses one gateway Axios instance and contains no direct legacy/service URL.');
