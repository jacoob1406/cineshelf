import type {
  CastMember,
  FilmDetails,
  FilmSummary,
  ImageSet,
} from "../../src/domain/film";

export interface TmdbMovieListItem {
  id: number;
  title: string;
  release_date?: string | null;
  vote_average: number;
  poster_path: string | null;
}

export interface TmdbMovieDetails extends TmdbMovieListItem {
  tagline?: string | null;
  overview?: string | null;
  runtime?: number | null;
  genres?: { id: number; name: string }[];
  vote_count?: number;
  original_language?: string;
  status?: string;
  backdrop_path?: string | null;
  credits?: {
    cast?: { name: string; character: string; order: number }[];
    crew?: { name: string; job: string }[];
  };
}

const IMAGE_BASE = "https://image.tmdb.org/t/p";

export const toPoster = (path: string | null | undefined): ImageSet | null =>
  path
    ? { small: `${IMAGE_BASE}/w342${path}`, large: `${IMAGE_BASE}/w780${path}` }
    : null;

export const toBackdrop = (path: string | null | undefined): string | null =>
  path ? `${IMAGE_BASE}/w1280${path}` : null;

export function parseYear(date: string | null | undefined): number | null {
  const year = Number.parseInt((date ?? "").slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function mapSummary(item: TmdbMovieListItem): FilmSummary {
  return {
    id: item.id,
    title: item.title,
    year: parseYear(item.release_date),
    rating: round1(item.vote_average ?? 0),
    poster: toPoster(item.poster_path),
  };
}

export function mapDetails(movie: TmdbMovieDetails): FilmDetails {
  const cast: CastMember[] = [...(movie.credits?.cast ?? [])]
    .sort((a, b) => a.order - b.order)
    .slice(0, 8)
    .map(({ name, character }) => ({ name, character }));

  return {
    ...mapSummary(movie),
    tagline: movie.tagline ?? "",
    overview: movie.overview ?? "",
    releaseDate: movie.release_date || null,
    runtimeMinutes: movie.runtime || null,
    genres: (movie.genres ?? []).map((g) => g.name),
    voteCount: movie.vote_count ?? 0,
    originalLanguage: movie.original_language ?? "",
    status: movie.status ?? "",
    director:
      movie.credits?.crew?.find((c) => c.job === "Director")?.name ?? null,
    cast,
    backdrop: toBackdrop(movie.backdrop_path),
  };
}
