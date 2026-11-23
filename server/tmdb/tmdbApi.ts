import type { FilmsApi } from "../../src/api/types";
import type { FilmDetails, FilmSummary } from "../../src/domain/film";
import { createTtlCache, memoizeAsync } from "../cache";
import { TMDB_GENRE_ID } from "./genres";
import {
  mapDetails,
  mapSummary,
  type TmdbMovieDetails,
  type TmdbMovieListItem,
} from "./mappers";

export interface TmdbConfig {
  /** v4 "API Read Access Token" (sent as Bearer) */
  token?: string;
  /** v3 API key (sent as ?api_key=) */
  apiKey?: string;
  language?: string;
  baseUrl?: string;
  ttlMs?: number;
}

type Params = Record<string, string | number | boolean>;

export function createTmdbApi(config: TmdbConfig): FilmsApi {
  const baseUrl = config.baseUrl ?? "https://api.themoviedb.org/3";
  const language = config.language ?? "en-US";
  const cache = createTtlCache<Promise<unknown>>({
    ttlMs: config.ttlMs ?? 5 * 60_000,
    maxEntries: 500,
  });

  /**
   * NOTE: the caller's AbortSignal is intentionally not forwarded – the upstream promise is shared (cache + in-flight
   * de-duplication), so one aborted browser request must not cancel it for everybody else. A timeout is used instead.
   */
  function get<T>(path: string, params: Params = {}): Promise<T | null> {
    const query = new URLSearchParams({
      language,
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ),
    });
    const cacheKey = `${path}?${query.toString()}`;

    return memoizeAsync(
      cache as ReturnType<typeof createTtlCache<Promise<T | null>>>,
      cacheKey,
      async () => {
        const url = new URL(`${baseUrl}${path}`);
        url.search = query.toString();
        const headers: Record<string, string> = { Accept: "application/json" };
        if (config.token) headers.Authorization = `Bearer ${config.token}`;
        else if (config.apiKey) url.searchParams.set("api_key", config.apiKey);

        const response = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(8_000),
        });
        if (response.status === 404) return null;
        if (!response.ok)
          throw new Error(`TMDB responded with ${response.status} for ${path}`);
        return (await response.json()) as T;
      },
    );
  }

  return {
    async getFilmsByCategory(category): Promise<FilmSummary[]> {
      const data = await get<{ results: TmdbMovieListItem[] }>(
        "/discover/movie",
        {
          with_genres: TMDB_GENRE_ID[category],
          sort_by: "popularity.desc",
          "vote_count.gte": 200,
          include_adult: false,
          page: 1,
        },
      );
      return (data?.results ?? []).filter((m) => m.poster_path).map(mapSummary);
    },

    async getFilm(id): Promise<FilmDetails | null> {
      const movie = await get<TmdbMovieDetails>(`/movie/${id}`, {
        append_to_response: "credits",
      });
      return movie ? mapDetails(movie) : null;
    },
  };
}
