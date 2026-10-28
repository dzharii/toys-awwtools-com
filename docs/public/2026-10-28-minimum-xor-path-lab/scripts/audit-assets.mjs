import {readFile,readdir,rm} from 'node:fs/promises';
import {lessons} from '../src/lessons.js';
export async function usedAssets(){
  const used=new Set();
  for(const lesson of lessons){if(lesson.diagram)used.add(lesson.diagram+'.svg');for(const section of lesson.sections||[])if(section.figure)used.add(section.figure.name+'.svg');}
  async function scan(dir){for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.isDirectory()){if(entry.name!=='assets')await scan(`${dir}/${entry.name}`);}else if(/\.(js|html|css)$/.test(entry.name)){const text=await readFile(`${dir}/${entry.name}`,'utf8');for(const m of text.matchAll(/assets\/([a-zA-Z0-9._-]+\.(?:svg|webp|png|jpe?g|avif))/g))used.add(m[1]);}}}
  await scan('src');await scan('public');return used;
}
if(import.meta.url===new URL(process.argv[1],'file://').href){
  const used=await usedAssets(),files=await readdir('public/assets');
  const unused=files.filter(f=>!used.has(f)),missing=[...used].filter(f=>!files.includes(f));
  if(process.argv.includes('--prune'))for(const file of unused)await rm(`public/assets/${file}`);
  console.log(JSON.stringify({used:[...used].sort(),unused,missing,pruned:process.argv.includes('--prune')},null,2));
  if(missing.length||unused.length&&!process.argv.includes('--prune'))process.exitCode=1;
}
