// "Scattered data, joined up": real text assembles from characters scattered across an area.
// The target keeps its own layout the whole time (its text is only made transparent); an aria-hidden overlay of
// per-character clones flies from random scattered poses into each character's measured box, pops like a stamp,
// then the overlay is removed and the real text shown again. Nothing reflows, text stays selectable, and screen
// readers always read the original. The caller hides the target before first paint (see .ts-pending in global.css).

export interface AssembleOptions {
  host: HTMLElement;          // positioned ancestor the overlay is placed in
  area: { left: number; top: number; right: number; bottom: number };   // scatter area, host coordinates
  start_ms: number;
  spread_ms: number;          // time between the first and the last character starting
  max_stagger_ms: number;
  duration_ms: number;
  final_color: string;        // resolved colour of the real text
  raw_color: string;          // colour while scattered
  stamp_color: string;        // colour at the moment of landing
}

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export function assemble(target: HTMLElement, o: AssembleOptions): { done: Promise<void>; finish: () => void } {
  const host_box = o.host.getBoundingClientRect();
  const cs = getComputedStyle(target);
  const layer = document.createElement("div");
  layer.className = "ts-layer";
  layer.setAttribute("aria-hidden", "true");

  // Measure every visible character where the browser actually laid it out.
  const range = document.createRange();
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  const glyphs: { ch: string; x: number; y: number; h: number }[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    for (let i = 0; i < text.length; i++) {
      if (/\s/.test(text[i])) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      glyphs.push({ ch: text[i], x: r.left - host_box.left, y: r.top - host_box.top, h: r.height });
    }
  }

  const stagger = Math.min(o.max_stagger_ms, o.spread_ms / Math.max(glyphs.length - 1, 1));
  const animations = glyphs.map((g, i) => {
    const span = document.createElement("span");
    span.textContent = g.ch;
    Object.assign(span.style, {
      left: `${g.x}px`, top: `${g.y}px`, height: `${g.h}px`, lineHeight: `${g.h}px`,
      fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, fontStyle: cs.fontStyle,
      letterSpacing: cs.letterSpacing, color: o.final_color,
    });
    layer.appendChild(span);
    const dx = rand(o.area.left, o.area.right) - g.x;
    const dy = rand(o.area.top, o.area.bottom) - g.y;
    const scattered = `translate(${dx.toFixed(0)}px, ${dy.toFixed(0)}px) rotate(${rand(-75, 75).toFixed(0)}deg) scale(${rand(0.55, 1.05).toFixed(2)})`;
    return span.animate([
      { transform: scattered, color: o.raw_color, opacity: 0.45 },
      { transform: "translate(0, 0) rotate(0deg) scale(1.22)", color: o.stamp_color, opacity: 1, offset: 0.78 },
      { transform: "none", color: o.final_color, opacity: 1 },
    ], { duration: o.duration_ms, delay: o.start_ms + i * stagger, easing: "cubic-bezier(0.22, 0.9, 0.3, 1)", fill: "both" });
  });
  o.host.appendChild(layer);

  let resolve!: () => void;
  const done = new Promise<void>((r) => { resolve = r; });
  const cleanup = () => { layer.remove(); resolve(); };
  Promise.all(animations.map((a) => a.finished)).then(cleanup, cleanup);
  return { done, finish: () => animations.forEach((a) => a.finish()) };
}
