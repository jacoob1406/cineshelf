import type { FilmsApi } from "../../src/api/types";
import { CATEGORY_SLUGS, type CategorySlug } from "../../src/config/categories";
import type { FilmDetails, FilmSummary } from "../../src/domain/film";

/** Offline fallback used when no TMDB credentials are configured. Posters are generated SVGs (see mockRouter.ts). */

type Seed = [title: string, year: number, rating: number, tagline: string];

const SEEDS: Record<CategorySlug, Seed[]> = {
  action: [
    ["Iron Horizon", 2024, 7.6, "No brakes. No backup."],
    ["Last Convoy", 2023, 7.1, "Forty trucks, one road, zero patience."],
    ["Red Circuit", 2022, 6.9, "The race ends when someone stops."],
    ["Skyline Breach", 2025, 7.8, "Floor 88 is where it starts."],
    ["Dust & Thunder", 2021, 6.5, "The desert has a long memory."],
    ["Midnight Courier", 2024, 7.3, "Deliver it before sunrise."],
    ["Titan Protocol", 2020, 6.2, "Every plan has a flaw. Find it."],
    ["Harbor Strike", 2023, 7.0, "The tide brings more than ships."],
  ],
  comedy: [
    ["The Wedding Crashers Club", 2024, 7.2, "RSVP not required."],
    ["Ctrl+Alt+Date", 2023, 6.8, "Swipe right on disaster."],
    ["My Roommate Is a Raccoon", 2022, 6.4, "Rent is due. Trash is spoken."],
    ["Office Politics Olympics", 2025, 7.0, "Gold medal in avoiding meetings."],
    ["Dad Jokes Anonymous", 2021, 6.6, "Step one: admit you are punny."],
    ["Four Weddings and a Llama", 2024, 6.9, "It spits. It dances. It RSVPs."],
    [
      "The Great Bake-Off Heist",
      2023,
      7.4,
      "Half-baked plan. Fully baked crew.",
    ],
    ["Plan B for Plan A", 2020, 6.1, "Nothing went to plan, again."],
  ],
  horror: [
    ["The Quiet Basement", 2024, 7.1, "Some doors stay closed for a reason."],
    ["Hollow Pines", 2023, 6.7, "The forest keeps count."],
    ["Seance for Two", 2022, 6.5, "Someone else joined the table."],
    ["Room 313", 2025, 7.4, "Check-out is not an option."],
    ["Lullaby Static", 2021, 6.3, "Turn the monitor off. Please."],
    [
      "The Lighthouse Keeper’s Daughter",
      2024,
      7.0,
      "The lamp was never meant to guide ships.",
    ],
    ["Cold Harvest", 2020, 6.2, "Nothing grows in that field. Except."],
    ["Whisper Lake", 2023, 6.9, "It only speaks when you are alone."],
  ],
};

const OVERVIEWS: Record<CategorySlug, (title: string) => string> = {
  action: (t) =>
    `${t} drops a burned-out specialist into a job that was supposed to take one night. Betrayed by her own team and chased across three cities, she has to trust the one person she has spent years avoiding. Practical stunts, a relentless pace and a finale that refuses to stay on the ground.`,
  comedy: (t) =>
    `${t} follows three friends whose small white lie grows into the most elaborate misunderstanding of their lives. With one weekend, a borrowed car and a suspicious amount of glitter, they must fix it before the truth arrives in person. Warm, fast and quotable.`,
  horror: (t) =>
    `${t} begins with a house everyone in town pretends not to see. When a family moves in for the winter, the sounds start small, then start answering back. Slow, patient dread that rewards anyone who stays for the final ten minutes.`,
};

const GENRES: Record<CategorySlug, string[]> = {
  action: ["Action", "Thriller"],
  comedy: ["Comedy", "Romance"],
  horror: ["Horror", "Mystery"],
};

const CAST_POOL = [
  "Mara Velasco",
  "Jonas Whitfield",
  "Aiko Tanabe",
  "Leo Brandt",
  "Priya Nair",
  "Tomasz Wrona",
  "Ines Duarte",
  "Colm Gallagher",
];
const CHARACTERS = [
  "The Specialist",
  "The Rival",
  "The Driver",
  "The Insider",
  "The Skeptic",
  "The Neighbour",
  "The Stranger",
  "The Witness",
];
const ID_BASE: Record<CategorySlug, number> = {
  action: 1000,
  comedy: 2000,
  horror: 3000,
};

export interface MockFilm {
  details: FilmDetails;
  category: CategorySlug;
}

export function buildMockFilms(): MockFilm[] {
  return CATEGORY_SLUGS.flatMap((category) =>
    SEEDS[category].map(([title, year, rating, tagline], index): MockFilm => {
      const id = ID_BASE[category] + index + 1;
      const poster = {
        small: `/mock/poster/${id}`,
        large: `/mock/poster/${id}`,
      };
      return {
        category,
        details: {
          id,
          title,
          year,
          rating,
          poster,
          tagline,
          overview: OVERVIEWS[category](title),
          releaseDate: `${year}-${String((index % 12) + 1).padStart(2, "0")}-${String(((index * 7) % 27) + 1).padStart(2, "0")}`,
          runtimeMinutes: 84 + ((index * 9) % 48),
          genres: GENRES[category],
          voteCount: 1200 + index * 317,
          originalLanguage: "en",
          status: "Released",
          director: CAST_POOL[(index + 3) % CAST_POOL.length]!,
          cast: CAST_POOL.slice(0, 6).map((_, i) => ({
            name: CAST_POOL[(i + index) % CAST_POOL.length]!,
            character: CHARACTERS[(i + index) % CHARACTERS.length]!,
          })),
          backdrop: `/mock/backdrop/${id}`,
        },
      };
    }),
  );
}

export function createMockApi(): FilmsApi {
  const films = buildMockFilms();
  const toSummary = ({
    id,
    title,
    year,
    rating,
    poster,
  }: FilmDetails): FilmSummary => ({ id, title, year, rating, poster });
  const delay = () => new Promise((r) => setTimeout(r, 120)); // feel like a network call

  return {
    async getFilmsByCategory(category) {
      await delay();
      return films
        .filter((f) => f.category === category)
        .map((f) => toSummary(f.details));
    },
    async getFilm(id) {
      await delay();
      return films.find((f) => f.details.id === id)?.details ?? null;
    },
  };
}
