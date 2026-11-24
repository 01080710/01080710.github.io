// Project `stack` is grouped like a standard data-engineering tech stack, so recruiters and ATS keyword scans
// find both the tools and the engineering practices (retry, concurrency control, backfill, logging ...).
// Groups render in this order on the case study page; a project lists only the groups it uses.
// A key outside this list fails the build (see content.config.ts).
export const stack_groups = [
  "Language",
  "Data Processing",
  "Storage",
  "Integration",
  "Concurrency",
  "Reliability",
  "Orchestration",
  "Observability",
  "Testing",
  "Serving & BI",
  "AI / LLM",
] as const;

export type StackGroup = (typeof stack_groups)[number];
export type Stack = Partial<Record<StackGroup, string[]>>;

// [group, items] pairs in the canonical order, skipping groups the project does not use.
export function stack_entries(stack: Stack): [StackGroup, string[]][] {
  return stack_groups.flatMap((g) => (stack[g]?.length ? [[g, stack[g]!] as [StackGroup, string[]]] : []));
}

// Every keyword of a project's stack, in group order (used for the Home tools strip).
export function stack_items(stack: Stack): string[] {
  return stack_entries(stack).flatMap(([, items]) => items);
}
