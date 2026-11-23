import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  isRouteErrorResponse,
  StaticRouterProvider,
  type StaticHandlerContext,
} from "react-router";
import type { FilmsApi } from "./api/types";
import { renderHeadTags, resolvePageMeta } from "./lib/meta";
import { createRoutes } from "./routes";

export type RenderResult =
  | { type: "redirect"; status: number; location: string }
  | {
      type: "html";
      status: number;
      /** <title> + <meta> tags */
      head: string;
      /** markup of the React tree */
      html: string;
      /** <script> that hands the loader data to the browser */
      state: string;
    };

/** Errors are sent to the browser in react-router's own serialized shape (it rebuilds them in createBrowserRouter). */
function serializeErrors(errors: StaticHandlerContext["errors"]) {
  if (!errors) return null;
  return Object.fromEntries(
    Object.entries(errors).map(([routeId, error]) => [
      routeId,
      isRouteErrorResponse(error)
        ? { ...error, __type: "RouteErrorResponse" }
        : { message: "Unexpected error", __type: "Error" }, // never leak internal messages/stacks
    ]),
  );
}

/** JSON that is safe inside an inline <script> (no `</script>` / `<!--` breakouts, no U+2028/2029). */
const safeJson = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

/**
 * Request in -> HTML pieces out. Framework-agnostic on purpose: the Express server (or a test) decides what to do with it.
 *   1. match the URL and run the route loaders (data is fetched BEFORE rendering – no loading spinners in the HTML)
 *   2. render the React tree to a string with the loaded data
 *   3. serialize the loader data so the browser can hydrate without refetching
 */
export async function render(
  request: Request,
  api: FilmsApi,
): Promise<RenderResult> {
  const { query, dataRoutes } = createStaticHandler(createRoutes(api));
  const context = await query(request);

  if (context instanceof Response) {
    const location = context.headers.get("Location");
    if (location) return { type: "redirect", status: context.status, location };
    return {
      type: "html",
      status: context.status,
      head: renderHeadTags({ title: "Error" }),
      html: "",
      state: "",
    };
  }

  if (context.errors && context.statusCode >= 500)
    console.error("[ssr] loader failed:", context.errors);

  const router = createStaticRouter(dataRoutes, context);
  const html = renderToString(
    <StrictMode>
      {/* hydrate={false}: we write the hydration script ourselves, with proper escaping and error serialization */}
      <StaticRouterProvider router={router} context={context} hydrate={false} />
    </StrictMode>,
  );

  const meta = resolvePageMeta(
    context.matches.map((match) => ({
      handle: match.route.handle,
      data: context.loaderData[match.route.id],
    })),
  );

  const hydrationData = {
    loaderData: context.loaderData,
    actionData: context.actionData,
    errors: serializeErrors(context.errors),
  };

  return {
    type: "html",
    status: context.statusCode,
    head: renderHeadTags(meta),
    html,
    state: `<script>window.__staticRouterHydrationData = ${safeJson(hydrationData)};</script>`,
  };
}
