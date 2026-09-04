/**
 * How a habit's daily progress is measured and entered.
 *
 * `boolean` habits are checked off; the other three take a numeric value
 * against `Habit.goal` (minutes, hours or a plain count).
 */
export type HabitType = 'duration_min' | 'duration_hours' | 'count' | 'boolean';

/**
 * A habit the user wants to repeat regularly, as stored on the device.
 *
 * Persisted via `HabitStorageService`. `goal` is required for every type
 * except `boolean`, where the habit is either done or not.
 */
export interface Habit {
  /** Stable identifier, unique across all habits. */
  readonly id: string;
  /** Display name, e.g. "Meditation". */
  readonly name: string;
  /** How progress is tracked for this habit. */
  readonly type: HabitType;
  /** Daily target in the habit's unit; unused for `boolean` habits. */
  readonly goal?: number;
  /** Ionicons icon name shown next to the name. */
  readonly icon?: string;
  /** Accent color for the habit, as a CSS color value. */
  readonly color?: string;
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
