export interface Timing {
  operation: string;
  durationMs: number;
  status: "ok" | "error";
  identity?: string;
}

export class Timings {
  readonly events: Timing[] = [];

  async measure<T>(operation: string, action: () => Promise<T>, identity?: string): Promise<T> {
    const start = performance.now();
    let status: Timing["status"] = "ok";
    try {
      return await action();
    } catch (error) {
      status = "error";
      throw error;
    } finally {
      this.events.push({
        operation,
        durationMs: Math.round(performance.now() - start),
        status,
        identity,
      });
      if (this.events.length > 100) this.events.shift();
    }
  }
}
