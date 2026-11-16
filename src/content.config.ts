import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

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
    // Headline numbers shown on cards; each value must trace back to docs/source-notes.md.
    metrics:   z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    tags:      z.array(z.string()).default([]),
    featured:  z.boolean().default(false),
    // Per-project accent so case studies don't all look alike; semantic badge colours stay fixed.
    accent:    z.enum(["forest", "violet", "ocean"]).default("forest"),
    order:     z.number().default(99),
  }),
});

export const collections = { projects };
