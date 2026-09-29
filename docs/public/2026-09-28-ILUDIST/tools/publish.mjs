import {chromium} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const folder=process.argv[2];
if(!/^\d{2}-[a-z]+$/.test(folder||''))throw new Error('Supply one application folder');
const app=path.resolve(folder),identity=JSON.parse(await readFile(path.join(app,'identity.json'),'utf8'));
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
await page.goto(`http://127.0.0.1:4173/${folder}/`);
await page.waitForSelector('html.ready');await page.evaluate(()=>document.fonts.ready);
await page.emulateMedia({reducedMotion:'reduce'});
await page.evaluate(()=>document.body.classList.remove('first-entry'));
await page.screenshot({path:path.join(app,'screenshot.jpg'),type:'jpeg',quality:90,fullPage:true});
await page.setViewportSize({width:1440,height:1000});
await page.screenshot({path:path.join(app,'screenshot-desktop.jpg'),type:'jpeg',quality:86,fullPage:true});
const shot=(await readFile(path.join(app,'screenshot.jpg'))).toString('base64');
const font=(await readFile(path.join(app,'assets','cormorant.ttf'))).toString('base64');
const icon=(await readFile(path.join(app,'assets','icon.svg'))).toString('base64');
const escape=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
for(const [name,width,height] of [['social.jpg',1200,630],['social-x.jpg',1200,600],['social-square.jpg',1080,1080]]){
  await page.setViewportSize({width,height});
  const square=width===height;
  await page.setContent(`<!doctype html><html><head><style>
  @font-face{font-family:Editorial;src:url(data:font/ttf;base64,${font})}
  *{box-sizing:border-box}body{margin:0;background:${identity.background};color:${folder==='05-journal'?'#321e17':'#eee3d0'};overflow:hidden;width:${width}px;height:${height}px;font-family:Editorial,Georgia,serif}
  .frame{position:absolute;inset:24px;border:1px solid ${identity.accent}77}.frame:after{content:'';position:absolute;inset:7px;border:1px solid ${identity.accent}22}
  .halo{position:absolute;width:660px;height:660px;border:1px solid ${identity.accent}55;border-radius:50%;right:-170px;top:-50px;box-shadow:0 0 0 45px ${identity.accent}09,0 0 0 100px ${identity.accent}06}
  .copy{position:absolute;left:75px;top:${square?70:58}px;width:${square?850:610}px;z-index:3}
  .brand{font-size:38px;letter-spacing:7px;margin:0;display:flex;gap:20px;align-items:center}.brand img{width:54px;height:54px}
  .kicker{font:12px Arial,sans-serif;letter-spacing:4px;text-transform:uppercase;color:${identity.accent};margin-top:37px}
  h1{font-weight:500;font-size:${square?108:96}px;letter-spacing:-3px;line-height:.94;margin:19px 0 23px;max-width:640px}
  .tagline{font-size:30px;line-height:1.2;max-width:510px}
  .rule{width:120px;height:1px;background:${identity.accent};margin:28px 0}
  .small{font:13px/1.6 Arial,sans-serif;letter-spacing:1px}
  .image{position:absolute;left:${square?550:802}px;top:${square?495:68}px;width:${square?360:310}px;height:${square?680:780}px;border-radius:12px;border:1px solid ${identity.accent};box-shadow:0 25px 50px #0009;transform:rotate(${Number(folder.slice(0,2))%2?7:-6}deg);object-fit:cover;object-position:top}
  .number{position:absolute;right:${square?580:90}px;bottom:${square?140:38}px;font-size:${square?230:80}px;line-height:1;color:${identity.accent};opacity:.4}
  .footer{position:absolute;bottom:48px;left:75px;font:11px Arial,sans-serif;letter-spacing:3px;color:${identity.accent}}
  </style></head><body><div class="frame"></div><div class="halo"></div><div class="copy"><div class="brand"><img src="data:image/svg+xml;base64,${icon}"> ILUD <span style="font:10px Arial;letter-spacing:4px">ILUDIST</span></div><p class="kicker">An independent interpretation / ${folder.slice(0,2)}</p><h1>${escape(identity.name)}</h1><p class="tagline">${escape(identity.tagline)}</p><div class="rule"></div><p class="small">Practical ways to use your everyday tools<br>with less unwanted AI.</p></div><img class="image" src="data:image/jpeg;base64,${shot}"><span class="number">${folder.slice(0,2)}</span><div class="footer">YOUR INTERNET. A LITTLE MORE YOURS.</div></body></html>`);
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:path.join(app,name),type:'jpeg',quality:92});
}
await page.setViewportSize({width:180,height:180});
await page.setContent(`<html><body style="margin:0;width:180px;height:180px;background:${identity.background}"><img width="180" height="180" src="data:image/svg+xml;base64,${icon}"></body></html>`);
await page.screenshot({path:path.join(app,'assets','apple-touch-icon.png')});
await browser.close();
console.log(`Captured ${folder} and designed 3 JPEG sharing compositions.`);
