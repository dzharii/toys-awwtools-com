import type { AudioProfile } from "../sdk/audio-types";
/** Quiet tactile navigation palette; invocation cancellation never owns this scope. */
export const dialAudio: AudioProfile = {
  tick: {
    layers: [
      { wave: "noise", frequency: 600, duration: 0.016, gain: 0.025, cutoff: 1700 },
      { wave: "triangle", frequency: 900, endFrequency: 550, duration: 0.025, gain: 0.012 },
    ],
  },
  select: {
    layers: [{ wave: "triangle", frequency: 500, endFrequency: 760, duration: 0.065, gain: 0.035 }],
  },
};
