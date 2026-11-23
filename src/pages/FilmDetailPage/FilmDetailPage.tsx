import { Link, useLoaderData } from "react-router";
import { Poster } from "../../components/Poster/Poster";
import { WishlistButton } from "../../components/WishlistButton/WishlistButton";
import { getCategory } from "../../config/categories";
import { formatDate, formatRating, formatRuntime } from "../../lib/format";
import type { FilmLoaderData } from "./loader";

export function FilmDetailPage() {
  const { category: slug, film } = useLoaderData() as FilmLoaderData;
  const category = getCategory(slug);

  return (
    <article className="film-detail" data-category={slug}>
      {film.backdrop && (
        <img
          className="film-detail__backdrop"
          src={film.backdrop}
          alt=""
          aria-hidden="true"
        />
      )}

      <div className="film-detail__inner container">
        <nav className="film-detail__nav" aria-label="Breadcrumb">
          <Link to="/" className="film-detail__back">
            ‹ All films
          </Link>
          <span className="film-detail__badge">
            <span aria-hidden="true">{category.emoji}</span> {category.title}
          </span>
        </nav>

        <div className="film-detail__grid">
          <div className="film-detail__image-area">
            <div className="film-detail__frame">
              <Poster
                poster={film.poster}
                title={film.title}
                size="large"
                priority
              />
            </div>
          </div>

          <div className="film-detail__side">
            <h1 className="film-detail__title">{film.title}</h1>
            {film.tagline && (
              <p className="film-detail__tagline">{film.tagline}</p>
            )}

            <ul className="film-detail__chips" aria-label="Quick facts">
              {film.year && <li>{film.year}</li>}
              <li>{formatRuntime(film.runtimeMinutes)}</li>
              <li>
                <span aria-hidden="true">★ </span>
                <span className="visually-hidden">Rating </span>
                {formatRating(film.rating)}
              </li>
            </ul>

            <WishlistButton film={film} category={slug} />

            <p className="film-detail__overview">
              {film.overview || "No description available for this film yet."}
            </p>
          </div>

          <section
            className="film-detail__info"
            aria-labelledby="film-info-heading"
          >
            <h2 id="film-info-heading" className="film-detail__info-title">
              {category.infoHeading}
            </h2>

            <dl className="film-detail__facts">
              <div>
                <dt>Release date</dt>
                <dd>{formatDate(film.releaseDate)}</dd>
              </div>
              <div>
                <dt>Runtime</dt>
                <dd>{formatRuntime(film.runtimeMinutes)}</dd>
              </div>
              <div>
                <dt>Genres</dt>
                <dd>{film.genres.length ? film.genres.join(", ") : "—"}</dd>
              </div>
              <div>
                <dt>Director</dt>
                <dd>{film.director ?? "—"}</dd>
              </div>
              <div>
                <dt>Audience score</dt>
                <dd>
                  {formatRating(film.rating)} / 10 from{" "}
                  {film.voteCount.toLocaleString("en-US")} votes
                </dd>
              </div>
              <div>
                <dt>Original language</dt>
                <dd>
                  {film.originalLanguage
                    ? film.originalLanguage.toUpperCase()
                    : "—"}
                </dd>
              </div>
            </dl>

            {film.cast.length > 0 && (
              <>
                <h3 className="film-detail__cast-title">
                  {category.castHeading}
                </h3>
                <ul className="film-detail__cast">
                  {film.cast.map((member, index) => (
                    <li key={`${member.name}-${index}`}>
                      <strong>{member.name}</strong>
                      {member.character && <span>{member.character}</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}
