'use strict';
const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {pathToFileURL} = require('node:url');
const {createRequire} = require('node:module');
const P = require('../src/prompt-core.js');
let playwright;
try { playwright = {...require('playwright'), expect: require('playwright/test').expect}; }
catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
  const globalRoot = process.env.PLAYWRIGHT_MODULE_PATH || (process.env.APPDATA && path.join(process.env.APPDATA, 'npm', 'node_modules', 'playwright', 'package.json'));
  if (!globalRoot) throw new Error('Playwright is required: provide PLAYWRIGHT_MODULE_PATH pointing to its installed package.json.');
  const installedRequire = createRequire(globalRoot);
  playwright = {...installedRequire('playwright'), expect: installedRequire('playwright/test').expect};
}
let browser, server, base;
const screenshotDir = process.env.PROMPT_MENU_SCREENSHOTS;
before(async () => {
  server = http.createServer((request, response) => {
    if (request.url !== '/') { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(fs.readFileSync(path.join(__dirname, '..', 'index.html')));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  browser = await playwright.chromium.launch();
  if (screenshotDir) fs.mkdirSync(screenshotDir, {recursive: true});
});
after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});
async function open(t, options = {}, init) {
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, ...options});
  const errors = [];
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  if (init) await page.addInitScript(init);
  t.after(async () => { await context.close(); assert.deepEqual(errors, []); });
  await page.goto(base);
  await playwright.expect(page.locator('#prompt')).toHaveValue(P.buildPrompt(P.defaults));
  return page;
}
async function capture(page, name, fullPage = false) {
  if (screenshotDir) await page.screenshot({path: path.join(screenshotDir, name + '.png'), fullPage, animations: 'disabled'});
}
async function synchronized(page) {
  assert.equal(await page.locator('#live-text').textContent(), await page.locator('#prompt').inputValue());
  assert.equal(await page.locator('#prompt').evaluate(node => node.readOnly), true);
}
async function check(page, name, value) {
  await page.locator('input[name="' + name + '"][value="' + value + '"]').check();
}
async function importData(page, data) {
  await page.locator('#import-file').setInputFiles({name: 'settings.json', mimeType: 'application/json', buffer: Buffer.from(typeof data === 'string' ? data : JSON.stringify(data))});
}

test('preset tiles explain choices, distinguish inspection from selection, and preserve context/clones', async t => {
  const page = await open(t, {reducedMotion: 'reduce'});
  const tiles = page.locator('.preset-tile');
  await playwright.expect(tiles).toHaveCount(4);
  assert.equal(await page.locator('select#preset').count(), 0);
  for (const tile of await tiles.all()) {
    assert.ok((await tile.locator('.preset-summary').textContent()).length > 15);
    assert.equal(await tile.locator('svg use').count(), 1);
  }
  const original = await page.locator('#prompt').inputValue();
  const review = tiles.filter({has: page.locator('input[value=implementation]')});
  await review.hover();
  await playwright.expect(page.locator('#preset-detail-title')).toHaveText('Implementation review');
  await playwright.expect(page.locator('#preset-detail-state')).toContainText('Preview only');
  await playwright.expect(page.locator('#prompt')).toHaveValue(original);
  await capture(page, 'preset-hover');
  await page.mouse.move(10, 10);
  await playwright.expect(page.locator('#preset-detail-title')).toHaveText('Technical insight');
  await page.locator('input[name=preset][value=walkthrough]').focus();
  await playwright.expect(page.locator('#preset-detail-title')).toHaveText('Algorithm walkthrough');
  await playwright.expect(page.locator('#prompt')).toHaveValue(original);
  await page.keyboard.press('Space');
  await playwright.expect(page.locator('#prompt')).toHaveValue(P.buildPrompt(P.applyPreset('walkthrough', P.defaults)));
  await playwright.expect(page.locator('#preset-detail-state')).toHaveText('Selected configuration');
  await page.locator('#task').fill('Keep my custom task.');
  await page.locator('#special').fill('Keep these instructions.');
  await page.locator('#edit').click();
  await page.locator('.clone-card textarea').fill('Keep this clone.');
  await check(page, 'preset', 'implementation');
  await playwright.expect(page.locator('#task')).toHaveValue('Keep my custom task.');
  await playwright.expect(page.locator('#special')).toHaveValue('Keep these instructions.');
  await playwright.expect(page.locator('.clone-card textarea')).toHaveValue('Keep this clone.');
  await playwright.expect(page.locator('#preset-detail-settings')).toContainText('heap.h + heap.c + example main.c');
  await synchronized(page);
  await page.locator('#remember').check();
  await page.reload();
  await playwright.expect(page.locator('input[name=preset][value=implementation]')).toBeChecked();
  const current = await page.locator('#prompt').inputValue();
  await check(page, 'preset', 'custom');
  await playwright.expect(page.locator('#prompt')).toHaveValue(current);
  await playwright.expect(page.locator('#preset-detail-description')).toContainText('not a saved preset');
  await check(page, 'verbosity', 'expanded');
  await playwright.expect(page.locator('input[name=preset][value=custom]')).toBeChecked();
  await playwright.expect(page.locator('#preset-detail-settings')).toContainText('Expanded');
});

test('touch preset selection exposes nearby details and supports more than four tiles', async t => {
  const page = await open(t, {viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}, () => {
    let api;
    Object.defineProperty(window, 'PromptMenu', {
      configurable: true,
      get() { return api; },
      set(value) {
        api = value;
        for (let i = 1; i <= 3; i++) value.presets['extra-' + i] = {...value.presets.insight, label: 'Additional preset ' + i, summary: 'Another readable configuration.', settings: {verbosity: 'compact'}};
      }
    });
  });
  await playwright.expect(page.locator('.preset-tile')).toHaveCount(7);
  await page.locator('.preset-tile').filter({has: page.locator('input[value=implementation]')}).tap();
  await playwright.expect(page.locator('input[name=preset][value=implementation]')).toBeChecked();
  await playwright.expect(page.locator('#preset-detail-title')).toHaveText('Implementation review');
  assert.ok(await page.locator('#preset-detail').evaluate(node => node.previousElementSibling.querySelector('input').value === 'implementation'));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await capture(page, 'preset-touch-expanded-list', true);
  await page.setViewportSize({width: 1440, height: 1000});
  await page.locator('#live-tab').click();
  const hint = await page.locator('#preset-detail').boundingBox(), menu = await page.locator('#menu').boundingBox();
  assert.ok(hint.x >= menu.x && hint.x + hint.width <= menu.x + menu.width);
  await capture(page, 'preset-seven-tiles', true);
});

test('desktop dock, exact live synchronization, subtle diff and removal feedback', async t => {
  const page = await open(t);
  await playwright.expect(page.locator('#live-preview')).toBeVisible();
  const lane = await page.locator('#menu').boundingBox(), panel = await page.locator('#live-preview').boundingBox();
  assert.ok(lane.x <= 24 && lane.x + lane.width <= panel.x - 8);
  await capture(page, 'desktop-full', true);
  await check(page, 'structure', 'code');
  await synchronized(page);
  assert.ok(await page.locator('.diff-added').count() > 0);
  await playwright.expect(page.locator('#live-change')).toContainText('Explanation structure updated');
  await playwright.expect(page.locator('#removed-change')).toBeVisible();
  await page.locator('#removed-change summary').click();
  await playwright.expect(page.locator('#removed-text')).toContainText('Start with');
  await capture(page, 'desktop-structure');
  await page.locator('#live-highlight').uncheck();
  await check(page, 'depth', 'rigorous');
  assert.equal(await page.locator('.diff-added').count(), 0);
  await page.locator('#live-size').selectOption('large');
  assert.equal(await page.locator('#live-text').evaluate(node => getComputedStyle(node).fontSize), '16px');
  await page.locator('#live-follow').uncheck();
  await page.locator('#live-content').evaluate(node => node.scrollTop = 120);
  await check(page, 'verbosity', 'compact');
  assert.ok(Math.abs(await page.locator('#live-content').evaluate(node => node.scrollTop) - 120) <= 1);
  await synchronized(page);
});

test('floating window supports pointer and keyboard movement, eight resizers, maximize, restore and docking', async t => {
  const page = await open(t);
  const panel = page.locator('#live-preview');
  const initial = await panel.boundingBox();
  const title = await page.locator('#live-move').boundingBox();
  await page.mouse.move(title.x + 50, title.y + 12);
  await page.mouse.down(); await page.mouse.move(title.x - 150, title.y + 92); await page.mouse.up();
  let moved = await panel.boundingBox();
  assert.equal(Math.round(moved.x), Math.round(initial.x - 200));
  await page.locator('#live-move').focus();
  await page.keyboard.press('Shift+ArrowLeft');
  assert.equal(Math.round((await panel.boundingBox()).x), Math.round(moved.x - 30));
  assert.equal(await page.locator('.resize-handle').count(), 8);
  for (const edge of ['n', 'e', 's', 'w', 'nw', 'ne', 'sw', 'se']) {
    await page.locator('#live-dock').click();
    const handle = page.locator('.resize-' + edge);
    await handle.focus();
    await page.keyboard.press(edge.includes('w') ? 'ArrowLeft' : edge.includes('e') ? 'ArrowRight' : edge === 'n' ? 'ArrowUp' : 'ArrowDown');
    const resized = await panel.boundingBox();
    assert.ok(resized.width !== initial.width || resized.height !== initial.height, edge);
    assert.ok(resized.x >= 12 && resized.y >= 12 && resized.x + resized.width <= 1428 && resized.y + resized.height <= 988);
  }
  await page.locator('#live-dock').click();
  const handle = await page.locator('.resize-sw').boundingBox();
  await page.mouse.move(handle.x + 7, handle.y + 7); await page.mouse.down();
  await page.mouse.move(handle.x - 63, handle.y + 67); await page.mouse.up();
  const resized = await panel.boundingBox();
  assert.ok(resized.width > initial.width && resized.height > initial.height);
  await capture(page, 'desktop-resized');
  await page.locator('#live-maximize').click();
  assert.equal(Math.round((await panel.boundingBox()).width), 1416);
  await page.locator('#live-maximize').click();
  assert.deepEqual(await panel.boundingBox(), resized);
  await page.locator('#live-dock').click();
  assert.deepEqual(await panel.boundingBox(), initial);
  await page.locator('#live-collapse').click();
  await playwright.expect(page.locator('#live-preview')).toBeHidden();
  await playwright.expect(page.locator('#live-tab')).toBeVisible();
  assert.equal(await page.locator('#live-tab').evaluate(node => getComputedStyle(node).writingMode), 'vertical-rl');
  await page.locator('#live-tab').click();
  await page.keyboard.press('Escape');
  await playwright.expect(page.locator('#live-tab')).toBeFocused();
});

test('bottom prompt suppresses redundant preview and returning to settings restores it without layout jumps', async t => {
  const page = await open(t);
  const original = await page.locator('#live-preview').boundingBox();
  await page.locator('#preview').evaluate(node => node.scrollIntoView({behavior: 'instant'}));
  await playwright.expect(page.locator('#live-preview')).toBeHidden();
  await capture(page, 'desktop-bottom');
  await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  await playwright.expect(page.locator('#live-preview')).toBeVisible();
  assert.deepEqual(await page.locator('#live-preview').boundingBox(), original);
  await page.locator('#live-autohide').uncheck();
  await page.locator('#preview').evaluate(node => node.scrollIntoView({behavior: 'instant'}));
  await playwright.expect(page.locator('#live-preview')).toBeVisible();
});

test('multiple editable clones survive all settings paths, append-only imports, and confirmed deletion', async t => {
  const page = await open(t);
  const original = await page.locator('#prompt').inputValue();
  await page.locator('#edit').click();
  let editors = page.locator('.clone-card textarea');
  await playwright.expect(editors).toHaveCount(1);
  await playwright.expect(editors.first()).toHaveValue(original);
  await editors.first().fill('My private edited draft <script>not markup</script>');
  await page.locator('.clone-name input').first().fill('My user notes');
  await check(page, 'depth', 'rigorous');
  await check(page, 'preset', 'implementation');
  await page.locator('#reset').click();
  await playwright.expect(editors.first()).toHaveValue('My private edited draft <script>not markup</script>');
  await page.locator('#edit').click();
  await playwright.expect(editors).toHaveCount(2);
  await editors.nth(1).fill('Second independent draft');
  const imported = {...P.defaults, promptClones: [{id: 'clone-1', title: 'Imported', text: 'Imported draft', createdAt: '2026-10-10T12:00:00.000Z'}]};
  await importData(page, imported);
  await playwright.expect(editors).toHaveCount(3);
  await playwright.expect(editors.first()).toHaveValue('My private edited draft <script>not markup</script>');
  await capture(page, 'desktop-clones', true);
  page.once('dialog', dialog => dialog.dismiss());
  await page.locator('.delete-clone').first().click();
  await playwright.expect(editors).toHaveCount(3);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('.delete-clone').first().click();
  await playwright.expect(editors).toHaveCount(2);
  await playwright.expect(editors.first()).toHaveValue('Second independent draft');
  await playwright.expect(editors.first()).toBeFocused();
  await synchronized(page);
});

test('workspace persists only by opt-in, restores edits/preferences and migrates legacy manual prompts', async t => {
  const page = await open(t);
  await page.locator('#edit').click();
  await page.locator('.clone-card textarea').fill('Persisted independent text');
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await page.locator('#remember').check();
  await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  await page.locator('#live-highlight').uncheck();
  await page.reload();
  await playwright.expect(page.locator('.clone-card textarea')).toHaveValue('Persisted independent text');
  await playwright.expect(page.locator('#live-highlight')).not.toBeChecked();
  await page.locator('#remember').uncheck();
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await page.locator('#export').click();
  await page.evaluate(raw => localStorage.setItem('technical-prompt-menu.v1', JSON.stringify(raw)), {...P.defaults, manualPrompt: 'Legacy edited text'});
  await page.reload();
  await playwright.expect(page.locator('.clone-card textarea')).toHaveValue('Legacy edited text');
  await synchronized(page);
});

test('bad imports are atomic; saved/exported drafts avoid unload warning and dirty drafts keep it', async t => {
  const page = await open(t);
  await page.locator('#edit').click();
  const editor = page.locator('.clone-card textarea');
  await editor.fill('Draft to protect');
  const before = await page.locator('#prompt').inputValue();
  for (const raw of ['{bad', {...P.defaults, promptClones: [{id: 'bad'}]}, {...P.defaults, depth: 'unknown'}]) {
    await importData(page, raw);
    await playwright.expect(page.locator('#status')).toContainText('Import rejected');
    await playwright.expect(editor).toHaveValue('Draft to protect');
    await playwright.expect(page.locator('#prompt')).toHaveValue(before);
  }
  const unloadPrevented = () => page.evaluate(() => {
    const event = new Event('beforeunload', {cancelable: true});
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
  assert.equal(await unloadPrevented(), true);
  await page.locator('#export').click();
  assert.equal(await unloadPrevented(), false);
  await editor.fill('Changed after export');
  assert.equal(await unloadPrevented(), true);
  await page.locator('#remember').check();
  assert.equal(await unloadPrevented(), false);
});

test('copy, actual downloads, empty task and authored-empty-draft handling', async t => {
  const page = await open(t, {permissions: ['clipboard-read', 'clipboard-write']});
  await page.locator('#live-copy').click();
  assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n'), await page.locator('#prompt').inputValue());
  let pending = page.waitForEvent('download');
  await page.locator('#live-download').click();
  const downloaded = await pending;
  assert.equal(fs.readFileSync(await downloaded.path(), 'utf8'), (await page.locator('#prompt').inputValue()) + '\n');
  await page.locator('#edit').click();
  await page.locator('.clone-card textarea').fill('Actual clone download');
  pending = page.waitForEvent('download');
  await page.locator('.clone-card').getByText('Download .txt', {exact: true}).click();
  assert.equal(fs.readFileSync(await (await pending).path(), 'utf8'), 'Actual clone download\n');
  await page.locator('#task').fill('');
  for (const id of ['copy', 'download', 'edit', 'live-copy', 'live-clone', 'live-download']) await playwright.expect(page.locator('#' + id)).toBeDisabled();
  await page.locator('.clone-card textarea').fill('');
  await playwright.expect(page.locator('.clone-card').getByText('Copy clone', {exact: true})).toBeDisabled();
  await page.locator('#reset').click();
  await playwright.expect(page.locator('#copy')).toBeEnabled();
});

test('storage and clipboard failure remain explicit and recoverable', async t => {
  const page = await open(t, {}, () => {
    Storage.prototype.setItem = () => { throw new Error('Quota blocked'); };
    Object.defineProperty(navigator, 'clipboard', {value: {writeText: async () => { throw new Error('Denied'); }}});
    document.execCommand = () => false;
  });
  await page.locator('#remember').check();
  await playwright.expect(page.locator('#save-state')).toContainText('unavailable or full');
  await page.locator('#copy').click();
  await playwright.expect(page.locator('#status')).toContainText('Clipboard unavailable');
  assert.ok(await page.locator('#prompt').evaluate(node => node.selectionEnd > node.selectionStart));
});

test('every menu widget updates generation without changing clones or leaking markup', async t => {
  const page = await open(t, {reducedMotion: 'reduce'});
  await page.locator('#edit').click();
  await page.locator('.clone-card textarea').fill('Untouchable clone');
  const state = P.clone(P.defaults);
  for (const [key, options] of Object.entries(P.choices)) {
    for (const value of Object.keys(options)) {
      await check(page, key, value);
      state[key] = value;
      await playwright.expect(page.locator('#prompt')).toHaveValue(P.buildPrompt(state));
      await synchronized(page);
    }
  }
  for (const key of ['focus', 'exclusions']) {
    for (const option of Object.keys(P[key])) {
      const input = page.locator('input[name="' + key + '"][value="' + option + '"]');
      const selected = await input.isChecked();
      await input.setChecked(!selected);
      state[key] = selected ? state[key].filter(value => value !== option) : Object.keys(P[key]).filter(value => state[key].includes(value) || value === option);
      await playwright.expect(page.locator('#prompt')).toHaveValue(P.buildPrompt(state));
    }
  }
  await page.locator('.already summary').click();
  for (const key of ['task', 'established', 'special']) {
    state[key] = key + ' literal <img src=x onerror=alert(1)> $&\nSecond line.';
    await page.locator('#' + key).fill(state[key]);
    await playwright.expect(page.locator('#prompt')).toHaveValue(P.buildPrompt(state));
    await synchronized(page);
  }
  await playwright.expect(page.locator('.clone-card textarea')).toHaveValue('Untouchable clone');
  assert.equal(await page.locator('#live-text img').count(), 0);
  await page.locator('#special').evaluate(node => node.scrollIntoView({behavior: 'instant', block: 'center'}));
  await capture(page, 'desktop-special');
});

test('focus-safe auto-hide and preview selection survive unrelated menu updates', async t => {
  const page = await open(t);
  await page.locator('#live-move').focus();
  await page.locator('#preview').evaluate(node => node.scrollIntoView({behavior: 'instant'}));
  await playwright.expect(page.locator('#live-preview')).toBeVisible();
  await page.locator('#prompt').focus();
  await playwright.expect(page.locator('#live-preview')).toBeHidden();
  await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  await playwright.expect(page.locator('#live-preview')).toBeVisible();
  await page.locator('#live-content').focus();
  const text = await page.locator('#live-text').textContent();
  await page.evaluate(() => {
    const node = document.querySelector('#live-text span').firstChild;
    getSelection().setBaseAndExtent(node, 0, node, 50);
    const input = document.querySelector('input[name=verbosity][value=compact]');
    input.checked = true;
    input.dispatchEvent(new Event('change', {bubbles: true}));
  });
  assert.equal(await page.evaluate(() => getSelection().toString()), text.slice(0, 50));
  await playwright.expect(page.locator('#live-content')).toBeFocused();
  await synchronized(page);
  await page.keyboard.press('Control+a');
  assert.equal(await page.evaluate(() => getSelection().toString()), await page.locator('#prompt').inputValue());
});

test('whole-page responsive geometry, reduced motion, native keyboard and direct-file build', async t => {
  const page = await open(t, {reducedMotion: 'reduce'});
  for (const [width, height] of [[1920, 1080], [1280, 800], [1100, 700], [1024, 768], [768, 700], [390, 844], [320, 568]]) {
    await page.setViewportSize({width, height});
    await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no overflow at ' + width);
    await capture(page, 'whole-' + width, true);
    if (width < 1100) {
      await playwright.expect(page.locator('#live-tab')).toBeVisible();
      await page.locator('#live-tab').click();
      const rect = await page.locator('#live-preview').boundingBox();
      assert.ok(rect.x >= 12 && rect.x + rect.width <= width - 12);
      await capture(page, 'expanded-' + width);
      await page.locator('#live-collapse').click();
    }
  }
  await page.setViewportSize({width: 1440, height: 1000});
  await page.locator('#live-tab').click();
  await page.locator('input[name="structure"][value="why"]').focus();
  await page.keyboard.press('ArrowRight');
  await playwright.expect(page.locator('input[name="structure"][value="code"]')).toBeChecked();
  const animation = await page.locator('.diff-added').first().evaluate(node => getComputedStyle(node).animationName);
  assert.equal(animation, 'none');
  await page.setViewportSize({width: 900, height: 360});
  await page.locator('#live-tab').click();
  const rect = await page.locator('#live-preview').boundingBox();
  assert.ok(rect.y >= 12 && rect.y + rect.height <= 348);
  await capture(page, 'short-window');
  await page.locator('#live-collapse').click();
  await page.goto(pathToFileURL(path.join(__dirname, '..', 'index.html')).href);
  await synchronized(page);
});
