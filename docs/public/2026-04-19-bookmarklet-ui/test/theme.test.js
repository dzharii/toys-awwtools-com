import test from "node:test";
import assert from "node:assert/strict";
import { ThemeService } from "../src/core/theme.js";

test("theme service applies merged token set", () => {
  const service = new ThemeService({ "--awwbookmarklet-x": "1" });
  service.setTheme({ "--awwbookmarklet-y": "2" });

  const writes = [];
  const target = {
    style: {
      setProperty(name, value) {
        writes.push([name, value]);
      }
    }
  };

  service.applyTheme(target);

  assert.deepEqual(writes, [
    ["--awwbookmarklet-x", "1"],
    ["--awwbookmarklet-y", "2"]
  ]);
});
