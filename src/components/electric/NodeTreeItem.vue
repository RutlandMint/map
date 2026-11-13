<script setup lang="ts">
// ── NodeTreeItem.vue ──────────────────────────────────────────────────────────
// Recursive child component used by NodeTree.vue.
// Keep both files in the same directory and register NodeTreeItem globally
// (or locally inside NodeTree.vue if using resolveComponent).

interface TreeNode {
  name: string
  el: SVGGraphicsElement
  children: TreeNode[]
}

const props = defineProps<{ node: TreeNode }>()

const emit = defineEmits<{
  (e: 'node-click', node: TreeNode): void
}>()
</script>

<template>
  <li
    class="tree-item"
    role="treeitem"
    :aria-expanded="node.children.length > 0 ? 'true' : undefined"
  >
    <!-- Label row — click gives parent access to name + raw SVG element -->
    <button
      class="tree-label"
      type="button"
      @click="emit('node-click', node)"
    >
      <span class="tree-caret" aria-hidden="true">
        {{ node.children.length ? '▸' : '·' }}
      </span>
      <span class="tree-name">{{ node.name }}</span>
    </button>

    <!-- Slot: do anything you like with the SVG element -->
    <slot :name="node.name" :el="node.el" :node="node" />

    <!-- Recurse -->
    <ul v-if="node.children.length" class="tree-children" role="group">
      <NodeTreeItem
        v-for="child in node.children"
        :key="child.name"
        :node="child"
        @node-click="emit('node-click', $event)"
      />
    </ul>
  </li>
</template>

<style scoped>
.tree-item {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-label {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.25em 0.5em;
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  color: inherit;
  border-radius: 4px;
  width: 100%;
  text-align: left;
  transition: background 0.1s;
}

.tree-label:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.tree-label:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 1px;
}

.tree-caret {
  font-size: 0.7em;
  opacity: 0.5;
  flex-shrink: 0;
  width: 1em;
  text-align: center;
}

.tree-name {
  font-size: 0.9em;
}

.tree-children {
  list-style: none;
  margin: 0;
  padding: 0 0 0 1.5em;
  border-left: 1px solid color-mix(in srgb, currentColor 15%, transparent);
  margin-left: 0.85em;
}
</style>
