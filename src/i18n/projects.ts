// Projects in a page language.
// zh: entries from src/content/projects as-is.
// en: same entries with text fields replaced from src/content/projects-en/<id>.md; dates, stack, categories,
// metric values and the system map stay from the zh file so each number has one source.
import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "./ui";
import { map_area_order } from "../data/system-maps";
import { focus_groups } from "../data/focus-groups";

export interface LocalizedProject {
  id:   string;
  data: CollectionEntry<"projects">["data"];
  // Entry whose Markdown body is rendered on the case study page.
  body: CollectionEntry<"projects"> | CollectionEntry<"projects_en">;
}

// Home keyword strip, derived from the project files so it never needs hand upkeep:
// focus terms are shown in the capability groups of data/focus-groups.ts;
// tools = `stack` items used in 3+ projects, most used first, so only the signature tools remain.
export interface KeywordGroup { label: string; terms: string[] }

export async function get_keywords(lang: Lang): Promise<{ groups: KeywordGroup[]; tools: string[] }> {
  const projects = await get_projects("zh");
  const used = new Set(projects.flatMap((p) => p.data.focus ?? []));
  const grouped = new Set(focus_groups.flatMap((g) => g.focus));
  const missing = [...used].filter((f) => !grouped.has(f));
  if (missing.length) throw new Error(`focus not in any group of src/data/focus-groups.ts: ${missing.join(", ")}`);
  const groups = focus_groups
    .map((g) => ({
      label: g[lang],
      terms: g.focus.filter((f) => used.has(f)),
    }))
    .filter((g) => g.terms.length > 0);
  const count = new Map<string, number>();
  for (const tool of projects.flatMap((p) => p.data.stack)) count.set(tool, (count.get(tool) ?? 0) + 1);
  const tools = [...count].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).map(([tool]) => tool);
  return { groups, tools };
}

// Home impact map: every project drawn on a company system map, finished ones first, in the map's left-to-right order
// (data/system-maps.ts). ImpactMap.astro groups them by `system_map.map` (one map and dropdown option per company).
// A project with `home` shows its `on_home` metrics; one without it is shown as "in progress" with no numbers.
// Fails the build when a Home project still has an "XX" placeholder, has more than 2 `on_home` metrics,
// or a mapped project lacks `impact` text, so Home never shows an unfinished number or an empty card.
export async function get_impact_projects(lang: Lang): Promise<LocalizedProject[]> {
  const mapped = (await get_projects(lang)).filter((p) => p.data.system_map);
  for (const p of mapped) {
    if (!p.data.impact) throw new Error(`projects/${p.id}.md: add \`impact: { before, after }\` (zh and en) for the Home impact map.`);
    if (!p.data.home) continue;
    if (p.data.metrics.some((m) => /XX/.test(m.value))) {
      throw new Error(`projects/${p.id}.md has an "XX" placeholder metric; remove its \`home\` entry until the number is final.`);
    }
    if (p.data.metrics.filter((m) => m.on_home).length > 2) {
      throw new Error(`projects/${p.id}.md: at most 2 metrics may set \`on_home: true\`.`);
    }
  }
  // Finished projects first, each group in the map's left-to-right order; "in progress" cards go last.
  const rank = (p: LocalizedProject) =>
    (p.data.home ? 0 : 100) + map_area_order[p.data.system_map!.map].indexOf(p.data.system_map!.area);
  return mapped.sort((a, b) => rank(a) - rank(b));
}

export async function get_projects(lang: Lang): Promise<LocalizedProject[]> {
  const projects = (await getCollection("projects")).sort((a, b) => a.data.order - b.data.order);
  if (lang === "zh") return projects.map((p) => ({ id: p.id, data: p.data, body: p }));

  const english = new Map((await getCollection("projects_en")).map((e) => [e.id, e]));
  return projects.map((p) => {
    const en = english.get(p.id);
    if (!en) {
      throw new Error(
        `Missing English case study: add src/content/projects-en/${p.id}.md (same id as the zh file). ` +
        "If the file already exists, restart `npm run dev`: a dev server started before a collection was added to content.config.ts does not load it.",
      );
    }
    if (en.data.metric_labels.length !== p.data.metrics.length) {
      throw new Error(
        `projects-en/${p.id}.md has ${en.data.metric_labels.length} metric_labels but the zh file has ` +
        `${p.data.metrics.length} metrics; keep one label per metric in the same order.`,
      );
    }
    return {
      id:   p.id,
      body: en,
      data: {
        ...p.data,
        subtitle: "",   // zh subtitle is the Chinese name of the (already English) title
        summary:  en.data.summary,
        role:     en.data.role,
        tldr:     en.data.tldr ?? p.data.tldr,
        impact:   en.data.impact ?? p.data.impact,
        metrics:  p.data.metrics.map((m, i) => ({ ...m, label: en.data.metric_labels[i] })),
      },
    };
  });
}
