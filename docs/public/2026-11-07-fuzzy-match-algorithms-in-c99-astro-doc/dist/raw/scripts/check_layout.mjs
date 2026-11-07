/** Browser checks for the published docs. Use an ordinary installed Playwright
 * browser, or supply PM_CHROMIUM_PATH/PM_CHROMIUM_ARGS for a test host's binary.
 * This script tests the site; it never changes hosting or benchmark results.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = new URL(process.argv[2] || 'https://c99-property-match-guide.mach1ne.chatgpt.site');
assert(['http:', 'https:'].includes(origin.protocol), 'Supply an HTTP(S) site URL');
const launch = { headless: true };
if (process.env.PM_CHROMIUM_PATH) launch.executablePath = process.env.PM_CHROMIUM_PATH;
if (process.env.PM_CHROMIUM_ARGS) launch.args = JSON.parse(process.env.PM_CHROMIUM_ARGS);
const browser = await chromium.launch(launch);
const snapshots = new URL('../.generated/layout-screenshots/', import.meta.url);
await fs.mkdir(snapshots, { recursive: true });
const cases = [
  { name: 'desktop-wide', width: 1825, height: 920, mobile: false },
  { name: 'desktop', width: 1366, height: 900, mobile: false },
  { name: 'portrait', width: 390, height: 844, mobile: true },
  { name: 'landscape', width: 844, height: 390, mobile: true },
  { name: 'small-portrait', width: 320, height: 640, mobile: true },
];
const records = [];
try {
  for (const view of cases) {
    const context = await browser.newContext({
      viewport: { width: view.width, height: view.height },
      isMobile: view.mobile, hasTouch: view.mobile, deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const path of ['/code/src-algorithms-edit-c/', '/code/src-parser-c/', '/code/src-algorithms-algorithms-c/', '/']) {
      const response = await page.goto(new URL(path, origin).href);
      assert(response?.ok(), `${view.name}: ${path} failed to load`);
      await page.locator('#reader-size').waitFor();
      await page.evaluate(() => document.fonts.ready);
      const geometry = await page.evaluate(() => {
        const source = document.querySelector('.annotated-source');
        const content = document.querySelector('.sl-markdown-content');
        const size = document.querySelector('#reader-size').getBoundingClientRect();
        return {
          viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          sourceWidth: source?.getBoundingClientRect().width,
          sourceLeft: source?.getBoundingClientRect().left,
          contentWidth: content.getBoundingClientRect().width,
          sizeVisible: size.left >= 0 && size.right <= innerWidth && size.top >= 0,
          wrapped: [...document.querySelectorAll('.line-text')].every(line => getComputedStyle(line).whiteSpace === 'pre-wrap'),
          oldControls: !!document.querySelector('.reading-settings, #reader-wrap'),
          headings: [...content.querySelectorAll('h2')].length,
          paragraphs: [...content.querySelectorAll('p')].length,
          diagramsLoaded: [...document.querySelectorAll('.source-diagram img')].every(image => image.complete && image.naturalWidth > 0),
        };
      });
      assert(geometry.scrollWidth <= geometry.viewport + 1, `${view.name} ${path}: page overflow ${JSON.stringify(geometry)}`);
      assert(geometry.sizeVisible && geometry.wrapped && !geometry.oldControls && geometry.diagramsLoaded,
        `${view.name} ${path}: controls, wrapping or diagrams failed`);
      if (geometry.sourceWidth) {
        assert(geometry.sourceWidth >= geometry.contentWidth - 2, 'Source does not fill article width');
        assert(geometry.headings > 0 && geometry.paragraphs > 1, 'Missing file article');
      }
      records.push({ view: view.name, path, ...geometry });
      if (path === '/code/src-algorithms-edit-c/') {
        await page.screenshot({ path: new URL(`${view.name}.png`, snapshots).pathname });
      }
    }
    await page.selectOption('#reader-size', 'large');
    assert.equal(await page.locator('.sl-markdown-content p').first().evaluate(p => getComputedStyle(p).fontSize), '20px');
    await page.reload();
    assert.equal(await page.locator('#reader-size').inputValue(), 'large', 'Text size did not persist');
    await page.selectOption('#reader-size', 'standard');
    if (view.width >= 800) {
      const grip = page.getByRole('separator', { name: 'Navigation width' });
      await grip.focus();
      await grip.press('ArrowRight');
      assert.equal(await grip.getAttribute('aria-valuenow'), '288');
      await grip.press('Home');
      const edge = await grip.boundingBox();
      await page.mouse.move(edge.x + edge.width / 2, edge.y + 100);
      await page.mouse.down();
      await page.mouse.move(320, edge.y + 100);
      await page.mouse.up();
      assert.equal(await grip.getAttribute('aria-valuenow'), '320', 'Pointer resize failed');
      await page.reload();
      assert.equal(await grip.getAttribute('aria-valuenow'), '320', 'Width did not persist');
      await page.getByRole('button', { name: 'Hide navigation', exact: true }).click();
      assert.equal(await page.locator('#starlight__sidebar').evaluate(el => Math.round(el.getBoundingClientRect().width)), 52);
      await page.reload();
      await page.getByRole('button', { name: 'Show navigation', exact: true }).click();
    } else {
      const menu = page.locator('button[popovertarget="starlight__sidebar"]');
      await menu.click();
      assert(await page.locator('#starlight__sidebar').evaluate(el => el.matches(':popover-open')), 'Mobile menu did not open');
      await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Parsing and resolution sequence', exact: true }).click();
      assert(page.url().endsWith('/configuration-sequence/'), 'Mobile navigation failed');
    }
    assert.deepEqual(errors, [], `${view.name}: browser exceptions`);
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto(new URL('/code/src-algorithms-edit-c/', origin).href);
  await page.screenshot({ path: new URL('dark-desktop.png', snapshots).pathname });
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const search = page.locator('.pagefind-ui__search-input');
  await search.fill('Levenshtein');
  await page.locator('.pagefind-ui__result-link').first().waitFor({ timeout: 20000 });
  assert(await page.locator('.pagefind-ui__result-link').count() > 0, 'Search returned no results');
  await context.close();
  const report = { passed: true, browser: browser.version(), viewportCases: cases, pagesChecked: records.length,
    checks: ['no page overflow', 'source fills article', 'always-wrapped lines', 'authored file articles', 'diagram loading',
      'text size and persistence', 'pointer and keyboard resizing', 'navigation collapse and persistence', 'mobile menu navigation', 'dark theme', 'Pagefind search'],
    records };
  await fs.writeFile(new URL('../reports/layout-check.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log(`PASS: ${records.length} pages across ${cases.length} viewport/orientation cases; controls, mobile navigation and search.`);
} finally {
  await browser.close();
}
