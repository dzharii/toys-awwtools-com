function isValidHexColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value ?? ""));
}

function normalizeValue(value) {
  if (value == null) return "";
  return String(value);
}

function normalizeRule(rule) {
  return {
    id: rule.id,
    enabled: rule.enabled !== false,
    name: rule.name || "Rule",
    columnKey: rule.columnKey || "*",
    operator: rule.operator || "contains",
    value: rule.value ?? "",
    caseSensitive: Boolean(rule.caseSensitive),
    target: rule.target === "row" ? "row" : "cell",
    style: {
      tone: rule.style?.tone || "warning",
      backgroundColor: isValidHexColor(rule.style?.backgroundColor) ? rule.style.backgroundColor : null
    }
  };
}

function compareValues(operator, cellValue, ruleValue, caseSensitive) {
  const left = normalizeValue(cellValue);
  const right = normalizeValue(ruleValue);
  const leftNormalized = caseSensitive ? left : left.toLowerCase();
  const rightNormalized = caseSensitive ? right : right.toLowerCase();

  if (operator === "equals") return leftNormalized === rightNormalized;
  if (operator === "contains") return leftNormalized.includes(rightNormalized);
  if (operator === "exists") return left !== "" && left !== "null" && left !== "undefined";
  if (operator === "missing") return left === "" || left === "null" || left === "undefined";
  if (operator === "gt") return Number(left) > Number(right);
  if (operator === "lt") return Number(left) < Number(right);
  return false;
}

export function validateHighlightRule(rule, columns) {
  const normalized = normalizeRule(rule);
  if (normalized.columnKey !== "*" && !columns.some((column) => column.key === normalized.columnKey)) {
    return { ok: false, error: "Unknown column key." };
  }
  if (!["equals", "contains", "exists", "missing", "gt", "lt"].includes(normalized.operator)) {
    return { ok: false, error: "Unsupported operator." };
  }
  return { ok: true, rule: normalized };
}

export function matchHighlightRule(cell, column, row, rule) {
  if (!rule.enabled) return false;
  if (rule.columnKey !== "*" && rule.columnKey !== column.key) return false;
  if (rule.operator === "missing") {
    return !cell || cell.state === "missing";
  }
  if (!cell || cell.state === "missing") return false;
  return compareValues(rule.operator, cell.value, rule.value, rule.caseSensitive);
}

export function getCellHighlights(cell, column, row, rules) {
  for (const rule of rules || []) {
    const normalizedRule = normalizeRule(rule);
    if (matchHighlightRule(cell, column, row, normalizedRule)) {
      return normalizedRule;
    }
  }
  return null;
}

