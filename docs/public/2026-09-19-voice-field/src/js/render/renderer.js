import { hexToRgb } from "../config/palettes.js";
import { STYLE_PROFILES } from "./styles/index.js";
import { FIELD_SHADER } from "./field-shader.js";
import { SceneTransition } from "./transition.js";

const FLOATS_PER_UNIFORM = 88;

export class FieldRenderer extends EventTarget {
  constructor(canvas, initialScene, options = {}) {
    super();
    this.canvas = canvas;
    this.initialScene = initialScene;
    this.transition = new SceneTransition(initialScene, options.transitionDurationMs ?? 2200);
    this.maxPixelRatio = options.maxPixelRatio ?? 1.75;
    this.quality = "auto";
    this.mobile = matchMedia("(max-width: 760px)").matches;
    this.context = null;
    this.device = null;
    this.uniformData = new Float32Array(FLOATS_PER_UNIFORM);
    this.impulses = [];
    this.lastImpulse = 0;
    this.previousImpulse = 0;
    this.ready = false;
    this.lastSize = { width: 0, height: 0, pixelRatio: 0 };
  }

  async initialize() {
    if (!navigator.gpu) throw new Error("WebGPU is not supported by this browser.");
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: this.mobile ? "low-power" : "high-performance" });
    if (!adapter) throw new Error("No suitable WebGPU adapter was found.");
    this.device = await adapter.requestDevice();
    this.context = this.canvas.getContext("webgpu");
    if (!this.context) throw new Error("The Stage could not create a WebGPU canvas context.");
    this.format = navigator.gpu.getPreferredCanvasFormat();
    const module = this.device.createShaderModule({ label: "voice-field procedural materials", code: FIELD_SHADER });
    const compilation = await module.getCompilationInfo();
    const errors = compilation.messages.filter((message) => message.type === "error");
    if (errors.length) throw new Error(`WebGPU shader error: ${errors.map((error) => `${error.lineNum}:${error.linePos} ${error.message}`).join("; ")}`);
    this.pipeline = this.device.createRenderPipeline({
      label: "voice-field field pipeline",
      layout: "auto",
      vertex: { module, entryPoint: "vertexMain" },
      fragment: { module, entryPoint: "fragmentMain", targets: [{ format: this.format }] },
      primitive: { topology: "triangle-list" },
    });
    this.uniformBuffer = this.device.createBuffer({
      label: "voice-field semantic state",
      size: 512,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });
    this.device.lost.then((info) => {
      this.ready = false;
      this.dispatchEvent(new CustomEvent("devicelost", { detail: info }));
    });
    this.ready = true;
    return this;
  }

  setQuality(quality) {
    this.quality = quality;
    this.lastSize.width = 0;
  }

  setScene(scene, nowMs = performance.now()) {
    this.transition.begin(scene, nowMs);
  }

  getRenderScale() {
    if (this.quality === "high") return 1;
    if (this.quality === "balanced") return 0.78;
    return this.mobile ? 0.68 : 1;
  }

  resize() {
    if (!this.ready) return null;
    const bounds = this.canvas.getBoundingClientRect();
    const scale = this.getRenderScale();
    const pixelRatio = Math.min(devicePixelRatio || 1, this.maxPixelRatio) * scale;
    const width = Math.max(1, Math.round(bounds.width * pixelRatio));
    const height = Math.max(1, Math.round(bounds.height * pixelRatio));
    if (width === this.lastSize.width && height === this.lastSize.height && pixelRatio === this.lastSize.pixelRatio) return this.lastSize;
    this.canvas.width = width;
    this.canvas.height = height;
    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: "opaque",
    });
    this.lastSize = { width, height, pixelRatio, cssWidth: bounds.width, cssHeight: bounds.height };
    return this.lastSize;
  }

  render({ nowMs, deltaSeconds, controls, audio, excitation }) {
    const scene = this.transition.update(nowMs);
    this.captureImpulse(audio, excitation, nowMs);
    if (!this.ready) return;
    const size = this.resize();
    this.writeUniforms({ size, nowMs, deltaSeconds, controls, audio, excitation, scene });
    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData);

    const encoder = this.device.createCommandEncoder({ label: "voice-field frame" });
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: { r: 0.005, g: 0.007, b: 0.012, a: 1 },
        loadOp: "clear",
        storeOp: "store",
      }],
    });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(3);
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  captureImpulse(audio, excitation, nowMs) {
    const rising = audio.impulse > this.previousImpulse + 0.04;
    if (audio.impulse > 0.16 && rising && nowMs - this.lastImpulse > 135) {
      this.impulses.unshift({ x: excitation.x, y: excitation.y, bornAt: nowMs, strength: Math.min(1, 0.32 + audio.impulse * 0.9) });
      this.impulses.length = Math.min(8, this.impulses.length);
      this.lastImpulse = nowMs;
    }
    this.previousImpulse = audio.impulse;
    this.impulses = this.impulses.filter((impulse) => nowMs - impulse.bornAt < 6500);
  }

  writeUniforms({ size, nowMs, deltaSeconds, controls, audio, excitation, scene }) {
    const values = this.uniformData;
    values.fill(0);
    values.set([size.width, size.height, nowMs / 1000, deltaSeconds], 0);
    values.set([audio.envelope, audio.low, audio.mid, audio.high], 4);
    values.set([audio.impulse, audio.phraseActivity, Math.min(20, audio.silenceMs / 1000), scene.progress], 8);
    values.set([excitation.x, excitation.y, excitation.vx, excitation.vy], 12);
    values.set([controls.energy, controls.motion, controls.detail, controls.voiceInfluence], 16);
    const fromStyle = STYLE_PROFILES[scene.from.style]?.shaderIndex ?? 0;
    const toStyle = STYLE_PROFILES[scene.to.style]?.shaderIndex ?? 0;
    values.set([controls.excitationDrift, controls.idleMotion, fromStyle, toStyle], 20);
    this.writePalette(values, 24, scene.from.palette);
    this.writePalette(values, 40, scene.to.palette);
    for (let index = 0; index < 8; index += 1) {
      const impulse = this.impulses[index];
      const offset = 56 + index * 4;
      if (impulse) values.set([impulse.x, impulse.y, (nowMs - impulse.bornAt) / 1000, impulse.strength], offset);
      else values.set([0.5, 0.5, 20, 0], offset);
    }
  }

  writePalette(values, offset, palette) {
    const colors = palette.colors.map(hexToRgb);
    values.set([...colors[0], 1], offset);
    values.set([...colors[1], 1], offset + 4);
    values.set([...colors[2], 1], offset + 8);
    values.set([...hexToRgb(palette.background), 1], offset + 12);
  }

  destroy() {
    this.uniformBuffer?.destroy();
    this.ready = false;
  }
}
