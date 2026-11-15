# SSML reference

A single-page developer reference for Speech Synthesis Markup Language, focused
on Azure Speech and its Microsoft extensions. Open `index.html` locally or on
the published site; no build step or runtime dependencies are required.

Code snippets use a local, vendored copy of microlight 0.0.7, adapted to the
page's light/dark/print token styles. Its MIT license and provenance are in
`lib/lib-asvd-microlight-0.0.7/`. No scripts, styles, fonts, or other runtime
assets are loaded from another project, CDN, npm, or an external service.

## Contents

- Syntax, voice-family compatibility, and practical examples with expected effects.
- Local XML checks, complete-document copying, UTF-8 downloads, and share links.
- Azure Speech SDK integration and illustrated application design patterns.
- Curated official documentation, GitHub projects, products, and design reading.

The page does not synthesize audio, request credentials, or send scripts to a
service. Use Foundry or Speech Studio to audition examples with your own
authorized resource; service usage can incur charges. Share links contain the
script in the URL fragment and should contain only public text. Local/file URLs
are not accessible to other readers. XML checks are not full service validation.

The Python learning sample in `samples/` requires the Azure Speech SDK and
`SPEECH_KEY` / `SPEECH_REGION` environment variables. It saves a WAV file and
bookmark timing metadata. Its code and the larger SSML sample are also shown
on the reference page.

## Supplied material

`azure_speech_ssml_reference.md`, `azure_speech_ssml_reference.pdf`, and
`sample.txt` are preserved as supplied and linked as supplementary narration
material. `ssml-reference.pdf` is a printable snapshot of the new page, separate
from the supplied narration PDF. Regenerate the snapshot using the page's print
styles when the reference changes. Current official documentation takes precedence
over supplementary material if capability descriptions differ.

Sources and repository metadata were checked on 14 November 2026. Voice
availability, preview status, model behavior, and repository maintenance can
change. The local editor does not establish live Azure compatibility.
