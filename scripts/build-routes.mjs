// Builds every route in routes.json and merges them into ./dist.
//   ref "HEAD" -> built from the current checkout
//   any other ref -> checked out into a git worktree and built there
// Each build gets SITE_BASE=<path>, which astro.config.mjs uses as `base`.
// Usage: node scripts/build-routes.mjs   (needs full git history: fetch-depth 0)
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const root   = resolve(import.meta.dirname, "..");
const routes = JSON.parse(readFileSync(join(root, "routes.json"), "utf8")).routes;
const out    = join(root, "dist");
const work   = join(root, ".routes");

const run = (cmd, cwd, env = {}) => {
  console.log(`\n$ ${cmd}   (in ${cwd})`);
  execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, ...env } });
};
const norm_path = (p) => "/" + p.replace(/^\/+|\/+$/g, "") + (p.replace(/\//g, "") ? "/" : "");

// Main route first: it owns ./dist, the others are copied into sub-folders.
routes.sort((a, b) => norm_path(a.path).length - norm_path(b.path).length);
if (norm_path(routes[0].path) !== "/") throw new Error("routes.json needs a route with path \"/\"");

rmSync(out, { recursive: true, force: true });
rmSync(work, { recursive: true, force: true });
run("git worktree prune", root);

for (const route of routes) {
  const path = norm_path(route.path);
  const env  = { SITE_BASE: path };
  console.log(`\n=== route "${route.name}" -> ${path} (ref ${route.ref}) ===`);

  if (route.ref === "HEAD") {
    if (path !== "/") throw new Error("ref HEAD is only supported for the \"/\" route");
    run("npm run build", root, env);
    continue;
  }

  const dir = join(work, route.name);
  run(`git worktree add --detach "${dir}" ${route.ref}`, root);
  // Old commits predate SITE_BASE support; use the current config so `base` is honoured.
  cpSync(join(root, "astro.config.mjs"), join(dir, "astro.config.mjs"));
  run("npm ci --no-audit --no-fund", dir);
  run("npm run build", dir, env);

  const target = join(out, path);
  if (existsSync(target)) throw new Error(`${path} collides with a page of the main route`);
  mkdirSync(target, { recursive: true });
  cpSync(join(dir, "dist"), target, { recursive: true });
}

rmSync(work, { recursive: true, force: true });
run("git worktree prune", root);
console.log("\nAll routes built into dist/");
