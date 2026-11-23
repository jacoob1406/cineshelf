import { Link } from "react-router";
import { FilmCard } from "../../components/FilmCard/FilmCard";
import { useIsClient } from "../../lib/useIsClient";
import { useWishlist } from "../../store/useWishlist";

export function WishlistPage() {
  const { items, remove } = useWishlist();
  // The list lives in localStorage – the server cannot know it. Until hydration is done we render a neutral
  // placeholder instead of a (wrong) "your list is empty" message.
  const isClient = useIsClient();

  return (
    <div className="wishlist container">
      <h1 className="wishlist__title">Your wish list</h1>

      {!isClient ? (
        <p className="wishlist__status" aria-busy="true">
          Loading your list…
        </p>
      ) : items.length === 0 ? (
        <div className="wishlist__empty">
          <p>
            Nothing saved yet. Open any film and use the wish list button on its
            page.
          </p>
          <Link to="/" className="btn btn--primary">
            Browse films
          </Link>
        </div>
      ) : (
        <>
          <p className="wishlist__status">
            {items.length} {items.length === 1 ? "film" : "films"} saved on this
            device.
          </p>
          <ul className="wishlist__grid">
            {items.map((item) => (
              <li
                key={item.id}
                className="wishlist__item"
                data-category={item.category}
              >
                <FilmCard film={item} category={item.category} />
                <button
                  type="button"
                  className="btn btn--ghost wishlist__remove"
                  onClick={() => remove(item.id)}
                >
                  Remove{" "}
                  <span className="visually-hidden">
                    {item.title} from wish list
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
