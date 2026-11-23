import type { LoaderFunctionArgs } from "react-router";
import type { FilmsApi } from "../../api/types";
import { isCategorySlug, type CategorySlug } from "../../config/categories";
import type { FilmDetails } from "../../domain/film";

export interface FilmLoaderData {
  category: CategorySlug;
  film: FilmDetails;
}

export const createFilmLoader =
  (api: FilmsApi) =>
  async ({ params, request }: LoaderFunctionArgs): Promise<FilmLoaderData> => {
    const id = Number(params.filmId);
    if (!isCategorySlug(params.category) || !Number.isInteger(id) || id <= 0) {
      throw new Response("Not found", { status: 404 });
    }

    const film = await api.getFilm(id, request.signal);
    if (!film) throw new Response("Not found", { status: 404 });

    return { category: params.category, film };
  };
