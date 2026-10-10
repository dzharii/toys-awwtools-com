'use strict';
// Event-flow checks against a minimal DOM adapter. These do not replace browser QA.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const P = require('../src/prompt-core.js');
function boot({storage = new Map(), blocked = false, clipboard = true} = {}) {
  const ids = new Map();
  const inputs = [];
  let copied = null;
  class Element {
    constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.events = {}; this.value = ''; this.name = ''; this.type = ''; this.checked = false; this.readOnly = false; this.hidden = false; this.textContent = ''; this.files = []; }
    setAttribute(key, value) { if (key === 'id') ids.set(value, this); this[key === 'readonly' ? 'readOnly' : key] = key === 'readonly' ? true : value; }
    append(...children) { for (const child of children) { child.parent = this; this.children.push(child); } }
    replaceChildren(...children) { this.children = []; this.append(...children); }
    addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
    async fire(name, target = this) { for (const fn of this.events[name] || []) await fn({target, preventDefault() {}}); }
    querySelectorAll(name) { assert.equal(name, 'input'); return inputs.filter(x => x.name); }
    focus() { this.focused = true; }
    select() { this.selected = true; }
    click() { return this.fire('click'); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(x => x !== this); }
  }
  const document = {
    createElement(tag) { const node = new Element(tag); if (tag === 'input') inputs.push(node); return node; },
    getElementById(id) { assert.ok(ids.has(id), 'Missing element ' + id); return ids.get(id); },
    body: new Element('body'), execCommand() { return false; }
  };
  const html = fs.readFileSync(path.join(__dirname, '../src/template.html'), 'utf8');
  for (const match of html.matchAll(/<(\w+)[^>]*\bid="([^"]+)"[^>]*>/g)) {
    const node = document.createElement(match[1]); node.setAttribute('id', match[2]);
    const name = /\bname="([^"]+)"/.exec(match[0]); if (name) node.name = name[1];
  }
  for (const value of ['why', 'code', 'trace']) { const node = document.createElement('input'); node.name = 'structure'; node.type = 'radio'; node.value = value; }
  const localStorage = {getItem(key) { if (blocked) throw Error('blocked'); return storage.get(key); }, setItem(key, value) { if (blocked) throw Error('blocked'); storage.set(key, value); }, removeItem(key) { if (blocked) throw Error('blocked'); storage.delete(key); }};
  const sandbox = {window: {PromptMenu: P}, document, localStorage, navigator: clipboard ? {clipboard: {async writeText(value) { copied = value; }}} : {}, setTimeout() { return 1; }, clearTimeout() {}, URL: {createObjectURL() { return 'blob:local'; }, revokeObjectURL() {}}, Blob};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8'), sandbox);
  const get = id => document.getElementById(id);
  async function choose(name, value) { const node = inputs.find(x => x.name === name && x.value === value); assert.ok(node); node.checked = true; await get('settings').fire('change', node); }
  return {get, choose, inputs, storage, copied: () => copied};
}

test('application initializes all controls and preserves manual edits across setting changes', async () => {
  const app = boot();
  assert.equal(app.get('prompt').value, P.buildPrompt(P.defaults));
  assert.equal(app.inputs.filter(x => x.name === 'focus' && x.checked).length, 5);
  assert.equal(app.get('prompt').readOnly, true);
  await app.get('edit').click();
  app.get('prompt').value = 'My edited prompt';
  await app.get('prompt').fire('input');
  await app.get('edit').click();
  await app.choose('verbosity', 'compact');
  assert.equal(app.get('prompt').value, 'My edited prompt');
  assert.equal(app.get('prompt').readOnly, true);
  assert.match(app.get('manual-message').textContent, /Settings changed/);
  await app.get('copy').click();
  assert.equal(app.copied(), 'My edited prompt');
  await app.get('rebuild').click();
  assert.match(app.get('prompt').value, /Use concise prose/);
  assert.equal(app.get('manual-notice').hidden, true);
});

test('browser persistence is opt-in, restores validated state, and can be removed', async () => {
  const app = boot();
  await app.choose('depth', 'rigorous');
  assert.equal(app.storage.size, 0);
  app.get('remember').checked = true;
  await app.get('remember').fire('change');
  const restored = boot({storage: app.storage});
  assert.match(restored.get('prompt').value, /correctness arguments/);
  assert.equal(restored.get('remember').checked, true);
  restored.get('remember').checked = false;
  await restored.get('remember').fire('change');
  assert.equal(app.storage.size, 0);
});

test('invalid and oversized imports preserve current output; valid import replaces it', async () => {
  const app = boot();
  const before = app.get('prompt').value;
  app.get('import-file').files = [{size: 20, async text() { return '{invalid'; }}];
  await app.get('import-file').fire('change');
  assert.equal(app.get('prompt').value, before);
  assert.match(app.get('status').textContent, /Import rejected/);
  app.get('import-file').files = [{size: 1000001, async text() { throw Error('Should not read'); }}];
  await app.get('import-file').fire('change');
  assert.equal(app.get('prompt').value, before);
  const settings = P.applyPreset('implementation', P.defaults);
  app.get('import-file').files = [{size: 2000, async text() { return JSON.stringify(settings); }}];
  await app.get('import-file').fire('change');
  assert.equal(app.get('prompt').value, P.buildPrompt(settings));
});

test('blocked storage and clipboard fall back without preventing the menu from working', async () => {
  const app = boot({blocked: true, clipboard: false});
  assert.match(app.get('status').textContent, /could not be loaded/);
  await app.get('copy').click();
  assert.equal(app.get('prompt').selected, true);
  assert.match(app.get('status').textContent, /Clipboard unavailable/);
  app.get('remember').checked = true;
  await app.get('remember').fire('change');
  assert.match(app.get('save-state').textContent, /storage is unavailable/);
});

test('empty assignment disables generated copy, and reset restores the complete default', async () => {
  const app = boot();
  app.get('task').value = '';
  await app.get('settings').fire('input', app.get('task'));
  assert.equal(app.get('copy').disabled, true);
  await app.get('reset').click();
  assert.equal(app.get('copy').disabled, false);
  assert.equal(app.get('prompt').value, P.buildPrompt(P.defaults));
});
