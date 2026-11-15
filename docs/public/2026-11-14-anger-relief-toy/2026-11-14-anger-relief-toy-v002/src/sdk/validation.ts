import type { Options } from "./types";
export const defaults: Options = {
  strength: 0.65,
  duration: 3,
  reducedMotion: false,
  radius: 160,
  darkness: 0.86,
  softness: 40,
};
export function options(input: unknown): Options {
  const data =
    typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const bound = (key: keyof Options, min: number, max: number): number => {
    const value = Object.hasOwn(data, key) ? data[key] : undefined;
    return typeof value === "number" && Number.isFinite(value)
      ? Math.min(max, Math.max(min, value))
      : (defaults[key] as number);
  };
  return {
    strength: bound("strength", 0.2, 1),
    duration: bound("duration", 1, 10),
    radius: bound("radius", 60, 320),
    darkness: bound("darkness", 0.3, 0.95),
    softness: bound("softness", 0, 100),
    reducedMotion: Object.hasOwn(data, "reducedMotion") && data.reducedMotion === true,
  };
}
export function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
export function validId(id: unknown): id is string {
  return typeof id === "string" && /^[a-z][a-z0-9-]{0,63}$/.test(id);
}
