/**
 * A habit the user wants to repeat regularly.
 *
 * Persistence is not part of v0.1.0 — habits currently come from
 * `demo-habits.ts`. The shape is already the one a storage layer will
 * return, so the UI does not have to change when persistence lands.
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

/** A habit together with the state it has on a specific day. */
export interface HabitEntry {
  readonly habit: Habit;
  /** Whether the habit is already checked off for that day. */
  readonly done: boolean;
}

/** A habit together with its aggregated numbers for the current week. */
export interface HabitStat {
  readonly habit: Habit;
  /** Times the habit was completed in the current week. */
  readonly completed: number;
}
