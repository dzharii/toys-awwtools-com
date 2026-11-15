import type { Descriptor } from "../src/sdk/types";
import { record, validId } from "../src/sdk/validation";
export function validateDescriptor(
  value: unknown,
  directory: string,
  existing: string[],
): asserts value is Descriptor {
  if (!record(value) || !validId(value.id) || value.id !== directory || existing.includes(value.id))
    throw new Error("Invalid or duplicate ID");
  for (const key of ["name", "description", "category", "icon", "version", "color"]) {
    if (typeof value[key] !== "string" || !value[key]) throw new Error(`Missing ${key}`);
  }
  if (!/^#[0-9a-f]{6}$/i.test(String(value.color)) || !/^[-\d\s.,a-z]+$/i.test(String(value.icon)))
    throw new Error("Invalid visual metadata");
  if (
    value.sdkVersion !== "1.0" ||
    !["element", "document", "viewport"].includes(String(value.scope)) ||
    !["click", "pointer", "automatic"].includes(String(value.interaction))
  )
    throw new Error("Unsupported contract");
  if (
    !record(value.lifetime) ||
    !["repeatable", "continuous", "simulation", "persistent"].includes(
      String(value.lifetime.class),
    ) ||
    value.lifetime.overlap !== "replace" ||
    typeof value.lifetime.animationMs !== "number" ||
    value.lifetime.animationMs < 100 ||
    value.lifetime.animationMs > 10000 ||
    typeof value.lifetime.residueMs !== "number" ||
    value.lifetime.residueMs < 0 ||
    value.lifetime.residueMs > 3000
  )
    throw new Error("Invalid lifetime");
  if ((value.scope === "element") !== (value.lifetime.class === "repeatable"))
    throw new Error("Scope/lifetime mismatch");
  if (!Array.isArray(value.tags) || !value.tags.every((t) => typeof t === "string"))
    throw new Error("Invalid tags");
  if (
    !record(value.source) ||
    !["researchId", "name", "author", "url", "relationship", "license"].every(
      (k) => typeof (value.source as Record<string, unknown>)[k] === "string",
    )
  )
    throw new Error("Missing provenance");
  if (value.source.url !== "" && !String(value.source.url).startsWith("https://"))
    throw new Error("Invalid source URL");
  if (
    value.activation !== "replace" ||
    !record(value.capabilities) ||
    value.capabilities.reducedMotion !== true ||
    value.capabilities.audio !== false ||
    value.capabilities.pause !== false
  )
    throw new Error("Invalid capabilities");
  if (
    typeof value.enabled !== "boolean" ||
    !["review-pending", "verified"].includes(String(value.status)) ||
    !["low", "medium"].includes(String(value.intensity))
  )
    throw new Error("Invalid status");
}
