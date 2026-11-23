import { defineConfig } from "astro/config";

// The site is served at https://<owner>.github.io/PCResume/ (the only route).
// GITHUB_REPOSITORY ("owner/repo") is set by GitHub Actions; for a project repo
// (not <owner>.github.io) its name is prepended, e.g. /portfolio/PCResume.
// Output goes to dist/PCResume so the deployed dist/ has the site under that path.
const SITE_PATH = "PCResume";

const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? "").split("/");
const is_user_site  = !repo || repo.toLowerCase().endsWith(".github.io");
const repo_base     = is_user_site ? "" : `/${repo}`;

export default defineConfig({
  site: owner ? `https://${owner}.github.io` : undefined,
  base: `${repo_base}/${SITE_PATH}`,
  outDir: `./dist/${SITE_PATH}`,
  markdown: {
    // Leave ```mermaid blocks untouched so the client-side Mermaid script can render them.
    syntaxHighlight: { type: "shiki", excludeLangs: ["mermaid", "math"] },
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
  },
});
