/** Minimal surface used when optional SVG rasterization is available at build time. */
declare module "@resvg/resvg-js" {
  export interface ResvgOptions {
    fitTo?: { mode: "width" | "height" | "zoom"; value: number };
    background?: string;
  }

  export class Resvg {
    constructor(svg: string | Uint8Array, options?: ResvgOptions);
    render(): { asPng(): Uint8Array };
  }
}
