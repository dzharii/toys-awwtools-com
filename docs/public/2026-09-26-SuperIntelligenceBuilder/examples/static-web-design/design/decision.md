# Chosen design decision

## Direction

Build **Mended Field Notes**, a one-page repair guide that looks collected from a neighborhood workbench.

The page opens with a plain-language scheduling notice, not a fabricated event date. This pending state is the visual centerpiece: a bold orange-edged service ticket that tells visitors what is known, what is not yet confirmed, and what they can do now.

## Why this direction

- Its visual vocabulary - inspection labels, parts drawers, measuring rules, stitches, and pencil notes - is specific to repairing physical things.
- It can be built entirely in semantic HTML and CSS without images, custom fonts, or network access.
- Editorial sections and oversized labels create hierarchy without relying on a grid of interchangeable SaaS cards.
- It balances warmth with legibility: decorative marks stay outside reading flow, while content uses high-contrast colors and generous line height.
- It handles uncertainty honestly. "Scheduling in progress" reads as a designed service state rather than missing content.

## Interaction decision

Essential information is static and linkable. An item-fit form provides optional, immediate guidance from the same rules shown below it; without JavaScript it returns to the accepted-items section. Native checkboxes form a preparation list, while JavaScript remembers their state only for the current browser tab. A reset button appears only after enhancement.

Feedback is textual, not color-only. No dialogs, carousels, hidden navigation, or scroll-jacking are used. Motion is a single short entrance for major blocks and is disabled under `prefers-reduced-motion`.

## Content decision

The event date, time, venue, and organizer address are unavailable. The site labels them as pending. The volunteer link uses `volunteer@example.com`, visibly described as a demonstration address that must be replaced when the organizer supplies a real one. This preserves a working mailto interaction without presenting the address as an event fact.
