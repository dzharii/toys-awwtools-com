USE THE TOOLS AVAILABLE ON THIS MACHINE
FOR EXAMPLE, THERE IS Playwright, so you don't have to install new one. 
same for other tools. check if it already exists and use it. you can install new tools if they do not exist, but keep them local. 


## R00 Project description, objectives, requirements, and execution process

### Project background and intended result

The AROMACOP project is an interactive browser-based demonstration of a modular humanoid robot. The application presents a RoboCop-inspired mechanical character whose body consists of 25 individually identifiable and movable components. Users can rotate the camera around the robot, zoom in and out, select individual components, detach them, examine their functions, activate a walking animation, switch to an exploded assembly view, and reassemble the robot.

The existing implementation is contained in a single `aromacop.html` file. Its HTML defines the interface, its CSS controls the visual appearance, and its JavaScript implements the robot model, rendering calculations, animation, component interactions, and application state. A photographic portrait is embedded directly in the file and rendered as the human face inside the robot's helmet.

The application currently uses the HTML Canvas 2D API with custom JavaScript calculations to simulate a three-dimensional scene. Robot geometry is generated from polygons, transformed into world coordinates, projected onto the screen, and rendered in approximate depth order. The walking animation is procedural, and detachable components are controlled through individual position offsets.

This existing implementation establishes the concept and the functional baseline for the next version of AROMACOP.

The objective of this project is to transform that baseline into a high-quality interactive demonstration with better 3D rendering, more detailed mechanical geometry, reliable controls, improved animation, a photographic portrait editor, synthesized mechanical audio, and a more complete user experience.

The finished application should feel like a deliberately designed piece of interactive software. Its controls should behave consistently, changes should be visible immediately, and the robot should remain stable throughout camera movement, animation, component manipulation, and editing operations.

The intended result is a professional-quality demonstration rather than a production application. It does not require a backend, authentication, database, deployment infrastructure, or integration with external services. However, the standard of visual presentation, interaction reliability, and browser testing should be substantially higher than the existing implementation.

The project should retain its original character and recognizable visual identity while allowing a considerable redesign of its internal rendering system, geometric construction, materials, interface layout, and animation techniques.

### The single-file requirement

The most important technical constraint is that AROMACOP must remain a standalone HTML application.

Every completed version must consist of one runnable `aromacop.html` file containing all code and resources required by the application. This includes its HTML structure, CSS, JavaScript, geometry definitions, shaders when applicable, default portrait, audio synthesis, and other runtime resources.

A user should be able to copy the file to another computer, open it in a supported browser, and use the demonstration without installing any software dependencies or connecting to a server.

The project must not introduce npm, a package manager, a bundler, a transpiler, or a build system. It must not require runtime downloads from a CDN, remote JavaScript imports, external textures, sound files, or other network resources.

The implementation agents may use installed development tools for source inspection, syntax validation, and testing. These tools are part of the development process and must not become dependencies of the delivered application.

The preferred engineering approach is to implement the rendering and interaction functionality directly with native browser APIs. A custom WebGL2 renderer is permitted, as is a substantially improved Canvas 2D renderer, provided the selected approach satisfies the required visual quality, geometry correctness, texture mapping, and performance criteria.

The agents have authority to replace the existing renderer if retaining it would prevent the project from meeting those requirements.

The application should not embed an entire third-party 3D engine merely to preserve the appearance of a single-file deliverable. The engineering work should concentrate on implementing the scene functionality that AROMACOP actually requires.

Development documentation, browser screenshots, test results, candidate reports, and iteration records may exist as separate files. They are development artifacts. The distributed product itself remains one HTML file.

### Rendering problems and visual reconstruction

One of the primary motivations for this work is a visible defect in the existing 3D rendering.

During camera rotation, some robot surfaces or entire visual components may disappear, flash, or appear inconsistently between frames. The problem becomes apparent when the viewer rotates the model and expects its geometry to remain continuous and stable.

This behavior must be investigated and corrected.

The existing rendering implementation uses perspective projection and a polygon drawing order based on approximate depth. It also rejects projected points that fall behind a near-depth threshold. Those mechanisms are relevant to the investigation, although the precise cause of the reported defect must be verified through source inspection and browser testing.

The implementation must distinguish between legitimate occlusion, where a component is hidden behind another component, and rendering failure, where visible geometry disappears or changes incorrectly.

The intended behavior is continuous and coherent three-dimensional visibility throughout the supported camera range.

The camera should rotate through a complete 360-degree horizontal orbit without producing unexpected geometry loss, flashing surfaces, inverted polygons, or inconsistent facial textures. The model should remain stable during different pitch angles, zoom distances, walking phases, exploded assembly states, and component detachment.

The quality of the robot model must also improve.

The existing model is constructed from comparatively simple geometric shapes. This approach makes it possible to demonstrate movement and modular assembly, but the resulting mechanical design has limited geometric detail. The helmet, chest armor, limbs, joints, and other components can appear flat, angular, or insufficiently developed.

The new implementation should reconstruct these parts with more deliberate geometry and a coherent mechanical appearance.

The helmet should have a convincing three-dimensional shell with an integrated opening for the human face. The facial area should appear physically situated inside the helmet rather than resembling a flat photograph placed on an unrelated shape.

The neck, shoulders, elbows, wrists, pelvis, knees, and ankles should have visible mechanical relationships. Armor plates should have depth, contour, appropriate separation, and plausible attachment points. The robot should maintain a coherent silhouette when viewed from the front, side, rear, and intermediate angles.

The torso, arms, and legs should have enough structural detail to remain visually convincing during movement and component separation.

The improved model may use additional polygon geometry, rounded contours, beveled edges, more effective shading, surface highlights, carefully controlled lighting, or a combination of these techniques.

The agents should choose the construction techniques that produce the best result within the performance limits.

Increasing polygon counts alone is not the objective. Geometry quality, material consistency, lighting, proportion, and rendering stability should be considered together.

All 25 existing components must remain individually addressable and movable. Improving their appearance must not eliminate the modular assembly functionality.

### Component manipulation and assembly behavior

The robot's modular construction is a defining characteristic of AROMACOP and must be preserved.

Users must be able to select components through the 3D scene or through the component manifest. Selection should identify the intended component consistently and update the associated inspection information.

A selected component should be visually distinguishable from surrounding geometry. The selection indicator must remain understandable when the camera moves or the component becomes detached.

Dragging should allow the user to move a component away from its normal mounted position. The movement should be predictable under different camera orientations, pitch angles, and zoom levels.

The application should maintain a consistent relationship between the user's pointer movement and the component's displacement. Changing the camera angle should not cause a component to jump unexpectedly or become difficult to control.

Components should remain identifiable after detachment. Their selected state, position, and assembly status should remain consistent with the scene.

The exploded view must separate the robot into individually inspectable assemblies. The separation should be visually organized, sufficiently spaced, and suitable for examining the robot's construction.

The user should retain the ability to orbit, zoom, select, and inspect components while the exploded view is active.

Reassembly should return components to their intended mounting positions through a controlled transition. The displayed diagnostics should reflect the actual component state.

The implementation must also support component manipulation while the walking animation is active.

For example, a user should be able to start the robot walking, detach an arm component, rotate the camera, and observe the remaining animation. The detached component should maintain a coherent relationship with its animated motion and should not disappear, freeze unexpectedly, or be duplicated.

The exact mathematical treatment of detached components may be redesigned by the implementation agent. The required behavior is that animation and modular manipulation work together without corrupting the scene state.

Reset behavior must also be predictable. When the user resets the assembly, the robot should return to its intended default configuration, active dragging should end, walking and automatic camera rotation should stop, and the interface should reflect the restored state.

### Walking animation and character behavior

The existing AROMACOP walking animation provides alternating leg movement, arm swinging, knee flexion, and limited torso motion.

This functionality should be retained and improved.

The robot should have a convincing mechanical walking cycle appropriate to its armored construction. Its legs should move in a coordinated sequence, its knees should flex at plausible points during each stride, and its arms should respond to the same gait cycle.

The upper body should exhibit controlled movement that makes the robot appear heavy and mechanical without introducing unnecessary instability.

The animation should remain consistent regardless of frame rate. Its timing should be calculated using elapsed time rather than assuming that the browser always produces a fixed number of frames per second.

The user should be able to start, stop, and restart walking without creating animation discontinuities or inconsistent interface states.

Walking must remain independent of sound. Disabling audio must never disable visual movement.

The agent may revise the gait model, adjust mechanical motion, add small secondary movements, and improve transitions between animation states. Those decisions should support the robot's visual character and overall presentation.

### Portrait upload and facial editing

The existing robot contains a photographic face embedded in the source HTML.

The enhanced application must allow the user to replace this photograph through the application interface.

The user should be able to select a local photograph, see an immediate preview, adjust its placement, crop it to the required facial area, and apply the result to the robot.

This requires a compact portrait editor integrated into the demonstration.

The editing process should be understandable without requiring technical knowledge. After choosing a file, the user should see the photograph and an indication of the visible crop area.

The editor must support repositioning the image and changing its scale. Where useful, it may also support rotation adjustments.

The user should be able to see how the resulting portrait will appear within the helmet before committing the change.

The relationship between the editing preview and the actual face texture should be consistent. Applying the crop must not produce unexpected stretching, altered proportions, blank image borders, or a different composition from the preview.

The interface must offer clear Apply, Cancel, and Restore Default actions.

Applying the crop should immediately update the robot's face without reloading the application. Canceling should preserve the previously committed portrait. Restoring the default should recover the original embedded image.

The image should remain correctly positioned when the robot walks, the camera rotates, or the head assembly moves.

The user should also be able to export the modified demonstration as a new standalone HTML file containing the selected and cropped portrait.

This requirement follows directly from the single-file architecture. A photograph selected inside a browser normally exists only in the current browser session unless the application implements a persistence mechanism.

The application cannot assume that it has permission to overwrite its original local HTML file. Instead, it must provide an explicit export or download operation that produces a complete standalone HTML file with the modified portrait embedded.

The exported file must retain the functionality of the application and work offline.

Portrait processing should occur locally in the browser. Photographs must not be uploaded to external servers.

The editor must handle invalid files, unsupported image formats, decoding failures, and excessively large images without causing the robot application to crash.

### Animated comic dialogue

The robot currently displays dialogue in a comic-style speech balloon. The enhanced version should turn this into an animated character feature.

The user should be able to enter dialogue into a text field, and the robot should progressively display that dialogue while walking.

The text should appear character by character, with timing that suggests the robot is speaking or communicating.

The animation should include brief pauses at punctuation and controlled variations in timing. A comma may produce a shorter pause, while a period or another sentence-ending mark may produce a longer pause.

The timing should make the dialogue readable rather than producing an uninterrupted stream of characters at a constant speed.

The speech balloon should remain visually associated with the robot's head. If the head is intentionally detached, the balloon should follow its actual rendered location when practical.

The user should be able to change the dialogue while the application is running. Changing the text must correctly replace or restart the current sequence without mixing old and new characters.

Starting, stopping, and restarting walking should produce a predictable dialogue state.

The agent may decide how dialogue pauses or completes when walking stops, provided the behavior is consistent and understandable.

The animated presentation should respect reduced-motion preferences by providing a static-text alternative when appropriate.

The speech balloon may receive visual refinements, such as improved typography, a restrained typing cursor, or subtle animation. These additions should remain secondary to readability.

### Synthesized robotic sound

The application must include mechanical walking sounds generated through native browser audio functionality.

The preferred implementation uses the Web Audio API.

The sound should be synthesized locally through oscillators, filtered noise, envelopes, or other browser-native audio techniques. The application should not depend on prerecorded external audio files or network services.

The intended sound character is mechanical and appropriate to the movement of an armored humanoid robot.

Footsteps may include controlled impact sounds, low-frequency mechanical movement, and subtle servo-like details. The agent can determine the exact synthesis approach and sound character.

Audio events should be synchronized with the robot's walking cycle. Footstep sounds should correspond to the movement of the legs rather than playing on an unrelated repeating timer.

The interface must expose an explicit sound control that allows the user to enable and disable audio. A volume adjustment should also be provided, or an equivalent ergonomic control if the agent chooses a better interface.

Sound should not begin unexpectedly when the page loads. Modern browsers restrict audio playback until an appropriate user interaction occurs, and the implementation must respect those restrictions.

When walking stops, related movement audio should stop. When sound is disabled, no continuing mechanical audio should remain active.

Audio initialization failures must be handled without affecting the robot's visual animation.

The system must avoid accumulating unnecessary audio nodes, timers, or other resources during repeated playback.

The application should remain fully usable in environments where audio is unavailable or intentionally muted.

### Interface quality and usability

The existing application uses a control panel, a central 3D viewport, a component manifest, diagnostics, and a speech balloon.

These functions should remain available, but their presentation and organization may be redesigned.

The interface should provide an ergonomic environment for viewing, editing, manipulating, and inspecting the robot.

The central model should remain the main focus. Controls should be discoverable without consuming unnecessary space or obstructing the scene.

The layout should communicate the current application state. Users should be able to determine whether the robot is walking, whether audio is enabled, which component is selected, and whether the assembly is exploded or reassembled.

The portrait editor should be accessible without interfering with camera movement or component dragging.

When editing is complete, the user should be able to return to the main demonstration without losing unrelated settings or encountering unexpected changes in camera position.

The interface must work with mouse and keyboard input and should remain practical on touch devices.

The application should support narrow screens through an appropriate responsive layout. Important controls must remain accessible, and the viewport should retain enough space to manipulate and inspect the robot.

Keyboard shortcuts for walking, exploded view, and reset should remain available where appropriate. Shortcuts must not interfere with typing or editing controls.

Dialogs and editors should support keyboard navigation, visible focus states, appropriate confirmation actions, and predictable cancellation.

The agents have freedom to choose the exact arrangement of controls, visual hierarchy, typography, interaction transitions, and component presentation.

The requirement is an understandable and reliable experience, rather than a prescribed layout.

### Performance and runtime behavior

Rendering quality must be balanced with performance.

The enhanced robot may contain more geometric detail, more advanced shading, animated text, and audio synthesis. These improvements must not make the application difficult to use.

Camera rotation, walking, part selection, and component dragging should remain responsive.

The renderer should minimize unnecessary work during each animation frame. Geometry generation, buffer allocation, texture updates, and state synchronization should be designed with frame performance in mind.

GPU resources, image resources, audio nodes, event listeners, and temporary objects should be reused or released when appropriate.

The implementation should avoid uncontrolled memory growth and avoid accumulating redundant animation loops or event handlers.

The application should also handle browser tab suspension and resumption without causing sudden movement jumps.

The reference desktop viewport is 1280 by 800 CSS pixels. The reference mobile viewport is 390 by 844 CSS pixels.

On a capable desktop, the target is an animation rate near 60 frames per second after warm-up.

The measured acceptance threshold is a median of at least 45 frames per second during continuous walking and camera movement on the recorded desktop reference environment, and at least 30 frames per second in mobile emulation.

Performance measurements must be collected under documented browser and hardware conditions. If the testing environment is too variable for reliable absolute comparisons, the agent must record that limitation and compare performance against previous versions under equivalent conditions.

No performance limitation justifies accepting incorrect rendering or broken interactions.

### The master-agent execution model

The project will be implemented using GPT Astra through GitHub Copilot.

The work must be organized as an agentic improvement process, with one master agent responsible for the overall execution.

The master agent owns the specification, planning, implementation delegation, candidate comparison, browser testing, quality assessment, version selection, and final reporting.

Sub-agents may implement competing solutions, but responsibility for the finished project remains with the master agent.

The master agent must first read the complete `specification.md` file and inspect the existing AROMACOP source code.

It should examine the current implementation, understand the robot's functional architecture, identify existing behavior that must be preserved, and establish a browser-tested baseline.

The reported rendering problems should be reproduced where possible. Existing interactions should be tested so the agent can distinguish baseline defects from regressions introduced by new implementations.

The master agent should then organize the requirements into an implementation plan and define the work for the first iteration.

An iteration is one complete cycle of implementation, independent testing, comparison, selection, and recorded results.

Each iteration begins with a defined baseline and a set of known objectives. It ends with either an accepted version, a selected provisional implementation for further improvement, or a documented reason why the work cannot continue.

The master agent should use the observed results of each iteration to determine what the following iteration needs to address.

### Sub-agents and alternative implementations

The master agent may delegate implementation work to a maximum of three sub-agents at a time.

These sub-agents should develop separate candidate implementations from the same baseline. Their workspaces must be isolated so they cannot overwrite one another's changes.

Every sub-agent must receive the same essential requirements, project constraints, baseline information, known defects, and acceptance criteria.

The master agent should also provide the relevant findings from earlier browser tests and explain the remaining problems that the candidate is expected to solve.

The purpose of using multiple sub-agents is to explore alternative engineering and design approaches.

For example, one candidate may emphasize a custom WebGL2 renderer with depth-buffered geometry. Another may emphasize a carefully optimized software rendering pipeline. A third may explore a different organization of the scene model, materials, and interactions.

These examples are possible approaches, not mandatory assignments.

The master agent should use judgment when deciding which alternatives are worth implementing.

Each candidate must attempt to satisfy the complete functional contract. Sub-agents should not deliver partial demonstrations that implement only their preferred feature while intentionally ignoring the remaining requirements.

Sub-agents have authority to choose their algorithms, internal code organization, geometry, material definitions, and interface design.

They may retain existing functions, rewrite them, or replace major parts of the implementation when necessary.

Every candidate must produce a complete standalone HTML application and a report explaining its approach, modifications, static-check results, known limitations, and areas requiring browser verification.

The sub-agents are not permitted to run Playwright acceptance tests.

They may perform source inspection, static analysis, and syntax checks, but final browser execution and acceptance decisions belong exclusively to the master agent.

If the GitHub Copilot environment cannot provide three independent sub-agents, the master should use the number actually available. One or two candidates are acceptable when that is the practical limit. The process must never exceed three concurrent candidate implementations.

### Browser testing and candidate evaluation

Browser testing is a mandatory part of the project and a primary responsibility of the master agent.

The master agent must use Playwright to test candidate implementations in a real browser environment.

Tests must evaluate the finished HTML files rather than an unrelated mock implementation.

Every eligible candidate should be evaluated using the same browser configurations, interaction sequences, and acceptance criteria.

The tests must cover initial startup, offline operation, renderer stability, camera rotation, component selection, dragging, exploded view, walking behavior, portrait editing, portrait export, animated dialogue, audio control, responsive layout, and runtime performance.

Rendering stability requires particular attention.

The master agent should rotate the robot through a complete horizontal orbit, inspect different pitch angles, and test near and far zoom distances. These checks should be repeated while the robot is walking and while the assembly is exploded.

Screenshots and other browser evidence should be used to detect disappearing geometry, visible flicker, texture failures, and inconsistencies in the model.

The browser tests should verify that all 25 modules remain available and that representative components from the head, torso, arms, and legs can be selected and manipulated.

The master should test component detachment and reassembly while the robot is idle and while it is walking.

Portrait editing must be tested using an actual local test image. The test must confirm that the preview appears, adjustments work, Apply commits the intended crop, Cancel preserves the previous image, and Restore Default behaves correctly.

The exported HTML must then be opened in a fresh browser context to verify that the modified portrait is embedded and that the application still works offline.

Animated dialogue should be tested with text containing punctuation. The master should verify that characters appear progressively, that pauses occur, and that editing dialogue during playback does not produce mixed or stale output.

Audio testing should verify the Web Audio initialization path, enabled and disabled states, footstep scheduling, synchronization with walking, and cleanup when playback stops.

Where automated testing cannot establish the perceived sound quality through listening, the report must distinguish the verified audio behavior from subjective qualities that were not assessed.

The interface should be tested at both reference viewport sizes, including keyboard interaction, portrait-editor focus behavior, visible controls, and layout overflow.

Performance testing must collect frame timing during sustained animation and camera movement. The required scenario includes at least eight seconds of continuous walking and orbit after warm-up.

The master agent must record browser errors, failed resource loads, screenshots, traces, and measurable performance results where the test environment supports them.

Tests should be reproducible. Candidate comparisons should not rely on arbitrary differences in browser state, viewport dimensions, device scale, cached data, or test duration.

### Quality assessment and selection

After testing the available candidates, the master agent must compare their actual results.

The selection process should prioritize functional correctness and reliability before subjective visual preference.

An implementation that looks more detailed but suffers from disappearing components, unreliable dragging, broken portrait editing, or severe performance problems should not be selected over a more stable implementation solely because of its appearance.

The quality assessment uses a 100-point scoring system.

Rendering stability and visual craftsmanship account for 25 points. Assembly behavior, component interactions, and walking account for 20 points. Portrait editing, texture correctness, and standalone export account for 15 points. Dialogue animation and synchronized audio account for 15 points. Ergonomics, accessibility, and responsive layout account for 10 points. Runtime performance and stability account for the remaining 15 points.

Candidates are also evaluated against mandatory acceptance gates. These gates cover portability, correct rendering, retained modular functionality, portrait editing and export, animated dialogue, audio behavior, interface usability, runtime reliability, browser-test evidence, and performance.

A candidate cannot be accepted if any mandatory gate fails or remains unverified.

The required total quality score is at least 90 out of 100, and no individual quality dimension may receive less than 70 percent of its available points.

The accepted candidate must also have no unresolved critical or high-severity defects.

Once a candidate satisfies these conditions, the master agent must perform a second independent Playwright verification run. Both runs must pass before the implementation is promoted as the completed version.

If no candidate satisfies the acceptance requirements, the master selects the strongest viable provisional implementation as the baseline for the next iteration.

The master should document why that implementation was chosen, which candidates were rejected, and which defects remain unresolved.

Implementation ideas from different candidates may inform later work. However, combining untested portions of several candidates does not automatically create an accepted implementation. A merged solution must be treated as a new candidate and tested independently.

### Version management and workspace organization

The project uses numbered directories to preserve its development history.

The existing project root is `D:\`, containing the current `aromacop.html`, the `.docs` directory, the `ref-images` directory, and the initial version snapshot in `v0001-aromacop-initial`.

The specification is saved as `D:\specification.md`.

The initial snapshot must remain unchanged so the original implementation can always be examined or restored.

The reference images should also remain unchanged. They may be used as design or portrait references during development, but the finished HTML must not require those external files.

Every enhancement iteration must create a new numbered version directory.

The first enhancement iteration should use `v0002-aromacop-iteration-01`. The second should use `v0003-aromacop-iteration-02`, and subsequent iterations should continue the same numbering convention.

Within each iteration directory, the master agent should create separate candidate workspaces for the delegated implementations.

Each candidate workspace contains its complete `aromacop.html` and implementation report.

The iteration directory also contains the selected candidate as its own `aromacop.html`, along with the shared handoff information needed to understand the work.

Browser-test evidence and iteration reports should be stored under `.docs/runs/`, organized by version.

This arrangement preserves the complete history of attempted implementations, test outcomes, and version selections.

The root `D:\aromacop.html` represents the most recently accepted public version.

A provisional candidate must not replace the root file merely because it is the best candidate available in the current iteration.

The master should promote a candidate to the root only after all mandatory acceptance conditions and the second verification run have passed.

Earlier version directories must remain available for comparison and recovery.

The unrelated root entry named `1` must be left unchanged because its purpose has not been established.

### Agent handover and continuity

The agentic process must preserve enough context to continue across multiple iterations or execution sessions.

At the beginning of an iteration, the master agent must read the specification, the latest available iteration report, the selected development baseline, and the evidence associated with unresolved defects.

The master should prepare a handoff document that explains what the project is, which requirements are mandatory, what has already been implemented, which problems remain, and which acceptance tests currently fail.

This handoff should also identify the source version, candidate workspace, output paths, technical constraints, and implementation focus for each sub-agent.

A new sub-agent should be able to begin work from the handoff without reconstructing the entire project history from incomplete conversation context.

When an iteration finishes, the master agent must record the candidate results, selected implementation, browser-test findings, performance measurements, known limitations, and next implementation priorities.

The master must also identify whether the selected implementation is provisional or accepted.

These records should be sufficiently detailed for a later master-agent session to resume the work and understand why a particular implementation was selected.

The master remains responsible for verifying claims made in sub-agent reports. A sub-agent's statement that a feature works is not equivalent to passing browser acceptance tests.

### Iteration limits and stopping conditions

The development process must have a defined end.

The master agent may execute a maximum of 20 enhancement iterations.

The agent should not automatically use all 20 iterations. The process should stop as soon as a version meets every mandatory acceptance gate, reaches the required quality score, and passes the second independent browser verification.

If a high-quality result is achieved in an earlier iteration, further iterations are unnecessary.

The loop may also stop before the limit if a documented technical or environmental blocker makes continued work impractical.

A quality plateau is another permitted stopping condition. If three consecutive iterations produce no newly passing mandatory gates and no quality-score improvement of at least two points, and the master cannot identify a credible remaining correction, it may stop and report the unresolved result.

The master must not lower acceptance criteria merely to conclude the task.

If the iteration limit is reached without acceptance, the master must preserve the strongest provisional implementation and report the remaining failures.

An unfinished candidate must not be presented as a fully accepted demonstration.

If Playwright or the required browser environment is unavailable, the master must record the missing capability. It may preserve implementation work as provisional, but it cannot certify acceptance without the required testing evidence.

The final report must identify the latest accepted HTML file, the strongest provisional candidate if applicable, the version history, test outcomes, measured performance, remaining limitations, and the reason the process ended.

### Implementation freedom and engineering decisions

The implementation agents are expected to make independent engineering decisions.

The specification defines the required outcomes, constraints, and acceptance criteria. It does not prescribe every implementation detail.

The agents may determine the rendering architecture, mesh construction algorithms, material system, lighting model, camera implementation, animation easing, interface arrangement, portrait-editor design, and sound synthesis methods.

They may introduce internal abstractions, restructure the JavaScript, replace the original procedural geometry system, or use other native browser capabilities when these decisions improve the result.

The agents should also decide how to make the robot visually convincing, how to organize the interface ergonomically, and how to provide feedback during component manipulation and editing.

These decisions should be evaluated through their observed behavior rather than through adherence to an arbitrary implementation style.

Technical choices must remain consistent with the single-file requirement and with the supported browser environment.

The agents should avoid unnecessary complexity, uncontrolled resource consumption, redundant code, and features unrelated to the demonstration.

They must preserve the application's established capabilities while improving their implementation.

Creative freedom applies to how the requirements are achieved. The requirements themselves remain mandatory.

### Expected final deliverable

The completed project should be a standalone `aromacop.html` that presents a substantially improved AROMACOP robot demonstration.

The robot should have a coherent three-dimensional mechanical design with detailed armor, a convincing helmet, integrated photographic face, and independently movable components.

The scene should render consistently during full camera rotation, zooming, walking, and assembly manipulation.

Users should be able to explore the robot, select and detach components, inspect their functions, activate the walking animation, and restore the assembly without experiencing broken or contradictory states.

Users should also be able to upload their own photograph, preview and crop it, apply it to the robot's face, and export the customized application as another standalone HTML file.

Walking should support animated comic dialogue and optional synthesized mechanical sounds. These features should remain synchronized with the robot's behavior and controllable through an understandable interface.

The application should work on desktop and narrow-screen layouts, remain responsive during interaction, and operate without a network connection or installation process.

The development history should preserve each iteration, candidate implementation, implementation report, Playwright evidence, and master-agent selection decision.

The result must be independently verified through browser testing, meet the specified quality threshold, and contain no unresolved critical or high-severity defects.

The master agent is responsible for organizing this work, directing competing implementations when useful, testing every candidate, choosing the strongest verified result, and delivering the accepted version.

The overall objective is a polished, reliable, and visually convincing interactive demonstration that preserves AROMACOP's modular construction concept while improving the quality of its rendering, movement, editing capabilities, audio, interface, and runtime behavior.





# AROMACOP standalone demo enhancement specification


ABOUT THIS LANGUAGE:
- `UPPERCASE WORDS` are structural keywords. The text following a keyword states its meaning in ordinary English. Indentation defines scope.
- Built-ins: `DIRECTIVE`, `WHEN`, `IF`, `ELSE`, `ELSE IF`, `FOR EACH`, `REPEAT UNTIL`, `PARALLEL`, `ASSESS`, `STOP`, `REMARK`. The condition connectors `AND` and `OR` join boolean conditions.
- `TEST` introduces a named browser acceptance scenario. The master executes it, records evidence, and marks it pass, fail, or blocked.
- `STOP` terminates the current agentic loop and proceeds to its final-report instructions; it does not authorize skipping the report.
- `DIRECTIVE` establishes a mandatory instruction. `ASSESS` requires a decision based on available evidence. `REMARK` provides non-executable context.
- `HIGH PRIORITY` requires compliance. `LOW PRIORITY` expresses a preference and cannot block completion.
- Named lists use `name (sentiment):` followed by Markdown list items. Sentiment guides judgment rather than establishing an unconditional ban.
- Read the complete document before starting. Apply specific rules over general rules when both cover the same action.
- `A00`, `B00`, and subsequent codes identify specification sections. Preserve each section letter; increment only its revision number when that section is edited.

##  Master agent, responsibility, and execution loop

    HIGH PRIORITY DIRECTIVE act as the MASTER AGENT
      own task planning, delegation, candidate comparison, browser testing, selection, version promotion, and the final report
      remain responsible for the result when sub-agents write code
      treat sub-agent reports as claims requiring independent verification
      do not delegate final acceptance or Playwright execution
      do not leave the project in an untested published state

    HIGH PRIORITY DIRECTIVE establish an agentic improvement loop
      read this entire specification and the original HTML
      inspect the existing repository and the most recent accepted or provisional version
      establish initial browser evidence and defects using Playwright
      track the acceptance criteria and outstanding failures
      start iteration_count at 0
      start accepted at false

      REPEAT UNTIL accepted OR iteration_count reaches 20 OR a documented hard blocker prevents further work
        increment iteration_count
        create the next numbered iteration folder
        copy the chosen development baseline into isolated candidate workspaces
        create one complete handoff brief containing the task, constraints, current defects, test evidence, and acceptance criteria

        ASSESS how many genuinely independent solutions are practical
          use two or three candidate sub-agents when supported and useful
          never run more than three candidate sub-agents concurrently
          IF the environment cannot spawn multiple sub-agents
            use sequential isolated candidates, or one candidate with a documented reason

        PARALLEL
          FOR EACH delegated candidate, with a maximum of three
            assign a different feasible implementation approach or design emphasis
            pass the same baseline and the same full requirement context
            restrict writes to that candidate's workspace
            instruct the sub-agent to implement the complete runnable single-file HTML
            prohibit the sub-agent from running Playwright or conducting browser acceptance testing
            require static checks and an implementation report

        WHEN all candidate work is finished or their failure is recorded
          verify that each candidate has its own complete standalone HTML
          run static validation on each candidate
          run Playwright acceptance tests personally against each eligible candidate
          capture evidence using the same browser configurations and scoring method
          classify hard failures, regressions, and remaining defects
          compare functional correctness before visual preferences
          select the highest-quality eligible candidate using the selection policy
          record the reason for the choice and the shortcomings of rejected candidates
          copy the selected candidate into the numbered iteration folder as `aromacop.html`
          mark the version provisional until all acceptance gates pass

        IF the selected candidate meets every hard gate and the quality threshold
          run a second independent Playwright verification of the selected HTML
          IF the second run also passes
            copy the accepted standalone HTML to the project-root `aromacop.html`
            mark this version accepted
            set accepted to true
          ELSE
            record the unstable result and continue from the best justified baseline
        ELSE
          carry the best viable provisional candidate forward
          keep the project-root HTML unchanged
          revise the next handoff around observed failures and promising approaches

        ASSESS whether results have stopped improving
          IF three successive iterations show no new passed hard gates or a quality-score increase of at least 2 points AND there is no credible remaining fix to test
            record an unresolved-quality stop condition
            STOP the loop without claiming acceptance

      WHEN the loop ends
        report the accepted version, or explicitly report why acceptance was not reached
        identify remaining defects, browser-test evidence, performance measurements, and final file paths
        distinguish a completed demo from a best-effort provisional result

    HIGH PRIORITY WHEN the iteration limit is reached
      STOP creating further versions
      preserve the last accepted root HTML
      preserve the strongest provisional version for review
      never silently lower acceptance criteria to declare success

##  Workspace and version contract

Repository layout supplied by the user:

```text
D:\
|   1
|   aromacop.html
|   specification.md                  # this specification, added at root
|
+---.docs
|       2026-10-09-AROMACOP--Project-Analysis-and-Function-Reference.md
|
+---ref-images
|       20250529_144804 - Copy.jpg
|       roma.jpeg
|
\---v0001-aromacop-initial
        aromacop.html
```

The entry named `1` has an unknown role. Preserve it without modification. The two reference images are optional design/source references. The HTML must never require those files at runtime.

Iteration layout, using the first enhancement iteration as an example:

```text
D:\
|   aromacop.html                        # last accepted public version
|   specification.md
|
+---.docs
|   +---runs
|       +---v0002
|           |   iteration-report.md
|           |   playwright-results.json
|           |   test-environment.md
|           +---artifacts
|               screenshots, traces, and other evidence
|
+---v0001-aromacop-initial
|       aromacop.html                    # immutable initial snapshot
|
+---v0002-aromacop-iteration-01
|   |   aromacop.html                    # master's selected candidate; provisional until accepted
|   |   handoff.md                       # shared candidate instructions
|   +---candidate-01
|   |       aromacop.html
|   |       candidate-report.md
|   +---candidate-02
|   |       aromacop.html
|   |       candidate-report.md
|   \---candidate-03                       # only when a third candidate is used
|           aromacop.html
|           candidate-report.md
|
\---v0003-aromacop-iteration-02
        ...
```

    HIGH PRIORITY DIRECTIVE keep every product version self-contained
      the only runnable product artifact for a version is its `aromacop.html`
      include HTML, CSS, JavaScript, geometry, shaders if used, default portrait, and audio generation in that file
      do not require npm, a package manager, bundler, transpiler, dev server, CDN, runtime module download, or network access
      do not reference `ref-images`, `.docs`, or candidate reports from the running product
      use relative paths only for development records, never as product dependencies
      allow `.md`, `.json`, screenshots, and Playwright artifacts as development evidence, not as application dependencies

    HIGH PRIORITY WHEN creating a new iteration
      choose the next unused `vNNNN-aromacop-iteration-II` directory
      increment the version number from `v0001`; increment the iteration number from `01`
      never overwrite an earlier numbered version or candidate
      record the source version and source checksum in the iteration report
      keep all candidates isolated so simultaneous writes cannot collide
      update the root `aromacop.html` only after final acceptance

    WHEN selecting a provisional result
      copy its complete HTML to the version root
      record whether it passed or failed each acceptance gate
      preserve all other candidates for comparison

    WHEN updating `specification.md`
      preserve stable section letter identifiers
      increment only the affected section revision codes
      record substantive specification changes in the iteration report
      never have sub-agents independently rewrite the specification

##  Baseline understanding and defect investigation

The current implementation is a 180-line single HTML source whose long compressed lines contain more logic than the physical line count suggests. It uses Canvas 2D with manual 3D-to-2D perspective projection. It contains 25 independently indexed modules, manually constructed geometry, procedural walking, exploded view, camera orbit, selection, and an embedded JPEG portrait.

Known baseline functions and subsystems:
- `poseAt()` computes gait and module transforms.
- `cameraState()`, `project()`, and `world()` calculate view and world transforms.
- `drawPart()` builds the procedural robot geometry.
- `drawMesh()`, `drawFaceTexture()`, and `draw()` render surfaces and the face.
- `intersect()` and pointer handlers implement selection and dragging.
- `explode()`, `reset()`, `toggleWalk()`, and `loop()` manage interactive state.

    HIGH PRIORITY WHEN beginning implementation
      inspect the complete original HTML, not only the project analysis document
      reproduce the reported rotation-related disappearance or flicker in a real browser when possible
      distinguish near-plane clipping, wrong winding, insufficient depth sorting, occlusion, and genuine object loss
      capture baseline screenshots and diagnostic observations
      do not assume that the suspected causes are the proven causes

    ASSESS known candidate causes in the existing implementation
      examine `project()` rejecting positions near or behind the camera
      examine `drawMesh()` skipping a complete polygon when any projected vertex is unavailable
      examine polygon painter ordering based on only the first vertex's depth
      examine lack of full polygon clipping and robust per-pixel depth handling
      examine face mapping under large view angles and the position of detached parts
      examine camera-relative dragging at different zoom levels and viewpoints

    HIGH PRIORITY DIRECTIVE preserve the current concept
      retain the robot character and recognizable AROMACOP visual identity
      retain 25 addressable, detachable modules unless a proven requirement demands a compatible extension
      retain walking, exploded view, reassembly, selection, orbit, zoom, diagnostics, and dialogue
      retain or improve keyboard interaction and responsive display
      do not remove a functioning user capability to simplify the redesign

##  Product and experience requirements

    HIGH PRIORITY DIRECTIVE deliver a polished interactive demo
      the robot should read as a coherent designed mechanical character
      support continuous manipulation without flicker, disappearing parts, or broken controls
      make all primary actions easy to find, understand, and reverse
      display clear state changes for assembly, playback, audio, and editing
      keep inspection and editing usable without obscuring the whole model unnecessarily
      favor consistent interaction behavior over decorative effects

    HIGH PRIORITY WHEN a user finishes an edit or changes a mode
      reflect the new state in the scene without a reload
      provide an obvious way to confirm, cancel, reverse, or reset when the action warrants one
      avoid unexpected camera jumps and modal changes
      preserve the user's unrelated settings unless Reset explicitly resets them

    ASSESS design choices autonomously
      choose typography, layout, panel organization, proportions, motion, and visual effects
      make the demo comfortable to navigate on desktop and on narrow touch screens
      use a restrained, consistent visual language
      do not treat a subjective visual preference as permission to violate function, performance, or accessibility

##  Rendering correctness and higher-fidelity robot

    HIGH PRIORITY DIRECTIVE improve or replace the custom 3D rendering pipeline
      implement scene geometry and rendering from scratch using native browser APIs
      prefer correct 3D visibility and texture mapping over preserving the existing Canvas 2D internals
      permit a custom WebGL2 renderer with inline shader source and a depth buffer
      permit a robust Canvas 2D renderer if clipping, visibility, texture mapping, and frame performance are demonstrated
      allow a deliberate native-API fallback when browser support requires it
      do not import Three.js or another 3D engine as a runtime dependency
      do not download, paste, or minify an entire third-party 3D engine into the HTML

    WHEN implementing geometry visibility
      preserve coherent geometry across complete camera yaw rotation
      handle near-plane intersections without dropping entire partly visible objects
      use reliable depth comparison or a demonstrably correct visibility strategy
      handle backface culling, polygon winding, surface normals, and double-sided surfaces intentionally
      prevent z-fighting, reversed faces, invalid projections, and texture flashes
      keep partly hidden objects in scene state even when legitimately occluded
      distinguish expected occlusion from accidental disappearance in tests

    WHEN constructing the robot
      improve the helmet shell, visor and facial opening, neck hardware, chest plating, joints, hands, pelvis, thighs, knees, shins, and feet
      replace crude visual intersections with deliberate mechanical connections
      use rounded or beveled contours where they improve the silhouette
      use coherent metallic materials, highlights, cavity shading, and depth cues
      preserve the recognizable 25-module structure and individual selection targets
      keep the human portrait correctly framed in the head assembly
      allow the agent to decide whether to increase geometry density, improve shading, or combine both

    WHEN designing highlights and materials
      make selection distinct from lighting reflections
      avoid excessive bloom, clipping, distracting glow, and unreadable dark surfaces
      use consistent light direction and material response during camera rotation
      keep the selected component identifiable while detached or animated

    HIGH PRIORITY WHEN walking, exploding, or dragging
      keep all module transforms in a consistent coordinate system
      allow a part to remain individually displaced while the gait continues
      do not freeze, duplicate, or lose a part because it is detached
      ensure the head portrait and helmet relationship stays visually coherent during motion

##  Assembly, manipulation, camera, and movement

    HIGH PRIORITY WHEN moving a component
      select the component beneath the pointer with reliable hit testing
      keep its displacement predictable under camera yaw, pitch, and zoom
      maintain the selected component's identity until the user chooses another
      release pointer capture and cancel drag state correctly after pointerup or pointercancel
      show whether the part is mounted, detached, or returning to its mount
      make restoration predictable, with no state disagreement between geometry and diagnostics

    WHEN using exploded view
      separate components far enough to inspect their shapes and attachment positions
      prevent avoidable overlap and excessive off-screen displacement
      animate the transition in both directions
      permit continued orbit, zoom, selection, and inspection
      resolve individual drag overrides consistently when leaving exploded view

    WHEN using walking animation
      maintain believable alternating limb motion, knee flexion, and torso response
      avoid mechanical intersections that visibly break the model
      synchronize attached and detached modules with the same underlying gait phase
      keep a stable idle pose when playback stops
      do not couple walking to audio being enabled

    WHEN using the camera
      support full 360-degree yaw rotation without visual discontinuity
      enforce sensible pitch and zoom limits without surprising jumps
      support mouse, trackpad wheel, and touch gestures where applicable
      stop auto-rotation predictably on manual camera interaction
      make orbit, part drag, and portrait editing gestures unambiguous

    HIGH PRIORITY WHEN Reset is activated
      restore the intended assembly and camera defaults
      stop gait, auto-rotation, and active drag operations
      update control labels and diagnostics to match the actual state
      define deliberately whether dialogue, edited portrait, and sound preference persist; disclose that behavior in the UI

##  Portrait upload, crop editor, and portable save

    HIGH PRIORITY DIRECTIVE implement a usable portrait editor inside the HTML
      allow a user to choose a local image from a file input
      show an immediate preview after successful image loading
      allow the image to be repositioned within a visible facial crop area
      allow zooming and cropping with a preview of the result
      support a practical adjustment control for image rotation when useful
      show how the crop will appear underneath the helmet before applying it
      provide explicit Apply, Cancel, and Restore Default actions
      keep the editor compact, understandable, and usable on narrow screens

    WHEN the user uploads an image
      validate that it is an image the browser can decode
      handle invalid files, failed decoding, and very large images without crashing the scene
      normalize orientation when the browser exposes it through image decoding
      retain the existing portrait until the new crop is applied
      release temporary object URLs and superseded image resources
      never upload the user's image to a remote service

    WHEN the user adjusts a crop
      keep the face-preview aspect ratio consistent with the applied face texture
      avoid stretching the image unpredictably
      support drag/pan and zoom without affecting the main camera
      enforce a crop that fills the intended facial area without blank edges
      render the same committed pixels in preview and on the model

    WHEN the user applies the crop
      replace the live facial texture without a page reload
      keep the portrait aligned with the helmet during orbit, gait, and detachment
      preserve image orientation and readable facial proportions from front and angled views
      make Cancel return to the previous committed portrait

    HIGH PRIORITY DIRECTIVE provide a way to retain the edited portrait in a portable demo
      include a user-facing action to export or download an updated standalone HTML
      embed the committed cropped portrait in that exported HTML
      ensure the exported HTML runs offline with the same core functionality
      explain that editing a browser-loaded HTML cannot silently rewrite the local source file
      do not require localStorage for correctness; optional local persistence is permitted if it is reliable and private
      avoid embedding unrelated source images, test files, or remote URLs

##  Animated dialogue

    HIGH PRIORITY DIRECTIVE upgrade the comic dialogue from static replacement to readable animation
      display dialogue progressively, character by character, while walking is active
      include short pauses at punctuation and occasional natural timing variations
      support spaces, line breaks, and longer text up to an explicitly enforced sensible limit
      keep the balloon near the head without obstructing primary controls
      follow the head's actual position, including intentional detachment
      prevent text updates from changing model geometry or camera behavior

    WHEN dialogue is edited during playback
      restart or reconcile the typing sequence deterministically
      never interleave characters from the old and new text
      keep the UI responsive and avoid redundant overlapping timers

    WHEN walking stops
      choose a predictable pause or completed-text behavior
      make that behavior clear to the user

    WHEN dialogue is empty
      display a useful non-animated placeholder or hide the balloon intentionally

    WHEN the user requests reduced motion
      provide an appropriate static-text alternative

    LOW PRIORITY WHEN visual style permits
      include a restrained cursor blink, subtle facial indicator, or speech timing effect
      reject embellishments that reduce legibility or performance

##  Synthesized motion audio

    HIGH PRIORITY DIRECTIVE add robot-walking audio using native Web Audio APIs
      synthesize sounds locally with oscillators, filtered noise, envelopes, or similar browser primitives
      do not rely on remote audio files, downloads, speech services, or autoplay permission bypasses
      make sounds plausibly mechanical and distinct enough to match footsteps or servos
      synchronize footfall events with the walking phase rather than an unrelated timer
      avoid repeating uncontrolled oscillators or accumulating audio nodes

    WHEN audio is enabled by an explicit user action
      initialize or resume AudioContext as permitted by browser autoplay rules
      expose visible Sound On/Off state and a volume control or equivalent ergonomic adjustment
      ensure sound is audible only when enabled and when a relevant motion event occurs

    WHEN audio is off, muted, or walking is stopped
      emit no continuing footstep sound
      release or silence active sound nodes predictably
      reflect the true enabled state in the interface

    WHEN audio initialization is blocked or unavailable
      fail without breaking visual animation
      show an accurate unavailable or gesture-required state
      never claim a sound played unless the browser accepted audio activation

    WHEN reduced-motion or accessibility preferences warrant it
      keep audio optional, never mandatory for understanding robot state

##  Usability, responsive layout, and accessibility

    HIGH PRIORITY DIRECTIVE keep the application ergonomic
      make navigation, viewing, inspection, photo editing, and playback easy to understand
      prioritize the model and active task over decorative chrome
      keep buttons legible and reachable
      provide clear selected, loading, applying, muted, detached, and error states
      support mouse and touch without requiring pixel-precise interactions

    WHEN displaying a modal editor
      provide keyboard focus management, Escape to cancel, and visible confirmation actions
      prevent canvas gestures from activating through the editor
      return focus to the invoking control on close
      label form controls and expose error messages as text

    WHEN a user navigates by keyboard
      retain working shortcuts for Space, E, and R where appropriate
      do not trigger shortcuts while a text field, slider, or editor control owns input
      permit selecting modules through the manifest without pointer picking
      provide visible focus indication

    WHEN viewport width is narrow
      keep the scene visible and usable
      reorganize panels to avoid inaccessible controls and horizontal overflow
      keep editor actions inside the viewport
      verify both desktop and mobile-emulated layouts

##  Runtime constraints and performance

    HIGH PRIORITY DIRECTIVE preserve the zero-build distribution model
      HTML file opens directly by `file://` without a server
      all runtime code and default assets are inline
      no `import`, dynamic dependency loading, service worker prerequisite, or remote fetch is required
      browser-generated blob URLs may be used only as temporary local image or export resources
      local test servers are allowed exclusively as a Playwright transport

    HIGH PRIORITY WHEN implementing rendering or animation
      use requestAnimationFrame for frame synchronization
      use elapsed time, not frame count, for gait, camera spin, dialogue, and effect timing
      cap pathological elapsed-time jumps after tab suspension
      avoid unnecessary geometry rebuilding, image decoding, and allocation in hot paths
      dispose or reuse GPU buffers, textures, event listeners, timers, and audio nodes
      adapt device-pixel ratio or detail level when performance demands it
      keep controls responsive while the robot is moving

Performance targets under the same recorded test machine and browser configuration:
- Desktop reference viewport: 1280 x 800 CSS pixels, device scale factor 1.
- Mobile reference viewport: 390 x 844 CSS pixels, device scale factor 1.
- After warm-up, target median animation rate at or near 60 FPS on a capable desktop.
- Hard performance gate on the recorded reference environment: at least 45 FPS median during continuous orbit and walking on desktop, and at least 30 FPS median in mobile emulation.
- No persistent freeze, repeated long stalls, unbounded memory growth, or input lag severe enough to interrupt manipulation.
- Compare like-for-like frame timing with the previous accepted/provisional iteration; investigate regressions greater than 15%.
- Record browser version, OS, hardware or runner class, test duration, animation scenario, and measured results. Do not substitute estimates for measurements.

    ASSESS environmental variability
      IF runner performance makes an absolute FPS number unreliable
        record the limitation and use comparable baseline-relative measurements
        retain an explicit performance-risk status until repeatable evidence exists
      do not weaken correctness requirements because the renderer is expensive

##  Sub-agent handoff and implementation freedom

    HIGH PRIORITY WHEN the master delegates a candidate
      give the sub-agent the entire specification or its exact readable path
      provide the baseline HTML path and a private output directory
      include baseline defects, latest test evidence, feature priorities, and unresolved issues
      include strict constraints: single HTML, offline, no npm, no runtime libraries, no Playwright
      describe the candidate's independent implementation emphasis
      require the sub-agent to make decisions instead of requesting repeated design approval
      prohibit writes to root `aromacop.html`, other candidate directories, and master test artifacts

    WHEN the sub-agent implements a candidate
      choose architecture, renderer details, component geometry, UX interactions, and algorithms independently
      work toward all mandatory acceptance criteria
      use existing browser APIs and hand-written source inside the HTML
      preserve or improve all supported existing functions
      run syntax/static checks if available without installing project dependencies
      report known shortcomings instead of hiding them
      deliver a complete `candidate-XX/aromacop.html` and `candidate-report.md`

candidate-report.md minimum contents:
- Candidate approach and rendering architecture.
- Complete file path and static-check commands/results.
- Features added or changed.
- Original functions replaced, retained, or removed, with a reason for behavior changes.
- Expected performance costs and known risks.
- Untested behavior and areas requiring Playwright verification.
- Confirmation that no Playwright/browser acceptance tests were run by the sub-agent.

candidate approaches (illustrative, not mandatory):
- custom WebGL2 meshes with depth-buffered materials and inline shaders
- custom software pipeline with clipped triangles, robust face mapping, and optimized drawing
- mixed native-API approach with renderer changes isolated from the component model

    HIGH PRIORITY DIRECTIVE keep implementations genuinely independent
      avoid having every sub-agent merely rename or reformat the same proposed solution
      do not let candidates overwrite one another
      give all candidates the same product requirements and quality bar
      do not merge untested pieces from several candidates directly into the accepted root
      treat a merged approach as a new candidate and test it in a later version

##  Master-only Playwright browser testing

    HIGH PRIORITY DIRECTIVE reserve all Playwright execution and test verdicts for the MASTER AGENT
      the master runs the same browser checks against every candidate
      the master owns screenshots, traces, performance measurements, comparisons, and release gating
      sub-agents may describe test ideas but cannot execute Playwright or certify browser behavior
      use an installed Playwright capability or externally provided harness
      do not install npm packages or add a build system to the AROMACOP project

    WHEN preparing browser tests
      serve each HTML from its isolated candidate directory if needed, or open via `file://`
      test the final HTML file that would actually be distributed
      clear browser storage and previous test state between candidates
      fix viewport, device scale, motion preferences, and browser versions for fair comparison
      collect page errors, console errors, failed loads, and screenshots
      use deterministic action sequences and explicit waits for animation state
      avoid brittle assertions based on arbitrary single-frame timing

Playwright acceptance matrix, required for each eligible candidate:

    TEST P01 standalone startup
      open the candidate HTML from a local file path
      verify the robot, controls, and module manifest render without a network request
      verify no uncaught JavaScript errors and no required external asset failures

    TEST P02 complete orbit stability
      render an assembled idle pose at yaw angles from 0 through 360 degrees, at intervals no greater than 30 degrees
      repeat at multiple supported pitch angles and at near/far allowed zoom levels
      capture evidence and look for flicker, dropped geometry, inverted surfaces, and invalid face textures
      recognize legitimate back-facing occlusion; fail unintended disappearance or geometry flashing
      repeat while walking and while the assembly is exploded

    TEST P03 selection and component registry
      verify all 25 legacy modules remain in the manifest
      select representative head, torso, left/right arm, and left/right leg components
      verify selection overlay and detail descriptions update correctly
      verify the selected part remains identifiable after camera movement

    TEST P04 drag and reassembly
      drag a representative component away from its mount
      verify it follows the pointer and diagnostics indicate detachment
      orbit and zoom with the part detached
      reassemble and verify its offset and status return to mounted
      repeat the operation while walking

    TEST P05 exploded assembly
      enter and exit exploded view
      verify all modules remain in scene state and reachable via manifest selection
      verify controls remain usable during the transition
      verify camera and assembly state remain consistent

    TEST P06 walking lifecycle
      start walking, sample frames at different gait phases, stop walking, and reset
      verify alternating limb movement and stable state labels
      verify detached parts remain animated and do not vanish

    TEST P07 portrait upload and crop
      upload a known local test image
      verify a visible preview, pan, zoom, crop, Apply, Cancel, and Restore Default
      verify that Cancel does not replace the committed image
      verify that Apply changes the face texture correctly during orbit and motion
      attempt an invalid file and confirm graceful error handling

    TEST P08 portable edited export
      export the standalone HTML after applying a different portrait
      open the exported file in a fresh browser context without network access
      verify the new portrait, controls, model, and motion still function

    TEST P09 dialogue animation
      enter punctuation-containing dialogue and start walking
      verify progressive character appearance and observable punctuation pauses
      edit the text during playback; verify no old text leaks into the new sequence
      stop and restart walking; verify consistent lifecycle
      test reduced-motion behavior

    TEST P10 Web Audio behavior
      enable sound through an actual user gesture
      verify an AudioContext can activate where supported
      verify footfall scheduling is linked to gait phase
      disable sound or stop walking; verify active playback becomes silent
      verify the UI handles audio permission or support failure without crashing
      where audio output cannot be heard by automation, inspect state and scheduled nodes and report that limitation

    TEST P11 viewport and ergonomics
      test 1280 x 800 and 390 x 844 viewports
      verify no critical controls are clipped or hidden behind overlays
      use keyboard and pointer flows, including Escape and focus recovery in the portrait editor
      check visible focus, meaningful labels, and lack of horizontal overflow

    TEST P12 stability and performance
      execute at least 8 seconds of walking plus orbit after warm-up
      measure frame timing on desktop and mobile emulation
      repeat edit, detach, reset, and toggle operations to detect leaks or degraded response
      verify that hidden-tab/resumed-tab timing does not cause violent jumps

    HIGH PRIORITY WHEN Playwright or the required browser is unavailable
      record the exact missing capability or failure
      do not claim a candidate passed browser acceptance
      do not promote an untested candidate to the root HTML
      preserve provisional work and report the blocker

##  Acceptance policy, comparison, and stop conditions

hard gates (mandatory):
- H01: One fully portable, offline `aromacop.html` with no build or runtime dependency.
- H02: No reproducible disappearance/flicker caused by orbit, pitch, zoom, walking, or detachment in the required Playwright scenarios.
- H03: All 25 original modules are available; selection, movement, exploded view, walking, and reassembly work.
- H04: Functional upload/preview/crop/apply/cancel/default portrait workflow and portable edited HTML export.
- H05: Functional animated dialogue with pauses and predictable playback/edit behavior.
- H06: Synthesized walking sounds with explicit enable/disable control, synchronized motion, and graceful audio failure.
- H07: Desktop/mobile layout and primary keyboard/pointer interactions pass.
- H08: No uncaught runtime errors, blocked essential resources, or critical security/privacy regressions.
- H09: Playwright evidence exists for every required acceptance test; known environment limitations are disclosed.
- H10: Measured performance passes the reference-environment rule or remains explicitly blocked pending repeatable measurement; never present the latter as an unconditional pass.

Quality scoring, 100 possible points, assigned by the master from evidence:
- Rendering stability and visual craftsmanship: 25.
- Assembly, interaction, and gait behavior: 20.
- Portrait editor, texture correctness, and export: 15.
- Dialogue timing and synchronized audio: 15.
- Ergonomics, accessibility, and responsive layout: 10.
- Frame timing, responsiveness, and runtime stability: 15.

    WHEN evaluating a candidate
      mark every hard gate PASS, FAIL, or BLOCKED with evidence
      score the six quality dimensions independently
      document observed advantages, regressions, and tradeoffs
      reject a candidate for acceptance if any hard gate is FAIL or BLOCKED
      rank eligible candidates by hard-gate coverage, then total score, then fewer severe regressions
      prefer a slightly less decorative but more stable and usable implementation

    HIGH PRIORITY DIRECTIVE accept only a genuinely finished demo
      require every hard gate to PASS
      require total quality score at least 90 of 100
      require no individual scored dimension below 70 percent of its available points
      require two successful independent Playwright verification runs for the chosen version
      require no unresolved critical or high-severity defect
      stop the loop promptly once acceptance is demonstrated

    WHEN no candidate meets acceptance
      choose the strongest viable candidate only as a development baseline
      prioritize hard-gate failures in the next iteration
      do not copy the provisional version to the project-root HTML
      make the next iteration's candidate approaches address observed shortcomings

    WHEN a hard blocker or quality plateau ends the loop early
      state which gates remain unmet
      identify the last accepted version and strongest provisional candidate
      provide the evidence and recommended next corrective action
      do not present an unfinished demo as complete

##  Test evidence, reproducibility, and handover records

    HIGH PRIORITY WHEN an iteration ends
      save `.docs/runs/vNNNN/iteration-report.md`
      save machine-readable Playwright results when the harness supports them
      save screenshots and traces for failed or visually disputed scenarios
      record the complete candidate comparison and selected baseline
      keep enough context for a fresh master session to resume without guessing

iteration-report.md required fields:
- Iteration number, version directory, timestamp, and originating source checksum.
- Master agent, candidate count, candidate paths, and delegated implementation emphases.
- All candidate outcomes, static-validation results, and individual hard-gate statuses.
- Quality scores with supporting observations, not unsupported adjectives.
- Browser/OS/viewport details, screenshots, traces, frame measurements, and test commands.
- Selected candidate and the specific reasons for selecting it.
- Exact pending defects, suspected causes, reproduction steps, and recommended next tasks.
- Whether root `aromacop.html` was promoted, and if so its checksum.
- Stop reason: accepted, iteration limit, demonstrated plateau, or hard blocker.

    WHEN beginning a later iteration or resumed session
      read `specification.md`
      read the latest iteration report and all unresolved failure evidence
      check that the baseline HTML matches its recorded checksum
      reconstruct current priorities from failing criteria
      give sub-agents this context in the new `handoff.md`

## Change boundaries and verification discipline

    HIGH PRIORITY DIRECTIVE modify only what contributes to this demo
      touch the implementation in the candidate's standalone `aromacop.html`
      create numbered versions, candidate reports, and master-owned test evidence as described
      leave the baseline snapshot, reference images, project-analysis document, and unknown root entry unchanged
      do not introduce a backend, authentication, analytics, telemetry, cloud image upload, or unrelated product features
      do not require users to install tools to run the exported HTML

    WHEN choosing between competing technical approaches
      use engineering judgment instead of following an arbitrary recipe
      prioritize correctness, visual quality, consistency, interaction reliability, and measurable performance
      be creative about geometry, animations, lighting, UI composition, and browser-native audio synthesis
      retain the mandatory functional contract even when architecture is replaced

    HIGH PRIORITY WHEN reporting completion
      identify the exact accepted HTML path
      provide the final iteration and candidate-selection rationale
      state measured Playwright results and unresolved limitations
      confirm whether the exported edited HTML was tested offline
      never claim manual visual inspection or auditory perception that did not occur

## Final audit

    REPEAT UNTIL the final report is internally consistent
      verify the last public HTML is the last accepted artifact
      verify every required feature and test has an evidence-backed status
      verify the number of iterations does not exceed 20
      verify no more than three candidates were active together
      verify only the master executed Playwright
      verify all runtime product assets are contained in one HTML
      verify version history and candidate output directories remain intact
      verify unresolved failures and environmental blockers are stated without concealment

    REMARK implementation freedom is intentional
      the master and sub-agents choose the best architecture and design for this demo
      exact mesh topology, materials, animation easing, panel layout, and audio timbre are not prescribed
      measurable behavior, portability, reliability, and evidence-driven acceptance are prescribed

## T00 Appendix: native word-by-word text-to-speech

Added by user request on 2026-10-09. This appendix adds a feature; it does not relax any original acceptance requirement.

    HIGH PRIORITY DIRECTIVE add native browser text-to-speech for walking dialogue
      use SpeechSynthesis and SpeechSynthesisUtterance, not a remote speech service or downloaded library
      while walking and speech is enabled, speak the current dialogue one word at a time
      wait for each word to finish and add a small deliberate delay before the next
      preserve punctuation with an appropriately longer pause when useful
      keep animated visual dialogue and mechanical Web Audio independent of voice availability
      expose a clear optional voice enable/disable control; do not unexpectedly speak on page load
      prefer an available local-service voice to preserve offline and private operation
      show an accurate unsupported, unavailable, or voice-loading state rather than silently claiming speech

    WHEN walking stops, Reset runs, speech is disabled, the tab is suspended, or dialogue changes
      cancel the active utterance and clear pending words/delays
      prevent callbacks from an old sequence from restarting speech
      restart deterministically from the new dialogue when walking resumes or text changes
      never accumulate utterances, independent repeating timers, or event listeners

    TEST P13 native word-by-word speech
      verify explicit voice control and native speech API support handling
      verify sequential single-word utterances with a measurable inter-word delay
      verify stop, reset, mute, and dialogue-edit cancellation without stale words
      verify the robot keeps walking and visual dialogue still works when voice is unavailable
      record real browser voice availability and distinguish automated sequencing checks from auditory listening
      verify that export preserves the speech implementation and remains self-contained
