import { Habit, HabitStat } from '../models/habit.model';

/**
 * Placeholder habits backing the "Statistik" page, which has no real
 * weekly aggregation yet. "Heute" uses real, persisted habits since v0.2.0.
 */
export const DEMO_HABITS: readonly Habit[] = [
  { id: 'meditation', title: 'Meditation', icon: 'leaf-outline', weeklyGoal: 7 },
  { id: 'workout', title: 'Workout', icon: 'barbell-outline', weeklyGoal: 4 },
  { id: 'deep-work', title: 'Deep Work', icon: 'bulb-outline', weeklyGoal: 5 },
];

/** Dummy weekly numbers backing the statistics page. */
export const DEMO_STATS: readonly HabitStat[] = [
  { habit: DEMO_HABITS[0], completed: 5 },
  { habit: DEMO_HABITS[1], completed: 3 },
  { habit: DEMO_HABITS[2], completed: 2 },
];
