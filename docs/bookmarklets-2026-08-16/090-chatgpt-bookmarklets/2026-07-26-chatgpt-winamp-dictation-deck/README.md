# ChatGPT Dictation Deck

Open `index.html` in a desktop browser. Drag the green installation button to the bookmarks bar, then invoke the bookmark while `https://chatgpt.com/` is open.

The installation page loads `chatgpt-winamp-dictation.bookmarklet.js`, converts the named `bookmarklet_chatgpt_winamp_dictation_deck` function to source with `Function.prototype.toString()`, and constructs the `javascript:` URL at runtime. The bookmarklet implementation therefore exists in one source file only.

The bookmarklet uses ChatGPT's undocumented same-origin `/backend-api/transcribe` endpoint. It may require maintenance when ChatGPT changes its web application.

No captured HAR data, cookies, access tokens, or account identifiers are included in this package.
