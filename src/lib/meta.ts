/**
 * Per-route document metadata without a head-management library.
 *  - each route declares `handle: { meta: (loaderData) => PageMeta }`
 *  - the server turns the deepest match into <title>/<meta> tags (SEO + link previews)
 *  - the browser keeps document.title in sync on client-side navigations (<DocumentMeta />)
 */
export const SITE_NAME = "CineShelf";

export interface PageMeta {
  title: string;
  description?: string;
  image?: string;
}

export interface RouteHandle {
  meta?: (data: any) => PageMeta;
}

export interface MetaMatch {
  handle?: unknown;
  data?: unknown;
}

export const DEFAULT_META: PageMeta = {
  title: `${SITE_NAME} – browse films by category`,
  description:
    "Browse action, comedy and horror films, open a title for details and keep a wish list.",
};

export function resolvePageMeta(matches: MetaMatch[]): PageMeta {
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]!;
    const meta = (match.handle as RouteHandle | undefined)?.meta;
    if (meta) return meta(match.data);
  }
  return DEFAULT_META;
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}

export function renderHeadTags(meta: PageMeta): string {
  const tags = [`<title>${escapeHtml(meta.title)}</title>`];
  const push = (attr: "name" | "property", key: string, value?: string) => {
    if (value)
      tags.push(`<meta ${attr}="${key}" content="${escapeHtml(value)}" />`);
  };
  push("name", "description", meta.description);
  push("property", "og:site_name", SITE_NAME);
  push("property", "og:type", "website");
  push("property", "og:title", meta.title);
  push("property", "og:description", meta.description);
  push("property", "og:image", meta.image);
  push("name", "twitter:card", meta.image ? "summary_large_image" : "summary");
  return tags.join("\n    ");
}
