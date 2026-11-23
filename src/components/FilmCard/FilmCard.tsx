import { Link } from "react-router";
import type { CategorySlug } from "../../config/categories";
import type { FilmSummary } from "../../domain/film";
import { formatRating } from "../../lib/format";
import { Poster } from "../Poster/Poster";

interface FilmCardProps {
  film: FilmSummary;
  category: CategorySlug;
  priority?: boolean;
}

export function FilmCard({ film, category, priority }: FilmCardProps) {
  return (
    <Link
      className="film-card"
      to={`/films/${category}/${film.id}`}
      data-category={category}
    >
      <Poster poster={film.poster} title={film.title} priority={priority} />
      <span className="film-card__title">{film.title}</span>
      <span className="film-card__meta">
        <span>{film.year ?? "TBA"}</span>
        <span aria-label={`Rating ${formatRating(film.rating)} out of 10`}>
          ★ {formatRating(film.rating)}
        </span>
      </span>
    </Link>
  );
}
