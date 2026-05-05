// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { TAGS } from "../core/constants.js";
import { defineMany } from "../core/define.js";
import { AwwDesktopRoot } from "./desktop-root.js";
import { AwwWindow } from "./window.js";
import { AwwMenubar } from "./menubar.js";
import { AwwMenu } from "./menu.js";
import { AwwButton } from "./button.js";
import { AwwIconButton } from "./icon-button.js";
import { AwwInput } from "./input.js";
import { AwwTextarea } from "./textarea.js";
import { AwwCheckbox } from "./checkbox.js";
import { AwwRadio } from "./radio.js";
import { AwwSelect } from "./select.js";
import { AwwRange } from "./range.js";
import { AwwProgress } from "./progress.js";
import { AwwTabs, AwwTabPanel } from "./tabs.js";
import { AwwListbox } from "./listbox.js";
import { AwwGroup } from "./group.js";
import { AwwPanel } from "./panel.js";
import { AwwStatusbar } from "./statusbar.js";
import { AwwAppShell } from "./app-shell.js";
import { AwwToolbar } from "./toolbar.js";
import { AwwField } from "./field.js";
import { AwwStatusLine } from "./status-line.js";
import { AwwAlert } from "./alert.js";
import { AwwDialog } from "./dialog.js";
import { AwwToast } from "./toast.js";
import { AwwEmptyState } from "./empty-state.js";
import { AwwStateOverlay } from "./state-overlay.js";
import { AwwList } from "./list.js";
import { AwwListItem } from "./list-item.js";
import { AwwCard } from "./card.js";
import { AwwRichPreview } from "./rich-preview.js";
import { AwwBrowserPanel } from "./browser-panel.js";
import { AwwManualCopy } from "./manual-copy.js";
import { AwwCommandPalette } from "./command-palette.js";
import { AwwShortcutHelp } from "./shortcut-help.js";
import { AwwUrlPicker } from "./url-picker.js";
import { AwwMetricCard } from "./metric-card.js";
import { AwwSegmentStrip } from "./segment-strip.js";
import { AwwContextBar } from "./context-bar.js";
import { AwwStatusStrip } from "./status-strip.js";
import { AwwTitlebar } from "./titlebar.js";
import { AwwContextPanel } from "./context-panel.js";

export function registerAllComponents() {
  defineMany([
    [TAGS.desktopRoot, AwwDesktopRoot],
    [TAGS.window, AwwWindow],
    [TAGS.menubar, AwwMenubar],
    [TAGS.menu, AwwMenu],
    [TAGS.button, AwwButton],
    [TAGS.iconButton, AwwIconButton],
    [TAGS.input, AwwInput],
    [TAGS.textarea, AwwTextarea],
    [TAGS.checkbox, AwwCheckbox],
    [TAGS.radio, AwwRadio],
    [TAGS.select, AwwSelect],
    [TAGS.range, AwwRange],
    [TAGS.progress, AwwProgress],
    [TAGS.tabs, AwwTabs],
    [TAGS.tabPanel, AwwTabPanel],
    [TAGS.listbox, AwwListbox],
    [TAGS.group, AwwGroup],
    [TAGS.panel, AwwPanel],
    [TAGS.statusbar, AwwStatusbar],
    [TAGS.appShell, AwwAppShell],
    [TAGS.toolbar, AwwToolbar],
    [TAGS.field, AwwField],
    [TAGS.statusLine, AwwStatusLine],
    [TAGS.alert, AwwAlert],
    [TAGS.dialog, AwwDialog],
    [TAGS.toast, AwwToast],
    [TAGS.emptyState, AwwEmptyState],
    [TAGS.stateOverlay, AwwStateOverlay],
    [TAGS.list, AwwList],
    [TAGS.listItem, AwwListItem],
    [TAGS.card, AwwCard],
    [TAGS.richPreview, AwwRichPreview],
    [TAGS.browserPanel, AwwBrowserPanel],
    [TAGS.manualCopy, AwwManualCopy],
    [TAGS.commandPalette, AwwCommandPalette],
    [TAGS.shortcutHelp, AwwShortcutHelp],
    [TAGS.urlPicker, AwwUrlPicker],
    [TAGS.metricCard, AwwMetricCard],
    [TAGS.segmentStrip, AwwSegmentStrip],
    [TAGS.contextBar, AwwContextBar],
    [TAGS.statusStrip, AwwStatusStrip],
    [TAGS.titlebar, AwwTitlebar],
    [TAGS.contextPanel, AwwContextPanel]
  ]);
}
