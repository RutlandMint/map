export interface Layer {
  id: string
  label: string
  el: SVGGElement
  visible: boolean
  children: Layer[]
}

function isLayer(el: Element): boolean {
  return el.getAttribute('inkscape:groupmode') === 'layer' || /^layer\d+$/.test(el.id)
}

export function parseLayers(svg: SVGSVGElement): Layer[] {
  const walk = (parent: Element): Layer[] => {
    const result: Layer[] = []
    for (const el of Array.from(parent.children)) {
      if (el.localName !== 'g') {
        continue
      }
      if (isLayer(el)) {
        result.push({
          id: el.id,
          label: el.getAttribute('inkscape:label') ?? el.id,
          el: el as SVGGElement,
          visible: (el as SVGGElement).style.display !== 'none',
          children: walk(el),
        })
      } else {
        // plain (non-layer) group: look through it for layers
        result.push(...walk(el))
      }
    }
    return result
  }

  return walk(svg)
}
