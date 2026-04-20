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
    [TAGS.statusbar, AwwStatusbar]
  ]);
}
