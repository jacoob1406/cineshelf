import { useMemo, useSyncExternalStore } from "react";
import { wishlistStore } from "./wishlistStore";

export function useWishlist() {
  const items = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot,
  );

  return useMemo(
    () => ({
      items,
      count: items.length,
      has: (id: number) => items.some((item) => item.id === id),
      add: wishlistStore.add,
      remove: wishlistStore.remove,
      toggle: wishlistStore.toggle,
    }),
    [items],
  );
}
