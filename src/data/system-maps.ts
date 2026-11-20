// Per-company system map data shared by SystemMap.astro (drawing) and i18n/projects.ts (card order).
// Add a company: add its map name here, to the `system_map` enums in content.config.ts, and a drawing in SystemMap.astro.

export type MapName = "hytech";
export type MapArea = "ticket" | "credit-card" | "drop-order" | "account";

// Reading order of each map's areas, left to right; Home impact cards follow it so cards line up with the map.
export const map_area_order: Record<MapName, MapArea[]> = {
  hytech: ["credit-card", "ticket", "account", "drop-order"],
};

// Short project tags drawn on the overview map (Home), next to each area. Keep them short: they sit inside the SVG.
export const map_tags: Record<"zh" | "en", Record<MapArea, string>> = {
  zh: { "credit-card": "信用卡異常偵測", "ticket": "工單資料管線", "account": "帳務自動化引擎", "drop-order": "掉單監控" },
  en: { "credit-card": "Card anomaly",   "ticket": "Ticket pipeline", "account": "Account engine",   "drop-order": "Drop-order monitor" },
};
