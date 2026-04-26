import { afterEach, expect, test } from "bun:test";
import { compactJson, createLogger, getLoggingSettings, setLoggingSettings, updateLoggingSettings } from "../src/observability/logger.js";

const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

afterEach(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
  setLoggingSettings({ level: "debug", formatter: "segments", useLabelBackgrounds: true });
});

test("compactJson serializes errors, bigints, long arrays, and circular objects safely", () => {
  const value = { error: new Error("failed"), id: 1n, items: Array.from({ length: 22 }, (_, index) => index) };
  value.self = value;
  const serialized = compactJson(value);
  expect(serialized).toContain("failed");
  expect(serialized).toContain("\"id\":\"1\"");
  expect(serialized).toContain("...(2 more)");
  expect(serialized).toContain("[Circular]");
});

test("logger honors level threshold", () => {
  const calls = [];
  console.log = (...args) => calls.push(args);
  setLoggingSettings({ level: "info", formatter: "plain", useLabelBackgrounds: false });
  const logger = createLogger("Test", "Threshold");
  logger.debug("hidden");
  logger.info("visible");
  expect(calls).toHaveLength(1);
  expect(String(calls[0][0])).toContain("visible");
});

test("logging settings update normalizes invalid values", () => {
  const settings = updateLoggingSettings({ level: "loud", formatter: "unknown", useLabelBackgrounds: false });
  expect(settings.level).toBe("debug");
  expect(settings.formatter).toBe("segments");
  expect(getLoggingSettings().useLabelBackgrounds).toBe(false);
});
