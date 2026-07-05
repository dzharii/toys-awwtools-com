<script setup>
import { computed } from "vue";
import { data as tokens } from "../../tokens.data.mjs";

const props = defineProps({
  group: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    default: "",
  },
});

const visibleTokens = computed(() => {
  const source = props.theme ? tokens.themes[props.theme] ?? [] : [...tokens.global, ...tokens.semantic];

  return source.filter((token) => token.path.includes(props.group));
});
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-if="group === 'color'">Swatch</th>
        <th>Name</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="token in visibleTokens" :key="token.name">
        <td v-if="group === 'color'">
          <span class="token-swatch" :style="{ background: token.value }" />
        </td>
        <td><code>{{ token.name }}</code></td>
        <td><code>{{ token.value }}</code></td>
      </tr>
    </tbody>
  </table>
</template>
