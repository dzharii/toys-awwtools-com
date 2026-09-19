export const FIELD_SHADER = /* wgsl */ `
struct Uniforms {
  resolutionTime: vec4f,
  audio: vec4f,
  voice: vec4f,
  excitation: vec4f,
  controlsA: vec4f,
  controlsB: vec4f,
  fromColor0: vec4f,
  fromColor1: vec4f,
  fromColor2: vec4f,
  fromBackground: vec4f,
  toColor0: vec4f,
  toColor1: vec4f,
  toColor2: vec4f,
  toBackground: vec4f,
  impulses: array<vec4f, 8>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

fn hash21(point: vec2f) -> f32 {
  return fract(sin(dot(point, vec2f(127.1, 311.7))) * 43758.5453123);
}

fn noise2(point: vec2f) -> f32 {
  let cell = floor(point);
  let local = fract(point);
  let curve = local * local * (3.0 - 2.0 * local);
  let a = hash21(cell);
  let b = hash21(cell + vec2f(1.0, 0.0));
  let c = hash21(cell + vec2f(0.0, 1.0));
  let d = hash21(cell + vec2f(1.0, 1.0));
  return mix(mix(a, b, curve.x), mix(c, d, curve.x), curve.y);
}

fn fbm(point: vec2f) -> f32 {
  var value = 0.0;
  var amplitude = 0.52;
  var p = point;
  for (var index: i32 = 0; index < 5; index = index + 1) {
    value = value + noise2(p) * amplitude;
    p = mat2x2f(1.61, 1.18, -1.18, 1.61) * p + vec2f(0.17, 0.31);
    amplitude = amplitude * 0.5;
  }
  return value;
}

fn palette(value: f32, color0: vec3f, color1: vec3f, color2: vec3f) -> vec3f {
  let first = mix(color0, color1, smoothstep(0.05, 0.62, value));
  return mix(first, color2, smoothstep(0.56, 1.0, value));
}

fn motionRate() -> f32 {
  let activeMotion = uniforms.controlsA.y * (0.55 + uniforms.audio.x * 0.75);
  let silentMotion = uniforms.controlsB.y * (1.0 - uniforms.audio.x) * 0.75;
  return activeMotion + silentMotion;
}

fn stagePoint(position: vec2f, aspect: f32) -> vec2f {
  var point = position * 2.0 - 1.0;
  if (aspect >= 1.0) {
    point.x = point.x * aspect;
  } else {
    point.y = point.y / aspect;
  }
  return point;
}

fn impulseField(point: vec2f, aspect: f32) -> f32 {
  var field = 0.0;
  for (var index: i32 = 0; index < 8; index = index + 1) {
    let impulse = uniforms.impulses[index];
    let origin = stagePoint(impulse.xy, aspect);
    let distance = length(point - origin);
    let age = impulse.z;
    let ring = sin(distance * 22.0 - age * 5.8) * exp(-distance * 2.7 - age * 0.58);
    field = field + ring * impulse.w;
  }
  let liveOrigin = stagePoint(uniforms.excitation.xy, aspect);
  let liveDistance = length(point - liveOrigin);
  let liveVoice = uniforms.audio.x * 0.22 + uniforms.audio.y * 0.5 + uniforms.voice.y * 0.18;
  field = field + sin(liveDistance * 18.0 - uniforms.resolutionTime.z * 4.0) * exp(-liveDistance * 4.2) * liveVoice * 0.58;
  return field;
}

fn dust(point: vec2f, time: f32, scale: f32) -> f32 {
  let cell = floor(point * scale + vec2f(time * 0.23, -time * 0.11));
  let local = fract(point * scale + vec2f(time * 0.23, -time * 0.11)) - 0.5;
  let seed = hash21(cell);
  let sparkle = smoothstep(0.075, 0.0, length(local)) * smoothstep(0.91, 0.995, seed);
  return sparkle * (0.55 + 0.45 * sin(time * 2.1 + seed * 19.0));
}

fn silk(point: vec2f, time: f32, color0: vec3f, color1: vec3f, color2: vec3f) -> vec3f {
  let energy = uniforms.controlsA.x;
  let motion = motionRate();
  let detail = uniforms.controlsA.z;
  let voiceInfluence = uniforms.controlsA.w;
  let phrase = uniforms.voice.y;
  let wave = impulseField(point, uniforms.resolutionTime.x / uniforms.resolutionTime.y) * voiceInfluence;
  let slowTime = time * (0.08 + motion * 0.25);
  var color = vec3f(0.0);
  var mass = 0.0;
  for (var index: i32 = 0; index < 6; index = index + 1) {
    let layer = f32(index);
    let offset = (layer - 2.5) * 0.115;
    let warp = (fbm(vec2f(point.x * 0.58 + layer * 2.8, slowTime + layer)) - 0.5) * (0.44 + detail * 0.24);
    let line = sin(point.x * (1.28 + layer * 0.065) + slowTime * (1.1 + layer * 0.08) + layer * 1.2) * (0.25 + energy * 0.13 + uniforms.audio.y * 0.12);
    let center = line + warp + offset + wave * (0.1 + layer * 0.018) + sin(point.x * 4.1 - time * 0.7 + layer) * uniforms.audio.z * 0.035;
    let distance = abs(point.y - center);
    let body = exp(-distance * (4.2 + detail * 2.5));
    let rim = exp(-distance * (20.0 + detail * 17.0));
    let tone = fract(layer * 0.24 + point.x * 0.07 + slowTime * 0.05);
    color = color + palette(tone, color0, color1, color2) * (body * 0.075 + rim * (0.32 + energy * 0.34));
    mass = mass + body;
  }
  let filament = pow(max(0.0, 1.0 - abs(sin((point.y + fbm(point * 1.8 + slowTime) * 0.3) * 18.0))), 10.0);
  color = color + palette(fbm(point * 0.6), color0, color1, color2) * filament * mass * 0.035 * detail;
  color = color + palette(hash21(floor(point * 60.0)), color0, color1, color2) * dust(point, time, 64.0 + detail * 35.0) * (0.16 + phrase * 0.4);
  return color * (0.64 + energy * 0.68);
}

fn membrane(point: vec2f, time: f32, color0: vec3f, color1: vec3f, color2: vec3f) -> vec3f {
  let energy = uniforms.controlsA.x;
  let motion = motionRate();
  let detail = uniforms.controlsA.z;
  let wave = impulseField(point, uniforms.resolutionTime.x / uniforms.resolutionTime.y) * uniforms.controlsA.w;
  let t = time * (0.11 + motion * 0.2);
  let broad = sin(point.x * 1.8 + t) * (0.26 + uniforms.audio.y * 0.12) + sin(point.x * 0.72 - t * 1.3) * 0.18;
  let height = broad + (fbm(point * vec2f(0.7, 1.4) + vec2f(t, -t * 0.3)) - 0.5) * (0.38 + uniforms.audio.z * 0.08) + wave * 0.23;
  let distance = abs(point.y - height);
  let body = exp(-distance * 3.4);
  let skin = exp(-distance * (15.0 + detail * 11.0));
  let tension = pow(abs(sin((distance - wave * 0.04) * (23.0 + detail * 16.0))), 18.0) * body;
  let radial = abs(sin(length(point - stagePoint(uniforms.excitation.xy, uniforms.resolutionTime.x / uniforms.resolutionTime.y)) * 19.0 - time * 2.0));
  let pressure = pow(radial, 24.0) * exp(-length(point) * 0.75) * (0.1 + uniforms.audio.x);
  var color = palette(0.22 + body * 0.7, color0, color1, color2) * body * 0.12;
  color = color + mix(color0, color2, fbm(point + t)) * skin * (0.48 + energy * 0.55);
  color = color + color0 * (tension * 0.23 + pressure * 0.25);
  color = color + color1 * dust(point, time, 72.0) * (0.08 + uniforms.audio.w * 0.3);
  return color;
}

fn liquid(point: vec2f, time: f32, color0: vec3f, color1: vec3f, color2: vec3f) -> vec3f {
  let energy = uniforms.controlsA.x;
  let motion = motionRate();
  let detail = uniforms.controlsA.z;
  let wave = impulseField(point, uniforms.resolutionTime.x / uniforms.resolutionTime.y) * uniforms.controlsA.w;
  let t = time * (0.12 + motion * 0.28);
  let currents = sin(point.x * 1.45 + t) * (0.19 + uniforms.audio.y * 0.14) + sin(point.x * 3.1 - t * 1.35) * (0.075 + uniforms.audio.z * 0.045);
  let surfaceHeight = 0.12 + currents + (fbm(vec2f(point.x * 0.72 + t, point.y * 0.58 - t * 0.4)) - 0.5) * 0.38 + wave * 0.2;
  let depth = point.y - surfaceHeight;
  let surface = exp(-abs(depth) * 6.0);
  let below = smoothstep(0.85, -0.35, depth);
  let flow = fbm(point * vec2f(1.2 + uniforms.audio.z * 0.25, 2.5) + vec2f(-t * 0.8, t * 0.35));
  let ridges = pow(1.0 - abs(sin((flow + point.y * 0.25 + wave * 0.12) * (17.0 + detail * 17.0))), 11.0);
  let caustic = ridges * below * (0.1 + surface * 0.9);
  var color = mix(color2 * 0.055, color1 * 0.19, below);
  color = color + palette(flow, color2, color1, color0) * caustic * (0.4 + energy * 0.7);
  color = color + color0 * surface * (0.27 + energy * 0.38);
  color = color + color1 * dust(point, time, 92.0) * below * (0.05 + uniforms.audio.w * 0.24);
  return color;
}

fn chrome(point: vec2f, time: f32, color0: vec3f, color1: vec3f, color2: vec3f) -> vec3f {
  let energy = uniforms.controlsA.x;
  let motion = motionRate();
  let detail = uniforms.controlsA.z;
  let wave = impulseField(point, uniforms.resolutionTime.x / uniforms.resolutionTime.y) * uniforms.controlsA.w;
  let t = time * (0.09 + motion * 0.22);
  let warped = point + vec2f(fbm(point * 0.9 + t) - 0.5, fbm(point * 1.15 - t * 0.6) - 0.5) * (0.36 + wave * 0.12 + uniforms.audio.y * 0.11);
  let metal = fbm(warped * vec2f(1.45, 2.8) + vec2f(t, -t * 0.35));
  let bands = 0.5 + 0.5 * sin((metal + warped.y * 0.32 + wave * 0.18) * (21.0 + detail * 22.0 + uniforms.audio.z * 5.0));
  let specular = pow(bands, 15.0 - energy * 5.0);
  let reflection = smoothstep(0.18, 0.88, bands);
  let basin = exp(-abs(warped.y - sin(warped.x * 1.3 + t) * 0.22) * 2.7);
  var color = mix(vec3f(0.006, 0.009, 0.018), color1 * 0.12, reflection);
  color = color + mix(color2, color0, bands) * specular * (0.9 + energy * 0.8) * basin;
  color = color + color0 * pow(reflection, 7.0) * 0.22;
  color = color + color2 * dust(point, time, 84.0) * uniforms.audio.w * 0.28;
  return color;
}

fn nebula(point: vec2f, time: f32, color0: vec3f, color1: vec3f, color2: vec3f) -> vec3f {
  let energy = uniforms.controlsA.x;
  let motion = motionRate();
  let detail = uniforms.controlsA.z;
  let wave = impulseField(point, uniforms.resolutionTime.x / uniforms.resolutionTime.y) * uniforms.controlsA.w;
  let t = time * (0.025 + motion * 0.09);
  let warpA = fbm(point * 0.7 + vec2f(t, -t * 0.7));
  let warpB = fbm(point * (1.25 + uniforms.audio.z * 0.18) + vec2f(warpA * 2.1, t));
  let cloud = fbm(point * (1.15 + detail * 0.52) + vec2f(warpB * 1.4, warpA * 0.8));
  let ribbon = exp(-abs(point.y - sin(point.x * 0.88 + t * 4.0) * (0.34 + uniforms.audio.y * 0.1) - (warpA - 0.5) * 0.62 - wave * 0.16) * 2.65);
  let density = smoothstep(0.36, 0.78, cloud + ribbon * 0.26);
  let filament = pow(smoothstep(0.42, 0.72, cloud), 3.0) * pow(1.0 - abs(sin((cloud + warpB) * 25.0)), 7.0);
  var color = palette(cloud + wave * 0.06, color0, color1, color2) * density * ribbon * (0.25 + energy * 0.62);
  color = color + mix(color0, color2, warpB) * filament * (0.35 + detail * 0.42);
  color = color + palette(hash21(floor(point * 80.0)), color0, color1, color2) * dust(point, time * 0.35, 110.0) * (0.32 + uniforms.audio.w * 0.4);
  return color;
}

fn particles(point: vec2f, time: f32, color0: vec3f, color1: vec3f, color2: vec3f) -> vec3f {
  let energy = uniforms.controlsA.x;
  let motion = motionRate();
  let detail = uniforms.controlsA.z;
  let voiceAmount = uniforms.audio.x * uniforms.controlsA.w;
  let t = time * (0.1 + motion * 0.35);
  let wave = impulseField(point, uniforms.resolutionTime.x / uniforms.resolutionTime.y);
  var color = vec3f(0.0);
  for (var layer: i32 = 0; layer < 4; layer = layer + 1) {
    let fi = f32(layer);
    let scale = 17.0 + fi * 11.0 + detail * 8.0 + uniforms.audio.w * 5.0;
    let flow = vec2f(sin(point.y * 1.7 + t + fi), cos(point.x * 1.3 - t * 0.7 + fi)) * (0.2 + voiceAmount * 0.12 + uniforms.audio.z * 0.08);
    let gridPoint = (point + flow + wave * 0.018) * scale;
    let cell = floor(gridPoint);
    let local = fract(gridPoint) - 0.5;
    let seed = hash21(cell + fi * 17.0);
    let orbit = vec2f(sin(seed * 31.0 + t * (0.6 + fi * 0.1)), cos(seed * 23.0 - t * 0.8)) * 0.24;
    let particle = smoothstep(0.075 + voiceAmount * 0.02, 0.0, length(local - orbit)) * smoothstep(0.58, 0.98, seed);
    let stream = exp(-abs(point.y - sin(point.x * (0.8 + fi * 0.12) + t + fi) * (0.28 + fi * 0.05)) * 1.7);
    color = color + palette(seed, color0, color1, color2) * particle * stream * (0.4 + energy * 0.65);
  }
  let connective = pow(1.0 - abs(sin((fbm(point * 1.5 + t * 0.2) + point.y * 0.2) * 18.0)), 15.0);
  color = color + color1 * connective * 0.08 * (0.4 + voiceAmount);
  return color;
}

fn ember(point: vec2f, time: f32, color0: vec3f, color1: vec3f, color2: vec3f) -> vec3f {
  let energy = uniforms.controlsA.x;
  let motion = motionRate();
  let detail = uniforms.controlsA.z;
  let voiceAmount = uniforms.audio.x * uniforms.controlsA.w;
  let wave = impulseField(point, uniforms.resolutionTime.x / uniforms.resolutionTime.y);
  let t = time * (0.09 + motion * 0.26);
  let smoke = fbm(point * vec2f(0.8, 1.5) + vec2f(t, -t * 0.9));
  let center = sin(point.x * 1.42 + t) * (0.24 + uniforms.audio.y * 0.12) + (smoke - 0.5) * (0.45 + uniforms.audio.z * 0.08) + wave * 0.18;
  let distance = abs(point.y - center);
  let body = exp(-distance * 4.0);
  let heat = exp(-distance * (18.0 + detail * 17.0));
  let ridges = pow(1.0 - abs(sin((smoke + point.x * 0.1) * (19.0 + detail * 15.0))), 12.0) * body;
  var color = color2 * smoke * body * 0.14;
  color = color + mix(color1, color0, heat) * heat * (0.56 + energy * 0.58);
  color = color + color1 * ridges * 0.22;
  let sparks = dust(point + vec2f(0.0, time * 0.055), time * 2.0, 92.0 + detail * 35.0);
  color = color + mix(color2, color0, hash21(floor(point * 90.0))) * sparks * (0.34 + voiceAmount * 0.75);
  color = color + color2 * smoothstep(0.3, 0.85, smoke) * 0.025;
  return color;
}

fn scene(style: i32, point: vec2f, time: f32, color0: vec3f, color1: vec3f, color2: vec3f) -> vec3f {
  if (style == 0) { return silk(point, time, color0, color1, color2); }
  if (style == 1) { return membrane(point, time, color0, color1, color2); }
  if (style == 2) { return liquid(point, time, color0, color1, color2); }
  if (style == 3) { return chrome(point, time, color0, color1, color2); }
  if (style == 4) { return nebula(point, time, color0, color1, color2); }
  if (style == 5) { return particles(point, time, color0, color1, color2); }
  return ember(point, time, color0, color1, color2);
}

fn transitionBridge(point: vec2f, time: f32, color0: vec3f, color1: vec3f, color2: vec3f) -> vec3f {
  let flow = fbm(point * 0.95 + vec2f(time * 0.05, -time * 0.03));
  let contours = pow(1.0 - abs(sin((flow + length(point) * 0.08) * 18.0)), 11.0);
  let ribbon = exp(-abs(point.y - sin(point.x * 1.1 + time * 0.16) * 0.28 - (flow - 0.5) * 0.45) * 2.9);
  return palette(flow, color0, color1, color2) * contours * ribbon * (0.18 + uniforms.controlsA.x * 0.35);
}

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
  let x = f32((vertexIndex << 1u) & 2u);
  let y = f32(vertexIndex & 2u);
  return vec4f(x * 2.0 - 1.0, 1.0 - y * 2.0, 0.0, 1.0);
}

@fragment
fn fragmentMain(@builtin(position) coordinate: vec4f) -> @location(0) vec4f {
  let resolution = uniforms.resolutionTime.xy;
  let uv = coordinate.xy / resolution;
  let aspect = resolution.x / resolution.y;
  let point = stagePoint(uv, aspect);
  let time = uniforms.resolutionTime.z;
  let progress = uniforms.voice.w;
  let color0 = mix(uniforms.fromColor0.rgb, uniforms.toColor0.rgb, progress);
  let color1 = mix(uniforms.fromColor1.rgb, uniforms.toColor1.rgb, progress);
  let color2 = mix(uniforms.fromColor2.rgb, uniforms.toColor2.rgb, progress);
  let background = mix(uniforms.fromBackground.rgb, uniforms.toBackground.rgb, progress);
  let fromStyle = i32(round(uniforms.controlsB.z));
  let toStyle = i32(round(uniforms.controlsB.w));
  var field: vec3f;
  if (fromStyle == toStyle || progress >= 0.999) {
    field = scene(toStyle, point, time, color0, color1, color2);
  } else {
    let outgoing = scene(fromStyle, point, time, color0, color1, color2);
    let incoming = scene(toStyle, point, time, color0, color1, color2);
    let bridge = transitionBridge(point, time, color0, color1, color2);
    let dissolve = smoothstep(0.0, 0.52, progress);
    let emerge = smoothstep(0.48, 1.0, progress);
    field = mix(outgoing, bridge, dissolve);
    field = mix(field, incoming, emerge);
  }
  let radial = length((uv - 0.5) * vec2f(0.9, 1.0));
  let vignette = 1.0 - smoothstep(0.28, 0.78, radial) * 0.7;
  let breathing = 0.94 + sin(time * (0.16 + uniforms.controlsA.y * 0.18)) * uniforms.controlsB.y * 0.06;
  let phraseLift = 1.0 + uniforms.voice.y * (0.12 + uniforms.controlsA.w * 0.2);
  var color = background + field * vignette * breathing * phraseLift;
  color = color + background * fbm(point * 0.4 + time * 0.01) * 0.16;
  color = vec3f(1.0) - exp(-color * (1.1 + uniforms.controlsA.x * 0.8));
  color = pow(max(color, vec3f(0.0)), vec3f(0.83));
  return vec4f(color, 1.0);
}
`;
