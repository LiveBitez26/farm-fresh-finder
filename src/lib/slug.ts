/** Turns a name into a URL-safe slug with a short random suffix for
 * uniqueness (e.g. "Downtown Saturday Market" -> "downtown-saturday-market-a1b2c3"). */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "item"}-${suffix}`;
}
