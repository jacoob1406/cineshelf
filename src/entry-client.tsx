import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { createHttpFilmsApi } from "./api/httpFilmsApi";
import { createRoutes } from "./routes";

// createBrowserRouter() automatically picks up `window.__staticRouterHydrationData`
// (written by the server, see entry-server.tsx), so the first render needs no loader calls.
const router = createBrowserRouter(createRoutes(createHttpFilmsApi()));

hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
