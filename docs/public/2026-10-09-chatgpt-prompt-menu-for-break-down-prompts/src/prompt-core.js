(function (root) {
  'use strict';
  const choices = {
    structure: {
      why: ['Why-first', 'Start with the invariants and the reasons behind the representation and algorithms. Then present the complete code and examine non-obvious decisions.'],
      code: ['Code-first', 'Present the complete implementation first, then analyze the invariants, mechanisms, failure behavior, and tradeoffs.'],
      trace: ['Trace-first', 'Start with one fully worked insertion and extraction, showing every comparison, swap, loop iteration, and stopping condition. Then give the implementation and connect its control flow to the trace. These are demonstrations, not questions for me to solve.']
    },
    verbosity: {
      compact: ['Compact', 'Use concise prose. Include necessary reasoning and the complete requested code; remove repetition and secondary tangents.'],
      focused: ['Focused', 'Use focused, information-dense prose. Spend words on difficult reasoning, not obvious steps.'],
      expanded: ['Expanded', 'Develop difficult reasoning in detail, including relevant alternatives and worked examples. Additional length must add information rather than repetition.']
    },
    depth: {
      practical: ['Practical', 'Explain the mechanisms needed to implement and use the data structure correctly, including its API and failure handling.'],
      deep: ['Deep', 'Explore invariants, memory representation, performance, amortized analysis, correctness, and failure behavior.'],
      rigorous: ['Rigorous', 'Give precise invariants, preconditions, postconditions, and correctness arguments. Distinguish worst-case, amortized, and practical performance claims; examine boundary cases and integer overflow.']
    },
    knowledge: {
      learning: ['Learning C', 'Assume basic programming experience but limited C knowledge. Explain C concepts only when they are needed for this implementation.'],
      fluent: ['Fluent in C', 'Assume fluent knowledge of C pointers, structs, arrays, size_t, malloc, realloc, and free. Do not re-teach these fundamentals.'],
      systems: ['Systems-level', 'Assume systems-level C knowledge, including allocation, object lifetimes, integer arithmetic, undefined behavior, and cache locality. Focus on data-structure-specific reasoning.']
    },
    compression: {
      guided: ['Guided', 'Introduce difficult ideas in small connected steps. Supply necessary context without repeating established facts.'],
      dense: ['Dense', 'Use high intellectual compression: connect related technical ideas in fewer sentences while making causal links explicit. Preserve difficult reasoning.'],
      minimal: ['Minimal scaffolding', 'Assume technical competence. Omit tutorial scaffolding, motivational framing, and rehearsals of established concepts. Explain complexity clearly rather than removing it.']
    },
    visuals: {
      none: ['No diagrams, just code and prose', 'Do not include diagrams or visualizations. Use code and prose for the explanation.'],
      purposeful: ['Purposeful diagrams only (default)', 'Use at most two purposeful technical diagrams when they improve understanding. Label indexes and transitions, explain every visual encoding, and keep tree and array states consistent.'],
      detailed: ['Detailed, step-by-step algorithm diagrams', 'Show algorithm state transitions with explicit comparisons, swaps, repeated loop steps, and stopping conditions. Label indexes; explain all colors and symbols; keep tree and array states synchronized. Use interactivity only if the response environment supports it; otherwise provide complete labeled static states.']
    },
    deliverable: {
      program: ['Complete, compilable single-file program', 'Provide a complete, compilable C11 single-file program with all required includes, a usage example, a compile command, and expected output. Do not omit unchanged or necessary code.'],
      library: ['Reusable library: header + implementation', 'Provide complete heap.h, heap.c, and an example main.c, using an opaque IntHeap type, plus a compile command and expected output. Do not omit any required definitions.'],
      algorithms: ['Core algorithms and necessary definitions only', 'Provide the core algorithms with all required types, helpers, includes, ownership assumptions, and error conventions. A main function is unnecessary. Do not replace required code with placeholders.']
    }
  };
  const focus = {
    memory: ['Memory layout & cache locality', 'Distinguish why a complete tree permits implicit indexing from why contiguous storage is often preferable: spatial locality, pointer overhead, allocation count, and ownership. Avoid claiming that pointer access is universally slower. Explain fixed automatic storage versus dynamic growth when relevant.'],
    invariants: ['Algorithm invariants & correctness', 'Explain structural and ordering invariants, why sift-up repairs the ancestor path, and why sift-down must select the smaller child. Include loop progress and stopping conditions.'],
    complexity: ['Complexity & amortized analysis', 'Distinguish worst-case insertion with resizing from amortized insertion, extraction, peek, tree height, and the costs of geometric capacity growth.'],
    ownership: ['Allocation & ownership', 'Explain malloc/realloc/free failure paths, overflow checks, ownership boundaries, and pointer validity when storage moves.'],
    tradeoffs: ['Design alternatives & tradeoffs', 'Compare relevant alternatives with concrete reasons for choosing this design. Respect choices already specified; do not redesign the task without explaining a material correctness issue.'],
    boundaries: ['Boundary cases & failure behavior', 'Cover empty and singleton heaps, duplicate and negative values, allocation failure, and index and allocation arithmetic boundaries.'],
    validation: ['Meaningful implementation checks', 'Demonstrate focused validation of heap ordering, extraction order, and relevant edge cases. These checks validate code and are not knowledge tests for me.']
  };
  const exclusions = {
    quizzes: ['No quizzes or exercises', 'Do not include quizzes, exercises, knowledge checks, or questions for me to solve.'],
    repetition: ['No repeated explanations', 'Do not restate explanations or repeat information already established here.'],
    basics: ['No elementary C lessons', 'Do not explain C syntax or fundamentals the audience setting says I already know.'],
    recaps: ['No recaps or mnemonics', 'Do not add artificial summaries, cheat sheets, memory tricks, or one-screen recaps.'],
    decoration: ['No decorative illustrations', 'Do not add decorative or ambiguous diagrams; every visual must carry specific technical information.'],
    narration: ['No line-by-line code narration', 'Explain meaningful code blocks and non-obvious decisions rather than narrating each statement.']
  };
  const defaults = {
    schemaVersion: 1,
    task: 'Explain and implement an integer min-heap in C. Use an IntHeap structure containing capacity, count, and int *items, with heap_create, heap_free, heap_insert, heap_peek, and heap_extract_min. Support dynamic capacity growth.',
    established: 'The structure fields and object-oriented-style function API above are already chosen. Respect these decisions and focus explanation effort on the non-obvious mechanisms.',
    structure: 'why', verbosity: 'focused', depth: 'deep', knowledge: 'fluent', compression: 'dense', visuals: 'purposeful', deliverable: 'program',
    focus: ['memory', 'invariants', 'complexity', 'ownership', 'tradeoffs'],
    exclusions: Object.keys(exclusions), special: '', manualPrompt: null
  };
  const presets = {
    insight: {label: 'Technical insight', settings: {}},
    implementation: {label: 'Implementation review', settings: {structure: 'code', depth: 'rigorous', knowledge: 'systems', compression: 'minimal', visuals: 'none', deliverable: 'library', focus: ['invariants', 'ownership', 'boundaries', 'validation']}},
    walkthrough: {label: 'Algorithm walkthrough', settings: {structure: 'trace', verbosity: 'expanded', depth: 'deep', compression: 'guided', visuals: 'detailed', focus: ['invariants', 'complexity', 'boundaries']}}
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  function validate(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.schemaVersion !== 1) throw new Error('Expected a version 1 Prompt Menu settings object.');
    const state = clone(defaults);
    for (const key of ['task', 'established', 'special']) {
      if (key in raw) {
        if (typeof raw[key] !== 'string' || raw[key].length > 20000) throw new Error('Invalid text field: ' + key);
        state[key] = raw[key];
      }
    }
    for (const key of Object.keys(choices)) {
      if (key in raw) {
        if (typeof raw[key] !== 'string' || !Object.hasOwn(choices[key], raw[key])) throw new Error('Invalid option: ' + key);
        state[key] = raw[key];
      }
    }
    for (const [key, options] of [['focus', focus], ['exclusions', exclusions]]) {
      if (key in raw) {
        if (!Array.isArray(raw[key]) || raw[key].some(x => typeof x !== 'string' || !Object.hasOwn(options, x))) throw new Error('Invalid selections: ' + key);
        state[key] = Object.keys(options).filter(x => raw[key].includes(x));
      }
    }
    if ('manualPrompt' in raw) {
      if (raw.manualPrompt !== null && (typeof raw.manualPrompt !== 'string' || raw.manualPrompt.length > 100000)) throw new Error('Invalid edited prompt.');
      state.manualPrompt = raw.manualPrompt;
    }
    return state;
  }
  function buildPrompt(input) {
    const s = validate(input);
    const sections = [['TASK', s.task.trim() || 'Describe the technical task to complete.']];
    if (s.established.trim()) sections.push(['ALREADY ESTABLISHED', s.established.trim()]);
    sections.push(['AUDIENCE', choices.knowledge[s.knowledge][1]], ['EXPLANATION SETTINGS', choices.verbosity[s.verbosity][1] + '\n' + choices.depth[s.depth][1] + '\n' + choices.compression[s.compression][1]], ['RESPONSE STRUCTURE', choices.structure[s.structure][1]], ['CODE DELIVERABLE', choices.deliverable[s.deliverable][1]], ['VISUALIZATION CONTRACT', choices.visuals[s.visuals][1]]);
    if (s.focus.length) sections.push(['FOCUS', s.focus.map(key => focus[key][1]).join('\n\n')]);
    if (s.exclusions.length) sections.push(['AVOID', s.exclusions.map(key => exclusions[key][1]).join('\n')]);
    sections.push(['QUALITY STANDARD', 'Respect the design decisions I have already specified. Optimize for technical insight per sentence rather than oversimplification. Make explanations causal, not merely descriptive. Show why the implementation works, not only what each operation does. Separate theoretical guarantees from practical performance.']);
    if (s.special.trim()) sections.push(['SPECIAL INSTRUCTIONS', s.special.trim()]);
    return sections.map(([title, body]) => title + '\n' + body).join('\n\n');
  }
  function applyPreset(key, current) {
    if (!Object.hasOwn(presets, key)) throw new Error('Unknown preset.');
    const s = validate(current);
    return {...clone(defaults), task: s.task, established: s.established, special: s.special, ...clone(presets[key].settings)};
  }
  function warnings(s) {
    const notes = [];
    if (!s.task.trim()) notes.push('Add an assignment before copying the prompt.');
    if (s.structure === 'trace' && s.visuals === 'none') notes.push('Trace-first will use written state transitions because diagrams are disabled.');
    if (s.verbosity === 'compact' && s.depth === 'rigorous') notes.push('Compact + rigorous prioritizes concise correctness arguments; complete code is still required.');
    if (s.special.trim()) notes.push('Special instructions are included verbatim. Check that they agree with the selected settings.');
    return notes;
  }
  const api = {choices, focus, exclusions, defaults, presets, clone, validate, buildPrompt, applyPreset, warnings};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PromptMenu = api;
})(typeof globalThis === 'undefined' ? this : globalThis);
