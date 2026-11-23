import { useEffect } from "react";
import { useMatches } from "react-router";
import { resolvePageMeta } from "../../lib/meta";

/** Server renders <title>/<meta> into the HTML; this keeps them correct after client-side navigations. */
export function DocumentMeta() {
  const meta = resolvePageMeta(useMatches());

  useEffect(() => {
    document.title = meta.title;
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description && meta.description) description.content = meta.description;
  }, [meta.title, meta.description]);

  return null;
}
