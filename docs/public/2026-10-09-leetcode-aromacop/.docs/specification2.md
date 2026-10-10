2026-10-09

# AROMACOP: Next iteration - New features and improvements

We are continuing development of the existing AROMACOP project. The previous two iterations have been successful, and we now want to extend the application with several new interactive features. The goal is to make the robot more expressive, improve its visual presentation, and introduce additional ways for users to interact with the character and its environment.

This is a continuation of the same project, using the current implementation as the starting point. All existing functionality should remain available, including the walking animation, component manipulation, exploded view, portrait editor, camera controls, mechanical sounds, dialogue, and other features already implemented.

The development process remains unchanged. The same master agent is responsible for organizing the work, assigning implementations to up to three sub-agents, testing the results with Playwright, comparing implementations, and selecting the strongest version. We will continue creating numbered iteration folders, preserving previous versions and maintaining the existing acceptance criteria and quality standards.

The new requirements should be incorporated into the next available iteration. There is no need to repeat the previous development work or redesign features that are already functioning correctly, unless changes are necessary to integrate the new functionality.

The final application must remain a single, self-contained HTML file. Any additional assets required at runtime must be embedded directly into that file. The existing restrictions on external dependencies, build systems, and runtime network resources remain in effect.

## S00. Built-in specimens and character selection

We want to introduce two predefined human identities that can be selected as the face inside the AROMACOP helmet.

Two prepared image assets are already available in the project:

`ref-images\spe01.png`

`ref-images\spe02.png`

These images represent two different specimens. Both portraits have been prepared as hairless characters, without head hair, eyebrows, or facial hair, and have transparent backgrounds. They should be used directly as the source assets for the corresponding robot identities.

The application should read these images during development, convert them into Base64 data, and embed them into the standalone HTML file. The delivered application must not depend on the original PNG files being present on disk.

We want a character-selection control with three radio-button options: Specimen 1, Specimen 2, and Custom specimen.

When the application starts for the first time, it should randomly select either Specimen 1 or Specimen 2. Both should have an equal probability of being selected. The corresponding portrait should immediately become the robot's face texture.

Once the application has started, the selected specimen should remain unchanged unless the user explicitly selects another option. Walking, resetting the robot, moving components, or changing the camera should not randomly switch the character.

Selecting Specimen 1 or Specimen 2 should immediately update the face texture without reloading the page.

The Custom specimen option should use the portrait editor that was developed during the previous iterations. If the user selects Custom specimen and has not yet provided a custom portrait, the application should open the existing portrait-editing workflow and offer a way to select an image from the computer.

The user should then be able to preview, position, scale, crop, and apply the image in the same way as before.

If the user cancels the operation without selecting or applying an image, the previous specimen should remain active. The application should never display an empty face simply because the user selected Custom without completing the operation.

Once a custom image has been successfully applied, it should remain available. The user should be able to switch between the built-in specimens and the custom specimen without repeatedly uploading the same photograph.

There should also be an understandable way to edit or replace the custom portrait.

The built-in images, the active selection, and any committed custom portrait should be included when the user exports the customized HTML application. Opening an exported copy should restore the saved specimen selection and its corresponding face.

The agent can decide how to integrate these controls into the existing interface. The objective is to make character selection immediate, understandable, and visually consistent with the rest of the application.

## T00. Improved helmet and detachable face shield

The next improvement concerns the robot's helmet.

We want the helmet to have a stronger resemblance to the armored, futuristic design associated with RoboCop. It should have more convincing mechanical construction, additional visible details, and a substantial front shield that covers the human face.

The shield is an important new component.

When the application starts, the shield should initially be closed, covering the selected specimen's face. The user should see an armored robot helmet rather than an immediately exposed photograph.

The user should then be able to raise or open the front shield to reveal the human face underneath.

This should be presented as a mechanical action. The shield should move in a convincing way, with an appropriate transition, as though it is connected to the helmet through a hinge or another mechanical mounting mechanism.

The exact design and movement are left to the implementation agent. The result should look physically coherent and fit the existing character.

The shield should also be independently detachable.

This means the helmet shell and the front shield are separate interactive components. The user should be able to select the shield, remove it from its mounted position, move it around the 3D scene, and reassemble it.

Detaching the shield should expose the face, while leaving the rest of the helmet intact unless the user separately removes other components.

The new shield must participate in the existing component-selection, dragging, assembly, and diagnostics systems. If an additional component is introduced, the manifest and component counts must reflect the actual model.

The shield must remain correctly positioned during walking, camera rotation, and head movement. Its geometry should not flicker, disappear, intersect incorrectly with the face, or produce visible depth-rendering errors.

The portrait should appear naturally integrated into the helmet. When the shield is raised or detached, the face should become visible behind the surrounding armor.

The user should be able to close the shield again, restoring the armored appearance.

The entire interaction should feel like part of the robot's mechanical design rather than an ordinary image being hidden or displayed.

## U00. Sidearm, holster, and cinematic draw animation

We also want to introduce a new character interaction inspired by a cowboy-style gun draw.

The robot should carry a long-barreled, futuristic sidearm. The weapon should have a recognizable three-dimensional shape, appropriate mechanical details, and a design that fits the AROMACOP character.

When the robot is idle, the sidearm should be stored in a visible holster or another convincing mechanical storage position, preferably attached to the robot's hip or upper leg.

The application should provide a control that allows the user to draw the sidearm.

When activated, the robot should perform a coordinated animation in which its arm reaches toward the holster, takes the weapon, and brings it into a visible position.

The action should include a short, cinematic rotation or spinning movement, similar to the way a cowboy rotates a revolver in the hand.

The weapon should visibly rotate in three-dimensional space rather than simply changing between static positions. The hand, wrist, forearm, and arm should participate in the sequence enough to make the action believable.

After drawing the sidearm, the user should be able to activate another action to return it to the holster. The return movement should also be animated.

The agent may decide whether to implement this as a single control that alternates between drawing and holstering, or as separate controls. The user should always understand the weapon's current state and the action available next.

The sidearm should remain correctly attached to the hand while being held and correctly positioned in its holster when stored.

The animation must work properly with the application's existing camera system. The weapon should remain visible and geometrically stable when the user rotates around the robot.

This interaction should also have sound.

We want mechanical sounds associated with drawing the weapon, rotating it, and returning it to the holster. These can include subtle metallic clicks, servo movements, mechanical locking sounds, or other synthesized effects appropriate to the character.

The sounds should be synchronized with the corresponding actions rather than played arbitrarily.

The existing Web Audio implementation can be extended to generate these sounds. They must respect the application's sound settings, including mute and volume controls.

The interaction should remain functional with sound disabled.

The agent should also consider what happens if the user activates the draw action while the robot is walking, or while an arm component has been detached. These situations must be handled coherently. The application should not produce broken animations, duplicated weapons, incorrect transforms, or inconsistent state.

The agent can choose whether the action is temporarily unavailable in certain incompatible states or whether it can be integrated into the existing animation. The behavior should be predictable and understandable.

We are not requesting a shooting mechanic, combat simulation, projectiles, or targeting system. The purpose of the sidearm is to add character, mechanical animation, and an entertaining interactive sequence to the demonstration.

The agent has creative freedom in how the sidearm and its animation are designed, provided the result meets the expected visual and interaction quality.

## V00. Large interactive background monitor

We want to add a large display monitor to the background of the 3D scene.

This monitor should look like a substantial physical object in the robot's environment. It should resemble a large industrial television, control-room display, or futuristic electronic screen.

It should have a deliberately designed frame, visible depth, mechanical or electronic details, and controls that fit the visual style of the AROMACOP application.

The monitor should feel like part of the scene rather than a conventional HTML image placed behind the canvas.

By default, the monitor should be switched off.

When it is off, the display should show a dark or blank screen. The monitor's frame should remain visible, so users can recognize it as an interactive object.

The user should be able to click directly on the monitor to select an image from the computer.

The image-selection interaction should be integrated into the monitor itself. We do not want a large, generic button labeled "Upload image" or "Change image" occupying the interface.

Instead, the monitor should have a small, appropriately styled control that suggests interacting with the display. This could resemble a physical button, input control, or another element that belongs to the monitor's design.

The exact control design is left to the agent.

When the user chooses an image, it should appear on the monitor's screen, and the monitor should automatically switch on.

The uploaded image should be scaled to fill the display area. The agent may choose the most appropriate fitting behavior, but the result should use the available screen space and keep the content readable. The display should not show unexplained blank regions or inappropriate cropping.

The monitor should also have an on/off control.

Turning the monitor off should make its display dark without deleting the selected image. Turning it on again should restore the previous image.

The user should be able to replace the image by interacting with the monitor again. Canceling the file picker should preserve the current image and power state.

The screen should have a subtle electronic interference effect.

We want to suggest the appearance of an electronic display, with restrained scanlines, slight waves, occasional interference, subtle distortion, or small glitch effects.

These effects should be animated, with enough variation to make the screen appear active rather than completely static.

However, the image itself must remain readable. The interference should not dominate the display or repeatedly obscure its content.

The agent should find an appropriate balance between atmosphere and usability. The result should feel like an operating electronic monitor rather than a deliberately damaged screen.

The monitor should remain stable within the 3D environment when the camera moves. Its display should respect the monitor's orientation and perspective.

The background monitor should also complement the robot rather than compete with it for attention.

It should be large enough to be noticeable, but positioned so that it does not obstruct the robot or interfere with component selection, camera navigation, or the main assembly interactions.

The uploaded monitor image should be handled locally in the browser.

When the user saves the customized HTML, the selected image should be embedded in the exported file, together with its display state. The exported application should reopen with the same monitor image and saved on/off state, without needing to access the original file.

The monitor should continue to work when the application is opened offline.

The agent has freedom to choose the monitor's geometry, display technology, interference implementation, placement, and control design.

## W00. Interaction consistency and overall presentation

These new features should work together as parts of the same application.

The specimen selector determines which human face appears inside the helmet. The helmet shield determines whether that face is covered or visible. The portrait editor handles custom faces. The robot continues to support walking, component detachment, material customization, and other previously implemented interactions.

The sidearm adds another animated activity, while the background monitor provides a separate interactive element within the environment.

The interface should remain organized and easy to navigate despite the additional controls.

We do not want to add a separate collection of unrelated buttons for every new feature if a more coherent design is possible.

The agent should decide how to group the specimen selector, helmet controls, sidearm actions, and monitor interactions so that users can discover them without unnecessary searching or confusion.

The new features should also preserve the existing visual identity of the application. Colors, materials, typography, transitions, and control styling should form a consistent design.

The robot must remain the central subject.

We want to maintain a high standard of rendering quality. Adding new geometry or effects must not reintroduce the disappearing surfaces, flickering polygons, incorrect occlusion, or unstable transformations addressed in previous iterations.

The additional animations should remain smooth and should not cause noticeable performance degradation during camera movement or walking.

All controls must behave consistently with the actual application state. If an interaction is temporarily unavailable, the interface should communicate that appropriately rather than allowing a broken action.

The agent should also preserve existing accessibility and responsive-layout behavior. The application should remain usable on desktop and smaller screens.

The intention is to extend an already successful demonstration while making the character and environment feel more complete.

## X00. Testing and acceptance expectations

The existing Playwright testing process remains mandatory.

The master agent should test each candidate implementation in the browser, evaluate the new interactions, and ensure that previously functioning features have not regressed.

For specimen selection, testing should verify that a fresh launch selects one of the two built-in specimens, that both radio buttons work, and that changing the selection updates the robot's face.

The Custom specimen option should be tested with an actual uploaded image, including the portrait preview, cropping, applying, canceling, and switching back to a previously committed custom image.

For the helmet, testing should verify that the shield starts closed, can be opened to reveal the face, can be detached independently, and can be returned to its mounted position. The scene should also be checked from different camera angles during these operations.

For the sidearm, testing should verify the complete draw, spin, and holster sequence. Repeated activation must not leave the weapon in an inconsistent state. Sound behavior should be checked with audio enabled and disabled, including synchronization with the animation.

For the monitor, testing should confirm that it starts off, responds to interaction, accepts an uploaded image, displays it correctly, and supports turning the display off and on without losing the image. The interference effects should remain restrained enough that the displayed content is readable.

The master agent must also test combinations of interactions, including walking while the visor is open, changing specimens while the camera is moving, using the sidearm while other animations are active, and observing the monitor from different viewpoints.

The exported HTML should be opened in a fresh browser context to verify that both built-in specimens, the active custom portrait if one exists, the selected monitor image, and all required application logic are embedded correctly.

The application should still operate without network access.

Performance and reliability expectations remain the same as in the original specification. No candidate should be accepted simply because the new features appear visually attractive if those features introduce functional defects or reduce the stability of the existing application.

The master agent should preserve testing evidence, compare candidate implementations, and select the best verified result using the established quality criteria.

## Y00. Continuation and expected outcome

The next iteration should begin from the latest successful AROMACOP implementation and introduce these new features without discarding previous work.

The project already has an established development process, version history, testing strategy, and acceptance standard. Those arrangements remain in effect.

The master agent should continue using the existing version-numbering convention, creating a new version folder for each additional iteration and preserving earlier implementations.

The cumulative limit of 20 iterations remains unchanged. Since two improvement iterations have already been completed, the remaining development work should continue within that same limit, using the actual version history to determine the next version number.

Up to three sub-agents may produce alternative implementations. The master agent remains responsible for running Playwright, comparing results, deciding which implementation meets the highest quality standard, and promoting the accepted HTML.

All previous requirements continue to apply. This change request adds new functionality and acceptance expectations.

We expect the next successful version to contain two embedded selectable specimens, a reusable custom-specimen option, a detailed helmet with a detachable front shield, a long-barreled sidearm with a coordinated draw-and-holster animation, and a large interactive monitor with image loading, power controls, and subtle interference effects.

The application should retain its existing modular construction behavior, smooth walking, portrait editing, audio, dialogue, camera navigation, and other completed features.

The overall experience should feel like a more developed interactive character demonstration. Users should be able to change the human identity inside the robot, reveal or cover its face, manipulate its armor, trigger a cinematic weapon-handling animation, and customize the electronic display in its environment.

The implementation agent should use its own judgment to determine how these capabilities are best designed and integrated. We want a coherent finished result, with appropriate mechanical detail, responsive interactions, reliable state management, and a consistent visual style.

The final deliverable remains one standalone `aromacop.html` file, containing all necessary code and assets, operating offline without installation or external dependencies.

The expectation is to continue improving the existing product through the established iterative process until the expanded requirements meet the same quality and reliability standards as the previous accepted version.