import { clamp, lerp, pointDistanceSq } from "./utils.js";

export class VesselGeometry {
  constructor(config) {
    this.config = config;
    this.viewport = { width: 1, height: 1, dpr: 1 };
    this.mode = "desktop";
    this.opening = {
      cx: 0,
      cy: 0,
      rx: 0,
      ry: 0,
      radius: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    this.bounds = { x: 0, y: 0, width: 0, height: 0 };
  }

  resize(width, height, dpr) {
    this.viewport = { width, height, dpr };
    const isPortrait = height / Math.max(1, width) > this.config.portraitBreakpointRatio;
    this.mode = isPortrait ? "portrait" : "desktop";

    if (this.mode === "desktop") {
      const inset = this.config.vessel.desktopInset;
      const safe = Math.max(inset, this.config.viewportMargin);
      const size = Math.max(80, Math.min(width - safe * 2, height - safe * 2));
      const cx = width * 0.5;
      const cy = height * 0.5;
      const rx = size * 0.5;
      const ry = size * 0.5 * 0.985;
      this.opening = {
        cx,
        cy,
        rx,
        ry,
        radius: (rx + ry) * 0.5,
        x: cx - rx,
        y: cy - ry,
        width: rx * 2,
        height: ry * 2,
      };
    } else {
      const insetX = this.config.vessel.mobileInsetX;
      const insetY = this.config.vessel.mobileInsetY;
      const widthAvailable = Math.max(80, width - insetX * 2);
      const heightAvailable = Math.max(120, height - insetY * 2);
      const rx = widthAvailable * 0.45;
      const ry = heightAvailable * 0.47;
      const cx = width * 0.5;
      const cy = height * 0.5;
      this.opening = {
        cx,
        cy,
        rx,
        ry,
        radius: Math.min(rx, ry),
        x: cx - rx,
        y: cy - ry,
        width: rx * 2,
        height: ry * 2,
      };
    }

    const rimOuter = this.config.vessel.rimOuter;
    this.bounds = {
      x: this.opening.x - rimOuter - 6,
      y: this.opening.y - rimOuter - 6,
      width: this.opening.width + (rimOuter + 6) * 2,
      height: this.opening.height + (rimOuter + 6) * 2,
    };
  }

  createOpeningPath(ctx) {
    const { cx, cy, rx, ry } = this.opening;
    ctx.beginPath();
    if (this.mode === "desktop") {
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    } else {
      this.#roundedCisternPath(ctx, cx, cy, rx, ry);
    }
  }

  createInnerLipPath(ctx, insetPx = 0) {
    const { cx, cy, rx, ry } = this.opening;
    const innerRx = Math.max(12, rx - insetPx);
    const innerRy = Math.max(12, ry - insetPx);
    ctx.beginPath();
    if (this.mode === "desktop") {
      ctx.ellipse(cx, cy, innerRx, innerRy, 0, 0, Math.PI * 2);
    } else {
      this.#roundedCisternPath(ctx, cx, cy, innerRx, innerRy);
    }
  }

  #roundedCisternPath(ctx, cx, cy, rx, ry) {
    const capR = rx;
    const topY = cy - ry + capR;
    const bottomY = cy + ry - capR;
    ctx.moveTo(cx, cy - ry);
    ctx.arc(cx, topY, capR, -Math.PI * 0.5, Math.PI * 0.5, false);
    ctx.lineTo(cx + rx, bottomY);
    ctx.arc(cx, bottomY, capR, 0, Math.PI, false);
    ctx.lineTo(cx - rx, topY);
    ctx.closePath();
  }

  containsPixelPoint(x, y) {
    const point = this.pixelToNormalized(x, y);
    if (!point) return false;
    return this.containsNormalizedPoint(point.x, point.y);
  }

  containsNormalizedPoint(nx, ny) {
    if (this.mode === "desktop") {
      const dx = nx * 2 - 1;
      const dy = ny * 2 - 1;
      return dx * dx + dy * dy <= 1;
    }
    const p = { x: nx * 2 - 1, y: ny * 2 - 1 };
    const radius = 1;
    const bodyHalfHeight = Math.max(0, 1 - radius);
    if (Math.abs(p.y) <= bodyHalfHeight && Math.abs(p.x) <= 1) {
      return true;
    }
    const capCenterY = p.y < 0 ? -bodyHalfHeight : bodyHalfHeight;
    return pointDistanceSq(p.x, p.y, 0, capCenterY) <= radius * radius;
  }

  clampNormalizedPoint(nx, ny) {
    if (this.containsNormalizedPoint(nx, ny)) {
      return { x: clamp(nx, 0, 1), y: clamp(ny, 0, 1) };
    }

    if (this.mode === "desktop") {
      const dx = nx * 2 - 1;
      const dy = ny * 2 - 1;
      const mag = Math.sqrt(dx * dx + dy * dy) || 1;
      const cd = dx / mag;
      const sd = dy / mag;
      return { x: (cd + 1) * 0.5, y: (sd + 1) * 0.5 };
    }

    let best = null;
    let bestDist = Infinity;
    for (let i = 0; i < 180; i += 1) {
      const angle = (i / 180) * Math.PI * 2;
      const point = this.sampleBoundary(angle);
      const dist = pointDistanceSq(nx, ny, point.x, point.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = point;
      }
    }
    return best || { x: 0.5, y: 0.5 };
  }

  sampleBoundary(angle) {
    if (this.mode === "desktop") {
      return {
        x: (Math.cos(angle) + 1) * 0.5,
        y: (Math.sin(angle) + 1) * 0.5,
      };
    }

    const capR = 0.5;
    const straightHalf = 0;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const y = sin;
    const x = cos;
    if (y < 0) {
      return {
        x: (x + 1) * 0.5,
        y: ((y - straightHalf) + 1) * 0.5,
      };
    }
    return {
      x: (x + 1) * 0.5,
      y: ((y + straightHalf) + 1) * 0.5,
    };
  }

  pixelToNormalized(x, y) {
    const { opening } = this;
    if (opening.width <= 0 || opening.height <= 0) return null;
    return {
      x: clamp((x - opening.x) / opening.width, 0, 1),
      y: clamp((y - opening.y) / opening.height, 0, 1),
    };
  }

  normalizedToPixel(nx, ny) {
    return {
      x: this.opening.x + nx * this.opening.width,
      y: this.opening.y + ny * this.opening.height,
    };
  }

  redirectPixelToInterior(x, y) {
    const normalized = this.pixelToNormalized(x, y);
    if (!normalized) {
      return this.normalizedToPixel(0.5, 0.5);
    }
    const clamped = this.clampNormalizedPoint(normalized.x, normalized.y);
    return this.normalizedToPixel(clamped.x, clamped.y);
  }

  getTokenSafePoint(nx, ny) {
    const inset = this.config.vessel.tokenSafeInset;
    let px = lerp(inset, 1 - inset, clamp(nx, 0, 1));
    let py = lerp(inset, 1 - inset, clamp(ny, 0, 1));
    const clamped = this.clampNormalizedPoint(px, py);
    return clamped;
  }
}

