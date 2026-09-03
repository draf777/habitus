import { Habit, HabitEntry, HabitStat } from '../models/habit.model';

/**
 * Placeholder habits for the v0.1.0 UI shell.
 *
 * They exist so the pages can be laid out and reviewed before persistence
 * exists. A later release replaces this module with a storage-backed service;
 * nothing outside these constants should need to change.
 */
export const DEMO_HABITS: readonly Habit[] = [
  { id: 'meditation', title: 'Meditation', icon: 'leaf-outline', weeklyGoal: 7 },
  { id: 'workout', title: 'Workout', icon: 'barbell-outline', weeklyGoal: 4 },
  { id: 'deep-work', title: 'Deep Work', icon: 'bulb-outline', weeklyGoal: 5 },
];

/** Today's habits with a dummy completion state. */
export const DEMO_TODAY: readonly HabitEntry[] = [
  { habit: DEMO_HABITS[0], done: true },
  { habit: DEMO_HABITS[1], done: false },
  { habit: DEMO_HABITS[2], done: false },
];

/** Dummy weekly numbers backing the statistics page. */
export const DEMO_STATS: readonly HabitStat[] = [
  { habit: DEMO_HABITS[0], completed: 5 },
  { habit: DEMO_HABITS[1], completed: 3 },
  { habit: DEMO_HABITS[2], completed: 2 },
];
