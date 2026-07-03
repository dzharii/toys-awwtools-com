/**
 * Control interfaces: small, reusable, product-agnostic UI primitives.
 *
 * Page Objects expose user-intent behavior; controls expose control-level
 * behavior. exists()/isVisible() must never throw for normal absence — they
 * return false. Every control carries a human-readable name for diagnostics.
 * Adapted from the reference suite's ICtl family, extended with select, range,
 * and segmented controls needed by the reader settings panel.
 */

export interface ICtlBase {
  readonly name: string;
  exists(): Promise<boolean>;
  isVisible(): Promise<boolean>;
}

export interface ICtlButton extends ICtlBase {
  click(): Promise<void>;
  isEnabled(): Promise<boolean>;
}

export interface ICtlTextInput extends ICtlBase {
  setValue(value: string): Promise<void>;
  getValue(): Promise<string>;
  clear(): Promise<void>;
  press(key: string): Promise<void>;
}

export interface ICtlStatus extends ICtlBase {
  getText(): Promise<string>;
}

export interface ICtlSelect extends ICtlBase {
  selectValue(value: string): Promise<void>;
  getValue(): Promise<string>;
  options(): Promise<string[]>;
}

export interface ICtlRange extends ICtlBase {
  setValue(value: number): Promise<void>;
  getValue(): Promise<number>;
  min(): Promise<number>;
  max(): Promise<number>;
}

export interface ICtlSegmented extends ICtlBase {
  choose(value: string): Promise<void>;
  selectedValue(): Promise<string | null>;
}
