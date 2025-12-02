<template>
  <!-- The liquid layer -->
  <div class="contents" :style="{ backgroundColor: baseColor }">
    <slot name="top" />
    <slot name="mid" />
    <slot name="bottom" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBeverageStore } from "../stores/beverageStore";

const store = useBeverageStore();

// Use the Firestore color directly.
// Fallback to coffee-ish brown if something goes missing.
const baseColor = computed(() => {
  return store.currentBase?.color ?? "#6F4E37";
});
</script>

<style scoped>
.contents {
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 0 0 2.2em 2.2em;
  overflow: hidden;
  transition: background-color 0.3s ease;
}
</style>
