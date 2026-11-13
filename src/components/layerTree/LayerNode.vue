<script setup lang="ts">
import { reactive } from 'vue'
import type { Layer } from './layers'

defineProps<{ nodes: Layer[] }>()

const open = reactive(new Set<string>())

function toggleOpen(id: string) {
  if (open.has(id)) {
    open.delete(id)
  } else {
    open.add(id)
  }
}

function toggleVisible(layer: Layer) {
  layer.visible = !layer.visible
  layer.el.style.display = layer.visible ? '' : 'none'
}
</script>

<template>
  <ul class="layer-list">
    <li v-for="layer in nodes" :key="layer.id">
      <div class="row">
        <span
          class="arrow"
          :class="{ clickable: layer.children.length }"
          @click="layer.children.length && toggleOpen(layer.id)"
        >
          {{ layer.children.length ? (open.has(layer.id) ? '▾' : '▸') : '' }}
        </span>
        <label :class="{ hidden: !layer.visible }">
          <input type="checkbox" :checked="layer.visible" @change="toggleVisible(layer)" />
          {{ layer.label }}
        </label>
      </div>
      <LayerNode v-if="layer.children.length && open.has(layer.id)" :nodes="layer.children" />
    </li>
  </ul>
</template>

<style scoped>
.layer-list {
  list-style: none;
  margin: 0;
  padding-left: 1rem;
}
.row {
  padding: 2px 0;
  user-select: none;
}
.arrow {
  display: inline-block;
  width: 1em;
}
.arrow.clickable {
  cursor: pointer;
}
label {
  cursor: pointer;
}
label.hidden {
  opacity: 0.5;
}
</style>
