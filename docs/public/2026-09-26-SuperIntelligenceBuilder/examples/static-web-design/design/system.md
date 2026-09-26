# Design system

## Foundation

The system is called **Bench Notes**. It uses only local browser capabilities.

### Color

| Token | Value | Role |
| --- | --- | --- |
| Paper | `#f3eddf` | Main background |
| Paper light | `#fffaf0` | Reading surfaces |
| Ink | `#17352f` | Primary text and rules |
| Ink soft | `#4b5d57` | Secondary text |
| Safety orange | `#cc4525` | Action and status emphasis |
| Thread yellow | `#f2c84b` | Small highlights |
| Workbench green | `#315e52` | Dark bands |

Ink on paper and paper on workbench green are the default reading combinations. Orange is reserved for strong emphasis and never carries meaning alone.

### Type

- Display: `Rockwell, "Roboto Slab", "Courier New", serif` for sturdy repair-manual headings.
- Body: `"Trebuchet MS", "Segoe UI", sans-serif` for friendly readability.
- Labels: body family in uppercase with tracking, never used for long paragraphs.
- Fluid sizes use `clamp()` so hierarchy survives narrow viewports and zoom.

### Space and geometry

- Spacing scale: 0.4, 0.75, 1, 1.5, 2.5, 4, and 6 rem.
- Content width: 72rem; prose measure: 65ch.
- Corners are mostly square or lightly rounded. Dashed seams and doubled rules signal repair-specific groupings.
- Shadows are hard and slightly offset, like stacked paper rather than floating software surfaces.

## Components

- **Masthead:** wordmark, one-line purpose, and wrapping anchor links.
- **Service ticket:** pending-event status with explicit fields for date/time and venue.
- **Bench label:** section number, eyebrow, title, and short introduction.
- **Parts drawers:** four item categories in a continuous divided cabinet, not detached cards.
- **Fit checker:** labeled select, submit button, and adjacent polite status result.
- **Repair route:** ordered list with large printed numerals and connecting rule.
- **Packing list:** native checkbox labels arranged like a shop checklist.
- **Access ledger:** definition list pairing access topics with current information.
- **Email action:** high-contrast mailto link with subject prefilled and visible destination.

## State rules

- **Hover:** underline or offset changes supplement, but never replace, persistent affordance.
- **Focus:** 3px yellow outline with 3px ink offset on all interactive elements.
- **Pending/empty:** warm orange ticket plus plain next-step copy.
- **Unmatched/error:** fit checker returns calm text that redirects to emailing before transport.
- **Long content:** prose wraps without fixed heights; grids use minmax and collapse naturally.
- **No JavaScript:** all categories, process, access information, and mail action remain visible; a short `noscript` note explains that the helper is optional.
- **Reduced motion:** animations and smooth scrolling are disabled.

## Responsive behavior

- Below 48rem, the masthead, ticket, process, and footer become single-column.
- Navigation wraps without a menu dependency.
- Drawers stack with horizontal dividers; no content order changes.
- Tap targets maintain at least 44px block size where practical.
- Decorative rulers and labels simplify, while status and headings remain prominent.
