/**
 * How a habit's daily progress is measured and entered.
 *
 * `boolean` habits are checked off; the other three take a numeric value
 * against `Habit.goal` (minutes, hours or a plain count).
 */
export type HabitType = 'duration_min' | 'duration_hours' | 'count' | 'boolean';

/**
 * Whether a habit is tracked every day or only some days a week.
 *
 * `weekly` habits are always `boolean` under the hood — "done" is a
 * yes/no per day, and `weeklyGoal` is how many of those days count toward
 * the target (e.g. "Gym, 3x pro Woche").
 */
export type HabitFrequency = 'daily' | 'weekly';

/**
 * A habit the user wants to repeat regularly, as stored on the device.
 *
 * Persisted via `HabitStorageService`. `goal` is required for every `daily`
 * type except `boolean`, where the habit is either done or not. `weeklyGoal`
 * is required instead when `frequency` is `weekly`.
 */
export interface Habit {
  /** Stable identifier, unique across all habits. */
  readonly id: string;
  /** Display name, e.g. "Meditation". */
  readonly name: string;
  /** How progress is tracked for this habit. */
  readonly type: HabitType;
  /** Whether this habit is tracked daily or as a weekly frequency target. Defaults to `daily`. */
  readonly frequency?: HabitFrequency;
  /** Daily target in the habit's unit; unused for `boolean` habits or `weekly` frequency. */
  readonly goal?: number;
  /** Ionicons icon name shown next to the name. */
  readonly icon?: string;
  /** Accent color for the habit, as a CSS color value. */
  readonly color?: string;
  /** Custom unit label overriding the type's default, e.g. "Liter". Unused for `boolean`. */
  readonly unit?: string;
  /** How much the +/- buttons nudge the value by. Defaults to 1. Unused for `boolean`. */
  readonly step?: number;
  /** Target number of days per week this habit should be done (1-7). Only used when `frequency` is `weekly`. */
  readonly weeklyGoal?: number;
  /** ISO timestamp of when the habit was created. */
  readonly createdAt: string;
}

/**
 * The recorded progress of one habit on one day.
 *
 * At most one entry exists per `(habitId, date)` pair; `setEntry` overwrites
 * the previous value for that day.
 */
export interface HabitEntry {
  /** Stable identifier, unique across all entries. */
  readonly id: string;
  /** The habit this entry belongs to. */
  readonly habitId: string;
  /** Day the entry is for, as "YYYY-MM-DD". */
  readonly date: string;
  /** Recorded progress: minutes/hours/count, or 0 / 1 for `boolean` habits. */
  readonly value: number;
}
