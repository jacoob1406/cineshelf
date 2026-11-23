import {
  Children,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cx } from "../../lib/classNames";

interface CarouselProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function Carousel({ title, description, children }: CarouselProps) {
  const titleId = useId();
  const trackRef = useRef<HTMLUListElement>(null);
  const [ready, setReady] = useState(false);
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    setEdges((prev) =>
      prev.atStart === atStart && prev.atEnd === atEnd
        ? prev
        : { atStart, atEnd },
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    setReady(true);
    updateEdges();
    track.addEventListener("scroll", updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, [updateEdges]);

  const scrollPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    track.scrollBy({
      left: direction * track.clientWidth * 0.85,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <section
      className={cx("carousel", ready && "is-ready")}
      aria-labelledby={titleId}
    >
      <header className="carousel__header">
        <div>
          <h2 className="carousel__title" id={titleId}>
            {title}
          </h2>
          {description && (
            <p className="carousel__description">{description}</p>
          )}
        </div>
        <div className="carousel__controls">
          <button
            type="button"
            className="carousel__button"
            aria-label={`Scroll ${title} films left`}
            disabled={edges.atStart}
            onClick={() => scrollPage(-1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            className="carousel__button"
            aria-label={`Scroll ${title} films right`}
            disabled={edges.atEnd}
            onClick={() => scrollPage(1)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </header>

      <ul className="carousel__track" ref={trackRef}>
        {Children.map(children, (child) => (
          <li className="carousel__slide">{child}</li>
        ))}
      </ul>
    </section>
  );
}
