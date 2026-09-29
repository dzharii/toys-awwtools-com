import{readFile,writeFile,copyFile,readdir,realpath}from'node:fs/promises';
import path from'node:path';
import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function applyCredit(directory,edition){
 const light=['collection','01-folio','05-journal'].includes(edition);
 const colors=light?'--maker-bg:#e4d8bf;--maker-ink:#433627;--maker-muted:#60513d;--maker-line:#aa9572':'--maker-bg:#171c18;--maker-ink:#dfc7a3;--maker-muted:#bcad95;--maker-line:#776044';
 const markup=`<!-- maker:start -->
  <details class="maker-credit" data-edition="${edition}" style="${colors}">
    <summary>
      <svg class="maker-emblem" viewBox="0 0 36 36" fill="none" stroke="currentColor" aria-hidden="true"><circle class="maker-orbit" cx="18" cy="18" r="14" stroke-width="1"/><path d="M18 0v5m0 26v5M0 18h5m26 0h5" stroke-width="1"/><path class="maker-spark" d="m18 8 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="currentColor" stroke="none"/><circle cx="18" cy="18" r="2" fill="${light?'#e4d8bf':'#171c18'}" stroke="none"/></svg>
      <span class="maker-label"><small>Proudly made by</small><strong>OpenAI GPT-6 Astra</strong><span class="maker-powered">Powered by Microsoft GitHub Copilot</span></span>
      <span class="maker-expand" aria-hidden="true">+</span>
    </summary>
    <p>I am GPT-6 Astra, the OpenAI model that researched, designed and implemented this ILUD collection in GitHub Copilot CLI, following the project owner's brief. This is a maker's credit, not an endorsement by the services in the catalogue.</p>
  </details>
  <!-- maker:end -->`;
 const file=path.join(directory,'index.html');let html=await readFile(file,'utf8');
 if(!html.includes('href="./maker.css"'))html=html.replace('</head>','<link rel="stylesheet" href="./maker.css">\n</head>');
 html=/<!-- maker:start -->/.test(html)?html.replace(/<!-- maker:start -->[\s\S]*?<!-- maker:end -->/,markup):html.replace('</body>',markup+'\n</body>');
 await writeFile(file,html);await copyFile(path.join(root,'tools','runtime','maker.css'),path.join(directory,'maker.css'));
}
if(process.argv[1]&&await realpath(process.argv[1])===await realpath(fileURLToPath(import.meta.url))){
 await applyCredit(root,'collection');
 for(const entry of await readdir(root,{withFileTypes:true}))if(entry.isDirectory()&&/^\d{2}-[a-z]+$/.test(entry.name))await applyCredit(path.join(root,entry.name),entry.name);
 console.log('Applied eleven self-contained maker credits.');
}
