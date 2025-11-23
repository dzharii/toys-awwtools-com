# Manual User Validation
Date: 2025-11-23

The following set of validations will be performed during manual / automated testing phase. 



S00 Acceptance Test Overview 00
 This section defines an acceptance test to-do list for validating that the implementation satisfies the functional and technical specification. Each numbered item describes a test task that should be executed manually in a modern desktop browser by opening index.html from the local file system. Successful completion of all tasks indicates that the editor and its UI library behave according to the specification.

T00 Environment and Initialization Tests 00

Test 1: Local file open
 Open index.html directly from the file system in a modern desktop browser. Confirm that the editor UI loads without any HTTP server and without console errors.

Test 2: Global namespaces
 In the browser developer console, confirm that the global UI library object (for example window.SubwayUI) and the global editor core object (for example window.SubwayEditor) are defined and of type object or function.

Test 3: Editor creation
 Confirm that the editor initializes automatically after page load or via a clear bootstrap path. Verify that the main canvas area, toolbar, and any status bar are visible and usable.

Test 4: No module usage
 Inspect loaded script tags in index.html and confirm there are no type="module" attributes. Verify in source that there are no import or export statements in JavaScript code.

Test 5: No external dependencies
 Confirm that the page does not reference external script libraries or stylesheets from CDNs or package managers. All scripts and styles must be local files.

U00 Canvas, Viewport, Pan, and Zoom Tests 00

Test 6: Initial canvas rendering
 Confirm that an empty working area is displayed, implemented with SVG or canvas, aligned within its container, and that no content is visible initially.

Test 7: Panning with mouse
 With the default or pan mode active, drag on empty canvas space. Confirm that the viewport moves, and any existing content moves accordingly while coordinates used for nodes remain logical and consistent.

Test 8: Zoom via mouse wheel
 Use mouse wheel over the canvas. Confirm that zoom in and zoom out take effect and that zoom is centered near the cursor position.

Test 9: Zoom controls
 Use any zoom in, zoom out, and reset or fit controls in the toolbar. Confirm that they adjust zoom level and that zoom indicator text or percentage updates via UI library.

Test 10: Fit to diagram
 After creating several nodes (use later tests), invoke a fit-to-diagram or reset view operation. Confirm that all created content becomes visible within the viewport.

Test 11: Grid visibility toggle
 Enable or disable any grid or guide display if available. Confirm that grid appears or disappears, and that it does not interfere with selection or rendering.

V00 Node Creation, Selection, and Manipulation Tests 00

Test 12: Node creation
 Select the node creation tool. Click on the canvas in several locations. Confirm that circular nodes appear at click positions with default styling and labels.

Test 13: Node selection
 Switch to selection tool mode. Click on a node. Confirm that visual selection feedback appears, such as highlight or thicker border, and that only the clicked node is selected.

Test 14: Node movement
 With a node selected, drag it to a new location. Confirm that the node moves smoothly while dragging, and its new position persists after mouse release.

Test 15: Node property editing
 Select a node and modify its properties via the property panel or controls. Change label text, label placement (inside, above, below, left, right), size preset if available, and fill color. Confirm that each change is visible on the canvas.

Test 16: Node deletion
 Select a node and press the delete key or activate a delete control. Confirm the node is removed from the diagram and that any attached connections disappear.

Test 17: Multi-selection
 Using drag selection or modifier keys, select multiple nodes. Confirm that all selected nodes show consistent selection feedback and can be moved together as a group.

Test 18: Alignment and distribution
 With several nodes selected, invoke horizontal or vertical alignment commands if implemented. Confirm nodes align to common axes. Invoke distribution commands if available and confirm even spacing.

W00 Connection Creation and Manipulation Tests 00

Test 19: Connection creation
 Select the connection tool. Click on one node as source, then another as target. Confirm that a straight or diagonal connection line appears between nodes.

Test 20: Connection attachment behavior
 Move one of the connected nodes. Confirm that the connection updates its endpoints so that it still visually connects node perimeters.

Test 21: Connection selection and deletion
 Select a connection by clicking on its line. Confirm visual selection feedback. Delete the selected connection via delete key or control. Confirm that nodes remain and only the connection is removed.

Test 22: Prevent invalid connection
 Attempt to create a connection by clicking empty space or by using only one node click. Confirm that the editor does not create a broken connection and provides clear feedback if possible.

Test 23: Self-connection behavior
 Attempt to create a connection from a node to itself. Confirm behavior matches design choice: either it is prevented with feedback, or a visually coherent self-connection is created.

Test 24: Connection styling
 If connection styles such as dashed lines or arrows are implemented, change a connection style via UI controls. Confirm visual style updates correctly.

X00 Text and Legend Tests 00

Test 25: Standalone text creation
 Select the text tool. Click on the canvas outside any node. Confirm a text element appears and becomes editable. Type content and confirm it is visible and persists after focus changes.

Test 26: Text styling
 Select a text element and change font size preset and color if controls are available. Confirm that changes apply correctly.

Test 27: Text alignment and position
 Drag a text element to a new position. Confirm it moves correctly, remains selected during drag, and that its position persists.

Test 28: Node label editing
 Select a node and edit its label text directly or through a property panel. Confirm that label text updates and stays associated with the node.

Y00 Color Palette and Style Tests 00

Test 29: Palette rendering
 Open the color palette control. Confirm that a predefined, limited set of colors is shown.

Test 30: Apply node color
 Select a node and choose a color from the palette. Confirm that the node fill color changes accordingly and is rendered consistently at different zoom levels.

Test 31: Apply connection color
 If supported, select a connection and change its color using the palette or line style controls. Confirm the connection updates to the selected color.

Test 32: Theme or background
 If themes (light or dark) are present, switch themes. Confirm that background, default strokes, and text colors adjust while preserving readability of nodes and connections.

Z00 Snap and Alignment Helper Tests 00

Test 33: Snap-to-grid movement
 Enable snap-to-grid. Create or move a node and observe its position. Confirm it aligns to grid intersections.

Test 34: Snap modifier override
 While dragging a node with snap enabled, hold a modifier key designated to bypass snap. Confirm the node moves smoothly without snapping and can rest at arbitrary positions.

Test 35: Perimeter snapping for connections
 Create a connection between two nodes. Inspect the line endpoints visually at various zoom levels. Confirm that lines appear to connect to circle edges rather than centers.

Test 36: Alignment guides
 Move a node near horizontal or vertical positions of other nodes. Confirm that alignment guides briefly appear or that snapping occurs along common axes when intended.

AA00 Hit Testing and Interaction Mode Tests 00

Test 37: Node vs connection hit priority
 Place a connection that visually overlaps a node. Click near the overlap region. Confirm that selection prioritizes nodes when clicking on the node area and connections only when clicking directly on the line.

Test 38: Background clicks
 Click on empty canvas areas in selection mode. Confirm that any existing selection is cleared and no spurious objects are selected.

Test 39: Mode switching
 Switch between selection, node creation, connection creation, and text tools via toolbar buttons and keyboard shortcuts. Confirm that the current mode is clearly indicated and that mouse actions behave according to the selected mode.

Test 40: Pan mode interaction
 Activate pan mode via button or key. Drag the canvas. Confirm that the editor pans instead of creating or selecting elements until pan mode is deactivated or a different tool is chosen.

AB00 Keyboard Shortcut Tests 00

Test 41: Delete shortcut
 Select one or more nodes or connections and press delete or backspace. Confirm that all selected items are removed.

Test 42: Undo and redo
 Perform a sequence of actions such as creating nodes, moving them, and adding connections. Use undo shortcut to step backwards through each change. Then use redo shortcut to step forward again. Confirm that canvas state matches expectations at each step.

Test 43: Nudge controls
 Select a node and use arrow keys to nudge it in small increments. Confirm that the node moves the same distance for each key press and that its connections update.

Test 44: Tool shortcuts
 If keyboard shortcuts exist for switching tools (for example keys for select, pan, node, connection, text), trigger them. Confirm that the active tool changes and UI reflects the change.

AC00 Persistence: Save and Load Tests 00

Test 45: Save to JSON
 Create a nontrivial diagram with multiple nodes, connections, and text elements. Use the save feature to export a JSON file. Confirm that a file with a .json extension is downloaded.

Test 46: Load from JSON
 Reload the page to clear current state, then load the previously saved JSON file. Confirm that all nodes, connections, text elements, colors, positions, and settings are restored correctly.

Test 47: Invalid JSON handling
 Try to load an invalid or unrelated JSON file. Confirm that the editor detects the error, shows an understandable message, and does not corrupt existing diagram state.

AD00 Export: SVG and PNG Tests 00

Test 48: Export SVG
 Create a diagram and trigger SVG export. Open the resulting .svg file in a browser or vector editor. Confirm that the image matches the on-screen diagram and scales without quality loss.

Test 49: SVG styling integrity
 Inspect the SVG visually at different zoom levels. Confirm that node colors, line styles, labels, and background appear as expected and that any required styles are present within the file.

Test 50: Export PNG
 Trigger PNG export. Open the resulting .png file in an image viewer. Confirm that the exported bitmap image matches the diagram, including all visible nodes, connections, and text.

Test 51: Full diagram export
 With content spread across a large area, export both SVG and PNG. Confirm that exports capture the intended region (either the entire diagram or current viewport, according to design) and that clipping behavior matches expectations.

AE00 UI Library Behavior Tests 00

Test 52: Toolbar construction
 Confirm that the toolbar is built using the UI library rather than manual DOM markup for each button. Verify by creating or modifying a button via UI library code and observing its presence and behavior.

Test 53: Button styling consistency
 Inspect all toolbar and panel buttons. Confirm that their spacing, fonts, hover behavior, and pressed states are consistent, indicating that shared CSS and UI library patterns are applied.

Test 54: Toggle button state
 Use a toggle-style control such as snap or grid visibility. Confirm that clicking toggles its state, visual representation (for example pressed vs not pressed), and editor behavior (for example snapping on or off).

Test 55: Color palette control
 Interact with the palette provided by the UI library. Confirm that choosing a color triggers callbacks into the editor core and that the editor responds (for example by changing active color for new nodes).

Test 56: Zoom control integration
 Use zoom controls constructed by the UI library. Confirm that they call editor callbacks and that editor updates zoom and informs UI library to update displayed zoom percentage.

AF00 Error Handling and Validation Tests 00

Test 57: Broken connection references
 Manually or via script, attempt to load a diagram with missing node references in connections. Confirm that the editor detects the issue and either rejects the diagram with a clear message or repairs it gracefully without unstable state.

Test 58: Duplicate identifiers
 Attempt to load a diagram with duplicate node or connection identifiers. Confirm that the editor handles this case by rejecting the file or resolving duplicates and informing the user.

Test 59: File reading errors
 Attempt to load a file but cancel the file chooser dialog. Confirm that the editor remains stable and does not enter an inconsistent state.

Test 60: Unexpected runtime errors
 Intentionally cause edge-case operations (for example rapid tool switching while dragging, extremely fast panning and zooming). Confirm that no unhandled exceptions appear in the console and that the editor remains usable.

AG00 Non Functional and Performance Tests 00

Test 61: Performance with many elements
 Create or load a diagram containing several hundred nodes and connections. Test panning, zooming, selection, and dragging. Confirm that interactions remain reasonably smooth without severe lag.

Test 62: Memory behavior
 Perform extended editing sessions including save and load cycles. Monitor browser memory usage qualitatively. Confirm that usage does not grow uncontrollably over time for typical workflows.

Test 63: Cross-browser smoke test
 Open the editor in at least two different modern desktop browsers. Perform a representative subset of tests including node creation, panning, zooming, save and load, and exports. Confirm consistent behavior.

This acceptance test to-do list can be used as a checklist. Every test should be marked as passed or failed, and any failures should be used to drive fixes until all items pass.



