const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export class ExcitationPoint {
  constructor() {
    this.x = 0.43;
    this.y = 0.54;
    this.vx = 0.022;
    this.vy = -0.011;
    this.phase = 1.7;
  }

  update(deltaSeconds, drift) {
    const dt = Math.min(deltaSeconds, 0.05);
    this.phase += dt * (0.19 + drift * 0.46);
    const steeringX = Math.sin(this.phase * 1.13) * 0.7 + Math.sin(this.phase * 0.37 + 2.1) * 0.3;
    const steeringY = Math.cos(this.phase * 0.91 + 0.6) * 0.66 + Math.sin(this.phase * 0.43 - 1.2) * 0.34;
    const range = 0.22 + drift * 0.1;
    const targetX = 0.5 + steeringX * range;
    const targetY = 0.5 + steeringY * range * 0.82;
    const steer = 0.08 + drift * 0.16;
    this.vx += (targetX - this.x) * steer * dt;
    this.vy += (targetY - this.y) * steer * dt;

    const edge = 0.17;
    const restore = 1.8;
    if (this.x < edge) this.vx += (edge - this.x) * restore * dt;
    if (this.x > 1 - edge) this.vx -= (this.x - (1 - edge)) * restore * dt;
    if (this.y < edge) this.vy += (edge - this.y) * restore * dt;
    if (this.y > 1 - edge) this.vy -= (this.y - (1 - edge)) * restore * dt;

    const damping = Math.exp(-dt * 0.32);
    this.vx *= damping;
    this.vy *= damping;
    const maxSpeed = 0.018 + drift * 0.055;
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }
    this.x = clamp(this.x + this.vx * dt, 0.1, 0.9);
    this.y = clamp(this.y + this.vy * dt, 0.12, 0.88);
    return this.snapshot();
  }

  snapshot() {
    return { x: this.x, y: this.y, vx: this.vx, vy: this.vy };
  }
}
