<template>
  <div class="component-example">
    <div class="component-example__toolbar">
      <span>Live example</span>
      <slot name="note" />
    </div>
    <div class="component-example__canvas">
      <slot />
    </div>
  </div>
</template>
