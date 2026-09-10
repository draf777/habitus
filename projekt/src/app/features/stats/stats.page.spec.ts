import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { StatsPage } from './stats.page';
import { HabitStorageService } from '../../core/services/habit-storage.service';
import { HabitWeekStats, StatsService } from '../../core/services/stats.service';
import { SettingsService } from '../../core/services/settings.service';
import { Habit } from '../../models/habit.model';

/** Waits for pending microtasks (e.g. the constructor's async reload) to settle. */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const WEEK_DATES = ['2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10'];

function weekStatsWithValues(habit: Habit, values: number[], hasEntries = true): HabitWeekStats {
  return { habit, days: WEEK_DATES.map((date, i) => ({ date, value: values[i] })), hasEntries };
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
});
