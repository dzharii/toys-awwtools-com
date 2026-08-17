import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '..');
const source = fs.readFileSync(path.join(root, 'source', 'enter-to-newline-bookmarklet.js'), 'utf8');
const readable = fs.readFileSync(path.join(root, 'dist', 'enter-to-newline-bookmarklet-readable.txt'), 'utf8');
const encoded = fs.readFileSync(path.join(root, 'dist', 'enter-to-newline-bookmarklet.txt'), 'utf8');
const installer = fs.readFileSync(path.join(root, 'installer', 'enter-to-newline-bookmarklet.html'), 'utf8');

const assertions = [
  ['source parses', () => new Function(source)],
  ['readable distribution matches source', () => { if (readable !== `javascript:${source}`) throw new Error('Mismatch'); }],
  ['encoded distribution has scheme', () => { if (!encoded.startsWith('javascript:')) throw new Error('Missing scheme'); }],
  ['encoded distribution decodes to source', () => { if (decodeURIComponent(encoded.slice('javascript:'.length)) !== source) throw new Error('Mismatch'); }],
  ['installer embeds readable bookmarklet', () => { if (!installer.includes(JSON.stringify(readable))) throw new Error('Installer mismatch'); }],
  ['shadow DOM is used', () => { if (!source.includes("attachShadow({ mode: 'open' })")) throw new Error('Missing Shadow DOM'); }],
  ['cleanup controller exists', () => { if (!source.includes('destroy: options => destroy(options)')) throw new Error('Missing destroy controller'); }],
  ['no runtime network APIs', () => { if (/\b(fetch|XMLHttpRequest|WebSocket|EventSource)\b/.test(source)) throw new Error('Network API found'); }],
  ['global controller key exists', () => { if (!source.includes('__enterToNewlineBookmarkletController__')) throw new Error('Missing controller key'); }],
  ['no source comments', () => { if (/\/\*|(^|[^:])\/\//m.test(source)) throw new Error('Code comments found'); }]
];

let failures = 0;
for (const [name, assertion] of assertions) {
  try {
    assertion();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

if (failures) process.exitCode = 1;
