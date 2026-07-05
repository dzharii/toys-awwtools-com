import DefaultTheme from "vitepress/theme";
import "@my-ds/tokens/tokens.css";
import "@my-ds/tokens/theme-default.css";
import "@my-ds/tokens/theme-dark.css";
import "@my-ds/tokens/theme-high-contrast.css";
import "@my-ds/components/bundle.css";
import "./theme.css";
import ComponentExample from "./components/ComponentExample.vue";
import ComponentHeader from "./components/ComponentHeader.vue";
import PropsTable from "./components/PropsTable.vue";
import ThemeSwitcher from "./components/ThemeSwitcher.vue";
import TokenTable from "./components/TokenTable.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("ComponentExample", ComponentExample);
    app.component("ComponentHeader", ComponentHeader);
    app.component("PropsTable", PropsTable);
    app.component("ThemeSwitcher", ThemeSwitcher);
    app.component("TokenTable", TokenTable);
  },
  async setup() {
    if (typeof window !== "undefined") {
      await import("@my-ds/components");
    }
  },
};
