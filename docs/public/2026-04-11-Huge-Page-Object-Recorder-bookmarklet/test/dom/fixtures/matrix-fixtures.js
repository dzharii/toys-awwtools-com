import { TOOL_IGNORE_ATTRIBUTE } from "../../../src/utils.js";

function setRect(element, rect) {
  const safe = {
    left: Number(rect.left ?? 0),
    top: Number(rect.top ?? 0),
    width: Number(rect.width ?? 0),
    height: Number(rect.height ?? 0),
  };
  safe.right = Number(rect.right ?? safe.left + safe.width);
  safe.bottom = Number(rect.bottom ?? safe.top + safe.height);
  element.getBoundingClientRect = () => ({ ...safe });
  return element;
}

function setNumberProp(element, name, value) {
  Object.defineProperty(element, name, {
    configurable: true,
    value: Number(value),
  });
}

function append(parent, children) {
  for (const child of children) {
    if (child) {
      parent.append(child);
    }
  }
}

function addGeneratedNoise(element) {
  element.className = ["css-1ab29d", "jsx-7ff0ab", "utility-pad-10"].join(" ");
  element.setAttribute("data-noise", "true");
}

function buildChatFixture(mutate = {}) {
  const options = {
    sidebar: true,
    transcript: true,
    composer: true,
    composerControl: "textarea",
    composerNameSource: "aria-label",
    sendButtonSignal: "data-testid",
    withAttachButton: true,
    transcriptScrollable: true,
    repeatCount: 5,
    conversationRowCount: 5,
    denseComposerDescendants: false,
    timestampMessages: false,
    noiseProfile: "none",
    ...mutate,
  };

  const aliases = {};
  const root = setRect(document.createElement("main"), {
    left: 0,
    top: 0,
    width: 1280,
    height: 820,
  });
  root.id = "chat-root";
  aliases.chatRoot = root;

  if (options.sidebar) {
    const sidebar = setRect(document.createElement("aside"), {
      left: 0,
      top: 0,
      width: 280,
      height: 820,
    });
    sidebar.id = "sidebar";
    sidebar.setAttribute("aria-label", "Conversation sidebar");
    aliases.sidebar = sidebar;

    for (let index = 0; index < options.conversationRowCount; index += 1) {
      const row = setRect(document.createElement("div"), {
        left: 12,
        top: 20 + index * 52,
        width: 250,
        height: 44,
      });
      row.className = "conversation-row";
      row.textContent = `Thread ${index + 1}`;
      sidebar.append(row);
    }

    root.append(sidebar);
  }

  if (options.transcript) {
    const transcript = setRect(document.createElement("section"), {
      left: 300,
      top: 20,
      width: 940,
      height: 520,
    });
    transcript.id = "transcript";
    transcript.setAttribute("aria-label", "Chat transcript");
    aliases.transcript = transcript;
    setNumberProp(transcript, "scrollHeight", options.transcriptScrollable ? 1100 : 520);
    setNumberProp(transcript, "clientHeight", 520);

    for (let index = 0; index < options.repeatCount; index += 1) {
      const message = setRect(document.createElement("article"), {
        left: 320,
        top: 36 + index * 72,
        width: 900,
        height: 60,
      });
      message.className = "message-row";
      message.textContent = `Message item ${index + 1}`;
      if (options.timestampMessages) {
        const time = document.createElement("span");
        time.textContent = index % 2 === 0 ? "8:42 PM" : "yesterday";
        message.append(time);
      }
      transcript.append(message);
    }

    root.append(transcript);
  }

  if (options.composer) {
    const composer = setRect(document.createElement("form"), {
      left: 300,
      top: 560,
      width: 940,
      height: 220,
    });
    composer.id = "composer";
    composer.setAttribute("role", "form");
    composer.setAttribute("aria-label", "Message composer");
    aliases.composer = composer;

    let composerControl;
    if (options.composerControl === "contenteditable") {
      composerControl = setRect(document.createElement("div"), {
        left: 320,
        top: 590,
        width: 760,
        height: 94,
      });
      composerControl.setAttribute("contenteditable", "true");
      composerControl.setAttribute("role", "textbox");
      composerControl.textContent = "Draft text";
    } else {
      composerControl = setRect(document.createElement("textarea"), {
        left: 320,
        top: 590,
        width: 760,
        height: 94,
      });
      composerControl.name = "message";
      composerControl.placeholder = "Write message";
      if (options.composerNameSource === "aria-label") {
        composerControl.setAttribute("aria-label", "Message input");
      }
      if (options.composerNameSource === "placeholder-only") {
        composerControl.removeAttribute("aria-label");
        composerControl.placeholder = "Search docs";
      }
    }
    composerControl.id = "message-input";
    aliases.composerControl = composerControl;

    const sendButton = setRect(document.createElement("button"), {
      left: 1100,
      top: 595,
      width: 120,
      height: 48,
    });
    sendButton.type = "button";
    sendButton.textContent = "Send";

    if (options.sendButtonSignal === "data-testid") {
      sendButton.id = "send-button";
      sendButton.setAttribute("data-testid", "send-button");
      sendButton.setAttribute("aria-label", "Send message");
    } else if (options.sendButtonSignal === "text-only") {
      sendButton.className = "send-action";
      sendButton.removeAttribute("aria-label");
    } else if (options.sendButtonSignal === "aria-label") {
      sendButton.setAttribute("aria-label", "Send message");
      sendButton.className = "send-action";
    }

    aliases.sendButton = sendButton;

    const attachButton = options.withAttachButton
      ? setRect(document.createElement("button"), {
          left: 1100,
          top: 648,
          width: 120,
          height: 42,
        })
      : null;

    if (attachButton) {
      attachButton.type = "button";
      attachButton.id = "attach-button";
      attachButton.setAttribute("aria-label", "Attach file");
      attachButton.textContent = "Attach";
      aliases.attachButton = attachButton;
    }

    append(composer, [composerControl, sendButton, attachButton]);

    if (options.denseComposerDescendants) {
      for (let index = 0; index < 4; index += 1) {
        const icon = document.createElement("span");
        icon.textContent = "•";
        sendButton.append(icon);
      }
      const weakChild = document.createElement("span");
      weakChild.textContent = "hint";
      composer.append(weakChild);
      aliases.weakComposerChild = weakChild;
    }

    root.append(composer);
  }

  if (options.noiseProfile === "generated-classes") {
    addGeneratedNoise(root);
    if (aliases.sidebar) addGeneratedNoise(aliases.sidebar);
    if (aliases.transcript) addGeneratedNoise(aliases.transcript);
  }

  document.body.append(root);
  return { aliases };
}

function buildFormFixture(mutate = {}) {
  const options = {
    inputNameSource: "label-for",
    submitDisabled: false,
    cancelEnabled: true,
    submitSignal: "default",
    ...mutate,
  };

  const aliases = {};
  const form = setRect(document.createElement("form"), {
    left: 20,
    top: 20,
    width: 720,
    height: 340,
  });
  form.id = "profile-form";
  aliases.form = form;

  const primaryInput = setRect(document.createElement("input"), {
    left: 40,
    top: 80,
    width: 420,
    height: 42,
  });
  primaryInput.type = "text";
  primaryInput.id = "primary-input";

  if (options.inputNameSource === "label-for") {
    const label = document.createElement("label");
    label.setAttribute("for", primaryInput.id);
    label.textContent = "Email address";
    form.append(label);
  } else if (options.inputNameSource === "placeholder-only") {
    primaryInput.placeholder = "Search docs";
  }

  aliases.primaryInput = primaryInput;

  const submitButton = setRect(document.createElement("button"), {
    left: 40,
    top: 160,
    width: 130,
    height: 42,
  });
  submitButton.type = "button";
  submitButton.textContent = "Submit";
  if (options.submitSignal === "stable-id") {
    submitButton.id = "submitAction";
  } else {
    submitButton.id = "submit-button";
  }
  if (options.submitDisabled) {
    submitButton.setAttribute("disabled", "");
  }
  aliases.submitButton = submitButton;

  const cancelButton = setRect(document.createElement("button"), {
    left: 190,
    top: 160,
    width: 130,
    height: 42,
  });
  cancelButton.type = "button";
  cancelButton.id = "cancel-button";
  cancelButton.textContent = "Cancel";
  if (!options.cancelEnabled) {
    cancelButton.setAttribute("disabled", "");
  }
  aliases.cancelButton = cancelButton;

  append(form, [primaryInput, submitButton, cancelButton]);
  document.body.append(form);
  return { aliases };
}

function buildShellFixture(mutate = {}) {
  const options = {
    nav: true,
    toolbar: true,
    noiseProfile: "none",
    moreButtonText: "More",
    actionSignal: "generated-id-plus-aria-label",
    repeatedLinks: 6,
    wideSummaryWrapper: false,
    ...mutate,
  };

  const aliases = {};

  const shell = setRect(document.createElement("div"), {
    left: 0,
    top: 0,
    width: 1200,
    height: 780,
  });
  shell.id = "shell";

  const header = setRect(document.createElement("header"), {
    left: 0,
    top: 0,
    width: 1200,
    height: 80,
  });
  header.textContent = "Workspace";
  shell.append(header);

  if (options.nav) {
    const nav = setRect(document.createElement("nav"), {
      left: 0,
      top: 90,
      width: 260,
      height: 620,
    });
    nav.id = "main-nav";
    nav.setAttribute("aria-label", "Main navigation");
    aliases.navigation = nav;

    for (let index = 0; index < options.repeatedLinks; index += 1) {
      const link = setRect(document.createElement("a"), {
        left: 20,
        top: 100 + index * 44,
        width: 200,
        height: 30,
      });
      link.href = `/item-${index + 1}`;
      link.textContent = `Item ${index + 1}`;
      if (index === 0) {
        aliases.firstNavLink = link;
      }
      nav.append(link);
    }

    shell.append(nav);
  }

  if (options.toolbar) {
    const toolbar = setRect(document.createElement("div"), {
      left: 280,
      top: 100,
      width: 500,
      height: 70,
    });
    toolbar.id = "main-toolbar";
    toolbar.setAttribute("role", "toolbar");
    aliases.toolbar = toolbar;

    const moreButton = setRect(document.createElement("button"), {
      left: 300,
      top: 115,
      width: 120,
      height: 40,
    });
    moreButton.type = "button";
    moreButton.textContent = options.moreButtonText;
    aliases.moreButton = moreButton;

    const toolbarAction = setRect(document.createElement("button"), {
      left: 430,
      top: 115,
      width: 170,
      height: 40,
    });
    toolbarAction.type = "button";
    toolbarAction.textContent = "Open";

    if (options.actionSignal === "generated-id-plus-aria-label") {
      toolbarAction.id = "css-9f0a12";
      toolbarAction.className = "jsx-9f0a12";
      toolbarAction.setAttribute("aria-label", "Open settings");
    }

    aliases.toolbarAction = toolbarAction;
    append(toolbar, [moreButton, toolbarAction]);
    shell.append(toolbar);
  }

  const statusNode = setRect(document.createElement("span"), {
    left: 290,
    top: 220,
    width: 240,
    height: 24,
  });
  statusNode.textContent = "Status: sent";
  aliases.statusNode = statusNode;
  shell.append(statusNode);

  if (options.wideSummaryWrapper) {
    const wideSummary = setRect(document.createElement("div"), {
      left: 280,
      top: 270,
      width: 860,
      height: 44,
    });
    wideSummary.id = "wide-summary";
    aliases.wideSummary = wideSummary;

    const wideSummaryText = setRect(document.createElement("span"), {
      left: 300,
      top: 280,
      width: 220,
      height: 20,
    });
    wideSummaryText.id = "wide-summary-text";
    wideSummaryText.textContent = "Local summary text";
    aliases.wideSummaryText = wideSummaryText;

    wideSummary.append(wideSummaryText);
    shell.append(wideSummary);
  }

  if (options.noiseProfile === "generated-classes") {
    addGeneratedNoise(shell);
    const decorative = document.createElement("span");
    decorative.setAttribute("aria-hidden", "true");
    decorative.textContent = "*";
    shell.append(decorative);
  }

  document.body.append(shell);
  return { aliases };
}

function buildDialogFixture(mutate = {}) {
  const options = {
    includeStatusText: false,
    includeFooterRegion: true,
    ...mutate,
  };
  const aliases = {};

  const backdrop = setRect(document.createElement("div"), {
    left: 0,
    top: 0,
    width: 1200,
    height: 800,
  });
  backdrop.className = "backdrop";

  const dialog = setRect(document.createElement("section"), {
    left: 320,
    top: 180,
    width: 560,
    height: 340,
  });
  dialog.id = "confirm-dialog";
  dialog.setAttribute("role", "dialog");
  aliases.modal = dialog;

  const title = document.createElement("h2");
  title.textContent = "Confirm action";
  dialog.append(title);

  const closeButton = setRect(document.createElement("button"), {
    left: 820,
    top: 200,
    width: 40,
    height: 34,
  });
  closeButton.type = "button";
  closeButton.textContent = "×";
  aliases.closeButton = closeButton;
  dialog.append(closeButton);

  const primaryButton = setRect(document.createElement("button"), {
    left: 660,
    top: 450,
    width: 120,
    height: 40,
  });
  primaryButton.type = "button";
  primaryButton.textContent = "Confirm";
  aliases.primaryButton = primaryButton;

  const secondaryButton = setRect(document.createElement("button"), {
    left: 520,
    top: 450,
    width: 120,
    height: 40,
  });
  secondaryButton.type = "button";
  secondaryButton.textContent = "Cancel";
  aliases.secondaryButton = secondaryButton;

  if (options.includeFooterRegion) {
    const footerRegion = setRect(document.createElement("div"), {
      left: 500,
      top: 430,
      width: 300,
      height: 80,
    });
    footerRegion.id = "dialog-footer";
    footerRegion.setAttribute("role", "toolbar");
    aliases.footerRegion = footerRegion;
    append(footerRegion, [secondaryButton, primaryButton]);
    dialog.append(footerRegion);
  } else {
    append(dialog, [secondaryButton, primaryButton]);
  }

  if (options.includeStatusText) {
    const statusNode = setRect(document.createElement("p"), {
      left: 370,
      top: 300,
      width: 420,
      height: 28,
    });
    statusNode.textContent = "Message sent successfully";
    aliases.statusNode = statusNode;
    dialog.append(statusNode);
  }

  append(backdrop, [dialog]);
  document.body.append(backdrop);
  return { aliases };
}

function buildCollectionFixture(mutate = {}) {
  const options = {
    itemCount: 5,
    itemStableClass: true,
    mixedRepeatedShapes: false,
    ...mutate,
  };

  const aliases = {};
  const collectionRoot = setRect(document.createElement("section"), {
    left: 20,
    top: 20,
    width: 960,
    height: 680,
  });
  collectionRoot.id = "collection-root";
  aliases.collectionRoot = collectionRoot;

  const items = [];
  for (let index = 0; index < options.itemCount; index += 1) {
    const item = setRect(document.createElement("article"), {
      left: 40,
      top: 40 + index * 110,
      width: 900,
      height: 94,
    });
    if (options.itemStableClass) {
      item.className = "message-card";
    }
    item.textContent = `Card ${index + 1}`;
    collectionRoot.append(item);
    items.push(item);
  }
  aliases.collectionItems = items;

  if (options.mixedRepeatedShapes) {
    for (let index = 0; index < 2; index += 1) {
      const promo = setRect(document.createElement("div"), {
        left: 40,
        top: 620 + index * 45,
        width: 600,
        height: 34,
      });
      promo.className = "promo-banner";
      promo.textContent = "Promo";
      collectionRoot.append(promo);
    }
  }

  document.body.append(collectionRoot);
  return { aliases };
}

function buildNoiseFixture(mutate = {}) {
  const options = {
    decorativeIcons: true,
    ignoredSubtreeContainsButton: true,
    targetVisibility: "visible",
    overlappingCount: 0,
    ...mutate,
  };

  const aliases = {};
  const root = setRect(document.createElement("main"), {
    left: 0,
    top: 0,
    width: 980,
    height: 720,
  });

  const mainAction = setRect(document.createElement("button"), {
    left: 120,
    top: 120,
    width: 180,
    height: 52,
  });
  mainAction.id = "main-action";
  mainAction.type = "button";
  mainAction.textContent = "Run check";
  aliases.mainAction = mainAction;
  root.append(mainAction);

  if (options.decorativeIcons) {
    for (let index = 0; index < 4; index += 1) {
      const icon = setRect(document.createElement("span"), {
        left: 350 + index * 20,
        top: 140,
        width: 12,
        height: 12,
      });
      icon.setAttribute("aria-hidden", "true");
      root.append(icon);
    }
  }

  if (options.ignoredSubtreeContainsButton) {
    const ignoredWrapper = setRect(document.createElement("div"), {
      left: 100,
      top: 220,
      width: 340,
      height: 120,
    });
    ignoredWrapper.setAttribute(TOOL_IGNORE_ATTRIBUTE, "true");
    const ignoredButton = setRect(document.createElement("button"), {
      left: 130,
      top: 250,
      width: 180,
      height: 42,
    });
    ignoredButton.type = "button";
    ignoredButton.id = "ignored-button";
    ignoredButton.textContent = "Ignore me";
    ignoredWrapper.append(ignoredButton);
    aliases.ignoredButton = ignoredButton;
    root.append(ignoredWrapper);
  }

  const hiddenButton = setRect(document.createElement("button"), {
    left: 120,
    top: 360,
    width: 160,
    height: 42,
  });
  hiddenButton.type = "button";
  hiddenButton.id = "hidden-button";
  hiddenButton.textContent = "Hidden action";
  aliases.hiddenButton = hiddenButton;
  if (options.targetVisibility === "hidden-style") {
    hiddenButton.style.visibility = "hidden";
  }
  root.append(hiddenButton);

  for (let index = 0; index < options.overlappingCount; index += 1) {
    const filler = setRect(document.createElement(index % 2 === 0 ? "button" : "div"), {
      left: 420 + (index % 4) * 14,
      top: 120 + (index % 5) * 20,
      width: 90,
      height: 32,
    });
    if (filler.tagName === "BUTTON") {
      filler.type = "button";
      filler.textContent = `Action ${index + 1}`;
    } else {
      filler.textContent = `Node ${index + 1}`;
    }
    root.append(filler);
  }

  document.body.append(root);
  return { aliases };
}

export function buildFixture(fixture, mutate = {}) {
  switch (fixture) {
    case "chat":
      return buildChatFixture(mutate);
    case "form":
      return buildFormFixture(mutate);
    case "shell":
      return buildShellFixture(mutate);
    case "dialog":
      return buildDialogFixture(mutate);
    case "collection":
      return buildCollectionFixture(mutate);
    case "noise":
      return buildNoiseFixture(mutate);
    default:
      throw new Error(`Unknown fixture family: ${fixture}`);
  }
}

export { setRect, setNumberProp };
