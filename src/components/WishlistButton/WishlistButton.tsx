import { getCategory, type CategorySlug } from "../../config/categories";
import type { FilmSummary } from "../../domain/film";
import { cx } from "../../lib/classNames";
import { useWishlist } from "../../store/useWishlist";

interface WishlistButtonProps {
  film: FilmSummary;
  category: CategorySlug;
}

/** The look (shape, motion, copy) is chosen by the film's category – see CategoryConfig.buttonVariant. */
export function WishlistButton({ film, category }: WishlistButtonProps) {
  const { has, toggle } = useWishlist();
  const config = getCategory(category);
  const inWishlist = has(film.id);

  return (
    <button
      type="button"
      className={cx(
        "wishlist-btn",
        `wishlist-btn--${config.buttonVariant}`,
        inWishlist && "is-active",
      )}
      onClick={() => toggle(film, category)}
    >
      <span className="wishlist-btn__icon" aria-hidden="true">
        {inWishlist ? "✓" : config.buttonIcon}
      </span>
      <span className="wishlist-btn__label">
        {inWishlist ? config.wishlist.remove : config.wishlist.add}
      </span>
    </button>
  );
}
