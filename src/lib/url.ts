// Prefix an internal path with the deploy base (e.g. "/portfolio") so links work on GitHub Pages project sites.
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}
