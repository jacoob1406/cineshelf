import type { LoaderFunctionArgs } from "react-router";
import type { FilmsApi } from "../../api/types";
import { CATEGORIES, type CategorySlug } from "../../config/categories";
import type { FilmSummary } from "../../domain/film";

export interface HomeLoaderData {
  rows: { category: CategorySlug; films: FilmSummary[] }[];
}

/** Loader factory: the FilmsApi is injected, so the very same loader runs on the server (TMDB) and in the browser (/api). */
export const createHomeLoader =
  (api: FilmsApi) =>
  async ({ request }: LoaderFunctionArgs): Promise<HomeLoaderData> => {
    const rows = await Promise.all(
      CATEGORIES.map(async ({ slug }) => ({
        category: slug,
        films: await api.getFilmsByCategory(slug, request.signal),
      })),
    );
    return { rows };
  };
