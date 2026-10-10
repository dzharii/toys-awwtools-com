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
  for (const id of ['task', 'established', 'special', 'prompt', 'preset']) assert.match(html, new RegExp('for="' + id + '"'));
  for (const match of html.matchAll(/<use href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), match[1]);
});

test('complete published example prompts and importable settings are consistent with presets', () => {
  for (const [preset, name] of [['insight', 'default'], ['implementation', 'implementation'], ['walkthrough', 'walkthrough']]) {
    const config = JSON.parse(fs.readFileSync(path.join(root, 'examples', name + '-settings.json'), 'utf8'));
    assert.deepEqual(P.validate(config), P.applyPreset(preset, P.defaults));
    assert.equal(fs.readFileSync(path.join(root, 'examples', name + '-prompt.txt'), 'utf8'), P.buildPrompt(config) + '\n');
  }
});
