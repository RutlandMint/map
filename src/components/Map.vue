<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import LayerTree from './layerTree/LayerTree.vue'
import drawing from "../assets/MINT_floor_plan.svg?raw";

const host = ref<HTMLElement | null>(null)
const svg = shallowRef<SVGSVGElement | null>(null)

onMounted(() => {
  svg.value = host.value?.querySelector('svg') ?? null
})
</script>

<template>
  <div class="map">
    <aside class="tree">
      <LayerTree v-if="svg" :svg="svg" />
    </aside>
    <div ref="host" class="svg-host" v-html="drawing"></div>
  </div>
</template>

<style scoped>
.map {
  display: grid;
  grid-template-columns: 250px 1fr;
  height: 100vh;
}
.tree {
  overflow: auto;
  border-right: 1px solid #ccc;
}
.svg-host {
  min-width: 0;
  min-height: 0;
}
.svg-host :deep(svg) {
  width: 100%;
}
</style>
