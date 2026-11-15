import type {
  Descriptor,
  EffectInstance,
  EffectModule,
  EffectTarget,
  Options,
  StopReason,
} from "../sdk/types";
import { Resources } from "../sdk/resources";
import { AudioService } from "../audio/service";
import { Diagnostics } from "./diagnostics";
export type InvocationState = "idle" | "starting" | "playing" | "continuous" | "failed";
/** Owns only an execution. Completing it never unequips its tool or dismisses navigation. */
export class Invocations {
  private scope: Resources | undefined;
  private instance: EffectInstance | undefined;
  private abort: AbortController | undefined;
  private generation = 0;
  private effectId = "";
  state: InvocationState = "idle";
  started = 0;
  constructor(
    private stage: () => HTMLElement,
    private inputAllowed: () => boolean,
    private changed: () => void,
    private diagnostics: Diagnostics,
    private audio?: AudioService,
  ) {}
  get resources(): number {
    return this.scope?.size ?? 0;
  }
  end(reason: StopReason = "user"): void {
    ++this.generation;
    this.abort?.abort();
    this.abort = undefined;
    try {
      this.instance?.stop(reason);
    } catch {
      this.diagnostics.write("effect.cleanup.failed", this.effectId);
    }
    try {
      this.instance?.dispose();
    } catch {
      this.diagnostics.write("effect.cleanup.failed", this.effectId);
    }
    this.scope?.dispose();
    this.scope = undefined;
    this.instance = undefined;
    if (this.effectId) this.diagnostics.write("effect.stop.completed", this.effectId);
    this.effectId = "";
    this.state = "idle";
    this.changed();
  }
  run(d: Descriptor, module: EffectModule, target: EffectTarget, o: Options): void {
    this.end("replacement");
    const generation = this.generation;
    this.effectId = d.id;
    this.state = "starting";
    this.abort = new AbortController();
    const fail = () => {
      if (generation !== this.generation) return;
      this.diagnostics.write("effect.start.failed", d.id);
      this.end("error");
      this.state = "failed";
      this.changed();
    };
    const r = new Resources(fail);
    this.scope = r;
    const overlay = r.node(this.stage());
    const start = performance.now();
    this.started++;
    this.diagnostics.write("effect.start.started", d.id);
    try {
      const audio = d.audioProfile ? this.audio?.scope(d.audioProfile) : undefined;
      if (audio) r.own(() => audio.stop());
      audio?.play("activate");
      this.instance = module.create({
        audio,
        document: target.document,
        signal: this.abort.signal,
        resources: r,
        overlay,
        inputAllowed: this.inputAllowed,
        finish: () => {
          if (generation === this.generation) this.end("timeout");
        },
      });
      const promise = this.instance.start(target, o);
      Promise.resolve(promise)
        .then(() => {
          if (generation !== this.generation) return;
          this.state = d.lifetime.class === "repeatable" ? "playing" : "continuous";
          this.diagnostics.write("effect.start.completed", d.id, performance.now() - start);
          this.changed();
        })
        .catch(fail);
      if (d.lifetime.class === "repeatable") {
        // Duration controls the animation's residue only, never the equipped session or a continuous tool.
        r.timeout(
          () => {
            if (generation === this.generation) this.end("timeout");
          },
          Math.max(d.lifetime.animationMs + d.lifetime.residueMs, o.duration * 1000),
        );
      }
      const elements =
        target.kind === "element"
          ? [target.element]
          : target.kind === "document"
            ? target.elements
            : [];
      if (elements.length) {
        const bounds = elements.map((element) => ({
          element,
          rect: element.getBoundingClientRect(),
        }));
        const invalid = () =>
          bounds.some(({ element, rect }) => {
            if (!element.isConnected) return true;
            const current = element.getBoundingClientRect();
            return (["left", "top", "width", "height"] as const).some(
              (k) => Math.abs(current[k] - rect[k]) > 1,
            );
          });
        const observer = new MutationObserver((records) => {
          if (
            invalid() ||
            records.some(
              (record) =>
                record.type !== "attributes" &&
                elements.some((element) => element.contains(record.target)),
            )
          )
            this.end("navigation");
        });
        observer.observe(target.document.body, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ["class", "style", "hidden"],
        });
        r.own(() => observer.disconnect());
        if (typeof ResizeObserver !== "undefined") {
          const resize = new ResizeObserver(() => {
            if (invalid()) this.end("navigation");
          });
          for (const element of elements) resize.observe(element);
          r.own(() => resize.disconnect());
        }
      }
      this.changed();
    } catch {
      fail();
    }
  }
}
