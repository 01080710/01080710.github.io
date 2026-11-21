// Per-company system map data shared by SystemMap.astro (drawing) and i18n/projects.ts (card order).
// Add a company: add its map name here, to the `system_map` enums in content.config.ts, and a drawing in SystemMap.astro.

export type MapName = "hytech" | "weishuo";
export type MapArea = "ticket" | "credit-card" | "drop-order" | "account" | "noise-enforcement";

// Reading order of each map's areas, left to right; Home impact cards follow it so cards line up with the map.
export const map_area_order: Record<MapName, MapArea[]> = {
  hytech:  ["credit-card", "ticket", "account", "drop-order"],
  weishuo: ["noise-enforcement"],
};

// Case study pages zoom into their own area instead of repeating the full map shown on Home.
// Each value is an SVG viewBox ("x y width height") inside the full 960x484 drawing in SystemMap.astro.
export const map_crops: Record<MapName, Partial<Record<MapArea, string>>> = {
  hytech: {
    "credit-card": "24 112 540 128",   // Credit Card PSP <-> Bridger <-> CRM
    "drop-order":  "388 0 572 360",    // Client Portal / CRM <-> CPS -> channels
    "account":     "380 138 200 226",  // CRM -> MetaTrader -> CRM trading history
    "ticket":      "24 238 600 244",   // Freshservice -> Ticket Pipeline, OP groups, other teams
  },
  // One project covers the whole data chain, so the case study shows the full spine drawing.
  weishuo: {
    "noise-enforcement": "0 0 960 325",
  },
};

// Short project tags drawn on the overview map (Home), next to each area. Keep them short: they sit inside the SVG.
export const map_tags: Record<"zh" | "en", Record<MapArea, string>> = {
  zh: { "credit-card": "信用卡異常偵測", "ticket": "工單資料管線", "account": "帳務自動化引擎", "drop-order": "掉單監控", "noise-enforcement": "本人負責的資料鏈" },
  en: { "credit-card": "Card anomaly",   "ticket": "Ticket pipeline", "account": "Account engine",   "drop-order": "Drop-order monitor", "noise-enforcement": "My part of the chain" },
};
