# AROMACOP: Project Analysis and Function Reference V00 (initial refence)

Source: `aromacop(1).html` Project: AROMACOP Modular Constructor Language: Vanilla JavaScript, HTML5, CSS3 Rendering: HTML Canvas 2D with custom 3D projection Architecture: Single-file, client-side application

## 1. General project description

AROMACOP is an interactive robot assembly and visualization application. It presents a RoboCop-inspired humanoid robot composed of 25 independently movable components.

The application allows users to inspect individual robot modules, separate and reposition them, trigger a simulated walking animation, rotate and zoom the camera, and enter dialogue displayed in a comic-style speech bubble.

The robot's face incorporates a photograph embedded directly in the HTML file.

Although the interface presents a 3D model, the application does not use Three.js or WebGL. Instead, it implements its own lightweight 3D rendering pipeline using JavaScript mathematics and the Canvas 2D API.

### Main features

| Feature                | Description                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| 3D robot visualization | Renders a humanoid robot from polygon-based geometry.                |
| Modular construction   | Manages 25 independently selectable robot components.                |
| Component manipulation | Allows dragging individual components away from the robot.           |
| Exploded view          | Separates all components into a spatial arrangement.                 |
| Reassembly             | Animates components back to their original positions.                |
| Walking animation      | Simulates arm swings, leg movements, knee flexion, and torso motion. |
| Camera controls        | Provides orbit rotation, zooming, and automatic rotation.            |
| Component inspection   | Displays each component's name, description, and assembly status.    |
| Facial texture         | Projects an embedded photograph onto the robot's face.               |
| Comic dialogue         | Displays user-entered text inside a speech balloon.                  |
| Diagnostics            | Displays component counts, gait status, and assembly state.          |

The application is entirely client-side. The supplied file contains no backend, database integration, external JavaScript library, or persistent storage implementation.

## 2. High-level source map

The entire application is implemented in approximately 180 physical lines. However, substantial portions of the CSS and JavaScript are compressed into long lines, so the effective code volume is significantly larger.

| Lines   | Subsystem                        | Responsibility                                                 |
| ------- | -------------------------------- | -------------------------------------------------------------- |
| 1-3     | Document setup                   | HTML declaration, metadata, document title.                    |
| 4-7     | CSS styling                      | Dark interface, panels, responsive layout, visual components.  |
| 8-12    | HTML interface                   | Header, controls, viewport, module list, diagnostics, footer.  |
| 13-18   | JavaScript initialization        | Embedded photograph, canvas context, DOM references.           |
| 19-47   | Component registry               | Definitions and initial state of all 25 robot modules.         |
| 48-58   | State and mathematics            | Application state, camera state, vector operations, rotations. |
| 59-80   | Pose engine                      | Robot positioning and walking kinematics.                      |
| 81-84   | Camera and transformations       | Camera orientation, perspective projection, world coordinates. |
| 85-121  | Geometry construction            | Polygon primitives and generation of robot body parts.         |
| 122-142 | Surface rendering                | Lighting, color shading, photographic texture rendering.       |
| 143-153 | Scene renderer                   | Ground, selection overlay, complete frame rendering.           |
| 154-157 | Interface synchronization        | Canvas resizing, diagnostics, component list.                  |
| 158-162 | Application controls             | Walking, explosion, reset, camera spin, dialogue.              |
| 163-176 | Pointer and keyboard interaction | Object picking, dragging, orbiting, zoom, shortcuts.           |
| 177-179 | Animation loop                   | Frame timing, state updates, smooth movement, rendering.       |
| 180     | Document termination             | Closing HTML elements.                                         |

## 3. System architecture

The application's data flow is:

Component registry and application state

25 parts, positions, offsets, selected component, motion modes

Pose engine

Walking kinematics and transforms

Interaction engine

Pointer, keyboard, and control state

Geometry and camera pipeline

3D polygons, camera transforms, perspective projection, depth sorting

Canvas renderer

Robot, ground, lighting, photographic face

HTML interface

Component details, diagnostics, buttons, dialogue

The central coordinator is `loop()`, which updates animation state and invokes `draw()` for each frame.

The rendering path is:

`loop()` → `draw()` → `poseAt()` → `drawPart()` → geometry primitives → `drawMesh()`

The user interaction path is:

`pointerdown` → `intersect()` → component selection → `pointermove` → position update → next rendered frame.

## 4. Complete function inventory

The JavaScript contains 38 explicitly named functions, consisting of 31 function declarations and 7 arrow-function utilities. There are also anonymous callbacks used for event handling and collection operations.

### A. Mathematical utilities (9 functions)

These functions provide the vector mathematics used by the rendering and animation systems.

| Line | Function     | Description                                                                                       |
| ---- | ------------ | ------------------------------------------------------------------------------------------------- |
| 18   | `$()`        | Shorthand for `document.getElementById()`. Retrieves interface elements by ID.                    |
| 51   | `vadd(a,b)`  | Adds two 3D vectors. Used for positions and movement offsets.                                     |
| 52   | `vsub(a,b)`  | Subtracts one vector from another. Used for direction and relative positions.                     |
| 53   | `vmul(a,s)`  | Multiplies a vector by a scalar. Used for movement magnitude and interpolation.                   |
| 54   | `dot(a,b)`   | Calculates the dot product, used in lighting calculations, camera projection, and depth sorting.  |
| 55   | `cross(a,b)` | Calculates the cross product. Used to determine perpendicular vectors and surface normals.        |
| 56   | `norm(a)`    | Normalizes a vector to unit length, with protection against division by zero.                     |
| 57   | `rx(v,a)`    | Rotates a vector around the X-axis. Used extensively for arm and leg movement.                    |
| 58   | `ry(v,a)`    | Rotates a vector around the Y-axis. Defined but not used elsewhere in the current implementation. |

The application stores 3D coordinates as arrays in the form `[x, y, z]`, rather than using vector classes.

### B. Robot pose and camera system (5 functions)

These functions determine how the robot is positioned in 3D space and how its geometry appears on screen.

| Line  | Function            | Description                                                                                                                                              |
| ----- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 59-80 | `poseAt(time)`      | Calculates the complete pose of all 25 modules at a particular animation time. Handles walking stride, arm swing, knee bending, torso bobbing, and lean. |
| 61    | `assign(id,at,rot)` | Nested helper inside `poseAt()`. Assigns a module its world position, X-axis rotation, and detachable offset.                                            |
| 81    | `cameraState()`     | Calculates camera position, forward/right/up orientation vectors, focal length, and screen center.                                                       |
| 82    | `project(v)`        | Converts a 3D point into 2D screen coordinates using perspective projection. Returns `null` for points behind the near-depth threshold.                  |
| 84    | `world(id,v)`       | Transforms a vertex from its module's local coordinates into world coordinates, applying rotation, placement, and detachment offset.                     |

`poseAt()` is the central animation function.

It uses sinusoidal motion to create a cyclic walking animation. Left and right limbs move in opposite phases, the knees bend during parts of the stride, and the torso receives small vertical and angular movements.

This is procedural, kinematic animation. It does not use a physics engine, inverse kinematics, or skeletal animation library.

### C. Geometry construction (9 functions)

These functions construct the actual robot model procedurally.

| Line    | Function       | Description                                                                                                    |
| ------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| 85      | `addPolygon()` | Converts supplied polygon vertices into world coordinates and adds the polygon to the frame's mesh collection. |
| 86      | `poly()`       | Creates a planar polygon at a specified local Z coordinate.                                                    |
| 87-91   | `prism()`      | Extrudes a 2D outline into a 3D prism with front, rear, and side surfaces.                                     |
| 92      | `box()`        | Creates a rectangular 3D box using `prism()`.                                                                  |
| 93      | `hex()`        | Creates a beveled, roughly hexagonal armor shape.                                                              |
| 94      | `oval()`       | Approximates an ellipse using a polygon, with 12 segments by default.                                          |
| 95      | `stripe()`     | Creates a narrow quadrilateral between two points, used for armor accents and markings.                        |
| 96-99   | `cylinder()`   | Constructs the side surface of a cylinder aligned with the Y-axis.                                             |
| 100-121 | `drawPart(p)`  | Generates the geometry for a particular robot component using the primitive-building functions.                |

`drawPart()` is effectively the robot's procedural model definition.

It contains a `switch` statement with geometry-generation cases for the helmet, face, neck, spine, chest, power core, pelvis, shoulders, upper arms, elbows, forearms, hands, thighs, knees, shins, and boots.

Left and right parts reuse the same geometry definitions but receive independent IDs, transforms, and positions.

This means the application does not load an external `.obj`, `.glb`, or `.gltf` 3D model. The model is constructed directly from JavaScript instructions.

### D. Rendering and visual presentation (8 functions)

| Line    | Function              | Description                                                                                                              |
| ------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 122     | `shade(c,mul)`        | Adjusts the brightness of a six-digit hexadecimal color according to a lighting multiplier.                              |
| 123-136 | `drawFaceTexture(vs)` | Projects the embedded photograph onto the robot's face using two affine-textured triangles.                              |
| 126     | `tri()`               | Nested helper inside `drawFaceTexture()`. Computes an affine texture transformation and draws a clipped image triangle.  |
| 137-142 | `drawMesh(m)`         | Renders an individual polygon. Calculates simple lighting, fills surfaces, draws edges, and highlights selected modules. |
| 143-145 | `ground()`            | Draws the projected floor grid and an elliptical shadow beneath the robot.                                               |
| 146     | `selectionHud()`      | Draws a circular selection marker, connecting line, and name label beside the selected component.                        |
| 147-153 | `draw(t)`             | Renders a complete frame, including background, ground, robot geometry, selection marker, and speech-bubble positioning. |
| 154     | `resize()`            | Resizes the canvas to match the viewport and adjusts the backing resolution for device pixel density.                    |

`draw()` is the main rendering orchestrator.

Its execution sequence is:

1. Calculate camera state.
2. Clear and paint the background.
3. Draw the floor and shadow.
4. Calculate the current robot pose.
5. Generate polygon geometry for all 25 modules.
6. Sort polygons approximately from farthest to nearest.
7. Render each polygon.
8. Draw the selection overlay.
9. Reposition the speech bubble near the robot's head.

This uses a painter's algorithm for visibility rather than a GPU depth buffer.

### E. Application controls, selection, and animation (7 functions)

| Line    | Function           | Description                                                                                                                                            |
| ------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 156     | `refreshPanel()`   | Updates diagnostics, selected-component details, detached indicators, component count, and gait status.                                                |
| 158     | `toggleWalk()`     | Toggles walking mode and updates the Start/Stop Walking button.                                                                                        |
| 159     | `explode()`        | Toggles exploded view. Calculates outward target offsets for all components and adjusts camera distance.                                               |
| 160     | `reset()`          | Stops walking and auto-rotation, restores the default camera, clears module offsets, and restores control labels.                                      |
| 164-169 | `intersect(mx,my)` | Determines which robot component lies under a pointer position by testing projected polygons and selecting the nearest intersecting surface.           |
| 173     | `release(e)`       | Completes a pointer interaction, optionally snaps a nearly mounted component back into place, and clears dragging state.                               |
| 177-179 | `loop(ms)`         | Runs the continuous animation loop, advances walking and camera motion, interpolates component offsets, refreshes diagnostics, and renders each frame. |

`explode()` deserves particular attention. It calculates displacement targets for the parts, but does not immediately move them to their final positions. Instead, `loop()` gradually interpolates each part's current `offset` toward its `goal`.

This separation of target state and rendered state is what makes reassembly and exploded-view transitions appear smooth.

## 5. Anonymous event-handler functions

The application also contains inline arrow functions that handle user interaction. These are not included in the 38 named functions above.

| Line    | Event                | Behavior                                                                                    |
| ------- | -------------------- | ------------------------------------------------------------------------------------------- |
| 157     | Module list `click`  | Selects the clicked robot module and updates the inspection panel.                          |
| 161     | Auto-rotate `click`  | Toggles automatic camera rotation and changes the ON/OFF indicator.                         |
| 162     | Dialogue `input`     | Updates the speech balloon using the textarea's current text.                               |
| 170     | Canvas `pointerdown` | Performs component picking and starts either component dragging or camera orbiting.         |
| 171-172 | Canvas `pointermove` | Updates the camera orientation or moves the selected component, depending on the drag mode. |
| 175     | Canvas `wheel`       | Changes camera distance, with minimum and maximum zoom constraints.                         |
| 176     | Window `keydown`     | Implements Space, E, and R shortcuts, except while typing in an input or textarea.          |

There are also smaller anonymous callbacks passed to `map()`, `filter()`, `forEach()`, `sort()`, and similar array methods. These perform local operations such as transforming vertices, constructing lookup objects, filtering detached components, and sorting polygons. They do not constitute separate application subsystems.

The remaining events use existing named functions directly. For example, the Start Walking button invokes `toggleWalk()`, and both `pointerup` and `pointercancel` invoke `release()`.

## 6. Component data model

The component registry is established in lines 19-47.

`specifications` contains the component definitions, each with an identifier, display name, and descriptive text.

`parts` transforms those definitions into mutable runtime objects. Each object contains:

| Property      | Purpose                                                    |
| ------------- | ---------------------------------------------------------- |
| `id`          | Unique component identifier.                               |
| `name`        | Human-readable component name.                             |
| `description` | Engineering description displayed in the inspector.        |
| `i`           | Component index in the manifest.                           |
| `offset`      | Current displacement from the component's normal position. |
| `goal`        | Target displacement used for smooth movement.              |

`byId` provides direct component lookup by identifier.

There are seven central modules: `helmet`, `face`, `neck`, `chest`, `core`, `spine`, and `pelvis`.

The remaining 18 modules are nine left/right pairs identified by suffixes `L` and `R`: `shoulder`, `upper`, `elbow`, `fore`, `hand`, `thigh`, `knee`, `shin`, and `boot`.

## 7. Main application state

| Variable        | Responsibility                                         |
| --------------- | ------------------------------------------------------ |
| `selected`      | ID of the currently selected component.                |
| `walking`       | Whether walking animation is enabled.                  |
| `exploded`      | Whether exploded-view mode is enabled.                 |
| `spinning`      | Whether the camera rotates automatically.              |
| `phase`         | Current walking-animation phase.                       |
| `cam`           | Camera yaw, pitch, and distance.                       |
| `camera`        | Calculated camera coordinate system.                   |
| `currentPose`   | Current positions and rotations of all robot parts.    |
| `meshes`        | Collection of polygons produced for the current frame. |
| `pointer`       | Active pointer position and drag mode.                 |
| `W`, `H`, `dpr` | Canvas dimensions and device-pixel ratio.              |
| `lastTime`      | Previous animation timestamp.                          |
| `uiTimer`       | Timer for periodic diagnostics refreshes.              |

The application uses globally shared mutable state. There are no JavaScript classes, ES modules, centralized state-management libraries, or component framework abstractions.

## 8. Engineering observations

The supplied JavaScript passes a Node.js syntax check. The following observations are based on source inspection, not a complete browser interaction test.

Rendering limitations: The rendering system rebuilds the polygon collection each frame and sorts it by approximate depth. This works for relatively simple geometry, but it does not offer the robust occlusion, clipping, or performance characteristics of a depth-buffered WebGL renderer.

Unused code: `ry()` is defined but unused. The `glows` array, the `verts` variable inside `cylinder()`, and the `side` variable inside `drawPart()` also appear unused. The `layer` value stored on polygons is not currently used in rendering order.

Assembly-state thresholds: `release()` snaps parts into place when their offset magnitude is below `0.20`, while `refreshPanel()` treats a part as detached above `0.24`. This creates a small interval where a displaced part is still reported as mounted.

Dialogue and reset: `reset()` does not clear the speech input or reset the walking phase. This may be intentional, but the behavior is worth documenting.

Speech-bubble positioning: The bubble follows the calculated helmet pose, but its positioning calculation does not incorporate the helmet's detachable offset. Therefore, dragging the helmet away does not cause the bubble to follow that detached position.

Diagnostics: The `fps` element exists in the HTML header, but the JavaScript does not compute or display an actual frame-rate measurement.

Security and persistence: User-entered dialogue is assigned through `textContent`, avoiding HTML interpretation in that path. The app does not save modifications or persist the configuration across reloads.

## 9. Most important functions for future development

If the project is extended, these are the primary places to work:

| Development objective                | Main functions or data                                    |
| ------------------------------------ | --------------------------------------------------------- |
| Change the robot's appearance        | `drawPart()`, `prism()`, `box()`, `hex()`                 |
| Improve the walking animation        | `poseAt()`                                                |
| Change camera behavior               | `cameraState()`, `project()`, pointer handlers            |
| Improve lighting and 3D rendering    | `drawMesh()`, `shade()`, `draw()`                         |
| Change assembly/disassembly behavior | `explode()`, `release()`, `loop()`                        |
| Add or rename robot modules          | `specifications`, `poseAt()`, `drawPart()`                |
| Improve component selection          | `intersect()`                                             |
| Change the inspector or diagnostics  | `refreshPanel()`                                          |
| Modify the portrait projection       | `drawFaceTexture()`                                       |
| Add configuration export/import      | `parts`, application state, and new persistence functions |

For adding a new movable component, the current design generally requires changes in three places: the component registry, its position calculation in `poseAt()`, and its geometry definition in `drawPart()`.

## 10. Overall assessment

AROMACOP is a self-contained interactive 3D-style robot constructor with a procedural geometry engine, a simple walking simulation, and a component manipulation interface.

Its strongest architectural characteristic is that the robot's geometry, motion, and detachment offsets are handled separately. This makes interactive assembly possible without duplicating the entire model for each animation state.

Its main architectural limitation is concentration of responsibility inside one HTML file, especially the dependence on shared global state and a single large geometry switch statement.

For a small interactive demonstration, the approach is straightforward and requires no external runtime dependencies. For a larger robot editor with more complex models, additional animations, advanced materials, and saved configurations, separating the pose system, geometry definitions, renderer, interaction controller, and application state into independent modules would provide a more maintainable foundation.

Review coverage: All 180 source lines, all 25 module definitions, all 38 named functions, and the event-handler subsystem have been accounted for.