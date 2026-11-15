export const SDK_VERSION = "1.0";
export type Scope = "element" | "document" | "viewport";
export interface Descriptor {
  id: string;
  version: string;
  sdkVersion: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  scope: Scope;
  interaction: "click" | "pointer" | "automatic";
  intensity: "low" | "medium";
  icon: string;
  color: string;
  audioProfile?: import("./audio-types").AudioProfile;
  iconSvg?: string;
  lifetime: {
    class: "repeatable" | "continuous" | "simulation" | "persistent";
    overlap: "replace";
    animationMs: number;
    residueMs: number;
  };
  source: {
    researchId: string;
    name: string;
    author: string;
    url: string;
    relationship: string;
    license: string;
  };
  enabled: boolean;
  status: "review-pending" | "verified";
  activation: "replace";
  capabilities: { reducedMotion: true; audio: boolean; pause: false };
}
export interface Options {
  strength: number;
  duration: number;
  reducedMotion: boolean;
  radius: number;
  darkness: number;
  softness: number;
}
export type EffectTarget =
  | { kind: "element"; element: HTMLElement; document: Document; x: number; y: number }
  | { kind: "document"; document: Document; elements: HTMLElement[] }
  | { kind: "viewport"; document: Document };
export type StopReason = "user" | "replacement" | "navigation" | "timeout" | "error" | "shutdown";
export interface EffectContext {
  document: Document;
  signal: AbortSignal;
  resources: import("./resources").Resources;
  overlay: HTMLElement;
  audio?: import("./audio-types").EffectAudio;
  finish(): void;
  inputAllowed?(): boolean;
}
export interface EffectInstance {
  start(target: EffectTarget, options: Options): void | Promise<void>;
  stop(reason: StopReason): void;
  dispose(): void;
}
export interface EffectModule {
  sdkVersion: string;
  create(context: EffectContext): EffectInstance;
}
export interface RuntimeBridge {
  register(id: string, module: EffectModule): void;
}
declare global {
  var __angerReliefToyV1: RuntimeBridge | undefined;
}
