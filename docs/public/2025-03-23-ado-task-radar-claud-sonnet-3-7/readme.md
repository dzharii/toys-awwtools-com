# Retro-Style RADAR Dashboard Widget
Date: 2025-03-23



**Project Specification: Retro-Style RADAR Dashboard Widget**

**Overview**
Deliver a self-contained, single-page dashboard widget that displays task status data in a retro military radar style. The widget will occupy the top-left quadrant of a 2×2 CSS grid layout. No external assets (images, fonts) may be used; all graphics must be rendered procedurally with HTML5 Canvas and CSS.

**Technology Stack**
• HTML5, CSS3, Vanilla JavaScript (ES6+)
• HTML5 Canvas API (primary rendering)
• CSS Grid for dashboard layout

**File Structure**
```
radar-widget/
├── index.html         # Entry point, includes <canvas> and embedded script
├── styles.css         # Dashboard and widget CSS
└── script.js          # All Canvas rendering and data logic
```

---
## 1. Dashboard Layout
- Use a 2×2 CSS Grid container filling the viewport. Each cell = 50% width × 50% height.
- Three cells remain empty placeholders with light gray (#F2F2F2) background and 1px solid #CCCCCC border.
- Top-left cell hosts the radar canvas with 10px padding on all sides.

---
## 2. Data Model & Sample Data
Embed the following JSON array in `script.js`. Sort by `dueDate` ascending at runtime.
```json
[
  { "title": "Fix login bug",         "dueDate": "2025-03-28", "status": "open",         "url": "https://example.com/task/1" },
  { "title": "Implement feature X",   "dueDate": "2025-04-05", "status": "in-progress",  "url": "https://example.com/task/2" },
  { "title": "Code review PR#42",      "dueDate": "2025-03-18", "status": "closed",       "url": "https://example.com/task/3" },
  { "title": "Write unit tests",       "dueDate": "2025-03-01", "status": "closed",       "url": "https://example.com/task/4" }
]
```
**Status Classification**
- **Open** → Top-left quadrant (270°–360°)
- **In-Progress** → Top-right quadrant (0°–90°)
- **Closed (recent ≤7 days)** → Bottom-left quadrant (180°–270°)
- **Closed (older)** → Bottom-right quadrant (90°–180°)

---
## 3. Canvas Initialization & Responsiveness
1. On page load and window resize, set `<canvas>.width = containerWidth × devicePixelRatio` and `<canvas>.height = containerHeight × devicePixelRatio`.
2. Call `ctx.scale(devicePixelRatio, devicePixelRatio)`.
3. Compute `centerX = width/2`, `centerY = height/2`, `radius = (min(width, height)/2) - 10px`.
4. Re-render static and dynamic layers on resize.

---
## 4. Static Layer Rendering (Offscreen Canvas)
Pre-render background once to an offscreen canvas:
- **Radar Circle**: radial gradient (#161616 → #2B2B2B), 2px neon-green (#39FF14) circumference stroke.
- **Polar Grid**: four concentric circles at 0.25R, 0.5R, 0.75R, R; eight radial lines every 45°. Stroke = 1px rgba(255,255,255,0.05).
- **Scanlines**: horizontal lines 1px height, every 4px, stroke rgba(255,255,255,0.03).
- **Vignette**: full-canvas radial gradient (transparent center → rgba(0,0,0,0.6) edges).
- **Labels**: task titles positioned 12px outside circle at computed angles; font 10px monospace; color neon green for open/in-progress, #AAAAAA for closed.

---
## 5. Dynamic Layer Rendering (Main Canvas)
On each `requestAnimationFrame`:
1. Clear only dynamic layer.
2. Draw rotating sweep wedge: 2° arc, linear gradient (front solid #39FF14 → transparent trailing edge), shadowBlur=8, shadowColor="#39FF14". Rotate 360°/8s clockwise.
3. Draw task dots at radius-4px using polar coordinates:
   - Open: 4px radius, fill #39FF14, shadowBlur=6.
   - In-Progress: 4px radius, fill #FFD700, shadowBlur=6.
   - Closed: 3px radius, fill #888888, no glow.
4. Animate dot pulse when sweep angle within ±1°: radius +2px, opacity 0.8→1→0.8 over 200ms.

---
## 6. Interaction & Tooltips
- Track mousemove; if pointer intersects a dot (distance < dotRadius + 2px) or its label area, change cursor to pointer.
- On hover, draw tooltip near cursor: black box rgba(0,0,0,0.75) with 1px neon-green border, 8px padding, white 9px monospace text showing title + due date.
- On click, `window.open(task.url, '_blank')`.

---
## 7. Performance
- Only redraw sweep and dots each frame; static layer reused from offscreen cache.
- Limit `requestAnimationFrame` to 60fps.

---
## 8. Acceptance Criteria
- Widget scales responsively without distortion.
- Sweep animation completes one rotation every 8 seconds smoothly.
- Tasks correctly sorted into quadrants and spaced evenly within each.
- Hover tooltips display correct text; clicks open correct URL.
- No external assets; widget works offline.

Deliver a zipped folder containing `index.html`, `styles.css`, and `script.js`. All code must be vanilla JS/CSS/HTML and pass linting (ESLint recommended).
