/**
 * HYDRATION SAFETY: the server and the browser must produce identical text. Locale and time zone are therefore
 * fixed explicitly – never rely on the environment defaults (they differ between Node and a visitor's browser).
 */
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes) return "—";
  return minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export const formatRating = (rating: number): string =>
  rating > 0 ? rating.toFixed(1) : "n/a";

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
