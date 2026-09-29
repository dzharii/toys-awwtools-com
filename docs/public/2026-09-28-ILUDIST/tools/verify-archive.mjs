import{readFile}from'node:fs/promises';
import http from'node:http';
import path from'node:path';
import{unzipSync}from'fflate';
import{chromium}from'@playwright/test';
const archive=unzipSync(await readFile('ILUDIST-2026-09-28.zip')),prefix='2026-09-28/Ilude/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png','.jpg':'image/jpeg'};
const failures=[];
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://archive'),name=decodeURIComponent(url.pathname).replace(/^\/+/,'');
 const file=prefix+(name.endsWith('/')||!name?name+'index.html':name),bytes=archive[file];
 if(!bytes){failures.push(file);res.writeHead(404).end('Not in the archive');return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(Buffer.from(bytes));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin);await page.evaluate(()=>document.fonts.ready);
 const links=await page.locator('.launch').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
 if(links.length!==10)throw new Error('Archive catalogue does not expose all ten applications.');
 for(const link of links){
  await page.goto(new URL(link,origin).href);await page.waitForSelector('html.ready');await page.evaluate(()=>document.fonts.ready);
  await page.locator('[data-library]:visible').first().click();
  if(await page.locator('.library-result').count()!==31)throw new Error(`Incomplete archive catalogue: ${link}`);
  await page.locator('dialog [data-fix="google-web"]').click();
  if(!await page.locator('#action-query').isVisible())throw new Error(`Archive action missing: ${link}`);
 }
 if(failures.length||errors.length)throw new Error(JSON.stringify({failures,errors}));
 console.log('Archive-only HTTP smoke check: root and all ten applications load and open real remedies without workspace assets.');
}finally{
 await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
