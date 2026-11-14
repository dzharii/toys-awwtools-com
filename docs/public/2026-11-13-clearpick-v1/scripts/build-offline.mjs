import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=path=>readFile(root+path,'utf8');
let html=await read('dist/index.html');
const css=await read('dist/styles.css');
const core=(await read('dist/core.js')).replace(/^export /gm,'');
const preview=(await read('dist/illustration-preview.js')).replace(/^export /gm,'');
const bookmarklet=(await read('dist/bookmarklet.txt')).trim();
const catalog=JSON.parse(await read('dist/catalog.json'));
const illustrations=JSON.parse(await read('dist/illustrations.json'));
for(const asset of Object.values(illustrations))asset.src='dist/'+asset.src;
let app=(await read('dist/app.js')).replace(/^import .*;\n/gm,'');
const start="const response=await fetch('/catalog.json');";
const end='catalog=data.problems;';
const a=app.indexOf(start),b=app.indexOf(end,a);
if(a<0||b<0)throw Error('Application loading contract changed; update offline builder.');
app=app.slice(0,a)+'const data='+JSON.stringify(catalog)+';illustrations='+JSON.stringify(illustrations)+';'+app.slice(b);
const script='(async()=>{\n'+core+'\n'+preview+'\nconst bookmarklet='+JSON.stringify(bookmarklet)+';\n'+app+'\n})();';
html=html.replace('<link rel="stylesheet" href="/styles.css">','<style>'+css+'</style>')
 .replace('<script type="module" src="/app.js"></script>','')
 .replace('href="/"','href="offline.html"')
 .replace('href="/specification.md"','href="docs/SPECIFICATION.md"')
 .replace('</body>','<script>'+script.replaceAll('</script','<\\/script')+'</script></body>');
await writeFile(root+'offline.html',html);
console.log('Built offline.html with '+catalog.problems.length+' embedded entries and '+Object.keys(illustrations).length+' local image references.');
