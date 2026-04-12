import { TOOL_IGNORE_ATTRIBUTE } from "../../../src/utils.js";

function placeRect(element, rect) {
  const safeRect = {
    left: Number(rect.left ?? 0),
    top: Number(rect.top ?? 0),
    width: Number(rect.width ?? 0),
    height: Number(rect.height ?? 0),
  };
  safeRect.right = Number(rect.right ?? safeRect.left + safeRect.width);
  safeRect.bottom = Number(rect.bottom ?? safeRect.top + safeRect.height);

  element.getBoundingClientRect = () => ({ ...safeRect });
  return element;
}

function append(parent, children) {
  for (const child of children) {
    if (child) {
      parent.append(child);
    }
  }
}

function setNumericProperty(element, name, value) {
  Object.defineProperty(element, name, {
    configurable: true,
    value: Number(value),
  });
}

export function makeChatPage(options = {}) {
  const {
    repeatedMessages = 3,
    withIgnoredOverlay = true,
  } = options;

  const root = placeRect(document.createElement("main"), {
    left: 0,
    top: 0,
    width: 1200,
    height: 800,
  });
  root.id = "chat-root";

  const transcript = placeRect(document.createElement("section"), {
    left: 20,
    top: 20,
    width: 900,
    height: 520,
  });
  transcript.setAttribute("aria-label", "Chat transcript");
  setNumericProperty(transcript, "scrollHeight", 900);
  setNumericProperty(transcript, "clientHeight", 520);

  for (let index = 0; index < repeatedMessages; index += 1) {
    const message = placeRect(document.createElement("article"), {
      left: 30,
      top: 30 + index * 56,
      width: 860,
      height: 48,
    });
    message.setAttribute("data-testid", `message-${index + 1}`);
    message.textContent = `Message ${index + 1}`;
    transcript.append(message);
  }

  const composer = placeRect(document.createElement("form"), {
    left: 20,
    top: 560,
    width: 900,
    height: 180,
  });
  composer.id = "composer";
  composer.setAttribute("aria-label", "Message composer");

  const input = placeRect(document.createElement("textarea"), {
    left: 34,
    top: 590,
    width: 730,
    height: 88,
  });
  input.id = "message-input";
  input.name = "message";
  input.placeholder = "Write message";

  const sendButton = placeRect(document.createElement("button"), {
    left: 780,
    top: 590,
    width: 120,
    height: 48,
  });
  sendButton.type = "button";
  sendButton.id = "send-button";
  sendButton.setAttribute("data-testid", "send-button");
  sendButton.setAttribute("aria-label", "Send message");
  sendButton.textContent = "Send";

  append(composer, [input, sendButton]);
  append(root, [transcript, composer]);

  let ignoredOverlay = null;
  if (withIgnoredOverlay) {
    ignoredOverlay = placeRect(document.createElement("div"), {
      left: 0,
      top: 0,
      width: 1200,
      height: 800,
    });
    ignoredOverlay.setAttribute(TOOL_IGNORE_ATTRIBUTE, "true");
    ignoredOverlay.textContent = "overlay";
  }

  document.body.append(root);
  if (ignoredOverlay) {
    document.body.append(ignoredOverlay);
  }

  return {
    root,
    transcript,
    composer,
    input,
    sendButton,
    ignoredOverlay,
  };
}

export function makeNavigationPage() {
  const nav = placeRect(document.createElement("nav"), {
    left: 0,
    top: 0,
    width: 240,
    height: 600,
  });
  nav.setAttribute("aria-label", "Main navigation");

  const labels = ["Inbox", "Drafts", "Sent", "Archived"];
  for (const label of labels) {
    const link = placeRect(document.createElement("a"), {
      left: 20,
      top: 20,
      width: 180,
      height: 28,
    });
    link.href = `/${label.toLowerCase()}`;
    link.textContent = label;
    nav.append(link);
  }

  document.body.append(nav);
  return { nav };
}

export function makeDecorativeIcon() {
  const icon = placeRect(document.createElement("span"), {
    left: 16,
    top: 16,
    width: 12,
    height: 12,
  });
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

export { placeRect };
