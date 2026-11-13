<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount, computed } from 'vue';

const props = defineProps<{ svg: SVGSVGElement }>();
const svg = props.svg;
const feedsTo = reactive<Record<string, SVGGraphicsElement[]>>({})
const byName = reactive<Record<string, SVGGraphicsElement>>({})


function mapClick(e: MouseEvent) {
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

  svg.addEventListener("click", mapClick);

  const dLayer = svg.querySelector('g[inkscape\\:groupmode="layer"][inkscape\\:label="Electric Distribution"]') as Element;
  const cLayer = svg.querySelector('g[inkscape\\:groupmode="layer"][inkscape\\:label="Electric Outlets"]') as Element;

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
    }

    if (name || source) {
      text.style.cursor = "pointer";
    }
  }
});


onBeforeUnmount(() => {
  svg.removeEventListener("click", mapClick);
});

function getCenter(el: SVGGraphicsElement) {
  const bbox = el.getBBox();

  // element's local coords -> screen -> svg root user space.
  // (getCTM() already includes the viewBox scaling, which the root-level
  // line would then get applied a second time)
  const m = svg.getScreenCTM()!.inverse().multiply(el.getScreenCTM()!);

  // center point in local coords
  const pt = svg.createSVGPoint();
  pt.x = bbox.x + bbox.width / 2;
  pt.y = bbox.y + bbox.height / 2;
  return pt.matrixTransform(m);
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