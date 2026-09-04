import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Requires `goal` to be a positive number, unless `type` is `'boolean'` —
 * a yes/no habit has no daily target to reach.
 *
 * Applied on the `FormGroup` (not the `goal` control alone) because the
 * requirement depends on the sibling `type` control.
 */
export function goalRequiredUnlessBoolean(group: AbstractControl): ValidationErrors | null {
  const type = group.get('type')?.value;
  const goal = group.get('goal')?.value;

  if (type === 'boolean') {
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
