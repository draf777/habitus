/** Formats a date as "YYYY-MM-DD" in local time (not UTC, unlike `toISOString`). */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Today's date as "YYYY-MM-DD" in local time. */
export function today(): string {
  return formatDate(new Date());
}
