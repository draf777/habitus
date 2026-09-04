import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Requires `goal` to be a positive number, unless `type` is `'boolean'` or
 * `frequency` is `'weekly'` — neither has a daily target to reach.
 *
 * Applied on the `FormGroup` (not the `goal` control alone) because the
 * requirement depends on sibling controls.
 */
export function goalRequiredUnlessBoolean(group: AbstractControl): ValidationErrors | null {
  const type = group.get('type')?.value;
  const frequency = group.get('frequency')?.value;
  const goal = group.get('goal')?.value;

  if (type === 'boolean' || frequency === 'weekly') {
    return null;
  }
  if (goal === null || goal === undefined || goal === '') {
    return { goalRequired: true };
  }
  if (Number(goal) < 1) {
    return { goalTooSmall: true };
  }
  return null;
}

/**
 * Requires `weeklyGoal` to be a whole number between 1 and 7, but only when
 * `frequency` is `'weekly'` — a daily habit has no weekly frequency target.
 */
export function weeklyGoalRequiredWhenWeekly(group: AbstractControl): ValidationErrors | null {
  const frequency = group.get('frequency')?.value;
  const weeklyGoal = group.get('weeklyGoal')?.value;

  if (frequency !== 'weekly') {
    return null;
  }
  if (weeklyGoal === null || weeklyGoal === undefined || weeklyGoal === '') {
    return { weeklyGoalRequired: true };
  }
  if (Number(weeklyGoal) < 1 || Number(weeklyGoal) > 7) {
    return { weeklyGoalOutOfRange: true };
  }
  return null;
}
