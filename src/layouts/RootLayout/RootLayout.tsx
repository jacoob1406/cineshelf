import { Outlet, ScrollRestoration } from "react-router";
import { DocumentMeta } from "../../components/DocumentMeta/DocumentMeta";
import { Header } from "../../components/Header/Header";
import { NavigationProgress } from "../../components/NavigationProgress/NavigationProgress";

export function RootLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <NavigationProgress />
      <Header />
      <main id="main" className="app-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>
            Film data from{" "}
            <a
              href="https://www.themoviedb.org/"
              rel="noreferrer noopener"
              target="_blank"
            >
              TMDB
            </a>
            . This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </p>
        </div>
      </footer>
      <DocumentMeta />
      <ScrollRestoration />
    </>
  );
}
