'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const P = require('../src/prompt-core.js');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('self-contained delivery embeds exact maintained code and CSS, with valid script syntax', () => {
  for (const file of ['prompt-core.js', 'app.js', 'app.css']) assert.ok(html.includes(fs.readFileSync(path.join(root, 'src', file), 'utf8')));
  assert.doesNotMatch(html, /INLINE_CSS|INLINE_CORE|INLINE_APP|<script[^>]+src=|<link[^>]+(?:stylesheet|preload)/i);
  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
  assert.doesNotMatch(html, /\bfetch\s*\(|XMLHttpRequest|\beval\s*\(/);
});

test('the browser-global prompt builder runs without CommonJS or external dependencies', () => {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/prompt-core.js'), 'utf8'), sandbox);
  assert.ok(sandbox.PromptMenu);
  assert.equal(sandbox.PromptMenu.buildPrompt(sandbox.PromptMenu.defaults), P.buildPrompt(P.defaults));
});

test('static IDs are unique and app static selector targets exist or are generated', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]);
  assert.equal(ids.length, new Set(ids).size);
  const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
  for (const match of app.matchAll(/\$\('([^']+)'\)/g)) assert.ok(ids.includes(match[1]), match[1]);
  for (const id of ['task', 'established', 'special', 'prompt']) assert.match(html, new RegExp('for="' + id + '"'));
  assert.match(html, /<fieldset id="preset"/);
  assert.doesNotMatch(html, /<select id="preset"/);
  for (const info of [...Object.values(P.presets), P.customPreset]) assert.ok(ids.includes(info.icon), info.icon);
  for (const match of html.matchAll(/<use href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), match[1]);
});

test('complete published example prompts and importable settings are consistent with presets', () => {
  for (const [preset, name] of [['insight', 'default'], ['implementation', 'implementation'], ['walkthrough', 'walkthrough']]) {
    const config = JSON.parse(fs.readFileSync(path.join(root, 'examples', name + '-settings.json'), 'utf8'));
    assert.deepEqual(P.validate(config), P.applyPreset(preset, P.defaults));
    assert.equal(fs.readFileSync(path.join(root, 'examples', name + '-prompt.txt'), 'utf8'), P.buildPrompt(config) + '\n');
  }
});

test('all local application links and anchors resolve', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (href.startsWith('#')) { if (href.length > 1) assert.ok(ids.has(href.slice(1)), href); }
    else if (!/^(https?:|blob:)/.test(href)) assert.ok(fs.existsSync(path.resolve(root, href)), href);
  }
});

test('social metadata uses supplied descriptions and real publication/image URLs', () => {
  const reference = fs.readFileSync(path.join(root, 'prompt_menu_social_site', 'index.html'), 'utf8');
  const metadata = source => new Map([...source.matchAll(/<meta (?:name|property)="([^"]+)" content="([^"]*)"/g)].map(match => [match[1], match[2]]));
  const supplied = metadata(reference), published = metadata(html);
  for (const key of ['description', 'og:type', 'og:site_name', 'og:locale', 'og:title', 'og:description', 'og:image:type', 'og:image:alt', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image:alt']) {
    assert.equal(published.get(key), supplied.get(key), key);
  }
  const publicUrl = 'https://toys.awwtools.com/public/2026-10-09-chatgpt-prompt-menu-for-break-down-prompts/';
  assert.ok(html.includes('<link rel="canonical" href="' + publicUrl + '">'));
  assert.equal(published.get('og:url'), publicUrl);
  assert.equal(published.get('og:image:secure_url'), published.get('og:image'));
  for (const [key, file, width, height] of [['og:image', 'og-1200x630.png', 1200, 630], ['twitter:image', 'x-1200x600.png', 1200, 600]]) {
    assert.equal(published.get(key), publicUrl + 'prompt_menu_social_site/' + file);
    const png = fs.readFileSync(path.join(root, 'prompt_menu_social_site', file));
    assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), width);
    assert.equal(png.readUInt32BE(20), height);
  }
  assert.equal(published.get('og:image:width'), '1200');
  assert.equal(published.get('og:image:height'), '630');
  assert.doesNotMatch(html, /https:\/\/example\.com/);
});
