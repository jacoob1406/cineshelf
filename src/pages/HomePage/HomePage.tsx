import { useLoaderData } from "react-router";
import { Carousel } from "../../components/Carousel/Carousel";
import { FilmCard } from "../../components/FilmCard/FilmCard";
import { getCategory } from "../../config/categories";
import type { HomeLoaderData } from "./loader";

export function HomePage() {
  const { rows } = useLoaderData() as HomeLoaderData;

  return (
    <div className="home container">
      <h1 className="home__title">Pick a shelf, pick a film.</h1>

      {rows.map(({ category, films }, rowIndex) => {
        const config = getCategory(category);
        return (
          <div className="home__row" data-category={category} key={category}>
            <Carousel
              title={`${config.emoji} ${config.title}`}
              description={config.tagline}
            >
              {films.map((film, index) => (
                <FilmCard
                  key={film.id}
                  film={film}
                  category={category}
                  priority={rowIndex === 0 && index < 5}
                />
              ))}
            </Carousel>
          </div>
        );
      })}
    </div>
  );
}
