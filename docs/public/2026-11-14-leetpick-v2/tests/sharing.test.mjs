import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {KEY} from '../dist/core.js';
const read=p=>readFile(new URL('../'+p,import.meta.url));
const json=async p=>JSON.parse((await read(p)).toString());
const origin='https://clearpick-practice.mach1ne.chatgpt.site';
test('all74 problems have independent static share HTML and problem-specific metadata',async()=>{
 const {problems}=await json('dist/catalog.json');const posts=await json('docs/sharing/posts.json');
 assert.equal(posts.length,problems.length);
 const images=new Set();
 for(const p of problems){
  const post=posts.find(x=>x.id===p.id);assert.ok(post);
  const path=`share/${p.id}-${p.slug}/`,html=(await read('dist/'+path+'index.html')).toString();
  assert.ok(html.includes(`<title>${p.id}. `));assert.ok(html.includes('LeetPick</title>'));
  assert.ok(html.includes(`rel="canonical" href="${origin}/${path}"`));
  assert.ok(html.includes(`property="og:url" content="${origin}/${path}"`));
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  const image=html.match(/property="og:image" content="([^"]+)"/)[1];
  assert.equal(image,`${origin}/assets/social/${p.id}-${p.slug}.jpg`);images.add(image);
  assert.ok(html.includes('property="og:image:type" content="image/jpeg"'));
  assert.ok(html.includes(`href="https://leetcode.com/problems/${p.slug}/"`));
  assert.ok(html.includes('Fictional profile'));assert.ok(html.includes('@'+post.handle));
  // The useful page exists before scripts execute; no fetched catalog or SPA root.
  assert.ok(html.includes('<h1>')&&html.includes('class="post-text"'));
  assert.ok(!html.includes('fetch('));
 }
 assert.equal(images.size,problems.length);
});
test('each post has original concise copy and a distinct fictional identity and portrait',async()=>{
 const posts=await json('docs/sharing/posts.json');
 for(const field of ['id','name','handle','text'])assert.equal(new Set(posts.map(p=>p[field])).size,74);
 const hashes=new Set();
 for(const p of posts){assert.ok(p.fictional&&p.original);assert.ok(p.text.length>=60&&p.text.length<=280);assert.match(p.handle,/^[a-z0-9_]+$/);const b=await read(`dist/assets/avatars/${p.id}.jpg`);assert.equal(b.readUInt16BE(0),0xffd8);hashes.add(createHash('sha256').update(b).digest('hex'));}
 assert.equal(hashes.size,74);
});
test('all social JPEGs match their checked manifest without clipped text',async()=>{
 const records=await json('docs/sharing/preview-manifest.json');assert.equal(records.length,74);const hashes=new Set();
 for(const r of records){const b=await read('dist/'+r.src);assert.equal(b.readUInt16BE(0),0xffd8);assert.equal(b.length,r.bytes);const hash=createHash('sha256').update(b).digest('hex');assert.equal(hash,r.sha256);hashes.add(hash);assert.equal(r.width,1200);assert.equal(r.height,630);assert.ok(r.textBottom<r.artTop);assert.ok(r.postFont>=26);}
 assert.equal(hashes.size,74);
});
test('rebranding preserves existing solved state and installs the new share links offline',async()=>{
 assert.equal(KEY,'clearpick.progress.v1');
 const html=(await read('dist/index.html')).toString(),app=(await read('dist/app.js')).toString(),offline=(await read('offline.html')).toString();
 assert.ok(html.includes('LeetPick home'));assert.ok(app.includes("localStorage.getItem('clearpick.theme')"));
 assert.ok(app.includes('share/${p.id}-${p.slug}/'));assert.ok(offline.includes("'dist/'+path+'index.html'"));
 assert.ok(!html.includes('Clearpick home'));
});
