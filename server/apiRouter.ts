import { Router, type Response } from "express";
import type { FilmsApi } from "../src/api/types";
import { isCategorySlug } from "../src/config/categories";

export function createApiRouter(api: FilmsApi): Router {
  const router = Router();

  const ok = (res: Response, body: unknown) =>
    void res
      .set("Cache-Control", "public, max-age=300, stale-while-revalidate=600")
      .json(body);

  router.get("/categories/:slug/films", async (req, res, next) => {
    const { slug } = req.params;
    if (!isCategorySlug(slug))
      return void res.status(404).json({ error: "Unknown category" });
    try {
      ok(res, await api.getFilmsByCategory(slug));
    } catch (error) {
      next(error);
    }
  });

  router.get("/films/:id", async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return void res.status(404).json({ error: "Film not found" });
    try {
      const film = await api.getFilm(id);
      if (!film) return void res.status(404).json({ error: "Film not found" });
      ok(res, film);
    } catch (error) {
      next(error);
    }
  });

  router.use((_req, res) => void res.status(404).json({ error: "Not found" }));

  router.use((error: unknown, _req: unknown, res: Response, _next: unknown) => {
    console.error("[api]", error);
    res.status(502).json({ error: "Upstream service failed" });
  });

  return router;
}
