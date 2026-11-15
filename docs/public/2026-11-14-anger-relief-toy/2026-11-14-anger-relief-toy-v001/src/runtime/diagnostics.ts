export type EventName =
  | "effect.load.started"
  | "effect.load.completed"
  | "effect.load.failed"
  | "effect.start.started"
  | "effect.start.completed"
  | "effect.start.failed"
  | "effect.stop.completed"
  | "effect.cleanup.failed"
  | "effect.target.invalid"
  | "effect.performance.degraded";
interface Diagnostic {
  timestamp: number;
  event: EventName;
  effectId: string;
  effectVersion: string;
  runtimeVersion: string;
  correlationId: number;
  durationMs: number;
}
export class Diagnostics {
  private events: Diagnostic[] = [];
  private correlation = 0;
  write(event: EventName, effectId: string, durationMs = 0): void {
    if (event === "effect.load.started") this.correlation++;
    this.events.push({
      timestamp: Date.now(),
      event,
      effectId,
      effectVersion: "1.0.0",
      runtimeVersion: "0.1.0",
      correlationId: this.correlation,
      durationMs: Math.round(durationMs),
    });
    this.events = this.events.slice(-100);
  }
  report(): readonly Diagnostic[] {
    return [...this.events];
  }
  clear(): void {
    this.events = [];
  }
}
