import { expect, test } from "bun:test";
import module from "./index";
import metadata from "./effect.json";
import { validateDescriptor } from "../../../tools/metadata";
test(metadata.id + " contract", () => {
  validateDescriptor(metadata, metadata.id, []);
  expect(module.sdkVersion).toBe("1.0");
  expect(typeof module.create).toBe("function");
});
