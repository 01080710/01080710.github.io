// About "factory tour" (wide screens, motion allowed): one blueprint factory pinned beside the text. Each About
// section is a station on one conveyor that snakes down the panel (every row runs left to right; a return pipe drops
// to the next row). Scrolling flies the camera to the station of the section being read; a station draws itself in
// line work the first time the camera arrives, then runs. The reader's own packet rides the conveyor with the scroll
// and ends at a Contact exit. First visit of a session: the factory frame snaps together. Clicking a station scrolls
// to its section. Stations: career line, approach machine, elevator (sky -> sea level -> underwater), certificate
// stamping press, capability module rack, philosophy control panel; Off the Clock (the elevator) comes last. Same drawing language as src/lib/bp-scene.ts.
import { BpScene, Route3, type P3 } from "./bp-scene";
import { svg_el as el, make_packet, place, set_clean } from "./pipe-packets";

export interface FactoryData {
  titles: string[];
  jobs: { company: string; current: boolean; m0: number; m1: number; period: string }[];
  next: string;
  steps: { step: string; title: string }[];
  zones: string[];
  certs: number;
  capabilities: string[];
  principles: string[];
  contact: { label: string; href: string };
}

const ROW = [0, 210, 420, 640, 840, 1110];   // conveyor height of each station row (plane y), in page order
// Station of each section (page order): Off the Clock comes last, as an extra about life outside work.
const POS = { career: 0, approach: 1, certs: 2, capabilities: 3, philosophy: 4, life: 5 };
const X0 = -30, X1 = 590, RET = 110;          // row start / end; return pipe sits RET below a row

export function factory(aside: HTMLElement, sections: HTMLElement[], data: FactoryData) {
  const svg = aside.querySelector<SVGSVGElement>("svg")!;
  const S = new BpScene(svg, 4);
  let first = true;
  try { first = !sessionStorage.getItem("about-tour"); sessionStorage.setItem("about-tour", "1"); } catch { /* replay */ }
  if (first) aside.classList.add("af-assemble");

  // ---------- conveyor: rows joined by return pipes ----------
  const pts: P3[] = [[X0 - 40, ROW[0], 0]];
  const row_in: number[] = [], row_out: number[] = [];
  ROW.forEach((y, i) => {
    pts.push([X0, y, 0], [X1, y, 0]);
    if (i < ROW.length - 1) pts.push([X1 + 30, y, 0], [X1 + 30, y + RET, 0], [X0 - 30, y + RET, 0], [X0 - 30, ROW[i + 1], 0]);
  });
  const exit: P3 = [X1 + 70, ROW[5], 0];
  pts.push(exit);
  const route = new Route3(pts);
  // s along the route of the row points (first occurrences)
  const cum = (target: P3) => {
    let s = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ab = [b[0] - a[0], b[1] - a[1]], at = [target[0] - a[0], target[1] - a[1]];
      const cross = ab[0] * at[1] - ab[1] * at[0], dot = ab[0] * at[0] + ab[1] * at[1];
      if (Math.abs(cross) < 0.5 && dot >= -0.5 && dot <= l * l + 0.5) return s + Math.hypot(at[0], at[1]);
      s += l;
    }
    return s;
  };
  ROW.forEach((y) => { row_in.push(cum([X0, y, 0])); row_out.push(cum([X1, y, 0])); });
  const frac = (x: number, row: number) => cum([x, ROW[row], 0]) / route.length;

  ROW.forEach((y) => S.floor_grid(X0 - 20, X1 + 20, y + 34, -20, 70, 26));
  S.tube(pts);
  // first visit: the conveyor and the floors draw themselves (stroke reveal), station titles slide in
  if (first) {
    const frame = [...S.layers.grid.children, ...S.layers.edge.children, ...S.layers.core.children, ...S.layers.center.children];
    frame.forEach((e) => e.setAttribute("pathLength", "1"));
    setTimeout(() => { frame.forEach((e) => e.removeAttribute("pathLength")); aside.classList.remove("af-assemble"); }, 2600);
  }
  S.flange([X0 - 20, ROW[0], 0], true);
  S.flange([exit[0] - 8, exit[1], 0], true);
  const exit_lab = S.text([exit[0] + 6, exit[1], 0], 4, "bp-name af-exit", `${data.contact.label} →`);
  exit_lab.setAttribute("text-anchor", "start");
  exit_lab.addEventListener("click", () => { location.href = data.contact.href; });

  // ---------- stations ----------
  const stations: { g: Element[]; drawn: boolean; title?: Element }[] = [];
  const station = (i: number) => {
    const attrs = { class: "af-station is-pending", "data-st": String(i) };
    const groups = { back: S.group("back", attrs), house: S.group("house", attrs), glass: S.group("glass", attrs), top: S.group("top", attrs), labels: S.group("labels", attrs) };
    stations[i] = { g: Object.values(groups), drawn: false };
    const title = S.text([X0 + 6, ROW[i] - 62, 0], 0, "af-title", data.titles[i] ?? "", S.group("labels", { class: "af-piece", style: `--d:${0.2 + i * 0.12}s;--dx:-20px;--dy:0px` }));
    title.setAttribute("text-anchor", "start");
    stations[i].title = title;
    return groups;
  };

  // 0 career line: one machine per job, width = months
  {
    const g = station(POS.career), y = ROW[POS.career];
    const m0 = data.jobs[0].m0, m1 = data.jobs[data.jobs.length - 1].m1, span = 440;
    const x_of = (m: number) => 10 + ((m - m0) / (m1 - m0)) * span;
    data.jobs.forEach((j) => {
      const a = x_of(j.m0) + 3, b = x_of(j.m1) - 3, xc = (a + b) / 2;
      const sub = { back: el("g", { class: j.current ? "is-current" : "" }, g.back), glass: el("g", { class: j.current ? "is-current" : "" }, g.glass) };
      S.housing(a, y - 22, b, y + 20, 0, 32, sub.back, sub.glass);
      S.text([xc, y - 22, 16], -8, "bp-name" + (j.current ? " af-current" : ""), j.company, g.labels);
      S.text([xc, y - 22, 16], -21, "bp-sub af-inner", j.period.split(" · ")[0], g.labels);
    });
    const nx = x_of(m1) + 26;
    const sc = { back: el("g", { class: "is-scaffold" }, g.back), glass: el("g", { class: "is-scaffold" }, g.glass) };
    S.housing(nx, y - 22, nx + 90, y + 20, 0, 32, sc.back, sc.glass);
    S.text([nx + 45, y - 22, 16], -8, "bp-name bp-next", data.next, g.labels);
  }
  // 1 approach machine: a cell per step
  const cells: Element[] = [];
  {
    const g = station(POS.approach), y = ROW[POS.approach], n = data.steps.length, CW = 104, x0 = 20;
    S.housing(x0, y - 26, x0 + CW * n, y + 26, 0, 42, g.back, g.glass);
    data.steps.forEach((st, i) => {
      cells.push(el("rect", { x: x0 + i * CW + 4, y: y - 20, width: CW - 8, height: 40, rx: 3, class: "bp-cell" }, g.house));
      S.text([x0 + i * CW + CW / 2, y - 26, 21], -22, "bp-sub bp-step", st.step, g.labels);
      S.text([x0 + i * CW + CW / 2, y - 26, 21], -8, "bp-name", st.title, g.labels);
    });
    el("path", { d: data.steps.slice(1).map((_, i) => `M${x0 + (i + 1) * CW} ${y - 26} V${y + 26}`).join(" "), class: "bp-divider" }, g.house);
  }
  // 2 elevator: a tall shaft, the cab rides with the Off the Clock section's scroll
  let cab: Element | null = null;
  const shaft = { top: ROW[POS.life] - 120, bottom: ROW[POS.life] + 110, x0: 250, x1: 330 };
  {
    const g = station(POS.life);
    S.housing(shaft.x0, shaft.top, shaft.x1, shaft.bottom, 0, 46, g.back, g.glass);
    const band = (shaft.bottom - shaft.top) / data.zones.length;
    data.zones.forEach((z, i) => {
      const yz = shaft.top + band * (i + 0.5);
      S.text([shaft.x1 + 14, yz, 0], 4, "bp-name af-zone", z, g.labels).setAttribute("text-anchor", "start");
      if (i > 0) el("path", { d: `M${shaft.x0 - 30} ${shaft.top + band * i} q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0`, class: "af-wave" }, g.house);
    });
    cab = el("rect", { x: shaft.x0 + 8, y: shaft.top + 4, width: shaft.x1 - shaft.x0 - 16, height: 30, rx: 3, class: "af-cab" }, g.house);
  }
  // 3 stamping press: cards ride under a press head and get sealed
  const cards: Element[] = [];
  let press: Element | null = null;
  {
    const g = station(POS.certs), y = ROW[POS.certs], n = Math.max(data.certs, 1), px = 300;
    const gap = Math.min(30, 440 / n);
    for (let i = 0; i < n; i++) {
      const cx = 30 + i * gap;
      const card = el("g", { class: "af-card" }, g.house);
      el("rect", { x: cx, y: y - 16, width: gap - 6, height: 12, rx: 1.5, class: "af-card-body" }, card);
      el("circle", { cx: cx + (gap - 6) / 2, cy: y - 10, r: 3.2, class: "af-seal" }, card);
      cards.push(card);
    }
    S.housing(px - 30, y - 92, px + 30, y - 52, 0, 40, g.back, g.glass);
    press = el("rect", { x: px - 10, y: y - 52, width: 20, height: 26, rx: 2, class: "af-press" }, g.house);
  }
  // 4 module rack: capability modules plugged onto the bus
  const modules: Element[] = [];
  {
    const g = station(POS.capabilities), y = ROW[POS.capabilities], n = data.capabilities.length, MW = 540 / n;
    data.capabilities.forEach((c, i) => {
      const a = 20 + i * MW, b = a + MW - 8;
      const sub = { back: el("g", {}, g.back), glass: el("g", { class: "af-module" }, g.glass) };
      S.housing(a, y - 44, b, y - 14, 0, 30, sub.back, sub.glass);
      modules.push(sub.glass);
      const t = S.text([(a + b) / 2 - 6, y - 44, 15], -6, "bp-sub af-inner af-callout", c, g.labels);
      t.setAttribute("text-anchor", "start");
      S.live(() => t.setAttribute("transform", `rotate(-32 ${t.getAttribute("x")} ${t.getAttribute("y")})`));
    });
  }
  // 5 control panel: a switch and a gauge per principle
  const units: Element[] = [];
  {
    const g = station(POS.philosophy), y = ROW[POS.philosophy], n = data.principles.length, UW = 520 / n;
    S.housing(20, y - 70, 560, y - 16, 0, 36, g.back, g.glass);
    data.principles.forEach((p, i) => {
      const cx = 20 + UW * (i + 0.5);
      const u = el("g", { class: "af-unit" }, g.house);
      el("circle", { cx, cy: y - 50, r: 11, class: "af-gauge" }, u);
      el("line", { x1: cx, y1: y - 50, x2: cx, y2: y - 59, class: "af-needle", style: `transform-origin:${cx}px ${y - 50}px` }, u);
      el("rect", { x: cx - 7, y: y - 34, width: 14, height: 10, rx: 2, class: "af-switch" }, u);
      units.push(u);
      const [l1, l2] = p.includes("，") ? [p.slice(0, p.indexOf("，") + 1), p.slice(p.indexOf("，") + 1)] : p.includes(", ") ? [p.slice(0, p.indexOf(", ") + 1), p.slice(p.indexOf(", ") + 2)] : [p, ""];
      S.text([cx, y - 16, 0], 16, "bp-sub af-inner af-principle", l1, g.labels);
      if (l2) S.text([cx, y - 16, 0], 30, "bp-sub af-inner af-principle", l2, g.labels);
    });
  }

  // ---------- packets: ambient flow along the whole conveyor, driving each station ----------
  const job_x = (i: number) => { const m0 = data.jobs[0].m0, m1 = data.jobs[data.jobs.length - 1].m1, j = data.jobs[i]; return 10 + (((j.m0 + j.m1) / 2 - m0) / (m1 - m0)) * 440; };
  const cur = data.jobs.findIndex((j) => j.current);
  let card_i = 0;
  const marks = [
    { at: frac(job_x(0), POS.career), fn: (g: SVGGElement) => set_clean(g) },
    ...(cur >= 0 ? [{ at: frac(job_x(cur), POS.career), fn: (g: SVGGElement) => g.classList.add("is-mine") }] : []),
    ...data.steps.map((_, i) => ({ at: frac(20 + i * 104 + 52, POS.approach), fn: () => cells.forEach((c, k) => c.classList.toggle("is-on", k === i)) })),
    { at: frac(300, POS.certs), fn: () => {
      press?.animate([{ translate: "0 0" }, { translate: "0 8px", offset: 0.4 }, { translate: "0 0" }], { duration: 380, easing: "cubic-bezier(0.34, 1.6, 0.64, 1)" });
      if (card_i >= cards.length) { cards.forEach((c) => c.classList.remove("is-stamped")); card_i = 0; }
      cards[card_i++]?.classList.add("is-stamped");
    } },
    ...data.capabilities.map((_, i) => ({ at: frac(20 + i * (540 / data.capabilities.length) + 30, POS.capabilities), fn: () => {
      modules[i]?.animate([{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }], { duration: 500 });
      modules[i]?.classList.add("is-on");
    } })),
    ...data.principles.map((_, i) => ({ at: frac(20 + (520 / data.principles.length) * (i + 0.5), POS.philosophy), fn: () => units[i]?.classList.toggle("is-on") })),
  ].sort((a, b) => a.at - b.at);
  S.flow(pts, 1.4, 120, marks);
  S.fit(18);
  // text keeps its screen size whatever the camera and the panel's scale (CSS divides by --cam-s * --vb-k)
  const vb = svg.viewBox.baseVal;
  const set_k = () => { const r = svg.getBoundingClientRect(); svg.style.setProperty("--vb-k", Math.min(r.width / vb.width, r.height / vb.height).toFixed(4)); };
  set_k();
  new ResizeObserver(set_k).observe(svg);

  // ---------- the reader's packet + camera, driven by the scroll ----------
  const me = make_packet(S.layers.packets, true);
  set_clean(me);
  let s_me = 0, s_goal = 0, active = -2;
  const station_box = (i: number, extra: Element[] = []) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const g of [...stations[i].g, ...(stations[i].title ? [stations[i].title!] : []), ...extra]) {
      const b = S.box_of(g);
      if (!b.width && !b.height) continue;
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
    }
    return { x: x0 - 20, y: y0 - 30, width: x1 - x0 + 40, height: y1 - y0 + 50 };
  };
  const draw_in = (i: number) => {
    const st = stations[i];
    if (st.drawn) return;
    st.drawn = true;
    for (const g of st.g) {
      g.classList.remove("is-pending");
      g.querySelectorAll("path, polygon, rect, circle, line").forEach((e) => e.setAttribute("pathLength", "1"));
      g.classList.add("is-drawing");
    }
    setTimeout(() => st.g.forEach((g) => {
      g.classList.remove("is-drawing");
      g.querySelectorAll("[pathLength]").forEach((e) => e.removeAttribute("pathLength"));
    }), 1400);
  };
  const update = () => {
    const vh = innerHeight, line = vh * 0.45;
    let idx = -1, p = 0;
    sections.forEach((sec, i) => {
      const r = sec.getBoundingClientRect();
      if (r.top <= line) { idx = i; p = Math.min(Math.max((line - r.top) / r.height, 0), 1); }
    });
    if (idx < 0) {
      const r = sections[0].getBoundingClientRect();
      s_goal = row_in[0] * Math.min(Math.max(1 - (r.top - line) / vh, 0), 1);
    } else {
      const at_end = scrollY + vh >= document.documentElement.scrollHeight - 4;
      s_goal = at_end && idx === sections.length - 1 ? route.length : row_in[idx] + p * (row_out[idx] - row_in[idx]);
      if (idx === POS.life && cab) cab.setAttribute("y", String(shaft.top + 4 + p * (shaft.bottom - shaft.top - 38)));
    }
    const at_bottom = scrollY + vh >= document.documentElement.scrollHeight - 4;
    if (at_bottom && active !== 99 && idx === sections.length - 1) {
      active = 99;
      S.focus(station_box(idx, [exit_lab]), 2.6, 0.96, 0.4);
    } else if (idx !== active && !(active === 99 && at_bottom)) {
      active = idx;
      stations.forEach((st, i) => st.g.forEach((g) => g.classList.toggle("is-active", i === idx)));
      if (idx >= 0) { draw_in(idx); S.focus(station_box(idx), 2.6, 0.96, 0.34); } else S.focus(null);
    }
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  S.on_frame = () => {
    s_me += (s_goal - s_me) * 0.08;
    const q = S.proj(route.point(s_me));
    place(me, q.x, q.y, 0);
  };
  // clicking a station scrolls to its section
  svg.addEventListener("click", (e) => {
    const st = (e.target as Element).closest("[data-st]")?.getAttribute("data-st");
    if (st != null) sections[Number(st)]?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  update();
  S.start(aside);
}
