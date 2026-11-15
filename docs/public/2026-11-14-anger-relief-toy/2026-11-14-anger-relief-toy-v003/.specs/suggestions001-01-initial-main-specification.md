# **Breaking the Web: A Playground for Digital Frustration**

The modern web is designed to be functional, predictable, and productive. We use it to communicate, work, read, argue, attend meetings, and consume an endless stream of information. But there is something strangely unsatisfying about the way we interact with it. No matter how irritating a message becomes, how absurd a comment appears, or how frustratingly slow a page loads, our interactions remain limited to the same familiar actions: clicking, scrolling, typing, and closing tabs.

What if we could do something else? What if we could punch a message, shatter a paragraph, throw a particularly annoying comment off the screen, or watch an entire webpage collapse under gravity?

This project explores a simple but entertaining idea: **turn ordinary webpages into interactive playgrounds where users can physically manipulate, damage, and destroy digital content, without actually damaging anything.**

The application is a browser extension for Microsoft Edge and Google Chrome, containing a growing collection of humorous, visually expressive effects inspired by classic JavaScript bookmarklets, creative coding experiments, and browser-based games. It introduces a playful layer over the websites people already use, allowing them to temporarily transform ordinary interface elements into objects that can be punched, cracked, shattered, exploded, thrown, or otherwise subjected to the laws of imaginary physics.

## **When another meeting could have been an email**

Consider Andrew, a software engineer attending his fourth Microsoft Teams meeting of the day. Someone is explaining a process that could have been summarized in three sentences. The meeting chat is filling with messages, notifications keep arriving, and another colleague has just posted a particularly enthusiastic reminder about updating the weekly status report.

Andrew has no intention of responding. He simply wants to punch that message.

Instead of typing something he might regret, Andrew opens the extension, selects **Punch** from a game-like action wheel, and clicks the message.

The message violently shakes. Its rectangular surface bends inward as if struck by an invisible fist. A web of cracks spreads across it, a few animated fragments fly away, and a satisfying cartoon-style impact mark appears.

Andrew clicks again. Another punch. The message deforms a little further.

Nothing has happened to the real Teams conversation. The message has not been edited, deleted, or sent anywhere. His colleagues have no idea that their weekly status reminder is currently being subjected to an elaborate physics simulation.

Andrew has simply turned an ordinary workplace annoyance into a private, harmless game.

And when the meeting finally ends, he refreshes the page. The message is back, completely untouched, still reminding him to update his status report.

## **The internet is full of things Alice would like to break**

Alice has a slightly different problem. She is reading a long discussion on Reddit. The original post is interesting, but the comments have become increasingly ridiculous. Someone has written a twelve-paragraph argument that misses the point entirely.

Alice could reply. She could downvote it. She could close the tab.

Instead, she selects **Shatter**.

She clicks the comment, and the entire block of text appears to fracture like a pane of glass. Words separate into irregular fragments, pieces fall toward the bottom of the viewport, and the once-confident argument collapses into a small animated pile of debris.

It is a completely unnecessary interaction.

That is precisely why it is entertaining.

Later, Alice encounters a webpage that has been displaying a loading indicator for what feels like an eternity. The page itself is not responding, but the browser extension is still available. She activates **Screen Crack**, clicks several times, and watches simulated cracks spread across the visible page.

For a brief moment, her browser looks as though she has finally lost patience and punched the monitor.

Of course, the monitor is fine. So is the webpage. The cracks exist only inside the temporary visual layer created by the extension.

The frustration has been turned into something absurd, interactive, and funny.

## **From static documents to interactive objects**

The interesting aspect of this project is that it changes how users perceive web content.

Ordinarily, a webpage is a collection of interface elements: text, buttons, cards, images, containers, and navigation controls. These objects have specific functional purposes, but they rarely behave like physical things.

Our extension temporarily changes that relationship.

A message becomes something that can absorb an impact. A paragraph becomes a collection of fragments. A button becomes an object that can bounce across the screen. A page becomes an environment in which gravity, collisions, wind, explosions, and other simulated forces can act on visible content.

Imagine opening a dense corporate dashboard after spending an hour trying to understand its charts. Instead of closing the page, the user activates **Gravity**. The numbers, labels, cards, and headings suddenly detach from their positions and tumble toward the bottom of the screen.

Or imagine selecting **Text Bomb**, placing a small animated bomb inside a particularly boring article, and watching the letters scatter when it explodes.

Another user might activate a miniature spaceship and begin shooting at navigation menus in an Asteroids-style game. Someone else might release a virtual creature that crawls across a webpage, pulling links and text fragments into its path.

These interactions do not help users complete their original tasks. They create a different relationship with the content: one based on curiosity, humor, experimentation, and playful control.

The same webpage that previously felt tedious or frustrating suddenly becomes a toy.

## **A game controller for the browser**

The experience should be immediate and intuitive.

Users install the extension once. When they want to interact with a webpage, they open a compact, game-inspired action wheel containing their favorite effects.

They might select a boxing glove to punch an element, a hammer to smash it, a lightning bolt to produce an electrical effect, or a gravity icon to make the page fall apart.

For more options, a searchable catalog provides access to the complete collection, initially containing up to 100 carefully selected effects.

Each effect behaves like an independent tool. Some operate on individual elements, others affect entire regions, and some transform the visible page into a miniature game environment.

The user does not need to understand JavaScript, install bookmarklets manually, open developer tools, or know anything about the algorithms behind the animations.

The interaction should feel as simple as choosing an item in a video game and using it on something in the world.

A user chooses an effect, points at the target, clicks, and sees the result.

Some effects finish immediately. Others continue running until the user stops them. The extension provides consistent controls to cancel, reset, or change the active effect.

Underneath this simple interface is a modular rendering and execution system. Each effect is implemented as an isolated feature with a well-defined interface. The extension loads the required implementation on demand, supplies the selected DOM target, coordinates animation and resource management, and restores the page when the interaction ends.

The architecture makes it possible to introduce entirely new kinds of effects without redesigning the extension.

## **Breaking things without breaking anything**

The illusion of destruction is central to the product.

The actual destruction of website content is not.

A user should be able to virtually punch a Teams message without sending a Teams action, shatter a Reddit comment without deleting it, or make an entire article collapse without modifying the website's persistent data.

Visual effects can be implemented through temporary overlays, canvas rendering, animations, and carefully controlled DOM transformations. The extension manages these effects independently of the underlying website's business logic.

When the effect stops, its temporary visual modifications are cleaned up. When the page reloads, the ordinary website returns.

This distinction makes the experience particularly appealing. The user can behave outrageously toward the visual representation of a webpage while the real application remains unaffected.

There is no need to apologize to a colleague because their message was punched. No need to repair the dashboard because its charts fell off the screen. No need to replace the monitor because it appears cracked.

The destruction is entirely fictional.

## **Rediscovering the playful side of the web**

The idea also has historical roots.

During the 2000s and early 2010s, developers created remarkable JavaScript bookmarklets and browser experiments that transformed ordinary webpages in unexpected ways. Some introduced physics simulations, others turned text into particles, and some transformed websites into miniature games.

Many of these experiments were scattered across personal websites, source repositories, technical blogs, and old bookmarklet collections. Some have disappeared, while others depend on obsolete JavaScript libraries or browser behavior.

This project aims to rediscover the most entertaining examples, investigate how they work, and reconstruct their effects using modern browser technologies.

Rather than treating these experiments as unrelated snippets, the extension brings them together into a coherent collection with consistent interactions, visual quality, performance expectations, and security standards.

The collection is designed to keep growing. New visual experiments, interaction techniques, and rendering technologies can become additional features over time.

The long-term ambition is not merely to preserve nostalgic bookmarklets. It is to create a platform for a particular category of software that rarely receives much attention: software whose main purpose is to make interacting with ordinary digital objects unexpectedly fun.

## **Sometimes the most useful button is the one that does something ridiculous**

Not every interaction with a computer needs to improve productivity.

Sometimes the user does not want to organize the page, summarize its contents, automate a workflow, or find information faster.

Sometimes the user simply wants to watch a particularly annoying paragraph explode.

That is the purpose of this project.

It gives people a playful form of expression inside an environment that is usually rigid and task-oriented. It transforms familiar webpages into temporary interactive worlds where digital objects can be broken, distorted, thrown, burned, shattered, or subjected to absurd physical forces.

The experience is personal, reversible, and deliberately unnecessary.

**We are not building a tool to destroy websites. We are building a tool that lets users enjoy the illusion of destroying them.**

And sometimes, after a long meeting, an overwhelming inbox, or an unnecessarily argumentative comment thread, that is exactly the kind of button someone wants to press.


Software Requirements Specification
Project: Interactive Web Effects Collection and Browser Extension
Specification version 1.0 | November 14, 2026 | Status: Initial specification | Target: Microsoft Edge and Google Chrome

A00. Executive Summary and Primary Agent Directive
A00.1. Project mission
The objective of this project is to research, discover, evaluate, reconstruct, and integrate a curated collection of up to 100 exceptional interactive visual effects, primarily inspired by JavaScript bookmarklets, historical browser experiments, creative coding projects, and other browser-based visual demonstrations.

The effects must produce surprising, humorous, playful, satisfying, or emotionally expressive interactions with existing web pages.

The defining characteristic of this collection is that each effect temporarily transforms the user's perception of a web page, creating the illusion that the page, or individual elements within it, can be physically manipulated, attacked, damaged, destroyed, distorted, animated, or otherwise affected in an unexpected and entertaining way.

Examples include punching a message and leaving a visible dent, cracking a page element as if it were glass, shattering a paragraph into fragments, causing website components to fall under gravity, or launching an animated creature that tears links from a page.

These interactions must be visual, temporary, reversible, and non-destructive to the underlying website and its persistent data.

The final product shall be a coherent, modular, extensible browser extension compatible with Microsoft Edge and Google Chrome. It shall provide a polished, game-inspired interface through which users can discover, select, activate, control, and terminate the effects.

The extension must be architected as a continually growing platform, not as a one-time collection of unrelated JavaScript snippets.
A00.2. Primary directive to the development agent
The agent SHALL prioritize the following objectives, in this order:
1. Protect the development environment and users from untrusted third-party code.
2. Conduct extensive, systematic research to discover relevant and genuinely interesting visual effects.
3. Establish provenance, technical understanding, and licensing status for every candidate.
4. Select effects based on demonstrated visual quality, originality, entertainment value, and suitability for the project.
5. Independently implement or appropriately adapt approved effects as modern, maintainable modules, subject to licensing requirements.
6. Integrate effects through a stable, well-defined architectural contract.
7. Provide a consistent, intuitive, aesthetically coherent user experience.
8. Verify correctness, security, performance, isolation, cleanup, and compatibility before integration.
9. Preserve the ability to expand, refactor, test, and maintain the collection indefinitely.
Research quality and implementation safety take precedence over the numerical target of 100 effects.

An agent SHALL NOT compromise security, visual quality, licensing compliance, or architectural consistency merely to increase the number of effects.
A00.3. Critical safety directive
Original, untrusted bookmarklets, scripts, snippets, and third-party executable artifacts SHALL NEVER be executed on the developer's workstation or in its ordinary browser, terminal, Node.js runtime, or other local execution environment.

Untrusted JavaScript must first undergo static inspection.

If dynamic evaluation is necessary, it SHALL occur exclusively through Playwright-controlled browsers running inside a dedicated, disposable, isolated execution environment, preferably on a separate remote virtual machine or microVM.

Playwright is an automation framework, not a security sandbox. Therefore, using Playwright alone does not satisfy this requirement.

No original third-party bookmarklet shall be copied directly into the production extension as executable code. Approved effects must be reconstructed or adapted as reviewed, project-controlled implementations.

This distinction is fundamental: the original source is an untrusted research artifact; the resulting effect module is a separately reviewed implementation.

The safety procedure is specified in detail in Sections I00 and J00 and applies without exception to every research and development agent.

B00. Background, Motivation, and Product Philosophy
B00.1. Historical context
During the 2000s and 2010s, browser bookmarklets and creative JavaScript experiments became a popular mechanism for transforming ordinary web pages into interactive playgrounds.

Developers created small scripts that could turn text into particles, replace normal page behavior with physics simulations, introduce miniature games, distort visual layouts, or generate deliberately absurd interactions.

Some of these experiments were technically simple. Others incorporated animation engines, particle systems, physics simulations, canvas rendering, DOM manipulation, and sophisticated visual transformations.

Their appeal was frequently unrelated to traditional software productivity.

They existed because interacting with a familiar page in an unexpected way was entertaining in itself.

A seemingly ordinary page could suddenly behave like a physical object. A paragraph could explode. A collection of links could become debris. A website could become a game environment.

Research conducted for this specification confirms several examples of this tradition: the 2010 Kick Ass bookmarklet, the 2011 Katamari Hack, and the 2012 fontBomb experiment. 

WIRED+2

The project aims to recover this category of creative browser interaction, discover both historical and modern implementations, and establish a unified platform where these experiences can be used conveniently.
B00.2. Emotional motivation
The underlying motivation is emotional expression through interaction.

Conventional browser interfaces are designed primarily for reading, navigating, editing, communicating, and completing tasks. Users rarely have opportunities to interact with web content in a physically expressive or deliberately absurd manner.

This project introduces an optional layer of playful interaction over that conventional experience.

Consider a user reading an irritating message in Microsoft Teams. Instead of responding negatively to the sender, the user might activate a cartoon punching effect and visually punch the message.

The message could deform, shake, acquire a comic-style impact mark, or appear to crack.

Nothing would be sent to Teams. No message would be edited or deleted. No remote service would receive any action.

The browser would simply display a temporary visual effect over the existing message.

Similarly, a user reading a frustrating Reddit comment could activate an effect that makes the comment explode into confetti, crumble into fragments, or fall off the screen.

These interactions are intended to produce an immediate emotional response: amusement, surprise, satisfaction, curiosity, or a sense of playful release.

The project does not claim to provide psychological treatment or measurable therapeutic benefits. Its purpose is entertainment and personal expression.
B00.3. The central product experience
The central product experience is:

Select an effect. Aim it at the page. Trigger an unexpected visual reaction. Enjoy the result. Restore normal browsing whenever desired.

The entire extension must support this experience without exposing the user to the underlying complexity of bookmarklets, JavaScript snippets, browser APIs, or animation engines.

The user should not need to understand where an effect originated, how it was implemented, or what technology it uses.

The effect should feel like a native capability of the extension rather than an unrelated script launched from a collection.
B00.4. Design philosophy
The project shall emphasize the illusion of interacting with web content as a physical material.

A paragraph is not merely text. It can appear to be fragile glass, soft rubber, cardboard, metal, dust, or an object with mass.

A button can appear to be struck by a hammer.

A message can appear to sustain a dent.

A page can appear to lose gravity or collapse.

The more convincingly an effect reacts to the existing page, the more valuable it is to the collection.

The project shall favor distinctive, responsive, well-executed effects over generic changes to colors, fonts, or page styles.

The desired result is a collection of memorable interactions, not a miscellaneous JavaScript utility library.

C00. Product Definition and Success Criteria
C00.1. Product definition
The product is a Chromium Manifest V3 browser extension acting as a unified launcher, controller, and runtime for independently implemented visual effects.

The extension shall contain a searchable effect catalog, a contextual selection interface, an effect execution runtime, a target selection system, and shared services supporting rendering, lifecycle control, cleanup, diagnostics, and configuration.

Individual effects shall be independently maintainable modules with explicitly defined capabilities and dependencies.
C00.2. Core functionality
A user shall be able to activate the extension on a supported web page, select an effect from the catalog, optionally identify a target element, and execute the selected effect without manually entering JavaScript.

For example, a user could select "Punch", move the pointer over a Reddit comment, click the comment, and observe a localized deformation animation with an impact mark.

A user could instead select "Gravity", activate it, and watch supported visible page elements behave as if influenced by gravity.

A user could select "Shatter", click a heading, and observe an animated fragmentation effect.

Each interaction must have a documented termination mechanism and must not modify the website's server-side data.
C00.3. Desired outcomes
The project shall be considered successful when it demonstrates all of the following properties.
Dimension	Required outcome
Discovery	A repeatable process for finding unusual and visually compelling browser effects
Quality	Every included effect has passed a documented evaluation and review
Safety	No untrusted original code executes outside approved isolated research environments
Entertainment	Effects produce deliberate, recognizable, and satisfying visual interactions
Reversibility	Effect-induced changes can be stopped and cleaned up; page reload restores the original website state
Consistency	All effects share coherent naming, controls, lifecycle semantics, and presentation
Modularity	Each effect can be developed, tested, reviewed, and updated independently
Extensibility	New effects can be introduced without restructuring the core application
Performance	Inactive effects impose negligible runtime overhead on ordinary browsing
Privacy	Page contents remain within the active browser tab and are not collected for analytics
Maintainability	The project remains understandable and testable as the catalog approaches 100 effects
Portability	The same core implementation supports current compatible Edge and Chrome versions

C00.4. Fundamental architectural principle
The extension core must remain independent of the implementation details of individual effects.

Adding a new effect shall not require modifying the extension's central execution logic, rewriting its user interface, expanding global conditional statements, or introducing special-case dependencies between unrelated effects.

A new effect should normally require a new feature module, a validated metadata definition, tests, attribution records, and registration through the established build process.

The extension shall discover available effects through a registry rather than through hard-coded knowledge of each effect's internal implementation.

D00. Scope, Limits, and Non-Goals
D00.1. Collection size
The initial collection shall have a maximum of 100 approved, independently executable effects.

The number 100 is a ceiling for the initial release, not a mandatory quota that overrides quality standards.

The research effort shall attempt to identify substantially more than 100 candidates so that the final collection can be selective.

The recommended working targets are:
Research stage	Target
Distinct raw candidates discovered	200 or more
Candidates passing initial relevance review	120 or more, if available
Candidates receiving detailed assessment	120 or more, if available
Effects approved for implementation	Up to 100
Effects included in initial full release	Maximum 100

These figures are planning targets, not assumed research results.

If only 72 candidates satisfy all acceptance criteria, the collection shall contain 72 rather than 100 inferior or unsafe additions.

The agent shall report the shortfall and its causes.
D00.2. What counts as an effect
One effect is one independently selectable user-facing behavior with a distinct visual or interaction identity.

For example, "Punch", "Shatter", and "Gravity" may each count as separate effects.

Changing the color of an impact mark does not create another effect. Neither does changing particle density, impact strength, animation duration, or the size of a flashlight.

These are configuration options of an existing effect.

Two effects implementing substantially identical behavior with different labels shall not be counted separately merely to increase the collection size.

A distinct effect may share a rendering engine or common physics primitives with other effects, provided its observable behavior is meaningfully different.
D00.3. Supported environments
The primary targets are current stable desktop versions of Microsoft Edge and Google Chrome.

The extension shall use Manifest V3 and Chromium-compatible extension APIs.

Microsoft's documentation confirms that Edge and Chrome extensions share broadly compatible APIs and packaging conventions, although browser-specific verification remains necessary. 

Microsoft Learn+1

Mobile browser support, Firefox support, Safari support, and publication in extension stores may be considered later but are not prerequisites for the initial release.
D00.4. In-scope sources
Research may consider historical bookmarklets, modern bookmarklets, small JavaScript experiments, code demonstrations, creative coding projects, open-source effects, visual browser toys, extension source repositories, and interactive demos.

An effect does not have to originate as a literal javascript: bookmarklet to qualify.

A compelling browser-based visual experiment may be considered if its behavior can be reconstructed into a safe, reusable effect module.
D00.5. Explicit non-goals
The project shall not become a general-purpose automation toolkit, website modification utility, developer tools replacement, or browser hacking framework.

Features whose primary purpose is extracting page data, bypassing restrictions, editing stored content, manipulating accounts, automating form submissions, defeating advertisements, or interfering with web services are outside scope.

The extension shall not execute arbitrary user-supplied JavaScript or dynamically load executable effects from third-party servers.

The product shall not intentionally cause damage to real websites, user accounts, application state, external services, browser settings, or local files.

E00. Definition and Classification of Desired Effects
E00.1. Primary selection rule
The agent SHALL search for effects that make an existing web page behave in a visually surprising, playful, physical, absurd, or emotionally expressive manner.

The central criterion is not whether a script is clever or technically complex.

The central criterion is whether the user sees a compelling and entertaining transformation of the page.

A candidate should answer the question:

"Would activating this effect on an ordinary message, comment, paragraph, image, or webpage create a memorable visual experience?"

If the answer is no, the candidate should normally be rejected.
E00.2. Effect taxonomy
The following taxonomy defines the intended research coverage. It is a discovery guide, not a fixed list of features.
Category	Desired behavior	Examples of research targets
Physical impact	Make elements appear struck by a physical force	Punch, slap, hammer strike, knockback, dent
Cracking and fracture	Make surfaces appear cracked or broken	Broken glass, spiderweb cracks, shattered tiles
Destruction	Make content appear to break apart	Explosion, demolition, disintegration, crumbling
Physics simulation	Make page elements respond to simulated forces	Gravity, bouncing, falling, floating, collisions
Element displacement	Move content in unexpected ways	Fling, throw, drag, scatter, launch
Particle transformation	Convert visible content into animated fragments	Dust, confetti, sparks, debris, pixel particles
Text destruction	Manipulate individual letters and words	Text bombing, letter collapse, character explosions
Screen distortion	Create an illusion that the viewport is malfunctioning	Glitch, screen shake, ripple, distortion
Light and visibility	Change how the user visually explores a page	Flashlight, spotlight, darkness, reveal effects
Elastic deformation	Make objects behave like flexible materials	Rubber, wobble, squish, stretch, spring
Environmental effects	Simulate physical conditions acting on content	Fire, smoke, wind, water, snow, storms
Creatures and autonomous agents	Introduce animated entities that interact with the DOM	Spiders, ants, monsters, crawling creatures
Playful weapons and tools	Let users interact through fictional game-like tools	Laser, ray gun, eraser, paintball, cartoon cannon
Miniature embedded games	Turn ordinary page content into game objects	Asteroids-style shooting, collecting, obstacle games
Surreal transformations	Make page elements behave impossibly	Inversion, melting, folding, spiraling, implosion
Chaotic behavior	Create controlled, temporary visual disorder	Earthquake, page panic, bouncing elements
Comedic overlays	Add visually expressive reactions to content	Stickers, exaggerated impact marks, cartoon reactions

E00.3. Priority hierarchy
The highest priority shall be given to effects involving convincing physical interaction with specific page elements.

An interactive effect that allows the user to punch a comment, see it deform at the exact impact position, and leave a temporary crack is more relevant than a script that changes the entire page background to red.

Effects with physically plausible motion, collision responses, object fragmentation, or meaningful interaction with existing DOM geometry should receive strong consideration.

The second priority shall be visually striking full-page transformations, such as simulated gravity, earthquakes, melting, and chaotic movement.

The third priority shall be autonomous animations and miniature games that interact with existing content.

Decorative effects, visual filters, cursors, and ambient animations may be included when their execution quality or originality makes them genuinely entertaining.
E00.4. Target granularity
Research must distinguish effects operating at different levels of the page.

Element-level effects target one element, such as a comment, message, heading, image, or card. These are particularly important because they enable expressive interactions with specific content.

Region-level effects target an area selected by the user, potentially affecting several nearby elements.

Document-level effects transform a large portion of the page or its entire visible layout.

Viewport-level effects create a visual illusion over the browser's rendered page without necessarily changing the underlying DOM.

Autonomous effects introduce objects or characters that navigate, modify, or interact with the page over time.

Every approved effect must be classified into one or more of these groups.
E00.5. Exclusion criteria
A candidate should generally be excluded when it only performs an ordinary utility action, such as copying text, highlighting search results, changing font size, extracting links, or navigating to another page.

Simple animations shall also be excluded when they provide insufficient novelty or interaction quality.

A candidate shall not qualify merely because its source code is called a prank, joke, bookmarklet, or visual effect.

The agent must evaluate the actual behavior.
E00.6. Important research distinction
The agent shall not restrict discovery to effects literally described as "bookmarklets".

Many relevant projects are indexed under terms such as "JavaScript experiment", "DOM physics", "browser toy", "creative coding", "page destruction", "visual prank", "interactive animation", or "browser easter egg".

Research must deliberately include those neighboring categories to avoid missing exceptional effects.

F00. Research Strategy and Discovery Methodology
F00.1. Research is the primary workstream
This project is research-intensive by design.

The agent SHALL NOT begin by inventing 100 effects from memory, producing 100 trivial variations of a few animations, or immediately generating implementation code.

The first major deliverable shall be an evidence-based research catalog identifying original projects, their observed behavior, their technical characteristics, and their suitability for reconstruction.

Research is not a preliminary activity that ends when implementation begins.

It is a continuous, documented project workstream that remains active as new effects are added.
F00.2. Historical research coverage
The agent shall investigate browser effects from the early JavaScript bookmarklet era through the present.

Research shall explicitly include historical material from approximately 2000 onward, with particular attention to the late 2000s and early 2010s, when bookmarklets and browser visual experiments received substantial attention.

The agent shall not assume that older source code is inherently inferior or that newer implementations are inherently better.

An old project may contain a highly original interaction model worth reconstructing using modern techniques.

Conversely, a modern project may provide substantially better animation fidelity, performance, accessibility, or source documentation.

Historical discovery and modern technical evaluation must remain separate processes.
F00.3. Required discovery channels
The agent shall investigate multiple classes of sources rather than relying on one search engine or code-hosting platform.
Source channel	Research objective
General search engines	Discover historical articles, demos, collections, and forgotten projects
GitHub and other code hosts	Locate readable source code, implementations, issues, forks, and license records
Historical bookmarklet directories	Identify small scripts not available through modern search terminology
Creative coding communities	Discover unusual animations, simulations, and graphical interactions
Chrome Experiments archives	Identify historically influential browser demonstrations
CodePen and similar demo platforms	Find interactive effects and isolated animation techniques
JavaScript libraries and package registries	Locate reusable algorithms, rendering techniques, and physics implementations
Browser extension repositories	Study existing collections, architecture, and user interaction patterns
Archived web pages	Recover descriptions, authorship information, and references to discontinued experiments
Technical blogs and tutorials	Identify implementation strategies and references to original projects
Hacker News, Reddit, and developer discussions	Find community recommendations, related projects, and historical references
Conference talks and demonstration videos	Identify effects whose original implementations may no longer be accessible

The agent must search both by project name and by observable behavior.

For example, a project that causes web page elements to shatter might be described as "DOM fracture", "CSS glass breaking", "particle disintegration", "webpage destruction", or "interactive Voronoi physics".

All of these descriptions may lead to relevant implementations.
F00.4. Mandatory search vocabulary
The agent shall maintain a versioned research-query library rather than conduct an undocumented collection of random searches.

The initial query library should include the following groups.
Search family	Example queries
Historical bookmarklets	funny bookmarklets 2009, javascript bookmarklet experiments 2012, best visual bookmarklets
Webpage destruction	destroy webpage javascript, webpage explosion bookmarklet, interactive website demolition
Physical impact	punch HTML element animation, hammer webpage javascript, DOM impact effect
Fracture and breaking	shatter DOM element, broken glass CSS javascript, Voronoi fracture HTML
Physics	website gravity bookmarklet, DOM physics playground, HTML elements falling physics
Text manipulation	text explosion javascript, font bomb bookmarklet, letters falling off webpage
Screen distortion	screen crack bookmarklet, webpage glitch effect, browser screen shake prank
Visual chaos	earthquake bookmarklet, webpage chaos javascript, website falling apart animation
Creatures and games	asteroids bookmarklet, spider webpage links javascript, browser page invasion animation
Light effects	flashlight bookmarklet, mouse spotlight webpage, darkness reveal javascript
Environmental simulations	burn webpage bookmarklet, HTML fire particles, webpage melting effect
Creative experiments	javascript interactive art DOM, fun browser experiments, playful website interactions

The query library shall expand whenever a new technical term, historical project name, author, or effect category is discovered.

The agent shall also search using alternative spellings and synonyms, including smash, break, blast, explode, obliterate, collapse, tear, crumple, distort, implode, disintegrate, fracture, wobble, bounce, and scatter.

Research shall not be limited to English when credible non-English sources or original project descriptions can be identified.
F00.5. Seed projects identified during initial research
The following are verified discovery leads. They establish that the desired category exists and provide concrete starting points.

They are not yet approved for integration. Their complete source code, licensing, dependency graphs, and security properties have not been audited as part of this specification.
Project	Observed or documented effect	Relevance
Kick Ass	Turns web elements into targets for an Asteroids-style spacecraft	High: interactive destruction  WIRED
fontBomb	Bombs cause webpage text to break apart	Very high: localized destruction  GitHub
Katamari Hack	A rolling ball collects words and webpage elements	High: playful DOM physics  remarkablemark
Fracture	Elements shatter into animated 3D fragments	Very high: direct physical interaction  GitHub
Web Crawler	A spider crawls across the page and tears off links	Very high: autonomous DOM interaction  GitHub
Burn the Web	Fire and dissolution effects make the page appear to burn	High: environmental destruction  JamesPBurke/burnit · GitHub
Web Chaos	Includes gravity, floating, earthquake, shattering, and related interactions	High: multiple mechanisms worth researching  Ganesh Joshi
Break It	Physics-based Voronoi fracture of clicked elements	Very high: target-specific shattering  Chrome Web Store
Cornify	Adds playful unicorn and rainbow effects to webpages	Medium: humorous visual transformation  Cornify
Google Gravity	Demonstrates webpage-like elements falling under simulated gravity	High: historical physics reference, not directly a general-purpose bookmarklet  Experiments with Google
Bookmarklet Collection	Includes flashlight, visual overlays, Matrix rain, and pranks	Medium: source collection requiring individual review  GitHub

The agent should use these projects to identify additional authors, related repositories, technical discussions, historical references, and comparable implementations.

Finding an existing extension implementing an effect does not automatically authorize copying that extension's code. Such projects may serve as behavioral references where their source is unavailable or their license prohibits reuse.
F00.6. Research expansion procedure
For each relevant project, the agent shall conduct a structured expansion process.

First, identify the earliest reasonably verifiable source and the original author or authors.

Next, identify its official website, source repository, documentation, demonstration, and any published technical explanation.

Then examine related projects, credited inspirations, referenced libraries, repository forks, and discussions linking to comparable effects.

Search for older and newer implementations of the same mechanism.

Where multiple implementations exist, compare their interaction quality, technical approach, maintenance history, and licensing status.

The agent shall distinguish between an original implementation, a fork, a wrapper, a recreation, and an unrelated implementation of a similar idea.

The most popular version is not necessarily the original or the technically strongest version.
F00.7. Research breadth and diversity
The agent shall prevent a single effect family from dominating the collection.

As a planning guideline, the full catalog should cover at least 10 materially different categories, provided qualified candidates exist.

No single taxonomy category should exceed approximately 25% of the initial approved collection without an explicit justification.

These limits shall not force the inclusion of weak effects merely to achieve numerical diversity.

The research effort should particularly seek effects with distinct interaction mechanics: clicking, targeting, dragging, throwing, painting, steering, collecting, aiming, striking, and observing autonomous behavior.
F00.8. Research completeness
The agent SHALL NOT describe the final collection as exhaustive in an absolute sense.

An exhaustive search of every bookmarklet ever published cannot be reliably demonstrated.

Instead, the project shall pursue systematic, high-coverage discovery with documented search evidence.

For each major effect category, the research record shall identify the search queries used, repositories examined, search date, relevant sources found, rejected candidates, and remaining gaps.

After the initial broad discovery phase, the agent shall perform at least two additional discovery passes using newly learned terminology, alternative sources, and historical references.

If the final approved catalog has fewer than 100 entries, the agent shall conduct a documented gap analysis rather than silently stop searching.
F00.9. Research stopping condition
Research may transition from primary discovery to ongoing maintenance when the team has completed its planned source coverage, evaluated its available candidate pool, and documented the remaining opportunities.

A suggested saturation indicator is three consecutive targeted research passes producing no new candidates that satisfy the initial relevance threshold.

Saturation is not a permanent stop.

New discoveries may be incorporated later through the same evaluation process.

G00. Research Records, Provenance, and Evidence Management
G00.1. Mandatory research ledger
Every discovered candidate shall be recorded in a persistent, machine-readable research ledger.

Research findings must survive agent restarts, context-window limitations, branch switches, and changes in team membership.

The ledger shall be maintained in version control and treated as a primary project artifact.

It shall not consist solely of conversational notes or generated summaries.
G00.2. Required candidate metadata
Each candidate shall contain, at minimum, the following information.
Field	Description
Candidate ID	Stable unique identifier
Name	Original project or effect name
Original author	Identified author or organization, or explicitly unknown
Discovery date	Date the candidate was first recorded
Original publication date	Best verified date, with uncertainty noted
Source URL	Original or most authoritative discoverable source
Repository URL	Source repository, when available
Demo URL	Demonstration location, when available
Source revision	Commit, tag, release, or other identifiable version
Source hash	Cryptographic identifier when source bytes have been safely inspected
Effect description	Precise description of the observed or documented behavior
Interaction mechanism	How the user triggers and controls the effect
Target scope	Element, region, document, viewport, or autonomous
Visual category	Classification under the project taxonomy
Technical approach	DOM, CSS, Canvas, SVG, WebGL, physics, etc.
Dependencies	Libraries, remote resources, fonts, images, and other dependencies
License	Identified license and evidence
Attribution requirements	Applicable author and license notices
Security observations	Suspicious operations, network access, obfuscation, or dangerous behavior
Compatibility observations	Known browser and page limitations
Evaluation score	Score established under H00
Visual evidence	Screenshots or recordings from approved environments
Review status	Current workflow state
Reviewer	Responsible reviewer identifier
Decision rationale	Explicit inclusion or rejection justification
Implementation ID	Linked feature ID after approval
Last verification date	Most recent source or behavior verification

Unknown information must remain explicitly marked as unknown.

The agent SHALL NOT invent authorship, licensing, implementation details, or runtime results to complete metadata fields.
G00.3. Source provenance
When possible, the agent shall retain sufficient provenance to establish exactly which source version was examined.

A URL alone is insufficient when the referenced content can change.

For a public repository, record the inspected commit or release.

For an archived page, record the archive identifier and observation date.

For a dynamically hosted bookmarklet, distinguish the short bookmarklet wrapper from any external code that it loads.

The exact version of every externally loaded dependency must be identified where possible.

Unverified dependency chains shall prevent approval.
G00.4. Source retention boundary
Original untrusted JavaScript shall not be introduced into the normal application repository or downloaded onto the developer workstation.

The research ledger may store safe metadata, source locations, hashes, reviewer notes, screenshots, and sanitized behavior descriptions.

Original executable samples, when retention is necessary, shall remain inside a restricted quarantine artifact store associated with the isolated research environment.

Quarantine artifacts must never be imported into the production build.
G00.5. Review states
Each candidate shall have one of the following states:
State	Meaning
discovered	Source identified but not investigated
documented	Basic provenance and behavior recorded
triaged	Preliminary relevance assessment completed
quarantined	Original source requires security evaluation
static-reviewed	Complete accessible source has undergone static inspection
sandbox-verified	Behavior observed in the approved isolated environment
license-reviewed	Implementation and attribution rights assessed
approved	Candidate accepted for implementation
implementing	Project-controlled implementation underway
review-pending	Implementation awaiting required reviews
verified	Implementation passed technical and visual acceptance
integrated	Feature merged into the main catalog
rejected	Candidate excluded with a recorded reason
deferred	Candidate retained for future investigation
blocked	Candidate cannot proceed until a specific issue is resolved

Workflow transitions shall be validated and recorded.

An agent shall not move a candidate directly from discovered to integrated.
G00.6. Rejected candidates
Rejected candidates must remain searchable.

For every rejection, preserve the reason and the evidence supporting that decision.

Reasons may include insufficient novelty, poor visual quality, duplicate behavior, missing source, unacceptable licensing, unsafe functionality, unmanageable dependencies, or unsatisfactory browser compatibility.

Rejected candidates should be available for later reassessment when new information becomes available.

H00. Candidate Evaluation and Quality Selection
H00.1. Two-stage evaluation
Candidate evaluation shall consist of hard eligibility requirements followed by a weighted quality assessment.

Hard requirements determine whether an effect may be considered at all.

Quality scoring determines whether an otherwise eligible effect is sufficiently valuable for the collection.

A high visual-quality score cannot override a security or licensing failure.
H00.2. Hard eligibility requirements
Before receiving final approval, a candidate must satisfy all of the following conditions.
Gate	Requirement
Relevance	The effect produces a playful, humorous, surprising, or emotionally expressive visual interaction
Browser suitability	Its essential behavior is technically feasible in the supported browser environment
Temporary behavior	The project-controlled implementation can operate without persistent changes to the underlying website
Security	No prohibited behavior or unresolved critical security issue remains
Source understanding	The behavior and relevant source mechanics are sufficiently understood
Licensing	Reuse rights or a defensible independently implemented approach have been established
User control	A coherent activation and termination mechanism can be provided
Modularity	The effect can be implemented through the common feature contract
Non-duplication	The effect is materially distinct from existing approved features
Maintainability	Its expected maintenance cost is reasonable relative to its value

A candidate failing any mandatory gate shall be rejected or deferred.
H00.3. Weighted quality assessment
Eligible candidates shall be scored from 0 to 5 in each category.

The final score shall be normalized to 100 points.
Criterion	Weight	Evaluation question
Visual execution quality	25%	Is the animation visually convincing, polished, and satisfying?
Surprise and emotional effect	20%	Does the experience produce an immediate memorable reaction?
Interaction quality	15%	Does the effect respond meaningfully and predictably to user actions?
General applicability	15%	Can the effect operate on varied page structures and content?
Reliability potential	10%	Can it be reconstructed without fragile assumptions?
Originality and distinctiveness	10%	Does it offer something different from already selected effects?
Accessibility and controllability	5%	Can it be comfortably activated, stopped, and configured?
Total	100%	

The suggested minimum approval score is 75/100.

An effect should normally score at least 4/5 for visual execution quality and surprise.

Interaction quality should normally reach at least 3/5, except for deliberately passive or ambient experiences.

These thresholds may be adjusted through a documented project-wide policy revision, but individual agents shall not lower them to increase the catalog count.
H00.4. Definition of high visual quality
High-quality effects shall exhibit deliberate timing, coherent movement, suitable visual feedback, responsive interaction, and recognizable results.

A punch should appear to originate from the selected impact point.

A fracture should visually propagate across the intended surface rather than display unrelated fragments in arbitrary positions.

A gravity effect should convey consistent acceleration, weight, and collision behavior.

A flashlight should produce a clear visual distinction between illuminated and darkened regions.

An effect involving text should preserve enough visual context for the user to understand what was affected.

The review shall evaluate whether the effect feels intentional and satisfying rather than simply chaotic.
H00.5. Review evidence
Quality decisions shall not rely exclusively on promotional descriptions or repository screenshots.

Where legally and technically possible, reviewers shall inspect the implementation and observe the original behavior in the approved sandbox.

If source execution is prohibited, the agent may use available recordings, documentation, or other credible evidence, while marking the behavior as not independently reproduced.

For every approved effect, retain a short behavior description, expected interaction sequence, representative visual evidence, quality score, and decision rationale.
H00.6. Independent review
A candidate should receive at least one independent evaluation from a reviewer who was not responsible for its discovery.

High-complexity effects involving unusual browser APIs, physics engines, dynamic code loading, significant third-party dependencies, or extensive DOM manipulation shall receive additional technical review.

A reviewer shall be able to reject a candidate even when it received a high numerical score.

The reason must be documented.

I00. Mandatory Security Model and Execution Isolation
I00.1. Threat model
Every externally discovered script shall initially be treated as untrusted.

A bookmarklet may be short, humorous, popular, old, or published on a reputable website and still contain dangerous functionality.

Potential threats include data exfiltration, arbitrary network requests, credential access, persistent storage changes, unexpected navigation, malicious downloads, dependency injection, excessive resource consumption, browser exploitation, and deliberate concealment of behavior.

Bookmarklets often execute in the security context of the current page and may access JavaScript-readable page data.

Therefore, an unfamiliar bookmarklet must never be tested against a real authenticated Teams session, Reddit account, email application, administrative console, or other page containing private data.
I00.2. Absolute prohibition on local execution
NO AGENT SHALL EXECUTE ORIGINAL, UNTRUSTED THIRD-PARTY BOOKMARKLET CODE ON THE DEVELOPMENT MACHINE.

This prohibition includes execution through a terminal, Node.js, browser console, bookmark, locally launched Playwright browser, test runner, package post-install script, or any other local mechanism.

It also prohibits installing unknown browser extensions or running unknown demonstrations in the developer's personal browser profile.

The agent shall not treat a local incognito window, a browser profile, or Playwright's browser context isolation as a sufficient substitute for an isolated execution environment.

A candidate whose safety cannot be established shall not be executed merely to determine what it does.
I00.3. Approved dynamic-execution environment
Dynamic analysis of untrusted source may occur only inside a disposable research environment meeting the following requirements.
Control	Mandatory requirement
Isolation	Dedicated remote VM or microVM separate from the developer workstation
Browser automation	Playwright controls the research browser
Browser sandbox	Chromium sandbox enabled where supported
Execution identity	Dedicated unprivileged user
Credentials	No personal, enterprise, development, or production credentials
Filesystem	Ephemeral writable area; no host source directories mounted
Secrets	No access to SSH keys, API tokens, password stores, or cloud credentials
Network	Deny by default; explicitly authorized research acquisition only
Internal networks	Access to private networks, metadata endpoints, and developer services prohibited
Process privileges	No privileged container mode or unnecessary Linux capabilities
Resource limits	Enforced CPU, memory, process, and execution-time limits
Browser profile	Newly created disposable profile for each research session
Test content	Synthetic fixtures without real user data
Logging	Sanitized execution observations and failure information
Disposal	Environment destroyed and reset after untrusted execution
Artifact export	Only approved, sanitized research outputs may leave the environment

A container may provide additional containment, but a container alone shall not be assumed equivalent to a strong security boundary.

Playwright's own documentation notes that its standard Docker configuration is not recommended for untrusted websites without additional precautions and recommends non-root execution with appropriate sandbox configuration for crawling. 

Playwright

I00.4. Network isolation
A strict network policy is essential because hostile JavaScript may transmit information even when the script appears to provide only visual functionality.

The preferred workflow separates source acquisition from execution.

During acquisition, a controlled process retrieves the identified source into quarantine and records its provenance.

During execution, outbound network connectivity shall be disabled unless an explicitly reviewed dependency requires a controlled exception.

If remote resources are needed to reproduce an effect, the complete dependency set should be resolved and inspected before execution.

The execution environment shall not be permitted to contact arbitrary destinations discovered at runtime.

Playwright request interception can provide additional controls and observations, but operating-system or infrastructure-level network isolation remains mandatory. Playwright supports request routing and aborting, which can be used as defense in depth. 

Playwright

I00.5. Static analysis before execution
Before any dynamic execution, the agent shall inspect the complete accessible source, including dynamically referenced scripts and dependencies.

The inspection shall identify potentially dangerous operations, including:
Capability	Review concern
eval, Function, dynamic code construction	Hidden or dynamically generated executable behavior
External script injection	Loading additional code outside the inspected source
fetch, XMLHttpRequest, sendBeacon, WebSocket	Network communication and possible exfiltration
document.cookie, storage APIs	Access to application data
Form and input inspection	Access to user-entered or sensitive information
window.open, location changes	Navigation and external destinations
DOM event dispatch	Accidental or deliberate triggering of application actions
Clipboard APIs	Reading or modifying clipboard contents
File and download APIs	Unwanted file creation or acquisition
Service worker registration	Persistent behavior beyond the visible page interaction
Excessive timers or recursion	Resource exhaustion
Encoded payloads or obfuscation	Behavior intentionally difficult to inspect
Browser or extension APIs	Privileged operations unrelated to the intended visual effect

Static analysis shall be treated as a prerequisite, not a guarantee that the script is safe.
I00.6. Handling uncertainty
If the source is heavily obfuscated, dependent on unavailable remote code, or otherwise impossible to understand reliably, the agent shall mark the candidate as blocked.

It may continue researching the intended visual behavior through descriptions, recordings, or alternative sources.

It shall not execute an unknown payload merely because the sandbox exists.
I00.7. Production code boundary
The final extension shall contain only reviewed, project-controlled executable code and approved dependencies.

The original bookmarklet shall not run inside the production extension.

The production implementation shall not fetch executable JavaScript from the original website or a public CDN at runtime.

This is consistent with Manifest V3's requirement that extension functionality be packaged and reviewable rather than supplied through remotely hosted executable code. 

Chrome for Developers+1

I00.8. Security rule repeated for implementation agents
For avoidance of ambiguity:

Researching a bookmarklet does not grant permission to run it locally.

Rewriting a bookmarklet does not grant permission to copy unreviewed dependencies.

Passing a visual test does not grant permission to bypass security review.

No feature is eligible for integration until its final implementation, dependencies, permissions, and observable behavior have been independently reviewed.

J00. Source Inspection, Reconstruction, and Approval Workflow
J00.1. Required workflow
Every candidate shall follow a documented sequence of discovery, classification, investigation, implementation, and verification.

The process shall not be shortened merely because the source appears simple.
Stage	Required operation	Evidence produced
1. Discover	Locate candidate and authoritative references	Candidate record
2. Classify	Identify visual behavior and target scope	Taxonomy and behavior summary
3. Verify provenance	Establish author, source version, dependencies, and origin	Provenance record
4. Inspect source	Perform non-executing source analysis inside approved research infrastructure	Static review report
5. Assess risk	Identify unsafe operations and unresolved dependencies	Security classification
6. Observe	If authorized, evaluate behavior through isolated Playwright browser	Screenshots, recording, observations
7. Evaluate	Apply relevance gates and quality scoring	Evaluation report
8. Review rights	Determine license compatibility and required attribution	License record
9. Approve	Obtain explicit implementation approval	Recorded decision
10. Specify	Define intended feature behavior and interaction contract	Feature specification
11. Reconstruct	Implement project-controlled TypeScript source	Isolated feature module
12. Test	Execute the rewritten implementation against controlled fixtures	Automated and visual test evidence
13. Review	Conduct independent security, quality, and code review	Review approvals
14. Integrate	Register feature and validate extension behavior	Integration result
15. Release	Include in a reviewed extension package	Release manifest and attribution record

J00.2. Static behavioral reconstruction
The agent shall identify the essential behavior of the original effect before writing replacement code.

For each candidate, establish what causes the effect to start, what the user can interact with, how the animation evolves, what page elements are affected, what resources are required, and how the experience terminates.

Distinguish the visual concept from incidental implementation details.

For example, a historical shattering bookmarklet might depend on jQuery, deprecated browser APIs, obsolete CSS prefixes, and a remote animation library.

Those historical dependencies are not part of the required user experience.

The desired behavior is the visual illusion of a page element fracturing into pieces.

The project shall reproduce that behavior using appropriate modern technologies rather than preserving obsolete dependencies unnecessarily.
J00.3. Reconstruction versus copying
The preferred implementation shall be a modern, independently engineered module based on documented behavior and technical understanding.

Where source adaptation is appropriate and licensed, the agent may reuse authorized algorithms or code while preserving the applicable license requirements.

Where rights are unavailable or unclear, the agent must avoid copying protected source expression and obtain an appropriate legal or project approval before proceeding with an independent behavior-based implementation.

Merely renaming variables, changing syntax, converting CoffeeScript to TypeScript, or splitting a source file into modules does not constitute an independent implementation.
J00.4. Performance-oriented reconstruction
The agent shall analyze whether the original implementation performs unnecessary DOM scans, excessive layout measurements, costly repaints, uncontrolled timers, or inefficient animation updates.

Such problems shall be addressed during reconstruction.

The goal is to reproduce or improve the visible result, not to reproduce historical inefficiencies.
J00.5. Review of reconstructed behavior
The implementation reviewer shall compare the new effect against the documented behavior of the original.

The comparison should assess visual resemblance, interaction fidelity, timing, animation quality, and distinctiveness.

A reconstruction may improve the original effect when the improvement is consistent with the project mission.

However, material changes to its interaction identity shall be documented.
J00.6. Mandatory approval record
An effect cannot be marked verified unless the project can identify the approved source reference, reviewed license status, final module location, test results, visual evidence, reviewer, and explicit acceptance decision.

No agent shall approve its own feature as the sole reviewer.

K00. Licensing, Attribution, and Intellectual Property
K00.1. Attribution is mandatory
Every implementation derived from or materially inspired by an external project shall retain a traceable reference to that project.

The project shall recognize original creators even when the final implementation is written independently.

Attribution shall be part of the implementation workflow, not an optional documentation task performed at release time.
K00.2. License verification
The agent shall determine whether the original source is distributed under a license permitting the intended use.

The existence of publicly accessible source code does not establish permission to copy, modify, or redistribute it.

In particular, a public GitHub repository without a license does not automatically provide general reuse rights. 

GitHub Docs+1

The agent shall record license identity, license version, copyright notices, attribution requirements, redistribution conditions, and relevant dependency licenses.

Copyleft obligations, trademark restrictions, assets, and license incompatibilities must be assessed before integration.
K00.3. Source file attribution
Each externally inspired effect module shall contain a source comment providing a durable attribution reference.

A recommended format is:
/**
 * Effect: Text Bomb
 *
 * Inspired by:
 *   fontBomb
 *   Original author: Philippe-Antoine Lehoux
 *   Source: https://github.com/plehoux/fontBomb
 *
 * Implementation:
 *   Independently reconstructed for this project.
 *
 * Source review:
 *   research/candidates/font-bomb.md
 *
 * License:
 *   See the corresponding provenance and license record.
 */


This example is an illustration of attribution structure. It does not assert that the cited project's license permits a particular form of reuse.

When licensed third-party code is actually incorporated or adapted, the module must include the required copyright and license notices rather than merely an "Inspired by" statement.

Where appropriate, standardized SPDX identifiers and REUSE-compatible file headers shall be used. REUSE documents conventions for file-level copyright and licensing information. 

REUSE

K00.4. Central attribution catalog
The extension shall provide an accessible "Credits and Sources" view.

It shall identify effect names, original projects, credited authors, source URLs, relevant licenses, and the nature of the relationship between the implementation and its source.

Relationships shall be classified as inspired-by, independent-reimplementation, adapted-from, or incorporates-licensed-code, as appropriate.

The registry must distinguish these categories rather than using a generic credit statement for every effect.
K00.5. Asset licensing
Visual assets such as sprites, fonts, textures, sounds, images, and animation data must receive the same licensing scrutiny as executable code.

The agent shall not copy assets from demonstrations simply because they are visible in a public browser.

When practical, the project should generate its own visual assets or use appropriately licensed resources.
K00.6. Blocking conditions
An effect shall not be integrated when required attribution cannot be fulfilled, a necessary license is incompatible with the project, or a significant ownership question remains unresolved.

A desirable effect may remain in the research catalog as a reference even when its original code cannot be incorporated.

L00. System Architecture and Component Boundaries
L00.1. Architectural objective
The application shall use a modular, registry-driven, capability-oriented architecture designed for continuous growth.

The core extension shall provide infrastructure and orchestration.

Individual effects shall provide isolated visual behavior.

The user interface shall select effects by metadata and invoke them through the common runtime.

No central component should require knowledge of how an individual animation is internally implemented.
L00.2. Recommended technology foundation
The recommended implementation stack is TypeScript with strict compiler settings, Chromium Manifest V3, standard Web APIs, and Playwright for browser testing.

A lightweight UI framework may be used for the extension's popup, side panel, or catalog if it provides a clear benefit.

The effect runtime itself should not require a large UI framework.

Effects should use browser-native rendering mechanisms where practical: CSS transforms, Web Animations API, Canvas 2D, SVG, and selectively WebGL or other accelerated rendering technologies.

A bundler capable of generating independently loadable, packaged feature files is required.

The project should avoid introducing a separate framework or runtime for every effect.
L00.3. Logical component architecture
Browser Extension
│
├── Presentation Layer
│   ├── Extension Popup
│   ├── Searchable Effect Catalog
│   ├── Contextual Action Wheel
│   ├── Target Selection UI
│   ├── Effect Controls
│   ├── Settings
│   └── Credits and Sources
│
├── Extension Coordination Layer
│   ├── Manifest V3 Service Worker
│   ├── Tab and Permission Coordinator
│   ├── Injection Coordinator
│   ├── Message Validation
│   └── Browser Compatibility Adapter
│
├── Content Runtime
│   ├── Effect Controller
│   ├── Target Resolver
│   ├── Feature Loader
│   ├── Lifecycle Manager
│   ├── Interaction Controller
│   ├── Resource Tracker
│   ├── Cleanup Coordinator
│   └── Diagnostics
│
├── Shared Effect Services
│   ├── Overlay and Rendering Layer
│   ├── Animation Scheduler
│   ├── Geometry Utilities
│   ├── Particle Primitives
│   ├── Physics Primitives
│   ├── Hit Testing
│   ├── Visual Effects Utilities
│   └── Accessibility Controls
│
├── Effect Registry
│   ├── Validated Effect Metadata
│   ├── Capability Declarations
│   ├── Bundled Module References
│   └── Catalog Index
│
└── Independent Effect Modules
    ├── Punch
    ├── Shatter
    ├── Gravity
    ├── Text Bomb
    ├── Flashlight
    ├── ...
    └── Up to 100 initial effects


The diagram describes responsibilities, not a requirement to create a separate package for every box.
L00.4. Separation of responsibilities
The presentation layer shall handle selection, search, navigation, configuration, and user feedback.

The extension coordination layer shall manage browser permissions, tab identity, injection, and communication between extension contexts.

The content runtime shall execute approved effect modules in the page's content-script environment, coordinate their lifecycle, and manage DOM-related resources.

The registry shall expose validated effect definitions and packaged module locations.

An individual effect shall implement only its specific visual behavior and use approved shared services when needed.
L00.5. Manifest V3 architecture
The extension shall adopt Manifest V3 as the primary platform.

The background service worker must not be treated as a permanently running application process.

Chromium may terminate inactive extension service workers; persistent state must therefore not depend on service-worker global variables. The documented lifecycle and restart behavior shall inform the design. 

Chrome for Developers

Long-running animations and page interactions shall be owned by the content runtime within the target tab, not by the service worker.

The service worker shall handle short-lived coordination tasks such as user-triggered injection, message routing, and extension configuration changes.
L00.6. Permissions and injection
The initial extension should require only the permissions necessary for its core functionality.

The recommended baseline is activeTab, scripting, and storage.

Additional permissions must be justified individually.

The extension shall prefer temporary user-granted access to the active tab rather than requesting persistent access to all websites.

Chrome documents activeTab as temporary access obtained through specified user gestures, including extension actions and commands. 

Chrome for Developers

The application shall use programmatic injection of packaged script files through the supported scripting API. 

Chrome for Developers

By default, injection shall target the main frame. Additional frames shall require explicit support and applicable permissions.
L00.7. Execution world
Effects shall run in an isolated content-script world unless a specifically reviewed feature requires otherwise.

The isolated world helps prevent JavaScript variable collisions with the host page, but it is not a hostile-code sandbox and does not make DOM access inherently safe.

Chromium documents the isolated execution environment and the risks of entering the page's main world. 

Chrome for Developers+1

The project shall prohibit arbitrary execution in the page's MAIN world by default.

Any exception must be reviewed independently and must demonstrate why the desired behavior cannot be implemented safely through the ordinary content-script APIs.
L00.8. No runtime dependency on source projects
The extension must operate without contacting the websites hosting the original bookmarklets.

All required executable effect modules must be present in the extension package.

Shared libraries shall be bundled, pinned, and reviewed.

Remote configuration, if ever introduced, shall not contain executable code or instructions functioning as an unreviewed code interpreter.
L00.9. Dependency direction
Dependencies shall follow a strict direction:

The extension core may depend on shared interfaces, registries, and runtime services.

Effect modules may depend on the public effect SDK and approved shared primitives.

Effect modules shall not depend on the internal implementation of the extension popup, service worker, or unrelated effects.

Shared services shall not import concrete effect modules.

Cross-feature coupling is prohibited unless a formally defined composite feature requires it.
L00.10. Architecture validation
The repository shall enforce boundaries through static dependency rules.

A feature module importing another feature's private implementation, accessing an unauthorized browser API, or bypassing the runtime contract shall fail automated validation.

Shared functionality must be extracted into an approved common module rather than duplicated or accessed through private feature imports.

M00. Effect Module Contract and Lifecycle
M00.1. One effect, one independent module
Every approved effect shall have its own source file and feature directory.

The directory shall serve as the ownership and review boundary for that effect.

A feature may contain auxiliary files for tests, styles, assets, or specialized rendering primitives, but its public entry point must remain explicit.

Each feature shall be independently selectable, testable, and removable.
M00.2. Required interface
The implementation shall define a common TypeScript contract representing the lifecycle and capabilities of an effect.

The following is the recommended baseline interface.
export type EffectScope =
  | "element"
  | "region"
  | "document"
  | "viewport"
  | "autonomous";

export type EffectTarget =
  | {
      kind: "element";
      element: Element;
      document: Document;
    }
  | {
      kind: "document";
      document: Document;
    }
  | {
      kind: "point";
      document: Document;
      x: number;
      y: number;
    }
  | {
      kind: "region";
      document: Document;
      rect: DOMRectReadOnly;
    };

export type StopReason =
  | "user"
  | "replacement"
  | "navigation"
  | "timeout"
  | "error"
  | "shutdown";

export interface EffectContext {
  readonly document: Document;
  readonly signal: AbortSignal;

  readonly overlay: OverlayService;
  readonly animation: AnimationService;
  readonly geometry: GeometryService;
  readonly resources: ResourceTracker;
  readonly logger: EffectLogger;
  readonly preferences: EffectPreferences;
}

export interface EffectInstance<TOptions = unknown> {
  start(
    target: EffectTarget,
    options: TOptions
  ): Promise<void> | void;

  pause?(): Promise<void> | void;
  resume?(): Promise<void> | void;

  stop(
    reason: StopReason
  ): Promise<void> | void;

  dispose(): Promise<void> | void;
}

export interface EffectModule<TOptions = unknown> {
  create(
    context: EffectContext
  ): EffectInstance<TOptions>;
}


The referenced services shall have their own separately versioned interfaces.

Their public contracts must be stable and independent of individual effect implementations.
M00.3. Interface requirements
Every effect shall be instantiated through the create method.

The EffectContext shall provide the approved environment in which the effect operates.

The EffectTarget shall describe the intended DOM or viewport target.

The start method shall begin the user-visible behavior.

The stop method shall terminate the active behavior.

The dispose method shall release owned resources and restore any temporary modifications for which the effect is responsible.

Optional pause and resume methods may be implemented when the effect supports meaningful suspension.
M00.4. DOM references
DOM nodes and document objects shall be passed only within the content runtime.

They shall not be serialized through extension messaging or transferred to the service worker.

Messages crossing extension contexts shall contain validated serializable data, such as effect IDs, option values, and user commands.

The content runtime shall resolve actual DOM targets after the appropriate frame and document have been identified.
M00.5. Target compatibility
Not every effect is compatible with every target type.

The metadata for each effect shall declare its supported scopes.

The runtime shall validate the selected target against the effect's declared capabilities before activation.

For example, an element punch effect should reject a document-only target.

A full-page gravity effect may ignore individual element selection.

The runtime shall provide a user-readable explanation when a requested combination is unsupported.
M00.6. Lifecycle state machine
The effect runtime shall enforce the following states:
unloaded
   ↓
loading
   ↓
ready
   ↓
starting
   ↓
active
   ↔ paused
   ↓
stopping
   ↓
stopped
   ↓
disposed


Error transitions shall lead to controlled cleanup and a terminal failed state.

The runtime must reject invalid transitions, such as starting an already disposed instance or attempting to resume a feature that does not support pausing.
M00.7. Idempotency
An effect shall not create duplicate listeners, overlays, timers, or global state when activated repeatedly.

Repeated activation must either restart the existing instance, reuse the instance according to its documented behavior, or terminate the previous instance before creating a new one.

This policy shall be declared in the feature metadata.
M00.8. Resource ownership
Each effect shall own or explicitly borrow every resource it creates.

Resources include DOM nodes, overlays, timers, animation frames, event listeners, observers, canvas contexts, audio nodes, and temporary style changes.

The shared ResourceTracker shall provide standardized registration and cleanup behavior.

Once an effect has been disposed, no resource owned by that effect should remain active.
M00.9. Error handling
Effect failures shall not crash the entire extension runtime.

An uncaught exception, rendering failure, invalid target, or resource allocation problem shall trigger controlled termination and cleanup.

The runtime shall record a sanitized diagnostic event, notify the user when appropriate, and remain available for subsequent effects.

A failed effect shall not prevent unrelated effects from running later.
M00.10. Contract versioning
The effect SDK shall have an explicit contract version.

Changes that break existing feature modules must be introduced through a documented migration process.

New effects shall target the current SDK version.

Existing features shall not be silently migrated by agents without corresponding regression tests.

N00. Effect Registry, Packaging, and Lazy Loading
N00.1. Registry-driven integration
Every effect shall be registered through a validated metadata definition.

The registry shall be the authoritative catalog of available features.

The user interface shall derive effect names, descriptions, categories, capabilities, settings, icons, and availability directly from registry metadata.

There shall be no separate manually maintained collection of feature names inside the popup, action wheel, or runtime controller.
N00.2. Required feature metadata
A recommended metadata contract is:
export interface EffectDescriptor {
  id: string;
  version: string;
  sdkVersion: string;

  name: string;
  shortDescription: string;
  category: string;
  tags: string[];

  scopes: EffectScope[];

  interaction:
    | "click"
    | "drag"
    | "pointer"
    | "keyboard"
    | "automatic";

  intensity: "low" | "medium" | "high";

  capabilities: {
    requiresTarget: boolean;
    supportsPause: boolean;
    supportsReducedMotion: boolean;
    supportsTouch: boolean;
    usesAudio: boolean;
  };

  compatibility: {
    minimumChromiumVersion?: number;
    supportedDocumentTypes: string[];
  };

  assets: {
    icon: string;
    preview?: string;
  };

  source: {
    researchId: string;
    attributionId: string;
  };

  optionsSchemaId: string;
}


This schema is a baseline and may be refined during detailed design.

The final definition shall also support localization, capability-specific restrictions, and any necessary accessibility metadata.
N00.3. Stable feature identity
Every effect shall receive a permanent, unique identifier.

Identifiers shall be lowercase, descriptive, and suitable for filenames and registry keys.

Examples include punch-element, glass-shatter, gravity-collapse, and text-bomb.

Display names may change without changing feature identifiers.

An existing feature ID shall never be reused for a materially unrelated effect.
N00.4. Build-generated registry
The registry should be generated automatically from validated feature manifests.

The build system shall verify uniqueness, schema validity, file existence, supported SDK version, required attribution, and required tests.

A feature with invalid metadata shall fail the build.

This approach is intended to reduce central-file merge conflicts when agents implement effects in parallel.
N00.5. Lazy loading
The extension shall not load 100 effect engines merely because the user opens a browser tab or displays the effect catalog.

Metadata shall be inexpensive to access.

Executable feature modules shall be loaded only when required.

The recommended approach is to generate one independently loadable, packaged entry file per effect, or a small set of carefully designed chunks when shared dependencies justify it.

The extension's injection coordinator can then load the selected packaged effect file into the active tab.

This avoids shipping the entire runtime cost of the catalog into every page.
N00.6. Loading mechanism
The build system shall produce a validated static mapping between effect identifiers and packaged script paths.

The runtime shall never construct executable code from strings or use eval to activate effects.

Script loading shall use supported extension APIs and locally packaged files.

Chrome's scripting API supports programmatic execution of packaged script files. 

Chrome for Developers

The build must account for content-script execution-world rules, bundler output format, and any necessary web-accessible resources.

Loading shall be tested against actual browser extension packaging, not only a development server.
N00.7. Runtime registration
A loaded effect entry shall register its module with the content runtime through an approved registration mechanism.

Registration shall validate the feature ID and SDK compatibility.

A feature shall not register under another feature's ID.

Duplicate registration shall be handled safely.

The injection coordinator shall confirm registration before issuing an activation command.
N00.8. Resource caching
Already loaded feature modules may remain available within the current document to avoid repeated loading.

However, loaded code must not imply that an effect instance remains active.

The runtime shall distinguish between a cached module and a live instance.

A feature's cleanup operation must not depend on unloading its JavaScript module.
N00.9. Package growth
The build shall report per-feature bundle sizes, shared dependency sizes, total extension size, and changes relative to previous builds.

The collection must not grow through uncontrolled dependency duplication.

An unusually large feature shall require explicit technical review and a documented justification.
N00.10. Removal and replacement
Removing a feature shall be possible by disabling its manifest entry or removing its isolated feature directory, followed by rebuilding the registry.

The removal must not require edits to unrelated effect modules.

Any replacement must preserve stable IDs only when the observable feature identity remains compatible.

O00. DOM Interaction, Visual Rendering, and Reversibility
O00.1. Non-destructive visual behavior
The defining technical requirement is that effects create the appearance of modifying a website without making persistent changes to that website.

The extension may temporarily alter rendered DOM properties where necessary, but it must not submit changes to the site's backend, write application data, or intentionally trigger meaningful website actions.

The preferred implementation is to render effects in a separate visual layer over the existing page.

Where direct DOM manipulation is required, modifications shall be tracked and reversible.
O00.2. Overlay-first rendering
The default rendering strategy shall use a dedicated overlay layer managed by the extension runtime.

This layer should support Canvas, SVG, CSS, and DOM-based visual effects without requiring each module to create its own incompatible page-wide overlay system.

Effects should use the overlay to represent cracks, impact marks, particles, smoke, debris, light, distortions, and other visual phenomena whenever feasible.

The overlay shall not interfere with the page's normal interactions except while the user has explicitly activated an interaction mode.
O00.3. Temporary manipulation of existing elements
Some effects may require existing page elements to appear displaced, rotated, deformed, or removed.

The preferred technique is to create temporary visual representations of the elements while leaving the underlying application state intact.

Where an effect temporarily hides or transforms an original node, it must preserve the properties required for restoration.

The agent shall explicitly document why direct mutation is necessary when an overlay-only approach would otherwise be possible.
O00.4. Restoration requirements
Every effect shall support termination without refreshing the page.

A page refresh shall provide an additional recovery mechanism.

An effect shall restore the changes it owns, including temporary styles, inserted nodes, event handlers, observers, and animation resources.

The restoration process shall avoid overwriting legitimate changes made by the host application while the effect was active.

Consequently, restoration must account for concurrent DOM updates and must not simply replace the entire document with an old snapshot.
O00.5. Page reload semantics
The extension shall not persist a destroyed, cracked, moved, or otherwise transformed page state.

When the document reloads, all effect-owned state associated with the previous document shall be discarded.

The extension shall not automatically reapply an effect on page load.

If a future feature supports persistence, it must require explicit user consent and a separately approved specification.
O00.6. Target selection
For element-level effects, the runtime shall provide a standardized selection mode.

When selection mode is active, the user should be able to move the pointer over page elements and receive a subtle visual indication of the current eligible target.

The user may then select the target through a deliberate interaction.

The target resolver shall use DOM hit testing, element geometry, and capability-specific eligibility rules.

The effect module shall receive the resolved target through the common interface.
O00.7. Target protection
The runtime shall avoid selecting elements whose activation could cause unintended application behavior.

Special care is required for buttons, links, form inputs, editable text, embedded applications, and elements with JavaScript event handlers.

While the user is explicitly selecting a target, the runtime shall intercept the selection interaction where necessary so that selecting a target does not activate the website's underlying control.

The interception must be narrowly scoped and removed immediately after selection or cancellation.

Content in password fields, hidden inputs, sensitive form controls, and other protected surfaces shall not be inspected or used as visual-effect input.
O00.8. Complex page structures
The implementation shall consider pages containing nested elements, transformed containers, CSS zoom, scrolling regions, sticky elements, dynamic layouts, and Shadow DOM.

The target resolver shall use current rendered geometry rather than assuming that an element's position can be obtained reliably from a simple offset calculation.

Coordinate transformations must account for viewport position, scrolling, device pixel ratio, and rendering scale.

Shadow-root traversal shall be supported where the relevant elements are accessible.

Closed Shadow DOM and inaccessible cross-origin frames shall be treated as explicit compatibility boundaries.
O00.9. Single-page applications
The extension shall support modern single-page applications, including pages built with React, Angular, Vue, and similar frameworks.

It shall not assume that the DOM is static after initial page load.

An active effect must handle target removal, parent replacement, scrolling, resizing, route changes, and re-rendering.

If an effect's target disappears, the effect shall either terminate safely or follow a documented target-recovery policy.

The runtime shall not continuously perform expensive whole-document scans without a demonstrated requirement.
O00.10. Multi-frame behavior
Initial implementations may operate only on the top-level document.

Cross-origin iframes must not be treated as freely accessible DOM.

Additional frame support shall require explicit permissions, frame-aware messaging, and separate verification.

Failure to access a frame shall not cause the extension to crash or circumvent browser security restrictions.
O00.11. Visual layering
The extension shall establish a consistent stacking policy for its overlays, controls, and transient effects.

Feature modules shall not independently assign arbitrary maximum z-index values without coordinating with the shared overlay service.

Where possible, the extension's visual controls shall be isolated from host-page styling.

The overlay shall provide an explicit pointer-event policy for passive, active, and target-selection modes.
O00.12. Example: Punch effect
The intended interaction is as follows.

The user selects "Punch", enters element-targeting mode, moves the pointer over a message or comment, and activates the effect on the selected element.

The runtime determines the impact location relative to the target's rendered geometry.

The effect produces a short, directional impact animation. This may include compression, displacement, a brief shake, a comic-style impact mark, small particles, and a temporary dent or crack.

The visual response must be localized to the selected content.

The original message remains unchanged in the underlying application.

The user may repeat the action, stop the effect, or reset its visual state.

The implementation shall define a maximum accumulated deformation and shall prevent indefinite allocation of particles or impact marks.

This interaction is a reference-quality scenario for the entire project.
O00.13. Example: Glass Shatter effect
The user selects an element and triggers a shattering animation.

The effect creates the illusion that the visual surface of the selected element has fractured.

The animation may use a temporary representation of the element's appearance, separated into irregular fragments.

Fragments may receive simulated velocity, rotation, gravity, and fading.

The original content must remain available for restoration.

The feature shall avoid unbounded fragment counts, large texture allocations, and unnecessary re-rendering of the original page content.
O00.14. Example: Flashlight effect
The user activates a flashlight tool.

A darkened overlay appears over the viewport, with a circular or otherwise shaped illuminated area following the pointer.

The underlying webpage remains unchanged.

The implementation shall support configurable radius, softness, darkness, and reduced-motion behavior where applicable.

The effect shall terminate cleanly without leaving any overlay behind.

P00. User Experience and Effect Selection Interface
P00.1. Overall interaction design
The interface shall resemble a coherent collection of playful tools rather than a conventional developer utility.

The user should experience the application as a game-inspired toolbox for temporarily transforming web pages.

The interface must balance visual appeal with efficient access to a growing catalog.
P00.2. Recommended selection model
A single radial wheel containing 100 effects is not recommended.

At that scale, individual actions would be difficult to distinguish, navigate, and discover.

Instead, the application shall adopt a hybrid interaction model combining a contextual action wheel with a searchable effect catalog.
Contextual action wheel
Immediate access to favorite or recently used actions.

Search effects...



Punch

Impact


Shatter

Fracture


Gravity

Physics


Flashlight

Light

Searchable catalog
Browse the full collection by name, purpose, or category.


Conceptual UI layout. Final visual treatment shall be defined by the project's design system.
P00.3. Contextual action wheel
The action wheel shall provide rapid access to a limited number of frequently used effects.

The recommended default is eight primary action slots, with a maximum of approximately 12 visible slots depending on layout and accessibility testing.

The wheel may show user favorites, recently used effects, or a curated selection.

It should support pointer-based selection and keyboard navigation.

The wheel shall not require navigating through 100 individual slices.
P00.4. Searchable catalog
The full catalog shall provide text search, category filtering, favorites, recent effects, and clear effect descriptions.

The user shall be able to locate an effect through either its name or its intended behavior.

For example, searching for "break" should surface relevant effects whose descriptions include shattering, cracking, destruction, or related behavior.

The catalog shall support standardized tags, including emotional intent, interaction type, and target scope.
P00.5. Suggested emotional categories
In addition to technical categories, the interface may organize effects around the experience the user wants.

Examples include "Smash Something", "Cause Chaos", "Play With Physics", "Make It Weird", "Reveal and Explore", and "Just for Fun".

These labels are presentation metadata, not separate technical implementations.

An effect may belong to more than one emotional category.
P00.6. Activation flow
The normal interaction shall follow this sequence:
Stage	User experience
Open	User invokes the extension
Choose	User selects an effect through the wheel or catalog
Prepare	Extension verifies permissions and target compatibility
Target	User selects a DOM element when required
Execute	Selected visual effect begins
Control	User may repeat, pause, adjust, or stop as supported
Restore	Extension terminates the effect and cleans up resources

The normal path from invoking the extension to executing a favorite effect should require as few interactions as practical.
P00.7. Target selection appearance
Target selection shall use a recognizable visual mode distinct from ordinary browsing.

The mode should highlight eligible elements without materially changing their layout.

It shall provide clear feedback when an element cannot be selected.

The user must always have an obvious way to cancel targeting.

The user shall not be forced to complete a selection once the mode is entered.
P00.8. Persistent catalog location
The initial release should provide an extension popup for quick access.

A side panel is recommended for full-catalog exploration, settings, and feature previews because it can accommodate substantially more information than a compact popup.

Chrome provides a Side Panel API specifically for persistent extension UI alongside web content. 

Chrome for Developers

The project shall verify that the chosen side-panel behavior is supported in the targeted Edge and Chrome versions.
P00.9. Preview system
Every included effect should have a short visual preview or thumbnail.

Preview assets must be generated from approved implementations or otherwise authorized visual material.

The preview should communicate the effect's outcome without requiring the user to activate it on a live page.

Full animated previews may be lazy-loaded or disabled under reduced-motion preferences.

Preview generation shall occur against synthetic test content, not private user pages.
P00.10. Visual coherence
The extension shall establish a design system for its icons, typography, colors, spacing, motion, control labels, and interaction feedback.

Individual effect authors shall not introduce unrelated navigation systems or conflicting interface patterns.

An effect may have unique artistic styling, but its configuration and lifecycle controls must remain consistent with the broader application.
P00.11. Accessibility
The extension shall support keyboard navigation, visible focus indicators, descriptive labels, adequate contrast, and accessible alternatives to radial navigation.

The action wheel shall not be the only way to select an effect.

Users shall be able to disable or reduce nonessential animations and visual intensity.

The extension shall respect prefers-reduced-motion unless the user explicitly chooses an appropriate override.

WCAG 2.2 provides relevant guidance concerning animation triggered by interactions and the ability to pause or stop moving content. 

W3C+1

P00.12. Motion and flashing restrictions
The application shall avoid high-frequency flashes, uncontrolled strobe effects, and intentionally disorienting visual behavior.

Rapid flashing shall be restricted according to applicable accessibility guidance.

Potentially intense effects shall provide an appropriate warning or opt-in intensity setting.

A global Stop All control must remain available whenever an effect is active.
P00.13. Unsupported pages
The extension shall handle unsupported pages gracefully.

It must not attempt to bypass browser restrictions on privileged internal pages or otherwise inaccessible documents.

When an effect cannot run, the interface shall explain the limitation rather than reporting a misleading success.

Q00. Performance, Resource Management, and Reliability
Q00.1. Performance philosophy
The extension must remain lightweight when idle.

The existence of a large catalog shall not create an equivalent amount of page runtime overhead.

A user browsing normally without an active effect should experience no recurring effect-related rendering workload.
Q00.2. Animation scheduling
Continuous animations shall use requestAnimationFrame or an appropriate browser-native animation API.

The project shall avoid independently running high-frequency timers across multiple feature modules.

Shared animation utilities shall coordinate frame updates where practical.

Effects shall pause, reduce workload, or terminate according to their lifecycle policy when the document becomes hidden.
Q00.3. Rendering practices
Effects shall prefer compositor-friendly transforms and opacity changes where appropriate.

The implementation shall avoid unnecessary forced synchronous layout operations and repeated expensive DOM traversal within animation frames.

Geometry should be measured when needed and reused until invalidated.

Canvas dimensions shall be bounded and account for device pixel ratio without allocating unnecessarily large drawing surfaces.

Particle systems and physics engines shall impose explicit object-count limits.
Q00.4. Resource budgets
The following are initial engineering targets and must be validated through profiling.
Metric	Initial target
Idle effect-related animation loops	0
Idle effect-owned DOM observers	0
Typical startup after module load	Under 150 ms
Typical animation frame budget at 60 Hz	Approximately 16.7 ms total frame time
Preferred effect-owned frame work on reference hardware	Under 6 ms
Standard cleanup completion	Within 500 ms for ordinary effects
Uncontrolled particle or fragment growth	Prohibited
Memory growth after repeated start/stop cycles	No sustained positive trend beyond normal runtime caching
Active effect instances	Bounded by runtime concurrency policy
Network requests from effect runtime	0 by default

These values are project targets, not claims about existing implementations.

Effects that cannot meet a particular target shall require measured evidence and explicit approval of an exception.
Q00.5. Adaptive quality
Computationally expensive effects should support configurable quality settings.

Possible settings include particle count, fragment density, resolution scale, animation complexity, and simulation frequency.

The runtime may dynamically reduce effect quality when performance degrades.

Adaptive behavior must preserve the recognizable identity of the effect.
Q00.6. Concurrency policy
The default runtime shall allow one primary high-impact DOM transformation at a time.

Additional lightweight overlays may be combined only when the compatibility registry explicitly permits it.

The initial policy should limit overlapping lightweight effects to two, subject to profiling.

Effects that both manipulate the same element or interfere with the same rendering resources shall not execute concurrently unless compatibility has been established by tests.

Selecting an incompatible effect shall trigger controlled termination of the conflicting effect before activation.
Q00.7. Cleanup guarantees
Every effect shall register resources through the approved lifecycle system.

The runtime shall enforce timeout-based failure handling where appropriate.

A missing cleanup implementation, unresolved timer, or persistent event listener shall be treated as a defect.

The feature must not rely on page reload as its only cleanup mechanism.
Q00.8. Failure containment
An effect that fails during initialization or rendering shall not corrupt the registry, block the launcher, or prevent unrelated features from operating.

Each effect shall have an independent error boundary at the orchestration level.

A repeated failure may cause the runtime to disable that effect for the current document and offer the user a safe reset.
Q00.9. Boundary checks
All external inputs, configuration values, DOM targets, effect parameters, and inter-context messages shall be validated.

The runtime shall enforce limits on particle counts, effect duration, animation intensity, target size, region dimensions, and resource allocations.

Unreasonable or malformed values shall be rejected or normalized before reaching an effect implementation.

DOM references must be checked for connectivity and document ownership.

Effects shall not assume that target nodes remain attached or that layout measurements are finite.

R00. Telemetry, Observability, Diagnostics, and Privacy
R00.1. Observability requirements
The project shall include a centralized observability layer from the beginning.

Observability is necessary to identify broken effects, understand performance regressions, detect resource leaks, and maintain a growing feature collection.

However, the project must distinguish between useful technical diagnostics and unnecessary collection of user activity.

The default design shall be privacy-preserving and local-first.
R00.2. No remote telemetry by default
The extension shall not transmit browsing history, page content, selected text, screenshots, message text, or DOM data to external analytics services.

Remote telemetry shall be disabled by default.

The initial release does not require an analytics server or user account system.

Local diagnostic counters and explicitly user-exported reports are sufficient for initial observability.
R00.3. Standardized diagnostic events
Every effect shall report lifecycle events through the shared logging interface.

The recommended event vocabulary includes:
Event	Purpose
effect.load.started	Module loading initiated
effect.load.completed	Module successfully loaded
effect.load.failed	Module loading failed
effect.start.started	Activation requested
effect.start.completed	Activation completed
effect.start.failed	Activation failed
effect.stop.completed	Effect terminated
effect.cleanup.failed	Resource cleanup defect detected
effect.target.invalid	Target does not satisfy feature requirements
effect.performance.degraded	Measured execution exceeded threshold
effect.compatibility.unsupported	Browser or page capability unavailable
effect.error	Unhandled effect-level failure
runtime.error	Core orchestration failure

Event names shall be stable and versioned where necessary.

Feature authors shall not invent independent telemetry schemas for equivalent lifecycle operations.
R00.4. Diagnostic event structure
A standard diagnostic record should include a timestamp, event type, effect ID, effect version, runtime version, correlation ID, duration where relevant, result status, and sanitized error classification.

For example:
export interface DiagnosticEvent {
  timestamp: number;
  event: string;

  effectId?: string;
  effectVersion?: string;

  runtimeVersion: string;
  correlationId: string;

  durationMs?: number;
  status?: "success" | "failure";

  errorCode?: string;
  metadata?: Record<string, number | boolean | string>;
}


Metadata shall be restricted through an allowlisted schema.

Arbitrary strings originating from the page shall not be accepted as diagnostic metadata.
R00.5. Privacy restrictions
Diagnostics shall not record message contents, usernames, email addresses, passwords, selected text, DOM HTML, page titles, full URLs, or user-entered form values.

CSS selectors and element identifiers must also be treated carefully because they can contain sensitive information.

Raw exception messages and stack traces may contain page data. They must therefore be sanitized before persistence or export.

A diagnostic event should describe the technical failure without revealing the content the user was viewing.
R00.6. Local diagnostic storage
The application may maintain bounded local counters for feature launches, failures, and approximate execution durations.

Storage shall have explicit retention and size limits.

The user shall be able to clear locally stored diagnostics.

A local diagnostics view should make it possible to identify which effects are failing without introducing remote tracking.
R00.7. User-exported diagnostic reports
The extension should support exporting a sanitized diagnostic report for troubleshooting.

The export shall be generated only after a user action.

The user shall be able to inspect the report before sharing it.

No automatic upload is required.
R00.8. Development-time observability
Development and test builds may produce more detailed instrumentation inside controlled environments.

This may include animation timing, frame duration distributions, resource counts, heap measurements, DOM mutation counts, and automated test traces.

Such instrumentation shall be disabled or reduced appropriately in production builds.

The diagnostics API shall be shared, so features do not require code changes merely to switch between development and production observability levels.
R00.9. Operational metrics
The engineering team shall track, at minimum, feature failure rate, activation latency, cleanup success rate, test pass rate, bundle size, dependency risk, and performance regressions.

These metrics may be derived from CI and controlled browser tests without observing real users.

S00. Testing, Verification, and Quality Assurance
S00.1. Test-first acceptance model
Every effect shall include automated tests before it is considered complete.

A visually interesting implementation without corresponding verification shall remain in development status.

Testing must cover the feature's observable behavior and its integration with the extension runtime.
S00.2. Required test levels
The project shall maintain unit tests, component-level tests, browser integration tests, visual regression tests, security-oriented tests, and cross-browser smoke tests.
Test layer	Required coverage
Unit	Geometry, parameters, state transitions, and algorithmic behavior
Component	Effect module lifecycle and resource ownership
Integration	Registry, loader, runtime, targeting, and messaging
Browser	Actual interaction with synthetic DOM fixtures
Visual regression	Representative animations and appearance
Performance	Startup latency, frame timing, memory behavior
Security	Permissions, prohibited APIs, network behavior, dependency policy
Accessibility	Keyboard controls, reduced motion, stop behavior
Compatibility	Supported Edge and Chrome versions

S00.3. Playwright as the primary browser test framework
Playwright shall be the primary automated browser-testing framework.

The project shall distinguish between testing trusted project-controlled implementations and analyzing original untrusted source.

Trusted, reviewed code may be tested through normal development CI as appropriate.

Original untrusted source must always follow the isolated research procedure defined in I00.

Playwright provides documented support for testing Chromium extensions using persistent browser contexts. Its current guidance recommends bundled Chromium for extension automation rather than relying on the extension-loading flags removed from branded Chrome and Edge. 

Playwright

Therefore, the automated extension test suite should use the supported Playwright Chromium environment, while separate browser-specific validation covers actual Edge and Chrome releases.
S00.4. Synthetic test pages
The repository shall contain a reusable set of synthetic web pages representing common target structures.

These should include ordinary articles, comments, nested messages, cards, images, lists, deeply nested DOM trees, scrolling containers, editable fields, dynamic page updates, Shadow DOM, and complex CSS layouts.

The test suite shall also include representative message and discussion layouts resembling applications such as Teams and Reddit.

These fixtures must use synthetic content and shall not depend on authenticated access to the real services.
S00.5. Mandatory lifecycle test
Every effect shall pass a standard lifecycle test.

The runtime shall create an instance, activate it, verify observable behavior, stop it, dispose it, and verify that all owned resources have been released.

The test shall repeat the sequence multiple times to detect accumulating listeners, DOM nodes, or timers.

The feature shall also be tested when stop is requested during startup and when the target disappears unexpectedly.
S00.6. Restoration verification
The test system shall capture a controlled baseline before effect activation.

After the effect has been stopped and cleaned up, the test shall verify that effect-owned visual modifications have been removed.

The baseline may include DOM structure, tracked styles, overlay count, active listeners, and relevant rendering state.

The test shall avoid assuming that every DOM attribute remains byte-for-byte identical when the host fixture intentionally changes during execution.

Restoration shall be evaluated according to ownership and controlled test conditions.
S00.7. Navigation and refresh tests
Every effect shall be tested against page refresh and supported navigation scenarios.

The tests must verify that no effect-owned state is automatically reintroduced after refresh.

Single-page application navigation shall be tested separately from full-document navigation.

An effect shall not continue operating on a detached target after route changes.
S00.8. Visual regression tests
Effects with visible output shall have representative screenshot or animation-state tests.

Playwright supports screenshot assertions through toHaveScreenshot(), which can be used for deterministic visual regression testing. 

Playwright

Visual test baselines shall use a controlled browser version, consistent rendering environment, fixed viewport, deterministic random seeds where applicable, and explicit animation timing.

Where a single screenshot cannot capture the quality of an animated effect, test evidence shall include selected keyframes or a short recording reviewed by a human.
S00.9. Reliability fixtures
At minimum, the standard test matrix should include:
Scenario	Expected behavior
Simple static page	Effect activates correctly
Deeply nested DOM	Target is resolved correctly
Scrolled document	Geometry remains aligned
Resized viewport	Effect adapts or terminates safely
Responsive page	Effect handles changed layout
Fixed-position elements	Coordinates remain correct
Shadow DOM	Supported targets work or are explicitly rejected
Cross-origin iframe	No unauthorized access attempt
Removed target	Effect terminates or recovers safely
SPA route change	No stale DOM references
Repeated activation	No duplicate unmanaged resources
Stop during animation	Controlled cleanup
Invalid configuration	Validation rejects malformed values
Reduced motion	Reduced animation behavior applies
Hidden browser tab	Resource usage follows lifecycle policy
Unsupported browser page	Clear user-facing failure
Two simultaneous effects	Concurrency policy enforced
Effect throws an exception	Runtime remains operational

S00.10. Performance regression testing
Performance-sensitive effects shall be tested with realistic synthetic pages, including large documents and pages with many DOM elements.

The project shall record relevant performance measurements so that future implementations can be compared against established baselines.

An effect whose performance deteriorates significantly shall fail the appropriate quality gate until the regression is understood.
S00.11. Security verification
Automated checks shall detect prohibited use of dynamic code execution, unapproved network requests, unauthorized extension APIs, undeclared dependencies, and inappropriate cross-feature imports.

Dependency scanning, secret scanning, and code review shall run during CI.

OWASP's software supply chain guidance recommends peer review, dependency assessment, and automated security controls as part of the development workflow. 

GitHub

Static checks shall not replace manual review for unusual or security-sensitive implementations.
S00.12. Browser compatibility
The project shall maintain an explicit support matrix for Edge and Chrome.

Every supported release shall receive at least a startup, injection, targeting, activation, cleanup, and settings smoke test.

When the runtime depends on a minimum browser version, that requirement shall be documented and enforced.
S00.13. Definition of a passing feature
A feature shall not be marked verified merely because its animation looks correct.

The feature must satisfy its behavior specification, pass the shared interface contract tests, demonstrate safe cleanup, meet applicable performance targets, comply with permissions and licensing requirements, and obtain review approval.

T00. Parallel Development, Agent Coordination, and Git Worktrees
T00.1. Parallel development is a first-class requirement
The project shall support multiple development agents working concurrently on different effects.

The architecture must minimize shared-file modifications and integration conflicts.

Research, implementation, testing, and review shall be represented as independent work items whenever possible.
T00.2. Git worktrees
Git worktrees are the recommended mechanism for parallel implementation in a shared repository.

Git supports multiple working trees associated with one repository, permitting separate branches to be checked out simultaneously. 

git-worktree Documentation

Each implementation agent should receive a dedicated worktree and branch for its assigned effect or small, coherent group of effects.

A worktree is a source-management convenience, not a security isolation mechanism.

No worktree shall be used to execute untrusted original bookmarklets.

Research execution remains restricted to the environment defined in I00.
T00.3. Agent responsibilities
The workflow shall define separate responsibilities for discovery, technical investigation, implementation, review, integration, and release.
Role	Responsibility
Research agent	Discover and document candidate sources
Analysis agent	Establish behavior, dependencies, source risks, and technical feasibility
Curator	Apply relevance and quality standards
Implementation agent	Build a reviewed, isolated effect module
Security reviewer	Verify source handling, implementation safety, permissions, and dependencies
Quality reviewer	Validate visual experience, tests, cleanup, and performance
Integration agent	Merge accepted modules and validate combined behavior
Architecture owner	Maintain shared contracts and resolve design changes
Release coordinator	Validate the complete package and release criteria

These are logical roles.

A small team may combine responsibilities, but no implementation shall receive final approval solely from its author.
T00.4. Parallel work allocation
A work item should have a narrow scope with minimal shared ownership.

An implementation agent should normally modify only its assigned effect directory, its feature-local tests, its metadata, and its attribution files.

Changes to the shared runtime, SDK, dependency configuration, or application UI shall require a separately reviewed architectural task.

Agents shall not opportunistically refactor shared code while implementing an unrelated effect.
T00.5. Recommended repository structure
project/
├── apps/
│   └── extension/
│       ├── manifest/
│       ├── background/
│       ├── popup/
│       ├── sidepanel/
│       └── content/
│
├── packages/
│   ├── effect-sdk/
│   │   ├── interfaces/
│   │   ├── lifecycle/
│   │   ├── rendering/
│   │   ├── geometry/
│   │   └── diagnostics/
│   │
│   ├── effect-runtime/
│   │   ├── controller/
│   │   ├── loader/
│   │   ├── registry/
│   │   ├── targeting/
│   │   └── resource-management/
│   │
│   ├── effects/
│   │   ├── punch-element/
│   │   │   ├── index.ts
│   │   │   ├── effect.json
│   │   │   ├── attribution.md
│   │   │   └── tests/
│   │   │
│   │   ├── glass-shatter/
│   │   ├── gravity-collapse/
│   │   ├── text-bomb/
│   │   └── ...
│   │
│   └── shared-ui/
│
├── research/
│   ├── candidates/
│   ├── evaluations/
│   ├── provenance/
│   ├── search-log/
│   ├── security-reviews/
│   └── research-summary.md
│
├── tests/
│   ├── fixtures/
│   ├── browser/
│   ├── compatibility/
│   ├── performance/
│   └── security/
│
├── tools/
│   ├── registry-generator/
│   ├── metadata-validator/
│   ├── dependency-audit/
│   └── build-report/
│
├── docs/
│   ├── architecture/
│   ├── contributor-guide/
│   ├── effect-development/
│   ├── security/
│   └── release-process/
│
└── .github/
    └── workflows/


The exact directory names may be refined, but the separation between application code, shared infrastructure, independent effects, research evidence, and tests is mandatory.
T00.6. Shared-file conflict prevention
The feature registry shall be generated from per-effect metadata rather than maintained through manual edits to a single large file.

Likewise, the effect catalog UI shall derive its content from metadata.

The project should avoid shared index files requiring an import statement to be added for every new effect.

These decisions will allow agents to add effect modules independently without repeatedly modifying the same central files.
T00.7. Worktree conventions
A branch should identify the work type and feature, such as effect/punch-element, effect/glass-shatter, or research/dom-physics.

Each agent shall work on its own branch and worktree.

An agent shall not write into another agent's worktree.

Agents shall not force-push shared integration branches or silently overwrite another agent's changes.

The integration branch must remain protected by automated and human review.
T00.8. Independent task execution
A feature implementation task shall provide the agent with the approved candidate record, documented behavior, required feature ID, current SDK contract, relevant tests, performance budget, and applicable attribution obligations.

The implementation agent should not need to rediscover the project's overall architecture or make unrelated product decisions.

The task must contain explicit acceptance criteria and a defined output location.
T00.9. Parallel research
Research agents may investigate different historical periods, source repositories, or effect categories simultaneously.

All agents shall use the same candidate schema and quality standards.

Duplicate candidates must be merged through a canonical research record rather than counted as independent discoveries.

Research agents shall not independently approve candidates for production.
T00.10. Integration strategy
Completed effects shall be merged individually or in small batches.

The integration agent shall verify registry generation, contract compatibility, tests, attribution, and runtime compatibility before merging.

Large batches containing many unreviewed features shall be avoided because they make regression attribution difficult.
T00.11. Architectural change management
Changes to shared interfaces shall be coordinated centrally.

A proposed breaking change must identify affected effect modules, required migrations, compatibility strategy, and test implications.

The architecture owner shall approve shared contract changes before multiple implementation agents begin using them.
T00.12. Agent handoff requirements
At the end of a task, an agent shall produce a concise handoff record identifying completed work, modified files, verification performed, unresolved issues, and the exact next workflow state.

Agent work must remain understandable without access to the agent's private reasoning or conversational history.

The repository shall contain the durable evidence required to continue the work.

U00. Delivery Roadmap and Incremental Release Strategy
U00.1. Continuous delivery model
The project shall be implemented incrementally.

The team shall not wait until 100 effects have been completed before validating the architecture or building the extension interface.

A working vertical slice of the product must be established early.

This first vertical slice shall demonstrate that a registered effect can be selected from the extension interface, loaded on demand, executed against a DOM target, stopped, cleaned up, tested, and attributed.

Once this mechanism is verified, additional effects can be implemented through the established contract.
U00.2. Recommended development milestones
Milestone	Deliverable	Exit criterion
M0: Research foundation	Search strategy, research ledger, candidate schema, security workflow	Research process documented and operational
M1: Architecture foundation	MV3 extension, SDK, registry, content runtime, Playwright test infrastructure	A representative effect works end-to-end
M2: First effect collection	Approximately 10 diverse, fully verified effects	Architecture demonstrated across different effect types
M3: User experience	Action wheel, searchable catalog, targeting, settings, credits	Complete user interaction flow functional
M4: Expanded collection	Approximately 25 approved effects	Reliability and performance validated across categories
M5: Scaled collection	Approximately 50 approved effects	Modular development and lazy-loading approach validated at scale
M6: Full initial collection	Up to 100 approved effects	All integrated features satisfy release gates
M7: Maintenance and expansion	Improved effects, replacements, continued discovery	Sustainable ongoing development process

The numerical milestones represent planning targets, not permission to integrate unqualified features.
U00.3. Foundation milestone requirements
Before implementation scales beyond the initial representative effects, the project shall establish the common module interface, registry generator, feature metadata schema, resource tracker, lifecycle manager, logging interface, test fixtures, and security review process.

These foundations must not be repeatedly reinvented by independent feature agents.
U00.4. Architecture validation using representative effects
The first implementation group should deliberately include materially different kinds of effects.

A recommended validation set is Punch, Shatter, Gravity, Text Bomb, and Flashlight.

This group exercises element targeting, localized impacts, fragmentation, document-wide physics, text manipulation, and viewport overlays.

The objective is to expose architectural weaknesses before dozens of effects depend on the same interfaces.

These names describe recommended feature types, not completed or approved implementations.
U00.5. Catalog expansion
Once the foundation is stable, effect implementation may proceed in parallel across multiple agents.

The extension shall remain functional throughout expansion.

New features may be added without releasing an incomplete or unstable catalog.

A feature flag or registry status may distinguish production-ready effects from experimental implementations.

Experimental effects shall not appear in ordinary production builds unless deliberately enabled through an appropriate development configuration.
U00.6. Initial release acceptance
The initial full release shall include no more than 100 approved effects.

Every included effect must have a stable ID, validated metadata, implementation module, source attribution, completed tests, and documented review.

No placeholder effects shall be included to satisfy the numerical target.
U00.7. Post-release expansion
The architecture must support a future catalog containing substantially more than 100 effects.

The initial cap applies only to the first full collection.

Future additions may increase the catalog size or replace lower-value features through a reviewed product decision.

No component may rely on the assumption that the catalog will permanently contain exactly 100 effects.

V00. Maintainability, Long-Term Governance, and Project Evolution
V00.1. Maintainability is a release requirement
The project shall be considered successful only if it remains maintainable after substantial expansion.

A collection of 100 visual effects implemented as one large JavaScript file, even if functional, does not satisfy this specification.

Likewise, a project whose features are individually separated but depend on undocumented global state does not satisfy the intended architecture.

Maintainability must be demonstrated through modularity, stable interfaces, testing, documentation, dependency discipline, and predictable integration.
V00.2. Ownership boundaries
Every source directory shall have a defined responsibility.

Core runtime changes, public SDK changes, UI changes, feature changes, and research changes shall be distinguishable during review.

The project should maintain ownership rules so that changes to sensitive shared infrastructure receive appropriate review.
V00.3. Dependency governance
Dependencies shall be centrally managed.

The project shall avoid multiple incompatible versions of the same animation or physics library without a compelling technical reason.

New dependencies require a documented assessment of maintenance status, licensing, security, size, performance, and compatibility.

Dependency versions shall be pinned through the project's lockfile.

Automated dependency updates may create proposed changes, but updates affecting runtime behavior must undergo testing and review before release.
V00.4. Shared primitives
When multiple effects require similar underlying capabilities, the project should consider extracting reusable primitives.

Potential shared components include particle emitters, hit-testing utilities, geometry calculations, simple physics bodies, easing functions, collision utilities, animation scheduling, and overlay management.

However, abstraction shall follow demonstrated reuse.

The project shall not construct an excessively generalized visual-effects engine before actual requirements justify it.

A shared primitive should exist because it eliminates meaningful duplication or enforces a necessary invariant.
V00.5. Technical debt management
Technical debt shall be recorded explicitly.

An agent shall not silently introduce temporary workarounds that become undocumented dependencies.

Deferred work must identify the reason for deferral, affected functionality, expected risk, and recommended remediation.

Critical security defects, data-integrity risks, and broken cleanup behavior cannot be classified as acceptable routine technical debt.
V00.6. Documentation obligations
The repository shall contain current documentation for architecture, local development, effect creation, registry generation, security procedures, test execution, release packaging, and troubleshooting.

Documentation changes must accompany modifications to public interfaces and development workflows.

The project shall maintain a clear "How to Add a New Effect" guide.

A competent agent familiar with TypeScript and browser extension development should be able to implement an approved effect using that guide without inspecting every existing feature.
V00.7. Compatibility evolution
Browser APIs and security policies may change.

The project shall periodically review the current extension platform requirements and adjust the compatibility matrix.

The extension should isolate browser-specific behavior behind small adapters where meaningful differences exist.

The product must not depend on unsupported APIs or experimental browser flags for its core functionality.
V00.8. Release governance
Every release shall have an identifiable version, tested source revision, generated effect manifest, dependency inventory, and documented verification result.

Build outputs must be reproducible from the repository and approved dependency versions.

Release packages shall exclude quarantined research artifacts, debugging secrets, unreviewed source code, and unnecessary development tools.
V00.9. Regression prevention
An effect that has already passed acceptance shall remain covered by automated tests.

Changes to shared rendering primitives or lifecycle services must trigger tests for all affected effects.

The project shall not accept regressions in existing features merely because new effects are being added.
V00.10. Long-term research maintenance
Research records shall remain active after the initial release.

New visual techniques, browser experiments, and creative coding projects may be discovered continually.

The same research, provenance, licensing, security, and quality procedures must apply to future additions.

The project shall not create a less restrictive process for later releases.
V00.11. Feature retirement
Effects may become obsolete, unreliable, redundant, or incompatible with current browser behavior.

The project shall support disabling and retiring individual effects without affecting unrelated modules.

A retired effect's source attribution and research history shall remain available in the project records.

Previously stored favorites referencing retired effects shall be handled gracefully.
V00.12. Evaluation of architectural health
The team shall periodically assess whether new effects remain easy to implement and integrate.

Relevant indicators include implementation effort per effect, shared-file changes per feature, regression frequency, test execution cost, bundle size growth, dependency duplication, and the number of feature-specific exceptions introduced into the core.

A consistent increase in special-case logic or cross-feature dependencies shall trigger architectural review.

W00. Final Acceptance Criteria and Non-Negotiable Agent Instructions
W00.1. Global acceptance requirements
The project shall not be considered ready for its initial full release unless the following requirements are satisfied.
ID	Acceptance requirement
SEC-001	No original untrusted bookmarklet has been executed on the developer workstation
SEC-002	Dynamic analysis of untrusted JavaScript occurs only in approved disposable isolated environments
SEC-003	Original external executable code is excluded from the production package unless separately reviewed and explicitly authorized under the project's source-reuse policy
SEC-004	All packaged executable dependencies have undergone appropriate security and license review
RES-001	A repeatable, evidence-based research process exists
RES-002	Candidate discoveries include provenance, classification, evaluation, and decision records
RES-003	The collection prioritizes visual novelty, physical interaction, humor, and entertainment
RES-004	The initial release contains no more than 100 approved effects
RES-005	No low-quality effects are included merely to reach the cap
LEG-001	Every externally inspired effect has a traceable source record and appropriate attribution
LEG-002	Required third-party license obligations are satisfied
ARC-001	Every effect is isolated behind the common module contract
ARC-002	The core runtime does not contain hard-coded implementation branches for individual effects
ARC-003	New features can be registered without manually editing central application logic
ARC-004	Effect implementations are loaded on demand
ARC-005	Shared interfaces are versioned and validated
FUN-001	Effects operate on supported DOM nodes, document regions, or viewports according to declared capabilities
FUN-002	Effects create temporary visual interactions without intentional persistent modifications to website data
FUN-003	Every effect supports controlled termination and resource cleanup
FUN-004	Page reload does not restore an active effect
UX-001	Users can browse and search the full collection
UX-002	Users can access favorite actions through the contextual action wheel
UX-003	The interface has consistent visual styling and control conventions
UX-004	Target selection and effect activation are understandable without JavaScript knowledge
UX-005	Keyboard access, stop controls, and reduced-motion behavior are supported
PERF-001	Inactive effects create no recurring animation workload
PERF-002	Rendering and memory usage are bounded
PERF-003	Effect lifecycle and cleanup are covered by automated tests
PRIV-001	Page contents are not transmitted as analytics
PRIV-002	Remote telemetry is disabled by default
OBS-001	Standardized diagnostics exist across all effect modules
OBS-002	Diagnostic information excludes sensitive page data
TEST-001	Each included effect has unit, lifecycle, integration, and applicable visual tests
TEST-002	Browser-extension behavior is tested using Playwright
TEST-003	Supported Edge and Chrome releases receive compatibility validation
DEV-001	Multiple agents can develop separate effects in parallel
DEV-002	Feature additions normally avoid changes to shared application files
DEV-003	Integration requires independent review and automated verification
MAINT-001	Architecture and contribution documentation are current
MAINT-002	Features can be independently added, updated, disabled, and removed
MAINT-003	The system can grow beyond the initial collection without architectural replacement

Every requirement shall be traceable to an implementation, validation procedure, or review artifact.
W00.2. Permanent agent operating rules
All agents operating on this project SHALL observe the following directives.

Research before implementation. Do not generate a large collection of arbitrary effects without investigating existing projects and documenting their behavior.

Never execute unknown original code locally. Treat all external bookmarklets and snippets as untrusted, regardless of popularity, age, or apparent simplicity.

Use isolated Playwright environments for untrusted dynamic investigation. Do not confuse browser automation with operating-system isolation.

Understand the complete relevant source before reconstruction. Do not ignore dynamically loaded dependencies or concealed behavior.

Respect third-party rights. Source availability is not permission to redistribute code. Preserve attribution and comply with applicable licenses.

Reconstruct effects as project-owned modules. Do not directly embed executable bookmarklet strings into the final extension.

Preserve architectural boundaries. Effect modules must depend on approved interfaces and shared services rather than unrelated feature internals.

Prefer visual illusion over direct page mutation. Avoid changing application state or sending actions to host websites.

Enforce bounded resource usage. Every effect must have predictable lifecycle, cleanup, and performance characteristics.

Test before integration. No effect is complete merely because it appears functional in a single demonstration.

Preserve evidence. Research findings, decisions, source references, review results, and technical limitations must be documented in version-controlled project artifacts.

Optimize for sustainable expansion. New functionality must not make the application increasingly fragile, inconsistent, or difficult to maintain.
W00.3. Agent decision-making priorities
When requirements conflict, the agent shall apply this order of precedence:
Priority	Decision principle
1	Security, privacy, and protection against unintended website actions
2	Legal compliance and verified third-party attribution
3	Correctness, reversibility, and resource cleanup
4	High-quality, surprising, entertaining visual effects
5	Architectural consistency and maintainability
6	Accessibility and browser compatibility
7	Performance and efficient resource usage
8	Catalog breadth and collection size
9	Implementation convenience

The numerical catalog target never overrides a higher-priority requirement.
W00.4. Required reporting from the research agent
The agent shall produce a research report summarizing the actual work performed, not merely the intended research strategy.

The report shall contain:
Field	Required evidence
Search coverage	Sources, categories, historical periods, and query families investigated
Discovery count	Actual number of unique candidates found
Evaluated count	Number of candidates subjected to quality review
Approval count	Number accepted for implementation
Rejection summary	Reasons candidates were excluded
Security status	Results and limitations of source inspection
Licensing status	Confirmed permissions, outstanding questions, and attribution requirements
Category distribution	Coverage of different visual and interaction mechanisms
Priority ranking	Recommended implementation order based on quality and feasibility
Research gaps	Underexplored mechanisms or missing sources
Next actions	Concrete research or implementation tasks

The agent must distinguish verified findings from assumptions and unresolved questions.
W00.5. Required reporting from an implementation agent
Each feature implementation shall conclude with a self-contained handoff report.

The report must identify the feature ID, originating research candidate, implemented behavior, source files, relevant dependencies, supported target types, configuration options, tests executed, performance observations, cleanup verification, attribution status, known limitations, and review readiness.

An implementation agent shall not declare a feature production-ready simply because it has committed the source code.
W00.6. Final project objective
The final product should feel like a unified, interactive collection of playful superpowers for the web.

A user should be able to open virtually any supported ordinary web page, choose a visual effect, and interact with that page in an unusual and satisfying way.

A frustrating message can appear to be punched.

A comment can appear to shatter.

A paragraph can explode.

A page can collapse under gravity.

A creature can crawl across content.

A flashlight can reveal parts of an otherwise darkened page.

These experiences should be visually refined, immediately understandable, and temporary.

Behind that playful experience, the engineering system must remain disciplined: rigorously researched, security-conscious, modular, testable, observable, and capable of continued expansion.

The ultimate goal is not simply to collect 100 bookmarklets. It is to create a reliable, extensible browser-effects platform that preserves and advances the most entertaining forms of interactive web experimentation.

X00. Research Basis, Assumptions, and Open Design Decisions
X00.1. Research basis
The specification is informed by documented historical bookmarklets, contemporary effects projects, official Chromium extension documentation, Playwright guidance, Git worktree documentation, accessibility requirements, software supply chain guidance, and open-source licensing practices.

The research establishes that the proposed product is technically plausible and that substantial relevant source material exists.

It does not establish that 100 independently suitable, safe, and legally usable effects have already been identified.

That determination is an explicit deliverable of the research workstream.
X00.2. Initial architectural decisions
The specification adopts the following default decisions.
Design question	Decision
Browser extension standard	Manifest V3
Primary browsers	Edge and Chrome
Implementation language	TypeScript
Effect execution	Packaged feature modules in an isolated content-script world
Research execution	Playwright in disposable, isolated remote environments
Feature architecture	Independent modules behind a common SDK
Feature discovery	Build-generated registry
Loading strategy	Lazy loading of packaged effects
UI model	Contextual action wheel plus searchable catalog
Catalog management	Metadata-driven
Testing framework	Playwright with unit and integration tests
Telemetry	Local-first, sanitized, no remote telemetry by default
Parallel development	Dedicated Git worktrees and independent feature branches
Initial collection cap	100 approved effects
Expansion model	Continuous research and independently reviewed feature additions

These decisions may be revised through explicit architectural review when implementation evidence demonstrates that a different approach is preferable.
X00.3. Remaining decisions to resolve during M1
Several implementation details should remain adjustable until the architectural prototype has been tested.

These include the exact build system, choice of UI framework, animation and physics utility libraries, final SDK method signatures, radial-menu implementation, preview-asset format, and support policy for cross-origin frames.

The architectural prototype must resolve these decisions through measured technical evaluation, not arbitrary preference.

The agent shall document the selected approach and its tradeoffs.
X00.4. Governing principle
Future project decisions shall be evaluated against one persistent question:

Does this change make it easier to discover, safely reconstruct, integrate, and maintain more genuinely entertaining visual effects without compromising the consistency or safety of the extension?

If a proposed addition improves the effect count but undermines security, quality, or maintainability, it is not aligned with the project.

If a change improves the extensibility of the platform while preserving the core user experience, it supports the long-term objective.

End of Specification v1.0. All sections A00 through X00 are initial revision 00. Future edits should increment only the revision code of each affected section while preserving its letter identifier.