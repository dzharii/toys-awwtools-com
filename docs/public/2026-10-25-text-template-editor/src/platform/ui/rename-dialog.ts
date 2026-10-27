import { errorMessage } from "../errors";
import { button, el } from "./dom";
import { validatedTitle } from "./titles";

export async function renameDialog(
  root: HTMLElement,
  heading: string,
  value: string,
  suggestions: boolean,
): Promise<string | null> {
  const dialog = el("dialog", "confirm-dialog");
  dialog.dataset.testid = "guided-rename-main-dialog-root";
  const title = el("h2", "", heading);
  title.id = "rename-title";
  dialog.setAttribute("aria-labelledby", title.id);
  const input = el("input");
  input.type = "text";
  input.value = value;
  input.dataset.browserSuggestions = "";
  input.dataset.testid = "guided-rename-main-input-title";
  input.setAttribute("aria-label", heading);
  if (!suggestions) input.autocomplete = "off";
  const error = el("p", "danger");
  error.id = "rename-error";
  error.setAttribute("role", "alert");
  input.setAttribute("aria-describedby", error.id);
  const form = el("form");
  let result: string | null = null;
  const submit = el("button", "primary", "Rename");
  submit.type = "submit";
  submit.dataset.testid = "guided-rename-main-button-save";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      result = validatedTitle(input.value);
      dialog.close();
    } catch (failure) {
      error.textContent = errorMessage(failure);
      input.setAttribute("aria-invalid", "true");
      input.focus();
    }
  });
  form.append(
    input,
    error,
    el(
      "div",
      "dialog-actions",
      button("Cancel", () => dialog.close(), "secondary", "guided-rename-main-button-cancel"),
      submit,
    ),
  );
  dialog.append(title, form);
  root.append(dialog);
  dialog.showModal();
  input.focus();
  input.select();
  return new Promise((resolve) =>
    dialog.addEventListener(
      "close",
      () => {
        dialog.remove();
        resolve(result);
      },
      { once: true },
    ),
  );
}
