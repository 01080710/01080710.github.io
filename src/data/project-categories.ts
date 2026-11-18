// Fixed list of "technology type" categories for the Projects page filter.
// The content schema validates frontmatter `categories` against this list, so a typo fails the build.
// To add a category: append it here, then use it in a project's frontmatter.
export const project_categories = [
  "Data Pipeline",
  "Automation",
  "Backend / API",
  "Crawler",
  "AI / ML",
] as const;

export type ProjectCategory = (typeof project_categories)[number];
