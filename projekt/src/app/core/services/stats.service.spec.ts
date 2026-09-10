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
});
