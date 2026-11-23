import { describe, expect, it } from "vitest";
import {
  mapDetails,
  mapSummary,
  parseYear,
  toPoster,
} from "../server/tmdb/mappers";

describe("TMDB mappers", () => {
  it("parses years defensively", () => {
    expect(parseYear("2024-05-17")).toBe(2024);
    expect(parseYear("")).toBeNull();
    expect(parseYear(undefined)).toBeNull();
  });

  it("builds poster URLs in two sizes and tolerates a missing poster", () => {
    expect(toPoster("/abc.jpg")).toEqual({
      small: "https://image.tmdb.org/t/p/w342/abc.jpg",
      large: "https://image.tmdb.org/t/p/w780/abc.jpg",
    });
    expect(toPoster(null)).toBeNull();
  });

  it("maps a list item", () => {
    expect(
      mapSummary({
        id: 1,
        title: "A",
        release_date: "2020-01-02",
        vote_average: 7.456,
        poster_path: null,
      }),
    ).toEqual({
      id: 1,
      title: "A",
      year: 2020,
      rating: 7.5,
      poster: null,
    });
  });

  it("maps details: top cast ordered, director picked from crew", () => {
    const film = mapDetails({
      id: 2,
      title: "B",
      vote_average: 8,
      poster_path: "/p.jpg",
      release_date: "",
      runtime: 0,
      credits: {
        cast: [
          { name: "Second", character: "Y", order: 1 },
          { name: "First", character: "X", order: 0 },
        ],
        crew: [
          { name: "Someone", job: "Editor" },
          { name: "Dir Ector", job: "Director" },
        ],
      },
    });
    expect(film.cast.map((c) => c.name)).toEqual(["First", "Second"]);
    expect(film.director).toBe("Dir Ector");
    expect(film.releaseDate).toBeNull();
    expect(film.runtimeMinutes).toBeNull();
  });
});
