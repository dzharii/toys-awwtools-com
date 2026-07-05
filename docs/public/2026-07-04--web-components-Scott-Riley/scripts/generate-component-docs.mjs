import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const manifestPath = resolve("packages/components/dist/custom-elements.json");
const componentsDirectory = resolve("docs/components");

function getComponentSlug(tagName) {
  return tagName.replace(/^my-/, "");
}

function createComponentDoc(component) {
  return `# ${component.displayName}

<ComponentHeader tag="${component.tagName}" />

## Examples

<ComponentExample>
  <${component.tagName}>Example</${component.tagName}>
</ComponentExample>

## Props

<PropsTable tag="${component.tagName}" />

## Usage

Describe when to use this component, which variants matter, and what tradeoffs consumers should understand.

## Accessibility

Document keyboard behavior, labelling expectations, focus management, and any ARIA requirements that are not obvious from the rendered HTML.
`;
}

async function generateComponentDocs() {
  if (!existsSync(manifestPath)) {
    console.warn("No custom elements manifest found; run npm run build:lib first.");
    return;
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const components = manifest.modules
    .flatMap((moduleRecord) => moduleRecord.declarations ?? [])
    .filter((declaration) => declaration.tagName);

  await mkdir(componentsDirectory, { recursive: true });

  for (const component of components) {
    const docPath = resolve(componentsDirectory, `${getComponentSlug(component.tagName)}.md`);

    if (existsSync(docPath)) {
      continue;
    }

    await writeFile(docPath, createComponentDoc(component));
    console.log(`Created ${docPath}`);
  }
}

await generateComponentDocs();
