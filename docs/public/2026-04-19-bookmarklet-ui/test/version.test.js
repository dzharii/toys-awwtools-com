import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FRAMEWORK_VERSION } from "../src/core/constants.js";

test("framework version matches package version", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(FRAMEWORK_VERSION, pkg.version);
});
