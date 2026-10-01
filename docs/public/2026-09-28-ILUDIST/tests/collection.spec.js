import{test,expect}from'@playwright/test';
import path from'node:path';
test('collection presents and launches all ten independent applications',async({page})=>{
 test.skip(Boolean(process.env.APP));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.evaluate(()=>document.fonts.ready);await expect(page.locator('.edition-card')).toHaveCount(10);
 await expect(page.locator('.archive-grid article')).toHaveCount(4);
 await expect(page.locator('.archive-context')).toContainText('not an independent audit');
 const astra=page.locator('.archive-grid article').filter({has:page.getByRole('heading',{name:'The Astra ChatGPT run'})});
 await expect(astra).toContainText('unable to access most of the tooling');
 await expect(astra).toContainText('low-quality results');
 await expect(astra.locator('a')).toHaveAttribute('href','https://toys.awwtools.com/public/2026-09-28-ILUDIST/experiment-gpt-6-astra-high-work-in-chatgpt-2026-09-29/');
 const opus=page.locator('.archive-grid article').filter({has:page.getByRole('heading',{name:'The Opus Copilot run'})});
 await expect(opus).toContainText('three hours to complete only five of the ten applications');
 await expect(opus).toContainText('better in quality than the Astra ChatGPT results');
 await expect(opus).toContainText('not worth the time spent');
 await expect(opus.locator('a')).toHaveAttribute('href','https://toys.awwtools.com/public/2026-09-28-ILUDIST/experiment-opus-5.5-high-copilot-2026-09-29/');
 const archives=await page.locator('.archive-grid a').evaluateAll(links=>links.map(a=>a.href));
 expect(archives.every(url=>url.startsWith('https://toys.awwtools.com/public/2026-09-28-ILUDIST/experiment-'))).toBeTruthy();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 const targets=await page.locator('.launch').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
 for(const href of targets){
  await page.goto('/');await page.locator(`.launch[href="${href}"]`).click();await page.waitForSelector('html.ready');await expect(page.locator('.fatal-error')).toHaveCount(0);
 }
 await page.goto('/');await page.setViewportSize({width:320,height:640});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 await page.addScriptTag({path:path.resolve('node_modules','axe-core','axe.min.js')});
 const violations=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});
 expect(violations).toEqual([]);expect(errors).toEqual([]);
});
