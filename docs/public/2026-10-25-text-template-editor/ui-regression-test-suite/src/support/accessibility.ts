import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export async function expectAccessible(page: Page): Promise<void> {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((issue) => ({
      id: issue.id,
      description: issue.description,
      targets: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}
