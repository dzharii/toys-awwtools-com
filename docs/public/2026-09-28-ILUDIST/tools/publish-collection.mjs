import{chromium}from'@playwright/test';
import{readFile}from'node:fs/promises';
import path from'node:path';
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
try{
 await page.goto('http://127.0.0.1:4173/');await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:'screenshot-desktop.jpg',type:'jpeg',quality:85,fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'screenshot.jpg',type:'jpeg',quality:88,fullPage:true});
 const font=(await readFile(path.join('assets','fonts','cormorant.ttf'))).toString('base64');
 const images=await Promise.all(['01-folio','02-dial','08-cabinet'].map(async name=>(await readFile(path.join(name,'screenshot.jpg'))).toString('base64')));
 await page.setViewportSize({width:1200,height:630});
 await page.setContent(`<!doctype html><html><head><style>@font-face{font-family:Editorial;src:url(data:font/ttf;base64,${font})}*{box-sizing:border-box}body{margin:0;background:#e9e4d7;color:#273b30;font-family:Editorial,serif}.frame{position:absolute;inset:23px;border:1px solid #a7b099}.copy{position:absolute;left:65px;top:60px;width:550px}.logo{font-size:40px;letter-spacing:-1px}.logo span{font:12px Arial;letter-spacing:5px;margin-left:6px}.eyebrow{font:10px Arial;letter-spacing:3px;margin:29px 0 22px}h1{font-size:93px;line-height:.87;font-weight:500;letter-spacing:-2px;margin:0}em{color:#88654a}p{font-size:27px;max-width:460px;margin:25px 0}.foot{position:absolute;left:65px;bottom:51px;font:10px Arial;letter-spacing:2px}.shot{position:absolute;top:75px;width:228px;height:491px;border:5px solid #344739;border-radius:18px;overflow:hidden;box-shadow:0 20px 30px #30492e44}.shot img{width:100%}.s0{left:650px;transform:rotate(-11deg)}.s1{left:784px;top:57px;transform:rotate(1deg);z-index:2}.s2{left:935px;top:87px;transform:rotate(12deg)}.ring{position:absolute;left:640px;top:50px;width:560px;height:520px;border:1px solid #aeb79e;border-radius:50%}</style></head><body><div class="frame"></div><div class="ring"></div><div class="copy"><div class="logo">ILUD<span>IST</span></div><div class="eyebrow">TEN INDEPENDENT INTERPRETATIONS</div><h1>Your internet.<br>A little more<br><em>yours.</em></h1><p>Practical ways to use everyday tools<br>with less unwanted AI.</p></div>${images.map((v,i)=>`<div class="shot s${i}"><img src="data:image/jpeg;base64,${v}"></div>`).join('')}<div class="foot">31 CONSIDERED FIXES / 12 EVERYDAY ACTIVITIES</div></body></html>`);
 await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'social.jpg',type:'jpeg',quality:92});
}finally{await browser.close();}
console.log('Captured the collection and composed its JPEG social cover.');
