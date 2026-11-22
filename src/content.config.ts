import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { project_categories } from "./data/project-categories";

// Schema for every file in src/content/projects/*.md.
// A missing or mistyped field fails the build, so a broken project page never ships.
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title:     z.string(),
    subtitle:  z.string(),
    summary:   z.string(),
    company:   z.string(),
    period:    z.string(),
    // Dates only, e.g. "2026/3~2026/9"; templates add the「開發 :」/「上線 :」labels.
    // `launch` is optional and open-ended launches end with "~" (e.g. "2026/6~").
    launch:    z.string().optional(),
    // Optional per-phase dates (e.g. 入金 / 出金); when set, replaces the period/launch rows with a phase table.
    phases:    z.array(z.object({ name: z.string(), period: z.string(), launch: z.string().optional() })).min(1).optional(),
    role:      z.string(),
    stack:     z.array(z.string()),
    // 1-2 signature techniques shown above Stack, so projects sharing the same tools still look different.
    focus:     z.array(z.string()).min(1).max(2).optional(),
    // Headline numbers shown on cards; each value must trace back to docs/source-notes.md.
    // `on_home: true` shows the metric on this project's card in Home's impact map (at most 2 per project).
    metrics:   z.array(z.object({
      value:   z.string(),
      label:   z.string(),
      on_home: z.boolean().optional(),
    })).default([]),
    // Home impact map: what changed for the users, one line each, no numbers (numbers live in `metrics`).
    impact:    z.object({ before: z.string(), after: z.string() }).optional(),
    // Three-line TL;DR shown in the page head instead of `summary` (no numbers; those live in `metrics`).
    tldr:      z.object({ problem: z.string(), approach: z.string(), result: z.string() }).optional(),
    // Company system map in Quick Read; `area` is this project's highlighted part (see components/SystemMap.astro).
    system_map: z.object({
      map:  z.enum(["hytech", "weishuo"]),                                        // keep in step with data/system-maps.ts
      area: z.enum(["ticket", "credit-card", "drop-order", "account", "noise-enforcement"]),
    }).optional(),
    // Storyline guide (docs/story.md): ordered steps a reader can walk with "照故事線看". Nothing moves on the page;
    // each step opens `at` ("map" = Quick Read map, "ch-N-S" = chapter N slide S) and outlines the first match of `pick`
    // (a CSS selector inside that slide; the whole slide when omitted). Text is zh; projects-en holds `story` text in the same order.
    story:     z.array(z.object({
      label: z.string(),
      line:  z.string(),
      at:    z.string().regex(/^(map|ch-\d+-\d+)$/),
      pick:  z.string().optional(),
      // Beats: the step reveals these groups one click at a time (CSS selectors inside the picked element);
      // `dim` fades parts of the picked element that belong to a later step. The static page is the last beat.
      beats: z.array(z.string()).optional(),
      dim:   z.string().optional(),
    })).optional(),
    tags:      z.array(z.string()).default([]),
    // Technology-type categories for the Projects page filter (at least one; values from data/project-categories.ts).
    categories: z.array(z.enum(project_categories)).min(1),
    // `home: true` = the project's Home impact-map card shows its numbers; absent = card and map area show "in progress".
    // Cards follow the map's area order (data/system-maps.ts). Projects with "XX" placeholder metrics must not set it.
    home:      z.boolean().optional(),
    // Per-project accent so case studies don't all look alike; semantic badge colours stay fixed.
    accent:    z.enum(["forest", "violet", "ocean", "slate", "amber"]).default("forest"),
    order:     z.number().default(99),
  }),
});

// English case studies: src/content/projects-en/<same id>.md (draft translation, pending Peter's review).
// Only text lives here; dates, stack, categories, metric values and the system map come from the zh file,
// so every number keeps a single source. metric_labels follow the zh `metrics` order.
const projects_en = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects-en" }),
  schema: z.object({
    summary:       z.string(),
    role:          z.string(),
    metric_labels: z.array(z.string()),
    tldr:          z.object({ problem: z.string(), approach: z.string(), result: z.string() }).optional(),
    impact:        z.object({ before: z.string(), after: z.string() }).optional(),
    story:         z.array(z.object({ label: z.string(), line: z.string() })).optional(),
  }),
});

export const collections = { projects, projects_en };
