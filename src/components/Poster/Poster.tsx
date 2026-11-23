import type { ImageSet } from "../../domain/film";
import { cx } from "../../lib/classNames";

interface PosterProps {
  poster: ImageSet | null;
  title: string;
  size?: keyof ImageSet;
  /** above-the-fold images: load immediately and with high priority */
  priority?: boolean;
  className?: string;
}

/** 2:3 poster. Width/height attributes + CSS aspect-ratio reserve the space, so images never shift the layout. */
export function Poster({
  poster,
  title,
  size = "small",
  priority = false,
  className,
}: PosterProps) {
  if (!poster) {
    return (
      <div
        className={cx("poster", "poster--empty", className)}
        role="img"
        aria-label={`No poster available for ${title}`}
      >
        <span aria-hidden="true">🎞️</span>
      </div>
    );
  }

  return (
    <img
      className={cx("poster", className)}
      src={poster[size]}
      alt={`Poster of ${title}`}
      width={size === "small" ? 342 : 520}
      height={size === "small" ? 513 : 780}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
