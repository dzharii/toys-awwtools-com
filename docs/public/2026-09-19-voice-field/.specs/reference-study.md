# Reference image study

These notes record the concrete design evidence taken from the ten approved mock
screenshots. Written product requirements override incidental mock content.

## Shared composition

- The shell is nearly black with a faint blue cast. Panels are one value lighter,
  use 12-16 px corner radii, and are separated more often by space and 1 px hairlines
  than by heavy borders.
- A shallow global header spans the viewport. Identity sits left, frame-ratio controls
  sit near the visual center, and microphone state sits right. The Stage begins below
  this header and never overlaps it.
- Standard desktop is a stable three-column composition: a narrow creative rail,
  a much larger centered Stage, and a narrow reactive-audio rail. The side rails are
  visually balanced, while the Stage receives roughly two thirds of the horizontal
  attention.
- The recurring footer is a low horizontal palette tray. It reinforces the active
  palette with small overlapping color discs and gives the composition a strong lower
  boundary. In the implementation this becomes an actionable palette strip without
  the mock recording control.
- Labels are compact and quiet. Section headings are uppercase with wide tracking;
  ordinary labels use a neutral off-white; secondary values use desaturated blue-gray.
  Purple/cyan/amber/green light appears only in active states and scene-adjacent details.
- Controls align to an 8 px rhythm. Selects are tall rounded rectangles; sliders keep
  their tracks short and leave room for a numeric value; section groups are separated
  by generous vertical gaps and subtle rules.

## Stage composition and material

- The 16:9 Stage is an inset, visibly bounded rectangle with a fine cool-gray border,
  small radius, deep background, and slight surrounding falloff. It is not flush with
  the shell.
- The Reactive Field is a single dominant composition occupying the middle 60-75% of
  the Stage. It has enough negative space around it to read as an object or environment,
  not a full-frame texture.
- Brightness is concentrated along folds, ridges, caustics, or filaments. Large areas
  remain dark. Fine particulate matter supplies scale and depth but never becomes flat
  confetti.
- The Voice Trace lives in a narrow lower band, generally 10-15% of Stage height. Peaks
  form broad correlated clusters separated by calmer intervals. A dim mirrored glow or
  reflection anchors the trace rather than leaving isolated bars floating in space.
- Concept screenshots include slogans and branding inside the Stage. Those conflict
  directly with the written contract and are excluded. Only the field, environmental
  effects, and Voice Trace remain inside the implementation Stage.

## Visual-family evidence

- Aurora/Silk: overlapping translucent sheets, cool blue-violet-pink rim light, soft
  powder-like particles, and broad graceful folds.
- Membrane: one continuous pearl-gray elastic surface, localized circular pressure,
  thin luminous tension lines, and sparse dust.
- Liquid/Ocean: a low camera over rolling surface structure, long cyan caustic ridges,
  dark depth, and a localized circular disturbance. Ocean needs more than a blue tint:
  its scale, horizon layering, and traveling wave structure are distinct.
- Chrome: broad fluid ridges with high-contrast silver reflections, blue/violet edge
  light, tight specular bands, and a central droplet/ripple motif.
- Nebula: volumetric cloud masses, dark cavities, filament edges, embedded stars, and
  violet-magenta-blue depth rather than a flat noisy cloud.
- Ember: a cohesive hot ribbon/surface remains central while sparks and smoke support
  it. Warm particles radiate outward but do not turn into an explosion.
- Forest: translucent fabric-like canopy layers in deep green, muted gold highlights,
  and organic dust. It stays abstract and shares the same premium material language.
- Void/monochrome is represented by restrained pearl/graphite palette chips and should
  preserve the same depth with much less chroma.

## Aspect-ratio and wide-layout evidence

- Square keeps a large centered Stage and side rails. The visual reorganizes into a
  more radial/topographic composition instead of cropping a landscape scene blindly.
- Portrait keeps the side rails on desktop and uses a tall, narrow Stage. The field
  becomes a vertical ribbon with the trace still anchored low. This establishes that
  shader coordinates must be aspect-aware.
- The ultrawide image adds a full preset browser on the left and a scene/advanced panel
  on the right. The Stage stays deliberately sized and centered. Extra width reveals
  useful controls instead of stretching the Stage.

## Implementation decisions derived from the references

- Use a neutral shell with a smoothly interpolated scene accent; never recolor the
  entire interface for a preset.
- Keep a fixed visual hierarchy: global header, quiet rails, bounded Stage, actionable
  palette tray. At compact widths, collapse the two rails into one stacked rail before
  sacrificing the Stage. At wide widths, reveal preset browsing and quality details.
- Recompose procedural coordinates for 16:9, 1:1, and 9:16 rather than applying a
  fixed landscape crop.
- Preserve the clustered low Voice Trace, its soft mirrored glow, and the dominant
  middle field across every style.
- Omit mock-only Save, Share, Export Audio, and Record Scene controls. The truthful
  action is microphone enablement plus guidance to capture the Stage with external
  recording software.
