export const CONFIG = {
  storageKey: "magnetic-reservoir-items-v1",
  muteKey: "magnetic-reservoir-muted-v1",
  statusDurationMs: 2200,
  maxPersistedItems: 120,
  maxVisibleItems: 28,
  maxDpr: 2,
  targetFpsFloor: 40,
  qualityFallbackScale: 0.82,
  portraitBreakpointRatio: 0.88,
  viewportMargin: 10,
  ui: {
    hintDimMs: 6000,
    hintHideMs: 14000,
    pasteFallbackPointDesktop: { x: 0.5, y: 0.34 },
    pasteFallbackPointPortrait: { x: 0.5, y: 0.24 },
  },
  vessel: {
    desktopInset: 18,
    mobileInsetX: 16,
    mobileInsetY: 14,
    rimOuter: 32,
    rimInner: 18,
    throatDepth: 44,
    throatSoftness: 28,
    tokenSafeInset: 0.065,
  },
  simulation: {
    baseCols: 98,
    baseRows: 98,
    portraitCols: 68,
    portraitRows: 112,
    damping: 0.972,
    spring: 0.021,
    neighborCoupling: 0.242,
    idleAmplitude: 0.014,
    idleAmplitudeReduced: 0.005,
    idleScale: 0.78,
    idleSpeedA: 0.00017,
    idleSpeedB: 0.00011,
    pointerRadius: 0.095,
    pointerStrength: 0.065,
    pointerLag: 0.1,
    dragGlowStrength: 0.035,
    impactRadius: 0.055,
    impactStrength: 0.82,
    pasteStrength: 0.68,
    impactCenterDepth: 1.1,
    impactRingStrength: 0.72,
    impactRingPosition: 0.68,
    impactRingWidth: 0.18,
    solverPasses: 2,
    blurSampleStride: 2,
    activityDecay: 0.985,
  },
  shading: {
    ambientDarkness: 0.18,
    baseAlpha: 0.98,
    highlightStrength: 0.68,
    slopeLightStrength: 0.54,
    emissiveStrength: 0.17,
    bloomStrength: 0.13,
    vignetteStrength: 0.26,
    palette: {
      peak: [255, 82, 193],
      mid: [203, 30, 143],
      valley: [56, 8, 43],
      deep: [12, 3, 16],
      electric: [255, 138, 222],
    },
    stone: {
      outerA: "#463a3d",
      outerB: "#2e2629",
      topA: "#6e615d",
      topB: "#403733",
      lipA: "#2a2327",
      lipB: "#130f14",
      throatA: "rgba(23, 15, 21, 0.80)",
      throatB: "rgba(4, 3, 6, 0.98)",
      seam: "rgba(255, 239, 225, 0.04)",
      dust: "rgba(255, 245, 240, 0.03)",
      moss: "rgba(81, 71, 63, 0.05)",
    },
  },
  tokens: {
    baseRadius: 34,
    maxLabelChars: 28,
    driftSpeed: 0.000015,
    bobAmplitude: 0.004,
    hoverLift: 0.012,
    clickSurfaceBias: 0.32,
    readableThreshold: 0.86,
    visibleThreshold: 0.985,
    plaqueColors: {
      face: "#24161f",
      face2: "#160e14",
      edge: "rgba(255, 232, 244, 0.16)",
      text: "rgba(255, 238, 247, 0.94)",
      textDeep: "rgba(255, 214, 235, 0.55)",
      glow: "rgba(255, 92, 201, 0.12)",
      hoverGlow: "rgba(255, 124, 214, 0.28)",
    },
  },
  sink: {
    mostlyFloatingMs: 45 * 60 * 1000,
    noticeableSubmergeMs: 6 * 60 * 60 * 1000,
    mostlyLostMs: 24 * 60 * 60 * 1000,
  },
  audio: {
    masterGain: 0.045,
    ambientGain: 0.026,
    noiseGain: 0.014,
    impactGain: 0.095,
    hoverGain: 0.003,
  },
};

export function getReducedMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

