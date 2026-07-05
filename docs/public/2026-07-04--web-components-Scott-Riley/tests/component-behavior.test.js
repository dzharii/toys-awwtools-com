import { Window } from "happy-dom";
import { beforeAll, describe, expect, test } from "vitest";
import { componentDefinitions } from "../packages/components/src/component-definitions.js";

const window = new Window();

Object.assign(globalThis, {
  window,
  document: window.document,
  customElements: window.customElements,
  HTMLElement: window.HTMLElement,
  Event: window.Event,
});

beforeAll(async () => {
  await import("../packages/components/src/index.js");
});

describe("component behavior", () => {
  test("keeps ordinary text button names visible instead of overriding them with aria-label", () => {
    const buttonHost = document.createElement("my-button");
    buttonHost.textContent = "Save";
    document.body.append(buttonHost);

    expect(buttonHost.querySelector("button")?.hasAttribute("aria-label")).toBe(false);
  });

  test("uses aria-label for icon-only buttons", () => {
    const buttonHost = document.createElement("my-button");
    buttonHost.setAttribute("icon", "check");
    buttonHost.setAttribute("icon-only", "");
    buttonHost.setAttribute("aria-label", "Approve");
    buttonHost.textContent = "Approve";
    document.body.append(buttonHost);

    expect(buttonHost.querySelector("button")?.getAttribute("aria-label")).toBe("Approve");
  });

  test("does not replace the native input element while the user types", () => {
    const inputHost = document.createElement("my-input");
    inputHost.setAttribute("label", "Project name");
    document.body.append(inputHost);

    const firstInput = inputHost.querySelector("input");
    firstInput.value = "My DS";
    firstInput.dispatchEvent(new Event("input", { bubbles: true }));

    expect(inputHost.querySelector("input")).toBe(firstInput);
  });

  test("preserves disclosure child nodes across open state changes", () => {
    const disclosure = document.createElement("my-disclosure");
    const paragraph = document.createElement("p");
    paragraph.textContent = "Portable components stay useful.";
    disclosure.append(paragraph);
    document.body.append(disclosure);

    disclosure.setAttribute("open", "");
    disclosure.removeAttribute("open");

    expect(disclosure.querySelector("p")).toBe(paragraph);
  });

  test("preserves slotted field controls and syncs error state", () => {
    const field = document.createElement("my-field");
    const input = document.createElement("input");
    input.value = "production";
    field.append(input);
    document.body.append(field);

    field.setAttribute("error", "Choose a valid target.");

    expect(field.querySelector("input")).toBe(input);
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });
});

describe("component metadata", () => {
  test("keeps documented props aligned with observed attributes", async () => {
    const modulesByTag = {
      "my-button": await import("../packages/components/src/components/button.js"),
      "my-badge": await import("../packages/components/src/components/badge.js"),
      "my-card": await import("../packages/components/src/components/card.js"),
      "my-icon": await import("../packages/components/src/components/icon.js"),
      "my-input": await import("../packages/components/src/components/input.js"),
      "my-alert": await import("../packages/components/src/components/alert.js"),
      "my-spinner": await import("../packages/components/src/components/spinner.js"),
      "my-disclosure": await import("../packages/components/src/components/disclosure.js"),
      "my-field": await import("../packages/components/src/components/field.js"),
    };

    for (const componentDefinition of componentDefinitions) {
      const ComponentClass = Object.values(modulesByTag[componentDefinition.tagName])[0];
      const observedAttributes = ComponentClass.observedAttributes ?? [];
      const documentedProps = componentDefinition.props.map((prop) => prop.name);

      expect(documentedProps.sort()).toEqual(observedAttributes.sort());
    }
  });
});
