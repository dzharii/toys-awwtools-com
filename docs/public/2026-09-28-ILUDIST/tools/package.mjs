import{readFile,writeFile}from'node:fs/promises';
import path from'node:path';
import{createHash}from'node:crypto';
import{zipSync,unzipSync}from'fflate';
import{check,walk,root}from'./check.mjs';
const apps=await check();
const rootFiles=['index.html','collection.css','maker.css','README.md','.gitignore','package.json','package-lock.json','playwright.config.js','social.jpg','screenshot.jpg','screenshot-desktop.jpg','AGENTS.md'];
const allowedDirectories=[...apps,'assets','research','tools','tests','.specs','.spec-images'];
const all=[...rootFiles.map(f=>path.join(root,f))];
for(const directory of allowedDirectories)all.push(...await walk(path.join(root,directory)));
const prefix='2026-09-28/Ilude/',entries={},timestamp=new Date('2026-09-28T12:00:00Z');
for(const file of all){
 const name=path.relative(root,file).split(path.sep).join('/');
 if(name.split('/').some(part=>part.startsWith('experiment-')))throw new Error('Excluded archive path.');
 const data=await readFile(file);
 entries[prefix+name]=[data,{mtime:timestamp,level:/\.(png|jpg|zip)$/i.test(name)?0:6}];
}
const archive=zipSync(entries),unpacked=unzipSync(archive);
if(Object.keys(unpacked).length!==all.length)throw new Error('Archive file count mismatch.');
for(const [name,[bytes]]of Object.entries(entries)){
 const result=unpacked[name];
 if(!result||!Buffer.from(result).equals(bytes))throw new Error(`Archive integrity failure: ${name}`);
}
const name='ILUDIST-2026-09-28.zip',hash=createHash('sha256').update(archive).digest('hex');
await writeFile(path.join(root,name),archive);
await writeFile(path.join(root,`${name}.sha256`),`${hash}  ${name}\n`);
console.log(`Created and byte-verified ${name}: ${all.length} files, ${(archive.length/1_000_000).toFixed(1)} MB.\nSHA-256 ${hash}`);
