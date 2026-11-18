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
    role:      z.string(),
    stack:     z.array(z.string()),
    // 1-2 signature techniques shown above Stack, so projects sharing the same tools still look different.
    focus:     z.array(z.string()).min(1).max(2).optional(),
    // Headline numbers shown on cards; each value must trace back to docs/source-notes.md.
    metrics:   z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    // Three-line TL;DR shown in the page head instead of `summary` (no numbers; those live in `metrics`).
    tldr:      z.object({ problem: z.string(), approach: z.string(), result: z.string() }).optional(),
    // Company system map in Quick Read; `area` is this project's highlighted part (see components/SystemMap.astro).
    system_map: z.object({
      map:  z.enum(["hytech"]),
      area: z.enum(["infra", "credit-card", "drop-order", "account"]),
    }).optional(),
    tags:      z.array(z.string()).default([]),
    // Technology-type categories for the Projects page filter (at least one; values from data/project-categories.ts).
    categories: z.array(z.enum(project_categories)).min(1),
    featured:  z.boolean().default(false),
    // Per-project accent so case studies don't all look alike; semantic badge colours stay fixed.
    accent:    z.enum(["forest", "violet", "ocean", "slate"]).default("forest"),
    order:     z.number().default(99),
  }),
});

export const collections = { projects };
