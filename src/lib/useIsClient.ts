import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** `false` on the server and during hydration, `true` afterwards. Use it to avoid rendering client-only state too early. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
