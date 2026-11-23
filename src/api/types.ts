import type { CategorySlug } from "../config/categories";
import type { FilmDetails, FilmSummary } from "../domain/film";

export interface FilmsApi {
  getFilmsByCategory(
    category: CategorySlug,
    signal?: AbortSignal,
  ): Promise<FilmSummary[]>;
  getFilm(id: number, signal?: AbortSignal): Promise<FilmDetails | null>;
}
