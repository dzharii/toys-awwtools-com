<script setup>
import MarkdownIt from "markdown-it";
import { computed } from "vue";
import { data as manifest } from "../../custom-elements.data.mjs";

const markdown = new MarkdownIt();
const props = defineProps({
  tag: {
    type: String,
    required: true,
  },
});

const component = computed(() =>
  manifest.modules
    .flatMap((moduleRecord) => moduleRecord.declarations ?? [])
    .find((declaration) => declaration.tagName === props.tag),
);

const descriptionHtml = computed(() => markdown.render(component.value?.description ?? ""));
</script>

<template>
  <section v-if="component" class="component-header">
    <h1>{{ component.displayName }}</h1>
    <div class="component-header__meta-row">
      <code class="component-header__tag">&lt;{{ component.tagName }}&gt;</code>
      <span class="component-header__status">{{ component.status }}</span>
    </div>
    <div v-html="descriptionHtml" />
  </section>
</template>
