import { Habit } from '../models/habit.model';
import { habitTypeUnit } from './habit-type-options';

/** The unit label to show for a habit: its custom `unit`, or the type's default. */
export function resolveHabitUnit(habit: Habit): string | undefined {
  return habit.unit?.trim() || habitTypeUnit(habit.type);
}

/** How much the +/- buttons nudge a habit's value by; the habit's `step`, or 1. */
export function resolveHabitStep(habit: Habit): number {
  return habit.step && habit.step > 0 ? habit.step : 1;
}
