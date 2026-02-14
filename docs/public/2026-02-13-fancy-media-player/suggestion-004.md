2026-02-13
A00 Oscillogram visualization feature specification (rev 00)

This document specifies a high-performance canvas visualization feature for 2026-02-13-fancy-media-player. The visualization is an audio oscillogram and spectrum view rendered in real time while audio plays, designed to be both aesthetically “digital” and functionally informative. The visualization must fit the dense, professional UI: it is not decorative wallpaper, it is a live signal instrument that communicates dynamics, energy distribution, and playback position at a glance.

The visualization must be implemented using a single HTML canvas element in the player pane and driven by the Web Audio API AnalyserNode connected to the active media element. Rendering must use requestAnimationFrame and must remain responsive under continuous playback, including during background indexing. The visualization must not introduce UI thread stalls; it must degrade gracefully on low-end devices by reducing draw complexity rather than dropping interaction responsiveness.

B00 User value and informational goals (rev 00)

B01 What the visualization should communicate

The visualization must provide the following information while playing, without requiring the user to interpret complex graphs:

Overall loudness trend: whether the current passage is quiet or loud relative to recent history.

Transient activity: presence of sharp peaks (drums, clicks, percussive content) versus smooth sustained content.

Spectral balance: whether the energy is mostly low-frequency (bass-heavy), mid-frequency (vocals, guitars), or high-frequency (hi-hats, noise).

Temporal structure: rhythmic patterns and section changes visible as repeating shapes or shifts.

Playback progress: current position through the track, in a way that is visible even when the seek bar is not being watched.

B02 What the visualization must not do

It must not attempt to be a full DAW waveform editor. It must not support waveform zooming, region selection, or editing in rev 00. It must not display multiple channels separately unless the implementer can do so without additional complexity; rev 00 defaults to a single combined view.

C00 Visual design concept (rev 00)

C01 Overall composition

The canvas must be divided into three horizontal bands rendered within one canvas to minimize layout overhead and maximize GPU-friendly drawing:

Top band: “Macro envelope” history strip. A scrolling history of recent amplitude/energy over the last 10-20 seconds, rendered as a thin, pixel-dense line or filled shape.

Middle band: “Live oscillogram” (time-domain waveform) centered around a midline, showing the current buffer of samples. This is the most recognizable “how it looks” representation and supports quick sanity checks (clipping, silence, steady tone).

Bottom band: “Live spectrum columns” (frequency-domain bars) showing the current frequency energy distribution. This supports quick detection of bass-heavy vs bright content.

These bands must share a consistent “digital” aesthetic: crisp geometry, restrained glow, and a neutral background. The design must be stable and non-distracting: no rapid flashing, no heavy gradients, no particle effects.

C02 Digital aesthetic rules

The aesthetic must be achieved through geometry and motion rather than decorative elements. The following rules apply:

Use straight lines and rectangular columns for spectrum bars. Avoid rounded bars by default.

Use a thin grid overlay (optional) to provide scale and stability. The grid must be subtle and must not dominate.

Use a limited visual palette: background plus one primary signal color and one accent for peaks/clipping. The palette must be consistent across bands.

Motion smoothing must exist but must not erase transients. The view should feel smooth to the eye but still reflect quick changes.

C03 Informative overlays

The visualization must include minimal overlays that provide real information:

A vertical “playhead” line at the current time position across all three bands.

A peak indicator: mark recent peak amplitudes in the oscillogram and/or envelope strip.

A clipping indicator: if the waveform approaches full-scale repeatedly, show a subtle warning glyph or color shift. Clipping detection is approximate (based on near-maximum sample values) and does not require true decoder headroom analysis.

Optional: a spectral centroid indicator (a small dot or line) that moves left-right across the spectrum band showing “brightness.” This is informative with minimal complexity.

D00 Data sources and signal processing (rev 00)

D01 Web Audio graph

The active media element must be connected as a MediaElementAudioSourceNode to an AnalyserNode, then to destination. A GainNode may be included if needed for future features, but it is optional in rev 00.

The analyser must be configured with:

fftSize: 2048 by default (provides sufficient frequency resolution without excessive cost).

smoothingTimeConstant: 0.7 by default for spectrum smoothing. For oscillogram, smoothing is not applied by the analyser; smoothing is applied in rendering.

The implementation must use:

getByteTimeDomainData for the oscillogram band.

getByteFrequencyData for the spectrum band.

D02 Derived metrics

The visualization must compute lightweight derived metrics per frame for informational overlays:

RMS (root mean square) over the time-domain buffer as a proxy for loudness. Use byte samples mapped to [-1,1].

Peak amplitude over the buffer as a proxy for transient intensity.

Optional spectral centroid approximation using the frequency bin magnitudes.

These metrics must be computed in O(n) per frame and must not allocate new arrays each frame. Use preallocated typed arrays.

D03 Macro envelope history buffer

The top band requires a history buffer that tracks recent RMS or peak values over time. Implement as a fixed-size ring buffer where each entry corresponds to a frame sample of RMS. The buffer length must represent 10-20 seconds of history depending on canvas width and frame rate. It must be decoupled from actual frame rate to remain stable: sample RMS at a fixed cadence (for example 30 Hz) rather than every rAF callback.

E00 Rendering behavior and performance (rev 00)

E01 Canvas sizing and scaling

The canvas must fill the visualization region and must handle resizing. It must account for devicePixelRatio and scale internal drawing accordingly to avoid blur. Resizing must not cause repeated expensive reallocation; it may reinitialize buffers only when dimensions change.

E02 Frame rate control

Rendering uses requestAnimationFrame. The visualization must implement an internal frame limiter targeting 60 fps by default. On slow devices, if the render loop cannot sustain 60 fps, it must reduce draw complexity in this order:

Reduce spectrum bar count (downsample frequency bins).

Reduce oscillogram sample count (skip samples).

Disable grid overlay.

Shorten envelope band detail.

The limiter must preserve UI responsiveness; it is acceptable for the visualization to become less detailed rather than causing input lag.

E03 No per-frame allocations

The render loop must not allocate arrays, objects, or strings per frame. Preallocate typed arrays for time domain and frequency domain. Precompute x-coordinate lookup tables if needed for consistent spacing.

E04 Background behavior

If the media is paused, the oscillogram and spectrum must freeze on the last frame, and the macro envelope may continue to show the last state without scrolling. If the tab is backgrounded, the browser will naturally throttle rAF; the app must not attempt to keep updating by timers.

F00 Band-by-band detailed visual specification (rev 00)

F01 Top band: Macro envelope history

Purpose: show dynamics over recent time, making it easy to see “quiet then loud” transitions and to anticipate upcoming sections when scrubbing.

Appearance:

A thin filled area or polyline drawn across the width, representing RMS values from the ring buffer.

The shape must scroll left as time advances, with new samples appearing at the right edge.

A subtle baseline at the bottom of the band gives context.

Informative cues:

Peaks above a threshold must be marked with a small tick or brighter segment.

If clipping is detected (peak > 0.98 on normalized scale for several frames), mark the right edge with a small red-ish accent line.

Interaction link:

The playhead line must extend through this band. When the user scrubs via the seek bar, the playhead jumps immediately; the envelope history may reset or may continue from that point. Rev 00 rule: on seeking, clear the history buffer and refill from new playback to avoid misleading history from a different section.

F02 Middle band: Live oscillogram

Purpose: show the immediate waveform shape, detect silence, distortion, clipping, and transient patterns.

Appearance:

A central horizontal midline.

A waveform line drawn as a polyline from left to right using the current time-domain samples.

The waveform must be symmetrical around the midline. Values map from [0,255] to [-1,1] and then to vertical displacement.

Smoothing:

Apply light temporal smoothing to reduce jitter without hiding peaks. Rev 00 rule: use simple exponential smoothing on the y value per x sample or smooth the input by averaging small windows (for example 2-4 samples). The smoothing must not exceed a window of 4 samples to preserve transients.

Informative cues:

Show a peak hold line: the maximum absolute amplitude observed in the last 0.5 seconds as a faint horizontal marker above and below midline.

If near-clipping is detected, color the waveform segments near the extremes with the accent warning color.

Optional stereo hint:

If the implementer can obtain separate channels by decoding (costly), that is out of scope. Rev 00 displays a combined waveform only.

F03 Bottom band: Live spectrum columns

Purpose: show frequency energy distribution with “digital” clarity.

Appearance:

Rectangular bars spanning from the bottom of the band upward.

Bar count must be limited for readability and performance. Rev 00 default is 96 bars (or fewer on small screens).

Frequency scaling:

Use a pseudo-log mapping: allocate more bars to low frequencies where human perception is more sensitive. Implement by mapping bar index to frequency bin index using a power curve, not true log, to avoid complexity.

Smoothing:

Use analyser.smoothingTimeConstant for frequency data plus optional peak-hold smoothing in rendering. Rev 00 requires a peak hold per bar for the last 0.3 seconds drawn as a small cap line.

Informative cues:

Display a centroid marker: compute the weighted average bin index and draw a small dot or vertical line at that x position. This gives the user an immediate “bright vs dark” sense.

Clipping link:

If clipping is detected in the oscillogram, add a subtle global accent on the spectrum band border to indicate “signal saturated.”

G00 Interaction tie-ins (rev 00)

G01 Hover and focus behavior

Hovering over the visualization must not trigger tooltips by default. The visualization is a live instrument; tooltips add distraction. The only permitted hover effect is a subtle emphasis of the playhead line.

G02 Clicking the visualization

Click-to-seek on the visualization is optional. If implemented, the behavior is deterministic: clicking x percent across the canvas seeks to x percent of track duration. If duration is unknown, clicking does nothing. If click-to-seek is implemented, it must be discoverable via cursor change on hover.

Rev 00 default: do not implement click-to-seek; rely on the seek bar to avoid accidental jumps.

G03 Sync with playback state

The visualization must start animating when playback starts and stop animating when playback stops. On pause, it freezes. On track change, it resets internal buffers (history ring, peak holds) to avoid mixing signals between tracks.

H00 Implementation hints and reference skeleton (rev 00)

H01 Setup skeleton

```js id="l9m0on"
let audioCtx;
let analyser;
let timeData;
let freqData;

function initAudioGraph(mediaEl) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.7;

  const src = audioCtx.createMediaElementSource(mediaEl);
  src.connect(analyser);
  analyser.connect(audioCtx.destination);

  timeData = new Uint8Array(analyser.fftSize);
  freqData = new Uint8Array(analyser.frequencyBinCount);
}

function readAnalyser() {
  analyser.getByteTimeDomainData(timeData);
  analyser.getByteFrequencyData(freqData);
}
```

H02 Metrics extraction sketch

```js id="4l9c8n"
function computeMetrics(timeData) {
  let sumSq = 0;
  let peak = 0;

  for (let i = 0; i < timeData.length; i++) {
    const v = (timeData[i] - 128) / 128;
    const av = Math.abs(v);
    if (av > peak) peak = av;
    sumSq += v * v;
  }
  const rms = Math.sqrt(sumSq / timeData.length);
  return { rms, peak, clipped: peak > 0.98 };
}
```

H03 Draw complexity controls

The renderer must support configurable resolution parameters:

oscSamplesToDraw: number of time samples to use (subsample if larger than canvas width).

spectrumBars: number of bars to draw (downsample frequency bins).

gridEnabled: boolean.

These values are adjusted dynamically by the performance limiter as described in E02.

I00 Acceptance criteria for visualization (rev 00)

The visualization must render smoothly during playback without making scrolling or clicking in the playlist feel laggy.

The visualization must convey dynamics changes clearly: quiet passages produce visibly smaller envelope and waveform amplitude; loud passages produce larger ones.

The visualization must convey spectral balance clearly: bass-heavy content yields taller bars toward the left; bright content yields taller bars toward the right; centroid marker shifts accordingly.

The visualization must reset cleanly on track change and must not show stale history from the previous track.

The visualization must remain consistent with playback state: it animates only while playing, freezes on pause, and stops on stop/end.
