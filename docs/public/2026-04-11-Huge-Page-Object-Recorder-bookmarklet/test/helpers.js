export function makeElement({
  tagName = "div",
  attributes = {},
  textContent = "",
  innerText = textContent,
  rect = { left: 0, top: 0, width: 120, height: 40 },
  classList = [],
  children = [],
  descendants = null,
  visible = true,
  hidden = false,
  disabled = false,
  labels = [],
  tabIndex = attributes.tabindex ?? -1,
  scrollHeight = rect.height,
  clientHeight = rect.height,
  scrollWidth = rect.width,
  clientWidth = rect.width,
  computedStyle = null,
  identity = null,
} = {}) {
  const normalizedAttributes = { ...attributes };
  if (classList.length) {
    normalizedAttributes.class = classList.join(" ");
  }
  if (disabled) {
    normalizedAttributes.disabled = "disabled";
  }

  const element = {
    tagName: String(tagName).toUpperCase(),
    attributes: normalizedAttributes,
    textContent,
    innerText,
    hidden,
    visible,
    labels,
    tabIndex: Number(tabIndex),
    classList,
    children: [],
    childElementCount: children.length,
    scrollHeight,
    clientHeight,
    scrollWidth,
    clientWidth,
    computedStyle,
    identity,
    getAttribute(name) {
      return this.attributes[name] ?? null;
    },
    getBoundingClientRect() {
      return {
        ...rect,
        right: rect.right ?? rect.left + rect.width,
        bottom: rect.bottom ?? rect.top + rect.height,
      };
    },
    querySelectorAll() {
      return [];
    },
  };

  for (const child of children) {
    child.parentElement = element;
    element.children.push(child);
  }

  element.childElementCount = element.children.length;
  element.descendants = descendants ?? flattenDescendants(element.children);
  return element;
}

function flattenDescendants(children) {
  const result = [];
  for (const child of children) {
    result.push(child);
    result.push(...flattenDescendants(child.children ?? []));
  }
  return result;
}

export function makeDocument({ body, nodesById = {}, labelsByFor = {}, elements = [] } = {}) {
  const nodes = { ...nodesById };
  if (body?.attributes?.id) {
    nodes[body.attributes.id] = body;
  }

  for (const element of elements) {
    const id = element.attributes?.id;
    if (id) {
      nodes[id] = element;
    }
  }

  return {
    body,
    title: "Fixture Document",
    getElementById(id) {
      return nodes[id] ?? null;
    },
    querySelectorAll(selector) {
      const labelMatch = selector.match(/^label\[for="(.+)"\]$/);
      if (labelMatch) {
        return labelsByFor[labelMatch[1]] ?? [];
      }
      if (selector === "*") {
        return elements;
      }
      return [];
    },
  };
}

export function makeQueryContext(matchCounts = {}) {
  return {
    matchCounts,
    scope: {
      querySelectorAll(selector) {
        return new Array(matchCounts[`css:${selector}`] ?? 0).fill({});
      },
    },
  };
}
