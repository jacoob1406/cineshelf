import { isCategorySlug, type CategorySlug } from "../config/categories";
import type { FilmSummary, ImageSet } from "../domain/film";

export interface WishlistItem {
  id: number;
  category: CategorySlug;
  title: string;
  year: number | null;
  rating: number;
  poster: ImageSet | null;
  addedAt: number;
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const STORAGE_KEY = "cineshelf:wishlist:v1";
const EMPTY: readonly WishlistItem[] = Object.freeze([]);

function isWishlistItem(value: unknown): value is WishlistItem {
  const v = value as Partial<WishlistItem> | null;
  return (
    !!v &&
    typeof v.id === "number" &&
    typeof v.title === "string" &&
    isCategorySlug(v.category) &&
    typeof v.addedAt === "number"
  );
}

export function createWishlistStore(storage: StorageLike | null) {
  let items: readonly WishlistItem[] | null = null;
  const listeners = new Set<() => void>();

  function load(): readonly WishlistItem[] {
    if (!storage) return EMPTY;
    try {
      const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter(isWishlistItem) : EMPTY;
    } catch {
      return EMPTY;
    }
  }

  const getSnapshot = (): readonly WishlistItem[] => (items ??= load());
  const getServerSnapshot = (): readonly WishlistItem[] => EMPTY;

  function commit(next: readonly WishlistItem[]) {
    items = next;
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    listeners.forEach((listener) => listener());
  }

  const onStorageEvent = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    items = null;
    listeners.forEach((listener) => listener());
  };

  function subscribe(listener: () => void): () => void {
    if (listeners.size === 0 && typeof window !== "undefined")
      window.addEventListener("storage", onStorageEvent);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && typeof window !== "undefined")
        window.removeEventListener("storage", onStorageEvent);
    };
  }

  function add(film: FilmSummary, category: CategorySlug) {
    const current = getSnapshot();
    if (current.some((item) => item.id === film.id)) return;
    const { id, title, year, rating, poster } = film;
    commit([
      { id, title, year, rating, poster, category, addedAt: Date.now() },
      ...current,
    ]);
  }

  function remove(id: number) {
    const current = getSnapshot();
    if (current.some((item) => item.id === id))
      commit(current.filter((item) => item.id !== id));
  }

  function toggle(film: FilmSummary, category: CategorySlug) {
    if (getSnapshot().some((item) => item.id === film.id)) remove(film.id);
    else add(film, category);
  }

  return { subscribe, getSnapshot, getServerSnapshot, add, remove, toggle };
}

function browserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export const wishlistStore = createWishlistStore(browserStorage());
