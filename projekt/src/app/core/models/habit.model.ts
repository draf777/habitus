/**
 * A habit as shown on the "Statistik" page.
 *
 * That page still renders `demo-habits.ts` — the real, persisted habit shape
 * lives in `app/models/habit.model.ts` and backs "Heute" since v0.2.0.
 */
export interface Habit {
  /** Stable identifier, unique across all habits. */
  readonly id: string;
  /** Display name, e.g. "Meditation". */
  readonly title: string;
  /** Ionicons icon name shown next to the title. */
  readonly icon: string;
  /** How many times per week the habit should be done. */
  readonly weeklyGoal: number;
}

/** A habit together with its aggregated numbers for the current week. */
export interface HabitStat {
  readonly habit: Habit;
  /** Times the habit was completed in the current week. */
  readonly completed: number;
}
