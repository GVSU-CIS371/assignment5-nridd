<template>
  <Mug>
    <Cold v-if="isIced" />
    <Hot v-else />

    <Contents>
      <!-- Creamer layer -->
      <template v-slot:top>
        <Creamer
          v-if="beverageStore.currentCreamer?.color !== 'transparent'"
          :type="creamer"
        />
      </template>

      <!-- Syrup layer -->
      <template v-slot:mid>
        <Syrup
          v-if="beverageStore.currentSyrup?.color !== 'transparent'"
          :type="syrup"
        />
      </template>

      <!-- Base layer (FIXED LINE BELOW) -->
      <template v-slot:bottom>
        <Base :base="base" />
      </template>
    </Contents>
  </Mug>
</template>

<script setup lang="ts">
import Contents from "./Contents.vue";
import Mug from "./Mug.vue";
import Syrup from "./Syrup.vue";
import Base from "./Base.vue";
import Creamer from "./Creamer.vue";
import Hot from "./Hot.vue";
import Cold from "./Cold.vue";

import { useBeverageStore } from "../stores/beverageStore";

const beverageStore = useBeverageStore();

defineProps<{
  isIced: boolean;
  base: string;
  creamer: string;
  syrup: string;
}>();
</script>
