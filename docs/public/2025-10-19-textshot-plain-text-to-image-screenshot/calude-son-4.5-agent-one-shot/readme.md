# Project Specification: Textshot — Plain Text to Shareable Image

Date: 2025-10-19

I will look at the problem from different perspectives.



# Usage story

Alex wants a shareable text image that reads well and looks intentional. They open the page; a clean contenteditable editor is front and center with a compact control strip.

Alex pastes a long draft. The app keeps only plain text and applies the default theme live. Alex increases Text Size slightly, then drags Columns and Lines. The editor itself resizes in real time based on characters per line and visible line count; the status readout confirms the resulting render size and warns if limits or overflow are approached.

The message should stand out, so Alex switches to a high contrast theme from the preset selector. A small signature is needed, so Alex types a short string into Watermark; a discreet label appears at the bottom right inside the editor with safe inset. Padding is nudged up for breathing room. Everything updates instantly.

A warning notes that the text exceeds the chosen lines. Alex either trims a paragraph or toggles Auto fit to expand lines within safe bounds. With the layout ready, Alex clicks Generate. The app rasterizes only the editor region at high DPI into a canvas and shows it in the preview pane, mirroring it as an image for easy context menu actions.

Responsive layout keeps the flow comfortable on any screen. Paste plain text, pick a theme, size with Columns and Lines, adjust Text Size and Padding, add an optional Watermark, click Generate, copy the image.



## Purpose and Scope

Deliver a single file HTML CSS JavaScript app that converts long plain text into a high quality, readable image for social sharing. The app runs locally via file:// and from static hosting. No backend. No build step. No ES modules. All scripts included with legacy script tags.

## Non-Goals

No server components. No authentication. No analytics. No deployment notes. No business logic.

## Target Environment

Latest Chrome, Edge, Firefox, Safari. Desktop and mobile. Works offline once loaded. Runs under file:// origin. No external font downloads.

## Visual and UX Principles

Readable first. Clean responsive layout. Modern look. Live WYSIWYG preview. Minimal obvious controls. Themes are preset and highly readable. No CSS design prescriptives in this document.

## High-Level User Flow

User opens the page. User pastes or types text into a contenteditable editor that reflects the active theme. User selects a theme. User adjusts text size. User adjusts columns and lines via sliders. User sets optional padding and watermark text. User triggers Generate. App rasterizes the editor region into a canvas and shows it in a preview pane. User copies the image using the browser context menu.

## Functional Requirements

- Contenteditable editor with live theme application.
- Theme selector bound to 10 high quality readable presets.
- Text size control that scales the theme base font size.
- Column and line sliders that size the editor by characters per line and lines per page.
- Padding control for inner spacing of the editor box.
- Optional watermark text placed at the bottom right inside the editor box with small inset.
- Generate action that rasterizes only the editor box into a canvas at high DPI.
- Preview pane that displays the generated canvas below the editor on narrow screens and to the side on wide screens.
- No explicit file export or download UI. Copy via right click on the preview is sufficient.

## Accessibility Requirements

- Editor uses role=region with aria-label.
- All controls reachable by keyboard, with visible focus.
- Status text uses aria-live polite for generation results and errors.
- Theme presets meet WCAG AA contrast for body text.

## Security and Privacy Requirements

- No network calls.
- Paste sanitization to plain text. Strip HTML tags and scripts.
- Constrain contenteditable to text only. Prevent rich formatting and pasted images.

## Performance Requirements

- Generation completes within about 1 second for 5k words on a mid-range laptop.
- UI updates debounced on slider changes.
- Style and layout updates batched with requestAnimationFrame.
- Use renderScale 3 by default on desktop and 2 on mobile for crisp output.

## Error Handling Requirements

- Disable Generate when text is empty or inputs are invalid.
- Warn if resulting bitmap would exceed safe limits. Do not render until the user reduces columns, lines, or scale.
- Show unobtrusive inline error messages in the status area.

## Internationalization Requirements

- Support basic Latin plus extended Unicode and emoji.
- Preserve newlines and paragraph breaks.
- Left to right only. Right to left out of scope.

## Data Model and State

- text: sanitized string from editor.
- themeId: string identifier of the active theme.
- textScale: number multiplier for base font size.
- columns: integer count of characters per line.
- lines: integer count of lines per page.
- paddingPx: integer inner padding in pixels.
- watermarkText: string. Empty means no watermark.
- renderScale: number for high DPI canvas scaling.
- lastCanvas: HTMLCanvasElement reference for the preview.
- overflowFlag: boolean indicating text exceeds lines.

## Columns and Lines Sizing Model

- Width is derived from columns. Height is derived from lines.
- Character cell width is measured from the active theme font. Measurement uses one of two approaches: CSS ch unit for a quick estimate or a hidden measurement span with representative characters to compute average glyph width. The implementation must favor the hidden span approach for proportional fonts.
- Line box height is derived from computed line height. Height equals lines times line box height plus vertical padding.
- Width equals columns times average character width plus horizontal padding.
- The editor box is centered in its container. No scrollbars inside the editor box during generation. If text exceeds the configured lines the overflowFlag is set, the status warns, and Generate remains enabled only if an Auto-fit policy is chosen. See Overflow behavior.

## Overflow Behavior

- Default policy is Block with warning. If overflowFlag is true, generation continues but draws exactly the configured lines. The status warns that some text may be truncated.
- Optional policy Auto-fit increases lines to the minimum number that fits all text, capped by safe limits. Auto-fit is controlled by a simple toggle. Default is off.

## Theme System

- Presets live in a single JavaScript array of objects exposed on window as TextshotThemes.
- Editable by users in code. No editor UI for authoring presets.
- Each preset uses only system font stacks. No external fonts.
- Theme object fields:
  - id: string.
  - name: string.
  - description: short string.
  - tokens: flat map of CSS custom properties to values such as background, text color, accent color, shadow, radius.
  - baseFontSizePx: integer base size before textScale multiplier.
  - lineHeight: number factor.
  - fontFamilyStack: string as CSS font-family value.
  - paddingPx: integer default inner padding.
  - maxContentWidthCh: integer soft wrap width in ch for readability hints.
- Theme application uses a single injected  block that sets CSS variables scoped to the editor container. No per-node inline styles beyond container sizing.

## Controls

- Theme selector. Control id ts-theme. Type select.
- Text size. Control id ts-text-scale. Type range or numeric. Range example 0.75 to 1.50 with step 0.01.
- Columns slider. Control id ts-cols. Range example 30 to 160 with step 1. Default 80.
- Lines slider. Control id ts-rows. Range example 10 to 200 with step 1. Default 40.
- Padding control. Control id ts-padding. Range example 8 to 64 with step 1. Default from theme.
- Watermark input. Control id ts-watermark. Type text. Empty means disabled.
- Generate button. Control id ts-generate. Primary action.
- Optional Auto-fit toggle. Control id ts-autofit. Default off.

## Editor Behavior

- Single contenteditable div with id ts-editor.
- Paste handler converts clipboard to plain text and normalizes line breaks to LF.
- Real time application of theme and textScale.
- Cursor and selection are native. No bold italics underline. Plain text only.
- Watermark rendered as a positioned child within the editor box so it appears in the output.

## Image Generation

- Use a client-side DOM to canvas library loaded via legacy script tag. Example html2canvas vendor file under assets/js/vendor.
- Render target is the editor box only. Use background and box shadows from the theme.
- Canvas resolution equals CSS size times renderScale, clamped by safe limits.
- Generated canvas is placed in the preview pane with id ts-preview. The preview pane clears any previous canvas before inserting the new one.
- To maximize right click compatibility, mirror the canvas into an  element sourced from canvas.toDataURL and show both. The canvas is the primary artifact. The img is for context menu Copy Image in browsers that support it.

## Safe Limits

- Maximum canvas width or height is 8192 px after scaling.
- Maximum pixel area is 32,000,000.
- Default renderScale is 3 on desktop and 2 on mobile. Implementer detects mobile by viewport width breakpoint only.

## Responsiveness

- Use CSS media queries for at least two breakpoints: narrow and wide.
- Narrow layout stacks controls above the editor and preview in a single column.
- Wide layout places controls in a narrow column and the editor in a larger column with the preview below or to the side.
- Controls and editor remain usable at 320 px viewport width.

## Keyboard and Shortcuts

- Ctrl Enter or Cmd Enter triggers Generate.
- Tab order is theme selector, text size, columns, lines, padding, watermark, Auto-fit, Generate, preview.
- Esc dismisses any non-modal status banners.

## File Layout

- index.html in repository root.
- assets/css/style.css for all styles.
- assets/js/vendor/html2canvas.min.js for rasterization.
- assets/js/app.js for application logic.
- assets/img reserved for future static assets.

## Script Includes

- Legacy includes only. No type=module.
- Example order:  then .
- app.js initializes on DOMContentLoaded and registers a global API on window.

## Public Global API

- window.Textshot.init(options) initializes the app. Options include initial themeId, initial textScale, initial columns, initial lines, initial paddingPx, initial watermarkText, initial renderScale.
- window.Textshot.generate() rasterizes the current editor into a canvas and updates the preview pane. Returns a Promise that resolves to the canvas.
- window.Textshot.setTheme(themeId) applies a preset by id. Returns void.
- window.Textshot.setTextScale(multiplier) sets size. Returns void.
- window.Textshot.setColumnsLines(cols, rows) sets sizing. Returns void.
- window.Textshot.setPadding(paddingPx) sets inner padding. Returns void.
- window.Textshot.setWatermark(text) sets watermark string. Empty disables. Returns void.
- window.Textshot.getState() returns a shallow copy of the current state.

## DOM Structure IDs

- ts-app is the root container.
- ts-controls is the control group container.
- ts-theme is the theme selector.
- ts-text-scale is the text scale control.
- ts-cols is the columns slider.
- ts-rows is the lines slider.
- ts-padding is the padding control.
- ts-watermark is the watermark input.
- ts-autofit is the Auto-fit toggle.
- ts-generate is the generate button.
- ts-status is the aria-live status region.
- ts-editor is the contenteditable region.
- ts-preview is the generated canvas container.

## Validation Rules

- columns must be integer within slider range.
- lines must be integer within slider range.
- textScale must be positive within slider range.
- paddingPx must be integer within slider range.
- themeId must match an existing preset.
- Watermark text length may be limited, for example 80 characters, to avoid excessive overlay.

## Rendering Quality Rules

- Compute CSS size first from columns, lines, and padding, then request render at CSS size times renderScale.
- Round pixel sizes to whole integers before rendering to avoid blurring.
- If limits would be exceeded at current renderScale, reduce renderScale automatically and warn in status.

## Overflow Detection

- Compute text height by measuring scrollHeight of the editor content after sizing. If scrollHeight exceeds content box height then overflowFlag is true.
- Status message includes an estimate of missing lines. Estimate equals ceil((scrollHeight − clientHeight) / lineBoxHeight).

## Status Messages

- On success: Generated at W×H px, scale S.
- On overflow: Text exceeds configured lines. Increase lines or enable Auto-fit.
- On limit exceeded: Output too large. Reduce columns, lines, or scale.

## Acceptance Checklist

- Contenteditable editor reflects theme live and sanitizes paste.
- Ten distinct readable themes apply instantly with system fonts only.
- Text size multiplies base font size.
- Column and line sliders resize the editor predictably.
- Padding control adjusts inner spacing.
- Watermark text appears bottom right with small inset and respects theme contrast.
- Generate produces a crisp canvas that matches the editor visuals, with renderScale in effect.
- Preview pane shows a canvas and a mirrored image for right click copy.
- App enforces safe limits and provides clear messages.
- UI is responsive across mobile and desktop.
- All controls are keyboard accessible with visible focus.
- No network access occurs.

## Theme Preset Block Structure

```
window.TextshotThemes = [
  {
    id: "classic-light",
    name: "Classic Light",
    description: "Light background, dark text, generous line spacing.",
    tokens: { "--bg":"...", "--fg":"...", "--shadow":"...", "--radius":"..." },
    baseFontSizePx: 18,
    lineHeight: 1.6,
    fontFamilyStack: "ui-serif, Georgia, Times, serif",
    paddingPx: 32,
    maxContentWidthCh: 90
  },
  ... 9 more presets ...
];
```

## Implementation Notes

- Measurement span approach: create a hidden span using the editor font and measure a representative string to compute average character width. Update this value on theme or textScale change.
- Watermark overlay: use absolute positioning inside the editor with bottom and right offsets set from paddingPx to keep it inside the content area.
- Mirrored image: use canvas.toDataURL to create an img element for better cross browser Copy Image support without providing a download button.
