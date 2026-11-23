// Geometry of the exploded project machine at the top of a case study (MachineView.astro): the same glass machine as
// on the Home hero, pulled apart into its layers (src/data/machines.ts), stacked top to bottom with a pipe running
// down through all of them. Pure functions: the page is rendered with BASE_VIEW at build time, and the client
// re-renders the same shapes when the pointer tilt turns the view.
import { recede, type View } from "./blueprint";

export const MV = {
  X0: 10,       // left edge of the slabs
  W: 132,       // slab width
  SLAB: 16,     // slab height
  PITCH: 74,    // vertical distance between slabs (room for a three-line label)
  D: 56,        // slab depth
  TOP: 44,      // first slab's top (room above for the pipe coming in)
  TAIL: 34,     // pipe below the last slab
};

export interface SlabShapes { front: string; roof: string; side: string; hidden: string }

const pt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

/** Polygons of slab i (0 = top) for a view. */
export function slab(i: number, v: View): SlabShapes {
  const r = recede(v), d = MV.D;
  const x0 = MV.X0, x1 = MV.X0 + MV.W, y0 = slab_top(i), y1 = y0 + MV.SLAB;
  const P = (x: number, y: number, t: number) => pt(x + r.x * t, y + r.y * t);
  return {
    front: [P(x0, y0, 0), P(x1, y0, 0), P(x1, y1, 0), P(x0, y1, 0)].join(" "),
    roof: [P(x0, y0, 0), P(x1, y0, 0), P(x1, y0, d), P(x0, y0, d)].join(" "),
    side: [P(x1, y0, 0), P(x1, y0, d), P(x1, y1, d), P(x1, y1, 0)].join(" "),
    hidden: `M${P(x0, y1, d)} L${P(x1, y1, d)} M${P(x0, y0, d)} L${P(x0, y1, d)} M${P(x0, y1, 0)} L${P(x0, y1, d)}`,
  };
}

export const slab_top = (i: number) => MV.TOP + i * MV.PITCH;
/** Centre of slab i on screen (its middle, half-way back). */
export function slab_center(i: number, v: View) {
  const r = recede(v), t = MV.D / 2;
  return { x: MV.X0 + MV.W / 2 + r.x * t, y: slab_top(i) + MV.SLAB / 2 + r.y * t };
}
/** The pipe down the middle of the stack, half-way back. */
export function pipe(n: number, v: View): string {
  const a = slab_center(0, v), b = slab_center(n - 1, v);
  return `M${a.x.toFixed(1)} ${(a.y - MV.TOP + 4).toFixed(1)} V${(b.y + MV.TAIL).toFixed(1)}`;
}
/** Leader from slab i's right side to the right edge of the drawing, where its label starts. */
export function leader(i: number, v: View, right: number): string {
  const r = recede(v), y = slab_top(i) + MV.SLAB / 2;
  return `M${(MV.X0 + MV.W + r.x * MV.D / 2 + 4).toFixed(1)} ${(y + r.y * MV.D / 2).toFixed(1)} H${right.toFixed(1)}`;
}
export function size(n: number, v: View) {
  const r = recede(v);
  return { w: Math.ceil(MV.X0 + MV.W + r.x * MV.D + 30), h: Math.ceil(slab_top(n - 1) + MV.SLAB + MV.TAIL + 6) };
}
