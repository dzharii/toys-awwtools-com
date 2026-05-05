// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

export class CommandRegistry {
  #commands = new Map();

  register(command) {
    if (!command?.id || typeof command.run !== "function") {
      throw new TypeError("Command must include stable id and run(context)");
    }

    this.#commands.set(command.id, command);
    return () => this.#commands.delete(command.id);
  }

  has(id) {
    return this.#commands.has(id);
  }

  resolve(id) {
    return this.#commands.get(id) ?? null;
  }

  isEnabled(id, context = {}) {
    const command = this.resolve(id);
    if (!command) return false;
    return typeof command.isEnabled === "function" ? command.isEnabled(context) : true;
  }

  isChecked(id, context = {}) {
    const command = this.resolve(id);
    if (!command) return false;
    return typeof command.isChecked === "function" ? command.isChecked(context) : false;
  }

  run(id, context = {}) {
    const command = this.resolve(id);
    if (!command || !this.isEnabled(id, context)) return false;
    command.run(context);
    return true;
  }

  toJSON(context = {}) {
    return [...this.#commands.values()].map((command) => ({
      id: command.id,
      label: command.label ?? command.id,
      shortcut: command.shortcut ?? "",
      enabled: typeof command.isEnabled === "function" ? command.isEnabled(context) : true,
      checked: typeof command.isChecked === "function" ? command.isChecked(context) : false
    }));
  }
}
