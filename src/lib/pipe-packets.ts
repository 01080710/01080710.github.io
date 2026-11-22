// Shared "noise in, order out" packets for the Home hero pipeline and the Contact pipes.
// Raw packets are irregular shapes (data before it is cleaned); set_clean() morphs one into a stamped seal
// (CSS in global.css, .pk-*). Route samples an SVG path once so packets can be placed by distance every frame.

const NS = "http://www.w3.org/2000/svg";

export function svg_el(tag: string, attrs: Record<string, string | number>, parent: Element): SVGElement {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  parent.appendChild(node);
  return node;
}

// Centred on 0,0, about 14px across: triangle, square, diamond, shard, pentagon.
const RAW_SHAPES = [
  "M0 -7.5 L7 5.2 H-7 Z",
  "M-5.7 -5.7 H5.7 V5.7 H-5.7 Z",
  "M0 -8 L6.3 0 L0 8 L-6.3 0 Z",
  "M-6.9 -3.5 L2.3 -7.5 L7.5 1.2 L1.2 6.3 L-5.2 4 Z",
  "M0 -7.5 L7.1 -2.3 L4.4 6.1 H-4.4 L-7.1 -2.3 Z",
];

export function make_packet(layer: Element, mine = false): SVGGElement {
  const g = svg_el("g", { class: mine ? "pk is-mine" : "pk" }, layer) as SVGGElement;
  const shape = RAW_SHAPES[Math.floor(Math.random() * RAW_SHAPES.length)];
  svg_el("path", { d: shape, class: "pk-raw", "fill-opacity": mine ? 1 : (0.7 + Math.random() * 0.3).toFixed(2) }, g);
  const seal = svg_el("g", { class: "pk-clean" }, g);
  svg_el("circle", { r: 7, class: "pk-seal" }, seal);
  svg_el("circle", { r: 2.6, class: "pk-core" }, seal);
  return g;
}

export const set_clean = (g: SVGGElement) => g.classList.add("is-clean");

export function place(g: SVGGElement, x: number, y: number, angle: number) {
  g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(0)})`);
}

export const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export class Route {
  readonly length: number;
  private readonly xs: Float32Array;
  private readonly ys: Float32Array;
  private readonly step: number;

  constructor(path: SVGPathElement, sample_px = 2) {
    this.length = path.getTotalLength();
    const n = Math.max(2, Math.ceil(this.length / sample_px) + 1);
    this.step = this.length / (n - 1);
    this.xs = new Float32Array(n);
    this.ys = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const p = path.getPointAtLength(i * this.step);
      this.xs[i] = p.x;
      this.ys[i] = p.y;
    }
  }

  at(s: number): { x: number; y: number } {
    const f = Math.min(Math.max(s, 0), this.length) / this.step;
    const i = Math.min(Math.floor(f), this.xs.length - 2);
    const u = f - i;
    return { x: this.xs[i] + (this.xs[i + 1] - this.xs[i]) * u, y: this.ys[i] + (this.ys[i + 1] - this.ys[i]) * u };
  }
}
