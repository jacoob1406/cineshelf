export const CATEGORY_SLUGS = ["action", "comedy", "horror"] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type ButtonVariant = "angular" | "bubbly" | "ghost";

export interface CategoryConfig {
  slug: CategorySlug;
  title: string;
  tagline: string;
  emoji: string;
  buttonVariant: ButtonVariant;
  buttonIcon: string;
  wishlist: { add: string; remove: string };
  infoHeading: string;
  castHeading: string;
}

export const CATEGORIES: readonly CategoryConfig[] = [
  {
    slug: "action",
    title: "Action",
    tagline:
      "Chases, fistfights and one more explosion than strictly necessary.",
    emoji: "💥",
    buttonVariant: "angular",
    buttonIcon: "⚡",
    wishlist: { add: "Add to wish list", remove: "Remove from wish list" },
    infoHeading: "Mission briefing",
    castHeading: "The squad",
  },
  {
    slug: "comedy",
    title: "Comedy",
    tagline: "Bad ideas, worse timing, excellent results.",
    emoji: "😂",
    buttonVariant: "bubbly",
    buttonIcon: "🎉",
    wishlist: { add: "Add to wish list!", remove: "Oops, remove it" },
    infoHeading: "The fun facts",
    castHeading: "The funny people",
  },
  {
    slug: "horror",
    title: "Horror",
    tagline: "Lights off. Volume up. Do not check the basement.",
    emoji: "👻",
    buttonVariant: "ghost",
    buttonIcon: "🕯️",
    wishlist: {
      add: "Add to wish list… if you dare",
      remove: "Banish from wish list",
    },
    infoHeading: "Case file",
    castHeading: "The cursed cast",
  },
];

export function isCategorySlug(
  value: string | undefined,
): value is CategorySlug {
  return (
    value !== undefined && (CATEGORY_SLUGS as readonly string[]).includes(value)
  );
}

export function getCategory(slug: CategorySlug): CategoryConfig {
  return CATEGORIES.find((c) => c.slug === slug)!;
}
