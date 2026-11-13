<template>
  <div v-html="Map" @click="mapClick"></div>
  <NodeTree :fed-from="fedFrom" :feeds-to="feedsTo" :by-name="byName" @node-click="handleNodeClick" />
</template>

<script setup lang="ts">
import NodeTree from './NodeTree.vue';
import { reactive, onMounted, computed } from 'vue';
import Map from "../assets/MINT_floor_plan.svg?raw";

let svg: SVGSVGElement;
const fedFrom = reactive<Record<string, string>>({})
const feedsTo = reactive<Record<string, SVGGraphicsElement[]>>({})
const byName = reactive<Record<string, SVGGraphicsElement>>({})


function handleNodeClick(payload: { name: string; el: SVGGraphicsElement }) {
  console.log(payload.name, payload.el)
}

function mapClick(e: PointerEvent) {
  let text = (e.target as Element).parentElement as SVGGraphicsElement | null;
  if (!text)
    return;

  traceFeed(text);
  traceDown(text);
}

function traceDown(text: SVGGraphicsElement) {
  let name = text.dataset.name!;
  for (let to of feedsTo[name] || []) {
    drawLine(text, to);
    traceDown(to);
  }
}

function traceFeed(text: SVGGraphicsElement) {
  while (text) {
    let fedFrom: SVGGraphicsElement = byName[text.dataset.fedFrom!]!;
    if (!fedFrom)
      break;
    drawLine(fedFrom, text, "blue");
    text = fedFrom;
  }
}

onMounted(() => {
  svg = document.querySelector("svg") as SVGSVGElement;

  if (!svg.querySelector("#arrowhead")) {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <marker id="arrowhead" markerWidth="6" markerHeight="4" 
              refX="6" refY="2" orient="auto">
        <polygon points="0 0, 6 2, 0 4" fill="context-stroke" />
      </marker>
    `;
    svg.prepend(defs);
  }

  const dLayer = document.querySelector('g[inkscape\\:groupmode="layer"][inkscape\\:label="Electric Distribution"]') as Element;
  const cLayer = document.querySelector('g[inkscape\\:groupmode="layer"][inkscape\\:label="Electric Outlets"]') as Element;

  const dText = dLayer.querySelectorAll("text");
  const cText = cLayer.querySelectorAll("text");

  let noName = 0;
  for (let text of [...dText, ...cText]) {
    const t = text.textContent;
    const match = t.match(/^(.*?)\s*\((.*?)\)$/) ?? t.match(/^\((.*?)\)$/) ?? [null, t, null];
    let [, name, source] = match;

    if (source && !name) {
      name = `${noName++} (${source})`;
    }
    text.dataset.name = name;
    byName[name] = text;

    if (source) {
      text.dataset.fedFrom = source;
      feedsTo[source] ??= [];
      feedsTo[source].push(text);
      fedFrom[name] = source;
    }

    if (name || source) {
      text.style.cursor = "pointer";
    }
  }
});



function getCenter(el: SVGGraphicsElement) {
  const bbox = el.getBBox();
  const ctm = el.getCTM()!;

  // center point in local coords
  const x = bbox.x + bbox.width / 2;
  const y = bbox.y + bbox.height / 2;

  // transform to SVG root coords
  const pt = svg.createSVGPoint();
  pt.x = x;
  pt.y = y;
  return pt.matrixTransform(ctm);
}

function drawLine(a: SVGGraphicsElement, b: SVGGraphicsElement, color: string = "black") {
  const from = getCenter(a);
  const to = getCenter(b);

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", String(from.x));
  line.setAttribute("y1", String(from.y));
  line.setAttribute("x2", String(to.x));
  line.setAttribute("y2", String(to.y));
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", "3");
  line.setAttribute("marker-end", "url(#arrowhead)");

  svg.appendChild(line);  // append to root so no extra transforms apply
}

</script>



<style scoped>
div {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  border: 2px solid red;
}

svg {
  object-fit: cover;
}
</style>
