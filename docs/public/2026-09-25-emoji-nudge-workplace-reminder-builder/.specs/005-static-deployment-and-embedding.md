# A00 Run locally

Extract the archive and open the project folder. Opening index.html supports composition and manual selection directly. For a same-origin development address, run python3 -m http.server 8000 from the project folder and visit http://localhost:8000. Clipboard APIs depend on a secure context and user gesture; browsers generally treat localhost as trustworthy.

# B00 Publish the static assets

Run python3 tools/configure-deployment.py with the final absolute HTTPS address, including the path where the app will live. Upload index.html, styles.css, catalog.js, app.js, favicon.ico, favicon.png, and social-preview.jpg. The page references local relative assets, so a subdirectory deployment works naturally. Configure the server to serve JavaScript and CSS with their normal MIME types and JPEG/ICO as image assets. The public document and image URL must be fetchable by social crawlers for link cards to appear.

# C00 Embedding

Use the published HTTPS URL in a SharePoint or Teams-supported embedding surface. Tenant policies determine permitted origins. A host-owned iframe can include allow="clipboard-write" where policy permits. Sandboxed frames need scripts enabled for composition; origin and storage allowances depend on the host's security model. Manual Select remains useful when clipboard permissions are restricted. Host frame-ancestors and frame-denial headers must permit the intended Microsoft 365 host. Container queries use the available app width automatically.

# D00 Share links and privacy

Fragments carry only selected catalog IDs and visual preferences. They are processed in the browser. The current state is stored locally in that browser when storage is available. Reset restores the default configuration. Copy Link is most useful from a published address; a file:// link identifies a local machine path and should be replaced with a hosted URL for sharing with colleagues.

# E00 Packaging and assets

The ZIP includes all runtime assets, numbered specifications, the README, and maintenance tools. Documentation can remain outside the published directory. social-preview.jpg is a generated product illustration; the favicon is a simple cap-and-face mark drawn specifically for this project. Emoji glyphs in the application are rendered by system fonts. Runtime typography uses installed system faces and emoji fonts.
