A00 Project framing

This project is a single, self-contained reference page designed as a visual board of sticky notes. It is not a single-page application in the framework sense. It is a document-like interface with light application behavior, where the primary value comes from presentation, legibility, spatial organization, and low-friction editing of content directly in HTML. The page should feel handcrafted, tactile, and slightly irregular, while remaining structurally predictable and easy to maintain.

The visual metaphor is a pinboard or wall of notes. The user should experience it as a curated collection of reference fragments rather than as a formal database or dashboard. The design goal is "organized irregularity": it should look alive and slightly procedural, but never random enough to feel broken, hard to scan, or unreliable.

The implementation goal is equally important. The page should be build-step free. A single HTML file with linked or embedded CSS and a small optional JavaScript layer is the preferred delivery model. The content should remain editable as plain HTML so that adding or changing notes is easy without needing a CMS, framework, or compilation step.

A01 Product goals and non-goals

The page exists to present useful Seattle-related reference information in a format that feels visually memorable and pleasant to browse. It should support fast scanning, category-based grouping, mobile and desktop readability, and future enhancement for searching or filtering. It should also create a distinctive identity through CSS-heavy rendering rather than through images or complex front-end infrastructure.

The primary goals are these. First, the page must feel visually unique and tactile. Second, the content must remain readable under all note colors and decorative effects. Third, the layout must adapt smoothly from phone to desktop without becoming either cramped or excessively stretched. Fourth, the authoring model must stay simple enough that new notes can be added by writing HTML only. Fifth, the page should look procedural, but the procedural behavior should be deterministic and repeatable.

The non-goals are also important. This should not depend on a large client-side framework. It should not require canvas rendering. It should not simulate full randomness with unstable outputs on every refresh. It should not behave like a masonry experiment that destroys reading order or accessibility. It should not sacrifice legibility for visual novelty.

A02 Experience principles

The UX should be guided by five principles.

The first principle is tactile realism. Notes should feel like paper objects attached to a surface, with slight lift, shadow, tilt, compression, and edge variation. The realism should be suggestive rather than photorealistic. CSS should imply material properties without becoming decorative noise.

The second principle is controlled irregularity. Every note should have small visual differences such as tilt angle, depth, corner curl, tape style, or shadow offset. These differences should come from a predefined pattern system, not from runtime randomness. The user should perceive variation, but the designer should retain control.

The third principle is readable contrast. The note body may use varied background colors and subtle textures, but text must remain easy to read. The visual treatment should always subordinate itself to content.

The fourth principle is bounded responsiveness. The board should fluidly adapt to viewport size, but within a controlled maximum width. Ultra-wide screens must not create endless horizontal sprawl. The board should feel like a centered object with compositional integrity.

The fifth principle is progressive enhancement. The base experience must work with HTML and CSS alone. JavaScript can later add client-side filtering, instant search, note collapsing, or category highlighting, but the core information layout must not depend on it.

A03 Information architecture

The page should be a single board with category regions rather than multiple panels or separate columns. A one-panel approach is stronger for this concept because it preserves the board metaphor and allows the content to feel like one living surface. Categories should still be clearly distinguished, but through section headers, spacing rhythm, and local note clusters rather than through hard panel separation.

The page should begin with the most urgent and practical information at the top. In your Seattle example, the top section should contain emergency and essential services such as 9-1-1, urgent care references, non-emergency city contacts, and crisis support resources. This follows real-world urgency and gives the page a clear entry point.

Below that, the board can transition into informational and lifestyle categories. A reasonable category order would move from emergency and core services into news and local reading, transit and movement, food and bars, places to go, neighborhoods or landmarks, civic resources, and optional personal notes or curated favorites. The user should feel that the board becomes less critical and more exploratory as they scroll.

Each category should feel like a local cluster of notes. The category header is not just a title but an anchor that explains why the nearby notes belong together. The board should never feel like a flat pile of unrelated cards. It should feel like islands of meaning on one shared surface.

A04 Content model

Each sticky note is the primary content unit. A note should support a concise title, a text block, and an optional link region. Some notes may contain only a title and a short action. Some may contain several lines of descriptive text. Some may point to one or more external resources. This content structure should stay loose enough to support real-world reference material.

The content model should avoid forcing every note into identical proportions. Notes should support at least three density levels: brief, standard, and extended. A brief note might be one or two lines, such as a hotline number or a quick reminder. A standard note might contain a title, a two to four line explanation, and a link. An extended note might contain a longer summary and should be allowed to become visually larger rather than forcing unreadably small text.

Categories should be represented as semantic HTML sections. Notes inside a category should be articles or similarly meaningful containers. This makes the page structurally sound and easier to evolve.

A05 Visual metaphor of the board

The board itself should read as a surface with character. It should not be a blank white web page. The user should immediately perceive that notes are attached to something. That surface could suggest cork, matte paper, painted wall, or lightly textured fabric, but the treatment should stay abstract and CSS-native. It should rely on gradients, layered textures, slight noise-like patterns if desired, and careful shadowing rather than bitmap imagery.

The board should be centered in the viewport and bounded by a maximum width. This helps maintain a gallery-like composition. On very wide screens, the board should remain visually contained rather than stretching to use all available width. The empty margin around it becomes part of the presentation and increases perceived quality.

The board surface should include generous outer padding so the first and last notes do not collide with the browser edges. It should feel like an object placed inside the browser window, not content poured edge to edge.

A06 Sticky note anatomy

Each sticky note should be treated as a layered object with several visual components.

The base layer is the paper body. This includes background color, subtle gradient variation, and the note's rectangular or slightly imperfect shape. The note should not be a perfectly flat block of color. It should have enough tonal change to suggest paper grain, light falloff, or minor unevenness.

The second layer is the edge and depth treatment. This can include a faint inner shadow, a beveled highlight on one edge, and a soft outer shadow on the board. The goal is to separate the note from the surface beneath it.

The third layer is the attachment illusion. Notes can appear taped, pinned, or simply adhered. For this project, sticky-note adhesion is the dominant metaphor, but variation can be introduced through top-edge highlight, a slightly lifted corner, or the faint suggestion of a pressure point near the top center.

The fourth layer is the imperfection layer. This is where the note gains individuality. It may have a slight rotation, a subtly skewed perspective, a curled corner, a shadow direction offset, or a slightly compressed vertical scale. The imperfections must remain small. They should never interfere with reading or alignment.

The fifth layer is the content layer. Titles, body text, and links must remain vertically structured, padded, and aligned. Decorative realism should never invade the content area.

A07 Organized irregularity and procedural patterning

The page should not generate true randomness at runtime. Instead, it should use deterministic visual pattern sets assigned according to repeatable rules. This achieves the desired procedural feel while preserving consistency, testability, and author control.

The cleanest method is to define a family of note variants and assign them by sequence. For example, the first note in a repeating cycle might tilt slightly left with a lifted bottom-right corner. The second might tilt slightly right with a shorter shadow. The third might remain nearly flat but have a subtle top-edge warp. The fourth might have a stronger depth cue and a slightly different tape or adhesion style. The fifth might be a larger note with softer corners. The cycle can repeat after a finite number of entries, and that repetition is acceptable because human perception will usually read the system as varied if the cycle is large enough and if note content differs.

This approach is ideal for CSS because variants can be driven through selectors such as nth-child patterns, modifier classes, or data attributes. The important design point is that the variation system must be deliberately curated. Think of it less as randomness and more as a library of note personalities.

The irregularity should affect these properties: rotation angle, translate offset, shadow length, corner curl intensity, gradient direction, highlight placement, tape or edge treatment, and possibly note size bucket. It should not affect semantic order, reading direction, or baseline padding.

A08 Layout model

The board should use a responsive grid-like layout that preserves source order. The safest interpretation for this concept is a grid with flexible columns rather than a fully freeform absolute layout. A true scattered collage may look attractive in a static mockup, but it creates maintenance problems, unpredictable gaps, and accessibility issues. A structured grid gives the page stability while allowing each note to feel visually unique inside its allocated space.

Each category section should form its own local layout context. Within that section, notes should wrap responsively based on available width. On mobile, one note per row is the correct default because it maximizes readability and preserves the feeling of holding one note at a time. On medium screens, the layout can expand to two columns. On desktop, it can grow to three or four columns depending on width. On very wide screens, the board width should cap so that the number of visible columns does not become excessive.

The overall layout should avoid forcing every note to equal height. Notes of different content density should be allowed to vary in size. However, the grid rhythm should remain orderly enough that the page still scans cleanly. The impression should be "neatly pinned notes with personality", not "Pinterest masonry chaos".

A09 Responsive width strategy

The page should be fluid up to a maximum width. A good UX principle here is that responsiveness should adapt until it starts to harm composition, then stop. In practice, the board container should have a maximum width approximately in the desktop range you described, such as something around the visual territory of a 1600 to 1920 pixel layout. The exact number is less important than the principle that the board remains bounded and centered.

Below that maximum, the board width should shrink naturally with viewport size while preserving comfortable outer margins. At tablet widths, the note columns should reduce smoothly. At phone widths, the layout should collapse to a single note per row with larger touch-friendly spacing and simplified decorative intensity if needed.

The board should not attempt to fill an ultra-wide monitor edge to edge. Past the maximum width, the surrounding browser space should remain empty or subtly styled. This preserves focus and keeps the board reading as a designed object.

A10 Category presentation

Categories should be separated through a combination of vertical spacing, a visual heading treatment, and optionally a slightly different local background accent. The category heading should feel like a label pinned to the board above its note cluster. It can use a contrasting typographic style that is more stable and less playful than the notes themselves.

A category should have enough top spacing that the user clearly perceives a new cluster. However, category spacing should not feel like page breaks. The board must remain continuous.

The category header can include a short subtitle or descriptor where useful. For example, an emergency section could clarify that it contains urgent and public-service contacts. A news section could clarify that it contains local reading sources and city context. These descriptors help transform a visual concept into a usable reference interface.

A11 Typography and the handwritten illusion

Typography is critical because this concept can easily become gimmicky if it leans too hard into novelty fonts. The strongest approach is a typographic pairing. Use one stable interface-readable font for category headers and supporting chrome, and one characterful note font for the note content. The note font can feel slightly handwritten, marker-like, or casually annotated, but it must remain highly legible. The project should never require users to decode eccentric letterforms.

The handwritten feel should come as much from spacing and layout as from font selection. Slightly relaxed line-height, modest title emphasis, occasional letterform warmth, and natural paragraph width can create the right tone without sacrificing clarity.

Titles inside notes should be visually stronger than body text and should anchor the note quickly. Links should remain clearly identifiable and accessible, but they should not look like default browser blue underlines pasted into a paper card. Their styling should harmonize with the tactile note aesthetic while staying unmistakably interactive.

A12 Font adjustment and density rules

This is a defining behavior of the design. The page should visually reward short notes with larger, bolder type while ensuring long notes remain readable rather than cramped. The note should feel as though its typography adapts to content density.

The rule system should be explicit. A note with very little text should use a larger type scale and possibly more generous spacing so it feels like a quick handwritten reminder. A note with moderate text should use a normal base size optimized for reading. A note with long text should reduce the font size only within a controlled floor. Once that floor is reached, the note itself should grow in height or width rather than continuing to shrink the text.

This is an important UX point: size adaptation should protect readability, not merely maximize compactness. Your lower limit, such as around the equivalent of 14px for body content, is sensible. Below that, the design should prefer a larger note footprint.

The implementation description should treat this as a content-class system rather than automatic measurement as a first step. Notes can be assigned density classes like short, medium, or long based on authored content. Later, a small JavaScript enhancement could measure text length or rendered height and assign these classes automatically. That gives you a no-build baseline now and a more automated future path later.

A13 Color system and contrast

The color system should evoke real sticky notes without becoming childish. A curated palette of paper-like colors is better than unconstrained random hues. The palette might include warm yellow, muted pink, pale blue, sage, apricot, cream, and a few more saturated accents used sparingly. These colors should have enough variation to make clusters lively, but they should all belong to the same world.

Each note background should support readable foreground text. Modern CSS color functions are useful here because they allow a more intelligent relationship between background and text. The ideal design principle is that note text should derive from the note color context rather than always being hard-coded black or white. That said, the aesthetic may still benefit from using a dark translucent ink-like foreground for most note colors, because it creates the feeling of pen on paper.

A practical UX rule is this: prioritize stable perceived contrast over theoretical novelty. If advanced CSS functions are supported, they can be used to compute a text color or overlay relationship that reacts to the note background. If not, the design should degrade to a carefully chosen dark text color with slight opacity and local text-background support where necessary.

Where notes include busier or more textured backgrounds, a subtle content backing layer can be used behind the text, such as a faint translucent wash or a soft shadow. This must remain extremely restrained. The user should feel readability, not notice a special effect.

A14 Paper texture, depth, and pseudo-3D treatment

The note should feel physical through restrained pseudo-3D effects. The effect stack should rely on tiny interventions rather than large transformations. Slight rotation, gentle perspective skew, narrow highlight gradients, soft layered shadows, and an occasional lifted corner are enough.

The lifted-corner effect is especially valuable because it communicates paper behavior immediately. One corner, usually bottom-right or top-right, can look slightly detached from the board. This can be implied through a gradient change, a directional shadow, and a shape deformation on a pseudo-element. The key is subtlety. The note should still be obviously attached and readable. It is not a peeling page animation.

Similarly, notes can vary in perceived pressure against the board. Some can look freshly pressed flat. Others can appear slightly loosened, as though one edge floats a few millimeters above the surface. These cues deepen the board metaphor without needing images.

The board shadowing should also be consistent with a general light direction. Even if individual notes vary slightly, the page should overall suggest a coherent lighting environment. Without this, the tactile illusion becomes visually noisy.

A15 Motion and interaction behavior

The base page can remain static, but the design benefits from very light interaction feedback. On hover-capable devices, notes can subtly rise, sharpen, or shift as though the user is inspecting them. This should not become a dramatic zoom or wobble effect. Slight translation, shadow deepening, and maybe a small reduction in rotation angle are enough.

On touch devices, there should be no dependency on hover. Notes must remain fully readable and tappable without hidden content. Links inside notes must have comfortable hit areas and visible active states.

Category headings can remain stable during scrolling or optionally become sticky if that proves useful, but the first version does not need sticky category headers. The interface should favor calm browsing over motion-heavy interaction.

If future filtering is added, animation should be purposeful and brief. Notes could fade, compress, or reorder in a way that preserves spatial orientation. Abrupt disappearance of cards tends to feel brittle in a visually rich layout.

A16 Web Components and Shadow DOM strategy

Web Components are a good fit for this project if the main goal is component encapsulation, style modularity, and a clean authoring mental model. They are especially appropriate if you want to define reusable note and category primitives without introducing a framework.

The natural component boundary is between the board, category groups, and individual notes. A note component can encapsulate its visual shell and internal markup expectations. A category component can manage heading presentation and local layout. A board component can act as the outer composition container.

Shadow DOM is attractive because it protects the note styling from accidental global CSS leakage. This is useful in a CSS-heavy concept where carefully layered visuals can be fragile. However, Shadow DOM should be used deliberately. If you expect the author to write plain HTML content directly inside notes and style some of that content from the page level, fully closed styling boundaries may become inconvenient.

The most balanced strategy is to use Web Components for structure and predictable styling, while keeping authoring friction low. Notes can accept light-DOM content through slots so the author still writes ordinary HTML. Component internals can handle the decorative layers, sizing conventions, and variant assignment. This gives you encapsulation without losing the simplicity of editing content directly in markup.

If you want the lowest complexity version first, start without custom elements and structure the page with semantic HTML plus class conventions. Then, once the visual system is stable, promote repeated patterns into components. This de-risks the project because the hardest part is not the component registration but the design language itself.

A17 CSS architecture

The CSS should be organized as a system rather than as one long decorative file. The style layers should separate tokens, board layout, category presentation, note structure, note variants, state styles, and responsive adaptations.

The token layer should define the board surface colors, note palette values, spacing scale, typography scale, shadow presets, radii, and motion timings. The important point is that procedural variation should still emerge from a controlled design vocabulary.

The note layer should define the canonical anatomy of a sticky note: outer box, inner content, decorative pseudo-elements, link styling, and content spacing. Variant layers should then modify rotation, gradient direction, edge curl, shadow behavior, and attachment style. Responsive rules should mostly affect column count, note padding, and type scaling rather than re-inventing the whole design at each breakpoint.

You mentioned modern CSS, and this project is a strong candidate for it. Container queries can help notes or categories adjust based on their actual rendered space rather than only viewport width. CSS custom properties are essential for variant control. Modern color functions are appropriate for note surface derivation and contrast handling. Logical properties are useful if internationalization or directional robustness matters later. The project should feel modern not because it uses every new feature, but because it uses the right ones coherently.

A18 Deterministic note variants

The procedural feeling should come from a finite set of note recipes. These recipes should be described in UX terms so they can later be translated into CSS rules.

Variant one is the standard flat note. It has a near-neutral rotation, a short soft shadow, and minimal edge lift. This is the anchor variant and keeps the page from becoming too theatrical.

Variant two is the left-tilted note. It rotates slightly counterclockwise, has a somewhat elongated shadow, and a small bottom-right lift. It feels casual and slightly older.

Variant three is the right-tilted note. It rotates slightly clockwise and may have a stronger top-edge highlight, as though more firmly pressed near the top.

Variant four is the soft-curl note. It stays mostly flat but suggests one corner peeling upward. This creates material richness without moving the whole note dramatically.

Variant five is the heavy note. It has a stronger shadow and slightly denser background gradient, useful for more important or content-rich items.

Variant six is the airy note. It appears lighter, slightly more elevated, with a gentler paper body and larger internal spacing, appropriate for short content.

These variants can repeat in sequence or be assigned per category to subtly differentiate sections. The key requirement is that the system be controlled and documented so the visual output remains predictable.

A19 Sizing rules for notes

Notes should come in a small number of size buckets rather than arbitrary freeform dimensions. This keeps the board tidy and makes authoring manageable.

A compact note is appropriate for short, high-signal content such as phone numbers, quick links, or reminders. A standard note is the default for most references. A large note is used when content is denser or the item is intentionally emphasized. A wide note may be useful in some sections where a short list or multiple links belong together.

The board should support these size categories within the responsive grid rather than through absolute positioning. A larger note can span more vertical space, more horizontal space, or both depending on available room. On mobile, all notes will effectively behave as full-width notes, and only height variation remains.

Typography must coordinate with note sizing. A compact note with minimal text can carry larger type. A larger note with more content can preserve the normal reading size and use its footprint to absorb length.

A20 Accessibility and readability

The tactile aesthetic must not compromise basic usability. Reading order should follow source order. Contrast should be checked across all note colors. Decorative transforms should remain small enough that text does not appear slanted in a way that reduces comfortable reading.

Links must be clearly visible, keyboard focusable, and distinguishable from surrounding text. Focus states should feel integrated into the aesthetic, perhaps through a clean outline or elevated edge rather than a default browser look, but they must remain obvious.

The page should remain usable with reduced motion settings. Any lift, float, or filter animation should soften or disable under reduced-motion preferences. The interface should also work when custom fonts fail to load, which means the typographic hierarchy must survive font fallback.

Screen reader semantics matter even in a highly visual design. Categories should be real headings, notes should be meaningful content containers, and important service information should not be hidden in decorative layers.

A21 Authoring workflow

The authoring experience should be intentionally plain. A note should be creatable by writing simple HTML content in a predictable structure. The author should not need to manually compose decorative wrappers every time. Whether you use plain classes or components, the markup contract should remain concise.

Each note should allow the author to specify category, emphasis, density class, and optional color or variant override only when necessary. Most of the time, notes should be able to inherit a default variant cycle and color assignment from the board system. This is important because a visually rich page becomes unmaintainable if every note requires hand-tuning.

Content should be separable from styling decisions. The author writes the Seattle reference information as normal HTML text and links. The system determines how it appears. This separation is central to making the page sustainable.

A22 Future enhancement path

The first version should focus on static quality, because a well-made static board will already deliver most of the value. After that, progressive enhancements can be added.

The most natural first enhancement is client-side search or filtering. This should allow the user to quickly isolate notes containing a keyword or belonging to a category. The interaction should preserve the board metaphor, ideally by dimming non-matching notes rather than completely reflowing the page at first.

Another enhancement is automatic density classification. A small script can inspect note content length or rendered height and assign the appropriate typography and size class. That moves the system from authored tuning to semi-automatic adaptation.

A further enhancement is deep linking to categories or notes. This is useful for a reference page because users often return to one section repeatedly.

A23 Seattle-specific example structure

The Seattle use case fits the board metaphor well because the information is practical, varied, and locality-driven. The top zone should contain emergency and essential services. This includes 9-1-1, non-emergency lines, urgent care references, and public-service contact points. These notes should be visually a bit more stable and prominent than the rest.

The next zone can cover local news and reading. These notes can contain short descriptions of what each source is good for, such as neighborhood-level reporting, transit coverage, city policy, restaurant coverage, or arts events.

The next zone can cover going out: bars, restaurants, coffee, markets, and places to visit. These notes benefit from warm colors and perhaps a slightly more playful variant cycle.

Another zone can cover practical city movement: transit, ferries, parking references, maps, and neighborhood orientation. This section may become one of the most revisited categories and should remain especially scannable.

A final zone can contain personal curation, seasonal notes, or "good to know" facts. This gives the board room to feel local and lived-in rather than purely institutional.

A24 Recommended implementation direction

The strongest implementation direction is an HTML-first, CSS-heavy document with semantic sections and note articles, using CSS custom properties, modern responsive layout, and a deterministic note-variant system. This satisfies the build-free requirement, keeps authoring simple, and matches the aesthetic goals.

Web Components are worth considering as the second phase once the visual language stabilizes. They are a good fit if you want reusable note primitives, encapsulated styling, and a cleaner long-term architecture. Shadow DOM can help protect the carefully tuned note styling, but it should be introduced only if it does not make content authoring awkward.

In other words, the UX specification points toward this sequence: first, prove the board, note anatomy, typography, color, and responsive rules in plain HTML and CSS. Second, formalize repeated note and category structures into components if reuse and encapsulation become valuable. Third, add light JavaScript for filtering and auto-density behavior.

A25 Definition of done for the UX

The UX can be considered successful when the page meets these conditions in practice. It immediately reads as a tactile board of notes rather than a generic card grid. It remains easy to scan on both phone and desktop. It preserves strong text readability across all note colors and decorative treatments. It feels visually varied without appearing random or messy. It stays centered and composed on very wide screens. It allows the author to add new notes by editing straightforward HTML. And it leaves room for future search and filter behavior without requiring a redesign.

A26 Final design stance

The most important design choice in this project is to resist false randomness. The page should look improvised, but be authored as a system. That tension is where the best version of this concept lives. Too much structure and it becomes a normal card UI wearing a paper costume. Too much chaos and it becomes a novelty page that is tiring to use. The right outcome is a carefully designed board that feels slightly imperfect, materially convincing, and effortless to browse.

If you want, I can turn this into a stricter engineering-facing specification next, with explicit component contracts, HTML structure conventions, CSS token groups, and responsive behavior rules section by section.
