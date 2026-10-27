import { AppError } from "../errors";

export function validatedTitle(value: string): string {
  const title = value.trim();
  if (!title) throw new AppError("INVALID_TITLE", "Enter a nonempty title.");
  if ([...title].length > 200)
    throw new AppError("INVALID_TITLE", "Use no more than 200 characters.");
  return title;
}
export function localCopyTitle(title: string): string {
  const suffix = " (local copy)";
  return [...(title || "Untitled")].slice(0, 200 - suffix.length).join("") + suffix;
}
