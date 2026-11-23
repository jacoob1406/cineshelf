import type { FilmDetails, FilmSummary } from "../domain/film";
import type { FilmsApi } from "./types";

export function createHttpFilmsApi(baseUrl = ""): FilmsApi {
  async function request<T>(
    path: string,
    signal?: AbortSignal,
  ): Promise<T | null> {
    const response = await fetch(`${baseUrl}${path}`, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (response.status === 404) return null;
    if (!response.ok)
      throw new Error(`Request to ${path} failed with ${response.status}`);
    return (await response.json()) as T;
  }

  return {
    async getFilmsByCategory(category, signal) {
      return (
        (await request<FilmSummary[]>(
          `/api/categories/${category}/films`,
          signal,
        )) ?? []
      );
    },
    getFilm(id, signal) {
      return request<FilmDetails>(`/api/films/${id}`, signal);
    },
  };
}
