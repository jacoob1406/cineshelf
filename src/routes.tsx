import type { RouteObject } from "react-router";
import type { FilmsApi } from "./api/types";
import { RootLayout } from "./layouts/RootLayout/RootLayout";
import { DEFAULT_META, SITE_NAME, type RouteHandle } from "./lib/meta";
import { truncate } from "./lib/format";
import { ErrorPage } from "./pages/ErrorPage/ErrorPage";
import { FilmDetailPage } from "./pages/FilmDetailPage/FilmDetailPage";
import {
  createFilmLoader,
  type FilmLoaderData,
} from "./pages/FilmDetailPage/loader";
import { HomePage } from "./pages/HomePage/HomePage";
import { createHomeLoader } from "./pages/HomePage/loader";
import { WishlistPage } from "./pages/WishlistPage/WishlistPage";

const notFoundMeta = { title: `Page not found – ${SITE_NAME}` };

/**
 * ONE route table shared by the server (createStaticHandler) and the browser (createBrowserRouter).
 * `api` is injected, so loaders are environment agnostic.
 */
export function createRoutes(api: FilmsApi): RouteObject[] {
  return [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          // pathless route: errors render *inside* the layout, so header/footer stay visible
          errorElement: <ErrorPage />,
          children: [
            {
              index: true,
              element: <HomePage />,
              loader: createHomeLoader(api),
              handle: { meta: () => DEFAULT_META } satisfies RouteHandle,
            },
            {
              path: "films/:category/:filmId",
              element: <FilmDetailPage />,
              loader: createFilmLoader(api),
              handle: {
                meta: (data?: FilmLoaderData) =>
                  data
                    ? {
                        title: `${data.film.title}${data.film.year ? ` (${data.film.year})` : ""} – ${SITE_NAME}`,
                        description: truncate(
                          data.film.overview || data.film.tagline,
                          160,
                        ),
                        image: data.film.backdrop ?? data.film.poster?.large,
                      }
                    : notFoundMeta,
              } satisfies RouteHandle,
            },
            {
              path: "wishlist",
              element: <WishlistPage />,
              handle: {
                meta: () => ({
                  title: `Your wish list – ${SITE_NAME}`,
                  description: "Films you saved for later.",
                }),
              } satisfies RouteHandle,
            },
            {
              path: "*",
              element: <></>, // never rendered – the loader always answers with a 404
              loader: () => {
                throw new Response("Not found", { status: 404 });
              },
              handle: { meta: () => notFoundMeta } satisfies RouteHandle,
            },
          ],
        },
      ],
    },
  ];
}
