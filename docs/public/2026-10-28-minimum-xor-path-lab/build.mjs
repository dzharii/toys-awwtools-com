import {usedAssets} from './scripts/audit-assets.mjs';
import {mkdir,cp,rm,readdir} from 'node:fs/promises';import {spawnSync} from 'node:child_process';
const referenced=await usedAssets(),present=await readdir('public/assets');
if(present.some(f=>!referenced.has(f))||[...referenced].some(f=>!present.includes(f)))throw Error('Production asset audit failed. Run node scripts/audit-assets.mjs.');
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
const result=spawnSync('node_modules/.bin/bun',['build','src/app.js','--outdir','dist','--target','browser','--minify'],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);
console.log('Static build complete. Zero third-party runtime dependencies.');
