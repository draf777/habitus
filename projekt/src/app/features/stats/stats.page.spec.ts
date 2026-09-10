import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { StatsPage } from './stats.page';
import { formatDate } from '../../core/date.util';
import { HabitStorageService } from '../../core/services/habit-storage.service';
import { HabitWeekStats, StatsService } from '../../core/services/stats.service';
import { SettingsService } from '../../core/services/settings.service';
import { Habit, HabitEntry } from '../../models/habit.model';

/** "YYYY-MM-DD" for `n` days before today, in local time. */
function daysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return formatDate(date);
}

/** Waits for pending microtasks (e.g. the constructor's async reload) to settle. */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const WEEK_DATES = ['2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10'];

function weekStatsWithValues(habit: Habit, values: number[], hasEntries = true, streak = 0): HabitWeekStats {
  return { habit, days: WEEK_DATES.map((date, i) => ({ date, value: values[i] })), hasEntries, streak };
}

describe('StatsPage', () => {
  let fixture: ComponentFixture<StatsPage>;
  let habitStorage: { getHabits: ReturnType<typeof vi.fn> };
  let statsService: { getWeekStats: ReturnType<typeof vi.fn> };

  const meditation: Habit = {
    id: 'meditation',
    name: 'Meditation',
    type: 'boolean',
    createdAt: '2026-09-01T00:00:00.000Z',
  };
  const reading: Habit = {
    id: 'lesen',
    name: 'Lesen',
    type: 'duration_min',
    goal: 20,
    createdAt: '2026-09-01T00:00:00.000Z',
  };

  beforeEach(() => {
    habitStorage = { getHabits: vi.fn().mockResolvedValue([meditation, reading]) };
    statsService = {
      getWeekStats: vi.fn().mockResolvedValue(weekStatsWithValues(meditation, [0, 1, 0, 1, 0, 0, 1])),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: HabitStorageService, useValue: habitStorage },
        { provide: StatsService, useValue: statsService },
        { provide: SettingsService, useValue: { theme: signal('system'), colorScheme: signal('ocean') } },
      ],
    });

    fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads the habits and selects the first one', async () => {
    await flushPromises();

    expect(fixture.componentInstance.habits()).toEqual([meditation, reading]);
    expect(fixture.componentInstance.selectedHabitId()).toBe('meditation');
    expect(statsService.getWeekStats).toHaveBeenCalledWith(meditation);
  });

  it("loads a different habit's stats when the selection changes", async () => {
    await flushPromises();
    statsService.getWeekStats.mockResolvedValue(weekStatsWithValues(reading, [0, 10, 0, 0, 20, 0, 0]));

    await fixture.componentInstance.onHabitChange('lesen');

    expect(statsService.getWeekStats).toHaveBeenCalledWith(reading);
    expect(fixture.componentInstance.chartData().datasets[0].data).toEqual([0, 10, 0, 0, 20, 0, 0]);
  });

  it('counts how many of the last 7 days a boolean habit was done', async () => {
    await flushPromises();

    expect(fixture.componentInstance.doneDays()).toBe(3);
  });

  it('exposes the streak from the service and shows it as a badge', async () => {
    statsService.getWeekStats.mockResolvedValue(weekStatsWithValues(meditation, [0, 1, 0, 1, 0, 0, 1], true, 4));
    fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.componentInstance.streak()).toBe(4);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('4 Tage am Stück');
  });

  it('shows the singular "Tag" for a streak of exactly one day', async () => {
    statsService.getWeekStats.mockResolvedValue(weekStatsWithValues(meditation, [0, 0, 0, 0, 0, 0, 1], true, 1));
    fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();
    await flushPromises();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('1 Tag am Stück');
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('1 Tage am Stück');
  });

  it('shows no streak badge when the streak is 0', async () => {
    statsService.getWeekStats.mockResolvedValue(weekStatsWithValues(meditation, [0, 0, 0, 0, 0, 0, 0], true, 0));
    fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.streak-badge')).toBeNull();
  });

  it('shows the empty state when the selected habit has no entries yet', async () => {
    statsService.getWeekStats.mockResolvedValue(weekStatsWithValues(meditation, [0, 0, 0, 0, 0, 0, 0], false));
    fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();
    await flushPromises();

    expect(fixture.componentInstance.hasEntries()).toBe(false);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Noch keine Daten für diese Woche.');
  });

  it('shows the empty state when there are no habits at all', async () => {
    habitStorage.getHabits.mockResolvedValue([]);
    statsService.getWeekStats.mockClear();
    fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();
    await flushPromises();

    expect(fixture.componentInstance.habits()).toEqual([]);
    expect(fixture.componentInstance.selectedHabitId()).toBeNull();
    expect(statsService.getWeekStats).not.toHaveBeenCalled();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Noch keine Habits angelegt.');
  });

  it('reloads when the page becomes active again (e.g. after a habit was added on another tab)', async () => {
    await flushPromises();
    habitStorage.getHabits.mockResolvedValue([meditation, reading]);
    statsService.getWeekStats.mockResolvedValue(weekStatsWithValues(reading, [0, 5, 0, 0, 0, 0, 0]));

    fixture.componentInstance.ionViewWillEnter();
    await flushPromises();

    expect(fixture.componentInstance.habits()).toEqual([meditation, reading]);
  });

  it('keeps the current selection across a reload if the habit still exists', async () => {
    await flushPromises();
    await fixture.componentInstance.onHabitChange('lesen');
    statsService.getWeekStats.mockResolvedValue(weekStatsWithValues(reading, [0, 5, 0, 0, 0, 0, 0]));

    fixture.componentInstance.ionViewWillEnter();
    await flushPromises();

    expect(fixture.componentInstance.selectedHabitId()).toBe('lesen');
  });

  it('falls back to the first habit if the selected one was deleted elsewhere', async () => {
    await flushPromises();
    await fixture.componentInstance.onHabitChange('lesen');
    habitStorage.getHabits.mockResolvedValue([meditation]);

    fixture.componentInstance.ionViewWillEnter();
    await flushPromises();

    expect(fixture.componentInstance.selectedHabitId()).toBe('meditation');
  });
});

/**
 * End-to-end: real `StatsService` computing from real recorded entries (only
 * `HabitStorageService` is faked), so these confirm the streak badge shows
 * the right number for someone who has actually kept a habit up for a few
 * days — not just that the page renders whatever number a mock hands it.
 */
describe('StatsPage — streak, end-to-end with the real StatsService', () => {
  let fixture: ComponentFixture<StatsPage>;
  let entries: HabitEntry[];
  let habitStorage: { getHabits: ReturnType<typeof vi.fn>; getEntriesForHabit: ReturnType<typeof vi.fn> };

  const habit: Habit = { id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2020-01-01T00:00:00.000Z' };

  function setup(): void {
    habitStorage = {
      getHabits: vi.fn().mockResolvedValue([habit]),
      getEntriesForHabit: vi.fn().mockImplementation(() => Promise.resolve(entries)),
    };

    TestBed.configureTestingModule({
      providers: [
        StatsService,
        { provide: HabitStorageService, useValue: habitStorage },
        { provide: SettingsService, useValue: { theme: signal('system'), colorScheme: signal('ocean') } },
      ],
    });

    fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();
  }

  it('shows a 3-day streak for a habit done today, yesterday and the day before', async () => {
    entries = [0, 1, 2].map((n) => ({ id: `e${n}`, habitId: habit.id, date: daysAgo(n), value: 1 }));
    setup();
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.componentInstance.streak()).toBe(3);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('3 Tage am Stück');
  });

  it('shows a 2-day streak for a habit done the last 2 days but not yet today', async () => {
    entries = [1, 2].map((n) => ({ id: `e${n}`, habitId: habit.id, date: daysAgo(n), value: 1 }));
    setup();
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.componentInstance.streak()).toBe(2);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('2 Tage am Stück');
  });

  it('shows a streak that reaches back further than the 7-day chart', async () => {
    entries = Array.from({ length: 9 }, (_, n) => ({ id: `e${n}`, habitId: habit.id, date: daysAgo(n), value: 1 }));
    setup();
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.componentInstance.streak()).toBe(9);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('9 Tage am Stück');
  });

  it('shows no streak badge for a habit that was done a few days ago but then missed', async () => {
    entries = [3, 4, 5].map((n) => ({ id: `e${n}`, habitId: habit.id, date: daysAgo(n), value: 1 }));
    setup();
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.componentInstance.streak()).toBe(0);
    expect(fixture.nativeElement.querySelector('.streak-badge')).toBeNull();
  });
});
