import { describe, expect, test } from "vitest";
import { componentDefinitions } from "../packages/components/src/component-definitions.js";

describe("component manifest definitions", () => {
  test("documents each component with props and a status", () => {
    for (const componentDefinition of componentDefinitions) {
      expect(componentDefinition.tagName).toMatch(/^my-/);
      expect(componentDefinition.displayName.length).toBeGreaterThan(0);
      expect(componentDefinition.status).toBe("ready");
      expect(componentDefinition.description.length).toBeGreaterThan(20);
      expect(componentDefinition.props).toBeInstanceOf(Array);
    }
  });

  test("includes the primitive and composite components from the plan", () => {
    expect(componentDefinitions.map((component) => component.tagName)).toEqual([
      "my-button",
      "my-badge",
      "my-card",
      "my-icon",
      "my-input",
      "my-alert",
      "my-spinner",
      "my-disclosure",
      "my-field",
    ]);
  });
});
