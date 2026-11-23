export interface ImageSet {
  small: string;
  large: string;
}

export interface FilmSummary {
  id: number;
  title: string;
  year: number | null;
  rating: number;
  poster: ImageSet | null;
}

export interface CastMember {
  name: string;
  character: string;
}

export interface FilmDetails extends FilmSummary {
  tagline: string;
  overview: string;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  genres: string[];
  voteCount: number;
  originalLanguage: string;
  status: string;
  director: string | null;
  cast: CastMember[];
  backdrop: string | null;
}
