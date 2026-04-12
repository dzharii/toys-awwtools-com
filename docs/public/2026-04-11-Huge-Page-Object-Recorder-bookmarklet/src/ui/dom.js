export function appendChildren(element, children = []) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) {
      continue;
    }
    if (typeof child === "string") {
      element.append(child);
    } else {
      element.append(child);
    }
  }
  return element;
}

export function createNode(document, tagName, options = {}, children = []) {
  const element = document.createElement(tagName);
  if (options.className) {
    element.className = options.className;
  }
  if (options.text !== undefined) {
    element.textContent = String(options.text);
  }
  if (options.value !== undefined) {
    element.value = String(options.value);
  }
  if (options.type !== undefined) {
    element.type = options.type;
  }
  if (options.name !== undefined) {
    element.name = options.name;
  }
  if (options.id !== undefined) {
    element.id = options.id;
  }
  if (options.part !== undefined) {
    element.part = options.part;
  }
  if (options.attrs) {
    for (const [name, value] of Object.entries(options.attrs)) {
      if (value === null || value === undefined || value === false) {
        continue;
      }
      element.setAttribute(name, value === true ? "" : String(value));
    }
  }
  if (options.dataset) {
    for (const [name, value] of Object.entries(options.dataset)) {
      if (value !== undefined) {
        element.dataset[name] = String(value);
      }
    }
  }
  if (options.style) {
    Object.assign(element.style, options.style);
  }
  if (options.on) {
    for (const [eventName, handler] of Object.entries(options.on)) {
      element.addEventListener(eventName, handler);
    }
  }
  if (options.properties) {
    Object.assign(element, options.properties);
  }
  appendChildren(element, children);
  return element;
}

export function replaceChildren(element, children = []) {
  element.replaceChildren();
  appendChildren(element, children);
  return element;
}

export function createButton(document, options = {}, children = []) {
  return createNode(
    document,
    "button",
    {
      type: "button",
      ...options,
    },
    children,
  );
}

export function createInput(document, options = {}) {
  return createNode(document, "input", options);
}

export function createTextarea(document, options = {}) {
  return createNode(document, "textarea", options);
}

export function createLabel(document, options = {}, children = []) {
  return createNode(document, "label", options, children);
}

export function createSection(document, options = {}, children = []) {
  return createNode(document, "section", options, children);
}
