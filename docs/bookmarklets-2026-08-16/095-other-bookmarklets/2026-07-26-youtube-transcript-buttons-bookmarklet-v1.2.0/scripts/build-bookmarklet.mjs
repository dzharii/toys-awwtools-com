import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const sourcePath = new URL('../youtube-transcript-buttons.bookmarklet.js', import.meta.url);
const outputPath = new URL('../youtube-transcript-buttons.bookmarklet.txt', import.meta.url);
const source = await readFile(sourcePath, 'utf8');
const context = vm.createContext({});
vm.runInContext(source, context, { filename: 'youtube-transcript-buttons.bookmarklet.js' });
const entryPoint = context.bookmarklet_youtube_transcript_buttons;

if (typeof entryPoint !== 'function') {
  throw new Error('Named bookmarklet entry point was not defined.');
}

const bookmarkletUrl = `javascript:(${entryPoint.toString()})();`;
new vm.Script(bookmarkletUrl.slice('javascript:'.length), { filename: 'generated-bookmarklet.js' });
await writeFile(outputPath, `${bookmarkletUrl}\n`, 'utf8');
console.log(`Generated ${outputPath.pathname} (${bookmarkletUrl.length} characters).`);
