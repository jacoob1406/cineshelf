import { Link, NavLink } from "react-router";
import { cx } from "../../lib/classNames";
import { useWishlist } from "../../store/useWishlist";

export function Header() {
  const { count } = useWishlist();

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo">
          <span className="site-header__mark" aria-hidden="true" />
          CineShelf
        </Link>

        <nav aria-label="Main">
          <ul className="site-header__nav">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cx("site-header__link", isActive && "is-active")
                }
              >
                Browse
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/wishlist"
                className={({ isActive }) =>
                  cx("site-header__link", isActive && "is-active")
                }
              >
                Wish list
                {count > 0 && (
                  <span className="site-header__badge">
                    {count}
                    <span className="visually-hidden">
                      {" "}
                      {count === 1 ? "film" : "films"} saved
                    </span>
                  </span>
                )}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
