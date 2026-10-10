import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const P = require('./src/prompt-core.js');
let html = await readFile(join(here, 'src/template.html'), 'utf8');
for (const [marker, filename] of [['INLINE_CSS', 'app.css'], ['INLINE_CORE', 'prompt-core.js'], ['INLINE_APP', 'app.js']]) {
  const text = await readFile(join(here, 'src', filename), 'utf8');
  // Function replacement preserves literal dollar signs in source code.
  html = html.replace('/* ' + marker + ' */', () => text);
}
await writeFile(join(here, 'index.html'), html);
await mkdir(join(here, 'examples'), {recursive: true});
for (const [key, name] of [['insight', 'default'], ['implementation', 'implementation'], ['walkthrough', 'walkthrough']]) {
  const state = P.applyPreset(key, P.defaults);
  await writeFile(join(here, 'examples', name + '-settings.json'), JSON.stringify(state, null, 2) + '\n');
  await writeFile(join(here, 'examples', name + '-prompt.txt'), P.buildPrompt(state) + '\n');
}
console.log('Built self-contained index.html and three complete prompt/settings examples.');
