// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

export interface CommandDefinition<Context = Record<string, unknown>> {
  id: string;
  label?: string;
  shortcut?: string;
  run(context: Context): void;
  isEnabled?(context: Context): boolean;
  isChecked?(context: Context): boolean;
}

export interface CommandJson {
  id: string;
  label: string;
  shortcut: string;
  enabled: boolean;
  checked: boolean;
}

export class CommandRegistry<Context = Record<string, unknown>> {
  #commands = new Map<string, CommandDefinition<Context>>();

  register(command: CommandDefinition<Context>): () => boolean {
    if (!command?.id || typeof command.run !== "function") {
      throw new TypeError("Command must include stable id and run(context)");
    }

    this.#commands.set(command.id, command);
    return () => this.#commands.delete(command.id);
  }

  has(id: string): boolean {
    return this.#commands.has(id);
  }

  resolve(id: string): CommandDefinition<Context> | null {
    return this.#commands.get(id) ?? null;
  }

  isEnabled(id: string, context = {} as Context): boolean {
    const command = this.resolve(id);
    if (!command) return false;
    return typeof command.isEnabled === "function" ? command.isEnabled(context) : true;
  }

  isChecked(id: string, context = {} as Context): boolean {
    const command = this.resolve(id);
    if (!command) return false;
    return typeof command.isChecked === "function" ? command.isChecked(context) : false;
  }

  run(id: string, context = {} as Context): boolean {
    const command = this.resolve(id);
    if (!command || !this.isEnabled(id, context)) return false;
    command.run(context);
    return true;
  }

  toJSON(context = {} as Context): CommandJson[] {
    return [...this.#commands.values()].map((command) => ({
      id: command.id,
      label: command.label ?? command.id,
      shortcut: command.shortcut ?? "",
      enabled: typeof command.isEnabled === "function" ? command.isEnabled(context) : true,
      checked: typeof command.isChecked === "function" ? command.isChecked(context) : false
    }));
  }
}
