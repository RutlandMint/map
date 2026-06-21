<script setup lang="ts">
import NodeTreeItem from './NodeTreeItem.vue';
import { computed } from 'vue'

// ── Props ────────────────────────────────────────────────────────────────────

const props = defineProps<{
  fedFrom: Record<string, string>             // nodeName → parentName
  feedsTo: Record<string, SVGGraphicsElement[]> // nodeName → [child elements]
  byName:  Record<string, SVGGraphicsElement>  // nodeName → element
}>()

const emit = defineEmits<{
  (e: 'node-click', payload: { name: string; el: SVGGraphicsElement }): void
}>()

// ── Tree building ─────────────────────────────────────────────────────────────

interface TreeNode {
  name: string
  el: SVGGraphicsElement
  children: TreeNode[]
}

/** Names of nodes that have no parent (roots of the forest) */
const rootNames = computed(() =>
  Object.keys(props.byName).filter(name => !props.fedFrom[name])
)

function buildNode(name: string): TreeNode {
  const childEls = props.feedsTo[name] ?? []
  return {
    name,
    el: props.byName[name]!,
    children: childEls
      .map(el => el.dataset.name)
      .filter((n): n is string => !!n && n in props.byName)
      .map(buildNode),
  }
}

const tree = computed<TreeNode[]>(() => rootNames.value.map(buildNode))

// ── Interaction ───────────────────────────────────────────────────────────────

function handleClick(node: TreeNode) {
  emit('node-click', { name: node.name, el: node.el })
}
</script>

<template>
  <ul class="tree-root" role="tree">
    <NodeTreeItem
      v-for="node in tree"
      :key="node.name"
      :node="node"
      @node-click="handleClick"
    />
  </ul>
</template>

<style scoped>
.tree-root {
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: inherit;
}
</style>
