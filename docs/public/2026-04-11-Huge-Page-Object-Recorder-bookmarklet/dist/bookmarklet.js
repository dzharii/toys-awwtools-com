(() => {
  // src/utils.js
  var TOOL_NAMESPACE = "huge-page-object-recorder";
  var TOOL_GLOBAL_KEY = "__hugePageObjectRecorder";
  var TOOL_IGNORE_ATTRIBUTE = `data-${TOOL_NAMESPACE}-ignore`;
  var UTILITY_CLASS_RE = /^(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|grid|flex|justify|items|text|bg|border|rounded|shadow|w|h|min|max|top|left|right|bottom|z|col|row|translate|scale|rotate|opacity|font|leading|tracking)-/i;
  var HASHISH_RE = /^(?:[a-f0-9]{6,}|[a-z0-9_-]{12,})$/i;
  function normalizeWhitespace(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }
  function wordsFromValue(value) {
    return normalizeWhitespace(String(value ?? "")).replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[^a-zA-Z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
  }
  function toCamelCase(value) {
    const words = wordsFromValue(value);
    if (!words.length) {
      return "pageObject";
    }
    return words.map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join("");
  }
  function uniqueName(baseName, existingNames = []) {
    const base = toCamelCase(baseName);
    const taken = new Set(existingNames);
    if (!taken.has(base)) {
      return base;
    }
    let counter = 2;
    while (taken.has(`${base}${counter}`)) {
      counter += 1;
    }
    return `${base}${counter}`;
  }
  function looksGeneratedToken(token) {
    const value = String(token ?? "").trim();
    if (!value) {
      return false;
    }
    if (UTILITY_CLASS_RE.test(value)) {
      return true;
    }
    if (HASHISH_RE.test(value) && /\d/.test(value)) {
      return true;
    }
    if (/^(?:css|jsx|sc|ember|react)-[a-z0-9]{5,}$/i.test(value)) {
      return true;
    }
    if (/[a-z]{2,}-[a-z0-9]{6,}$/i.test(value) && /\d/.test(value)) {
      return true;
    }
    return /(?:^|[-_])[a-z0-9]{1,3}(?:[-_][a-z0-9]{1,3}){3,}$/i.test(value);
  }
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function rectFrom(input = {}) {
    const left = Number(input.left ?? input.x ?? 0);
    const top = Number(input.top ?? input.y ?? 0);
    const width = Math.max(0, Number(input.width ?? 0));
    const height = Math.max(0, Number(input.height ?? 0));
    return {
      left,
      top,
      width,
      height,
      right: Number(input.right ?? left + width),
      bottom: Number(input.bottom ?? top + height)
    };
  }
  function rectArea(rect) {
    const safeRect = rectFrom(rect);
    return safeRect.width * safeRect.height;
  }
  function rectIntersects(a, b) {
    const rectA = rectFrom(a);
    const rectB = rectFrom(b);
    return !(rectA.right <= rectB.left || rectA.left >= rectB.right || rectA.bottom <= rectB.top || rectA.top >= rectB.bottom);
  }
  function rectContains(container, child) {
    const outer = rectFrom(container);
    const inner = rectFrom(child);
    return inner.left >= outer.left && inner.right <= outer.right && inner.top >= outer.top && inner.bottom <= outer.bottom;
  }
  function rectIntersectionArea(a, b) {
    const rectA = rectFrom(a);
    const rectB = rectFrom(b);
    const width = Math.max(0, Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left));
    const height = Math.max(0, Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top));
    return width * height;
  }
  function rectOverlapRatio(a, b) {
    const intersection = rectIntersectionArea(a, b);
    const baseArea = Math.max(1, Math.min(rectArea(a), rectArea(b)));
    return intersection / baseArea;
  }
  function sortByScoreDesc(items, scoreKey = "score") {
    return [...items].sort((left, right) => {
      const scoreDelta = Number(right?.[scoreKey] ?? 0) - Number(left?.[scoreKey] ?? 0);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      return String(left?.label ?? left?.selector ?? "").localeCompare(String(right?.label ?? right?.selector ?? ""));
    });
  }
  function stableJson(value) {
    if (Array.isArray(value)) {
      return value.map(stableJson);
    }
    if (value && typeof value === "object") {
      return Object.keys(value).sort().reduce((result, key) => {
        result[key] = stableJson(value[key]);
        return result;
      }, {});
    }
    return value;
  }
  function safeLower(value) {
    return normalizeWhitespace(value).toLowerCase();
  }
  function excerpt(value, maxLength = 80) {
    const text = normalizeWhitespace(value);
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 1).trim()}…`;
  }
  function escapeCssString(value) {
    return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  }
  function serializeError(error) {
    if (!error) {
      return "Unknown error";
    }
    return error instanceof Error ? error.message : String(error);
  }

  // src/export.js
  function serializeSelectedObjects(selectedObjects, pageContext = {}) {
    const payload = {
      toolVersion: pageContext.toolVersion ?? "0.1.0",
      pageUrl: pageContext.url ?? "",
      title: pageContext.title ?? "",
      timestamp: pageContext.timestamp ?? new Date().toISOString(),
      viewport: pageContext.viewport ?? { width: 0, height: 0 },
      objects: selectedObjects.map((object) => ({
        id: object.id,
        name: object.name,
        kind: object.kind,
        inferredType: object.inferredType,
        confidence: object.confidence,
        selector: object.selector,
        selectorType: object.selectorType,
        selectorScore: object.selectorScore,
        heuristicId: object.heuristicId,
        alternativeSelectors: object.alternativeSelectors.map((candidate) => ({
          selector: candidate.selector,
          selectorType: candidate.selectorType,
          score: candidate.score,
          heuristicId: candidate.heuristicId,
          explanation: candidate.explanation,
          matchCount: candidate.matchCount
        })),
        boundingRect: object.features.boundingRect,
        features: {
          tagName: object.features.tagName,
          role: object.features.role,
          accessibleName: object.features.accessibleName,
          textSnippet: object.features.textSnippet,
          dataAttributes: object.features.dataAttributes,
          ariaAttributes: object.features.ariaAttributes
        },
        explanation: object.explanation,
        parentId: object.parentId,
        children: object.children,
        collection: object.collection ? {
          itemSelector: object.collection.itemSelector ?? "",
          itemSelectorScore: object.collection.itemSelectorScore ?? 0,
          itemChildren: object.collection.itemChildren ?? [],
          sampleCount: object.collection.sampleCount ?? 0,
          virtualizationSuspected: Boolean(object.collection.virtualizationSuspected)
        } : null
      }))
    };
    return stableJson(payload);
  }
  function exportJsonText(selectedObjects, pageContext = {}) {
    return JSON.stringify(serializeSelectedObjects(selectedObjects, pageContext), null, 2);
  }

  // src/features.js
  var INTERACTIVE_ROLES = new Set([
    "button",
    "link",
    "textbox",
    "searchbox",
    "combobox",
    "checkbox",
    "radio",
    "tab",
    "menuitem",
    "option",
    "switch",
    "slider",
    "spinbutton",
    "listbox"
  ]);
  var LANDMARK_ROLES = new Set([
    "navigation",
    "dialog",
    "toolbar",
    "main",
    "feed",
    "log",
    "banner",
    "contentinfo",
    "complementary",
    "form"
  ]);
  var ACTION_WORD_RE = /\b(send|submit|save|attach|upload|new|add|create|reply|search|open|close|edit|delete|menu|more)\b/i;
  var TIMESTAMP_RE = /\b(?:\d{1,2}:\d{2}(?:\s?[ap]m)?|yesterday|today|just now|\d+\s?(?:m|h|d)\s+ago)\b/i;
  function isNativeInteractableTag(tagName) {
    return new Set([
      "button",
      "input",
      "textarea",
      "select",
      "option",
      "a",
      "summary",
      "label"
    ]).has(String(tagName ?? "").toLowerCase());
  }
  function isInteractiveRole(role) {
    return INTERACTIVE_ROLES.has(String(role ?? "").toLowerCase());
  }
  function isLandmarkRole(role) {
    return LANDMARK_ROLES.has(String(role ?? "").toLowerCase());
  }
  function readRect(element) {
    if (typeof element?.getBoundingClientRect === "function") {
      return rectFrom(element.getBoundingClientRect());
    }
    return rectFrom(element?.rect ?? element?.boundingRect ?? {});
  }
  function readAttribute(element, name) {
    if (!element) {
      return null;
    }
    if (typeof element.getAttribute === "function") {
      return element.getAttribute(name);
    }
    if (element.attributes && name in element.attributes) {
      return element.attributes[name];
    }
    return element[name] ?? null;
  }
  function readLabelledByText(element, ownerDocument) {
    const labelledBy = normalizeWhitespace(readAttribute(element, "aria-labelledby"));
    if (!labelledBy || !ownerDocument || typeof ownerDocument.getElementById !== "function") {
      return "";
    }
    return normalizeWhitespace(labelledBy.split(/\s+/).map((id) => ownerDocument.getElementById(id)).filter(Boolean).map((node) => node.textContent ?? node.innerText ?? "").join(" "));
  }
  function readAssociatedLabelText(element, ownerDocument) {
    if (Array.isArray(element?.labels) && element.labels.length) {
      return normalizeWhitespace(element.labels.map((label) => label.textContent ?? label.innerText ?? "").join(" "));
    }
    const id = normalizeWhitespace(readAttribute(element, "id"));
    if (!id || !ownerDocument || typeof ownerDocument.querySelectorAll !== "function") {
      return "";
    }
    const labels = Array.from(ownerDocument.querySelectorAll(`label[for="${id}"]`) ?? []);
    return normalizeWhitespace(labels.map((label) => label.textContent ?? "").join(" "));
  }
  function computeAccessibleName(element, ownerDocument = element?.ownerDocument) {
    const candidates = [
      readAttribute(element, "aria-label"),
      readLabelledByText(element, ownerDocument),
      readAssociatedLabelText(element, ownerDocument),
      readAttribute(element, "placeholder"),
      readAttribute(element, "title"),
      readAttribute(element, "alt"),
      element?.innerText,
      element?.textContent
    ];
    return candidates.map(normalizeWhitespace).find(Boolean) ?? "";
  }
  function getElementTextSnippet(element, maxLength = 120) {
    return excerpt(element?.innerText ?? element?.textContent ?? "", maxLength);
  }
  function isElementDisabled(element) {
    const hasDisabledAttribute = typeof element?.hasAttribute === "function" && element.hasAttribute("disabled");
    const disabled = readAttribute(element, "disabled");
    const ariaDisabled = safeLower(readAttribute(element, "aria-disabled"));
    return hasDisabledAttribute || Boolean(disabled) || ariaDisabled === "true" || Boolean(element?.inert);
  }
  function isElementVisible(element) {
    if (element?.visible === false || element?.hidden === true) {
      return false;
    }
    const rect = readRect(element);
    if (!rectArea(rect)) {
      return false;
    }
    const style = element?.computedStyle ?? element?.ownerDocument?.defaultView?.getComputedStyle?.(element) ?? null;
    if (style) {
      const opacity = typeof style.opacity === "string" ? style.opacity.trim() : style.opacity;
      const isTransparent = opacity !== "" && opacity !== null && typeof opacity !== "undefined" && Number(opacity) === 0;
      if (style.display === "none" || style.visibility === "hidden" || isTransparent) {
        return false;
      }
    }
    return true;
  }
  function isScrollableElement(element, rect = readRect(element)) {
    if (element?.scrollable === true) {
      return true;
    }
    return Number(element?.scrollHeight ?? 0) > Number(element?.clientHeight ?? rect.height) + 12 || Number(element?.scrollWidth ?? 0) > Number(element?.clientWidth ?? rect.width) + 12;
  }
  function collectNamedAttributes(element, prefix) {
    const result = {};
    const entries = collectAttributeEntries(element);
    for (const [name, rawValue] of entries) {
      if (!name.startsWith(prefix)) {
        continue;
      }
      const value = normalizeWhitespace(rawValue);
      if (value) {
        result[name] = value;
      }
    }
    return result;
  }
  function collectAttributeEntries(element) {
    const attributes = element?.attributes;
    if (!attributes) {
      return [];
    }
    if (typeof attributes[Symbol.iterator] === "function") {
      return Array.from(attributes).map((attribute) => [attribute?.name, attribute?.value]).filter(([name]) => typeof name === "string");
    }
    return Object.entries(attributes).map(([name, rawValue]) => {
      if (rawValue && typeof rawValue === "object" && "name" in rawValue && "value" in rawValue) {
        return [rawValue.name, rawValue.value];
      }
      return [name, rawValue];
    });
  }
  function collectDescendantSummaries(element) {
    const descendants = getDescendants(element);
    if (!descendants.length) {
      return {
        descendantTagNames: [],
        descendantRoles: [],
        containsEditable: false,
        containsButtons: false,
        containsLinks: false,
        containsInputs: false,
        repeatedChildTagNames: []
      };
    }
    const tagCounts = new Map;
    const descendantTagNames = [];
    const descendantRoles = [];
    let containsEditable = false;
    let containsButtons = false;
    let containsLinks = false;
    let containsInputs = false;
    for (const descendant of descendants) {
      const tagName = String(descendant.tagName ?? "").toLowerCase();
      const role = String(readAttribute(descendant, "role") ?? descendant.role ?? "").toLowerCase();
      if (tagName) {
        descendantTagNames.push(tagName);
        tagCounts.set(tagName, (tagCounts.get(tagName) ?? 0) + 1);
      }
      if (role) {
        descendantRoles.push(role);
      }
      if (tagName === "textarea" || tagName === "input" || safeLower(readAttribute(descendant, "contenteditable")) === "true" || descendant?.isContentEditable === true || role === "textbox") {
        containsEditable = true;
        containsInputs = true;
      }
      if (tagName === "button" || role === "button") {
        containsButtons = true;
      }
      if (tagName === "a" || role === "link") {
        containsLinks = true;
      }
    }
    return {
      descendantTagNames,
      descendantRoles,
      containsEditable,
      containsButtons,
      containsLinks,
      containsInputs,
      repeatedChildTagNames: [...tagCounts.entries()].filter(([, count]) => count >= 3).map(([tagName]) => tagName)
    };
  }
  function getDescendants(element) {
    if (Array.isArray(element?.descendants)) {
      return element.descendants;
    }
    if (typeof element?.querySelectorAll === "function") {
      return Array.from(element.querySelectorAll("*"));
    }
    return [];
  }
  function readParentSummary(element) {
    const parent = element?.parentElement ?? element?.parent ?? null;
    if (!parent) {
      return null;
    }
    return {
      identity: parent.identity ?? normalizeWhitespace(readAttribute(parent, "id")) ?? `${String(parent.tagName ?? "node").toLowerCase()}-${Number(parent.index ?? 0)}`,
      tagName: String(parent.tagName ?? "").toLowerCase(),
      role: String(readAttribute(parent, "role") ?? "").toLowerCase(),
      childCount: Number(parent.childElementCount ?? parent.children?.length ?? 0)
    };
  }
  function extractElementFeatures(element, context = {}) {
    const rect = readRect(element);
    const tagName = String(element?.tagName ?? "").toLowerCase();
    const role = String(readAttribute(element, "role") ?? "").toLowerCase();
    const accessibleName = computeAccessibleName(element, context.ownerDocument ?? element?.ownerDocument);
    const textSnippet = getElementTextSnippet(element);
    const dataAttributes = collectNamedAttributes(element, "data-");
    const ariaAttributes = collectNamedAttributes(element, "aria-");
    const descendantSummary = collectDescendantSummaries(element);
    const text = `${accessibleName} ${textSnippet}`;
    return {
      tagName,
      role,
      type: normalizeWhitespace(readAttribute(element, "type")),
      id: normalizeWhitespace(readAttribute(element, "id")),
      classList: Array.from(element?.classList ?? []).map((name) => normalizeWhitespace(name)).filter(Boolean),
      dataAttributes,
      ariaAttributes,
      name: normalizeWhitespace(readAttribute(element, "name")),
      title: normalizeWhitespace(readAttribute(element, "title")),
      placeholder: normalizeWhitespace(readAttribute(element, "placeholder")),
      alt: normalizeWhitespace(readAttribute(element, "alt")),
      href: normalizeWhitespace(readAttribute(element, "href")),
      textSnippet,
      accessibleName,
      boundingRect: rect,
      visible: isElementVisible(element),
      disabled: isElementDisabled(element),
      contentEditable: safeLower(readAttribute(element, "contenteditable")) === "true",
      tabIndex: Number(element?.tabIndex ?? readAttribute(element, "tabindex") ?? -1),
      childCount: Number(element?.childElementCount ?? element?.children?.length ?? 0),
      parentSummary: readParentSummary(element),
      scrollable: isScrollableElement(element, rect),
      localTextDensity: normalizeWhitespace(text).length / Math.max(1, rectArea(rect)),
      descendantTagNames: descendantSummary.descendantTagNames,
      descendantRoles: descendantSummary.descendantRoles,
      containsEditable: descendantSummary.containsEditable,
      containsButtons: descendantSummary.containsButtons,
      containsLinks: descendantSummary.containsLinks,
      containsInputs: descendantSummary.containsInputs,
      repeatedChildTagNames: descendantSummary.repeatedChildTagNames,
      hasActionWord: ACTION_WORD_RE.test(text),
      looksTimestamp: TIMESTAMP_RE.test(text),
      isNativeInteractable: isNativeInteractableTag(tagName),
      hasInteractiveRole: isInteractiveRole(role),
      hasLandmarkRole: isLandmarkRole(role)
    };
  }
  function getMeaningfulAncestor(element, maxDepth = 4) {
    let current = element;
    let depth = 0;
    while (current && depth < maxDepth) {
      const parent = current.parentElement ?? current.parent ?? null;
      if (!parent) {
        break;
      }
      const currentFeatures = extractElementFeatures(current);
      const parentFeatures = extractElementFeatures(parent);
      const currentStrength = (currentFeatures.isNativeInteractable ? 4 : 0) + (currentFeatures.hasInteractiveRole ? 3 : 0) + (currentFeatures.contentEditable ? 3 : 0) + (currentFeatures.hasLandmarkRole ? 1 : 0);
      const parentStrength = (parentFeatures.isNativeInteractable ? 4 : 0) + (parentFeatures.hasInteractiveRole ? 3 : 0) + (parentFeatures.contentEditable ? 3 : 0) + (parentFeatures.hasLandmarkRole ? 1 : 0);
      if (parentStrength > currentStrength) {
        current = parent;
        depth += 1;
        continue;
      }
      break;
    }
    return current;
  }

  // src/heuristics.js
  function scoreControl(features) {
    let score = 0;
    if (features.isNativeInteractable)
      score += 6;
    if (features.hasInteractiveRole)
      score += 5;
    if (features.contentEditable)
      score += 4;
    if (features.tabIndex >= 0)
      score += 2;
    if (features.accessibleName)
      score += 2;
    if (features.placeholder)
      score += 2;
    if (features.hasActionWord)
      score += 2;
    if (features.disabled)
      score -= 6;
    if (!features.visible)
      score -= 8;
    if (features.boundingRect.width < 18 || features.boundingRect.height < 18)
      score -= 1;
    return score;
  }
  function scoreRegion(features, context = {}) {
    let score = 0;
    if (features.hasLandmarkRole)
      score += 5;
    if (["nav", "header", "footer", "aside", "main", "section", "form", "dialog"].includes(features.tagName)) {
      score += 4;
    }
    if (features.scrollable)
      score += 3;
    if (features.containsEditable && features.containsButtons)
      score += 5;
    if (features.containsLinks && features.repeatedChildTagNames.includes("a"))
      score += 4;
    if (features.repeatedChildTagNames.length)
      score += 3;
    if (context.fromAreaSelection)
      score += 2;
    if (!features.visible)
      score -= 8;
    return score;
  }
  function scoreCollection(features, context = {}) {
    let score = 0;
    if (features.repeatedChildTagNames.length)
      score += 5;
    if (features.scrollable)
      score += 2;
    if (context.repeatedSampleCount >= 3)
      score += 4;
    if (features.containsLinks || features.containsButtons)
      score += 2;
    if (features.localTextDensity > 0.004)
      score += 1;
    if (!features.visible)
      score -= 8;
    return score;
  }
  function scoreContent(features) {
    let score = 0;
    if (features.textSnippet)
      score += 3;
    if (features.looksTimestamp)
      score += 2;
    if (features.accessibleName && !features.isNativeInteractable && !features.hasInteractiveRole) {
      score += 2;
    }
    if (!features.visible)
      score -= 8;
    return score;
  }
  function inferControlType(features) {
    const text = safeLower(`${features.accessibleName} ${features.placeholder} ${features.textSnippet}`);
    if (features.tagName === "textarea")
      return "textarea";
    if (features.contentEditable || features.role === "textbox")
      return "editable";
    if (features.tagName === "input" && /file/.test(features.type))
      return "fileInput";
    if (features.tagName === "input")
      return "input";
    if (features.role === "combobox" || features.tagName === "select")
      return "combobox";
    if (features.role === "tab")
      return "tab";
    if (features.role === "switch" || /toggle/.test(text))
      return "toggle";
    if (/menu|more|overflow/.test(text))
      return "menuTrigger";
    if (features.tagName === "a" || features.role === "link")
      return "link";
    return "button";
  }
  function inferRegionType(features) {
    const text = safeLower(`${features.accessibleName} ${features.textSnippet} ${features.placeholder}`);
    if (features.containsEditable && features.containsButtons)
      return "composer";
    if (features.scrollable && features.repeatedChildTagNames.length && /message|chat|transcript|feed/.test(text)) {
      return "transcript";
    }
    if ((features.tagName === "nav" || features.role === "navigation") && features.repeatedChildTagNames.length) {
      return "navigation";
    }
    if ((features.tagName === "aside" || /sidebar/.test(text)) && (features.containsLinks || features.containsButtons)) {
      return "sidebar";
    }
    if (features.role === "toolbar")
      return "toolbar";
    if (features.tagName === "form" || features.role === "form")
      return "form";
    if (features.tagName === "dialog" || features.role === "dialog")
      return "modal";
    if (features.tagName === "header")
      return "header";
    if (features.tagName === "footer")
      return "footer";
    if (features.tagName === "main" || features.role === "main")
      return "main";
    return "panel";
  }
  function inferCollectionType(features, context = {}) {
    const text = safeLower(`${features.accessibleName} ${features.textSnippet}`);
    if (/message|chat/.test(text))
      return "messageItems";
    if (/conversation|inbox|thread/.test(text))
      return "conversationRows";
    if (/menu|nav/.test(text))
      return "navigationLinks";
    if (context.regionType === "transcript")
      return "messageItems";
    if (context.regionType === "sidebar")
      return "conversationRows";
    return "genericRepeatedList";
  }
  function inferContentType(features) {
    const text = safeLower(`${features.accessibleName} ${features.textSnippet}`);
    if (features.looksTimestamp)
      return "timestamp";
    if (/status|online|offline|sent|failed|error/.test(text))
      return "statusText";
    if (/badge|unread|\d+\s+new/.test(text))
      return "badge";
    if (/title|subject|thread/.test(text))
      return "title";
    if (/sender|from/.test(text))
      return "sender";
    return "content";
  }
  function chooseKind(scores) {
    return Object.entries(scores).sort((left, right) => right[1] - left[1])[0][0];
  }
  function triggeredDiscoveryHeuristics(features, context = {}) {
    const heuristics = [];
    if (features.isNativeInteractable)
      heuristics.push("nativeInteractables");
    if (features.hasInteractiveRole)
      heuristics.push("ariaInteractables");
    if (features.contentEditable || /input|textarea/.test(features.tagName))
      heuristics.push("editableTargets");
    if (features.tabIndex >= 0 && !features.isNativeInteractable)
      heuristics.push("eventLikeControls");
    if (features.hasLandmarkRole || ["nav", "header", "footer", "aside", "main", "form", "dialog"].includes(features.tagName)) {
      heuristics.push("landmarkRegions");
    }
    if (features.scrollable || features.repeatedChildTagNames.length)
      heuristics.push("visualRegions");
    if (features.containsEditable && features.containsButtons)
      heuristics.push("chatComposer");
    if (features.scrollable && features.repeatedChildTagNames.length)
      heuristics.push("chatTranscript");
    if (context.repeatedSampleCount >= 3 || features.repeatedChildTagNames.length)
      heuristics.push("repeatedCollections");
    if (features.containsLinks && features.repeatedChildTagNames.includes("a"))
      heuristics.push("navigationClusters");
    if (features.role === "dialog" || features.tagName === "dialog")
      heuristics.push("modalSurface");
    if (features.textSnippet && !features.isNativeInteractable && !features.hasInteractiveRole)
      heuristics.push("assertableContent");
    return heuristics;
  }
  function inferObjectFromFeatures(features, context = {}) {
    const scores = {
      control: scoreControl(features),
      region: scoreRegion(features, context),
      collection: scoreCollection(features, context),
      content: scoreContent(features)
    };
    const kind = chooseKind(scores);
    const bestScore = scores[kind];
    const confidence = clamp((bestScore + 2) / 14, 0.15, 0.99);
    const inferredType = kind === "control" ? inferControlType(features) : kind === "region" ? inferRegionType(features) : kind === "collection" ? inferCollectionType(features, context) : inferContentType(features);
    const explanation = buildExplanation(kind, inferredType, features, context);
    return {
      kind,
      inferredType,
      confidence: Number(confidence.toFixed(2)),
      explanation,
      discoveryHeuristics: triggeredDiscoveryHeuristics(features, context),
      scores
    };
  }
  function buildObjectName(inference, features, existingNames = []) {
    const label = features.accessibleName || features.placeholder || features.title || features.textSnippet;
    const labelLower = safeLower(label);
    const inferredLower = safeLower(inference.inferredType);
    const isFieldLike = ["input", "textarea", "editable", "textbox"].includes(inferredLower);
    const base = inference.inferredType === "button" && label ? `${label} button` : inference.inferredType === "link" && label ? `${label} link` : label && (labelLower.includes(inferredLower) || isFieldLike && /input|message|compose|editor|field|search/.test(labelLower)) ? label : label ? `${label} ${inference.inferredType}` : inference.inferredType;
    return uniqueName(base, existingNames);
  }
  function createObjectModel({ element = null, features, context = {}, existingNames = [] }) {
    const safeFeatures = features ?? extractElementFeatures(element, context);
    const inference = inferObjectFromFeatures(safeFeatures, context);
    return {
      id: null,
      name: buildObjectName(inference, safeFeatures, existingNames),
      kind: inference.kind,
      inferredType: inference.inferredType,
      confidence: inference.confidence,
      explanation: inference.explanation,
      discoveryHeuristics: inference.discoveryHeuristics,
      features: safeFeatures,
      element,
      parentId: null,
      children: [],
      collection: null,
      selector: "",
      selectorType: "css",
      selectorScore: 0,
      heuristicId: null,
      alternativeSelectors: [],
      selectorTest: null
    };
  }
  function buildExplanation(kind, inferredType, features, context = {}) {
    const parts = [];
    if (kind === "control") {
      if (features.isNativeInteractable) {
        parts.push("native interactable");
      }
      if (features.hasInteractiveRole) {
        parts.push(`role=${features.role}`);
      }
      if (features.accessibleName) {
        parts.push(`label "${excerpt(features.accessibleName, 32)}"`);
      }
    }
    if (kind === "region") {
      if (features.containsEditable && features.containsButtons) {
        parts.push("editable target grouped with nearby actions");
      }
      if (features.scrollable) {
        parts.push("scrollable container");
      }
      if (features.repeatedChildTagNames.length) {
        parts.push(`repeated ${features.repeatedChildTagNames.join(", ")} children`);
      }
    }
    if (kind === "collection") {
      if (context.repeatedSampleCount >= 3) {
        parts.push(`${context.repeatedSampleCount} repeated item samples`);
      }
      if (context.regionType) {
        parts.push(`inside ${context.regionType}`);
      }
    }
    if (kind === "content") {
      if (features.looksTimestamp) {
        parts.push("timestamp-like text");
      }
      if (features.textSnippet) {
        parts.push(`assertable text "${excerpt(features.textSnippet, 32)}"`);
      }
    }
    return `${inferredType}: ${parts.filter(Boolean).join(", ") || "best-fit automation target"}`;
  }

  // src/regions.js
  function shapeSignature(record) {
    const features = record.features;
    return [
      features.tagName,
      features.role,
      features.parentSummary?.identity ?? "root",
      features.classList.filter((name) => name.length > 2).slice(0, 2).join("."),
      features.childCount > 0 ? "children" : "leaf"
    ].join("|");
  }
  function detectRepeatedCollections(records) {
    const groups = new Map;
    for (const record of records) {
      const parentIdentity = record.features.parentSummary?.identity ?? "root";
      const key = `${parentIdentity}::${shapeSignature(record)}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(record);
    }
    return [...groups.values()].filter((group) => group.length >= 3).map((group) => {
      const sample = group[0];
      const regionType = sample.regionType ?? sample.parentRegionType ?? null;
      const collection = createObjectModel({
        features: {
          ...sample.features,
          scrollable: Boolean(sample.features.scrollable || group.some((record) => record.features.scrollable)),
          repeatedChildTagNames: [
            sample.features.tagName || "div",
            ...sample.features.repeatedChildTagNames
          ]
        },
        context: {
          repeatedSampleCount: group.length,
          regionType
        }
      });
      collection.kind = "collection";
      collection.collection = {
        sampleCount: group.length,
        virtualizationSuspected: group.length >= 20,
        sampleEntries: group,
        itemChildren: []
      };
      return collection;
    });
  }
  function scoreSelectionRecord(record, selectionRect) {
    const overlapRatio = rectOverlapRatio(record.features.boundingRect, selectionRect);
    const regionBias = record.kind === "region" ? 3 : record.kind === "collection" ? 2 : record.kind === "control" ? 1.5 : 1;
    return overlapRatio * 10 * regionBias + Number(record.confidence ?? 0);
  }
  function readLiveRect(record) {
    if (typeof record?.element?.getBoundingClientRect === "function") {
      return rectFrom(record.element.getBoundingClientRect());
    }
    return rectFrom(record?.features?.boundingRect ?? {});
  }
  function withRect(record, rect) {
    return {
      ...record,
      features: {
        ...record.features ?? {},
        boundingRect: rect
      }
    };
  }
  function selectionContainsPoint(selectionRect, pointX, pointY) {
    return pointX >= selectionRect.left && pointX <= selectionRect.right && pointY >= selectionRect.top && pointY <= selectionRect.bottom;
  }
  function candidateTypeBias(record) {
    if (record.kind === "control") {
      return 2;
    }
    if (record.kind === "content") {
      return 1;
    }
    if (record.kind === "collection") {
      return 0.6;
    }
    if (record.kind === "region") {
      return -0.8;
    }
    return 0;
  }
  function isPageLevelContainer(record) {
    const tag = String(record?.features?.tagName ?? "").toLowerCase();
    const role = String(record?.features?.role ?? "").toLowerCase();
    const id = String(record?.features?.id ?? "").toLowerCase();
    return tag === "html" || tag === "body" || role === "main" || id === "root" || id === "app" || id === "layout" || id === "page";
  }
  function unionRects(rects) {
    if (!rects.length) {
      return null;
    }
    const left = Math.min(...rects.map((rect) => rect.left));
    const top = Math.min(...rects.map((rect) => rect.top));
    const right = Math.max(...rects.map((rect) => rect.right));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));
    return rectFrom({
      left,
      top,
      right,
      bottom,
      width: Math.max(0, right - left),
      height: Math.max(0, bottom - top)
    });
  }
  function effectiveRect(record, selectionRect) {
    const baseRect = readLiveRect(record);
    const elementArea = Math.max(1, rectArea(baseRect));
    const selectionArea = Math.max(1, rectArea(selectionRect));
    const widthLooksOversized = baseRect.width > selectionRect.width * 1.9;
    const isTextLike = String(record?.kind ?? "") === "content" || Boolean(record?.features?.textSnippet) || ["div", "p", "section", "article", "label"].includes(String(record?.features?.tagName ?? "").toLowerCase());
    if (!widthLooksOversized || !isTextLike || !record?.element) {
      return { rect: baseRect, contentFootprint: false };
    }
    const children = Array.from(record.element.children ?? []);
    const childRects = children.map((child) => typeof child?.getBoundingClientRect === "function" ? rectFrom(child.getBoundingClientRect()) : null).filter((rect) => rect && rectArea(rect) > 0);
    const childUnion = unionRects(childRects);
    if (childUnion && rectArea(childUnion) > 0 && rectArea(childUnion) < elementArea * 0.72) {
      return { rect: childUnion, contentFootprint: true };
    }
    if (record.features?.textSnippet && elementArea > selectionArea * 2.5) {
      const left = Math.max(baseRect.left, selectionRect.left - 12);
      const right = Math.min(baseRect.right, selectionRect.right + 12);
      if (right > left + 10) {
        return {
          rect: rectFrom({
            left,
            top: baseRect.top,
            right,
            bottom: baseRect.bottom,
            width: right - left,
            height: baseRect.height
          }),
          contentFootprint: true
        };
      }
    }
    return { rect: baseRect, contentFootprint: false };
  }
  function shouldHardExclude(record, metrics, selectionRect) {
    if (metrics.overlapArea <= 0) {
      return true;
    }
    if (!metrics.fullyContained && !metrics.centerInside && metrics.overlapToElement < 0.12 && metrics.overlapToSelection < 0.09) {
      return true;
    }
    if (isPageLevelContainer(record) && metrics.selectionShareOnCandidate < 0.9) {
      return true;
    }
    if (metrics.areaRatioToSelection > 12 && !metrics.fullyContained && metrics.overlapToElement < 0.75) {
      return true;
    }
    if (record.kind !== "control" && metrics.areaRatioToSelection > 5 && metrics.selectionShareOnCandidate < 0.55 && metrics.overlapToElement < 0.65) {
      return true;
    }
    if (record.kind === "region" && metrics.areaRatioToSelection > 2.2 && metrics.selectionShareOnCandidate < 0.65 && metrics.overlapToSelection < 0.88) {
      return true;
    }
    if (record.kind !== "control" && metrics.areaRatioToSelection > 6 && metrics.overlapToElement < 0.2 && !metrics.fullyContained) {
      return true;
    }
    const selectionArea = Math.max(1, rectArea(selectionRect));
    const candidateArea = Math.max(1, rectArea(metrics.rect));
    if (candidateArea > selectionArea * 14 && metrics.overlapToSelection < 0.96) {
      return true;
    }
    return false;
  }
  function intentScore(record, metrics) {
    let score = 0;
    if (metrics.fullyContained)
      score += 8.2;
    if (metrics.centerInside)
      score += 4.1;
    score += metrics.overlapToElement * 6.2;
    score += metrics.overlapToSelection * 4.3;
    score += candidateTypeBias(record);
    score += Number(record.confidence ?? 0);
    if (metrics.contentFootprint) {
      score += 1.1;
    }
    if (metrics.areaRatioToSelection > 1.4) {
      score -= Math.min(8, (metrics.areaRatioToSelection - 1.4) * 1.15);
    }
    if (metrics.areaRatioToSelection > 4 && !metrics.fullyContained) {
      score -= 2.5;
    }
    if (isPageLevelContainer(record)) {
      score -= 6.5;
    }
    if (record.kind === "region" && metrics.overlapToSelection > 0.34 && metrics.areaRatioToSelection < 1.65) {
      score += 2.25;
    }
    if (record.kind === "region" && metrics.overlapToElement > 0.6 && metrics.overlapToSelection > 0.25 && metrics.areaRatioToSelection < 1.8) {
      score += 10.5;
    }
    return Number(score.toFixed(4));
  }
  function computeCandidate(record, selectionRect) {
    const { rect, contentFootprint } = effectiveRect(record, selectionRect);
    const overlapArea = rectIntersectionArea(rect, selectionRect);
    const rectAreaValue = Math.max(1, rectArea(rect));
    const selectionArea = Math.max(1, rectArea(selectionRect));
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const centerInside = selectionContainsPoint(selectionRect, centerX, centerY);
    const fullyContained = rectContains(selectionRect, rect);
    const overlapToElement = overlapArea / rectAreaValue;
    const overlapToSelection = overlapArea / selectionArea;
    const areaRatioToSelection = rectAreaValue / selectionArea;
    const selectionShareOnCandidate = selectionArea / rectAreaValue;
    const metrics = {
      rect,
      overlapArea,
      overlapToElement,
      overlapToSelection,
      areaRatioToSelection,
      selectionShareOnCandidate,
      fullyContained,
      centerInside,
      contentFootprint
    };
    return {
      record: withRect(record, rect),
      metrics
    };
  }
  function suppressBroadAncestors(candidates) {
    return candidates.filter((candidate) => {
      const element = candidate.record.element;
      if (!element || typeof element.contains !== "function") {
        return true;
      }
      if (candidate.metrics.contentFootprint) {
        const tightlyContainedDescendant = candidates.find((other) => {
          if (other === candidate || !other.record.element) {
            return false;
          }
          if (!element.contains(other.record.element)) {
            return false;
          }
          return other.metrics.fullyContained && other.metrics.overlapToElement >= 0.9 && other.score >= candidate.score - 1.6;
        });
        if (tightlyContainedDescendant) {
          return false;
        }
      }
      const betterDescendant = candidates.find((other) => {
        if (other === candidate) {
          return false;
        }
        if (!other.record.element || !element.contains(other.record.element)) {
          return false;
        }
        if (other.metrics.fullyContained && candidate.metrics.areaRatioToSelection > 1.65) {
          return other.score >= candidate.score + 1.8;
        }
        return false;
      });
      if (!betterDescendant) {
        return true;
      }
      if (candidate.record.kind === "control") {
        return true;
      }
      return false;
    });
  }
  function rankIntentCandidates(records, selectionRect) {
    const candidates = records.filter((record) => rectIntersects(readLiveRect(record), selectionRect)).map((record) => computeCandidate(record, selectionRect)).filter(({ record, metrics }) => !shouldHardExclude(record, metrics, selectionRect)).map((entry) => ({
      ...entry,
      score: intentScore(entry.record, entry.metrics)
    }));
    return suppressBroadAncestors(candidates).sort((left, right) => right.score - left.score);
  }
  function previewAreaCandidates(records, selectionRect, limit = 24) {
    return rankIntentCandidates(records, selectionRect).slice(0, Math.max(1, Number(limit))).map(({ record, score }) => ({
      ...record,
      score
    }));
  }
  function assignParents(objects) {
    const regions = objects.filter((item) => item.kind === "region");
    for (const object of objects) {
      if (object.kind === "region") {
        continue;
      }
      const parent = regions.filter((region) => region.id !== object.id && rectContains(region.features.boundingRect, object.features.boundingRect)).sort((left, right) => {
        const leftArea = left.features.boundingRect.width * left.features.boundingRect.height;
        const rightArea = right.features.boundingRect.width * right.features.boundingRect.height;
        return leftArea - rightArea;
      })[0];
      if (parent) {
        object.parentId = parent.id;
        parent.children.push(object.id);
      }
    }
  }
  function analyzeAreaSelection(records, selectionRect) {
    const localCandidates = rankIntentCandidates(records, selectionRect);
    const overlapping = localCandidates.map((entry) => ({
      ...entry.record,
      score: entry.score
    }));
    const collectionObjects = detectRepeatedCollections(overlapping).map((collection) => {
      const sampleRect = rectFrom(collection.features?.boundingRect ?? {});
      const overlapRatio = rectOverlapRatio(sampleRect, selectionRect);
      const localBonus = collection.collection?.sampleCount ? Math.min(3, Math.log2(1 + collection.collection.sampleCount)) : 0;
      const sampleEntries = Array.isArray(collection.collection?.sampleEntries) ? collection.collection.sampleEntries : [];
      const averageSampleScore = sampleEntries.length ? sampleEntries.reduce((sum, entry) => sum + Number(entry.score ?? 0), 0) / sampleEntries.length : 0;
      return {
        ...collection,
        score: Math.max(averageSampleScore + 1.2, overlapRatio * 8) + localBonus + Number(collection.confidence ?? 0) + Math.min(5, Number(collection.collection?.sampleCount ?? 0) * 0.85)
      };
    });
    const combined = [...overlapping, ...collectionObjects].map((record) => ({
      ...record,
      score: typeof record.score === "number" ? record.score : scoreSelectionRecord(record, selectionRect)
    }));
    const ranked = sortByScoreDesc(combined).slice(0, 8).map((record, index) => ({
      ...record,
      id: record.id ?? `selection-${index + 1}`,
      children: [...record.children ?? []]
    }));
    assignParents(ranked);
    return ranked;
  }

  // src/scanner.js
  function hasIgnoreAttribute(element) {
    if (!element) {
      return false;
    }
    if (typeof element.getAttribute === "function") {
      return element.getAttribute(TOOL_IGNORE_ATTRIBUTE) === "true";
    }
    return element.attributes?.[TOOL_IGNORE_ATTRIBUTE] === "true";
  }
  function isDecorative(features) {
    return features.ariaAttributes?.["aria-hidden"] === "true" && !features.textSnippet && !features.accessibleName && !features.isNativeInteractable && !features.hasInteractiveRole;
  }
  function isEligibleElement(element) {
    const features = extractElementFeatures(element);
    if (!features.visible || features.disabled) {
      return false;
    }
    if (hasIgnoreAttribute(element) || hasIgnoreAttribute(element.parentElement ?? element.parent)) {
      return false;
    }
    return !isDecorative(features);
  }
  function scanDocument(documentLike) {
    const body = documentLike?.body ?? null;
    const descendants = Array.from(documentLike?.querySelectorAll?.("*") ?? []);
    const rawElements = [body, ...descendants].filter(Boolean);
    const seen = new Set;
    return rawElements.map((element) => getMeaningfulAncestor(element)).filter(Boolean).filter((element) => {
      if (seen.has(element)) {
        return false;
      }
      seen.add(element);
      return true;
    }).filter(isEligibleElement).map((element) => ({
      element,
      features: extractElementFeatures(element)
    }));
  }

  // src/ui/themes.js
  var TOOL_THEMES = {
    macos: {
      id: "macos",
      label: "macOS Utility",
      className: "theme-macos"
    },
    windowsXp: {
      id: "windowsXp",
      label: "Windows XP Utility",
      className: "theme-windows-xp"
    }
  };
  function detectPlatform(windowObject) {
    const userAgentDataPlatform = windowObject.navigator?.userAgentData?.platform ?? "";
    const platform = `${userAgentDataPlatform} ${windowObject.navigator?.platform ?? ""} ${windowObject.navigator?.userAgent ?? ""}`.toLowerCase();
    const isMobile = /iphone|ipad|android|mobile/.test(platform);
    if (isMobile) {
      return "mobile";
    }
    if (/mac/.test(platform)) {
      return "mac";
    }
    if (/win/.test(platform)) {
      return "windows";
    }
    if (/linux|x11/.test(platform)) {
      return "linux";
    }
    return "desktop";
  }
  function chooseDefaultTheme(windowObject = window) {
    const platform = detectPlatform(windowObject);
    if (platform === "mac") {
      return TOOL_THEMES.windowsXp.id;
    }
    if (platform === "windows" || platform === "linux" || platform === "desktop") {
      return TOOL_THEMES.macos.id;
    }
    return TOOL_THEMES.macos.id;
  }
  function getThemeMeta(themeId) {
    return TOOL_THEMES[themeId] ?? TOOL_THEMES.macos;
  }
  function cycleTheme(themeId) {
    return themeId === TOOL_THEMES.macos.id ? TOOL_THEMES.windowsXp.id : TOOL_THEMES.macos.id;
  }

  // src/session-core.js
  var SESSION_STORAGE_VERSION = 1;
  var SESSION_KEY = `${TOOL_NAMESPACE}:session-state`;
  var LEGACY_WINDOW_KEY = `${TOOL_NAMESPACE}:window-state`;
  function safeClone(value) {
    if (value === undefined) {
      return;
    }
    return JSON.parse(JSON.stringify(value));
  }
  function serializeObjectModel(objectModel) {
    const {
      element,
      ...serializable
    } = objectModel ?? {};
    return safeClone(serializable);
  }
  function serializeState(state) {
    return {
      version: SESSION_STORAGE_VERSION,
      counter: Number(state.counter ?? 1),
      mode: state.mode ?? "inspect",
      themeId: state.themeId,
      frame: state.frame ?? null,
      popupGeometry: state.popupGeometry ?? null,
      selectedObjectId: state.selectedObjectId ?? null,
      heuristicFilter: state.heuristicFilter ?? "",
      heuristicMenuOpen: Boolean(state.heuristicMenuOpen),
      exportPreviewVisible: Boolean(state.exportPreviewVisible),
      exportText: state.exportText ?? "",
      statusMessage: state.statusMessage ?? "",
      selectedObjects: Array.isArray(state.selectedObjects) ? state.selectedObjects.map((objectModel) => serializeObjectModel(objectModel)) : [],
      stateVersion: Number(state.stateVersion ?? 0),
      lastExportVersion: Number(state.lastExportVersion ?? -1),
      popupMode: state.hostMode === "popup"
    };
  }
  function parseSavedState(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    return {
      frame: raw.frame ?? null,
      themeId: raw.themeId,
      mode: raw.mode === "area" ? "area" : "inspect",
      counter: Number(raw.counter ?? 1),
      selectedObjects: Array.isArray(raw.selectedObjects) ? raw.selectedObjects : [],
      selectedObjectId: raw.selectedObjectId ?? null,
      heuristicFilter: raw.heuristicFilter ?? "",
      heuristicMenuOpen: Boolean(raw.heuristicMenuOpen),
      exportPreviewVisible: Boolean(raw.exportPreviewVisible),
      exportText: raw.exportText ?? "",
      statusMessage: raw.statusMessage ?? "Ready to scan the current page for automation-relevant objects.",
      stateVersion: Number(raw.stateVersion ?? 0),
      lastExportVersion: Number(raw.lastExportVersion ?? -1),
      popupGeometry: raw.popupGeometry ?? null
    };
  }
  function loadSessionSnapshot(windowObject) {
    try {
      const raw = windowObject.sessionStorage?.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parseSavedState(parsed);
      }
      const legacyRaw = windowObject.sessionStorage?.getItem(LEGACY_WINDOW_KEY);
      if (!legacyRaw) {
        return null;
      }
      const legacy = JSON.parse(legacyRaw);
      return parseSavedState({
        frame: legacy.frame ?? null,
        themeId: legacy.themeId ?? undefined
      });
    } catch {
      return null;
    }
  }
  function saveSessionSnapshot(windowObject, state) {
    try {
      const snapshot = serializeState(state);
      windowObject.sessionStorage?.setItem(SESSION_KEY, JSON.stringify(snapshot));
    } catch {}
  }
  function createInitialSessionState(windowObject, options = {}) {
    const savedState = options.savedState ?? loadSessionSnapshot(windowObject);
    return {
      mounted: false,
      hostMode: "inline",
      scanRecords: [],
      selectedObjects: savedState?.selectedObjects ?? [],
      selectedObjectId: savedState?.selectedObjectId ?? null,
      hoverRecord: null,
      mode: savedState?.mode ?? "inspect",
      dragSelection: null,
      counter: Math.max(1, Number(savedState?.counter ?? 1)),
      themeId: savedState?.themeId ?? chooseDefaultTheme(windowObject),
      frame: savedState?.frame ?? null,
      popupGeometry: savedState?.popupGeometry ?? null,
      heuristicFilter: savedState?.heuristicFilter ?? "",
      heuristicMenuOpen: Boolean(savedState?.heuristicMenuOpen),
      exportPreviewVisible: Boolean(savedState?.exportPreviewVisible),
      exportText: savedState?.exportText ?? "",
      statusMessage: savedState?.statusMessage ?? "Ready to scan the current page for automation-relevant objects.",
      interaction: null,
      popupWindow: null,
      popupCloseReason: null,
      stateVersion: Number(savedState?.stateVersion ?? 0),
      lastExportVersion: Number(savedState?.lastExportVersion ?? -1)
    };
  }
  function markSessionChanged(state) {
    state.stateVersion = Number(state.stateVersion ?? 0) + 1;
  }
  function markSessionExported(state) {
    state.lastExportVersion = Number(state.stateVersion ?? 0);
  }
  function isSessionDirty(state) {
    const hasSelected = Array.isArray(state.selectedObjects) && state.selectedObjects.length > 0;
    const hasManualEdits = Array.isArray(state.selectedObjects) ? state.selectedObjects.some((item) => Boolean(String(item?.manualSelector ?? "").trim())) : false;
    const hasMeaningfulState = hasSelected || hasManualEdits;
    return hasMeaningfulState && Number(state.stateVersion ?? 0) > Number(state.lastExportVersion ?? -1);
  }

  // src/selectors.js
  var SELECTOR_HEURISTICS = [
    {
      id: "stableAttributesFirst",
      label: "Stable Attributes First",
      description: "Prefer data-test style attributes, labels, names, and meaningful ids.",
      applicableKinds: ["control", "region", "collection", "content"],
      priority: 100
    },
    {
      id: "regionScopedSemantic",
      label: "Region-Scoped Semantic",
      description: "Prefer a short child selector relative to a meaningful parent region.",
      applicableKinds: ["control", "content"],
      priority: 95
    },
    {
      id: "accessibleRoleAndName",
      label: "Accessible Role & Name",
      description: "Use role and accessible naming signals before brittle structural selectors.",
      applicableKinds: ["control", "content"],
      priority: 90
    },
    {
      id: "shortUniqueCss",
      label: "Short Unique CSS",
      description: "Build the shortest unique CSS selector that avoids unstable tokens.",
      applicableKinds: ["control", "region", "collection", "content"],
      priority: 85
    },
    {
      id: "resilientCssPath",
      label: "Resilient CSS Path",
      description: "Use a short ancestor-descendant chain when one attribute is not enough.",
      applicableKinds: ["control", "region", "collection", "content"],
      priority: 80
    },
    {
      id: "textAnchored",
      label: "Text Anchored",
      description: "Use nearby visible text or accessible labels as a fallback anchor.",
      applicableKinds: ["control", "content"],
      priority: 70
    },
    {
      id: "collectionItem",
      label: "Collection Item",
      description: "Prefer repeated item selectors over one fixed instance.",
      applicableKinds: ["collection"],
      priority: 92
    },
    {
      id: "parentChildRelative",
      label: "Parent + Child Relative",
      description: "Preserve hierarchy with a stable parent region and concise child selector.",
      applicableKinds: ["control", "content"],
      priority: 88
    },
    {
      id: "xpathRelationalFallback",
      label: "XPath Relational Fallback",
      description: "Use XPath only when CSS cannot express the relation clearly.",
      applicableKinds: ["control", "content", "region"],
      priority: 50
    },
    {
      id: "manualSelector",
      label: "Manual Selector",
      description: "Validate the selector exactly as typed by the user.",
      applicableKinds: ["control", "region", "collection", "content"],
      priority: 5
    }
  ];
  function applicableHeuristics(kind) {
    return SELECTOR_HEURISTICS.filter((heuristic) => heuristic.applicableKinds.includes(kind));
  }
  function chooseAutomaticHeuristic(objectModel) {
    if (objectModel.kind === "collection") {
      return "collectionItem";
    }
    if ((objectModel.kind === "control" || objectModel.kind === "content") && objectModel.parentId) {
      return "regionScopedSemantic";
    }
    if (objectModel.kind === "control" && !Object.keys(objectModel.features.dataAttributes ?? {}).length && !objectModel.features.id) {
      return "shortUniqueCss";
    }
    return "stableAttributesFirst";
  }
  function countMatches(selector, selectorType, context = {}) {
    if (context.matchCounts && `${selectorType}:${selector}` in context.matchCounts) {
      return context.matchCounts[`${selectorType}:${selector}`];
    }
    if (selectorType === "css" && typeof context.scope?.querySelectorAll === "function") {
      try {
        return context.scope.querySelectorAll(selector).length;
      } catch {
        return 0;
      }
    }
    if (selectorType === "xpath" && context.document && typeof context.document.evaluate === "function" && typeof context.document.XPathResult !== "undefined") {
      try {
        const result = context.document.evaluate(selector, context.scope ?? context.document, null, context.document.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        return result.snapshotLength;
      } catch {
        return 0;
      }
    }
    return 1;
  }
  function makeCandidate(selector, selectorType, heuristicId, explanation, context) {
    const matchCount = countMatches(selector, selectorType, context);
    return {
      selector,
      selectorType,
      heuristicId,
      explanation,
      matchCount
    };
  }
  function dataAttributeCandidates(features, heuristicId, context) {
    const candidates = [];
    const importantAttributes = [
      "data-testid",
      "data-test",
      "data-qa",
      "data-cy"
    ];
    for (const key of importantAttributes) {
      const value = features.dataAttributes?.[key];
      if (value) {
        candidates.push(makeCandidate(`[${key}="${escapeCssString(value)}"]`, "css", heuristicId, `${key} is usually authored for test stability`, context));
      }
    }
    if (features.id && !looksGeneratedToken(features.id)) {
      candidates.push(makeCandidate(`#${escapeCssString(features.id)}`, "css", heuristicId, "meaningful id anchor", context));
    }
    if (features.name) {
      candidates.push(makeCandidate(`${features.tagName || "*"}[name="${escapeCssString(features.name)}"]`, "css", heuristicId, "stable form control name", context));
    }
    if (features.ariaAttributes?.["aria-label"]) {
      candidates.push(makeCandidate(`${features.tagName || "*"}[aria-label="${escapeCssString(features.ariaAttributes["aria-label"])}"]`, "css", heuristicId, "authored aria-label", context));
    }
    if (features.placeholder) {
      candidates.push(makeCandidate(`${features.tagName || "*"}[placeholder="${escapeCssString(features.placeholder)}"]`, "css", heuristicId, "placeholder anchor", context));
    }
    if (features.href) {
      candidates.push(makeCandidate(`${features.tagName || "a"}[href="${escapeCssString(features.href)}"]`, "css", heuristicId, "href anchor", context));
    }
    return candidates;
  }
  function stableClassSelector(features, heuristicId, context) {
    const stableClasses = (features.classList ?? []).filter((name) => !looksGeneratedToken(name));
    if (!stableClasses.length) {
      return [];
    }
    return [
      makeCandidate(`${features.tagName || ""}.${stableClasses.slice(0, 2).map(escapeCssString).join(".")}`, "css", heuristicId, "short semantic class selector", context)
    ];
  }
  function shortCssCandidates(features, heuristicId, context) {
    const base = [];
    base.push(...dataAttributeCandidates(features, heuristicId, context));
    base.push(...stableClassSelector(features, heuristicId, context));
    if (features.tagName && features.role) {
      base.push(makeCandidate(`${features.tagName}[role="${escapeCssString(features.role)}"]`, "css", heuristicId, "tag and role pairing", context));
    }
    if (features.tagName) {
      base.push(makeCandidate(features.tagName, "css", heuristicId, "bare tag fallback", context));
    }
    return base;
  }
  function buildResilientPath(features, heuristicId, context) {
    const parentTag = features.parentSummary?.tagName;
    if (!parentTag || !features.tagName) {
      return [];
    }
    const selector = `${parentTag} ${features.tagName}${features.classList?.length ? `.${escapeCssString(features.classList[0])}` : ""}`;
    return [
      makeCandidate(selector, "css", heuristicId, "ancestor-descendant path with stable segments", context)
    ];
  }
  function buildRoleNameCandidates(features, heuristicId, context) {
    const role = features.role || inferImplicitRole(features);
    const label = features.accessibleName || features.placeholder || features.title;
    if (!role) {
      return [];
    }
    const candidates = [];
    if (features.ariaAttributes?.["aria-label"]) {
      candidates.push(makeCandidate(`[role="${escapeCssString(role)}"][aria-label="${escapeCssString(features.ariaAttributes["aria-label"])}"]`, "css", heuristicId, "role plus aria-label", context));
    }
    if (label) {
      candidates.push(makeCandidate(`//*[@role="${role}" and contains(normalize-space(.), "${escapeXPathText(label)}")]`, "xpath", heuristicId, "role plus accessible text", context));
    }
    return candidates;
  }
  function inferImplicitRole(features) {
    if (features.tagName === "button")
      return "button";
    if (features.tagName === "a")
      return "link";
    if (features.tagName === "textarea")
      return "textbox";
    if (features.tagName === "input")
      return "textbox";
    return "";
  }
  function buildTextCandidates(features, heuristicId, context) {
    const label = features.accessibleName || features.textSnippet || features.placeholder || features.title;
    if (!label) {
      return [];
    }
    return [
      makeCandidate(`//*[contains(normalize-space(.), "${escapeXPathText(label)}")]`, "xpath", heuristicId, "visible text anchor", context)
    ];
  }
  function buildRegionRelativeCandidates(objectModel, heuristicId, context) {
    const parent = context.parentObject;
    if (!parent) {
      return [];
    }
    const features = objectModel.features;
    const baseChildSelector = dataAttributeCandidates(features, heuristicId, context)[0]?.selector ?? stableClassSelector(features, heuristicId, context)[0]?.selector ?? `${features.tagName || "*"}${features.role ? `[role="${escapeCssString(features.role)}"]` : ""}`;
    return [
      {
        ...makeCandidate(baseChildSelector, "css", heuristicId, `scoped to parent region ${parent.name}`, context),
        scopeMode: "parent",
        scopeId: parent.id
      }
    ];
  }
  function buildCollectionCandidates(objectModel, heuristicId, context) {
    const sample = objectModel.collection?.sampleEntries?.[0];
    const features = sample?.features ?? objectModel.features;
    const stableAttr = dataAttributeCandidates(features, heuristicId, context)[0]?.selector ?? stableClassSelector(features, heuristicId, context)[0]?.selector ?? features.tagName;
    return [
      makeCandidate(stableAttr, "css", heuristicId, "repeated item selector for collection entries", context)
    ];
  }
  function escapeXPathText(value) {
    return String(value ?? "").replace(/"/g, "\\\"");
  }
  function scoreSelectorCandidate(candidate, objectModel) {
    let score = 0;
    score += candidate.matchCount === 1 ? 24 : candidate.matchCount > 1 && objectModel.kind === "collection" ? 20 : 4;
    if (candidate.selectorType === "css")
      score += 6;
    if (candidate.selector.includes("data-testid") || candidate.selector.includes("data-test"))
      score += 18;
    if (candidate.selector.includes("aria-label"))
      score += 10;
    if (candidate.selector.startsWith("#"))
      score += 8;
    if (candidate.scopeMode === "parent")
      score += 9;
    if (candidate.selectorType === "xpath")
      score -= 3;
    if (candidate.selector.includes("nth-child"))
      score -= 12;
    if (candidate.selector.split(" ").length > 3)
      score -= 7;
    if (looksGeneratedToken(candidate.selector))
      score -= 10;
    if (/\/html\/body/i.test(candidate.selector))
      score -= 16;
    if (/contains\(normalize-space/.test(candidate.selector))
      score -= 2;
    if (/role=/.test(candidate.selector))
      score += 3;
    if (safeLower(candidate.explanation).includes("stable"))
      score += 2;
    return score;
  }
  function validateSelectorCandidate(candidate, context = {}) {
    return {
      ...candidate,
      matchCount: countMatches(candidate.selector, candidate.selectorType, context)
    };
  }
  function buildSelectorState(objectModel, context = {}) {
    const selectedHeuristicId = context.manualSelector && context.manualSelector.trim() ? "manualSelector" : context.heuristicId || chooseAutomaticHeuristic(objectModel);
    const candidates = [];
    const features = objectModel.features;
    const candidateContext = {
      ...context,
      scope: context.parentObject && selectedHeuristicId === "regionScopedSemantic" ? context.parentScope ?? context.scope : context.scope
    };
    for (const heuristic of applicableHeuristics(objectModel.kind)) {
      switch (heuristic.id) {
        case "stableAttributesFirst":
          candidates.push(...dataAttributeCandidates(features, heuristic.id, candidateContext));
          break;
        case "regionScopedSemantic":
        case "parentChildRelative":
          candidates.push(...buildRegionRelativeCandidates(objectModel, heuristic.id, candidateContext));
          break;
        case "accessibleRoleAndName":
          candidates.push(...buildRoleNameCandidates(features, heuristic.id, candidateContext));
          break;
        case "shortUniqueCss":
          candidates.push(...shortCssCandidates(features, heuristic.id, candidateContext));
          break;
        case "resilientCssPath":
          candidates.push(...buildResilientPath(features, heuristic.id, candidateContext));
          break;
        case "textAnchored":
        case "xpathRelationalFallback":
          candidates.push(...buildTextCandidates(features, heuristic.id, candidateContext));
          break;
        case "collectionItem":
          candidates.push(...buildCollectionCandidates(objectModel, heuristic.id, candidateContext));
          break;
        case "manualSelector":
          if (context.manualSelector && context.manualSelector.trim()) {
            candidates.push(makeCandidate(context.manualSelector.trim(), context.manualSelectorType ?? "css", heuristic.id, "manual selector", candidateContext));
          }
          break;
        default:
          break;
      }
    }
    const deduped = new Map;
    for (const candidate of candidates) {
      const key = `${candidate.heuristicId}:${candidate.selectorType}:${candidate.selector}:${candidate.scopeId ?? "doc"}`;
      if (!deduped.has(key)) {
        deduped.set(key, candidate);
      }
    }
    const scored = [...deduped.values()].map((candidate) => {
      const validated = validateSelectorCandidate(candidate, candidateContext);
      return {
        ...validated,
        score: scoreSelectorCandidate(validated, objectModel)
      };
    });
    const ranked = sortByScoreDesc(scored);
    const preferred = ranked.find((candidate) => candidate.heuristicId === selectedHeuristicId) ?? ranked[0] ?? {
      selector: "",
      selectorType: "css",
      heuristicId: selectedHeuristicId,
      score: 0,
      explanation: "No selector candidates generated",
      matchCount: 0
    };
    return {
      heuristicId: selectedHeuristicId,
      preferred,
      alternatives: ranked.filter((candidate) => candidate.selector !== preferred.selector).slice(0, 8),
      testResult: {
        matchCount: preferred.matchCount,
        score: preferred.score,
        scope: preferred.scopeMode === "parent" ? "parent" : "document"
      }
    };
  }

  // src/popup-manager.js
  var POPUP_NAME = "huge-page-object-recorder-popup";
  var DEFAULT_POPUP_GEOMETRY = {
    width: 980,
    height: 760,
    left: 80,
    top: 60
  };
  function safeGeometry(input = {}) {
    return {
      width: Math.max(520, Number(input.width ?? DEFAULT_POPUP_GEOMETRY.width)),
      height: Math.max(420, Number(input.height ?? DEFAULT_POPUP_GEOMETRY.height)),
      left: Math.max(0, Number(input.left ?? DEFAULT_POPUP_GEOMETRY.left)),
      top: Math.max(0, Number(input.top ?? DEFAULT_POPUP_GEOMETRY.top))
    };
  }
  function popupFeatures(geometry) {
    return [
      "popup=yes",
      "resizable=yes",
      "scrollbars=yes",
      `width=${geometry.width}`,
      `height=${geometry.height}`,
      `left=${geometry.left}`,
      `top=${geometry.top}`
    ].join(",");
  }
  function isPopupAlive(popupWindow) {
    return Boolean(popupWindow && popupWindow.closed === false);
  }
  function openRecorderPopup(openerWindow, options = {}) {
    const title = String(options.title ?? "Page Object Recorder");
    if (isPopupAlive(options.currentPopup)) {
      options.currentPopup.focus?.();
      return {
        blocked: false,
        reused: true,
        popupWindow: options.currentPopup
      };
    }
    const geometry = safeGeometry(options.geometry);
    const popupWindow = openerWindow.open("", POPUP_NAME, popupFeatures(geometry));
    if (!isPopupAlive(popupWindow)) {
      return {
        blocked: true,
        reused: false,
        popupWindow: null
      };
    }
    try {
      popupWindow.document.title = title;
    } catch {}
    return {
      blocked: false,
      reused: false,
      popupWindow
    };
  }
  function monitorPopupClosed(popupWindow, onClosed, intervalMs = 450) {
    if (!isPopupAlive(popupWindow)) {
      return { stop() {} };
    }
    const timer = setInterval(() => {
      if (popupWindow.closed) {
        clearInterval(timer);
        onClosed?.();
      }
    }, Math.max(200, Number(intervalMs || 0)));
    return {
      stop() {
        clearInterval(timer);
      }
    };
  }
  function closePopupWindow(popupWindow) {
    if (!isPopupAlive(popupWindow)) {
      return;
    }
    try {
      popupWindow.close();
    } catch {}
  }
  function capturePopupGeometry(popupWindow) {
    if (!isPopupAlive(popupWindow)) {
      return null;
    }
    return safeGeometry({
      width: popupWindow.outerWidth,
      height: popupWindow.outerHeight,
      left: popupWindow.screenX,
      top: popupWindow.screenY
    });
  }

  // src/ui/dom.js
  function appendChildren(element, children = []) {
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false) {
        continue;
      }
      if (typeof child === "string") {
        element.append(child);
      } else {
        element.append(child);
      }
    }
    return element;
  }
  function createNode(document, tagName, options = {}, children = []) {
    const element = document.createElement(tagName);
    if (options.className) {
      element.className = options.className;
    }
    if (options.text !== undefined) {
      element.textContent = String(options.text);
    }
    if (options.value !== undefined) {
      element.value = String(options.value);
    }
    if (options.type !== undefined) {
      element.type = options.type;
    }
    if (options.name !== undefined) {
      element.name = options.name;
    }
    if (options.id !== undefined) {
      element.id = options.id;
    }
    if (options.part !== undefined) {
      element.part = options.part;
    }
    if (options.attrs) {
      for (const [name, value] of Object.entries(options.attrs)) {
        if (value === null || value === undefined || value === false) {
          continue;
        }
        element.setAttribute(name, value === true ? "" : String(value));
      }
    }
    if (options.dataset) {
      for (const [name, value] of Object.entries(options.dataset)) {
        if (value !== undefined) {
          element.dataset[name] = String(value);
        }
      }
    }
    if (options.style) {
      Object.assign(element.style, options.style);
    }
    if (options.on) {
      for (const [eventName, handler] of Object.entries(options.on)) {
        element.addEventListener(eventName, handler);
      }
    }
    if (options.properties) {
      Object.assign(element, options.properties);
    }
    appendChildren(element, children);
    return element;
  }
  function replaceChildren(element, children = []) {
    element.replaceChildren();
    appendChildren(element, children);
    return element;
  }
  function createButton(document, options = {}, children = []) {
    return createNode(document, "button", {
      type: "button",
      ...options
    }, children);
  }
  function createInput(document, options = {}) {
    return createNode(document, "input", options);
  }
  function createTextarea(document, options = {}) {
    return createNode(document, "textarea", options);
  }
  function createSection(document, options = {}, children = []) {
    return createNode(document, "section", options, children);
  }

  // src/ui/styles.js
  function getToolStyles() {
    return `
    :host {
      all: initial;
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      pointer-events: none;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    .${TOOL_NAMESPACE}-shell,
    .${TOOL_NAMESPACE}-shell * {
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.35;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    .${TOOL_NAMESPACE}-shell {
      position: fixed;
      inset: 0;
      pointer-events: none;
      color: var(--tool-text);
      --tool-radius-window: 16px;
      --tool-radius-panel: 12px;
      --tool-shadow: 0 18px 50px rgba(0, 0, 0, 0.26);
      --tool-window-bg: #ececec;
      --tool-window-panel: #f6f6f6;
      --tool-title-bg: linear-gradient(180deg, #fafafa, #dcdcdc);
      --tool-title-text: #121212;
      --tool-toolbar-bg: #e6e6e6;
      --tool-footer-bg: #e4e4e4;
      --tool-text: #161616;
      --tool-muted: #595959;
      --tool-border: #bdbdbd;
      --tool-border-strong: #8f8f8f;
      --tool-input-bg: #ffffff;
      --tool-button-bg: linear-gradient(180deg, #ffffff, #dddddd);
      --tool-button-active: linear-gradient(180deg, #d8ebff, #9bc0f1);
      --tool-button-text: #181818;
      --tool-focus: #0a84ff;
      --tool-list-selected: #dcecff;
      --tool-code-bg: #f4f4f4;
      --tool-code-text: #17212b;
      --tool-success: #1f7a48;
      --tool-warning: #9a5a00;
      --tool-danger: #9b2c2c;
      --tool-accent: #0a84ff;
      --tool-title-height: 38px;
      --tool-toolbar-height: 42px;
    }

    .${TOOL_NAMESPACE}-shell.theme-macos {
      --tool-radius-window: 18px;
      --tool-radius-panel: 13px;
      --tool-shadow: 0 24px 68px rgba(15, 18, 30, 0.24);
      --tool-window-bg: rgba(243, 243, 245, 0.98);
      --tool-window-panel: rgba(250, 250, 252, 0.98);
      --tool-title-bg: linear-gradient(180deg, rgba(249, 249, 251, 0.98), rgba(226, 226, 230, 0.98));
      --tool-title-text: #1e1e20;
      --tool-toolbar-bg: rgba(239, 239, 242, 0.98);
      --tool-footer-bg: rgba(238, 238, 241, 0.98);
      --tool-text: #1f2227;
      --tool-muted: #69707a;
      --tool-border: rgba(59, 63, 73, 0.2);
      --tool-border-strong: rgba(59, 63, 73, 0.34);
      --tool-input-bg: rgba(255, 255, 255, 0.96);
      --tool-button-bg: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(229, 229, 233, 0.98));
      --tool-button-active: linear-gradient(180deg, #d9ebff, #abcaf7);
      --tool-focus: #0a84ff;
      --tool-list-selected: rgba(10, 132, 255, 0.14);
      --tool-code-bg: #f1f4f7;
      --tool-code-text: #102030;
      --tool-accent: #0a84ff;
    }

    .${TOOL_NAMESPACE}-shell.theme-windows-xp {
      --tool-radius-window: 9px;
      --tool-radius-panel: 8px;
      --tool-shadow: 0 18px 56px rgba(1, 20, 55, 0.38);
      --tool-window-bg: #ece9d8;
      --tool-window-panel: #f7f3e8;
      --tool-title-bg: linear-gradient(180deg, #2d78d6, #0b4fb3);
      --tool-title-text: #ffffff;
      --tool-toolbar-bg: #dfd8c3;
      --tool-footer-bg: #ddd6c1;
      --tool-text: #101820;
      --tool-muted: #544e42;
      --tool-border: #7f9db9;
      --tool-border-strong: #315b8d;
      --tool-input-bg: #ffffff;
      --tool-button-bg: linear-gradient(180deg, #fffef9, #d9d3c3);
      --tool-button-active: linear-gradient(180deg, #d7e6fb, #8db5e7);
      --tool-focus: #225db4;
      --tool-list-selected: rgba(76, 128, 196, 0.22);
      --tool-code-bg: #f5f5f5;
      --tool-code-text: #16212d;
      --tool-success: #1b6f34;
      --tool-warning: #8d5c00;
      --tool-danger: #8c1f15;
      --tool-accent: #1a5fb8;
      --tool-title-height: 32px;
      --tool-toolbar-height: 38px;
    }

    .${TOOL_NAMESPACE}-window {
      position: absolute;
      pointer-events: auto;
      display: grid;
      grid-template-rows: var(--tool-title-height) var(--tool-toolbar-height) minmax(0, 1fr) auto;
      min-width: 320px;
      min-height: 360px;
      background: var(--tool-window-bg);
      border: 1px solid var(--tool-border-strong);
      border-radius: var(--tool-radius-window);
      box-shadow: var(--tool-shadow);
      overflow: hidden;
      color: var(--tool-text);
      user-select: none;
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-window {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      min-width: 0;
      min-height: 0;
      border-radius: 0;
      border: 0;
      box-shadow: none;
      background: linear-gradient(180deg, #f3f4f8 0%, #ecedf2 100%);
      grid-template-rows: 46px var(--tool-toolbar-height) minmax(0, 1fr) 44px;
    }

    .${TOOL_NAMESPACE}-titlebar,
    .${TOOL_NAMESPACE}-toolbar,
    .${TOOL_NAMESPACE}-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 10px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-titlebar {
      display: grid;
      background: var(--tool-title-bg);
      color: var(--tool-title-text);
      border-bottom: 1px solid var(--tool-border-strong);
      cursor: move;
      grid-template-columns: auto minmax(0, 1fr) auto;
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-titlebar {
      cursor: default;
      grid-template-columns: minmax(0, 1fr) auto;
      min-height: 46px;
      padding: 0 14px;
      background: linear-gradient(180deg, #ffffff 0%, #eceef5 100%);
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-titlebar > .${TOOL_NAMESPACE}-chrome:first-child {
      display: none;
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-toolbar {
      padding: 0 14px;
      min-height: 42px;
      border-top: 1px solid color-mix(in srgb, var(--tool-border-strong) 42%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--tool-border-strong) 58%, transparent);
      background: linear-gradient(180deg, #f7f8fc 0%, #eceff6 100%);
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-main {
      padding: 10px;
      gap: 10px;
      background: linear-gradient(180deg, #f4f5f9 0%, #eeeff4 100%);
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-navigator,
    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-inspector {
      border: 1px solid color-mix(in srgb, var(--tool-border-strong) 44%, transparent);
      border-radius: 10px;
      background: color-mix(in srgb, var(--tool-window-panel) 82%, white 18%);
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-navigator {
      border-right: 1px solid color-mix(in srgb, var(--tool-border-strong) 44%, transparent);
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-footer {
      padding: 0 14px;
      min-height: 44px;
      border-top: 1px solid color-mix(in srgb, var(--tool-border-strong) 58%, transparent);
      background: linear-gradient(180deg, #f7f8fc 0%, #eceff6 100%);
    }

    .${TOOL_NAMESPACE}-titlemeta {
      min-width: 0;
      display: grid;
      gap: 1px;
    }

    .${TOOL_NAMESPACE}-title {
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .${TOOL_NAMESPACE}-subtitle {
      font-size: 11px;
      color: color-mix(in srgb, var(--tool-title-text) 78%, transparent);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .${TOOL_NAMESPACE}-chrome {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: none;
    }

    .${TOOL_NAMESPACE}-traffic {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      border: 1px solid rgba(0, 0, 0, 0.18);
      background: #ff5f57;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.55);
    }

    .${TOOL_NAMESPACE}-traffic[data-kind="min"] {
      background: #febc2e;
    }

    .${TOOL_NAMESPACE}-traffic[data-kind="zoom"] {
      background: #28c840;
    }

    .${TOOL_NAMESPACE}-toolbar {
      display: flex;
      background: var(--tool-toolbar-bg);
      border-bottom: 1px solid var(--tool-border);
      justify-content: space-between;
    }

    .${TOOL_NAMESPACE}-toolbar-group,
    .${TOOL_NAMESPACE}-actions,
    .${TOOL_NAMESPACE}-statline,
    .${TOOL_NAMESPACE}-footer-group {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-main {
      min-height: 0;
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(255px, 290px) minmax(0, 1fr);
      background: var(--tool-window-panel);
    }

    .${TOOL_NAMESPACE}-pane {
      min-width: 0;
      min-height: 0;
      overflow: auto;
      padding: 8px;
      display: grid;
      align-content: start;
      gap: 8px;
    }

    .${TOOL_NAMESPACE}-navigator {
      border-right: 1px solid var(--tool-border);
      background: color-mix(in srgb, var(--tool-window-panel) 86%, white 14%);
    }

    .${TOOL_NAMESPACE}-inspector {
      background: var(--tool-window-panel);
    }

    .${TOOL_NAMESPACE}-panel {
      border: 1px solid var(--tool-border);
      border-radius: var(--tool-radius-panel);
      background: color-mix(in srgb, var(--tool-window-panel) 70%, white 30%);
      padding: 8px;
      display: grid;
      gap: 7px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-panel-label,
    .${TOOL_NAMESPACE}-micro {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--tool-muted);
    }

    .${TOOL_NAMESPACE}-button,
    .${TOOL_NAMESPACE}-field,
    .${TOOL_NAMESPACE}-selector-editor,
    .${TOOL_NAMESPACE}-search {
      appearance: none;
      border: 1px solid var(--tool-border-strong);
      border-radius: 8px;
      background: var(--tool-input-bg);
      color: var(--tool-text);
      font: inherit;
    }

    .${TOOL_NAMESPACE}-button {
      background: var(--tool-button-bg);
      color: var(--tool-button-text);
      min-height: 27px;
      padding: 0 9px;
      cursor: pointer;
      white-space: nowrap;
      touch-action: manipulation;
      -webkit-tap-highlight-color: rgba(10, 132, 255, 0.18);
    }

    .${TOOL_NAMESPACE}-button[data-active="true"] {
      background: var(--tool-button-active);
      border-color: color-mix(in srgb, var(--tool-focus) 70%, black 20%);
    }

    .${TOOL_NAMESPACE}-button[data-variant="ghost"] {
      background: transparent;
    }

    .${TOOL_NAMESPACE}-button[data-variant="danger"] {
      color: var(--tool-danger);
    }

    .${TOOL_NAMESPACE}-close {
      min-width: 28px;
      padding: 0;
    }

    .${TOOL_NAMESPACE}-close-text {
      min-width: auto;
      padding: 0 10px;
    }

    .${TOOL_NAMESPACE}-field,
    .${TOOL_NAMESPACE}-search,
    .${TOOL_NAMESPACE}-selector-editor {
      width: 100%;
      padding: 7px 9px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-field,
    .${TOOL_NAMESPACE}-search {
      min-height: 30px;
    }

    .${TOOL_NAMESPACE}-selector-editor,
    .${TOOL_NAMESPACE}-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: var(--tool-code-bg);
      color: var(--tool-code-text);
      white-space: pre;
      overflow: auto;
      resize: vertical;
      min-height: 64px;
    }

    .${TOOL_NAMESPACE}-selector-editor {
      line-height: 1.45;
      tab-size: 2;
      wrap: off;
    }

    .${TOOL_NAMESPACE}-stack,
    .${TOOL_NAMESPACE}-list {
      display: grid;
      gap: 8px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-selected-list {
      max-height: 100%;
      overflow: auto;
      align-content: start;
      gap: 8px;
    }

    .${TOOL_NAMESPACE}-object-group {
      display: grid;
      gap: 6px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-object-group-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 2px 4px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.03em;
      color: var(--tool-muted);
      text-transform: uppercase;
    }

    .${TOOL_NAMESPACE}-object-row,
    .${TOOL_NAMESPACE}-alt-row {
      width: 100%;
      display: grid;
      gap: 4px;
      text-align: left;
      padding: 6px 8px;
      border-radius: 10px;
      border: 1px solid var(--tool-border);
      background: color-mix(in srgb, var(--tool-window-panel) 85%, white 15%);
      cursor: pointer;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-object-row-inner {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto auto auto;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-object-parent {
      font-size: 11px;
      color: var(--tool-muted);
      padding-left: 2px;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .${TOOL_NAMESPACE}-object-name {
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600;
    }

    .${TOOL_NAMESPACE}-object-chip {
      font-size: 11px;
      min-height: 19px;
      padding: 0 6px;
      border-radius: 999px;
      border: 1px solid var(--tool-border);
      color: var(--tool-muted);
      background: color-mix(in srgb, var(--tool-window-panel) 62%, white 38%);
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
    }

    .${TOOL_NAMESPACE}-object-remove {
      min-height: 19px;
      min-width: 19px;
      padding: 0;
      border-radius: 8px;
      border: 1px solid var(--tool-border);
      background: transparent;
      color: var(--tool-muted);
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
    }

    .${TOOL_NAMESPACE}-object-remove:hover {
      color: var(--tool-danger);
      border-color: color-mix(in srgb, var(--tool-danger) 60%, var(--tool-border-strong) 40%);
    }

    .${TOOL_NAMESPACE}-object-row[data-selected="true"] {
      background: var(--tool-list-selected);
      border-color: color-mix(in srgb, var(--tool-focus) 55%, var(--tool-border-strong) 45%);
    }

    .${TOOL_NAMESPACE}-row-head,
    .${TOOL_NAMESPACE}-summary-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-truncate {
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .${TOOL_NAMESPACE}-muted {
      color: var(--tool-muted);
      font-size: 12px;
    }

    .${TOOL_NAMESPACE}-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 21px;
      padding: 0 7px;
      border-radius: 999px;
      border: 1px solid var(--tool-border);
      background: color-mix(in srgb, var(--tool-window-panel) 66%, white 34%);
      color: var(--tool-muted);
      font-size: 11px;
      white-space: nowrap;
    }

    .${TOOL_NAMESPACE}-pill[data-tone="good"] {
      color: var(--tool-success);
    }

    .${TOOL_NAMESPACE}-pill[data-tone="warn"] {
      color: var(--tool-warning);
    }

    .${TOOL_NAMESPACE}-pill[data-tone="bad"] {
      color: var(--tool-danger);
    }

    .${TOOL_NAMESPACE}-footer {
      min-height: 42px;
      background: var(--tool-footer-bg);
      border-top: 1px solid var(--tool-border);
      justify-content: space-between;
    }

    .${TOOL_NAMESPACE}-status {
      font-size: 12px;
      color: var(--tool-muted);
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .${TOOL_NAMESPACE}-heuristic-anchor {
      position: static;
      min-width: 0;
    }

    .${TOOL_NAMESPACE}-popover {
      position: static;
      margin-top: 6px;
      display: grid;
      gap: 6px;
      padding: 6px;
      border: 1px solid var(--tool-border-strong);
      border-radius: 8px;
      background: color-mix(in srgb, var(--tool-window-panel) 80%, white 20%);
    }

    .${TOOL_NAMESPACE}-heuristic-list {
      max-height: 176px;
      overflow: auto;
      display: grid;
      gap: 4px;
    }

    .${TOOL_NAMESPACE}-heuristic-option {
      display: grid;
      gap: 2px;
      text-align: left;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid var(--tool-border);
      background: var(--tool-input-bg);
      cursor: pointer;
    }

    .${TOOL_NAMESPACE}-search {
      min-height: 28px;
      padding: 5px 8px;
    }

    .${TOOL_NAMESPACE}-alt-row .${TOOL_NAMESPACE}-selector-editor {
      min-height: 40px;
      resize: none;
      padding: 6px 8px;
    }

    .${TOOL_NAMESPACE}-heuristic-option[data-selected="true"] {
      background: var(--tool-list-selected);
      border-color: color-mix(in srgb, var(--tool-focus) 55%, var(--tool-border-strong) 45%);
    }

    .${TOOL_NAMESPACE}-resize {
      position: absolute;
      background: transparent;
      pointer-events: auto;
      z-index: 5;
    }

    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-traffic,
    .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-resize {
      display: none;
    }

    .${TOOL_NAMESPACE}-resize[data-edge="n"],
    .${TOOL_NAMESPACE}-resize[data-edge="s"] {
      left: 10px;
      right: 10px;
      height: 10px;
      cursor: ns-resize;
    }

    .${TOOL_NAMESPACE}-resize[data-edge="n"] { top: -5px; }
    .${TOOL_NAMESPACE}-resize[data-edge="s"] { bottom: -5px; }

    .${TOOL_NAMESPACE}-resize[data-edge="e"],
    .${TOOL_NAMESPACE}-resize[data-edge="w"] {
      top: 10px;
      bottom: 10px;
      width: 10px;
      cursor: ew-resize;
    }

    .${TOOL_NAMESPACE}-resize[data-edge="e"] { right: -5px; }
    .${TOOL_NAMESPACE}-resize[data-edge="w"] { left: -5px; }

    .${TOOL_NAMESPACE}-resize[data-edge="ne"],
    .${TOOL_NAMESPACE}-resize[data-edge="nw"],
    .${TOOL_NAMESPACE}-resize[data-edge="se"],
    .${TOOL_NAMESPACE}-resize[data-edge="sw"] {
      width: 14px;
      height: 14px;
    }

    .${TOOL_NAMESPACE}-resize[data-edge="ne"] { top: -7px; right: -7px; cursor: nesw-resize; }
    .${TOOL_NAMESPACE}-resize[data-edge="nw"] { top: -7px; left: -7px; cursor: nwse-resize; }
    .${TOOL_NAMESPACE}-resize[data-edge="se"] { bottom: -7px; right: -7px; cursor: nwse-resize; }
    .${TOOL_NAMESPACE}-resize[data-edge="sw"] { bottom: -7px; left: -7px; cursor: nesw-resize; }

    .${TOOL_NAMESPACE}-empty {
      padding: 10px;
      border: 1px dashed var(--tool-border);
      border-radius: 10px;
      color: var(--tool-muted);
      font-size: 12px;
    }

    .${TOOL_NAMESPACE}-window:focus-within {
      outline: 1px solid color-mix(in srgb, var(--tool-focus) 55%, transparent);
      outline-offset: -1px;
    }

    .${TOOL_NAMESPACE}-button:focus-visible,
    .${TOOL_NAMESPACE}-field:focus-visible,
    .${TOOL_NAMESPACE}-search:focus-visible,
    .${TOOL_NAMESPACE}-selector-editor:focus-visible,
    .${TOOL_NAMESPACE}-object-row:focus-visible,
    .${TOOL_NAMESPACE}-alt-row:focus-visible,
    .${TOOL_NAMESPACE}-heuristic-option:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--tool-focus) 75%, white 25%);
      outline-offset: 1px;
    }

    @media (max-width: 760px) {
      .${TOOL_NAMESPACE}-main {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(150px, 190px) minmax(0, 1fr);
      }

      .${TOOL_NAMESPACE}-navigator {
        border-right: 0;
        border-bottom: 1px solid var(--tool-border);
      }

      .${TOOL_NAMESPACE}-shell[data-host-mode="popup"] .${TOOL_NAMESPACE}-main {
        padding: 8px;
      }
    }
  `;
  }

  // src/overlay.js
  var WINDOW_MIN_WIDTH = 360;
  var WINDOW_MIN_HEIGHT = 420;
  var WINDOW_DEFAULT_WIDTH = 520;
  var WINDOW_DEFAULT_HEIGHT = 680;
  var WINDOW_MARGIN = 12;
  var TITLE_VISIBLE_WIDTH = 180;
  var POPUP_MONITOR_INTERVAL_MS = 450;
  function createToolNode(document, tagName, options = {}, children = []) {
    const element = createNode(document, tagName, {
      ...options,
      attrs: {
        [TOOL_IGNORE_ATTRIBUTE]: "true",
        ...options.attrs ?? {}
      }
    }, children);
    return element;
  }
  function setRectStyle(element, rect) {
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
  }
  function setOverlayStyle(element, style) {
    Object.assign(element.style, style);
  }
  function liveRect(element, fallbackRect = null) {
    if (typeof element?.getBoundingClientRect === "function") {
      return rectFrom(element.getBoundingClientRect());
    }
    return rectFrom(fallbackRect ?? {});
  }
  function groupedKinds() {
    return [
      { kind: "region", label: "Regions" },
      { kind: "control", label: "Controls" },
      { kind: "collection", label: "Collections" },
      { kind: "content", label: "Content" }
    ];
  }
  function viewportFrame(windowObject) {
    return {
      width: Math.max(320, windowObject.innerWidth),
      height: Math.max(320, windowObject.innerHeight)
    };
  }
  function clampFrame(frame, windowObject) {
    const viewport = viewportFrame(windowObject);
    const minWidth = Math.min(Math.max(320, viewport.width - WINDOW_MARGIN * 2), WINDOW_MIN_WIDTH);
    const minHeight = Math.min(Math.max(320, viewport.height - WINDOW_MARGIN * 2), WINDOW_MIN_HEIGHT);
    const width = Math.min(Math.max(frame.width, minWidth), Math.max(minWidth, viewport.width - WINDOW_MARGIN * 2));
    const height = Math.min(Math.max(frame.height, minHeight), Math.max(minHeight, viewport.height - WINDOW_MARGIN * 2));
    const left = Math.min(viewport.width - WINDOW_MARGIN - Math.min(TITLE_VISIBLE_WIDTH, width), Math.max(WINDOW_MARGIN - width + TITLE_VISIBLE_WIDTH, frame.left));
    const top = Math.min(viewport.height - 40, Math.max(WINDOW_MARGIN, frame.top));
    return {
      left,
      top,
      width,
      height
    };
  }
  function defaultFrame(windowObject) {
    const viewport = viewportFrame(windowObject);
    return clampFrame({
      width: Math.min(WINDOW_DEFAULT_WIDTH, viewport.width - WINDOW_MARGIN * 2),
      height: Math.min(WINDOW_DEFAULT_HEIGHT, viewport.height - WINDOW_MARGIN * 2),
      left: Math.max(WINDOW_MARGIN, viewport.width - WINDOW_DEFAULT_WIDTH - 28),
      top: WINDOW_MARGIN + 8
    }, windowObject);
  }
  function detectSelectorType(selector) {
    return selector.trim().startsWith("/") || selector.trim().startsWith("(") ? "xpath" : "css";
  }
  function describeSelection(objectModel) {
    return `${objectModel.kind} · ${objectModel.inferredType} · ${(objectModel.confidence * 100).toFixed(0)}%`;
  }
  function pickAreaRect(start, end) {
    const left = Math.min(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const right = Math.max(start.x, end.x);
    const bottom = Math.max(start.y, end.y);
    return rectFrom({ left, top, right, bottom, width: right - left, height: bottom - top });
  }
  function readableError(error) {
    return `Error: ${serializeError(error)}`;
  }
  function buildPageContext(windowObject, documentObject) {
    return {
      toolVersion: "0.1.0",
      url: windowObject.location.href,
      title: documentObject.title,
      timestamp: new Date().toISOString(),
      viewport: {
        width: windowObject.innerWidth,
        height: windowObject.innerHeight
      }
    };
  }
  function createOverlayApp(windowObject = window) {
    const documentObject = windowObject.document;
    const savedState = loadSessionSnapshot(windowObject);
    const state = createInitialSessionState(windowObject, { savedState });
    state.frame = clampFrame(savedState?.frame ?? defaultFrame(windowObject), windowObject);
    state.popupGeometry = state.popupGeometry ?? null;
    state.sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    state.popupMonitor = null;
    state.popupBeforeUnloadHandler = null;
    state.popupBlurCleanup = null;
    state.overlayRefreshRequested = false;
    const refs = {};
    function persistWindowState() {
      saveSessionSnapshot(windowObject, state);
    }
    function applyWindowFrame() {
      if (!refs.window || state.hostMode === "popup") {
        return;
      }
      state.frame = clampFrame(state.frame, windowObject);
      refs.window.style.left = `${state.frame.left}px`;
      refs.window.style.top = `${state.frame.top}px`;
      refs.window.style.width = `${state.frame.width}px`;
      refs.window.style.height = `${state.frame.height}px`;
      persistWindowState();
    }
    function clearWindowFrameStyles() {
      if (!refs.window) {
        return;
      }
      refs.window.style.left = "";
      refs.window.style.top = "";
      refs.window.style.width = "";
      refs.window.style.height = "";
    }
    function setStatus(message) {
      state.statusMessage = message;
      if (refs.status) {
        refs.status.textContent = message;
      }
      if (refs.subtitle) {
        refs.subtitle.textContent = `${state.mode} mode · ${state.selectedObjects.length} selected`;
      }
    }
    function selectedObject() {
      return state.selectedObjects.find((item) => item.id === state.selectedObjectId) ?? null;
    }
    function trackSessionChange() {
      markSessionChanged(state);
      persistWindowState();
    }
    function clearMatches() {
      refs.matchLayer?.replaceChildren();
    }
    function clearHover() {
      state.hoverRecord = null;
      if (refs.highlight) {
        refs.highlight.style.display = "none";
      }
      scheduleOverlayRefresh();
    }
    function resolveObjectElement(objectModel) {
      if (!objectModel) {
        return null;
      }
      if (objectModel.element && objectModel.element.ownerDocument === documentObject) {
        return objectModel.element;
      }
      if (!objectModel.selector) {
        return null;
      }
      try {
        if (objectModel.selectorType === "css") {
          objectModel.element = documentObject.querySelector(objectModel.selector);
        } else {
          const result = documentObject.evaluate(objectModel.selector, documentObject, null, windowObject.XPathResult.FIRST_ORDERED_NODE_TYPE, null);
          objectModel.element = result.singleNodeValue;
        }
      } catch {
        objectModel.element = null;
      }
      return objectModel.element ?? null;
    }
    function renderSelectedHighlights() {
      if (!refs.selectionLayer) {
        return;
      }
      const markers = [];
      for (const objectModel of state.selectedObjects.slice(0, 18)) {
        const element = resolveObjectElement(objectModel);
        if (!element) {
          continue;
        }
        const rect = liveRect(element, objectModel.features?.boundingRect);
        if (!rect.width || !rect.height) {
          continue;
        }
        const marker = createToolNode(documentObject, "div", {
          attrs: { "data-overlay-role": "selected" }
        });
        setOverlayStyle(marker, {
          position: "fixed",
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          borderRadius: "8px",
          border: objectModel.id === state.selectedObjectId ? "2px solid rgba(30, 188, 121, 0.95)" : "1px solid rgba(38, 167, 235, 0.88)",
          background: objectModel.id === state.selectedObjectId ? "rgba(30, 188, 121, 0.12)" : "rgba(38, 167, 235, 0.08)",
          pointerEvents: "none"
        });
        markers.push(marker);
      }
      replaceChildren(refs.selectionLayer, markers);
    }
    function renderHoverHighlight() {
      if (!refs.highlight) {
        return;
      }
      const hoverElement = state.hoverRecord?.element ?? null;
      if (!hoverElement) {
        refs.highlight.style.display = "none";
        return;
      }
      const rect = liveRect(hoverElement, state.hoverRecord?.features?.boundingRect);
      if (!rect.width || !rect.height) {
        refs.highlight.style.display = "none";
        return;
      }
      refs.highlight.style.display = "block";
      setRectStyle(refs.highlight, rect);
    }
    function refreshOverlayGeometry() {
      state.overlayRefreshRequested = false;
      renderHoverHighlight();
      renderSelectedHighlights();
    }
    function scheduleOverlayRefresh() {
      if (state.overlayRefreshRequested) {
        return;
      }
      state.overlayRefreshRequested = true;
      const schedule = typeof windowObject.requestAnimationFrame === "function" ? windowObject.requestAnimationFrame.bind(windowObject) : (callback) => windowObject.setTimeout(callback, 16);
      schedule(() => {
        refreshOverlayGeometry();
      });
    }
    function onOverlayLayoutEvent() {
      scheduleOverlayRefresh();
    }
    function applyTheme() {
      const meta = getThemeMeta(state.themeId);
      refs.shell.classList.remove("theme-macos", "theme-windows-xp");
      refs.shell.classList.add(meta.className);
      refs.themeButton.textContent = "Theme";
      refs.themeButton.title = `Switch theme (current: ${meta.label})`;
      persistWindowState();
    }
    function applyHostModeUi() {
      if (!refs.shell || !refs.window) {
        return;
      }
      refs.shell.dataset.hostMode = state.hostMode;
      refs.window.dataset.hostMode = state.hostMode;
      if (refs.openPopupButton) {
        refs.openPopupButton.hidden = state.hostMode !== "inline";
      }
      if (refs.returnToPageButton) {
        refs.returnToPageButton.hidden = state.hostMode !== "popup";
      }
      if (refs.focusPageButton) {
        refs.focusPageButton.hidden = state.hostMode !== "popup";
      }
      refs.closeButton.textContent = state.hostMode === "popup" ? "Close recorder" : "×";
      refs.closeButton.classList.toggle(`${TOOL_NAMESPACE}-close-text`, state.hostMode === "popup");
      if (state.hostMode === "popup") {
        clearWindowFrameStyles();
      } else {
        applyWindowFrame();
      }
      persistWindowState();
    }
    function stopPopupMonitor() {
      state.popupMonitor?.stop?.();
      state.popupMonitor = null;
      if (state.popupWindow && state.popupBeforeUnloadHandler) {
        try {
          state.popupWindow.removeEventListener("beforeunload", state.popupBeforeUnloadHandler);
        } catch {}
      }
      state.popupBeforeUnloadHandler = null;
    }
    function setPopupTitle(popupWindow) {
      if (!popupWindow?.document) {
        return;
      }
      const inspectedTitle = normalizeWhitespace(documentObject.title) || normalizeWhitespace(windowObject.location.hostname);
      popupWindow.document.title = `Page Object Recorder - ${inspectedTitle || "Page"}`;
    }
    function preparePopupDocument(popupWindow) {
      const popupDocument = popupWindow.document;
      popupDocument.documentElement.style.margin = "0";
      popupDocument.documentElement.style.width = "100%";
      popupDocument.documentElement.style.height = "100%";
      popupDocument.documentElement.style.overflow = "hidden";
      popupDocument.body.style.margin = "0";
      popupDocument.body.style.width = "100%";
      popupDocument.body.style.minHeight = "100vh";
      popupDocument.body.style.height = "100%";
      popupDocument.body.style.overflow = "hidden";
      popupDocument.body.style.background = "linear-gradient(180deg, #ececef 0%, #e4e5e9 100%)";
      popupDocument.documentElement.style.minHeight = "100vh";
      popupDocument.documentElement.style.background = "#e7e8ec";
      setPopupTitle(popupWindow);
    }
    function moveHostToDocument(targetDocument) {
      if (!refs.host || !targetDocument) {
        return;
      }
      if (refs.host.ownerDocument === targetDocument && refs.host.isConnected) {
        return;
      }
      targetDocument.documentElement.append(refs.host);
    }
    function restoreInlineHost(reason = "popup-closed") {
      if (state.hostMode !== "popup") {
        return;
      }
      if (state.popupWindow) {
        state.popupGeometry = capturePopupGeometry(state.popupWindow) ?? state.popupGeometry;
      }
      stopPopupMonitor();
      moveHostToDocument(documentObject);
      state.popupWindow = null;
      state.hostMode = "inline";
      applyHostModeUi();
      render();
      if (reason === "popup-native-close") {
        setStatus("Popup closed. Recorder was restored to the page.");
      }
    }
    function watchPopupWindow(popupWindow) {
      stopPopupMonitor();
      state.popupBeforeUnloadHandler = (event) => {
        if (!isSessionDirty(state)) {
          return;
        }
        event.preventDefault();
        event.returnValue = "";
      };
      popupWindow.addEventListener("beforeunload", state.popupBeforeUnloadHandler);
      state.popupMonitor = monitorPopupClosed(popupWindow, () => {
        if (state.popupCloseReason === "return-inline" || state.popupCloseReason === "session-destroy") {
          state.popupCloseReason = null;
          return;
        }
        restoreInlineHost("popup-native-close");
      }, POPUP_MONITOR_INTERVAL_MS);
    }
    function openInPopupWindow() {
      if (state.mode === "area" && state.dragSelection) {
        state.dragSelection = null;
        refs.dragBox.style.display = "none";
        clearAreaPreview();
      }
      const popup = openRecorderPopup(windowObject, {
        currentPopup: state.popupWindow,
        geometry: state.popupGeometry ?? undefined,
        title: "Page Object Recorder"
      });
      if (popup.blocked || !popup.popupWindow) {
        setStatus("Popup window was blocked by the browser. Allow popups for this page and try again.");
        render();
        return;
      }
      const popupWindow = popup.popupWindow;
      state.popupWindow = popupWindow;
      state.popupCloseReason = null;
      preparePopupDocument(popupWindow);
      moveHostToDocument(popupWindow.document);
      state.hostMode = "popup";
      applyHostModeUi();
      watchPopupWindow(popupWindow);
      popupWindow.focus?.();
      setStatus(popup.reused ? "Recorder popup focused." : "Recorder detached into popup window.");
      render();
    }
    function returnToInlineFromPopup() {
      if (state.hostMode !== "popup") {
        return;
      }
      const popupWindow = state.popupWindow;
      state.popupCloseReason = "return-inline";
      restoreInlineHost("return-inline");
      closePopupWindow(popupWindow);
      setStatus("Recorder returned to the page.");
      render();
    }
    function assignExistingParent(objectModel) {
      const parent = state.selectedObjects.filter((item) => item.kind === "region" && item.id !== objectModel.id).find((item) => {
        const outer = item.features.boundingRect;
        const inner = objectModel.features.boundingRect;
        return inner.left >= outer.left && inner.right <= outer.right && inner.top >= outer.top && inner.bottom <= outer.bottom;
      });
      if (!parent) {
        return;
      }
      objectModel.parentId = parent.id;
      if (!parent.children.includes(objectModel.id)) {
        parent.children.push(objectModel.id);
      }
    }
    function applySelectorState(objectModel, options = {}) {
      const parentObject = objectModel.parentId ? state.selectedObjects.find((item) => item.id === objectModel.parentId) ?? null : null;
      const selectorState = buildSelectorState(objectModel, {
        heuristicId: options.heuristicId ?? objectModel.heuristicId ?? chooseAutomaticHeuristic(objectModel),
        manualSelector: options.manualSelector ?? objectModel.manualSelector,
        manualSelectorType: options.manualSelectorType ?? objectModel.manualSelectorType ?? detectSelectorType(objectModel.selector ?? ""),
        scope: documentObject,
        parentObject
      });
      objectModel.heuristicId = selectorState.heuristicId;
      objectModel.selector = selectorState.preferred.selector;
      objectModel.selectorType = selectorState.preferred.selectorType;
      objectModel.selectorScore = selectorState.preferred.score;
      objectModel.alternativeSelectors = selectorState.alternatives;
      objectModel.selectorTest = selectorState.testResult;
      if (objectModel.kind === "collection" && objectModel.collection) {
        objectModel.collection.itemSelector = selectorState.preferred.selector;
        objectModel.collection.itemSelectorScore = selectorState.preferred.score;
      }
    }
    function refreshScanRecords() {
      state.scanRecords = scanDocument(documentObject).map((record) => {
        const model = createObjectModel({
          element: record.element,
          features: record.features,
          existingNames: []
        });
        return {
          ...record,
          kind: model.kind,
          inferredType: model.inferredType,
          confidence: model.confidence,
          explanation: model.explanation
        };
      });
      setStatus(`Scanned ${state.scanRecords.length} meaningful candidates in the visible page.`);
      render();
    }
    function makeObjectFromRecord(record, context = {}) {
      const objectModel = createObjectModel({
        element: record.element,
        features: record.features,
        context,
        existingNames: state.selectedObjects.map((item) => item.name)
      });
      objectModel.id = `object-${state.counter++}`;
      return objectModel;
    }
    function saveObject(objectModel, options = {}) {
      assignExistingParent(objectModel);
      applySelectorState(objectModel, options);
      state.selectedObjects.push(objectModel);
      state.selectedObjectId = objectModel.id;
      trackSessionChange();
      setStatus(`Selected ${objectModel.name} (${describeSelection(objectModel)}).`);
      render();
    }
    function removeObjectById(objectId) {
      const exists = state.selectedObjects.find((item) => item.id === objectId);
      if (!exists) {
        return;
      }
      state.selectedObjects = state.selectedObjects.filter((item) => item.id !== objectId);
      for (const objectModel of state.selectedObjects) {
        if (objectModel.parentId === objectId) {
          objectModel.parentId = null;
        }
        objectModel.children = (objectModel.children ?? []).filter((childId) => childId !== objectId);
      }
      if (state.selectedObjectId === objectId) {
        state.selectedObjectId = state.selectedObjects[0]?.id ?? null;
      }
      clearMatches();
      trackSessionChange();
      setStatus(`Removed ${exists.name} from selected objects.`);
      render();
    }
    function inspectElement(element) {
      if (!element || element.closest?.(`[${TOOL_IGNORE_ATTRIBUTE}="true"]`)) {
        clearHover();
        return;
      }
      const record = state.scanRecords.find((item) => item.element === element) ?? {
        element,
        features: scanDocument({ body: element, querySelectorAll: () => [] })[0]?.features
      };
      if (!record.features) {
        clearHover();
        return;
      }
      const model = createObjectModel({
        element,
        features: record.features,
        existingNames: []
      });
      state.hoverRecord = {
        ...record,
        kind: record.kind ?? model.kind,
        inferredType: record.inferredType ?? model.inferredType,
        confidence: record.confidence ?? model.confidence
      };
      scheduleOverlayRefresh();
      setStatus(`Hover ${state.hoverRecord.inferredType} · ${(state.hoverRecord.confidence * 100).toFixed(0)}% confidence`);
    }
    function runSelectorTest(objectModel) {
      clearMatches();
      if (!objectModel.selector) {
        objectModel.selectorTest = {
          matchCount: 0,
          score: 0,
          scope: objectModel.parentId ? "parent" : "document",
          error: "No selector"
        };
        render();
        return;
      }
      let nodes = [];
      try {
        if (objectModel.selectorType === "css") {
          nodes = Array.from(documentObject.querySelectorAll(objectModel.selector));
        } else {
          const result = documentObject.evaluate(objectModel.selector, documentObject, null, windowObject.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          for (let index = 0;index < result.snapshotLength; index += 1) {
            nodes.push(result.snapshotItem(index));
          }
        }
        objectModel.selectorTest = {
          matchCount: nodes.length,
          score: objectModel.selectorScore,
          scope: objectModel.parentId ? "parent" : "document"
        };
        for (const node of nodes.slice(0, 12)) {
          if (!node?.getBoundingClientRect) {
            continue;
          }
          const marker = createToolNode(documentObject, "div", {
            className: `${TOOL_NAMESPACE}-match`
          });
          setRectStyle(marker, rectFrom(node.getBoundingClientRect()));
          refs.matchLayer.append(marker);
        }
        setStatus(`Selector test matched ${nodes.length} element${nodes.length === 1 ? "" : "s"}.`);
      } catch (error) {
        objectModel.selectorTest = {
          matchCount: 0,
          score: objectModel.selectorScore,
          scope: objectModel.parentId ? "parent" : "document",
          error: serializeError(error)
        };
        setStatus(readableError(error));
      }
      trackSessionChange();
      render();
    }
    function clearAreaPreview() {
      refs.areaLayer?.replaceChildren();
    }
    function renderAreaPreview(areaRect) {
      if (!refs.areaLayer) {
        return;
      }
      const overlapping = previewAreaCandidates(state.scanRecords.map((record) => ({
        ...record,
        element: record.element
      })), areaRect, 24);
      replaceChildren(refs.areaLayer, overlapping.map((record) => {
        const marker = createToolNode(documentObject, "div");
        const rect = liveRect(record.element, record.features?.boundingRect);
        setOverlayStyle(marker, {
          position: "fixed",
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          borderRadius: "8px",
          border: "1px solid rgba(243, 145, 26, 0.84)",
          background: "rgba(243, 145, 26, 0.13)",
          pointerEvents: "none"
        });
        return marker;
      }));
    }
    function updateExportText(copyToClipboard = false) {
      state.exportText = exportJsonText(state.selectedObjects, buildPageContext(windowObject, documentObject));
      refs.exportPreview.value = state.exportText;
      if (copyToClipboard) {
        windowObject.navigator.clipboard?.writeText(state.exportText).then(() => {
          markSessionExported(state);
          setStatus("Exported JSON copied to clipboard.");
        }, () => setStatus("Clipboard copy failed. JSON remains available in the export preview."));
      }
      persistWindowState();
    }
    function buildSummaryPills(objectModel) {
      const pills = [
        createToolNode(documentObject, "span", {
          className: `${TOOL_NAMESPACE}-pill`,
          text: objectModel.kind
        }),
        createToolNode(documentObject, "span", {
          className: `${TOOL_NAMESPACE}-pill`,
          text: objectModel.inferredType
        }),
        createToolNode(documentObject, "span", {
          className: `${TOOL_NAMESPACE}-pill`,
          text: `${(objectModel.confidence * 100).toFixed(0)}% confidence`
        })
      ];
      if (objectModel.parentId) {
        const parent = state.selectedObjects.find((item) => item.id === objectModel.parentId);
        if (parent) {
          pills.push(createToolNode(documentObject, "span", {
            className: `${TOOL_NAMESPACE}-pill`,
            text: `inside ${parent.name}`
          }));
        }
      }
      return pills;
    }
    function renderSelectedList() {
      if (!state.selectedObjects.length) {
        replaceChildren(refs.selectedList, [
          createToolNode(documentObject, "div", {
            className: `${TOOL_NAMESPACE}-empty`,
            text: "Use Select Element or Select Area to add page objects."
          })
        ]);
        return;
      }
      const groups = groupedKinds().map((group) => ({
        ...group,
        items: state.selectedObjects.filter((item) => item.kind === group.kind)
      })).filter((group) => group.items.length);
      replaceChildren(refs.selectedList, groups.map((group) => createToolNode(documentObject, "div", { className: `${TOOL_NAMESPACE}-object-group` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-object-group-head`,
          text: `${group.label} (${group.items.length})`
        }),
        ...group.items.map((objectModel) => {
          const row = createButton(documentObject, {
            className: `${TOOL_NAMESPACE}-object-row`,
            attrs: { [TOOL_IGNORE_ATTRIBUTE]: "true", title: objectModel.name },
            dataset: { selected: String(objectModel.id === state.selectedObjectId) },
            on: {
              click() {
                state.selectedObjectId = objectModel.id;
                render();
              }
            }
          });
          const removeButton = createButton(documentObject, {
            className: `${TOOL_NAMESPACE}-object-remove`,
            attrs: {
              [TOOL_IGNORE_ATTRIBUTE]: "true",
              "aria-label": `Remove ${objectModel.name}`,
              title: `Remove ${objectModel.name}`
            },
            text: "×",
            on: {
              click(event) {
                event.preventDefault();
                event.stopPropagation();
                removeObjectById(objectModel.id);
              }
            }
          });
          const rowInner = createToolNode(documentObject, "div", {
            className: `${TOOL_NAMESPACE}-object-row-inner`
          }, [
            createToolNode(documentObject, "span", {
              className: `${TOOL_NAMESPACE}-object-name`,
              text: objectModel.name
            }),
            createToolNode(documentObject, "span", {
              className: `${TOOL_NAMESPACE}-object-chip`,
              text: objectModel.kind
            }),
            createToolNode(documentObject, "span", {
              className: `${TOOL_NAMESPACE}-object-chip`,
              text: objectModel.inferredType
            }),
            createToolNode(documentObject, "span", {
              className: `${TOOL_NAMESPACE}-object-chip`,
              text: `${Math.round(objectModel.confidence * 100)}%`
            }),
            removeButton
          ]);
          row.append(rowInner);
          if (objectModel.parentId) {
            const parent = state.selectedObjects.find((item) => item.id === objectModel.parentId);
            row.append(createToolNode(documentObject, "div", {
              className: `${TOOL_NAMESPACE}-object-parent`,
              text: parent ? `inside ${parent.name}` : "inside parent"
            }));
          }
          return row;
        })
      ])));
    }
    function renderHeuristicPopover(objectModel) {
      refs.heuristicPopover.hidden = !state.heuristicMenuOpen || !objectModel;
      replaceChildren(refs.heuristicList, []);
      if (!objectModel) {
        return;
      }
      const filter = normalizeWhitespace(state.heuristicFilter).toLowerCase();
      const heuristics = applicableHeuristics(objectModel.kind).filter((heuristic) => !filter ? true : `${heuristic.label} ${heuristic.description}`.toLowerCase().includes(filter));
      if (!heuristics.length) {
        replaceChildren(refs.heuristicList, [
          createToolNode(documentObject, "div", {
            className: `${TOOL_NAMESPACE}-empty`,
            text: "No heuristics match the current filter."
          })
        ]);
        return;
      }
      replaceChildren(refs.heuristicList, heuristics.map((heuristic) => createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-heuristic-option`,
        dataset: { selected: String(heuristic.id === objectModel.heuristicId) },
        attrs: { [TOOL_IGNORE_ATTRIBUTE]: "true" },
        on: {
          click() {
            state.heuristicMenuOpen = false;
            state.heuristicFilter = "";
            objectModel.manualSelector = "";
            objectModel.manualSelectorType = "css";
            applySelectorState(objectModel, { heuristicId: heuristic.id });
            trackSessionChange();
            setStatus(`Heuristic changed to ${heuristic.label}.`);
            render();
          }
        }
      }, [
        createToolNode(documentObject, "strong", {
          className: `${TOOL_NAMESPACE}-truncate`,
          text: heuristic.label
        }),
        createToolNode(documentObject, "span", {
          className: `${TOOL_NAMESPACE}-muted`,
          text: heuristic.description
        })
      ])));
    }
    function closeHeuristicMenuIfOpen() {
      if (!state.heuristicMenuOpen) {
        return false;
      }
      state.heuristicMenuOpen = false;
      state.heuristicFilter = "";
      return true;
    }
    function renderAlternatives(objectModel) {
      if (!objectModel || !objectModel.alternativeSelectors.length) {
        replaceChildren(refs.altList, [
          createToolNode(documentObject, "div", {
            className: `${TOOL_NAMESPACE}-empty`,
            text: "Alternative selectors will appear here after generation."
          })
        ]);
        return;
      }
      replaceChildren(refs.altList, objectModel.alternativeSelectors.slice(0, 8).map((candidate) => createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-alt-row`,
        attrs: { [TOOL_IGNORE_ATTRIBUTE]: "true" },
        on: {
          click() {
            objectModel.manualSelector = candidate.selector;
            objectModel.manualSelectorType = candidate.selectorType;
            applySelectorState(objectModel, {
              heuristicId: "manualSelector",
              manualSelector: candidate.selector,
              manualSelectorType: candidate.selectorType
            });
            trackSessionChange();
            setStatus("Alternative selector promoted to manual mode.");
            render();
          }
        }
      }, [
        createToolNode(documentObject, "div", { className: `${TOOL_NAMESPACE}-summary-line` }, [
          createToolNode(documentObject, "strong", {
            className: `${TOOL_NAMESPACE}-truncate`,
            text: `${candidate.selectorType.toUpperCase()} · score ${candidate.score}`
          }),
          createToolNode(documentObject, "span", {
            className: `${TOOL_NAMESPACE}-muted`,
            text: applicableHeuristics(objectModel.kind).find((item) => item.id === candidate.heuristicId)?.label ?? candidate.heuristicId
          })
        ]),
        createTextarea(documentObject, {
          className: `${TOOL_NAMESPACE}-selector-editor`,
          attrs: {
            readonly: true,
            rows: "2",
            wrap: "off",
            [TOOL_IGNORE_ATTRIBUTE]: "true"
          },
          value: candidate.selector
        }),
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-muted`,
          text: `${candidate.explanation} · matches ${candidate.matchCount}`
        })
      ])));
    }
    function renderDetails() {
      const objectModel = selectedObject();
      refs.exportPreviewWrap.hidden = !state.exportPreviewVisible;
      refs.exportPreview.value = state.exportText;
      if (!objectModel) {
        refs.objectHeader.textContent = "No Object Selected";
        refs.objectMeta.textContent = "Select an element or drag an area to inspect it.";
        replaceChildren(refs.summaryPills, [
          createToolNode(documentObject, "div", {
            className: `${TOOL_NAMESPACE}-empty`,
            text: "The current object summary, selector, and alternatives appear here."
          })
        ]);
        refs.heuristicButton.textContent = "Choose heuristic";
        refs.selectorEditor.value = "";
        refs.selectorInfo.textContent = "No selector generated yet.";
        refs.explanation.textContent = "Inspector details will populate after you select an object.";
        renderHeuristicPopover(null);
        renderAlternatives(null);
        return;
      }
      refs.objectHeader.textContent = objectModel.name;
      refs.objectMeta.textContent = objectModel.explanation;
      replaceChildren(refs.summaryPills, buildSummaryPills(objectModel));
      refs.heuristicButton.textContent = applicableHeuristics(objectModel.kind).find((item) => item.id === objectModel.heuristicId)?.label ?? chooseAutomaticHeuristic(objectModel);
      refs.heuristicSearch.value = state.heuristicFilter;
      refs.selectorEditor.value = objectModel.selector ?? "";
      const selectorStateText = [
        `Type ${objectModel.selectorType || "css"}`,
        `Score ${objectModel.selectorScore ?? 0}`,
        `Matches ${objectModel.selectorTest?.matchCount ?? 0}`,
        `Scope ${objectModel.selectorTest?.scope ?? (objectModel.parentId ? "parent" : "document")}`
      ];
      if (objectModel.selectorTest?.error) {
        selectorStateText.push(`Error ${objectModel.selectorTest.error}`);
      }
      refs.selectorInfo.textContent = selectorStateText.join(" · ");
      refs.explanation.textContent = objectModel.explanation;
      renderHeuristicPopover(objectModel);
      renderAlternatives(objectModel);
    }
    function renderToolbar() {
      for (const [mode, button] of Object.entries(refs.modeButtons)) {
        button.dataset.active = String(state.mode === mode);
      }
      refs.selectionCount.textContent = `${state.selectedObjects.length} selected`;
      refs.subtitle.textContent = `${state.mode} mode · ${state.selectedObjects.length} selected`;
    }
    function render() {
      renderToolbar();
      renderSelectedList();
      renderDetails();
      refs.status.textContent = state.statusMessage;
      refs.exportPreviewWrap.hidden = !state.exportPreviewVisible;
      scheduleOverlayRefresh();
    }
    function updateExportVisibility(nextVisible) {
      state.exportPreviewVisible = nextVisible;
      if (state.exportPreviewVisible) {
        updateExportText(false);
      }
      persistWindowState();
      render();
    }
    function mountPageOverlays() {
      refs.highlight = createToolNode(documentObject, "div", {
        style: { display: "none" }
      });
      setOverlayStyle(refs.highlight, {
        position: "fixed",
        zIndex: "2147483644",
        pointerEvents: "none",
        borderRadius: "10px",
        border: "2px solid rgba(30, 117, 255, 0.95)",
        background: "rgba(30, 117, 255, 0.12)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.55), 0 0 0 9999px rgba(10, 26, 52, 0.03)"
      });
      refs.selectionLayer = createToolNode(documentObject, "div");
      setOverlayStyle(refs.selectionLayer, {
        position: "fixed",
        inset: "0",
        zIndex: "2147483643",
        pointerEvents: "none"
      });
      refs.dragBox = createToolNode(documentObject, "div", {
        style: { display: "none" }
      });
      setOverlayStyle(refs.dragBox, {
        position: "fixed",
        zIndex: "2147483646",
        pointerEvents: "none",
        borderRadius: "8px",
        border: "2px solid rgba(245, 150, 35, 0.98)",
        background: "repeating-linear-gradient(135deg, rgba(245, 150, 35, 0.15), rgba(245, 150, 35, 0.15) 10px, rgba(67, 177, 255, 0.08) 10px, rgba(67, 177, 255, 0.08) 20px)"
      });
      refs.matchLayer = createToolNode(documentObject, "div");
      setOverlayStyle(refs.matchLayer, {
        position: "fixed",
        inset: "0",
        zIndex: "2147483642",
        pointerEvents: "none"
      });
      refs.areaLayer = createToolNode(documentObject, "div");
      setOverlayStyle(refs.areaLayer, {
        position: "fixed",
        inset: "0",
        zIndex: "2147483645",
        pointerEvents: "none"
      });
      documentObject.documentElement.append(refs.matchLayer, refs.selectionLayer, refs.highlight, refs.areaLayer, refs.dragBox);
    }
    function unmountPageOverlays() {
      refs.areaLayer?.remove();
      refs.selectionLayer?.remove();
      refs.highlight?.remove();
      refs.dragBox?.remove();
      refs.matchLayer?.remove();
    }
    function beginInteraction(type, payload) {
      state.interaction = {
        type,
        ...payload
      };
    }
    function endInteraction() {
      state.interaction = null;
    }
    function onGlobalPointerMove(event) {
      if (state.interaction?.type === "drag") {
        const nextFrame = {
          ...state.interaction.startFrame,
          left: state.interaction.startFrame.left + (event.clientX - state.interaction.startPointer.x),
          top: state.interaction.startFrame.top + (event.clientY - state.interaction.startPointer.y)
        };
        state.frame = clampFrame(nextFrame, windowObject);
        applyWindowFrame();
        return;
      }
      if (state.interaction?.type === "resize") {
        const dx = event.clientX - state.interaction.startPointer.x;
        const dy = event.clientY - state.interaction.startPointer.y;
        const edges = state.interaction.edge;
        let nextFrame = { ...state.interaction.startFrame };
        if (edges.includes("e")) {
          nextFrame.width = state.interaction.startFrame.width + dx;
        }
        if (edges.includes("s")) {
          nextFrame.height = state.interaction.startFrame.height + dy;
        }
        if (edges.includes("w")) {
          nextFrame.width = state.interaction.startFrame.width - dx;
          nextFrame.left = state.interaction.startFrame.left + dx;
        }
        if (edges.includes("n")) {
          nextFrame.height = state.interaction.startFrame.height - dy;
          nextFrame.top = state.interaction.startFrame.top + dy;
        }
        state.frame = clampFrame(nextFrame, windowObject);
        applyWindowFrame();
        return;
      }
      if (state.mode === "area" && state.dragSelection) {
        state.dragSelection.end = { x: event.clientX, y: event.clientY };
        const areaRect = pickAreaRect(state.dragSelection.start, state.dragSelection.end);
        setRectStyle(refs.dragBox, areaRect);
        renderAreaPreview(areaRect);
        return;
      }
      if (state.mode !== "inspect") {
        return;
      }
      const target = documentObject.elementFromPoint(event.clientX, event.clientY);
      inspectElement(target);
    }
    function onGlobalPointerUp(event) {
      if (state.interaction) {
        event.preventDefault();
        endInteraction();
        return;
      }
      if (state.mode !== "area" || !state.dragSelection) {
        return;
      }
      state.dragSelection.end = { x: event.clientX, y: event.clientY };
      const areaRect = pickAreaRect(state.dragSelection.start, state.dragSelection.end);
      state.dragSelection = null;
      refs.dragBox.style.display = "none";
      clearAreaPreview();
      const areaObjects = analyzeAreaSelection(state.scanRecords.map((record) => ({
        ...createObjectModel({
          element: record.element,
          features: record.features,
          context: { fromAreaSelection: true },
          existingNames: state.selectedObjects.map((item) => item.name)
        }),
        element: record.element
      })), areaRect);
      for (const objectModel of areaObjects) {
        objectModel.id = `object-${state.counter++}`;
        applySelectorState(objectModel);
        state.selectedObjects.push(objectModel);
      }
      state.selectedObjectId = areaObjects[0]?.id ?? state.selectedObjectId;
      if (areaObjects.length) {
        trackSessionChange();
      }
      setStatus(areaObjects.length ? `Area selection produced ${areaObjects.length} candidate page objects.` : "Area selection did not find a strong candidate.");
      render();
    }
    function onGlobalPointerDown(event) {
      if (state.heuristicMenuOpen) {
        const path = event.composedPath?.() ?? [];
        const insideHeuristic = path.includes(refs.heuristicAnchor);
        if (!insideHeuristic && closeHeuristicMenuIfOpen()) {
          render();
        }
      }
      if (state.mode === "inspect" && state.hoverRecord && !event.target.closest?.(`[${TOOL_IGNORE_ATTRIBUTE}="true"]`)) {
        event.preventDefault();
        return;
      }
      if (state.mode === "area" && !event.target.closest?.(`[${TOOL_IGNORE_ATTRIBUTE}="true"]`)) {
        state.dragSelection = {
          start: { x: event.clientX, y: event.clientY },
          end: { x: event.clientX, y: event.clientY }
        };
        refs.dragBox.style.display = "block";
        const areaRect = pickAreaRect(state.dragSelection.start, state.dragSelection.end);
        setRectStyle(refs.dragBox, areaRect);
        renderAreaPreview(areaRect);
        event.preventDefault();
        return;
      }
    }
    function onGlobalClick(event) {
      if (state.mode !== "inspect" || event.target.closest?.(`[${TOOL_IGNORE_ATTRIBUTE}="true"]`)) {
        return;
      }
      if (!state.hoverRecord) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const objectModel = makeObjectFromRecord(state.hoverRecord);
      saveObject(objectModel);
    }
    function onGlobalKeyDown(event) {
      if (event.key !== "Escape") {
        return;
      }
      if (closeHeuristicMenuIfOpen()) {
        render();
        event.preventDefault();
        return;
      }
      if (state.mode === "area" && state.dragSelection) {
        state.dragSelection = null;
        refs.dragBox.style.display = "none";
        clearAreaPreview();
        setStatus("Area selection cancelled.");
        render();
        event.preventDefault();
      }
    }
    function bindWindowInteractions() {
      refs.titlebar.addEventListener("pointerdown", (event) => {
        if (state.hostMode === "popup") {
          return;
        }
        if (event.target.closest("button")) {
          return;
        }
        beginInteraction("drag", {
          startPointer: { x: event.clientX, y: event.clientY },
          startFrame: { ...state.frame }
        });
        event.preventDefault();
      });
      for (const handle of refs.resizeHandles) {
        handle.addEventListener("pointerdown", (event) => {
          if (state.hostMode === "popup") {
            return;
          }
          beginInteraction("resize", {
            edge: handle.dataset.edge,
            startPointer: { x: event.clientX, y: event.clientY },
            startFrame: { ...state.frame }
          });
          event.preventDefault();
          event.stopPropagation();
        });
      }
      refs.closeButton.addEventListener("click", destroy);
      refs.openPopupButton.addEventListener("click", openInPopupWindow);
      refs.returnToPageButton.addEventListener("click", returnToInlineFromPopup);
      refs.focusPageButton.addEventListener("click", () => {
        windowObject.focus();
        setStatus("Focused the inspected page.");
      });
      refs.themeButton.addEventListener("click", () => {
        state.themeId = cycleTheme(state.themeId);
        trackSessionChange();
        applyTheme();
        setStatus(`Theme changed to ${getThemeMeta(state.themeId).label}.`);
      });
      refs.scanButton.addEventListener("click", refreshScanRecords);
      refs.modeButtons.inspect.addEventListener("click", () => {
        state.mode = "inspect";
        refs.dragBox.style.display = "none";
        state.dragSelection = null;
        clearAreaPreview();
        trackSessionChange();
        setStatus("Inspect mode enabled. Move over the page and click a highlighted object.");
        render();
      });
      refs.modeButtons.area.addEventListener("click", () => {
        state.mode = "area";
        clearHover();
        trackSessionChange();
        setStatus("Area mode enabled. Drag a rectangle over the page.");
        render();
      });
      refs.clearButton.addEventListener("click", () => {
        state.selectedObjects = [];
        state.selectedObjectId = null;
        state.exportPreviewVisible = false;
        state.exportText = "";
        clearMatches();
        clearAreaPreview();
        trackSessionChange();
        setStatus("Cleared selected page objects.");
        render();
      });
      refs.heuristicButton.addEventListener("click", () => {
        state.heuristicMenuOpen = !state.heuristicMenuOpen;
        render();
        if (state.heuristicMenuOpen) {
          refs.heuristicSearch.focus();
        }
      });
      refs.heuristicSearch.addEventListener("input", () => {
        state.heuristicFilter = refs.heuristicSearch.value;
        render();
      });
      refs.selectorEditor.addEventListener("input", () => {
        const objectModel = selectedObject();
        if (!objectModel) {
          return;
        }
        objectModel.manualSelector = refs.selectorEditor.value;
        objectModel.manualSelectorType = detectSelectorType(refs.selectorEditor.value);
        applySelectorState(objectModel, {
          heuristicId: "manualSelector",
          manualSelector: objectModel.manualSelector,
          manualSelectorType: objectModel.manualSelectorType
        });
        trackSessionChange();
        setStatus("Selector switched to manual mode.");
        render();
      });
      refs.testButton.addEventListener("click", () => {
        const objectModel = selectedObject();
        if (objectModel) {
          runSelectorTest(objectModel);
        }
      });
      refs.rerunButton.addEventListener("click", () => {
        const objectModel = selectedObject();
        if (!objectModel) {
          return;
        }
        objectModel.manualSelector = "";
        objectModel.manualSelectorType = "css";
        applySelectorState(objectModel, {
          heuristicId: objectModel.heuristicId === "manualSelector" ? chooseAutomaticHeuristic(objectModel) : objectModel.heuristicId
        });
        trackSessionChange();
        setStatus("Heuristic rerun completed.");
        render();
      });
      refs.copyButton.addEventListener("click", () => {
        updateExportText(true);
        state.exportPreviewVisible = true;
        persistWindowState();
        render();
      });
      refs.toggleJsonButton.addEventListener("click", () => {
        updateExportVisibility(!state.exportPreviewVisible);
      });
      refs.host.addEventListener("pointerdown", (event) => {
        if (!state.heuristicMenuOpen) {
          return;
        }
        const path = event.composedPath?.() ?? [];
        const insideHeuristic = path.includes(refs.heuristicAnchor);
        if (!insideHeuristic && closeHeuristicMenuIfOpen()) {
          render();
        }
      }, true);
      refs.host.addEventListener("keydown", onGlobalKeyDown, true);
    }
    function buildShadowUi() {
      refs.host = documentObject.createElement("div");
      refs.host.setAttribute(TOOL_IGNORE_ATTRIBUTE, "true");
      refs.host.style.position = "fixed";
      refs.host.style.inset = "0";
      refs.host.style.pointerEvents = "none";
      refs.host.style.zIndex = "2147483646";
      refs.shadow = refs.host.attachShadow({ mode: "open" });
      refs.style = documentObject.createElement("style");
      refs.style.textContent = getToolStyles();
      refs.shell = createNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-shell`
      });
      refs.window = createToolNode(documentObject, "section", {
        className: `${TOOL_NAMESPACE}-window`,
        attrs: {
          role: "dialog",
          "aria-label": "Page Object Recorder"
        }
      });
      refs.titlebar = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-titlebar`
      });
      const chromeLeft = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-chrome`
      });
      chromeLeft.append(createToolNode(documentObject, "span", {
        className: `${TOOL_NAMESPACE}-traffic`,
        attrs: { "data-kind": "close" }
      }), createToolNode(documentObject, "span", {
        className: `${TOOL_NAMESPACE}-traffic`,
        attrs: { "data-kind": "min" }
      }), createToolNode(documentObject, "span", {
        className: `${TOOL_NAMESPACE}-traffic`,
        attrs: { "data-kind": "zoom" }
      }));
      refs.title = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-title`,
        text: "Page Object Recorder"
      });
      refs.subtitle = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-subtitle`,
        text: "inspect mode · 0 selected"
      });
      const titleMeta = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-titlemeta`
      }, [refs.title, refs.subtitle]);
      refs.themeButton = createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`
      });
      refs.openPopupButton = createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`,
        text: "Open in popup window"
      });
      refs.returnToPageButton = createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`,
        text: "Return to page",
        attrs: { hidden: true }
      });
      refs.focusPageButton = createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`,
        text: "Focus inspected page",
        attrs: { hidden: true }
      });
      refs.closeButton = createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button ${TOOL_NAMESPACE}-close`,
        attrs: { "aria-label": "Close recorder" },
        text: "×"
      });
      const chromeRight = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-chrome`
      }, [refs.openPopupButton, refs.returnToPageButton, refs.focusPageButton, refs.themeButton, refs.closeButton]);
      refs.titlebar.append(chromeLeft, titleMeta, chromeRight);
      const toolbar = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-toolbar`
      });
      refs.scanButton = createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`,
        text: "Scan"
      });
      refs.modeButtons = {
        inspect: createButton(documentObject, {
          className: `${TOOL_NAMESPACE}-button`,
          text: "Select Element"
        }),
        area: createButton(documentObject, {
          className: `${TOOL_NAMESPACE}-button`,
          text: "Select Area"
        })
      };
      refs.clearButton = createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`,
        text: "Clear"
      });
      refs.selectionCount = createToolNode(documentObject, "span", {
        className: `${TOOL_NAMESPACE}-pill`,
        text: "0 selected"
      });
      toolbar.append(createToolNode(documentObject, "div", { className: `${TOOL_NAMESPACE}-toolbar-group` }, [
        refs.scanButton,
        refs.modeButtons.inspect,
        refs.modeButtons.area
      ]), createToolNode(documentObject, "div", { className: `${TOOL_NAMESPACE}-toolbar-group` }, [
        refs.selectionCount,
        refs.clearButton
      ]));
      const main = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-main`
      });
      const navigatorPane = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-pane ${TOOL_NAMESPACE}-navigator`
      });
      navigatorPane.append(createSection(documentObject, { className: `${TOOL_NAMESPACE}-panel` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Selected Objects"
        }),
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-list ${TOOL_NAMESPACE}-selected-list`,
          properties: { tabIndex: 0 }
        })
      ]));
      refs.selectedList = navigatorPane.querySelector(`.${TOOL_NAMESPACE}-selected-list`);
      const inspectorPane = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-pane ${TOOL_NAMESPACE}-inspector`
      });
      refs.objectHeader = createToolNode(documentObject, "strong", {
        className: `${TOOL_NAMESPACE}-truncate`,
        text: "No Object Selected"
      });
      refs.objectMeta = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-muted`,
        text: "Select an element or drag an area to inspect it."
      });
      refs.summaryPills = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-statline`
      });
      refs.heuristicButton = createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`,
        text: "Choose heuristic"
      });
      refs.heuristicSearch = createInput(documentObject, {
        className: `${TOOL_NAMESPACE}-search`,
        type: "search",
        name: "heuristic-search",
        attrs: {
          autocomplete: "off",
          placeholder: "Filter heuristics…"
        }
      });
      refs.heuristicList = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-heuristic-list`
      });
      refs.heuristicPopover = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-popover`,
        attrs: { hidden: true }
      }, [refs.heuristicSearch, refs.heuristicList]);
      refs.heuristicAnchor = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-heuristic-anchor`
      }, [refs.heuristicButton, refs.heuristicPopover]);
      refs.selectorEditor = createTextarea(documentObject, {
        className: `${TOOL_NAMESPACE}-selector-editor`,
        name: "selector-editor",
        value: "",
        attrs: {
          rows: "3",
          wrap: "off",
          "aria-label": "Selector editor"
        }
      });
      refs.selectorInfo = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-muted`,
        text: "No selector generated yet."
      });
      refs.testButton = createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`,
        text: "Test Selector"
      });
      refs.rerunButton = createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`,
        text: "Rerun Heuristic"
      });
      refs.explanation = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-muted`,
        text: "Inspector details will populate after you select an object."
      });
      refs.altList = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-list`
      });
      refs.exportPreview = createTextarea(documentObject, {
        className: `${TOOL_NAMESPACE}-selector-editor`,
        attrs: {
          readonly: true,
          rows: "8",
          wrap: "off",
          "aria-label": "Exported JSON preview"
        }
      });
      refs.exportPreviewWrap = createSection(documentObject, {
        className: `${TOOL_NAMESPACE}-panel`,
        attrs: { hidden: true }
      }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Export Preview"
        }),
        refs.exportPreview
      ]);
      inspectorPane.append(createSection(documentObject, { className: `${TOOL_NAMESPACE}-panel` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Current Object"
        }),
        refs.objectHeader,
        refs.objectMeta,
        refs.summaryPills
      ]), createSection(documentObject, { className: `${TOOL_NAMESPACE}-panel` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Selector Heuristic"
        }),
        refs.heuristicAnchor
      ]), createSection(documentObject, { className: `${TOOL_NAMESPACE}-panel` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Editable Selector"
        }),
        refs.selectorEditor,
        refs.selectorInfo,
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-actions`
        }, [refs.testButton, refs.rerunButton])
      ]), createSection(documentObject, { className: `${TOOL_NAMESPACE}-panel` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Explanation"
        }),
        refs.explanation
      ]), createSection(documentObject, { className: `${TOOL_NAMESPACE}-panel` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Alternative Selectors"
        }),
        refs.altList
      ]), refs.exportPreviewWrap);
      main.append(navigatorPane, inspectorPane);
      refs.footer = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-footer`
      });
      refs.copyButton = createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`,
        text: "Copy JSON"
      });
      refs.toggleJsonButton = createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`,
        text: "Show JSON"
      });
      refs.status = createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-status`,
        text: state.statusMessage
      });
      refs.footer.append(createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-footer-group`
      }, [refs.copyButton, refs.toggleJsonButton]), refs.status);
      refs.resizeHandles = ["n", "s", "e", "w", "ne", "nw", "se", "sw"].map((edge) => createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-resize`,
        dataset: { edge }
      }));
      refs.window.append(refs.titlebar, toolbar, main, refs.footer, ...refs.resizeHandles);
      refs.shell.append(refs.window);
      refs.shadow.append(refs.style, refs.shell);
      documentObject.documentElement.append(refs.host);
    }
    function mount() {
      if (state.mounted) {
        return api;
      }
      buildShadowUi();
      mountPageOverlays();
      applyTheme();
      applyHostModeUi();
      applyWindowFrame();
      bindWindowInteractions();
      refreshScanRecords();
      documentObject.addEventListener("pointermove", onGlobalPointerMove, true);
      documentObject.addEventListener("pointerup", onGlobalPointerUp, true);
      documentObject.addEventListener("pointerdown", onGlobalPointerDown, true);
      documentObject.addEventListener("click", onGlobalClick, true);
      documentObject.addEventListener("keydown", onGlobalKeyDown, true);
      documentObject.addEventListener("scroll", onOverlayLayoutEvent, true);
      windowObject.addEventListener("resize", applyWindowFrame);
      windowObject.addEventListener("resize", onOverlayLayoutEvent, true);
      refs.layoutMutationObserver = new windowObject.MutationObserver(() => {
        onOverlayLayoutEvent();
      });
      refs.layoutMutationObserver.observe(documentObject.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true
      });
      if (typeof windowObject.ResizeObserver === "function") {
        refs.layoutResizeObserver = new windowObject.ResizeObserver(() => {
          onOverlayLayoutEvent();
        });
        refs.layoutResizeObserver.observe(documentObject.documentElement);
      }
      state.mounted = true;
      state.mode = "inspect";
      render();
      return api;
    }
    function reopen() {
      if (state.hostMode === "popup") {
        returnToInlineFromPopup();
      }
      moveHostToDocument(documentObject);
      refs.host.style.display = "block";
      state.mode = "inspect";
      setStatus("Tool reopened.");
      render();
    }
    function destroy() {
      state.popupCloseReason = "session-destroy";
      stopPopupMonitor();
      state.popupGeometry = capturePopupGeometry(state.popupWindow) ?? state.popupGeometry;
      closePopupWindow(state.popupWindow);
      state.popupWindow = null;
      clearMatches();
      clearAreaPreview();
      clearHover();
      documentObject.removeEventListener("pointermove", onGlobalPointerMove, true);
      documentObject.removeEventListener("pointerup", onGlobalPointerUp, true);
      documentObject.removeEventListener("pointerdown", onGlobalPointerDown, true);
      documentObject.removeEventListener("click", onGlobalClick, true);
      documentObject.removeEventListener("keydown", onGlobalKeyDown, true);
      documentObject.removeEventListener("scroll", onOverlayLayoutEvent, true);
      windowObject.removeEventListener("resize", applyWindowFrame);
      windowObject.removeEventListener("resize", onOverlayLayoutEvent, true);
      refs.layoutMutationObserver?.disconnect();
      refs.layoutResizeObserver?.disconnect();
      refs.host?.remove();
      unmountPageOverlays();
      persistWindowState();
      delete windowObject[TOOL_GLOBAL_KEY];
    }
    const api = {
      mount,
      reopen,
      destroy
    };
    return api;
  }

  // src/entry.js
  var existing = window[TOOL_GLOBAL_KEY];
  if (existing?.reopen) {
    existing.reopen();
  } else {
    const app = createOverlayApp(window);
    window[TOOL_GLOBAL_KEY] = app;
    app.mount();
  }
})();
