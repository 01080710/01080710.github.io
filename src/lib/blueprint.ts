// Blueprint drawing helpers shared by the Home hero and the pipeline view.
// The scenes are axonometric line drawings: every pipe runs in one "front plane", and housings get depth along a
// receding direction (up and to the right). `View` is that direction: `ang` degrees above horizontal, `k` the
// foreshortening of depth (0.5 = half scale, as in engineering dimetric drawings).
// Tilt: the pointer turns the receding direction a little, so the scene seems to rotate under the cursor while
// every pipe (and every packet on it) stays put. Reduced motion: no tilt, the base view only.

export interface View { ang: number; k: number }
export const BASE_VIEW: View = { ang: 40, k: 0.5 };

/** Screen offset of one unit of depth (y grows downward, so receding = negative y). */
export function recede(v: View): { x: number; y: number } {
  const a = (v.ang * Math.PI) / 180;
  return { x: v.k * Math.cos(a), y: -v.k * Math.sin(a) };
}

/** Points of a circle of radius r around (cx, cy) whose plane is spanned by unit vectors u and w (screen space). */
export function ring(cx: number, cy: number, r: number, u: { x: number; y: number }, w: { x: number; y: number }, n = 28): string {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t) * r, s = Math.sin(t) * r;
    pts.push(`${(cx + c * u.x + s * w.x).toFixed(1)},${(cy + c * u.y + s * w.y).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Sets the stacked-sheet direction used by .layered cards (CSS --lx-k / --ly-k) from a view. */
export function set_layer_tilt(el: HTMLElement, v: View | null) {
  if (!v) { el.style.removeProperty("--lx-k"); el.style.removeProperty("--ly-k"); return; }
  const r = recede(v), base = recede(BASE_VIEW);
  el.style.setProperty("--lx-k", (r.x / base.x).toFixed(3));
  el.style.setProperty("--ly-k", (-r.y / -base.y).toFixed(3));
}

/**
 * Pointer tilt over `host`: moving across it turns the view up to ±`swing` degrees and changes the foreshortening a
 * little; leaving eases back to the base view. Calls `apply` once per animation frame while the view is moving.
 * Returns a function that detaches the listeners. Does nothing under reduced motion.
 */
export function tilt(host: HTMLElement, apply: (v: View) => void, swing = 12, base: View = BASE_VIEW): () => void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const cur = { ...base }, goal = { ...base };
  let raf = 0;
  const frame = () => {
    cur.ang += (goal.ang - cur.ang) * 0.14;
    cur.k += (goal.k - cur.k) * 0.14;
    apply({ ...cur });
    if (Math.abs(goal.ang - cur.ang) > 0.05 || Math.abs(goal.k - cur.k) > 0.001) raf = requestAnimationFrame(frame);
    else raf = 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const move = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const b = host.getBoundingClientRect();
    const px = Math.min(Math.max((e.clientX - b.left) / b.width, 0), 1) - 0.5;
    const py = Math.min(Math.max((e.clientY - b.top) / b.height, 0), 1) - 0.5;
    goal.ang = base.ang - px * 2 * swing;
    goal.k = base.k - py * 0.14;
    kick();
  };
  const leave = () => { goal.ang = base.ang; goal.k = base.k; kick(); };
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", leave);
  return () => {
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerleave", leave);
    cancelAnimationFrame(raf);
  };
}
