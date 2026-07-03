import type { Locator } from "@playwright/test";
import type {
  ICtlBase,
  ICtlButton,
  ICtlRange,
  ICtlSegmented,
  ICtlSelect,
  ICtlStatus,
  ICtlTextInput,
} from "./control-interfaces.js";

/**
 * Locator-backed control implementations. Each wraps a single Playwright
 * Locator. Existence/visibility checks never throw for normal absence.
 */

async function safeBool(fn: () => Promise<boolean>): Promise<boolean> {
  try {
    return await fn();
  } catch {
    return false;
  }
}

export class LocatorCtlElement implements ICtlBase {
  constructor(
    readonly name: string,
    protected readonly locator: Locator,
  ) {}

  async exists(): Promise<boolean> {
    return safeBool(async () => (await this.locator.count()) > 0);
  }

  async isVisible(): Promise<boolean> {
    return safeBool(() => this.locator.first().isVisible());
  }
}

export class LocatorCtlButton extends LocatorCtlElement implements ICtlButton {
  async click(): Promise<void> {
    await this.locator.first().click();
  }

  async isEnabled(): Promise<boolean> {
    return safeBool(() => this.locator.first().isEnabled());
  }
}

export class LocatorCtlStatus extends LocatorCtlElement implements ICtlStatus {
  async getText(): Promise<string> {
    return (await this.locator.first().textContent()) ?? "";
  }
}

export class LocatorCtlTextInput extends LocatorCtlElement implements ICtlTextInput {
  async setValue(value: string): Promise<void> {
    await this.locator.first().fill(value);
  }

  async getValue(): Promise<string> {
    return this.locator.first().inputValue();
  }

  async clear(): Promise<void> {
    await this.locator.first().fill("");
  }

  async press(key: string): Promise<void> {
    await this.locator.first().press(key);
  }
}

export class LocatorCtlSelect extends LocatorCtlElement implements ICtlSelect {
  async selectValue(value: string): Promise<void> {
    await this.locator.first().selectOption(value);
  }

  async getValue(): Promise<string> {
    return this.locator.first().inputValue();
  }

  async options(): Promise<string[]> {
    return this.locator.first().evaluate((el) =>
      Array.from((el as HTMLSelectElement).options).map((o) => o.value),
    );
  }
}

export class LocatorCtlRange extends LocatorCtlElement implements ICtlRange {
  /**
   * Set an <input type="range"> to a numeric value and fire input+change so the
   * app's live handlers commit the value, matching real user drag behavior.
   */
  async setValue(value: number): Promise<void> {
    await this.locator.first().evaluate((el, v) => {
      const input = el as HTMLInputElement;
      input.value = String(v);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
  }

  async getValue(): Promise<number> {
    return Number(await this.locator.first().inputValue());
  }

  async min(): Promise<number> {
    return Number(await this.locator.first().getAttribute("min"));
  }

  async max(): Promise<number> {
    return Number(await this.locator.first().getAttribute("max"));
  }
}

/**
 * Segmented control: a group of buttons sharing a data-seg name, each carrying
 * a data-value and aria-pressed. `choose` clicks the button whose testid maps
 * to the value; `selectedValue` reads the pressed button's data-value.
 */
export class LocatorCtlSegmented extends LocatorCtlElement implements ICtlSegmented {
  constructor(
    name: string,
    private readonly buttons: Locator,
    private readonly buttonFor: (value: string) => Locator,
  ) {
    super(name, buttons);
  }

  async choose(value: string): Promise<void> {
    await this.buttonFor(value).click();
  }

  async selectedValue(): Promise<string | null> {
    return this.buttons.evaluateAll((els) => {
      const pressed = els.find((e) => e.getAttribute("aria-pressed") === "true");
      return pressed ? pressed.getAttribute("data-value") : null;
    });
  }
}
