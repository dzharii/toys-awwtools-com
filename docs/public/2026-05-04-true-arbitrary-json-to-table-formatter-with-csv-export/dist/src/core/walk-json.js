export function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

export function isPrimitive(value) {
  return value === null || (typeof value !== "object" && typeof value !== "function");
}

export function getTypeTag(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (isPlainObject(value)) return "object";
  return typeof value;
}

export function walkJson(value, visitor, options = {}) {
  const maxDepth = Number.isFinite(options.maxDepth) ? options.maxDepth : 12;
  const maxNodes = Number.isFinite(options.maxNodes) ? options.maxNodes : 50_000;
  let nodeCount = 0;
  let exceededLimit = false;

  function walkNode(currentValue, path, depth, parent) {
    if (exceededLimit) return;
    nodeCount += 1;
    if (nodeCount > maxNodes) {
      exceededLimit = true;
      return;
    }

    const type = getTypeTag(currentValue);
    visitor({
      value: currentValue,
      type,
      path,
      depth,
      parent
    });

    if (depth >= maxDepth) return;

    if (Array.isArray(currentValue)) {
      for (let index = 0; index < currentValue.length; index += 1) {
        walkNode(currentValue[index], path.concat(index), depth + 1, currentValue);
      }
      return;
    }

    if (isPlainObject(currentValue)) {
      for (const key of Object.keys(currentValue)) {
        walkNode(currentValue[key], path.concat(key), depth + 1, currentValue);
      }
    }
  }

  walkNode(value, [], 0, null);

  return {
    nodeCount,
    exceededLimit
  };
}

