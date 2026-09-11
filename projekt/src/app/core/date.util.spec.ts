import { datesThisMonthUpTo, datesThisWeekUpTo, formatDate, formatIsoDate, lastDays, today } from './date.util';

describe('formatDate', () => {
  it('formats in local time as YYYY-MM-DD, zero-padded', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('formatIsoDate', () => {
  it('formats an ISO timestamp as a zero-padded day.month.year date', () => {
    expect(formatIsoDate('2026-09-11T08:30:00.000Z')).toMatch(/^\d{2}\.\d{2}\.2026$/);
  });
});

describe('today', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('lastDays', () => {
  it('returns the given number of dates ending with the given date, oldest first', () => {
    // Donnerstag, 2026-09-10 (Monat ist 0-indexiert)
    expect(lastDays(new Date(2026, 8, 10), 7)).toEqual([
      '2026-09-04',
      '2026-09-05',
      '2026-09-06',
      '2026-09-07',
      '2026-09-08',
      '2026-09-09',
      '2026-09-10',
    ]);
  });

  it('returns just the given date when count is 1', () => {
    expect(lastDays(new Date(2026, 8, 10), 1)).toEqual(['2026-09-10']);
  });

  it('spans a month boundary correctly', () => {
    expect(lastDays(new Date(2026, 8, 2), 4)).toEqual(['2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02']);
  });
});

describe('datesThisWeekUpTo', () => {
  it('returns Monday through the given date for a mid-week day', () => {
    // Donnerstag, 2026-09-03 (Monat ist 0-indexiert)
    expect(datesThisWeekUpTo(new Date(2026, 8, 3))).toEqual([
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
    ]);
  });

  it('returns just Monday itself when given a Monday', () => {
    expect(datesThisWeekUpTo(new Date(2026, 8, 7))).toEqual(['2026-09-07']);
  });

  it('returns the full week when given a Sunday', () => {
    expect(datesThisWeekUpTo(new Date(2026, 8, 13))).toEqual([
      '2026-09-07',
      '2026-09-08',
      '2026-09-09',
      '2026-09-10',
      '2026-09-11',
      '2026-09-12',
      '2026-09-13',
    ]);
  });
});

describe('datesThisMonthUpTo', () => {
  it('returns the 1st of the month through the given date', () => {
    expect(datesThisMonthUpTo(new Date(2026, 8, 3))).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
    ]);
  });

  it('returns just the 1st itself when given the 1st', () => {
    expect(datesThisMonthUpTo(new Date(2026, 8, 1))).toEqual(['2026-09-01']);
  });

  it('returns every day of the month when given its last day', () => {
    expect(datesThisMonthUpTo(new Date(2026, 8, 30))).toHaveLength(30);
  });

  it('does not reach back into the previous month', () => {
    expect(datesThisMonthUpTo(new Date(2026, 9, 3))).toEqual(['2026-10-01', '2026-10-02', '2026-10-03']);
  });
});
