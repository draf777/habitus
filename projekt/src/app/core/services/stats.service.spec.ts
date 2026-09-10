import { TestBed } from '@angular/core/testing';

import { StatsService } from './stats.service';
import { HabitStorageService } from './habit-storage.service';
import { Habit } from '../../models/habit.model';

describe('StatsService', () => {
  let service: StatsService;
  let storage: { getEntriesForHabit: ReturnType<typeof vi.fn> };

  // Donnerstag, 2026-09-10 — die letzten 7 Tage sind 09-04 bis 09-10.
  const referenceDate = new Date(2026, 8, 10);

  const readingHabit: Habit = {
    id: 'lesen',
    name: 'Lesen',
    type: 'duration_min',
    goal: 20,
    createdAt: '2026-09-01T00:00:00.000Z',
  };
  const meditationHabit: Habit = {
    id: 'meditation',
    name: 'Meditation',
    type: 'boolean',
    createdAt: '2026-09-01T00:00:00.000Z',
  };

  beforeEach(() => {
    storage = { getEntriesForHabit: vi.fn().mockResolvedValue([]) };
    TestBed.configureTestingModule({
      providers: [StatsService, { provide: HabitStorageService, useValue: storage }],
    });
    service = TestBed.inject(StatsService);
  });

  it('returns 7 days, oldest first, ending on the reference date', async () => {
    const stats = await service.getWeekStats(readingHabit, referenceDate);

    expect(stats.days.map((day) => day.date)).toEqual([
      '2026-09-04',
      '2026-09-05',
      '2026-09-06',
      '2026-09-07',
      '2026-09-08',
      '2026-09-09',
      '2026-09-10',
    ]);
  });

  it('fills in the recorded value per day for a numeric habit, defaulting to 0', async () => {
    storage.getEntriesForHabit.mockResolvedValue([
      { id: 'e1', habitId: 'lesen', date: '2026-09-09', value: 25 },
      { id: 'e2', habitId: 'lesen', date: '2026-09-01', value: 99 }, // ausserhalb der letzten 7 Tage
    ]);

    const stats = await service.getWeekStats(readingHabit, referenceDate);

    expect(stats.days.find((day) => day.date === '2026-09-09')?.value).toBe(25);
    expect(stats.days.find((day) => day.date === '2026-09-10')?.value).toBe(0);
    expect(stats.days.some((day) => day.date === '2026-09-01')).toBe(false);
  });

  it('reduces boolean habits to 0/1 per day based on whether they were done', async () => {
    storage.getEntriesForHabit.mockResolvedValue([
      { id: 'e1', habitId: 'meditation', date: '2026-09-08', value: 1 },
      { id: 'e2', habitId: 'meditation', date: '2026-09-09', value: 0 },
    ]);

    const stats = await service.getWeekStats(meditationHabit, referenceDate);

    expect(stats.days.find((day) => day.date === '2026-09-08')?.value).toBe(1);
    expect(stats.days.find((day) => day.date === '2026-09-09')?.value).toBe(0);
  });

  it('lets the number of done days be counted for a boolean habit', async () => {
    storage.getEntriesForHabit.mockResolvedValue([
      { id: 'e1', habitId: 'meditation', date: '2026-09-05', value: 1 },
      { id: 'e2', habitId: 'meditation', date: '2026-09-07', value: 1 },
      { id: 'e3', habitId: 'meditation', date: '2026-09-09', value: 0 },
    ]);

    const stats = await service.getWeekStats(meditationHabit, referenceDate);
    const doneDays = stats.days.filter((day) => day.value === 1).length;

    expect(doneDays).toBe(2);
  });

  it('has no entries and only zeros when nothing was recorded in the last 7 days', async () => {
    const stats = await service.getWeekStats(readingHabit, referenceDate);

    expect(stats.hasEntries).toBe(false);
    expect(stats.days.every((day) => day.value === 0)).toBe(true);
  });

  it('has entries when at least one day in the window was recorded, even with value 0', async () => {
    storage.getEntriesForHabit.mockResolvedValue([{ id: 'e1', habitId: 'meditation', date: '2026-09-09', value: 0 }]);

    const stats = await service.getWeekStats(meditationHabit, referenceDate);

    expect(stats.hasEntries).toBe(true);
  });

  it('ignores entries outside the 7-day window when deciding hasEntries', async () => {
    storage.getEntriesForHabit.mockResolvedValue([{ id: 'e1', habitId: 'lesen', date: '2026-08-01', value: 30 }]);

    const stats = await service.getWeekStats(readingHabit, referenceDate);

    expect(stats.hasEntries).toBe(false);
  });

  describe('streak', () => {
    it('counts consecutive done days ending today', async () => {
      storage.getEntriesForHabit.mockResolvedValue([
        { id: 'e1', habitId: 'meditation', date: '2026-09-08', value: 1 },
        { id: 'e2', habitId: 'meditation', date: '2026-09-09', value: 1 },
        { id: 'e3', habitId: 'meditation', date: '2026-09-10', value: 1 },
      ]);

      const stats = await service.getWeekStats(meditationHabit, referenceDate);

      expect(stats.streak).toBe(3);
    });

    it('does not break the streak when today has not been done yet, counting from yesterday instead', async () => {
      storage.getEntriesForHabit.mockResolvedValue([
        { id: 'e1', habitId: 'meditation', date: '2026-09-08', value: 1 },
        { id: 'e2', habitId: 'meditation', date: '2026-09-09', value: 1 },
        // kein Eintrag für 2026-09-10 (heute)
      ]);

      const stats = await service.getWeekStats(meditationHabit, referenceDate);

      expect(stats.streak).toBe(2);
    });

    it('is 0 when today is undone and yesterday was also missed', async () => {
      storage.getEntriesForHabit.mockResolvedValue([{ id: 'e1', habitId: 'meditation', date: '2026-09-07', value: 1 }]);

      const stats = await service.getWeekStats(meditationHabit, referenceDate);

      expect(stats.streak).toBe(0);
    });

    it('counts a streak longer than the 7-day chart window', async () => {
      storage.getEntriesForHabit.mockResolvedValue([
        { id: 'e1', habitId: 'meditation', date: '2026-09-01', value: 1 },
        { id: 'e2', habitId: 'meditation', date: '2026-09-02', value: 1 },
        { id: 'e3', habitId: 'meditation', date: '2026-09-03', value: 1 },
        { id: 'e4', habitId: 'meditation', date: '2026-09-04', value: 1 },
        { id: 'e5', habitId: 'meditation', date: '2026-09-05', value: 1 },
        { id: 'e6', habitId: 'meditation', date: '2026-09-06', value: 1 },
        { id: 'e7', habitId: 'meditation', date: '2026-09-07', value: 1 },
        { id: 'e8', habitId: 'meditation', date: '2026-09-08', value: 1 },
        { id: 'e9', habitId: 'meditation', date: '2026-09-09', value: 1 },
        { id: 'e10', habitId: 'meditation', date: '2026-09-10', value: 1 },
      ]);

      const stats = await service.getWeekStats(meditationHabit, referenceDate);

      expect(stats.streak).toBe(10);
    });

    it('works for numeric habits based on reaching the goal', async () => {
      storage.getEntriesForHabit.mockResolvedValue([
        { id: 'e1', habitId: 'lesen', date: '2026-09-08', value: 25 },
        { id: 'e2', habitId: 'lesen', date: '2026-09-09', value: 20 },
        { id: 'e3', habitId: 'lesen', date: '2026-09-10', value: 15 }, // heute unter dem Ziel
      ]);

      const stats = await service.getWeekStats(readingHabit, referenceDate);

      expect(stats.streak).toBe(2);
    });
  });

  describe('getMonthStats', () => {
    it('returns the days from the 1st of the month through the reference date, oldest first', async () => {
      const stats = await service.getMonthStats(readingHabit, referenceDate);

      expect(stats.days[0].date).toBe('2026-09-01');
      expect(stats.days.at(-1)!.date).toBe('2026-09-10');
      expect(stats.days).toHaveLength(10);
    });

    it('fills in the recorded value per day for a numeric habit, defaulting to 0', async () => {
      storage.getEntriesForHabit.mockResolvedValue([
        { id: 'e1', habitId: 'lesen', date: '2026-09-03', value: 15 },
        { id: 'e2', habitId: 'lesen', date: '2026-08-31', value: 99 }, // vorheriger Monat
      ]);

      const stats = await service.getMonthStats(readingHabit, referenceDate);

      expect(stats.days.find((day) => day.date === '2026-09-03')?.value).toBe(15);
      expect(stats.days.find((day) => day.date === '2026-09-01')?.value).toBe(0);
      expect(stats.days.some((day) => day.date === '2026-08-31')).toBe(false);
    });

    it('reduces boolean habits to 0/1 per day, same as the week view', async () => {
      storage.getEntriesForHabit.mockResolvedValue([{ id: 'e1', habitId: 'meditation', date: '2026-09-05', value: 1 }]);

      const stats = await service.getMonthStats(meditationHabit, referenceDate);

      expect(stats.days.find((day) => day.date === '2026-09-05')?.value).toBe(1);
    });

    it('sums every day\'s value into total, for a numeric habit', async () => {
      storage.getEntriesForHabit.mockResolvedValue([
        { id: 'e1', habitId: 'lesen', date: '2026-09-01', value: 10 },
        { id: 'e2', habitId: 'lesen', date: '2026-09-05', value: 25 },
        { id: 'e3', habitId: 'lesen', date: '2026-08-31', value: 99 }, // ausserhalb des Monats
      ]);

      const stats = await service.getMonthStats(readingHabit, referenceDate);

      expect(stats.total).toBe(35);
    });

    it('sums a boolean habit\'s total as its count of done days', async () => {
      storage.getEntriesForHabit.mockResolvedValue([
        { id: 'e1', habitId: 'meditation', date: '2026-09-01', value: 1 },
        { id: 'e2', habitId: 'meditation', date: '2026-09-05', value: 1 },
        { id: 'e3', habitId: 'meditation', date: '2026-09-06', value: 0 },
      ]);

      const stats = await service.getMonthStats(meditationHabit, referenceDate);

      expect(stats.total).toBe(2);
    });

    it('has no entries and a total of 0 when nothing was recorded this month', async () => {
      const stats = await service.getMonthStats(readingHabit, referenceDate);

      expect(stats.hasEntries).toBe(false);
      expect(stats.total).toBe(0);
    });

    it('has entries when at least one day this month was recorded, even with value 0', async () => {
      storage.getEntriesForHabit.mockResolvedValue([{ id: 'e1', habitId: 'meditation', date: '2026-09-02', value: 0 }]);

      const stats = await service.getMonthStats(meditationHabit, referenceDate);

      expect(stats.hasEntries).toBe(true);
    });

    it('computes the same streak as the week view, since it does not depend on the shown window', async () => {
      storage.getEntriesForHabit.mockResolvedValue([
        { id: 'e1', habitId: 'meditation', date: '2026-09-09', value: 1 },
        { id: 'e2', habitId: 'meditation', date: '2026-09-10', value: 1 },
      ]);

      const stats = await service.getMonthStats(meditationHabit, referenceDate);

      expect(stats.streak).toBe(2);
    });

    it('spans a month boundary correctly, from the 1st through the reference date', async () => {
      // Dienstag, 2026-10-06 — der Monat beginnt am 2026-10-01.
      const octoberReferenceDate = new Date(2026, 9, 6);

      const stats = await service.getMonthStats(readingHabit, octoberReferenceDate);

      expect(stats.days.map((day) => day.date)).toEqual([
        '2026-10-01',
        '2026-10-02',
        '2026-10-03',
        '2026-10-04',
        '2026-10-05',
        '2026-10-06',
      ]);
    });
  });
});
