import {mkdir,readFile,writeFile,copyFile,readdir,access} from 'node:fs/promises';
import path from 'node:path';
import {applyCredit} from './credit.mjs';
const folder=process.argv[2];
if(!folder || !/^\d{2}-[a-z]+$/.test(folder)) throw new Error('Use a numbered application folder, e.g. 01-folio');
const root=process.cwd(), app=path.join(root,folder);
await mkdir(path.join(app,'assets'),{recursive:true});
await copyFile(path.join(root,'research','catalogue.json'),path.join(app,'catalogue.json'));
if(process.argv.includes('--data-only')) process.exit(0);
const config=JSON.parse(await readFile(path.join(app,'identity.json'),'utf8'));
const fonts=[
 ['cormorant','https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_iE9GnM.ttf','cormorantgaramond'],
 ['cinzel','https://fonts.gstatic.com/s/cinzel/v26/8vIU7ww63mVu7gtR-kwKxNvkNOjw-tbnTYo.ttf','cinzel'],
 ['unifraktur','https://fonts.gstatic.com/s/unifrakturmaguntia/v22/WWXPlieVYwiGNomYU-ciRLRvEmK7oaVunw.ttf','unifrakturmaguntia']
];
await mkdir(path.join(root,'assets','fonts'),{recursive:true});
for(const [name,url,license] of fonts){
  const fontPath=path.join(root,'assets','fonts',`${name}.ttf`);
  try{await access(fontPath);}catch{
    const response=await fetch(url);if(!response.ok)throw new Error(`Font download failed: ${url}`);
    await writeFile(fontPath,Buffer.from(await response.arrayBuffer()));
    const source=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${license}/OFL.txt`);
    if(!source.ok)throw new Error(`Font license unavailable: ${license}`);
    await writeFile(path.join(root,'assets','fonts',`${name}-OFL.txt`),await source.text());
  }
  await copyFile(fontPath,path.join(app,'assets',`${name}.ttf`));
  await copyFile(path.join(root,'assets','fonts',`${name}-OFL.txt`),path.join(app,'assets',`${name}-OFL.txt`));
}
await copyFile(path.join(root,'tools','runtime','core.js'),path.join(app,'core.js'));
await copyFile(path.join(root,'tools','runtime','base.css'),path.join(app,'base.css'));
await copyFile(path.join(root,'tools','runtime','texture.svg'),path.join(app,'assets','texture.svg'));
const references=await readdir(path.join(root,'.spec-images'));
const ref=references.find(name=>name.endsWith(`-${config.reference}.png`));
if(!ref)throw new Error('Missing approved reference');
await copyFile(path.join(root,'.spec-images',ref),path.join(app,'reference.png'));
const url=`https://toys.awwtools.com/public/2026-09-28-ILUDIST/${folder}/`;
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const metadata=`<!-- publishing:start -->
  <title>ILUD - ${esc(config.name)} | A quieter internet</title>
  <meta name="description" content="${esc(config.description)}">
  <meta name="theme-color" content="${config.background}">
  <link rel="canonical" href="${url}">
  <link rel="icon" type="image/svg+xml" href="./assets/icon.svg">
  <link rel="apple-touch-icon" href="./assets/apple-touch-icon.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ILUD / ILUDIST">
  <meta property="og:title" content="ILUD - ${esc(config.name)}">
  <meta property="og:description" content="${esc(config.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${url}social.jpg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(config.name)}: ${esc(config.tagline)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="ILUD - ${esc(config.name)}">
  <meta name="twitter:description" content="${esc(config.description)}">
  <meta name="twitter:image" content="${url}social-x.jpg">
  <meta name="twitter:image:alt" content="${esc(config.name)}: ${esc(config.tagline)}">
  <!-- publishing:end -->`;
let html=await readFile(path.join(app,'index.html'),'utf8');
html=html.replace(/<!-- publishing:start -->[\s\S]*?<!-- publishing:end -->/,metadata);
await writeFile(path.join(app,'index.html'),html);
await applyCredit(app,folder);
console.log(`Prepared ${folder}; local data, runtime, fonts, licenses and reference copied.`);
