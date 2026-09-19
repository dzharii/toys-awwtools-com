const clamp01 = (value) => Math.min(1, Math.max(0, value));
const ease = (value) => {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
};

export class SceneTransition {
  constructor(initialScene, durationMs = 2200) {
    this.from = initialScene;
    this.to = initialScene;
    this.durationMs = durationMs;
    this.startedAt = 0;
    this.progress = 1;
  }

  begin(nextScene, nowMs = performance.now()) {
    this.from = this.to;
    this.to = nextScene;
    this.startedAt = nowMs;
    this.progress = 0;
  }

  update(nowMs = performance.now()) {
    if (this.progress >= 1) return this.snapshot();
    this.progress = clamp01((nowMs - this.startedAt) / this.durationMs);
    return this.snapshot();
  }

  snapshot() {
    return { from: this.from, to: this.to, progress: ease(this.progress), active: this.progress < 1 };
  }
}
