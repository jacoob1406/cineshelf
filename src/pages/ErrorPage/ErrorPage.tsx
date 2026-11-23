import {
  isRouteErrorResponse,
  Link,
  useRevalidator,
  useRouteError,
} from "react-router";

export function ErrorPage() {
  const error = useRouteError();
  const { revalidate, state } = useRevalidator();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="error-page container" role="alert">
      {notFound ? (
        <>
          <h1>We couldn’t find that page</h1>
          <p>
            The film or page you opened doesn’t exist (anymore). Head back to
            the shelves.
          </p>
        </>
      ) : (
        <>
          <h1>Something went wrong</h1>
          <p>
            The film data could not be loaded. Check your connection and try
            again.
          </p>
        </>
      )}
      <div className="error-page__actions">
        <Link to="/" className="btn btn--primary">
          Back to all films
        </Link>
        {!notFound && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => revalidate()}
            disabled={state === "loading"}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
