// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import test from "node:test";
import assert from "node:assert/strict";
import { CommandRegistry } from "../src/core/commands.js";

test("registry runs enabled commands", () => {
  const registry = new CommandRegistry();
  let calls = 0;

  registry.register({
    id: "run",
    run() {
      calls += 1;
    }
  });

  const result = registry.run("run", {});
  assert.equal(result, true);
  assert.equal(calls, 1);
});

test("registry blocks disabled commands", () => {
  const registry = new CommandRegistry();
  let calls = 0;

  registry.register({
    id: "blocked",
    isEnabled: () => false,
    run() {
      calls += 1;
    }
  });

  const result = registry.run("blocked", {});
  assert.equal(result, false);
  assert.equal(calls, 0);
});
