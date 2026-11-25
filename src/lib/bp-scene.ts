// A small blueprint scene, the same drawing language as the Home hero (index.astro), for self-contained figures:
// About's career line and approach machine. Everything lives in one front plane sheared down to the right; housings
// get depth along the receding direction R, which the pointer tilt turns. Hovering a machine magnifies it in place
// while text keeps its size (CSS divides font sizes by --cam-s), so labels spread apart. Packets run Route3 paths.
// Narrow screens (< 900px): packets still run, but the camera stays put (the caller wraps the figure in a sideways
// scroller, so magnifying would fight the scroll). Reduced motion: a still frame.
import { BASE_VIEW, recede, ring, tilt, type View } from "./blueprint";
import { svg_el as el, make_packet, place, set_clean } from "./pipe-packets";

export type P3 = [number, number, number];   // plane x, plane y (down), depth (away from the viewer)
const f = (v: number) => v.toFixed(1);

export class Route3 {
  readonly length: number;
  private readonly cum: number[] = [0];
  constructor(private readonly pts: P3[]) {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      this.cum.push(this.cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
    }
    this.length = this.cum[this.cum.length - 1];
  }
  point(s: number): P3 {
    s = Math.min(Math.max(s, 0), this.length);
    let i = 1;
    while (i < this.cum.length - 1 && this.cum[i] < s) i++;
    const a = this.pts[i - 1], b = this.pts[i], span = this.cum[i] - this.cum[i - 1], u = span ? (s - this.cum[i - 1]) / span : 0;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
  }
}

interface Flow { route: Route3; every: number; t: number; speed: number; marks: { at: number; fn: (g: SVGGElement) => void }[] }
interface Moving { g: SVGGElement; flow: Flow; s: number; a: number; spin: number; done: Set<number> }

export class BpScene {
  readonly svg: SVGSVGElement;
  readonly still: boolean;     // reduced motion: no packets, no camera
  readonly fixed_cam: boolean; // still, or narrow (sideways scroller): packets run, the camera never moves
  readonly layers: Record<"grid" | "back" | "edge" | "core" | "center" | "house" | "packets" | "glass" | "top" | "labels", Element>;
  private readonly cam_g: Element;
  private readonly COS: number;
  private readonly SIN: number;
  private R = { x: 0, y: 0 };
  private redraw: (() => void)[] = [];
  private flows: Flow[] = [];
  private moving: Moving[] = [];
  private cam = { x: 0, y: 0, s: 1 };
  private goal = { x: 0, y: 0, s: 1 };
  private vb = { x: 0, y: 0, w: 0, h: 0 };
  /** Called every frame while running (after packets move). */
  on_frame: ((dt: number) => void) | null = null;

  constructor(svg: SVGSVGElement, slope_deg = 5) {
    this.svg = svg;
    this.still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.fixed_cam = this.still || !matchMedia("(min-width: 900px)").matches;
    const a = (slope_deg * Math.PI) / 180;
    this.COS = Math.cos(a); this.SIN = Math.sin(a);
    svg.replaceChildren();
    this.cam_g = el("g", {}, svg);
    const plane = el("g", { transform: `matrix(${this.COS} ${this.SIN} 0 1 0 0)` }, this.cam_g);
    const names = ["grid", "back", "edge", "core", "center", "house", "packets", "glass", "top"] as const;
    const layers = Object.fromEntries(names.map((k) => [k, el("g", {}, plane)])) as Record<string, Element>;
    layers.labels = el("g", {}, this.cam_g);
    this.layers = layers as BpScene["layers"];
    this.set_view(BASE_VIEW);
  }

  // ---------- projection ----------
  set_view(v: View) {
    const r = recede(v);
    this.R = { x: r.x / this.COS, y: r.y - (this.SIN * r.x) / this.COS };
    for (const fn of this.redraw) fn();
  }
  live(fn: () => void) { fn(); this.redraw.push(fn); }
  at(x: number, y: number, d: number) { return `${f(x + this.R.x * d)},${f(y + this.R.y * d)}`; }
  proj(p: P3) { return { x: p[0] + this.R.x * p[2], y: p[1] + this.R.y * p[2] }; }
  screen(p: P3) { const q = this.proj(p); return { x: this.COS * q.x, y: this.SIN * q.x + q.y }; }

  // ---------- drawing ----------
  group(layer: keyof BpScene["layers"], attrs: Record<string, string> = {}) { return el("g", attrs, this.layers[layer]); }
  tube(pts: P3[]) {
    const parts = (["edge", "core", "center"] as const).map((c) => el("path", { class: `bp-${c}` }, this.layers[c]));
    this.live(() => {
      const d = "M" + pts.map((p) => { const q = this.proj(p); return `${f(q.x)} ${f(q.y)}`; }).join(" L");
      for (const p of parts) p.setAttribute("d", d);
    });
  }
  flange(p: P3, along_x: boolean, parent = this.layers.top) {
    const c = el("polygon", { class: "bp-flange" }, parent);
    this.live(() => { const q = this.proj(p); c.setAttribute("points", along_x ? ring(q.x, q.y, 12.5, this.R, { x: 0, y: 1 }) : ring(q.x, q.y, 12.5, { x: 1, y: 0 }, this.R)); });
  }
  /** Glass housing x0..x1 by y0..y1, centred at depth dc, d deep; hidden edges into `back`, faces into `glass`. */
  housing(x0: number, y0: number, x1: number, y1: number, dc: number, d: number, back: Element, glass: Element) {
    const hidden = el("path", { class: "bp-hidden" }, back);
    const [front, roof, side] = ["bp-front", "bp-roof", "bp-side"].map((c) => el("polygon", { class: `bp-glass ${c}` }, glass));
    const fz = dc - d / 2, bz = dc + d / 2, at = this.at.bind(this);
    this.live(() => {
      hidden.setAttribute("d", `M${at(x0, y1, bz)} L${at(x1, y1, bz)} M${at(x0, y0, bz)} L${at(x0, y1, bz)} M${at(x0, y1, fz)} L${at(x0, y1, bz)}`);
      front.setAttribute("points", [at(x0, y0, fz), at(x1, y0, fz), at(x1, y1, fz), at(x0, y1, fz)].join(" "));
      roof.setAttribute("points", [at(x0, y0, fz), at(x1, y0, fz), at(x1, y0, bz), at(x0, y0, bz)].join(" "));
      side.setAttribute("points", [at(x1, y0, fz), at(x1, y0, bz), at(x1, y1, bz), at(x1, y1, fz)].join(" "));
    });
    return front;
  }
  floor_grid(x0: number, x1: number, y: number, near: number, far: number, step = 24) {
    const path = el("path", { class: "bp-grid" }, this.layers.grid);
    this.live(() => {
      let d = "";
      for (let t = near; t <= far + 0.1; t += step) d += `M${this.at(x0, y, t)} L${this.at(x1, y, t)}`;
      for (let x = x0; x <= x1 + 0.1; x += step) d += `M${this.at(x, y, near)} L${this.at(x, y, far)}`;
      path.setAttribute("d", d);
    });
  }
  /** Upright text anchored to a 3D point. */
  text(p: P3, dy: number, cls: string, value: string, parent: Element = this.layers.labels) {
    const t = el("text", { class: cls }, parent);
    t.textContent = value;
    this.live(() => { const s = this.screen(p); t.setAttribute("x", f(s.x)); t.setAttribute("y", f(s.y + dy)); });
    return t;
  }

  // ---------- packets ----------
  flow(pts: P3[], every: number, speed: number, marks: Flow["marks"] = [], phase = 0) {
    this.flows.push({ route: new Route3(pts), every, t: phase * every, speed, marks });
  }
  private step(dt: number) {
    for (const fl of this.flows) {
      fl.t += dt;
      if (fl.t >= fl.every) {
        fl.t = 0;
        this.moving.push({ g: make_packet(this.layers.packets), flow: fl, s: 0, a: Math.random() * 360, spin: (Math.random() - 0.5) * 400, done: new Set() });
      }
    }
    for (let i = 0; i < this.moving.length; i++) {
      const m = this.moving[i];
      m.s += m.flow.speed * dt;
      if (!m.g.classList.contains("is-clean")) m.a += m.spin * dt;
      const fr = m.s / m.flow.route.length;
      m.flow.marks.forEach((mk, k) => { if (!m.done.has(k) && fr >= mk.at) { m.done.add(k); mk.fn(m.g); } });
      if (fr >= 1) { m.g.remove(); this.moving.splice(i--, 1); continue; }
      const q = this.proj(m.flow.route.point(m.s));
      place(m.g, q.x, q.y, m.g.classList.contains("is-clean") ? 0 : m.a);
    }
  }
  static clean(g: SVGGElement, accent?: string) { if (accent) g.setAttribute("data-accent", accent); set_clean(g); }

  // ---------- fit, camera, loop ----------
  fit(pad = 16) {
    const b = (this.cam_g as SVGGElement).getBBox();
    this.vb = { x: b.x - pad, y: b.y - pad, w: b.width + pad * 2, h: b.height + pad * 2 };
    this.svg.setAttribute("viewBox", `${f(this.vb.x)} ${f(this.vb.y)} ${f(this.vb.w)} ${f(this.vb.h)}`);
    this.svg.style.setProperty("--vb-w", f(this.vb.w));
  }
  /** Magnify around a 3D point (kept inside the figure); null zooms back out. */
  magnify(p: P3 | null, s = 2, half = { w: 80, h: 50 }) {
    if (!p || this.fixed_cam) { this.goal = { x: 0, y: 0, s: 1 }; return; }
    const c = this.screen(p), v = this.vb;
    const tx = Math.min(Math.max(c.x, v.x + half.w * s), v.x + v.w - half.w * s);
    const ty = Math.min(Math.max(c.y, v.y + half.h * s), v.y + v.h - half.h * s);
    this.goal = { s, x: tx - s * c.x, y: ty - s * c.y };
  }
  /** Fly the camera so a box (scene coordinates) fills the visible figure, its centre at `anchor_y` of the height
   *  (0.5 = middle); null shows the whole scene. Uses the area actually on screen (letterboxing included). */
  focus(bb: { x: number; y: number; width: number; height: number } | null, smax = 3, fill = 0.86, anchor_y = 0.5) {
    if (!bb) { this.goal = { x: 0, y: 0, s: 1 }; return; }
    const v = this.vb, r = this.svg.getBoundingClientRect();
    const k = Math.min(r.width / v.w, r.height / v.h) || 1, vw = r.width / k, vh = r.height / k;
    const x0 = v.x - (vw - v.w) / 2, y0 = v.y - (vh - v.h) / 2;
    const s = Math.min(smax, (vw * fill) / bb.width, (vh * fill) / bb.height);
    const ty = Math.max(y0 + vh * anchor_y, y0 + (s * bb.height) / 2 + 12);
    this.goal = { s, x: x0 + vw / 2 - s * (bb.x + bb.width / 2), y: ty - s * (bb.y + bb.height / 2) };
  }
  /** Bounding box of an element in scene coordinates (inside the camera). */
  box_of(el: Element) {
    const b = (el as SVGGraphicsElement).getBBox(), m = (el as SVGGraphicsElement).getCTM(), c = (this.cam_g as SVGGraphicsElement).getCTM();
    if (!m || !c) return b;
    const inv = c.inverse().multiply(m);
    const pts = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(inv));
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
  }
  private cam_step() {
    const c = this.cam, g = this.goal, k = 0.12;
    c.x += (g.x - c.x) * k; c.y += (g.y - c.y) * k; c.s += (g.s - c.s) * k;
    this.cam_g.setAttribute("transform", `translate(${f(c.x)} ${f(c.y)}) scale(${c.s.toFixed(4)})`);
    this.svg.style.setProperty("--cam-s", c.s.toFixed(4));
  }
  /** Start: still frame (pre-warmed) with reduced motion, otherwise run while on screen (narrow screens included). */
  start(host: HTMLElement) {
    for (let i = 0; i < 300; i++) this.step(1 / 30);
    if (this.still) return;
    let running = false, last = 0, on_screen = true;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      this.step(dt);
      this.on_frame?.(dt);
      this.cam_step();
      if (on_screen && !document.hidden) requestAnimationFrame(frame); else running = false;
    };
    const go = () => { if (!running && on_screen && !document.hidden) { running = true; last = performance.now(); requestAnimationFrame(frame); } };
    new IntersectionObserver(([e]) => { on_screen = e.isIntersecting; go(); }).observe(host);
    document.addEventListener("visibilitychange", go);
    tilt(host, (v) => this.set_view(v));
  }
}
