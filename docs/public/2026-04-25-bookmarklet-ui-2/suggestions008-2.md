2026-04-25

A00. Usage scenarios document: developer experience for ergonomic theming in AWW Bookmarklet UI

This document describes practical developer usage scenarios for the AWW Bookmarklet UI Framework theming system. It is a companion to the theming PRD. The PRD defines the technical requirements, the token architecture, the component refactor, the API behavior, and the acceptance criteria. This document explains why those requirements matter by describing how real developers might use the framework in their own tools.

These are not formal user stories in the narrow backlog sense. They are narrative usage scenes. Each scene describes a developer, their working context, the product they are building, the users they care about, the constraints they face, and the way the theming system should help them solve the problem. The purpose is to make the desired developer experience vivid enough that Codex can implement the feature with the right instincts.

The framework is expected to be distributed as copyable source and build output. A developer may clone the project, copy it into a `vendor/` folder, or commit the built `dist/` output into their own tool repository. They own their copy. They are allowed to change the framework source if they need to. That is part of the project philosophy. However, a high-quality theming system should make source edits unnecessary for common customization. The preferred path is configuration through public tokens, scoped themes, semantic attributes, and theme recipes. Direct source modification remains available as a last resort, not as the normal workflow.

B00. Scenario 1: Maya gives a capture tool its own identity without forking the framework

Maya is building a small page capture utility for her research team. The tool runs as a bookmarklet on news articles, internal documentation pages, and PDF viewer pages. It opens a compact floating window above the current page, shows a target URL, offers a few capture modes, and lets the user copy selected content as Markdown.

Her team already copied the AWW Bookmarklet UI Framework into `vendor/awwbookmarklet-ui/`. They like owning the source because their internal environment is strict. They cannot depend on a CDN. They cannot assume npm installation at runtime. They want to keep a readable copy of the framework in their repository so that security reviewers and future maintainers can inspect exactly what is shipped.

Maya's first instinct is to edit `button.js`, `window.js`, and `default-theme.js` directly. She wants the capture tool to feel slightly green because her company uses green for research workflows. But she hesitates. If she edits component source for every small identity change, the next copied version of the framework will be harder to merge. She also knows another team may later use the same framework for a screenshot utility and may want a blue or violet accent instead.

The theming system should let Maya write a local theme object in her tool code:

```js
const researchCaptureTheme = {
  [PUBLIC_TOKENS.selectionBg]: "#2f6f4e",
  [PUBLIC_TOKENS.selectionFg]: "#f4fff8",
  [PUBLIC_TOKENS.focusRing]: "#1f7a4a",
  [PUBLIC_TOKENS.titlebarActiveBg]: "#d8e6dc",
  [PUBLIC_TOKENS.windowBg]: "#f1f5f2",
  [PUBLIC_TOKENS.panelBg]: "#fbfdfb"
};

mountWindow(win, {
  ownerPrefix: "research-capture",
  theme: researchCaptureTheme
});
```

The important thing is not only that the color changes. The important thing is that Maya does not need to know how the button Shadow DOM is structured. She does not need to use `::part`. She does not need to patch compiled output. She does not need to fork `AwwButton`. She can keep the framework source pristine while giving her specific tool a recognizable identity.

For her users, the tool still feels like part of the same desktop-like system. It has the same square controls, the same menu behavior, the same statusbar grammar, and the same compact form layout. The green accent simply tells researchers, "This is the capture workflow." The theme expresses product identity without becoming a new UI language.

C00. Scenario 2: Anton makes a dense operations console usable on a small laptop screen

Anton maintains an internal diagnostics bookmarklet for support engineers. The tool opens on customer dashboards and helps support staff inspect page metadata, session details, failed network states, and user-visible configuration. The support engineers often work on small laptops during calls. They need to see a lot of information at once, and they switch between browser tabs quickly.

The default AWW visual style is already dense compared with a modern web app, but Anton's console needs to be denser. The window contains a command bar, a status register, a list of page checks, a table of warnings, and a manual copy fallback. On a 13-inch laptop, the default spacing feels slightly too generous for the amount of information support engineers need.

Anton owns the copied framework source. He could open the components and reduce every `padding: 8px`, every `min-height: 30px`, and every menu item height by hand. But that would be brittle. Some components would become denser than others. Focus rings might clip. Menus might become too short. Inputs could start cutting off text. A direct source edit would solve one screen and create five inconsistencies.

The ergonomic theme system gives him a compact theme instead:

```js
const supportConsoleTheme = {
  [PUBLIC_TOKENS.space1]: "3px",
  [PUBLIC_TOKENS.space2]: "6px",
  [PUBLIC_TOKENS.space3]: "8px",
  [PUBLIC_TOKENS.controlHeight]: "26px",
  [PUBLIC_TOKENS.titleHeight]: "28px",
  [PUBLIC_TOKENS.controlPaddingX]: "8px",
  [PUBLIC_TOKENS.buttonPaddingX]: "8px",
  [PUBLIC_TOKENS.inputPaddingX]: "6px",
  [PUBLIC_TOKENS.windowBodyPadding]: "8px",
  [PUBLIC_TOKENS.panelPadding]: "6px",
  [PUBLIC_TOKENS.cardPadding]: "6px",
  [PUBLIC_TOKENS.menuItemHeight]: "26px"
};
```

The scene that matters is a support engineer on a call. The engineer opens the bookmarklet. The window fits comfortably in the viewport. The menu still opens in the right place. The titlebar is still draggable. The focus ring remains visible when the engineer tabs through controls. The table is denser, but not cramped. Status colors are still legible. The compact theme does not feel like a hack; it feels like the same operating environment tuned for operations work.

This scenario is why tokenized density is important. Compactness is not just a style preference. It is a usability requirement for tools that run inside already-constrained browser contexts.

D00. Scenario 3: Lina creates a softer reading tool while preserving the system grammar

Lina is building a reader assistant bookmarklet. It extracts the main content from the current page, shows a cleaned preview, and lets users copy a summary, cite links, or save notes. The users are editors who spend long periods reading text. They are not running quick diagnostics or collecting dozens of fields. They need a calm surface that feels less mechanical than the default catalog.

Lina likes the AWW framework because it feels stable and distinct from the host page. But for a reading tool, the default zero-radius geometry feels slightly too severe. She wants a small amount of radius on controls and panels. She does not want a modern rounded-card SaaS interface. She only wants enough softness that a text-heavy tool feels comfortable during longer sessions.

Because the framework exposes radius tokens, Lina does not need to modify every component. She writes:

```js
const readerTheme = {
  [PUBLIC_TOKENS.radiusControl]: "4px",
  [PUBLIC_TOKENS.radiusSurface]: "6px",
  [PUBLIC_TOKENS.radiusWindow]: "8px",
  [PUBLIC_TOKENS.windowBg]: "#f4f2f0",
  [PUBLIC_TOKENS.panelBg]: "#fbfaf8",
  [PUBLIC_TOKENS.surfaceRaisedBg]: "#fffdf9",
  [PUBLIC_TOKENS.selectionBg]: "#725c3a",
  [PUBLIC_TOKENS.focusRing]: "#8a6d3b",
  [PUBLIC_TOKENS.buttonShadow]: "none"
};
```

She applies the theme only to the reader window, not to the whole desktop root:

```js
mountWindow(readerWindow, {
  ownerPrefix: "reader-assistant",
  theme: readerTheme
});
```

The user opens the reader tool on a long article. The window appears in warm neutral tones. The titlebar, menu, buttons, inputs, and preview surface all share the same slight radius. Nothing looks patched. Nothing looks like a different component library. The statusbar still looks like a statusbar. The toolbar still behaves like a compact desktop toolbar. The framework's structure remains intact.

This scenario shows why radius must be a first-class theme decision. If only colors are themeable, Lina would either accept a visual mismatch or fork the source. If radius is tokenized, she can tune the emotional tone of the tool without losing the system's skeleton.

E00. Scenario 4: Rafael themes two independent tools on the same page without one overriding the other

Rafael works on a browser productivity suite. His team has three bookmarklet tools: a bookmark cleaner, a page notes panel, and a content exporter. They may all be opened on the same page during a workflow. The team uses one copied AWW framework bundle in their extension package so all tools share the same runtime and component definitions.

The bookmark cleaner uses violet. The page notes panel uses amber. The exporter uses blue. These accents help users distinguish which workflow they are in when multiple windows are open. The tools share the same desktop root because repeated injection should remain safe and because the framework is designed around a singleton root per version.

If theming only works at the root level, Rafael has a serious problem. The last tool that calls `setTheme()` will change the theme for every open window. The bookmark cleaner may suddenly turn amber when the notes panel opens. The exporter may change the active selection color inside the bookmark cleaner. Users will not understand why the UI changes while they are working.

The expected solution is window-scoped theming:

```js
mountWindow(bookmarkCleanerWindow, {
  ownerPrefix: "bookmark-cleaner",
  theme: bookmarkCleanerTheme
});

mountWindow(pageNotesWindow, {
  ownerPrefix: "page-notes",
  theme: pageNotesTheme
});

mountWindow(exporterWindow, {
  ownerPrefix: "content-exporter",
  theme: exporterTheme
});
```

In the user's scene, three windows sit above the same web page. They share the same chrome language, the same menu mechanics, the same focus behavior, and the same statusbar grammar. But each window carries its own accent and slight surface tuning. Opening one tool does not repaint the others. A menu opened from the violet window inherits violet selection. A dialog opened from the amber notes panel does not suddenly turn blue.

This scenario is why the theming PRD recommends `mountWindow(win, { theme })` and warns against global root themes as the only model. Multiple bookmarklet tools are not hypothetical. They are a natural consequence of a shared browser workbench.

F00. Scenario 5: Priya builds a high-contrast compliance tool for users who cannot miss warnings

Priya is building a compliance review bookmarklet. The tool runs on internal approval pages and helps reviewers check required fields, policy restrictions, missing attachments, and blocked submission states. Her users are not casual. They make decisions with financial and legal consequences. The UI must make danger, warning, success, and focus states unmistakable.

The default AWW theme is readable, but Priya needs stronger contrast. She wants black borders, a very visible focus ring, strong selected rows, and state panels that remain clear under poor display conditions. She also needs keyboard navigation to be reliable because some reviewers use keyboard-first workflows.

She does not want to edit `alert.js`, `field.js`, `status-line.js`, and `button.js` separately. If she did, she might accidentally make one warning surface stronger than another or break the relationship between focus rings and selected states. She needs one controlled theme patch.

Her theme looks like this:

```js
const complianceTheme = {
  [PUBLIC_TOKENS.windowBg]: "#ffffff",
  [PUBLIC_TOKENS.panelBg]: "#ffffff",
  [PUBLIC_TOKENS.surfaceRaisedBg]: "#ffffff",
  [PUBLIC_TOKENS.surfaceInsetBg]: "#eeeeee",
  [PUBLIC_TOKENS.inputFg]: "#000000",
  [PUBLIC_TOKENS.textMuted]: "#222222",
  [PUBLIC_TOKENS.borderStrong]: "#000000",
  [PUBLIC_TOKENS.borderSubtle]: "#333333",
  [PUBLIC_TOKENS.dividerColor]: "#333333",
  [PUBLIC_TOKENS.selectionBg]: "#003b8e",
  [PUBLIC_TOKENS.selectionFg]: "#ffffff",
  [PUBLIC_TOKENS.focusRing]: "#ffbf00",
  [PUBLIC_TOKENS.focusRingWidth]: "3px",
  [PUBLIC_TOKENS.dangerBg]: "#fff0f0",
  [PUBLIC_TOKENS.dangerFg]: "#7a0000",
  [PUBLIC_TOKENS.dangerBorder]: "#7a0000",
  [PUBLIC_TOKENS.warningBg]: "#fff5cc",
  [PUBLIC_TOKENS.warningFg]: "#4f3500",
  [PUBLIC_TOKENS.warningBorder]: "#8a6200"
};
```

The user sees a tool where required fields are obvious, invalid states are not subtle, selected command rows are clear, and focus never disappears. The same theme applies to the field labels, alert surfaces, status lines, command palette, and dialog controls because all of them use the semantic state tokens.

This scenario shows why the theme system must not be treated as cosmetic. For some tools, theme support is part of safe operation.

G00. Scenario 6: Chen uses `::part` once, but only after tokens solve the main problem

Chen is migrating an old internal extension page into the AWW framework. The old page has one unusual requirement: a specific legacy toolbar button must visually match screenshots in a training manual. The rest of the UI can use the standard framework theme, but this one button needs a special border treatment.

The framework is copied into the project's `vendor/` folder. Chen could edit the framework source. He could add a custom button variant. He could fork the button component. But the requirement is narrow, and he does not want to expand the public API for one legacy case.

The theming system solves most of his needs through tokens. He sets the app accent, compact spacing, and panel colors normally. Only the single legacy control uses `::part`:

```css
legacy-tool-panel awwbookmarklet-button[data-legacy-action]::part(control) {
  border-style: double;
  border-width: 3px;
}
```

This is the right use of `::part`. It is local. It is intentional. It does not become the primary theme mechanism. Chen can explain it in code review: the framework theme handles the system; this one escape hatch handles a training-manual compatibility detail.

The broader lesson is that `::part` should exist, but it should not be the first thing a developer reaches for. If Chen had to use `::part` for radius, spacing, input padding, menu height, and focus color, the theme system would have failed. Because the common cases are tokenized, the escape hatch remains small and understandable.

H00. Scenario 7: Nora avoids UI flicker in a bookmarklet that mounts inside a heavy page

Nora is building a bookmarklet that runs on complex analytics dashboards. These pages are heavy. They have many charts, observers, sticky headers, and delayed scripts. When the bookmarklet is injected, the page is often already close to the frame budget.

Nora wants to open a themed window immediately after the user clicks the bookmarklet. The theme is dark-gray and amber because the tool is an incident review console. If the window first appears in the default light theme and then changes to amber, the flicker will be visible. On a busy dashboard, even a small flash makes the tool feel unstable.

The correct framework behavior is that `mountWindow(win, { theme })` applies the theme before the window is appended to the visible desktop root. Nora does not need to manually sequence the theme application. The ergonomic API protects her from a subtle rendering problem.

Her code is direct:

```js
const win = createWindow({
  title: "Incident Review",
  content: buildIncidentConsole()
});

mountWindow(win, {
  ownerPrefix: "incident-review",
  theme: incidentTheme
});
```

In the scene, the user clicks the bookmarklet and sees a single stable window appear. It already has the correct surface, accent, focus, and border colors. There is no flash of the default theme. There is no second paint where the controls shift size. There is no temporary mismatch between the window and the menu.

This scenario explains why theming is not just a token map. The runtime must apply scoped themes at the right time. The user's perception of quality depends on that order.

I00. Scenario 8: Omar themes portaled menus and dialogs without losing local context

Omar is building a multi-window browser panel tool. One window shows a URL picker. Another shows a preview. A third shows command history. Each window can have a slightly different accent because each belongs to a different workspace.

The problem appears when Omar opens a menu from the preview window. The menu is portaled to an overlay layer under the desktop root so that it is not clipped by the window body. Technically, this is correct. Visually, it can be wrong. If the menu inherits from the desktop root instead of the preview window, it may lose the preview window's theme and appear in the default accent.

Omar notices the problem during testing. The preview window has a teal selected state, but its menu selection is blue. The mismatch is small but irritating. It makes the framework feel assembled from parts instead of behaving as one system.

The theme architecture should handle this. When a menu is opened from a trigger inside a themed window, it should copy public theme token values from the originating context before or during portal movement. The developer should not need to manually pass theme objects into every menu.

The correct user experience is seamless. The menu opens above the page, avoids clipping, uses the correct z-index, and still looks like it belongs to the window that opened it. The same principle applies to dialogs, command palettes, and toasts when they are associated with a themed source.

This scenario is why the PRD treats portal theming as a major risk. It is not enough for child components to inherit tokens while they remain in the window subtree. Floating UI must preserve context even when the DOM location changes.

J00. Scenario 9: Elena customizes her owned vendor copy only after exhausting configuration

Elena works at a small tools company. Her team builds specialized browser helpers for legal researchers. They copy the framework into `vendor/awwbookmarklet/` and commit it. Their policy is simple: they own their vendor code, and they are allowed to modify it. They do not want to be blocked by a library maintainer or by an external package release.

At the same time, Elena is disciplined. She knows that changing vendor source for every product variation will create maintenance debt. She would rather place product themes in `src/themes/legal-research-theme.js` and keep vendor changes limited to cases where the framework truly lacks an extension point.

Most of her needs are solved by configuration. She changes accent, radius, field density, menu height, and high contrast state colors through tokens. She uses `mountWindow({ theme })` for tool-specific identity. She uses `tone` attributes for alert and status components. She uses `density="compact"` on a few toolbars.

Only one requirement pushes her to source modification. Her legal research tool needs a special citation-preview component that does not exist in the framework. Rather than forcing this into a theme, she creates a new local custom element under her owned copy or downstream source. She still uses the framework's `defineComponent()` helper, `adoptStyles()`, `BASE_COMPONENT_STYLES`, and public tokens.

Her custom component reads like a member of the same system:

```js
class AwwBookmarkletCitationPreview extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;

    const root = this.attachShadow({ mode: "open" });
    adoptStyles(root, [
      BASE_COMPONENT_STYLES,
      css`
        :host {
          display: block;
          border: var(--awwbookmarklet-border-width-surface, 1px) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
          border-radius: var(--awwbookmarklet-radius-surface, 0);
          background: var(--awwbookmarklet-surface-raised-bg, #fff);
          padding: var(--awwbookmarklet-card-padding, 8px);
        }
      `
    ]);

    root.innerHTML = `<slot></slot>`;
  }
}
```

This scenario matters because the framework's distribution model gives developers full control. They can edit anything. But a strong theming system lets them reserve that freedom for real product extensions, not routine visual changes.

K00. Scenario 10: Sam prepares a reusable theme recipe for a team of downstream implementers

Sam is the maintainer of a set of internal bookmarklet tools. He is not building one tool. He is creating a small platform for other developers inside the organization. He wants each team to copy the framework, build their own tool, and follow a consistent theming pattern.

He writes a short internal guide. It tells developers not to edit `button.js` to change colors. It tells them not to paste CSS into every component. It gives them three approved recipes: default utility, compact operations, and high contrast review. It also explains when source modification is acceptable.

The framework's API makes the guide simple. Each team imports `PUBLIC_TOKENS`, creates a plain object, and passes it to `mountWindow()`.

A team building a metrics tool uses the compact operations recipe. A team building a policy review tool uses high contrast. A team building a content export tool uses the default utility recipe with a custom accent. None of them need to understand the internal Shadow DOM layout of `awwbookmarklet-window`, `awwbookmarklet-menu`, or `awwbookmarklet-button`.

Sam's success condition is not that every tool looks identical. It is that every tool feels governed by the same grammar. The user recognizes the titlebar, the menu, the command palette, the status line, and the manual fallback pattern. Tool identity appears through controlled variation, not through new local CSS systems.

This scenario shows the real ergonomic payoff. A theme system is successful when it becomes easy to teach. Developers should be able to learn the model in minutes: tokens for values, attributes for modes, window themes for local identity, root themes for suites, `::part` for rare escape hatches, source edits only when the product genuinely needs a new component or behavior.

L00. Cross-scenario conclusions

Across these scenarios, the same pattern appears repeatedly. Developers want control, but they do not want to fight the framework. They value owning the copied source, but they prefer not to edit it for ordinary theme changes. They care about their own users, and their theme choices are not arbitrary decoration. They are trying to make tools clearer, denser, calmer, safer, more readable, or more recognizable.

The framework should therefore make the common path configuration-based. A theme patch should handle colors, state tones, radius, density, spacing, button feel, menu rhythm, and window padding. A scoped theme should apply to one window without repainting other tools. Portaled surfaces should preserve local context. Defaults should remain coherent. Advanced overrides should remain possible but should not be required.

The ideal developer experience is this: the developer copies the framework into their project, keeps full ownership of the files, creates a small theme object near their tool code, mounts a themed window, and sees the UI adapt coherently. They know that if the framework does not fit some future specialized need, they can edit the source. But for normal product identity and usability adjustments, they do not need to.


