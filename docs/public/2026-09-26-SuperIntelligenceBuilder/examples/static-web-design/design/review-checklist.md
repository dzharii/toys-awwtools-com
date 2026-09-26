# Review checklist

## Content and intent

- [x] Next-event state is explicit without inventing a date, time, or venue.
- [x] Lamps, toys, clothing, and small appliances are described.
- [x] The visit process is understandable before any interaction.
- [x] Accessibility information is grouped and written in plain language.
- [x] A volunteer mailto action is present and its placeholder address is disclosed.
- [x] Visual, content, and interaction theses are documented.
- [x] Three distinct directions and the selection rationale are documented.

## Semantics and keyboard

- [x] Skip link, header, navigation, main, sections, and footer landmarks are used.
- [x] Heading levels follow a logical outline.
- [x] Controls have persistent labels and use native elements.
- [x] Focus is highly visible and not obscured by sticky UI.
- [x] Feedback is announced through a polite status region.
- [x] Links explain their destination or action in context.

## Visual and responsive

- [x] Subject-specific typography, workbench colors, repair marks, and motion are used.
- [x] Layout avoids a generic dashboard/card aesthetic.
- [x] Text wraps and containers allow long content without fixed heights.
- [x] Narrow layouts keep source order and primary information.
- [x] Color is not the sole indicator of state.
- [x] Reduced-motion styles remove entrance movement and smooth scrolling.

## Resilience

- [x] The page opens directly from disk with local relative assets.
- [x] Primary content is available with JavaScript disabled.
- [x] The pending event state is designed, not blank.
- [x] The item checker has initial, matched, and unmatched/error copy.
- [x] Storage access is guarded so privacy modes do not break the page.
- [x] No remote fonts, images, scripts, analytics, or network calls are present.

## Local checks performed

- [ ] Replace the demonstration volunteer address when a confirmed organizer address exists.
- [ ] Replace the scheduling notice when date, time, venue, and access-route details are confirmed.
- [x] HTML structure and local references checked with local scripts.
- [x] CSS delimiter balance and JavaScript syntax checked locally.
- [x] Responsive rules inspected at small and wide breakpoints.
- [x] No-JavaScript content and reduced-motion rules inspected in source.
