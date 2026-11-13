<script setup lang="ts">
import { computed, reactive } from 'vue'
import LayerNode from './LayerNode.vue'
import { parseLayers } from './layers'

const props = defineProps<{ svg: SVGSVGElement }>()

const layers = computed(() => reactive(parseLayers(props.svg)))
</script>

<template>
  <LayerNode :nodes="layers" />
</template>
