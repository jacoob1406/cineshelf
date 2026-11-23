import { Router } from "express";
import { buildMockFilms } from "./mockApi";
import type { CategorySlug } from "../../src/config/categories";

const PALETTES: Record<CategorySlug, [string, string, string]> = {
  action: ["#2a1204", "#ff6b1a", "#ffd9b8"],
  comedy: ["#3b1d5a", "#ffd23f", "#ff5fa2"],
  horror: ["#0a0506", "#8f1018", "#d9cfc7"],
};

const esc = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );

function wrap(title: string, max = 13): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of title.split(" ")) {
    if ((line + " " + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  return lines;
}

function svg(
  width: number,
  height: number,
  category: CategorySlug,
  title: string,
  year: number | null,
): string {
  const [bg, accent, text] = PALETTES[category];
  const lines = wrap(title, width > height ? 26 : 13);
  const size = width > height ? 84 : 40;
  const startY = height / 2 - ((lines.length - 1) * size * 1.1) / 2;
  const tspans = lines
    .map(
      (l, i) =>
        `<text x="${width / 2}" y="${startY + i * size * 1.1}" text-anchor="middle" font-family="Impact, 'Arial Narrow', sans-serif" font-size="${size}" fill="${text}">${esc(l)}</text>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${accent}" stop-opacity=".75"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<rect x="${width * 0.05}" y="${height * 0.04}" width="${width * 0.9}" height="${height * 0.92}" fill="none" stroke="${accent}" stroke-width="3" opacity=".7"/>
${tspans}
<text x="${width / 2}" y="${height * 0.92}" text-anchor="middle" font-family="sans-serif" font-size="${width > height ? 30 : 16}" fill="${text}" opacity=".8">${year ?? ""}</text>
</svg>`;
}

export function createMockRouter(): Router {
  const films = buildMockFilms();
  const router = Router();

  const send =
    (kind: "poster" | "backdrop") =>
    (req: import("express").Request, res: import("express").Response) => {
      const film = films.find((f) => String(f.details.id) === req.params.id);
      if (!film) return void res.status(404).end();
      const [w, h] = kind === "poster" ? [300, 450] : [1280, 720];
      res
        .type("image/svg+xml")
        .set("Cache-Control", "public, max-age=86400")
        .send(svg(w, h, film.category, film.details.title, film.details.year));
    };

  router.get("/poster/:id", send("poster"));
  router.get("/backdrop/:id", send("backdrop"));
  return router;
}
