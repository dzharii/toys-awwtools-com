export interface SoundLayer {
  wave: "noise" | "sine" | "triangle" | "square";
  frequency: number;
  endFrequency?: number;
  duration: number;
  gain: number;
  attack?: number;
  delay?: number;
  cutoff?: number;
}
export interface SoundCue {
  layers: SoundLayer[];
}
export type AudioProfile = Record<string, SoundCue>;
export interface SoundParameters {
  delay?: number;
  strength?: number;
  pitch?: number;
  pan?: number;
}
export interface EffectAudio {
  /** Named feature-local cue. Delay is in seconds, scheduled against AudioContext.currentTime. */
  play(event: string, parameters?: SoundParameters): void;
  stop(): void;
}
export interface AudioPreferences {
  muted: boolean;
  volume: number;
  effects: boolean;
  navigation: boolean;
}
