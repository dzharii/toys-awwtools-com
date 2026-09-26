# Juniper Street Repair Cafe - design brief

## Assignment

Create a one-page, local static website for Juniper Street Repair Cafe, a volunteer neighborhood event where residents bring lamps, toys, clothing, and small appliances for help repairing them. The page must explain the next-event status, accepted items, the visit flow, accessibility, and a volunteer email call to action.

No confirmed event date, time, venue, or organizer email address was supplied. The page must not invent them. It should make the scheduling state feel deliberate and useful, and identify the demonstration email address as a value to replace before publication.

## Audience and jobs

- A neighbor deciding whether their item is suitable.
- A first-time visitor who wants to know what will happen and what to bring.
- A visitor checking physical, sensory, communication, or transit-access information.
- A prospective volunteer who wants a direct next step.

## Content plan

1. **Header:** identity, concise purpose, and anchor navigation.
2. **Event notice:** honest scheduling status, what is still pending, and a shortcut to volunteering.
3. **Accepted items:** the four requested categories, boundaries, and a progressively enhanced item-fit helper.
4. **Process:** four numbered stages from arrival through a shared repair decision.
5. **Bring-with-you strip:** practical preparation checklist using native checkboxes.
6. **Accessibility:** clear commitments and a route for requesting details or accommodations.
7. **Volunteer call:** roles, reassurance that varied skill levels are useful, and a mailto action.
8. **Footer:** lightweight identity and no tracking claim.

## Visual thesis

The site should feel like a well-used repair manual made welcoming: warm paper, ink-dark type, safety orange, workbench green, registration marks, stitched rules, and large instructional numbering. The composition alternates dense, practical notes with generous typographic moments. Every decorative choice should recall inspection tags, mending, measurement, or hand annotation - not software dashboards.

## Interaction thesis

The page is complete before JavaScript runs. Native anchors, checkboxes, select controls, and mail links do the essential work. JavaScript only adds a fast "is this a fit?" answer and remembers the visitor's preparation checklist for the current tab. Feedback appears next to the control, focus remains predictable, and motion is brief and optional.

## Constraints and success criteria

- Opens from the filesystem with no server, build step, network request, or remote asset.
- Primary event status and all substantive content are present in HTML.
- Keyboard users can reach every link and control and always see focus.
- The page remains legible from small phones through wide screens and tolerates enlarged or long text.
- Reduced-motion preference removes nonessential animation.
- Empty, unmatched/error, no-JavaScript, and pending-event states have deliberate copy and layout.
