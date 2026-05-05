import { describe, expect, mock, test } from "bun:test";
import { createLogger } from "../src/app/logger.js";

describe("logger", () => {
  test("silent level suppresses logs", () => {
    const info = mock(() => {});
    const originalInfo = console.info;
    console.info = info;
    const logger = createLogger({ level: "silent" });
    logger.info("Parser", "message", { ok: true });
    expect(info).toHaveBeenCalledTimes(0);
    console.info = originalInfo;
  });

  test("logger does not throw for large metadata", () => {
    const logger = createLogger({ level: "error" });
    logger.error("Parser", "failed", { large: "x".repeat(500) });
    expect(true).toBe(true);
  });

  test("logger handles circular metadata", () => {
    const logger = createLogger({ level: "error" });
    const payload = { label: "root" };
    payload.self = payload;
    logger.error("Parser", "failed", payload);
    expect(true).toBe(true);
  });
});
