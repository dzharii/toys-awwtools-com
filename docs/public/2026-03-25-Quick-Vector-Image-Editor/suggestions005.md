A00. Clipboard workflow specification revision 00

A01. Document purpose revision 00

This document defines the clipboard-focused extension to the vector image editor specified in the main product specification revision 02 and the UX/UI decision specification revision 00. It is a companion specification. It does not replace the main product specification. It adds explicit clipboard behavior rules so that the application can support a more file-light workflow without becoming ambiguous or inconsistent.

This document exists because clipboard workflows are central to screenshot-heavy daily use. For many users, copy and paste are faster and more convenient than saving files to disk and reopening them. The editor must therefore treat clipboard behavior as a first-class workflow, not as a narrow export convenience.

A02. Relationship to the existing specifications revision 00

This document inherits the scope, constraints, and quality expectations of the main product specification revision 02 and the UX/UI decision specification revision 00.

The main product specification remains the authority for the document model, SVG rules, persistence, rendering, and object behavior.

The UX/UI decision specification remains the authority for layout, tool exposure, and general interaction design.

This document is binding for clipboard behavior where that behavior was previously underspecified or intentionally narrow.

A03. Clipboard design objective revision 00

The objective of this revision is to make clipboard use feel natural, reliable, and visible.

The user should be able to work from copied screenshots, copied SVG, copied text, and copied editor objects with minimal reliance on file dialogs.

The clipboard extension must create value in five concrete ways.

First, it must shorten the path from screenshot capture to editable content in the canvas.

Second, it must shorten the path from selected editor content to reuse within the same editing session.

Third, it must preserve clear distinction between pasting into the current canvas and replacing the current document.

Fourth, it must fail safely and explicitly when browser clipboard permissions or MIME support are limited.

Fifth, it must remain coherent with the existing editor model instead of introducing a second, incompatible interaction model.

B00. Clipboard scope revision 00

B01. In-scope clipboard capabilities revision 00

Revision 00 of the clipboard workflow must include these capabilities.

Paste raster images from the system clipboard into the current canvas.

Paste generic SVG from the system clipboard into the current canvas as an image object.

Paste editor-generated SVG from the system clipboard as a replacement document through an explicit document-level action.

Copy the current document SVG to the system clipboard.

Copy the current canvas raster output as PNG to the system clipboard, subject to existing raster and browser support rules.

Copy and cut the currently selected object for reuse within the editor.

Paste previously copied editor objects back into the current document with new object identity.

Paste plain text from the clipboard into the editor as a text object when the paste target is not already an active text input.

Keyboard copy, cut, and paste shortcuts outside active text fields.

Visible toolbar clipboard actions.

Clipboard operation notices, disabled-state explanations, and verbose logging.

B02. Out-of-scope clipboard capabilities revision 00

Revision 00 of the clipboard workflow explicitly excludes the following.

Arbitrary rich HTML import as editable document content.

Multi-object clipboard copy while the editor still supports only single selection.

Clipboard-driven import of arbitrary non-editor SVG as editable vector objects.

Clipboard synchronization across tabs, browsers, or devices beyond what the browser clipboard already provides.

Background clipboard polling or non-user-initiated clipboard reads.

Automatic document replacement on normal paste.

B03. Clipboard-first rule revision 00

Clipboard-first does not mean file workflows are removed. File open and file image insertion remain part of the product.

Clipboard-first means that common actions should not force the user to think in terms of files when the same task can be completed naturally through copy and paste.

C00. Core clipboard model revision 00

C01. Two clipboard intents revision 00

The editor must distinguish two clipboard intents.

Canvas paste. The user wants to insert or reuse content inside the current document.

Document paste. The user wants to replace the current document with a clipboard document.

These two intents must not be conflated.

C02. Binding paste rule revision 00

Normal Paste inserts into the current document. It must not implicitly replace the current document.

Paste Document is an explicit top-level action. It may replace the current document after the same confirmation model used for other replacement flows.

C03. Clipboard payload priority revision 00

When the editor resolves clipboard content for normal Paste, it must evaluate supported payloads in this priority order:

editor object payload;
editor SVG document payload;
generic SVG payload;
raster image payload;
plain text payload.

If the clipboard contains editor SVG during normal Paste, the editor must insert it into the canvas as image content and must not silently replace the document.

If the clipboard contains editor SVG during Paste Document, the editor must treat it as a reopen path for the full document.

C04. Same-tab clipboard reliability rule revision 00

Browser clipboard support is inconsistent, especially for custom MIME payloads.

The editor must therefore maintain an internal same-tab clipboard mirror for copied editor objects. This mirror exists to preserve reliable object copy and paste inside the current tab even when full custom MIME round-trip through the system clipboard is unavailable.

This mirror is an editor aid, not a substitute for the system clipboard.

D00. User-visible clipboard actions revision 00

D01. Required toolbar actions revision 00

The top toolbar must expose these clipboard-related actions as first-class controls.

Paste Document.

Paste.

Copy PNG.

Copy SVG.

These actions sit beside the existing open, insert, and export actions because they are part of the same workflow boundary.

D02. Required selection actions revision 00

When an object is selected, the contextual inspector must expose:

Copy Object.

Cut Object.

These actions complement the keyboard shortcuts and make object reuse discoverable without requiring the user to guess shortcut support.

D03. Required keyboard shortcuts revision 00

Outside active text inputs, the editor must support these shortcuts using platform-standard modifier behavior.

Copy selected object.

Cut selected object.

Paste into the current document.

These shortcuts must not hijack normal browser text editing behavior while the user is actively typing into the text editing overlay or another input control.

E00. Clipboard import behavior revision 00

E01. Raster image paste revision 00

If the clipboard contains a supported raster image payload, the editor must insert it as an embedded image object using the same document rules as file-based image insertion.

Image insertion from clipboard must preserve the existing guarantees around embedded data URLs, selection, autosave, and persistence-budget warnings.

E02. Generic SVG paste revision 00

If the clipboard contains non-editor SVG and the user performs normal Paste, the editor must insert it as image content in the current canvas.

This preserves visual utility without claiming arbitrary editable SVG import, which remains out of scope.

E03. Editor SVG paste revision 00

If the clipboard contains editor-generated SVG and the user performs normal Paste, the editor must insert it into the current canvas as image content and must indicate that Paste Document exists for editable reopen behavior.

If the clipboard contains editor-generated SVG and the user performs Paste Document, the editor must validate it using the existing editor SVG parser and must treat successful parse as a document replacement flow.

E04. Plain text paste revision 00

If the user pastes while actively editing text through an input control, normal browser text-entry behavior wins.

If the user pastes plain text outside an active text input, the editor must create a text object using the normalized single-line text model and place it into the current document.

Line breaks must be normalized to spaces before commit.

E05. Unsupported clipboard content revision 00

If the clipboard does not contain a supported payload, the editor must not mutate the document and must provide a clear, non-blocking notice describing the failure.

Generic "paste failed" with no explanation is not acceptable when the editor can determine that the clipboard format is unsupported.

F00. Clipboard export behavior revision 00

F01. Copy PNG revision 00

Copy PNG remains the primary quick-share raster clipboard action.

Its existing browser support checks and raster preflight checks remain binding.

F02. Copy SVG revision 00

Copy SVG must copy the full current editor SVG document to the system clipboard.

If browser item-based clipboard write is supported, the editor should write SVG using the standard SVG MIME type plus a plain-text fallback where helpful.

If only text clipboard write is supported, the editor may fall back to SVG text.

F03. Copy and cut selected object revision 00

Copy Object must serialize the selected object into the editor object clipboard payload, update the same-tab clipboard mirror, and attempt best-effort system clipboard write.

Cut Object follows the same copy path first and deletes the selected object only after the editor has successfully prepared at least the internal same-tab clipboard mirror.

F04. Object paste revision 00

Pasted editor objects must receive new stable ids. Original ids must never be reused.

Pasted objects must be visibly offset from the source geometry so the user can perceive that paste succeeded.

For line objects, both endpoints must be offset consistently.

For all other supported objects, the anchor position must be offset consistently.

G00. UX and interaction rules revision 00

G01. Visibility rule revision 00

Clipboard actions must remain visible and understandable.

If a clipboard action is unsupported in the current browser environment, the control may be disabled, but it must expose a reason through visible explanation such as tooltip text or nearby feedback.

G02. Replacement safety rule revision 00

Paste Document must use the same document replacement confirmation model as Open Document and New Document.

If the current document came from recovered local drafts, that warning model remains applicable here as well.

G03. Low-friction rule revision 00

The clipboard workflow should shorten the common path, not create a new modal-heavy subsystem.

The user should not be forced through extra dialogs just to paste a screenshot or copied text into the current document.

G04. Predictability rule revision 00

Paste must always mean insert into the current document.

Paste Document must always mean replace the current document.

This rule must hold consistently so the user can trust what happens before clicking.

H00. Technical behavior revision 00

H01. Clipboard module boundary revision 00

Clipboard behavior must live behind a dedicated internal module boundary rather than being scattered across random UI event handlers.

That module should own:

capability detection;
custom MIME constants;
clipboard payload parsing and classification;
same-tab clipboard mirror support helpers;
clipboard write helpers for object and SVG output.

H02. MIME rules revision 00

The implementation may use a custom MIME type for editor object round-trip, provided it remains stable and explicit.

Plain text fallback is required for copied text objects where practical.

The implementation must not claim support for arbitrary rich HTML editable import merely because browser clipboard APIs expose HTML payloads.

H03. Logging rules revision 00

Clipboard operations are high-value debugging surfaces and must be logged verbosely.

The log must include, where available:

operation type;
source path such as toolbar button or keyboard shortcut;
detected clipboard payload kind;
whether system clipboard read or write was available;
whether same-tab mirror fallback was used;
whether the operation inserted content, replaced the document, or failed;
error details when failure occurs.

H04. Persistence interaction rule revision 00

Successful clipboard paste that mutates the document must flow through the normal document commit and autosave path.

Clipboard copy operations that do not mutate the document must not schedule autosave.

I00. Validation and testing revision 00

I01. Required clipboard validation cases revision 00

Validation for revision 00 must include at least these scenarios.

Paste supported raster image from clipboard.

Paste generic SVG as image content.

Paste editor SVG as image content through normal Paste.

Paste editor SVG as full document replacement through Paste Document.

Copy and paste selected text object through the editor object clipboard path.

Copy and paste selected non-text object through the editor object clipboard path.

Cut selected object with successful internal clipboard preparation.

Fallback to same-tab clipboard mirror when full system custom MIME support is unavailable.

Plain text paste outside active text input creates a text object with normalized text.

Unsupported clipboard payload shows explicit feedback and does not mutate the document.

I02. Review focus areas revision 00

Clipboard-specific review and validation must pay extra attention to:

document replacement safety;
custom MIME degradation behavior;
same-tab mirror reliability;
browser capability messaging;
interaction consistency between button and shortcut paths;
logging completeness.

J00. Summary revision 00

Revision 00 defines a clipboard-first extension to the vector image editor. The editor continues to support file workflows, but clipboard is elevated to a first-class path for import, reuse, reopen, and output. Normal Paste inserts into the current document. Paste Document explicitly replaces the current document. Raster images, generic SVG, editor SVG, plain text, and editor object payloads each receive explicit handling rules. System clipboard behavior is augmented with a same-tab mirror for reliable object reuse where browser support is limited. Clipboard actions remain visible, logged, validated, and consistent with the editor's existing trust model.
