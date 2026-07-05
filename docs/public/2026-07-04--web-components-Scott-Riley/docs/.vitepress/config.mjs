import { defineConfig } from "vitepress";

export default defineConfig({
  title: "My DS",
  description: "A token-driven framework-agnostic design system built with web components.",
  cleanUrls: true,
  vite: {
    server: {
      watch: {
        ignored: ["!**/packages/**/dist/**"],
      },
    },
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith("my-"),
      },
    },
  },
  themeConfig: {
    nav: [
      { text: "Guide", link: "/" },
      { text: "Foundations", link: "/foundations/color" },
      { text: "Components", link: "/components/button" },
      { text: "Article", link: "/article" },
    ],
    sidebar: [
      {
        text: "Start",
        items: [
          { text: "Introduction", link: "/" },
          { text: "Installation", link: "/installation" },
          { text: "Architecture", link: "/architecture" },
          { text: "Accessibility", link: "/accessibility" },
        ],
      },
      {
        text: "Foundations",
        items: [
          { text: "Color", link: "/foundations/color" },
          { text: "Spacing", link: "/foundations/spacing" },
          { text: "Typography", link: "/foundations/typography" },
          { text: "Radius", link: "/foundations/radius" },
          { text: "Motion", link: "/foundations/motion" },
        ],
      },
      {
        text: "Components",
        items: [
          { text: "Button", link: "/components/button" },
          { text: "Badge", link: "/components/badge" },
          { text: "Card", link: "/components/card" },
          { text: "Icon", link: "/components/icon" },
          { text: "Input", link: "/components/input" },
          { text: "Alert", link: "/components/alert" },
          { text: "Spinner", link: "/components/spinner" },
          { text: "Disclosure", link: "/components/disclosure" },
          { text: "Field", link: "/components/field" },
        ],
      },
      {
        text: "Implementation",
        items: [
          { text: "Release Checklist", link: "/release-checklist" },
          { text: "Framework Examples", link: "/framework-examples" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/" },
    ],
  },
});
