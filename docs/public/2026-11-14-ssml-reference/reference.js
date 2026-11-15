"use strict";

(() => {
    const SSML_NS = "http://www.w3.org/2001/10/synthesis";
    const MSTTS_NS = "https://www.w3.org/2001/mstts";
    const XML_NS = "http://www.w3.org/XML/1998/namespace";
    const editor = document.querySelector("#ssml-input");
    const status = document.querySelector("#editor-status");
    const results = document.querySelector("#validation-results");
    const picker = document.querySelector("#example-picker");
    const sharePanel = document.querySelector("#share-panel");
    const shareUrl = document.querySelector("#share-url");
    const examples = new Map();
    const encoder = new TextEncoder();

    function documentFor(example) {
        const code = example.querySelector("pre code").textContent.trim();
        if (example.dataset.complete === "true") return code;
        const parameters = example.dataset.parameters
            ? ` parameters="${example.dataset.parameters}"`
            : "";
        const content = code.split("\n").map(line => `    ${line}`).join("\n");
        return `<speak version="1.0" xml:lang="en-US"\n` +
            `       xmlns="${SSML_NS}"\n       xmlns:mstts="${MSTTS_NS}">\n` +
            `  <voice name="${example.dataset.voice}"${parameters}>\n` +
            `${content}\n  </voice>\n</speak>`;
    }

    function announce(message) {
        status.textContent = message;
    }

    function updateCount() {
        document.querySelector("#editor-count").textContent =
            `${editor.value.length.toLocaleString()} / 20,000 characters; ` +
            `${encoder.encode(editor.value).length.toLocaleString()} UTF-8 bytes.`;
    }

    function clearFeedback() {
        results.replaceChildren();
        sharePanel.hidden = true;
        shareUrl.value = "";
    }

    function loadExample(id, moveFocus) {
        const example = examples.get(id);
        if (!example) return;
        editor.value = example.document;
        picker.value = id;
        clearFeedback();
        updateCount();
        announce(`Loaded ${example.title}. Check XML, then copy or download for Azure.`);
        if (moveFocus) {
            history.replaceState(null, "", "#workbench");
            editor.focus();
            editor.scrollIntoView({ block: "center" });
        }
    }

    async function copyText(text) {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch {
            // Local files and preview iframes can deny clipboard permission.
        }
        const previousFocus = document.activeElement;
        const field = document.createElement("textarea");
        field.value = text;
        field.style.cssText = "position:fixed;top:0;left:-9999px";
        document.body.append(field);
        field.select();
        let copied = false;
        try { copied = document.execCommand("copy"); } catch { copied = false; }
        field.remove();
        previousFocus?.focus({ preventScroll: true });
        return copied;
    }

    function validate() {
        results.replaceChildren();
        const issues = [];
        const add = (message, kind = "error") => issues.push({ message, kind });
        const text = editor.value.trim();
        if (!text) add("Enter a complete SSML document.");
        else if (/<!DOCTYPE|<!ENTITY/i.test(text)) {
            add("DTD and entity declarations are not allowed. Use plain SSML.");
        } else {
            const xml = new DOMParser().parseFromString(text, "application/xml");
            if (xml.querySelector("parsererror")) {
                add("XML is not well-formed. Check matching tags, quoted attributes, escaped text, and namespace declarations.");
            } else {
                const root = xml.documentElement;
                if (root.localName !== "speak" || root.namespaceURI !== SSML_NS) {
                    add(`Use one <speak> root with xmlns="${SSML_NS}".`);
                }
                if (root.getAttribute("version") !== "1.0") add('Azure examples require version="1.0".');
                if (!root.getAttributeNS(XML_NS, "lang")) add("Set xml:lang on the speak root.");
                const voices = [...root.children].filter(node => node.localName === "voice" && node.namespaceURI === SSML_NS);
                if (!voices.length) add("Add at least one named voice directly inside speak.");
                const unknownRoot = [...root.children].filter(node =>
                    !(node.localName === "voice" && node.namespaceURI === SSML_NS) &&
                    !(node.localName === "backgroundaudio" && [MSTTS_NS, "http://www.w3.org/2001/mstts"].includes(node.namespaceURI)));
                if (unknownRoot.length) add("Check root children: ordinary speech content belongs inside a voice.", "warning");
                for (const voice of voices) {
                    const name = voice.getAttribute("name") || "";
                    if (!name.trim()) add("Every voice needs a nonempty name attribute.");
                    const omni = name.includes(":DragonHDOmni");
                    const flash = name.includes(":DragonHDFlash");
                    const hd = name.includes(":DragonHD") && !omni && !flash;
                    const blocked = new Set(["prosody", "emphasis", "audio", "audioduration", "backgroundaudio", "bookmark", "silence", "viseme", "math", "ttsembedding"]);
                    if (omni) { blocked.add("break"); blocked.add("phoneme"); }
                    if (omni || hd) {
                        const unsupported = [...new Set([...voice.getElementsByTagName("*")]
                            .filter(node => blocked.has(node.localName)).map(node => node.nodeName))];
                        if (unsupported.length) add(`${name}: documented unsupported controls: ${unsupported.join(", ")}.`, "warning");
                        if (hd && !omni && voice.getElementsByTagNameNS(MSTTS_NS, "express-as").length) {
                            add(`${name}: Microsoft documentation conflicts on express-as support. Audition this exact voice/API path.`, "warning");
                        }
                        if (voice.getElementsByTagNameNS(SSML_NS, "lexicon").length) {
                            add(`${name}: HD lexicons support aliases only; this page cannot inspect the remote dictionary.`, "warning");
                        }
                    }
                    if (name.includes(":MAI-")) add(`${name}: preview/model-specific support. Check the current MAI voice documentation.`, "warning");
                    if (flash) add(`${name}: Flash has model-specific controls. Check its own capability list.`, "warning");
                }
                if (/YOUR-HOST|YOUR-RESOURCE|\.example[/"?]/i.test(text)) {
                    add("Replace placeholder asset URLs before synthesis.", "warning");
                }
                const known = new Set(["speak", "voice", "p", "s", "break", "sub", "say-as", "phoneme", "lexicon", "prosody", "emphasis", "lang", "audio", "bookmark", "math", "express-as", "silence", "backgroundaudio", "audioduration", "viseme", "dialog", "turn", "markdown", "prompt", "mathspeechverbosity", "ttsembedding", "voiceconversion"]);
                const unknown = [...new Set([...root.getElementsByTagName("*")]
                    .filter(node => !known.has(node.localName) && node.namespaceURI !== "http://www.w3.org/1998/Math/MathML")
                    .map(node => node.nodeName))];
                if (unknown.length) add(`Elements outside this reference's basic inventory: ${unknown.join(", ")}. Check the service documentation.`, "warning");
                const namespaces = new Set([SSML_NS, MSTTS_NS, "http://www.w3.org/2001/mstts", "http://www.w3.org/1998/Math/MathML"]);
                if ([...root.getElementsByTagName("*")].some(node => !namespaces.has(node.namespaceURI))) {
                    add("One or more elements use an unexpected namespace. A familiar tag name in a different namespace is not the same SSML control.", "warning");
                }
            }
        }
        const errors = issues.filter(issue => issue.kind === "error").length;
        const warnings = issues.length - errors;
        announce(errors
            ? `Check failed: ${errors} XML/document error${errors === 1 ? "" : "s"}.`
            : `XML and basic Azure wrapper checks passed.${warnings ? ` ${warnings} compatibility warning${warnings === 1 ? "" : "s"}.` : ""} Voice/style availability still requires Azure.`);
        if (issues.length) {
            const list = document.createElement("ul");
            for (const issue of issues) {
                const item = document.createElement("li");
                item.className = issue.kind;
                item.textContent = issue.message;
                list.append(item);
            }
            results.append(list);
        }
    }

    function encodeScript(text) {
        const bytes = encoder.encode(text);
        if (bytes.length > 6000) throw new Error("This script exceeds the 6,000-byte share limit. Download the .txt file instead.");
        const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join("");
        return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    function readSharedScript() {
        if (!location.hash.startsWith("#ssml=")) return;
        try {
            const encoded = location.hash.slice(6);
            if (!encoded || encoded.length > 8000 || !/^[A-Za-z0-9_-]+$/.test(encoded)) {
                throw new Error("Invalid or oversized share link.");
            }
            const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
            const binary = atob(base64);
            const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
            const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
            if (bytes.length > 6000) throw new Error("The shared script exceeds this editor's share limit.");
            editor.value = text;
            picker.value = "";
            clearFeedback();
            updateCount();
            announce("Loaded shared script as text. Treat it as untrusted; check XML and model support before using Azure.");
            document.querySelector("#workbench").scrollIntoView();
        } catch {
            announce("Could not load this share link. It is invalid or too large; ask the sender for a .txt file.");
            document.querySelector("#workbench").scrollIntoView();
        }
    }

    for (const example of document.querySelectorAll(".example")) {
        const title = example.querySelector("h3, h4").textContent;
        const ssml = documentFor(example);
        examples.set(example.id, { title, document: ssml });
        const option = document.createElement("option");
        option.value = example.id;
        option.textContent = title;
        picker.append(option);
        const controls = document.createElement("div");
        controls.className = "example-tools";
        const load = document.createElement("button");
        load.type = "button";
        load.textContent = "Load complete SSML";
        load.setAttribute("aria-label", `Load complete SSML: ${title}`);
        load.addEventListener("click", () => loadExample(example.id, true));
        const copy = document.createElement("button");
        copy.type = "button";
        copy.textContent = "Copy complete SSML";
        copy.setAttribute("aria-label", `Copy complete SSML: ${title}`);
        copy.addEventListener("click", async () => {
            if (await copyText(ssml)) {
                copy.textContent = "Copied";
                setTimeout(() => { copy.textContent = "Copy complete SSML"; }, 1800);
            } else {
                loadExample(example.id, true);
                editor.select();
                announce("Clipboard unavailable. The complete document is selected; copy it manually.");
            }
        });
        controls.append(load, copy);
        example.querySelector("pre").after(controls);
    }

    picker.addEventListener("change", () => loadExample(picker.value, false));
    editor.addEventListener("input", () => {
        picker.value = "";
        clearFeedback();
        updateCount();
        announce("Edited locally. Run Check XML again before copying.");
    });
    document.querySelector("#check-xml").addEventListener("click", validate);
    document.querySelector("#copy-ssml").addEventListener("click", async () => {
        if (!editor.value.trim()) { announce("Enter a document before copying."); return; }
        if (await copyText(editor.value)) announce("Copied complete editor contents.");
        else { editor.focus(); editor.select(); announce("Clipboard unavailable. Copy the selected text manually."); }
    });
    document.querySelector("#download-ssml").addEventListener("click", () => {
        if (!editor.value.trim()) { announce("Enter a document before downloading."); return; }
        const blob = new Blob([editor.value], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ssml-example.txt";
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        announce("Downloaded UTF-8 text. Upload it as a text file in Audio Content Creation.");
    });
    document.querySelector("#share-ssml").addEventListener("click", async () => {
        try {
            if (!editor.value.trim()) { announce("Enter a document before sharing."); return; }
            const url = new URL(location.href);
            url.search = "";
            url.hash = `ssml=${encodeScript(editor.value)}`;
            shareUrl.value = url.href;
            sharePanel.hidden = false;
            const copied = await copyText(url.href);
            shareUrl.focus();
            shareUrl.select();
            const local = location.protocol === "file:" || ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
            announce(local
                ? "Created a local-only link. For other readers, use the published site; the script is in the URL fragment."
                : copied ? "Share link copied. It opens this editor, not Foundry. Anyone with the link can read the script."
                    : "Share link created and selected. Copy it manually; anyone with the link can read the script.");
        } catch (error) { announce(error.message); }
    });

    const search = document.querySelector("#reference-search");
    const searchResults = document.querySelector("#search-results");
    const searchStatus = document.querySelector("#search-status");
    const searchEntries = [...document.querySelectorAll("main h2, main h3, .example h4")].map(heading => {
        const section = heading.closest("section");
        const article = heading.closest(".example");
        const id = article?.id || (heading.tagName === "H2" ? section.id : heading.id);
        const text = article?.textContent || [heading.textContent, heading.nextElementSibling?.textContent || ""].join(" ");
        return { id, title: heading.textContent.replace(/^\d+\s*/, "").trim(), text: text.toLowerCase(), section: section.querySelector("h2").textContent.replace(/^\d+\s*/, "").trim() };
    }).filter(entry => entry.id);
    // Table rows need their own targets so tools and controls can be found without filtering the page.
    let rowIndex = 0;
    for (const row of document.querySelectorAll("main tbody tr")) {
        row.id ||= `reference-row-${++rowIndex}`;
        searchEntries.push({ id: row.id, title: row.cells[0].textContent.trim(), text: row.textContent.toLowerCase(), section: row.closest("section").querySelector("h2").textContent.replace(/^\d+\s*/, "").trim() });
    }
    search.addEventListener("input", () => {
        searchResults.replaceChildren();
        const query = search.value.trim().toLowerCase();
        searchResults.hidden = !query;
        if (!query) { searchStatus.textContent = ""; return; }
        const terms = query.split(/\s+/);
        const matches = searchEntries.filter(entry => terms.every(term => entry.text.includes(term)));
        searchStatus.textContent = matches.length ? `${matches.length} match${matches.length === 1 ? "" : "es"}${matches.length > 10 ? "; first 10 shown" : ""}.` : "No matches. Try a tag, tool, or symptom.";
        for (const entry of matches.slice(0, 10)) {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = `#${entry.id}`;
            link.append(document.createTextNode(entry.title));
            const context = document.createElement("small");
            context.textContent = entry.section;
            link.append(context);
            item.append(link);
            searchResults.append(item);
        }
    });

    const sections = [...document.querySelectorAll("main > section")];
    const navLinks = [...document.querySelectorAll('.sidebar nav a')];
    if ("IntersectionObserver" in window) {
        const visible = new Set();
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.isIntersecting) visible.add(entry.target.id);
                else visible.delete(entry.target.id);
            }
            const current = sections.find(section => visible.has(section.id));
            if (!current) return;
            for (const link of navLinks) {
                if (link.hash === `#${current.id}`) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            }
        }, { rootMargin: "-5% 0px -60% 0px" });
        sections.forEach(section => observer.observe(section));
    }

    for (const block of document.querySelectorAll("pre > code")) {
        block.classList.add("reference-code");
    }
    if (window.microlight) window.microlight.reset("reference-code");

    document.querySelector("#print-reference").addEventListener("click", () => window.print());
    document.querySelectorAll("[data-enhance]").forEach(element => { element.hidden = false; });
    loadExample("starter", false);
    readSharedScript();
    window.addEventListener("hashchange", readSharedScript);
})();
