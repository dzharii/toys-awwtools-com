# STS Language Reference (language.md)

## 1. Introduction to STS

STS (Syllabics Transformation Script) is a symbolic transformation language used by this project to control a digital rain renderer. The interpreter maps glyphs and optional numeric selector literals to a target render state, then the renderer eases toward that state.

## 2. Lexical Rules

- Source is UTF-8 text.
- Whitespace is ignored.
- A line whose first non-space character is `#` is a comment.
- Unknown glyphs/tokens are allowed and produce warnings; they do not stop evaluation.
- v2 numeric literals use ASCII selectors + digits + `=` commit (for example `S250=`).
- v3 grouping uses `(` and `)` with optional postfix repeat count (`(ᐊᐅ)3`).
- v3 macros use `@name = sequence` and invocation via `$name`.

## 3. Core Glyph Reference Table (Required)

| Glyph | Unicode code point | Operator name | Category | Exact parameter effect | Bounds and scaling rules | Smoothing constant | Notes and examples |
|---|---|---|---|---|---|---|---|
| ᐊ | U+140A | SpeedUp | motion | +0.12 speed | [0.2,6.0] | k=8 | Increase fall speed |
| ᐃ | U+1403 | SpeedDown | motion | -0.12 speed | [0.2,6.0] | k=8 | Decrease fall speed |
| ᐅ | U+1405 | RotateCW | motion | +0.09 rad angle | wrapped | k=4 | Rotate flow clockwise |
| ᐁ | U+1401 | RotateCCW | motion | -0.09 rad angle | wrapped | k=4 | Rotate flow counterclockwise |
| ᒋ | U+148B | DriftUp | motion | +0.08 drift | [0,2.0] | k=5 | Increase lateral drift strength |
| ᒍ | U+148D | DriftDown | motion | -0.08 drift | [0,2.0] | k=5 | Decrease lateral drift strength |
| ᐳ | U+1433 | FontUp | geometry | +1 fontPx | [10,72] | k=3 | Increase glyph size |
| ᐱ | U+1431 | FontDown | geometry | -1 fontPx | [10,72] | k=3 | Decrease glyph size |
| ᑲ | U+1472 | DensityUp | geometry | +0.08 density | [0.5,2.0] | k=3 | Increase stream density |
| ᑭ | U+146D | DensityDown | geometry | -0.08 density | [0.5,2.0] | k=3 | Decrease stream density |
| ᘁ | U+1601 | PerspectiveUp | geometry | +0.08 perspective | [0,1.5] | k=4 | Increase depth scaling |
| ᘂ | U+1602 | PerspectiveDown | geometry | -0.08 perspective | [0,1.5] | k=4 | Decrease depth scaling |
| ᕿ | U+157F | TrailLonger | trails | -0.006 fadeAlpha | [0.01,0.25] | k=7 | Longer trails |
| ᕼ | U+157C | TrailShorter | trails | +0.006 fadeAlpha | [0.01,0.25] | k=7 | Shorter trails |
| ᓯ | U+14EF | HueForward | color | +7.2 hueDeg | wrap 0..360 | k=5 | Shift hue forward |
| ᓴ | U+14F4 | HueBackward | color | -7.2 hueDeg | wrap 0..360 | k=5 | Shift hue backward |
| ᔭ | U+152D | SaturationUp | color | +3 saturation | [30,100] | k=5 | Increase saturation |
| ᔪ | U+152A | SaturationDown | color | -3 saturation | [30,100] | k=5 | Decrease saturation |
| ᓓ | U+14D3 | LightnessUp | color | +2 lightness | [20,85] | k=5 | Increase lightness |
| ᓕ | U+14D5 | LightnessDown | color | -2 lightness | [20,85] | k=5 | Decrease lightness |
| ᖅ | U+1585 | JitterUp | distortion | +0.04 jitter | [0,1.5] | k=6 | Increase jitter |
| ᖃ | U+1583 | JitterDown | distortion | -0.04 jitter | [0,1.5] | k=6 | Decrease jitter |
| ᗅ | U+15C5 | WaveUp | distortion | +0.12 wave | [0,4.0] | k=6 | Increase wave |
| ᗆ | U+15C6 | WaveDown | distortion | -0.12 wave | [0,4.0] | k=6 | Decrease wave |
| ᘃ | U+1603 | NoiseUp | distortion | +0.08 noise | [0,2.0] | k=5 | Increase low-frequency noise modulation |
| ᘄ | U+1604 | NoiseDown | distortion | -0.08 noise | [0,2.0] | k=5 | Decrease low-frequency noise modulation |
| ᓂ | U+14C2 | CharsetSyllabics | glyphset | set charsetMode=syllabics | enum | crossfade | Syllabics-only glyph set |
| ᓄ | U+14C4 | CharsetGuid | glyphset | set charsetMode=guid | enum | crossfade | GUID/hex glyph set |
| ᓇ | U+14C7 | CharsetMixed | glyphset | set charsetMode=mixed | enum | crossfade | Mixed glyph set |
| ᙭ | U+166D | Randomize | glyphset | randomize state within bounds | all clamps | all k | Uses seeded PRNG when seed is set |
| ᙅ | U+1645 | ClearSeed | glyphset | seed=null | n/a | n/a | Disable deterministic randomize |
| ᙮ | U+166E | Reset | meta | reset to defaults | n/a | target reset | Restores base state |
| ᙆ | U+1646 | Snap | meta | snap next apply | one-shot | bypass once | Apply target immediately on next frame |
| ᙁ | U+1641 | FreezeMotion | meta | toggle freezeMotion | boolean | n/a | Freeze motion parameter evolution |
| ᙂ | U+1642 | FreezeColor | meta | toggle freezeColor | boolean | n/a | Freeze color parameter evolution |
| ᙃ | U+1643 | FreezeGeometry | meta | toggle freezeGeometry | boolean | n/a | Freeze geometry parameter evolution |

## 4. Extended / Non-Glyph Syntax (v2/v3)

### Numeric Selectors (v2)

| Selector | Channel | Scaling / assignment rule |
|---|---|---|
| S | speed | literal / 100 -> speed, clamp [0.2, 6.0] |
| A | angle | degrees -> radians, wrapped |
| H | hue | degrees, wrapped 0..360 |
| F | font | fontPx, clamp [10, 72] |
| T | fade | literal / 100 -> fadeAlpha, clamp [0.01, 0.25] |
| J | jitter | literal / 100 -> jitter, clamp [0, 1.5] |
| W | wave | literal / 100 -> wave, clamp [0, 4.0] |
| D | density | literal / 100 -> density, clamp [0.5, 2.0] |
| R | drift | literal / 100 -> driftStrength, clamp [0, 2.0] |
| U | saturation | percent, clamp [30, 100] |
| L | lightness | percent, clamp [20, 85] |
| E | seed | uint32 seed for deterministic randomize |
| N | noise | literal / 100 -> noise, clamp [0, 2.0] |
| P | perspective | literal / 100 -> perspective, clamp [0, 1.5] |

Examples: `S250=` `A135=` `T6=` `E12345=` `D120=` `N50=`.

### Grouping and Repeats (v3)

- `(` `)` define a group.
- Postfix digits after `)` repeat the group. Example: `(ᐊᐊᐅ)3`.
- Postfix digits after a glyph or macro invocation may be interpreted as repeat when not in numeric literal mode.
- Repeat counts are clamped to `[1, 256]` with warnings.

### Macros (v3)

- Definition: `@name = sequence` (line-based).
- Invocation: `$name`.
- Script-local macros shadow saved local presets.
- Recursive/cyclic macros are blocked with warnings.

## 5. Examples Gallery

### Calm

```txt
ᓇᕿᕿᐃᐃᓴᓴᒍᑭ
```

### Fast

```txt
ᓂᐊᐊᐊᐊᐊᕿᓯᓯᔭᔭᑲ
```

### Diagonal

```txt
ᐅᐅᐅᒋᒋᖅᖅᗅᗅᗅ
```

### Color cycle

```txt
H210=U78=L62=T5=ᓇ
```

### Seeded chaos

```txt
E12345=᙭S260=A110=J35=W140=N45=P35=D125=R60=ᓇ
```

### Group/macro

```txt
@diag = ᐅᐅᒋᒋᗅᖅ\n($diag)3
```

## 6. Troubleshooting

- **Missing glyphs**: browser/system font may not support Unified Canadian Aboriginal Syllabics.
- **Script appears to do nothing**: check `Live` mode, comments-only input, unknown token warnings, or freeze toggles.
- **Performance issues**: enable `Perf: Manual`, reduce density/wave/jitter/noise, or use `Pause Rain`.
- **Randomize not reproducible**: set a seed first with selector `E...=` before using `᙭`.
