import { describe, expect, it } from "vitest";
import { render } from "../src/entry-server";
import { createMockApi } from "../server/mock/mockApi";

const api = createMockApi();
const get = (path: string) =>
  render(new Request(`http://localhost${path}`), api);

describe("server-side rendering", () => {
  it("renders the homepage with three carousels and SEO tags", async () => {
    const result = await get("/");
    if (result.type !== "html") throw new Error("expected html");
    expect(result.status).toBe(200);
    expect(result.html.match(/carousel__track/g)).toHaveLength(3);
    expect(result.html).toContain("Iron Horizon"); // film data is in the HTML, not fetched later
    expect(result.head).toContain("<title>");
    expect(result.state).toContain("__staticRouterHydrationData");
  });

  it("renders a detail page with category theme, title tag and wish list button", async () => {
    const result = await get("/films/horror/3001");
    if (result.type !== "html") throw new Error("expected html");
    expect(result.status).toBe(200);
    expect(result.html).toContain('data-category="horror"');
    expect(result.html).toContain("wishlist-btn--ghost");
    expect(result.head).toContain("<title>The Quiet Basement (2024)");
  });

  it.each([
    "/films/horror/999999",
    "/films/drama/3001",
    "/films/horror/abc",
    "/nope",
  ])("answers %s with a real HTTP 404", async (path) => {
    const result = await get(path);
    expect(result.type === "html" && result.status).toBe(404);
  });

  it("never lets film text break out of the inline state script", async () => {
    const evil = {
      ...api,
      getFilm: async () => ({
        ...(await api.getFilm(3001))!,
        overview: "</script><script>alert(1)</script>",
      }),
    };
    const result = await render(
      new Request("http://localhost/films/horror/3001"),
      evil,
    );
    if (result.type !== "html") throw new Error("expected html");
    expect(result.state).not.toContain("</script><script>");
    expect(result.html).not.toContain("<script>alert(1)");
  });
});
