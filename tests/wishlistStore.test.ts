import { describe, expect, it, vi } from "vitest";
import { createWishlistStore } from "../src/store/wishlistStore";

const film = { id: 7, title: "Seven", year: 2020, rating: 7, poster: null };

function memoryStorage(initial?: string) {
  let value = initial ?? null;
  return {
    getItem: () => value,
    setItem: (_: string, v: string) => void (value = v),
    read: () => value,
  };
}

describe("wishlist store", () => {
  it("adds, de-duplicates and removes", () => {
    const store = createWishlistStore(memoryStorage());
    store.add(film, "action");
    store.add(film, "comedy"); // same film again -> ignored
    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0]!.category).toBe("action");
    store.remove(7);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  it("persists and restores from storage, ignoring corrupt entries", () => {
    const storage = memoryStorage();
    createWishlistStore(storage).add(film, "horror");
    expect(createWishlistStore(storage).getSnapshot()[0]!.title).toBe("Seven");
    expect(
      createWishlistStore(memoryStorage("not json")).getSnapshot(),
    ).toEqual([]);
    expect(
      createWishlistStore(memoryStorage('[{"id":"x"}]')).getSnapshot(),
    ).toEqual([]);
  });

  it("keeps snapshots referentially stable until something changes (useSyncExternalStore contract)", () => {
    const store = createWishlistStore(memoryStorage());
    expect(store.getSnapshot()).toBe(store.getSnapshot());
    expect(store.getServerSnapshot()).toBe(store.getServerSnapshot());
  });

  it("notifies subscribers", () => {
    const store = createWishlistStore(memoryStorage());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.toggle(film, "action");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.toggle(film, "action");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("works without any storage (SSR, privacy mode)", () => {
    const store = createWishlistStore(null);
    store.add(film, "action");
    expect(store.getSnapshot()).toHaveLength(1);
  });
});
