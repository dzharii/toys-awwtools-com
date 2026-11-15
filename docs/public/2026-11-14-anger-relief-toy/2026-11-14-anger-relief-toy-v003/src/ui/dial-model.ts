/** A physical slot changes identity only at the centre of the stationary cover. */
export const mod = (n: number, d: number): number => ((n % d) + d) % d;
export class DialModel {
  readonly slots: number;
  readonly step: number;
  position = 0;
  constructor(readonly count: number) {
    if (!Number.isInteger(count) || count < 1) throw new Error("EMPTY_DIAL");
    this.slots = Math.min(9, count + 1);
    this.step = 360 / this.slots;
  }
  set(value: number): void {
    if (!Number.isFinite(value)) return;
    // This period preserves both physical slots and logical identities.
    const period = this.slots * this.count;
    this.position = mod(value + period / 2, period) - period / 2;
  }
  slot(j: number): { index: number; angle: number; covered: boolean } {
    const u = j + this.position;
    const phase = mod(u, this.slots);
    const distance = Math.min(phase, this.slots - phase) * this.step;
    return {
      index: mod(this.slots - 1 - j + Math.floor(u / this.slots) * this.slots, this.count),
      angle: -135 + phase * this.step,
      covered: distance < 24,
    };
  }
  get topIndex(): number {
    return mod(Math.round(this.position) + this.slots - 2, this.count);
  }
}
