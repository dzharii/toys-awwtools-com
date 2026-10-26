/** Native selection, IME composition, modifiers, and multiline up/down always win. */
export interface NavigationInput {
  key: string;
  start: number;
  end: number;
  length: number;
  multiline: boolean;
  composing: boolean;
  modified: boolean;
  index: number;
  count: number;
}
export function fieldNavigation(
  input: NavigationInput,
): { index: number; caret: "start" | "end" } | null {
  if (input.composing || input.modified || input.start !== input.end) return null;
  const previous =
    (input.key === "ArrowLeft" && input.start === 0) ||
    (!input.multiline && input.key === "ArrowUp");
  const next =
    (input.key === "ArrowRight" && input.end === input.length) ||
    (!input.multiline && input.key === "ArrowDown");
  if (previous && input.index > 0) return { index: input.index - 1, caret: "end" };
  if (next && input.index < input.count - 1) return { index: input.index + 1, caret: "start" };
  return null;
}
