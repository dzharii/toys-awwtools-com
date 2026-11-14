import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=async p=>JSON.parse(await readFile(root+p,'utf8'));
const origin='https://clearpick-practice.mach1ne.chatgpt.site';
const {problems}=await read('dist/catalog.json');
const posts=await read('docs/sharing/posts.json');
const art=await read('dist/illustrations.json');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
if(posts.length!==problems.length||new Set(posts.map(p=>p.id)).size!==problems.length)throw Error('Share post inventory mismatch.');
for(const p of problems){
 const post=posts.find(x=>x.id===p.id);if(!post||!post.text||post.text.length>280)throw Error('Missing or long post '+p.id);
 const key=p.id+'-'+p.slug,path='share/'+key+'/',url=origin+'/'+path;
 const image=origin+'/assets/social/'+key+'.jpg';
 const title=`${p.id}. ${p.title} | LeetPick`;
 const imageAlt=`Fictional LeetPick post by ${post.name} (@${post.handle}) about ${p.id}. ${p.title}: ${post.text}`;
 const meta=(property,content)=>`<meta property="${property}" content="${escape(content)}">`;
 const html=`<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#20252c"><meta name="referrer" content="no-referrer"><title>${escape(title)}</title><meta name="description" content="${escape(post.text)}"><link rel="canonical" href="${url}">
${meta('og:type','website')}${meta('og:site_name','LeetPick')}${meta('og:title',title)}${meta('og:description',post.text)}${meta('og:url',url)}${meta('og:image',image)}${meta('og:image:secure_url',image)}${meta('og:image:type','image/jpeg')}${meta('og:image:width','1200')}${meta('og:image:height','630')}${meta('og:image:alt',imageAlt)}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(post.text)}"><meta name="twitter:image" content="${image}"><meta name="twitter:image:alt" content="${escape(imageAlt)}"><link rel="stylesheet" href="../../share.css"><script defer src="../../share.js"></script></head>
<body><main class="share-layout"><nav class="share-nav" aria-label="LeetPick"><a class="share-brand" data-home href="../../index.html"><span aria-hidden="true">&larr;</span> LeetPick</a></nav>
<article class="leeter" aria-label="Fictional post by ${escape(post.name)}"><header class="post-author"><img class="avatar" src="../../assets/avatars/${p.id}.jpg" width="64" height="64" alt=""><div><strong>${escape(post.name)}</strong><span>@${escape(post.handle)}</span></div><span class="post-kind">Leeter</span></header>
<div class="post-body"><p class="problem-meta">LeetCode #${p.id} <span aria-hidden="true">&middot;</span> ${p.difficulty}</p><h1>${escape(p.title)}</h1><p class="post-text">${escape(post.text)}</p>
<img class="post-illustration" src="../../${art[p.id].src}" width="960" height="160" alt="">
<a class="solve-link" href="https://leetcode.com/problems/${p.slug}/" target="_blank" rel="noopener noreferrer"><span>Try #${p.id} on LeetCode</span><span aria-hidden="true">&nearr;</span></a><p class="task-summary">${escape(p.summary)}</p></div>
<footer class="post-footer"><span>Original joke <span aria-hidden="true">&middot;</span> Fictional profile</span><div><button type="button" data-copy aria-label="Copy link to ${escape(p.title)}">Copy link</button><button type="button" data-share>Share post <span aria-hidden="true">&uarr;</span></button></div></footer>
<p class="share-feedback" role="status" aria-live="polite" hidden></p><label class="manual-copy" hidden>Copy this public share URL<input readonly aria-label="Share URL" value="${url}"></label></article>
<p class="share-disclaimer">A fictional LeetPick post. Independent of LeetCode and X.</p></main></body></html>`;
 await mkdir(root+'dist/'+path,{recursive:true});await writeFile(root+'dist/'+path+'index.html',html);
}
console.log(`Built ${problems.length} static Leeter pages with per-problem Open Graph metadata.`);
