import { datesThisWeekUpTo, formatDate, today } from './date.util';

describe('formatDate', () => {
  it('formats in local time as YYYY-MM-DD, zero-padded', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('today', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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
