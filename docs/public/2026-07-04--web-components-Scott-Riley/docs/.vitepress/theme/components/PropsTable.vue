<script setup>
import { computed } from "vue";
import { data as manifest } from "../../custom-elements.data.mjs";

const props = defineProps({
  tag: {
    type: String,
    required: true,
  },
});

const fields = computed(() => {
  const component = manifest.modules
    .flatMap((moduleRecord) => moduleRecord.declarations ?? [])
    .find((declaration) => declaration.tagName === props.tag);

  return component?.members?.filter((member) => member.kind === "field") ?? [];
});
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="field in fields" :key="field.name">
        <td><code>{{ field.name }}</code></td>
        <td><code>{{ field.type?.text }}</code></td>
        <td><code>{{ field.default || "—" }}</code></td>
        <td>{{ field.description }}</td>
      </tr>
    </tbody>
  </table>
</template>
