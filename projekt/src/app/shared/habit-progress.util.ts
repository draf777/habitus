import { Habit } from '../models/habit.model';

/**
 * Whether a habit counts as done for a given value: reaching 1 for `boolean`
 * habits, reaching `goal` for every other type.
 */
export function isHabitDone(habit: Habit, value: number): boolean {
  if (habit.type === 'boolean') {
    return value >= 1;
  }
  return habit.goal != null && value >= habit.goal;
}
