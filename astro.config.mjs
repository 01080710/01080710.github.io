import { defineConfig } from "astro/config";

// GitHub Pages path is derived from GITHUB_REPOSITORY ("owner/repo"), which GitHub Actions sets automatically.
//   owner/owner.github.io -> site https://owner.github.io, base /
//   owner/portfolio       -> site https://owner.github.io, base /portfolio
// Locally (no env var) the site is served from "/".
// SITE_BASE (set by scripts/build-routes.mjs from routes.json) adds a sub-path, e.g. "/v1/".
const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? "").split("/");
const is_user_site  = !repo || repo.toLowerCase().endsWith(".github.io");
const repo_base     = is_user_site ? "" : `/${repo}`;
const route_base    = (process.env.SITE_BASE ?? "/").replace(/^\/+|\/+$/g, "");

export default defineConfig({
  site: owner ? `https://${owner}.github.io` : undefined,
  base: `${repo_base}/${route_base}`.replace(/\/+$/, "") || "/",
  markdown: {
    // Leave ```mermaid blocks untouched so the client-side Mermaid script can render them.
    syntaxHighlight: { type: "shiki", excludeLangs: ["mermaid", "math"] },
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
  },
});
