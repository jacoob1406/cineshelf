import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import compression from "compression";
import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import type { ViteDevServer } from "vite";
import { createApiRouter } from "./apiRouter";
import { createFilmsApi } from "./createFilmsApi";
import { createFetchRequest } from "./fetchRequest";
import { createMockRouter } from "./mock/mockRouter";

type EntryServer = typeof import("../src/entry-server");

const isProd = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? 5173);
const root = process.cwd();

const fill = (template: string, token: string, value: string) =>
  template.replace(token, () => value);

async function main() {
  const { api, source } = createFilmsApi(process.env);
  const app = express();
  app.disable("x-powered-by");
  app.use(compression());

  app.use("/api", createApiRouter(api));
  if (source === "mock") app.use("/mock", createMockRouter());

  let vite: ViteDevServer | undefined;
  let prodTemplate = "";
  let prodEntry: EntryServer | undefined;

  if (isProd) {
    const clientDir = path.join(root, "dist/client");
    app.use(
      express.static(clientDir, {
        index: false,
        setHeaders(res, filePath) {
          if (filePath.includes(`${path.sep}assets${path.sep}`))
            res.setHeader(
              "Cache-Control",
              "public, max-age=31536000, immutable",
            );
        },
      }),
    );
    prodTemplate = await readFile(path.join(clientDir, "index.html"), "utf-8");
    prodEntry = (await import(
      pathToFileURL(path.join(root, "dist/ssr/entry-server.js")).href
    )) as EntryServer;
  } else {
    const { createServer } = await import("vite");
    vite = await createServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  }

  const ssr: RequestHandler = async (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    try {
      let template: string;
      let entry: EntryServer;

      if (vite) {
        template = await vite.transformIndexHtml(
          req.originalUrl,
          await readFile(path.join(root, "index.html"), "utf-8"),
        );
        entry = (await vite.ssrLoadModule(
          "/src/entry-server.tsx",
        )) as EntryServer;
      } else {
        template = prodTemplate;
        entry = prodEntry!;
      }

      const result = await entry.render(createFetchRequest(req, res), api);

      if (result.type === "redirect")
        return void res.redirect(result.status, result.location);

      let html = fill(template, "<!--app-head-->", result.head);
      html = fill(html, "<!--app-html-->", result.html);
      html = fill(html, "<!--app-state-->", result.state);

      res
        .status(result.status)
        .set("Content-Type", "text/html; charset=utf-8")
        .send(html);
    } catch (error) {
      if (error instanceof Error) vite?.ssrFixStacktrace(error);
      next(error);
    }
  };
  app.use(ssr);

  const onError: ErrorRequestHandler = (error, _req, res, _next) => {
    console.error("[ssr]", error);
    res
      .status(500)
      .type("html")
      .send(
        "<!doctype html><title>Server error</title><h1>Something went wrong</h1><p>Please try again in a moment.</p>",
      );
  };
  app.use(onError);

  app.listen(port, () => {
    console.log(
      `[cineshelf] ${isProd ? "production" : "development"} server on http://localhost:${port} (data: ${source})`,
    );
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
