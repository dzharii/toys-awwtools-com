<script setup>
import { onMounted, ref } from "vue";

const themes = [
  { label: "Default", value: "default" },
  { label: "Dark", value: "dark" },
  { label: "High Contrast", value: "high-contrast" },
];

const selectedTheme = ref("default");

function applyTheme(theme) {
  selectedTheme.value = theme;
  document.documentElement.dataset.theme = theme;

  try {
    localStorage.setItem("my-ds-theme", theme);
  } catch {
    // Restricted browser contexts can block localStorage; theme switching still works for the session.
  }
}

onMounted(() => {
  try {
    selectedTheme.value = localStorage.getItem("my-ds-theme") || "default";
  } catch {
    selectedTheme.value = "default";
  }

  document.documentElement.dataset.theme = selectedTheme.value;
});
</script>

<template>
  <div class="theme-switcher" aria-label="Theme preview">
    <span>Theme</span>
    <button
      v-for="theme in themes"
      :key="theme.value"
      type="button"
      :aria-pressed="selectedTheme === theme.value"
      @click="applyTheme(theme.value)"
    >
      {{ theme.label }}
    </button>
  </div>
</template>
