import { describe, expect, test } from "bun:test";
import { VoiceFeatureExtractor } from "../../src/js/audio/voice-features.js";

const timeFrame = (amplitude, size = 2048) => {
  const values = new Uint8Array(size);
  for (let index = 0; index < size; index += 1) values[index] = Math.round(128 + Math.sin(index * 0.13) * amplitude * 127);
  return values;
};

const spectrumFrame = (amount, size = 1024) => {
  const values = new Uint8Array(size);
  for (let index = 0; index < size; index += 1) values[index] = index < 320 ? Math.round(amount * 255 * Math.exp(-index / 520)) : 0;
  return values;
};

describe("VoiceFeatureExtractor", () => {
  test("separates an isolated impulse, sustained activity, and long silence", () => {
    const extractor = new VoiceFeatureExtractor();
    let now = 0;
    for (let index = 0; index < 60; index += 1) {
      now += 16;
      extractor.update(timeFrame(0), spectrumFrame(0), now);
    }
    const idle = extractor.snapshot();
    expect(idle.envelope).toBeLessThan(0.03);

    now += 16;
    extractor.update(timeFrame(0.75), spectrumFrame(0.8), now);
    now += 16;
    const burst = extractor.update(timeFrame(0.75), spectrumFrame(0.9), now);
    expect(burst.envelope).toBeGreaterThan(0.15);
    expect(burst.impulse).toBeGreaterThan(0.05);

    const burstPhrase = burst.phraseActivity;
    for (let index = 0; index < 30; index += 1) {
      now += 16;
      extractor.update(timeFrame(0), spectrumFrame(0), now);
    }
    const shortPause = extractor.snapshot();
    expect(shortPause.phraseActivity).toBeGreaterThan(burstPhrase * 0.7);
    expect(shortPause.silenceMs).toBeLessThan(500);

    for (let index = 0; index < 180; index += 1) {
      now += 16;
      extractor.update(timeFrame(0.33), spectrumFrame(0.48), now);
    }
    const sustained = extractor.snapshot();
    expect(sustained.phraseActivity).toBeGreaterThan(0.45);
    expect(sustained.silenceMs).toBeLessThan(40);

    for (let index = 0; index < 150; index += 1) {
      now += 16;
      extractor.update(timeFrame(0), spectrumFrame(0), now);
    }
    const quiet = extractor.snapshot();
    // Envelope release intentionally preserves the phrase for roughly a second.
    expect(quiet.silenceMs).toBeGreaterThan(1000);
    expect(quiet.envelope).toBeLessThan(sustained.envelope);
    expect(quiet.phraseActivity).toBeLessThan(sustained.phraseActivity);
  });

  test("provides distinct semantic frequency bands", () => {
    const extractor = new VoiceFeatureExtractor();
    const spectrum = new Uint8Array(1024);
    spectrum.fill(210, 5, 13);
    const features = extractor.update(timeFrame(0.35), spectrum, 16);
    expect(features.low).toBeGreaterThan(features.high);
  });
});
