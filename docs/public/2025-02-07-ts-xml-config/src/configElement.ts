// src/configElement.ts
export function createConfigElement(
  type: string | Function,
  props: Record<string, any> = {},
  ...children: any[]
): any {
  // If no children are provided as extra arguments,
  // then check if props already has a children property.
  if (children.length === 0 && props.children !== undefined) {
    children = Array.isArray(props.children)
      ? props.children
      : [props.children];
  }

  if (typeof type === "function") {
    return type({ ...props, children });
  }

  return {
    type,
    props: { ...props, children: children.flat() },
  };
}
