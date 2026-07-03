// E Ink refresh controller. Single owner of refresh timing and DOM-swap
// coordination so no other module duplicates refresh logic.
//
// A refresh is: lock -> wash overlay -> swap DOM near the wash peak -> stepped
// grayscale settle -> unlock. Page turns use a partial refresh that leaves a
// faint ghost; after `fullRefreshInterval` turns a full refresh clears it.
// Any error during the swap still unlocks and reveals the new DOM.

import { log } from "./logging.js";
import { nextFrame, wait } from "./utils.js";

const DURATIONS = {
  off: { wash: 0, settle: 0 },
  reduced: { wash: 120, settle: 180 },
  balanced: { wash: 220, settle: 320 },
  strong: { wash: 300, settle: 420 },
};

export class EinkController {
  constructor(stageEl) {
    this.stage = stageEl;
    this.overlay = stageEl.querySelector(".eink-overlay");
    this.ghost = stageEl.querySelector(".eink-ghost");
    this.config = {
      intensity: "balanced",
      motion: "system",
      reducedMotionSystem: false,
      fullRefreshInterval: 6,
    };
    this.partials = 0;
    this.locked = false;
    this._chain = Promise.resolve();
  }

  configure(patch) {
    Object.assign(this.config, patch);
  }

  /** Resolve effective motion: system follows OS preference. */
  effectiveMotion() {
    if (this.config.motion === "reduced") return "reduced";
    if (this.config.motion === "full") return "full";
    return this.config.reducedMotionSystem ? "reduced" : "full";
  }

  isReduced() {
    return this.effectiveMotion() === "reduced";
  }

  durations() {
    if (this.config.intensity === "off") return DURATIONS.off;
    if (this.isReduced()) return DURATIONS.reduced;
    return DURATIONS[this.config.intensity] || DURATIONS.balanced;
  }

  /** True while a refresh is animating; callers may skip rapid re-entry. */
  get busy() {
    return this.locked;
  }

  /**
   * Run a refresh, serialized so rapid calls queue rather than overlap.
   * @param {"full"|"partial"} type
   * @param {Function} updateDom async or sync DOM mutation
   */
  run(type, updateDom) {
    this._chain = this._chain.then(() => this._run(type, updateDom));
    return this._chain;
  }

  async _run(type, updateDom) {
    const off = this.config.intensity === "off";
    if (off) {
      // No visual effect, but still swap the DOM.
      await this._safeUpdate(updateDom);
      return;
    }

    const dur = this.durations();
    const reduced = this.isReduced();
    const cls = type === "full" ? "eink-full" : "eink-partial";

    log.debug("eink:refresh:start", { type, intensity: this.config.intensity, reduced });

    this.locked = true;
    this.stage.classList.remove("eink-full", "eink-partial");
    // Force reflow so re-adding the class restarts the animation.
    void this.stage.offsetWidth;
    this.stage.classList.add(cls);

    try {
      // Let the wash cover the surface before swapping content.
      await wait(reduced ? 10 : Math.round(dur.wash * 0.45));
      await this._safeUpdate(updateDom);
      await nextFrame();

      if (type === "partial" && !reduced) this._showGhost();
      else this._clearGhost();

      await wait(reduced ? 180 : dur.settle);
    } finally {
      this.stage.classList.remove(cls);
      this.locked = false;
      log.debug("eink:refresh:complete", { type });
    }

    // Ghost cleanup cadence.
    if (type === "partial") {
      this.partials += 1;
      if (this.config.fullRefreshInterval > 0 && this.partials >= this.config.fullRefreshInterval) {
        this.partials = 0;
        this._clearGhost();
      }
    } else {
      this.partials = 0;
    }
  }

  async _safeUpdate(updateDom) {
    try {
      await updateDom();
    } catch (err) {
      // Never leave the UI stuck: reveal whatever state exists and report.
      log.error("eink:refresh:update-error", { reason: (err && err.message) || "update" });
    }
  }

  _showGhost() {
    if (!this.ghost) return;
    this.ghost.classList.add("is-visible");
  }

  _clearGhost() {
    if (!this.ghost) return;
    this.ghost.classList.remove("is-visible");
  }

  /** Decide partial vs full for a page turn based on the cleanup interval. */
  runPageTurn(updateDom) {
    const interval = this.config.fullRefreshInterval;
    const useFull = interval > 0 && this.partials + 1 >= interval;
    return this.run(useFull ? "full" : "partial", updateDom);
  }
}
