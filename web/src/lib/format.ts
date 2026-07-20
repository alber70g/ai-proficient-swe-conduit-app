// Format an ISO date string as e.g. "July 2, 2026". Falls back to the raw
// string if it can't be parsed, so a bad value is never silently blank.
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
