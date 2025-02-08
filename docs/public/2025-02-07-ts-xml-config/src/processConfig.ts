// src/processConfig.ts
export function processConfig(node: any): any {
  // If the node is a primitive value, return it directly.
  if (node === null || typeof node !== "object") {
    return node;
  }

  const { type, props } = node;
  // Recursively process children if they exist.
  let children = props?.children;
  if (Array.isArray(children)) {
    children = children.map(processConfig);
  } else if (children) {
    children = [processConfig(children)];
  }

  // Exclude children from the props copy.
  const { children: _, ...otherProps } = props || {};

  // Construct the JSON configuration node.
  const result: any = { type, ...otherProps };
  if (children) {
    result.children = children;
  }

  return result;
}
