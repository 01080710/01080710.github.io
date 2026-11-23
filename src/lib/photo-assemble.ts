// Home hero, first visit: the photo starts as a blueprint line drawing (edges traced from the photo itself) and each
// live project's first packet to arrive reveals one band of the real photo, bottom up, with a scan line in that
// project's colour. All projects in = the full picture ("data scattered across systems, joined into the whole").
// Progressive enhancement: the <img> is untouched until this runs; finish() (or the deadline) shows it in full.

export interface PhotoAssembly {
  arrive(accent: string): void;
  finish(): void;
}

const NOOP: PhotoAssembly = { arrive() {}, finish() {} };

/** Trace the edges of `img` (as laid out: object-fit cover, object-position 50% 30%) into `canvas`. */
function trace(img: HTMLImageElement, canvas: HTMLCanvasElement) {
  const w = img.clientWidth, h = img.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.round(w * dpr), H = Math.round(h * dpr);
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  // object-fit: cover with object-position 50% 30%
  const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
  ctx.drawImage(img, (W - dw) * 0.5, (H - dh) * 0.3, dw, dh);
  const src = ctx.getImageData(0, 0, W, H).data;

  // luminance, then a 3x3 box blur so skin texture does not turn into noise
  const lum = new Float32Array(W * H), blur = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) lum[i] = 0.299 * src[i * 4] + 0.587 * src[i * 4 + 1] + 0.114 * src[i * 4 + 2];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    let sum = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) sum += lum[(y + dy) * W + x + dx];
    blur[y * W + x] = sum / 9;
  }
  // Sobel magnitude -> line opacity
  const tokens = getComputedStyle(canvas);
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.fillStyle = tokens.getPropertyValue("--accent").trim() || "#2f4f8f";
  const hex = probe.fillStyle as string;   // normalised to #rrggbb
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const mag = new Float32Array(W * H), dir = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    const gx = -blur[i - W - 1] - 2 * blur[i - 1] - blur[i + W - 1] + blur[i - W + 1] + 2 * blur[i + 1] + blur[i + W + 1];
    const gy = -blur[i - W - 1] - 2 * blur[i - W] - blur[i - W + 1] + blur[i + W - 1] + 2 * blur[i + W] + blur[i + W + 1];
    mag[i] = Math.hypot(gx, gy);
    // gradient direction quantised to 0: horizontal, 1: 45deg, 2: vertical, 3: 135deg
    const a = ((Math.atan2(gy, gx) * 180) / Math.PI + 180) % 180;
    dir[i] = a < 22.5 || a >= 157.5 ? 0 : a < 67.5 ? 1 : a < 112.5 ? 2 : 3;
  }
  // non-maximum suppression: keep only the ridge of each edge, so lines are one pixel wide
  const STEP = [1, W + 1, W, W - 1];
  const out = ctx.createImageData(W, H), o = out.data;
  const LO = 26, HI = 90;
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    const i = y * W + x, m = mag[i];
    if (m < LO) continue;
    const d = STEP[dir[i]];
    if (m < mag[i - d] || m < mag[i + d]) continue;
    o[i * 4] = r; o[i * 4 + 1] = g; o[i * 4 + 2] = b;
    o[i * 4 + 3] = Math.round(255 * Math.min(1, (m - LO) / (HI - LO)));
  }
  ctx.clearRect(0, 0, W, H);
  ctx.putImageData(out, 0, 0);
}

export function assemble_photo(wrap: HTMLElement, bands: number, deadline_ms: number): PhotoAssembly {
  const img = wrap.querySelector<HTMLImageElement>("img");
  if (!img || bands < 1) return NOOP;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-trace";
  canvas.setAttribute("aria-hidden", "true");
  const scan = document.createElement("span");
  scan.className = "hero-scan";
  scan.setAttribute("aria-hidden", "true");
  wrap.classList.add("is-assembling");
  img.before(canvas);
  img.after(scan);

  const seen = new Set<string>();
  let done = false;
  const set_level = (k: number) => {
    const shown = (k / bands) * 100;
    wrap.style.setProperty("--reveal", `${100 - shown}%`);
  };
  set_level(0);

  const draw = () => { try { trace(img, canvas); } catch { finish(); } };
  if (img.complete && img.naturalWidth) draw();
  else img.addEventListener("load", draw, { once: true });
  const on_theme = () => { if (!done) draw(); };
  document.addEventListener("themechange", on_theme);

  function finish() {
    if (done) return;
    done = true;
    clearTimeout(timer);
    document.removeEventListener("themechange", on_theme);
    set_level(bands);
    scan.classList.add("is-out");
    // let the last band's transition land, then drop the drawing
    setTimeout(() => {
      wrap.classList.remove("is-assembling");
      wrap.style.removeProperty("--reveal");
      canvas.remove(); scan.remove();
    }, 900);
  }
  const timer = setTimeout(finish, deadline_ms);

  return {
    arrive(accent: string) {
      if (done || seen.has(accent)) return;
      seen.add(accent);
      scan.dataset.accent = accent;
      scan.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 900 });
      set_level(seen.size);
      if (seen.size >= bands) finish();
    },
    finish,
  };
}
