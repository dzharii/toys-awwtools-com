import{test,expect}from'@playwright/test';
import{readdirSync,readFileSync}from'node:fs';
import{readFile,stat}from'node:fs/promises';
import http from'node:http';
import path from'node:path';
const apps=process.env.APP?[process.env.APP]:readdirSync('.',{withFileTypes:true}).filter(e=>e.isDirectory()&&/^\d{2}-[a-z]+$/.test(e.name)).map(e=>e.name);
const editions={'01-folio':'folio','02-dial':'dial','03-atlas':'atlas','04-routes':'routes','05-journal':'journal','06-lens':'lens','07-guide':'guide','08-cabinet':'cabinet','09-doors':'doors','10-current':'current'};
for(const app of apps){
 test.describe(`${app} resilience`,()=>{
  test('small portrait, landscape, zoom, keyboard focus and malformed links',async({page})=>{
   const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
   await page.goto(`/${app}/#fix=%E0%A4%A`);await page.waitForSelector('html.ready');
   await expect(page.locator('.toast')).toContainText('malformed');
   for(const [width,height]of[[320,640],[844,390],[1280,800]]){
    await page.setViewportSize({width,height});
    await page.evaluate(async zoom=>{
     document.documentElement.style.zoom=zoom;
     await document.fonts.ready;
     await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    },width===1280?'2':'1');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${app} at ${width}`).toBeTruthy();
    await page.locator('[data-library]:visible').first().click();
    await expect(page.locator('dialog')).toBeVisible();
    expect(await page.locator('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-library]:visible').first()).toBeFocused();
   }
   await page.goto(`/${app}/#fix=missing-fix`);await expect(page.locator('.toast')).toContainText('not in this edition');
   expect(errors).toEqual([]);
  });
  test('storage denial and clipboard denial are explicit; saves still work for the session',async({page})=>{
   await page.addInitScript(()=>{
    Object.defineProperty(Storage.prototype,'getItem',{value(){throw new DOMException('Blocked by test','SecurityError');}});
    Object.defineProperty(Storage.prototype,'setItem',{value(){throw new DOMException('Blocked by test','SecurityError');}});
    Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new DOMException('Blocked by test','NotAllowedError'))}});
   });
   await page.goto(`/${app}/#fix=google-web`);await expect(page.locator('dialog')).toBeVisible();
   await expect(page.locator('.toast')).toContainText('storage is unavailable');
   await page.locator('[data-save]').click();await expect(page.locator('[data-save]')).toHaveAttribute('aria-pressed','true');
   await page.locator('[data-copy]').click();await expect(page.locator('.copy-fallback')).toContainText(`#fix=google-web`);
   await page.locator('[data-close]').click();await page.locator('[data-saved]').first().click();
   await expect(page.locator('dialog [data-fix="google-web"]')).toBeVisible();
  });
  test('corrupt state, optional audio, removal, clear confirmation and blank query',async({page,context})=>{
   await page.addInitScript(key=>{
    localStorage.setItem(key,'{broken');
    window.audioStarts=0;
    const Native=window.AudioContext||window.webkitAudioContext;
    if(Native)window.AudioContext=new Proxy(Native,{construct(target,args){window.audioStarts++;return Reflect.construct(target,args);}});
   },`ilud.${editions[app]}.v1`);
   await page.goto(`/${app}/`);await page.waitForSelector('html.ready');await expect(page.locator('.toast')).toContainText('Saved data could not be read');
   expect(await page.evaluate(()=>window.audioStarts)).toBe(0);
   await page.locator('[data-about]').first().click();await page.locator('dialog [data-sound]').click();
   await expect(page.locator('.toast')).toContainText(/sounds on|Sound is unavailable/);
   if(await page.locator('dialog [data-sound]').getAttribute('aria-pressed')==='true'){
    expect(await page.evaluate(()=>window.audioStarts)).toBe(1);await page.locator('dialog [data-sound]').click();
   }else await expect(page.locator('.toast')).toContainText('Sound is unavailable');
   await expect(page.locator('dialog [data-sound]')).toHaveAttribute('aria-pressed','false');
   await page.locator('[data-close]').click();await page.locator('[data-library]:visible').first().click();await page.locator('dialog [data-fix="google-web"]').click();
   await page.locator('#action-query').fill('   ');await page.locator('.action-form button').click();
   expect(await page.locator('#action-query').evaluate(e=>e.validity.valid)).toBeFalsy();expect(context.pages()).toHaveLength(1);
   await page.locator('[data-save]').click();await page.locator('[data-save]').click();await expect(page.locator('[data-save]')).toHaveAttribute('aria-pressed','false');
   await page.locator('[data-save]').click();await page.locator('[data-close]').click();await page.locator('[data-about]').first().click();
   await page.locator('[data-clear-data]').click();await expect(page.locator('[data-clear-data]')).toContainText('Confirm');
   await page.locator('[data-clear-data]').click();await page.locator('[data-close]').click();await page.locator('[data-saved]').first().click();
   await expect(page.locator('.empty-state')).toContainText('Your case is empty');
  });
  test('publishes alone at a new root and loads no sibling or third-party resources',async({page})=>{
   const root=path.resolve(app),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.png':'image/png'};
   const server=http.createServer(async(req,res)=>{
    try{
     let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://test').pathname));
     if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
     if((await stat(file)).isDirectory())file=path.join(file,'index.html');
     const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(bytes);
    }catch(error){res.writeHead(error.code==='ENOENT'?404:500).end(String(error));}
   });
   await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
   const origin=`http://127.0.0.1:${server.address().port}`,requests=[],failures=[];
   page.on('request',r=>requests.push(r.url()));page.on('response',r=>{if(r.status()>=400)failures.push(r.url());});
   try{
    await page.goto(origin);await page.waitForSelector('html.ready');await page.evaluate(()=>document.fonts.ready);
    await page.locator('[data-library]:visible').first().click();await expect(page.locator('.library-result')).toHaveCount(31);
    await page.locator('dialog [data-fix="google-web"]').click();await expect(page.locator('#dialog-title')).toHaveText('Search without AI summaries');
    expect(requests.every(url=>new URL(url).origin===origin)).toBeTruthy();expect(failures).toEqual([]);
   }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
  });
 });
}
test('all prepared action types preserve query content and qualifiers',async({page})=>{
 await page.goto('/01-folio/');await page.waitForSelector('html.ready');
 const catalogue=JSON.parse(readFileSync(path.join('research','catalogue.json'),'utf8')),phrase='tea & coffee + \u6771\u4eac / #?';
 const results=await page.evaluate(async phrase=>{
  const{createApp}=await import('./core.js');const app=await createApp('url-test');
  return app.entries.filter(e=>e.query).map(e=>({id:e.id,url:app.urlFor(e,phrase)}));
 },phrase);
 for(const result of results){
  const e=catalogue.entries.find(e=>e.id===result.id),url=new URL(result.url);
  if(e.query.path)expect(decodeURIComponent(url.pathname)).toBe(decodeURIComponent(new URL(e.url).pathname)+phrase);
  else expect(url.searchParams.get(e.query.key)).toBe(phrase+(e.query.suffix||''));
  for(const[key,value]of Object.entries(e.query.params))expect(url.searchParams.get(key)).toBe(value);
 }
});
test('catalogue failure is explicit and a stale edition admits review is due',async({page})=>{
 await page.route('**/catalogue.json',r=>r.fulfill({status:503,body:'unavailable'}));
 await page.goto('/01-folio/');await expect(page.locator('.fatal-error')).toContainText('503');await page.unroute('**/catalogue.json');
 await page.clock.setFixedTime(new Date('2027-03-01T12:00:00Z'));
 await page.goto('/01-folio/?review=stale#fix=google-web');await page.locator('dialog summary').click();await expect(page.locator('dialog details')).toContainText('Due for review');
});
