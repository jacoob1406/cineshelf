import type { FilmsApi } from "../src/api/types";
import { createMockApi } from "./mock/mockApi";
import { createTmdbApi } from "./tmdb/tmdbApi";

export function createFilmsApi(env: NodeJS.ProcessEnv): {
  api: FilmsApi;
  source: "tmdb" | "mock";
} {
  const token = env.TMDB_API_TOKEN?.trim();
  const apiKey = env.TMDB_API_KEY?.trim();

  if (token || apiKey) {
    return {
      api: createTmdbApi({ token, apiKey, language: env.TMDB_LANGUAGE }),
      source: "tmdb",
    };
  }

  console.warn(
    "[cineshelf] No TMDB_API_TOKEN / TMDB_API_KEY found – serving built-in mock data. See .env.example.",
  );
  return { api: createMockApi(), source: "mock" };
}
