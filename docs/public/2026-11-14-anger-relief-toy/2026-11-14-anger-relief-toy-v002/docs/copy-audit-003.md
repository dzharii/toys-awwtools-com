# UI copy inventory and disposition

The audit covers the popup and on-page catalog's shared render function, the old runtime's status bar, the wheel, feature descriptions, preferences, credits and diagnostics. Templates apply to every catalog entry, not separate manually maintained names. The new source has no remaining Stop all, Again, Aim + click, decorative hero or old generic Escape instruction.

| Existing text or template | Disposition | Current purpose / wording |
| --- | --- | --- |
| Anger Relief Toy | Retained | Product identification in the compact title bar |
| a! logo | Removed from panel | The title provides identification without a decorative badge |
| Local. Temporary. Yours. | Removed | No navigation or state information |
| A little harmless havoc. | Revised | Choose a tool |
| Break the mood. Keep the page. | Removed | No actionable information |
| Hero POW illustration | Removed from panel | Effects and small equipment illustrations provide visual character |
| Find a tool. Try 'break'... | Revised | Search tools; accessible name Search effects retained for continuity |
| All categories / category names | Retained | Filter the collection |
| All tools / Favorites / Recent | Retained | Collection navigation |
| Effect names and descriptions | Retained | Identify the tool and its behavior; now 14px description text |
| Use {name} | Revised | Equip {name}, with pressed state for the current equipment |
| Aim + click / Whole page / Screen | Removed from cards | Metadata still controls behavior; HUD gives the current contextual instruction |
| Favorite {name} / star | Retained | Save a tool; accessible pressed state identifies selection |
| Star a tool to keep it close. | Retained | Explains an empty favorites view |
| Your recently used tools will appear here. | Retained | Explains an empty recent view |
| No tools match... | Retained | Provides search recovery terms |
| Preparing {name}... | Retained | Immediate launch feedback |
| {name} ready... | Revised in use | Equipped state is shown persistently by the inventory |
| {name} started. Press Escape to restore. | Revised | {name} equipped. Put away ends the tool. |
| Unsupported-page explanation | Retained | Explains browser-private pages and next action |
| Open action wheel | Promoted | Visible at the top of both catalog surfaces, with actual Commands API binding |
| Hardcoded Alt+Shift+A in help | Removed | Suggested binding stays in manifest; displayed binding is read from browser |
| Stop all | Replaced | Put away ends equipment; End effect ends only its invocation |
| Again | Removed | Repeatable tools remain ready; Use tool restarts an ended non-element invocation |
| Close text link | Replaced | Recognizable circular X with accessible Close tools / Close wheel label |
| Tab to choose. Enter to use. Escape to close. | Revised | Tab or arrow keys to choose. Esc closes the wheel. |
| {name}: aim + click, or Tab then Enter | Replaced | Inventory shows the name separately and Click an element. Tab targets; Enter uses. |
| Esc restores the page | Removed | Escape follows the actual topmost-layer policy |
| {name} active | Reorganized | Tool name plus action-specific inventory guidance |
| Loading {name}... | Revised | Persistent icon/name plus Loading tool... |
| Tool-load/render failure messages | Revised | Recover through Switch or the next target; no private error text |
| Settings, credits & help | Split | Tool settings; separate Credits and sources; separate Local diagnostics |
| Strength | Retained | Configures effect intensity |
| Auto-restore (seconds) | Revised | One-shot restore after (seconds); continuous effects are excluded |
| Flashlight radius / darkness / softness | Retained | Configure the actual illumination |
| Reduce motion... | Retained | Explains system preference also applies |
| Old scroll/resize/hidden-tab stop help | Replaced | Documents persistent equipment and topmost Escape behavior |
| Reset preferences | Retained | Restore stored defaults |
| Credits and sources / Source | Retained | Provenance access in a secondary section |
| Local diagnostics | Retained, secondary | Troubleshooting, not primary navigation |
| Clear diagnostics / View sanitized report | Retained | User-controlled local technical report |
| Switch | Added | Direct access to the wheel from equipment |
| Put away | Added consistently | Deliberately release equipment and all its resources |
| End effect | Added | Stop the current invocation while keeping the tool |
| Use tool | Added conditionally | Restart a selected continuous/simulation/overlay invocation that has ended |
| Suspended while this tab is hidden | Added | Explains temporarily inactive work without implying unequipping |
| No visible targets... | Added | Explains an empty simulation without pretending an animation occurred |
| Move tools window | Added | Accessible title-bar drag/keyboard operation |

Functional labels use 14px or larger, except the checkmark glyph and technical JSON. The unused tiny scope badges are gone. The selected state uses an icon, name, pressed semantics and checkmark rather than color alone. Generated mockups and actual SVG artwork were inspected; actual browser screenshots remain unavailable, so rendered legibility and hierarchy are not claimed as accepted.
