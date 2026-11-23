// @vitest-environment jsdom
import { StrictMode, act } from "react";
import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { createMockApi } from "../server/mock/mockApi";
import { render } from "../src/entry-server";
import { createRoutes } from "../src/routes";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
  // APIs jsdom does not ship
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  window.scrollTo = () => {};
});

afterEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
  delete (window as { __staticRouterHydrationData?: unknown })
    .__staticRouterHydrationData;
});

/** server render -> put HTML + state into the DOM -> hydrate exactly like entry-client.tsx does */
async function hydratePage(path: string) {
  const api = createMockApi();
  const result = await render(new Request(`http://localhost${path}`), api);
  if (result.type !== "html") throw new Error("expected html");

  document.body.innerHTML = `<div id="root">${result.html}</div>`;
  new Function(result.state.replace(/^<script>|<\/script>$/g, ""))(); // what the browser does with the inline script
  window.history.pushState({}, "", path);

  const recoverable: unknown[] = [];
  const container = document.getElementById("root")!;
  await act(async () => {
    hydrateRoot(
      container,
      <StrictMode>
        <RouterProvider router={createBrowserRouter(createRoutes(api))} />
      </StrictMode>,
      { onRecoverableError: (error) => recoverable.push(error) },
    );
  });
  return { container, recoverable };
}

describe("hydration", () => {
  it("home page hydrates without mismatches", async () => {
    const { container, recoverable } = await hydratePage("/");
    expect(recoverable).toEqual([]);
    expect(container.querySelectorAll(".carousel")).toHaveLength(3);
    expect(
      container.querySelector(".carousel")?.classList.contains("is-ready"),
    ).toBe(true); // effects ran
  });

  it("detail page hydrates without mismatches and the wish list button works", async () => {
    const { container, recoverable } = await hydratePage("/films/action/1001");
    expect(recoverable).toEqual([]);

    const button = container.querySelector<HTMLButtonElement>(".wishlist-btn")!;
    expect(button.textContent).toContain("Add to wish list");

    await act(async () => button.click());
    expect(button.textContent).toContain("Remove from wish list");
    expect(
      JSON.parse(localStorage.getItem("cineshelf:wishlist:v1")!),
    ).toHaveLength(1);
    expect(
      container.querySelector(".site-header__badge")?.textContent,
    ).toContain("1"); // header counter updated
  });

  it("an error page (404) hydrates too", async () => {
    const { container, recoverable } = await hydratePage(
      "/films/action/424242",
    );
    expect(recoverable).toEqual([]);
    expect(container.querySelector(".error-page h1")?.textContent).toContain(
      "couldn’t find",
    );
  });
});
