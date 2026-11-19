// Projects in a page language.
// zh: entries from src/content/projects as-is.
// en: same entries with text fields replaced from src/content/projects-en/<id>.md; dates, stack, categories,
// metric values and the system map stay from the zh file so each number has one source.
import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "./ui";

export interface LocalizedProject {
  id:   string;
  data: CollectionEntry<"projects">["data"];
  // Entry whose Markdown body is rendered on the case study page.
  body: CollectionEntry<"projects"> | CollectionEntry<"projects_en">;
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
        metrics:  p.data.metrics.map((m, i) => ({ value: m.value, label: en.data.metric_labels[i] })),
      },
    };
  });
}
