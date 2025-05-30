
/*
* snapdom
* v.1.1.0
* Author Juan Martin Muda
* License MIT
**/
(() => {
  // src/core/cache.js
  var imageCache = /* @__PURE__ */ new Map();
  var bgCache = /* @__PURE__ */ new Map();
  var resourceCache = /* @__PURE__ */ new Map();
  var defaultStylesCache = /* @__PURE__ */ new Map();
  var baseCSSCache = /* @__PURE__ */ new Map();
  var computedStyleCache = /* @__PURE__ */ new WeakMap();

  // src/utils/cssTools.js
  var commonTags = [
    "div",
    "span",
    "p",
    "a",
    "img",
    "ul",
    "li",
    "button",
    "input",
    "select",
    "textarea",
    "label",
    "section",
    "article",
    "header",
    "footer",
    "nav",
    "main",
    "aside",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "svg",
    "path",
    "circle",
    "rect",
    "line",
    "g",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th"
  ];
  function precacheCommonTags() {
    for (let tag of commonTags) {
      getDefaultStyleForTag(tag);
    }
  }
  function getDefaultStyleForTag(tagName) {
    if (defaultStylesCache.has(tagName)) {
      return defaultStylesCache.get(tagName);
    }
    const skipTags = /* @__PURE__ */ new Set(["script", "style", "meta", "link", "noscript", "template"]);
    if (skipTags.has(tagName)) {
      const empty = {};
      defaultStylesCache.set(tagName, empty);
      return empty;
    }
    let sandbox = document.getElementById("snapdom-sandbox");
    if (!sandbox) {
      sandbox = document.createElement("div");
      sandbox.id = "snapdom-sandbox";
      sandbox.style.position = "absolute";
      sandbox.style.left = "-9999px";
      sandbox.style.top = "-9999px";
      sandbox.style.width = "0";
      sandbox.style.height = "0";
      sandbox.style.overflow = "hidden";
      document.body.appendChild(sandbox);
    }
    const el = document.createElement(tagName);
    el.style.all = "initial";
    sandbox.appendChild(el);
    const styles = getComputedStyle(el);
    const defaults = {};
    for (let prop of styles) {
      defaults[prop] = styles.getPropertyValue(prop);
    }
    sandbox.removeChild(el);
    defaultStylesCache.set(tagName, defaults);
    return defaults;
  }
  function getStyleKey(snapshot, tagName, compress = false) {
    const entries = [];
    const defaultStyles = getDefaultStyleForTag(tagName);
    for (let [prop, value] of Object.entries(snapshot)) {
      if (!compress) {
        if (value) {
          entries.push(`${prop}:${value}`);
        }
      } else {
        const defaultValue = defaultStyles[prop];
        if (value && value !== defaultValue) {
          entries.push(`${prop}:${value}`);
        }
      }
    }
    return entries.sort().join(";");
  }
  function collectUsedTagNames(root) {
    const tagSet = /* @__PURE__ */ new Set();
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      return [];
    }
    if (root.tagName) {
      tagSet.add(root.tagName.toLowerCase());
    }
    if (typeof root.querySelectorAll === "function") {
      root.querySelectorAll("*").forEach((el) => tagSet.add(el.tagName.toLowerCase()));
    }
    return Array.from(tagSet);
  }
  function generateDedupedBaseCSS(usedTagNames) {
    const groups = /* @__PURE__ */ new Map();
    for (let tagName of usedTagNames) {
      const styles = defaultStylesCache.get(tagName);
      if (!styles) continue;
      const key = Object.entries(styles).map(([k, v]) => `${k}:${v};`).sort().join("");
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(tagName);
    }
    let css = "";
    for (let [styleBlock, tagList] of groups.entries()) {
      css += `${tagList.join(",")} { ${styleBlock} }
`;
    }
    return css;
  }
  function generateCSSClasses(styleMap) {
    const keySet = new Set(styleMap.values());
    const classMap = /* @__PURE__ */ new Map();
    let counter = 1;
    for (const key of keySet) {
      classMap.set(key, `c${counter++}`);
    }
    return classMap;
  }

  // src/utils/helpers.js
  function idle(fn, { fast = false } = {}) {
    if (fast) return fn();
    if ("requestIdleCallback" in window) {
      requestIdleCallback(fn, { timeout: 50 });
    } else {
      setTimeout(fn, 1);
    }
  }
  function getStyle(el, pseudo = null) {
    if (!(el instanceof Element)) {
      return window.getComputedStyle(el, pseudo);
    }
    let map = computedStyleCache.get(el);
    if (!map) {
      map = /* @__PURE__ */ new Map();
      computedStyleCache.set(el, map);
    }
    if (!map.has(pseudo)) {
      const st = window.getComputedStyle(el, pseudo);
      map.set(pseudo, st);
    }
    return map.get(pseudo);
  }
  function parseContent(content) {
    let clean = content.replace(/^['"]|['"]$/g, "");
    if (clean.startsWith("\\")) {
      try {
        return String.fromCharCode(parseInt(clean.replace("\\", ""), 16));
      } catch {
        return clean;
      }
    }
    return clean;
  }
  function extractUrl(cssValue) {
    const m = cssValue.match(/url\(["']?([^"')]+)["']?\)/);
    return m ? m[1] : null;
  }
  function isIconFont(familyOrUrl) {
    const iconFontPatterns = [
      /font\s*awesome/i,
      /material\s*icons/i,
      /ionicons/i,
      /glyphicons/i,
      /feather/i,
      /bootstrap\s*icons/i,
      /remix\s*icons/i,
      /heroicons/i
    ];
    return iconFontPatterns.some((rx) => rx.test(familyOrUrl));
  }
  function fetchImage(src, timeout = 3e3) {
    if (imageCache.has(src)) {
      return Promise.resolve(imageCache.get(src));
    }
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Image load timed out"));
      }, timeout);
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = async () => {
        clearTimeout(timeoutId);
        try {
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0);
          try {
            const dataURL = canvas.toDataURL("image/png");
            imageCache.set(src, dataURL);
            resolve(dataURL);
          } catch (e) {
            reject(new Error("CORS restrictions prevented image capture"));
          }
        } catch (e) {
          reject(e);
        }
      };
      image.onerror = (e) => {
        clearTimeout(timeoutId);
        reject(new Error("Failed to load image: " + (e.message || "Unknown error")));
      };
      image.src = src;
    });
  }
  function snapshotComputedStyle(style) {
    const snap = {};
    for (let prop of style) {
      snap[prop] = style.getPropertyValue(prop);
    }
    return snap;
  }
  function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  // src/modules/styles.js
  function inlineAllStyles(source, clone, styleMap, cache, compress) {
    if (source.tagName === "STYLE") return;
    if (!cache.has(source)) {
      cache.set(source, getStyle(source));
    }
    const style = cache.get(source);
    const snapshot = snapshotComputedStyle(style);
    const tagName = source.tagName?.toLowerCase() || "div";
    const key = getStyleKey(snapshot, tagName, compress);
    styleMap.set(clone, key);
  }

  // src/core/clone.js
  function deepClone(node, styleMap, styleCache, nodeMap, compress) {
    if (node.nodeType === Node.ELEMENT_NODE && node.getAttribute("data-capture") === "exclude") {
      const spacer = document.createElement("div");
      const rect = node.getBoundingClientRect();
      spacer.style.cssText = `display: inline-block; width: ${rect.width}px; height: ${rect.height}px; visibility: hidden;`;
      return spacer;
    }
    if (node.tagName === "IFRAME") {
      const fallback = document.createElement("div");
      fallback.textContent = "";
      fallback.style.cssText = `width: ${node.offsetWidth}px; height: ${node.offsetHeight}px; background: repeating-linear-gradient(45deg, #ddd, #ddd 5px, #f9f9f9 5px, #f9f9f9 10px);display: flex;align-items: center;justify-content: center;font-size: 12px;color: #555; border: 1px solid #aaa;`;
      return fallback;
    }
    if (node.nodeType === Node.ELEMENT_NODE && node.getAttribute("data-capture") === "placeholder") {
      const clone2 = node.cloneNode(false);
      nodeMap.set(clone2, node);
      inlineAllStyles(node, clone2, styleMap, styleCache, compress);
      const placeholder = document.createElement("div");
      placeholder.textContent = node.getAttribute("data-placeholder-text") || "";
      placeholder.style.cssText = `color: #666;font-size: 12px;text-align: center;line-height: 1.4;padding: 0.5em;box-sizing: border-box;`;
      clone2.appendChild(placeholder);
      return clone2;
    }
    if (node.tagName === "CANVAS") {
      const dataURL = node.toDataURL();
      const img = document.createElement("img");
      img.src = dataURL;
      img.width = node.width;
      img.height = node.height;
      img.style.display = "inline-block";
      img.style.width = `${node.width}px`;
      img.style.height = `${node.height}px`;
      return img;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.parentElement?.shadowRoot) {
        const tag = node.parentElement.tagName.toLowerCase();
        if (customElements.get(tag)) return null;
      }
      return node.cloneNode(true);
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return node.cloneNode(true);
    const clone = node.cloneNode(false);
    nodeMap.set(clone, node);
    inlineAllStyles(node, clone, styleMap, styleCache, compress);
    const frag = document.createDocumentFragment();
    node.childNodes.forEach((child) => {
      const clonedChild = deepClone(child, styleMap, styleCache, nodeMap, compress);
      if (clonedChild) frag.appendChild(clonedChild);
    });
    clone.appendChild(frag);
    if (node.shadowRoot) {
      const shadowContent = Array.from(node.shadowRoot.children).filter((el) => el.tagName !== "STYLE").map((el) => deepClone(el, styleMap, styleCache, nodeMap)).filter(Boolean);
      const shadowFrag = document.createDocumentFragment();
      shadowContent.forEach((child) => shadowFrag.appendChild(child));
      clone.appendChild(shadowFrag);
    }
    return clone;
  }

  // src/modules/fonts.js
  async function iconToImage(unicodeChar, fontFamily, fontWeight, fontSize = 32, color = "#000") {
    fontFamily = fontFamily.replace(/^['"]+|['"]+$/g, "");
    await document.fonts.ready;
    await document.fonts.load(`${fontSize}px "${fontFamily}"`);
    const canvas = document.createElement("canvas");
    canvas.width = fontSize;
    canvas.height = fontSize;
    const ctx = canvas.getContext("2d");
    ctx.font = fontWeight ? `${fontWeight} ${fontSize}px "${fontFamily}"` : ` ${fontSize}px "${fontFamily}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(unicodeChar, canvas.width / 2, canvas.height / 2);
    return canvas.toDataURL();
  }
  async function embedCustomFonts({ ignoreIconFonts = true, preCached = false }) {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter((link) => link.href);
    let finalCSS = "";
    for (const link of links) {
      try {
        const res = await fetch(link.href);
        const cssText = await res.text();
        if (ignoreIconFonts && (isIconFont(link.href) || isIconFont(cssText))) {
          console.log("\u23ED\uFE0F Ignorando icon font CSS:", link.href);
          continue;
        }
        const urlRegex = /url\(([^)]+)\)/g;
        const inlinedCSS = await Promise.all(
          Array.from(cssText.matchAll(urlRegex)).map(async (match) => {
            let url = match[1].replace(/["']/g, "");
            if (!url.startsWith("http")) {
              url = new URL(url, link.href).href;
            }
            if (ignoreIconFonts && isIconFont(url)) {
              console.log("\u23ED\uFE0F Ignorando icon font URL:", url);
              return null;
            }
            if (resourceCache.has(url)) {
              return { original: match[0], inlined: `url(${resourceCache.get(url)})` };
            }
            try {
              const fontRes = await fetch(url);
              const blob = await fontRes.blob();
              const b64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
              resourceCache.set(url, b64);
              return { original: match[0], inlined: `url(${b64})` };
            } catch (err) {
              console.warn("\u274C No pude fetch font", url);
              return null;
            }
          })
        );
        let cssFinal = cssText;
        for (const r of inlinedCSS) {
          if (r) {
            cssFinal = cssFinal.replace(r.original, r.inlined);
          }
        }
        finalCSS += cssFinal + "\n";
      } catch (e) {
        console.warn("\u274C No pude fetch CSS", link.href);
      }
    }
    if (finalCSS && preCached) {
      const style = document.createElement("style");
      style.setAttribute("data-snapdom", "embedFonts");
      style.textContent = finalCSS;
      document.head.appendChild(style);
    }
    return finalCSS;
  }

  // src/modules/pseudo.js
  async function inlinePseudoElements(source, clone, styleMap, styleCache, compress) {
    if (!(source instanceof Element) || !(clone instanceof Element)) return;
    for (const pseudo of ["::before", "::after"]) {
      try {
        const style = getStyle(source, pseudo);
        if (!style) continue;
        const content = style.getPropertyValue("content");
        const bg = style.getPropertyValue("background-image");
        const hasContent = content && content !== "none" && content !== '""' && content !== "''";
        const hasBg = bg && bg.startsWith("url(");
        if (hasContent || hasBg) {
          const fontFamily = style.getPropertyValue("font-family");
          const fontSize = parseInt(style.getPropertyValue("font-size")) || 32;
          const fontWeight = parseInt(style.getPropertyValue("font-weight")) || false;
          const color = style.getPropertyValue("color") || "#000";
          const pseudoEl = document.createElement("span");
          pseudoEl.dataset.snapdomPseudo = pseudo;
          const snapshot = snapshotComputedStyle(style);
          const key = getStyleKey(snapshot, "span", compress);
          styleMap.set(pseudoEl, key);
          const isIconFont2 = fontFamily && /font.*awesome|material|bootstrap|glyphicons|ionicons|remixicon|simple-line-icons|octicons|feather|typicons|weathericons/i.test(fontFamily);
          let cleanContent = parseContent(content);
          if (isIconFont2 && cleanContent.length === 1) {
            const imgEl = document.createElement("img");
            imgEl.src = await iconToImage(cleanContent, fontFamily, fontWeight, fontSize, color);
            imgEl.style = "display:block;width:100%;height:100%;object-fit:contain;";
            pseudoEl.appendChild(imgEl);
          } else if (cleanContent.startsWith("url(")) {
            const match = cleanContent.match(/url\(["']?([^"')]+)["']?\)/);
            if (match?.[1]) {
              try {
                const imgEl = document.createElement("img");
                const dataUrl = await fetchImage(match[1]);
                imgEl.src = dataUrl;
                imgEl.style = "display:block;width:100%;height:100%;object-fit:contain;";
                pseudoEl.appendChild(imgEl);
              } catch (e) {
                console.error(`[snapdom] Error in pseudo ${pseudo} for`, source, e);
              }
            }
          } else if (cleanContent && cleanContent !== "none") {
            pseudoEl.textContent = cleanContent;
          }
          if (pseudo === "::before") {
            clone.insertBefore(pseudoEl, clone.firstChild);
          } else {
            clone.appendChild(pseudoEl);
          }
        }
      } catch (e) {
        console.warn(`[snapdom] Failed to capture ${pseudo} for`, source, e);
      }
    }
    const sChildren = Array.from(source.children);
    const cChildren = Array.from(clone.children).filter(
      (child) => !child.dataset.snapdomPseudo
    );
    for (let i = 0; i < Math.min(sChildren.length, cChildren.length); i++) {
      await inlinePseudoElements(sChildren[i], cChildren[i], styleMap, styleCache, compress);
    }
  }

  // src/core/prepare.js
  async function prepareClone(element, compress = false) {
    const styleMap = /* @__PURE__ */ new Map();
    const styleCache = /* @__PURE__ */ new WeakMap();
    const nodeMap = /* @__PURE__ */ new Map();
    let clone;
    try {
      clone = deepClone(element, styleMap, styleCache, nodeMap, compress);
    } catch (e) {
      console.warn("deepClone failed:", e);
      throw e;
    }
    try {
      await inlinePseudoElements(element, clone, styleMap, styleCache, compress);
    } catch (e) {
      console.warn("inlinePseudoElements failed:", e);
    }
    const keyToClass = generateCSSClasses(styleMap);
    const classCSS = Array.from(keyToClass.entries()).map(([key, className]) => `.${className}{${key}}`).join("");
    for (const [node, key] of styleMap.entries()) {
      if (node.tagName === "STYLE") continue;
      const className = keyToClass.get(key);
      if (className) node.classList.add(className);
      const bgImage = node.style?.backgroundImage;
      node.removeAttribute("style");
      if (bgImage && bgImage !== "none") node.style.backgroundImage = bgImage;
    }
    for (const [cloneNode, originalNode] of nodeMap.entries()) {
      const scrollX = originalNode.scrollLeft;
      const scrollY = originalNode.scrollTop;
      const hasScroll = scrollX || scrollY;
      if (hasScroll && cloneNode instanceof HTMLElement) {
        cloneNode.style.overflow = "hidden";
        cloneNode.style.scrollbarWidth = "none";
        cloneNode.style.msOverflowStyle = "none";
        const inner = document.createElement("div");
        inner.style.transform = `translate(${-scrollX}px, ${-scrollY}px)`;
        inner.style.willChange = "transform";
        inner.style.display = "inline-block";
        inner.style.width = "100%";
        while (cloneNode.firstChild) {
          inner.appendChild(cloneNode.firstChild);
        }
        cloneNode.appendChild(inner);
      }
    }
    return { clone, classCSS, styleCache };
  }

  // src/modules/images.js
  async function inlineImages(clone) {
    const imgs = Array.from(clone.querySelectorAll("img"));
    const processImg = async (img) => {
      const src = img.src;
      try {
        const dataUrl = await fetchImage(src);
        img.src = dataUrl;
        if (!img.width) img.width = img.naturalWidth || 100;
        if (!img.height) img.height = img.naturalHeight || 100;
      } catch {
        const fallback = document.createElement("div");
        fallback.style = `width: ${img.width || 100}px; height: ${img.height || 100}px; background: #ccc; display: inline-block; text-align: center; line-height: ${img.height || 100}px; color: #666; font-size: 12px;`;
        fallback.innerText = "img";
        img.replaceWith(fallback);
      }
    };
    for (let i = 0; i < imgs.length; i += 4) {
      const group = imgs.slice(i, i + 4).map(processImg);
      await Promise.allSettled(group);
    }
  }

  // src/modules/background.js
  async function inlineBackgroundImages(source, clone, styleCache) {
    const queue = [[source, clone]];
    while (queue.length) {
      const [srcNode, cloneNode] = queue.shift();
      const style = styleCache.get(srcNode) || getStyle(srcNode);
      if (!styleCache.has(srcNode)) styleCache.set(srcNode, style);
      const bg = style.getPropertyValue("background-image");
      if (bg && bg.includes("url(")) {
        const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
        if (match?.[1]) {
          try {
            const bgUrl = match[1];
            let dataUrl;
            if (bgCache.has(bgUrl)) {
              dataUrl = bgCache.get(bgUrl);
            } else {
              dataUrl = await fetchImage(bgUrl);
              bgCache.set(bgUrl, dataUrl);
            }
            cloneNode.style.backgroundImage = `url(${dataUrl})`;
          } catch {
            cloneNode.style.backgroundImage = "none";
          }
        }
      }
      const sChildren = Array.from(srcNode.children);
      const cChildren = Array.from(cloneNode.children);
      for (let i = 0; i < Math.min(sChildren.length, cChildren.length); i++) {
        queue.push([sChildren[i], cChildren[i]]);
      }
    }
  }

  // src/core/capture.js
  async function captureDOM(element, options = {}) {
    if (!element) throw new Error("Element cannot be null or undefined");
    const { compress = true, embedFonts = false, fast = true, scale = 1 } = options;
    let clone, classCSS, styleCache;
    let fontsCSS = "";
    let baseCSS = "";
    let dataURL;
    let svgString;
    ({ clone, classCSS, styleCache } = await prepareClone(element, compress));
    await new Promise((resolve) => {
      idle(async () => {
        await inlineImages(clone);
        resolve();
      }, { fast });
    });
    await new Promise((resolve) => {
      idle(async () => {
        await inlineBackgroundImages(element, clone, styleCache);
        resolve();
      }, { fast });
    });
    if (embedFonts) {
      await new Promise((resolve) => {
        idle(async () => {
          fontsCSS = await embedCustomFonts({ ignoreIconFonts: true });
          resolve();
        }, { fast });
      });
    }
    if (compress) {
      const usedTags = collectUsedTagNames(clone).sort();
      const tagKey = usedTags.join(",");
      if (baseCSSCache.has(tagKey)) {
        baseCSS = baseCSSCache.get(tagKey);
      } else {
        await new Promise((resolve) => {
          idle(() => {
            baseCSS = generateDedupedBaseCSS(usedTags);
            baseCSSCache.set(tagKey, baseCSS);
            resolve();
          }, { fast });
        });
      }
    }
    await new Promise((resolve) => {
      idle(() => {
        const rect = element.getBoundingClientRect();
        const w = Math.ceil(rect.width);
        const h = Math.ceil(rect.height);
        clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
        clone.style.transformOrigin = "top left";
        if (scale !== 1 && isSafari()) {
          clone.style.scale = `${scale}`;
        }
        const svgNS = "http://www.w3.org/2000/svg";
        const fo = document.createElementNS(svgNS, "foreignObject");
        fo.setAttribute("width", "100%");
        fo.setAttribute("height", "100%");
        const styleTag = document.createElement("style");
        styleTag.textContent = baseCSS + fontsCSS + "svg{overflow:visible;}" + classCSS;
        fo.appendChild(styleTag);
        fo.appendChild(clone);
        const serializer = new XMLSerializer();
        const foString = serializer.serializeToString(fo);
        const svgHeader = `<svg xmlns="${svgNS}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
        const svgFooter = "</svg>";
        svgString = svgHeader + foString + svgFooter;
        dataURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
        resolve();
      }, { fast });
    });
    const sandbox = document.getElementById("snapdom-sandbox");
    if (sandbox && sandbox.style.position === "absolute") sandbox.remove();
    return dataURL;
  }

  // src/api/snapdom.js
  async function toImg(url, { dpr = 1, scale = 1 }) {
    const img = new Image();
    img.src = url;
    await img.decode();
    if (isSafari) {
      img.width = img.width * scale;
      img.height = img.height * scale;
    } else {
      img.width = img.width / scale;
      img.height = img.height / scale;
    }
    return img;
  }
  async function toCanvas(url, { dpr = 1, scale = 1 }) {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    const width = img.width * scale * dpr;
    const height = img.height * scale * dpr;
    canvas.width = Math.ceil(width);
    canvas.height = Math.ceil(height);
    const ctx = canvas.getContext("2d");
    ctx.scale(scale * dpr, scale * dpr);
    ctx.drawImage(img, 0, 0);
    return canvas;
  }
  async function toBlob(url) {
    const svgText = decodeURIComponent(url.split(",")[1]);
    return new Blob([svgText], { type: "image/svg+xml" });
  }
  async function createBackground(url, { dpr = 1, scale = 1 }, backgroundColor) {
    const baseCanvas = await toCanvas(url, { dpr, scale });
    if (!backgroundColor) return baseCanvas;
    const temp = document.createElement("canvas");
    temp.width = baseCanvas.width;
    temp.height = baseCanvas.height;
    const ctx = temp.getContext("2d");
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, temp.width, temp.height);
    ctx.drawImage(baseCanvas, 0, 0);
    return temp;
  }
  async function toRasterImg(url, { dpr = 1, scale = 1, backgroundColor = "#fff", quality }, format = "png") {
    const canvas = await createBackground(url, { dpr, scale }, backgroundColor);
    const img = new Image();
    img.src = canvas.toDataURL(`image/${format}`, quality);
    await img.decode();
    img.style.width = `${canvas.width / dpr}px`;
    img.style.height = `${canvas.height / dpr}px`;
    return img;
  }
  async function download(url, { dpr = 1, scale = 1, backgroundColor = "#fff", format = "png", filename = "capture" } = {}) {
    if (format === "svg") {
      const blob = await toBlob(url);
      const objectURL = URL.createObjectURL(blob);
      const a2 = document.createElement("a");
      a2.href = objectURL;
      a2.download = `${filename}.svg`;
      a2.click();
      URL.revokeObjectURL(objectURL);
      return;
    }
    const defaultBg = ["jpg", "jpeg", "webp"].includes(format) ? "#fff" : void 0;
    const finalBg = backgroundColor ?? defaultBg;
    const canvas = await createBackground(url, { dpr, scale }, finalBg);
    const mime = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp"
    }[format] || "image/png";
    const dataURL = canvas.toDataURL(mime);
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = `${filename}.${format}`;
    a.click();
  }
  async function snapdom(element, options = {}) {
    options = { scale: 1, ...options };
    if (!element) throw new Error("Element cannot be null or undefined");
    return await snapdom.capture(element, options);
  }
  snapdom.capture = async (el, options = {}) => {
    const url = await captureDOM(el, options);
    const dpr = window.devicePixelRatio || 1;
    const scale = options.scale || 1;
    return {
      url,
      options,
      toRaw: () => url,
      toImg: () => toImg(url, { dpr, scale }),
      toCanvas: () => toCanvas(url, { dpr, scale }),
      toBlob: () => toBlob(url),
      toPng: (options2) => toRasterImg(url, { dpr, scale, ...options2 }, "png"),
      toJpg: (options2) => toRasterImg(url, { dpr, scale, ...options2 }, "jpeg"),
      toWebp: (options2) => toRasterImg(url, { dpr, scale, ...options2 }, "webp"),
      download: ({ format = "png", filename = "capture", backgroundColor } = {}) => download(url, { dpr, scale, backgroundColor, format, filename })
    };
  };
  snapdom.toRaw = async (el, options) => (await snapdom.capture(el, options)).toRaw();
  snapdom.toImg = async (el, options) => (await snapdom.capture(el, options)).toImg();
  snapdom.toCanvas = async (el, options) => (await snapdom.capture(el, options)).toCanvas();
  snapdom.toBlob = async (el, options) => (await snapdom.capture(el, options)).toBlob();
  snapdom.toPng = async (el, options) => (await snapdom.capture(el, options)).toPng(options);
  snapdom.toJpg = async (el, options) => (await snapdom.capture(el, options)).toJpg(options);
  snapdom.toWebp = async (el, options) => (await snapdom.capture(el, options)).toWebp(options);
  snapdom.download = async (el, options = {}) => {
    const {
      format = "png",
      filename = "capture",
      backgroundColor,
      ...rest
    } = options;
    const capture = await snapdom.capture(el, rest);
    return await capture.download({ format, filename, backgroundColor });
  };

  // src/api/preCache.js
  async function preCache(root = document, options = {}) {
    const { embedFonts = true, reset = false, preWarm = true } = options;
    if (reset) {
      imageCache.clear();
      bgCache.clear();
      resourceCache.clear();
      baseCSSCache.clear();
      computedStyleCache.clear();
      return;
    }
    await document.fonts.ready;
    precacheCommonTags();
    let imgEls = [], allEls = [];
    if (root?.querySelectorAll) {
      imgEls = Array.from(root.querySelectorAll("img[src]"));
      allEls = Array.from(root.querySelectorAll("*"));
    }
    const promises = [];
    for (const img of imgEls) {
      const src = img.src;
      if (!imageCache.has(src)) {
        promises.push(
          fetchImage(src).then((dataURL) => imageCache.set(src, dataURL)).catch(() => {
          })
        );
      }
    }
    for (const el of allEls) {
      const bg = getComputedStyle(el).backgroundImage;
      const url = extractUrl(bg);
      if (url && !bgCache.has(url)) {
        promises.push(
          fetchImage(url).then((dataURL) => bgCache.set(url, dataURL)).catch(() => {
          })
        );
      }
    }
    if (embedFonts) {
      await embedCustomFonts({ ignoreIconFonts: true, preCached: true });
    }
    await Promise.all(promises);
  }
})();
