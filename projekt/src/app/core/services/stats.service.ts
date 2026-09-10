import { Injectable, inject } from '@angular/core';

import { formatDate, lastDays } from '../date.util';
import { Habit } from '../../models/habit.model';
import { isHabitDone } from '../../shared/habit-progress.util';
import { HabitStorageService } from './habit-storage.service';

/** One day's value within a habit's week, as shown on the "Statistik" chart. */
export interface HabitDayValue {
  /** The day, as "YYYY-MM-DD". */
  readonly date: string;
  /** Recorded value for that day; 0 if nothing was entered. `boolean` habits are 0 or 1. */
  readonly value: number;
}

/** A habit's last 7 days, for the "Statistik" chart. */
export interface HabitWeekStats {
  readonly habit: Habit;
  /** One entry per day, oldest first. */
  readonly days: readonly HabitDayValue[];
  /** Whether at least one of those 7 days has a recorded entry. */
  readonly hasEntries: boolean;
  /**
   * Consecutive days the habit has been kept up, ending today. If today
   * hasn't been done yet, today doesn't break the streak — it just isn't
   * counted yet, so the streak from yesterday backward still shows.
   */
  readonly streak: number;
}

/**
 * Aggregates a habit's entries into its last 7 days, for the "Statistik"
 * chart, plus its current streak. `boolean` habits are reduced to 0/1 per
 * day (done or not); every other type keeps its recorded value (minutes,
 * hours or count).
 */
@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly storage = inject(HabitStorageService);

  /** The given habit's last 7 days and current streak, as of `referenceDate` (defaults to today). */
  async getWeekStats(habit: Habit, referenceDate: Date = new Date()): Promise<HabitWeekStats> {
    const dates = lastDays(referenceDate, 7);
    const entries = await this.storage.getEntriesForHabit(habit.id);
    const entryByDate = new Map(entries.map((entry) => [entry.date, entry.value] as const));

    const days = dates.map((date) => {
      const raw = entryByDate.get(date);
      const value = raw == null ? 0 : habit.type === 'boolean' ? (isHabitDone(habit, raw) ? 1 : 0) : raw;
      return { date, value };
    });

    return {
      habit,
      days,
      hasEntries: dates.some((date) => entryByDate.has(date)),
      streak: this.computeStreak(habit, entryByDate, referenceDate),
    };
  }

  /**
   * Walks backward from `referenceDate` counting consecutive done days,
   * stopping at the first miss. A day without an entry always counts as a
   * miss (never "done"), so the walk is guaranteed to terminate.
   */
  private computeStreak(habit: Habit, entryByDate: ReadonlyMap<string, number>, referenceDate: Date): number {
    const doneOn = (date: string): boolean => isHabitDone(habit, entryByDate.get(date) ?? 0);

    const cursor = new Date(referenceDate);
    if (!doneOn(formatDate(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;
    while (doneOn(formatDate(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }
}
