import { describe, expect, test } from "bun:test";
import { STORAGE_KEY } from "../src/app/constants.js";
import {
  DEFAULT_STATE,
  createInitialState,
  createMemoryStorage,
  loadPersistedState,
  persistUiState
} from "../src/app/state.js";

describe("state foundation", () => {
  test("createInitialState returns an isolated deep copy", () => {
    const first = createInitialState(createMemoryStorage());
    const second = createInitialState(createMemoryStorage());

    first.ui.wrapCells = true;
    first.table.quickFilter = "failures";
    first.columns.push("id");

    expect(second.ui.wrapCells).toBe(false);
    expect(second.table.quickFilter).toBe(DEFAULT_STATE.table.quickFilter);
    expect(second.columns.length).toBe(0);
  });

  test("loadPersistedState handles missing storage key", () => {
    const persisted = loadPersistedState(createMemoryStorage());
    expect(persisted).toEqual({});
  });

  test("loadPersistedState handles malformed json safely", () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: "{not-json" });
    const persisted = loadPersistedState(storage);
    expect(persisted).toEqual({});
  });

  test("persistUiState stores only intended fields", () => {
    const storage = createMemoryStorage();
    const state = createInitialState(storage);
    state.inputText = "sample";
    state.parseResult = { ok: true };
    state.ui.inputCollapsed = true;
    state.ui.leftPaneWidth = 444;
    state.ui.rightTopHeight = 188;
    state.ui.density = "normal";
    state.ui.wrapCells = true;
    state.table.quickFilter = "failures";
    state.highlightRules = [{ id: "rule-1", enabled: true }];
    state.highlightRulesEnabled = false;

    const ok = persistUiState(state, storage);
    expect(ok).toBe(true);

    const raw = storage.getItem(STORAGE_KEY);
    const saved = JSON.parse(raw);
    expect(Object.keys(saved).sort()).toEqual([
      "columnOrderPreset",
      "highlightRules",
      "highlightRulesEnabled",
      "inputText",
      "table",
      "ui"
    ]);
    expect(saved.ui).toEqual({
      inputCollapsed: true,
      leftPaneWidth: 444,
      rightTopHeight: 188,
      density: "normal",
      wrapCells: true,
      rowDetailsOpen: false
    });
    expect(saved.table.quickFilter).toBe("failures");
    expect(saved.highlightRules.length).toBe(1);
    expect(saved.highlightRulesEnabled).toBe(false);
    expect(saved.parseResult).toBeUndefined();
  });
});
