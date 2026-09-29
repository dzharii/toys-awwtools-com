import {test,expect} from '@playwright/test';
import {readdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
const apps=process.env.APP?[process.env.APP]:readdirSync('.',{withFileTypes:true}).filter(e=>e.isDirectory()&&/^\d{2}-[a-z]+$/.test(e.name)).map(e=>e.name);
for(const app of apps){
  test.describe(app,()=>{
    test('entry, responsive layout, browse, detail, saving and source disclosure',async({page})=>{
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(`/${app}/`);
      await page.waitForSelector('html.ready');
      await page.emulateMedia({reducedMotion:'reduce'});
      await expect(page.locator('.fatal-error')).toHaveCount(0);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
      await page.locator('[data-library]:visible').first().click();
      const dialog=page.locator('dialog');
      await expect(dialog).toBeVisible();
      await dialog.getByRole('searchbox',{name:'Search fixes'}).fill('google');
      await expect(dialog.locator('.library-result')).not.toHaveCount(0);
      await dialog.locator('[data-fix="google-web"]').click();
      await expect(dialog.locator('h2')).toHaveText('Search without AI summaries');
      await dialog.locator('[data-save]').click();
      await expect(dialog.locator('[data-save]')).toHaveAttribute('aria-pressed','true');
      await dialog.locator('summary').click();
      await expect(dialog.locator('.sources a').first()).toHaveAttribute('href',/support.google.com/);
      await dialog.locator('[data-close]').click();
      await expect(dialog).not.toBeVisible();
      await page.locator('[data-saved]').first().click();
      await expect(dialog.locator('[data-fix="google-web"]')).toBeVisible();
      await dialog.locator('[data-close]').click();
      await page.reload();await page.waitForSelector('html.ready');
      await page.locator('[data-saved]').first().click();
      await expect(dialog.locator('[data-fix="google-web"]')).toBeVisible();
      expect(errors).toEqual([]);
    });
    test('filters, empty states, deep link and exact outgoing query',async({page,context})=>{
      await page.goto(`/${app}/#fix=google-web`);
      await expect(page.locator('dialog')).toBeVisible();
      await page.locator('#action-query').fill('tea & coffee + 東京');
      await context.route('https://www.google.com/**',route=>route.fulfill({body:'Prepared result destination'}));
      const popupPromise=context.waitForEvent('page');
      await page.locator('.action-form button').click();
      const popup=await popupPromise;
      await popup.waitForLoadState();
      const url=new URL(popup.url());
      expect(url.searchParams.get('q')).toBe('tea & coffee + 東京');
      expect(url.searchParams.get('udm')).toBe('14');
      await popup.close();
      await page.locator('[data-close]').click();
      await page.locator('[data-library]:visible').first().click();
      await page.getByRole('searchbox',{name:'Search fixes'}).fill('zzzz-no-such-fix');
      await expect(page.locator('.empty-state')).toBeVisible();
      await page.locator('[data-reset-filters]').click();
      await page.getByLabel('Activity',{exact:true}).selectOption('writing');
      await page.getByLabel('Phone-friendly',{exact:true}).check();
      await expect(page.locator('.library-result')).toHaveCount(1);
      await expect(page.locator('.library-result')).toContainText('keyboard');
      await page.keyboard.press('Escape');
      await expect(page.locator('dialog')).not.toBeVisible();
    });
    test('accessible home and detail with no serious violations',async({page})=>{
      await page.goto(`/${app}/`);await page.waitForSelector('html.ready');
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.addScriptTag({path:path.resolve('node_modules','axe-core','axe.min.js')});
      const run=()=>page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});
      expect(await run()).toEqual([]);
      await page.locator('[data-library]:visible').first().click();
      await page.locator('dialog [data-fix="google-web"]').first().click();
      expect(await run()).toEqual([]);
    });
  });
}
test('catalogue records and URL construction are complete',async()=>{
  const catalogue=JSON.parse(readFileSync('research/catalogue.json','utf8'));
  const seen=new Set();
  for(const e of catalogue.entries){
    expect(seen.has(e.id)).toBeFalsy();seen.add(e.id);
    for(const field of ['id','category','title','summary','changes','caveat','url','mechanism'])expect(e[field]?.length).toBeGreaterThan(0);
    expect(e.steps.length).toBeGreaterThan(0);expect(e.sources.length).toBeGreaterThan(0);
    expect(new URL(e.url).protocol).toBe('https:');
    e.sources.forEach(s=>expect(new URL(s.url).protocol).toBe('https:'));
  }
  expect(catalogue.categories).toHaveLength(12);
});
