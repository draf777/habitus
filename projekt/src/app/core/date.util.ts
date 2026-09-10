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

/** The `count` most recent "YYYY-MM-DD" dates up to and including `date`, oldest first. */
export function lastDays(date: Date, count: number): string[] {
  const dates: string[] = [];
  for (let offset = count - 1; offset >= 0; offset--) {
    const cursor = new Date(date);
    cursor.setDate(date.getDate() - offset);
    dates.push(formatDate(cursor));
  }
  return dates;
}

/** "YYYY-MM-DD" dates from this week's Monday through `date`, inclusive. */
export function datesThisWeekUpTo(date: Date): string[] {
  const weekday = date.getDay(); // 0 = Sonntag .. 6 = Samstag
  const daysSinceMonday = weekday === 0 ? 6 : weekday - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysSinceMonday);

  const dates: string[] = [];
  for (const cursor = new Date(monday); cursor <= date; cursor.setDate(cursor.getDate() + 1)) {
    dates.push(formatDate(cursor));
  }
  return dates;
}

/** "YYYY-MM-DD" dates from the 1st of `date`'s calendar month through `date`, inclusive. */
export function datesThisMonthUpTo(date: Date): string[] {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  const dates: string[] = [];
  for (const cursor = new Date(firstOfMonth); cursor <= date; cursor.setDate(cursor.getDate() + 1)) {
    dates.push(formatDate(cursor));
  }
  return dates;
}
