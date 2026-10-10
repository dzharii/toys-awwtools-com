'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../src/prompt-core.js');

test('default prompt preserves the specified heap API and excludes unsolicited teaching', () => {
  const prompt = P.buildPrompt(P.defaults);
  for (const word of ['IntHeap', 'capacity', 'count', 'int *items', 'heap_create', 'heap_free', 'heap_insert', 'heap_peek', 'heap_extract_min']) assert.ok(prompt.includes(word), word);
  assert.match(prompt, /Do not include quizzes, exercises, knowledge checks/);
  assert.match(prompt, /Do not add artificial summaries/);
  assert.match(prompt, /at most two purposeful technical diagrams/);
  assert.match(prompt, /complete, compilable C11 single-file program/);
  assert.doesNotMatch(prompt, /steak|hamburger|medium.rare|well.done|chicken/i);
});

test('verbosity changes do not reduce depth, audience, or the complete code requirement', () => {
  const dense = {...P.clone(P.defaults), verbosity: 'compact', depth: 'rigorous', knowledge: 'systems'};
  const result = P.buildPrompt(dense);
  assert.match(result, /concise prose/);
  assert.match(result, /correctness arguments/);
  assert.match(result, /systems-level C knowledge/);
  assert.match(result, /complete, compilable C11 single-file program/);
  assert.equal(dense.compression, 'dense');
});

test('presets retain user context, replace manual output, and do not mutate inputs', () => {
  const before = P.clone(P.defaults);
  Object.assign(before, {task: 'Implement a custom queue.', established: 'Use a ring buffer.', special: 'Show overflow behavior.', manualPrompt: 'Edited output'});
  const snapshot = P.clone(before);
  const after = P.applyPreset('implementation', before);
  for (const key of ['task', 'established', 'special']) assert.equal(after[key], before[key]);
  assert.equal(after.manualPrompt, null);
  assert.equal(after.deliverable, 'library');
  assert.deepEqual(before, snapshot);
  assert.throws(() => P.applyPreset('missing', before));
});

test('all 2187 combinations of the seven independent dimensions generate valid complete prompts', () => {
  let count = 0;
  const keys = Object.keys(P.choices);
  function visit(index, state) {
    if (index === keys.length) {
      const before = JSON.stringify(state);
      const prompt = P.buildPrompt(state);
      assert.ok(prompt.startsWith('TASK\n'));
      assert.ok(prompt.includes('CODE DELIVERABLE\n'));
      assert.ok(prompt.includes('QUALITY STANDARD\n'));
      assert.doesNotMatch(prompt, /^undefined$/m);
      assert.equal(JSON.stringify(state), before);
      count++;
      return;
    }
    for (const value of Object.keys(P.choices[keys[index]])) visit(index + 1, {...state, [keys[index]]: value});
  }
  visit(0, P.defaults);
  assert.equal(count, 2187);
});

test('unselected focus and exclusion options do not add instructions or automatic opposites', () => {
  const prompt = P.buildPrompt({...P.clone(P.defaults), focus: [], exclusions: [], established: '', special: ''});
  for (const heading of ['FOCUS\n', 'AVOID\n', 'ALREADY ESTABLISHED\n', 'SPECIAL INSTRUCTIONS\n']) assert.ok(!prompt.includes(heading));
  assert.ok(!prompt.includes('Do not include quizzes'));
  assert.ok(!prompt.includes('Include quizzes'));
});

test('user strings survive intact, including markup, Unicode, backticks, and dollars', () => {
  const task = '<script>alert(1)</script> $& `malloc` ${items} / Δ';
  const special = 'Compare 1.5x growth.\nKeep my original examples.';
  const s = {...P.clone(P.defaults), task, special};
  const result = P.buildPrompt(s);
  assert.ok(result.includes(task));
  assert.ok(result.endsWith(special));
});

test('invalid schemas, unknown selections, malformed arrays, and oversized fields reject atomically', () => {
  for (const bad of [null, [], 'settings', {}, {schemaVersion: 2}, {...P.defaults, task: 4}, {...P.defaults, focus: ['unknown']}, {...P.defaults, focus: null}, {...P.defaults, depth: '__proto__'}, {...P.defaults, depth: 'constructor'}, {...P.defaults, compression: {}}, {...P.defaults, special: 'a'.repeat(20001)}, {...P.defaults, manualPrompt: 'x'.repeat(100001)}]) assert.throws(() => P.validate(bad));
  assert.equal(P.defaults.task.length < 20000, true);
});

test('import canonicalizes arrays and ignores prototype-shaped and unknown keys', () => {
  const s = P.validate(JSON.parse('{"schemaVersion":1,"focus":["ownership","memory","memory"],"__proto__":{"polluted":true},"surprise":"ignore"}'));
  assert.deepEqual(s.focus, ['memory', 'ownership']);
  assert.equal({}.polluted, undefined);
  assert.equal(s.surprise, undefined);
  assert.equal(s.verbosity, 'focused');
});

test('manual text round trips through exported settings but does not alter the generator', () => {
  const s = {...P.clone(P.defaults), manualPrompt: 'Custom prompt\nWith edits.'};
  assert.equal(P.validate(JSON.parse(JSON.stringify(s))).manualPrompt, s.manualPrompt);
  assert.equal(P.buildPrompt(s), P.buildPrompt(P.defaults));
});

test('warnings explain empty assignments and combinations without silently changing choices', () => {
  const s = {...P.clone(P.defaults), task: '', structure: 'trace', visuals: 'none', depth: 'rigorous', verbosity: 'compact', special: 'Do the opposite.'};
  assert.equal(P.warnings(s).length, 4);
  assert.equal(s.visuals, 'none');
  assert.match(P.buildPrompt(s), /Do not include diagrams/);
});

test('word diff reconstructs both versions exactly, including repeated words and whitespace', () => {
  const pairs = [
    ['', 'new prompt'], ['old prompt', ''], ['same\n text', 'same\n text'],
    ['one two one two', 'one one two three'], ['A\n\nB\nold\n', 'A\n\nB\nnew\n'],
    [P.buildPrompt(P.defaults), P.buildPrompt(P.applyPreset('implementation', P.defaults))],
    ['a '.repeat(15000), 'b '.repeat(15000)]
  ];
  let seed = 42;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 300; i++) {
    const text = () => Array.from({length: Math.floor(random() * 30)}, () => ['a', 'b', 'c', ' ', '\n'][Math.floor(random() * 5)]).join('');
    pairs.push([text(), text()]);
  }
  for (const [before, after] of pairs) {
    const diff = P.diffText(before, after);
    assert.equal(diff.filter(op => op.type !== 'added').map(op => op.text).join(''), before);
    assert.equal(diff.filter(op => op.type !== 'removed').map(op => op.text).join(''), after);
  }
  assert.deepEqual(P.diffText('keep old ending', 'keep new ending').map(op => op.type), ['equal', 'removed', 'added', 'equal']);
});

test('workspace validates drafts/preferences and migrates old manual output without changing generation', () => {
  const draft = {id: 'note', title: 'My note', text: '<script>literal text</script>', createdAt: '2026-10-10T12:00:00.000Z'};
  const raw = {...P.defaults, promptClones: [draft], previewPreferences: {...P.previewDefaults, textSize: 'large'}, manualPrompt: 'Old authored prompt'};
  const workspace = P.validateWorkspace(raw);
  assert.equal(workspace.settings.manualPrompt, null);
  assert.equal(workspace.promptClones[0].text, draft.text);
  assert.equal(workspace.promptClones[1].text, raw.manualPrompt);
  assert.equal(workspace.previewPreferences.textSize, 'large');
  assert.equal(P.buildPrompt(workspace.settings), P.buildPrompt(P.defaults));
  for (const bad of [
    {...raw, promptClones: {}}, {...raw, promptClones: [draft, draft]},
    {...raw, promptClones: [{...draft, createdAt: 'not a date'}]},
    {...raw, promptClones: [{...draft, text: 'a'.repeat(100001)}]},
    {...raw, previewPreferences: {highlight: 'yes'}}, {...raw, previewPreferences: {textSize: 'tiny'}}
  ]) assert.throws(() => P.validateWorkspace(bad));
  assert.equal(P.validateWorkspace(P.defaults).promptClones.length, 0);
});

test('preset metadata is complete and restored selection cannot misrepresent its settings', () => {
  for (const info of [...Object.values(P.presets), P.customPreset]) {
    for (const key of ['label', 'icon', 'summary', 'description']) assert.ok(typeof info[key] === 'string' && info[key].trim(), key);
  }
  const state = P.applyPreset('implementation', P.defaults);
  assert.equal(P.validateWorkspace({...state, selectedPreset: 'implementation'}).selectedPreset, 'implementation');
  assert.throws(() => P.validateWorkspace({...state, selectedPreset: 'insight'}), /does not match/);
  assert.throws(() => P.validateWorkspace({...state, selectedPreset: 'unknown'}), /Invalid selected/);
  assert.equal(P.validateWorkspace({...state, selectedPreset: 'custom'}).selectedPreset, 'custom');
});
