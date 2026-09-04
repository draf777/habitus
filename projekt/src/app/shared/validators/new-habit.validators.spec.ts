import { FormControl, FormGroup } from '@angular/forms';

import { goalRequiredUnlessBoolean } from './new-habit.validators';

describe('goalRequiredUnlessBoolean', () => {
  function group(type: string, goal: unknown): FormGroup {
    return new FormGroup({
      type: new FormControl(type),
      goal: new FormControl(goal),
    });
  }

  it('passes when the type is boolean, even without a goal', () => {
    expect(goalRequiredUnlessBoolean(group('boolean', null))).toBeNull();
  });

  it('fails when a tracked type has no goal', () => {
    expect(goalRequiredUnlessBoolean(group('count', null))).toEqual({ goalRequired: true });
  });

  it('fails when a tracked type has an empty-string goal', () => {
    expect(goalRequiredUnlessBoolean(group('duration_min', ''))).toEqual({ goalRequired: true });
  });

  it('fails when the goal is zero or negative', () => {
    expect(goalRequiredUnlessBoolean(group('count', 0))).toEqual({ goalTooSmall: true });
    expect(goalRequiredUnlessBoolean(group('count', -3))).toEqual({ goalTooSmall: true });
  });

  it('passes when a tracked type has a valid goal', () => {
    expect(goalRequiredUnlessBoolean(group('duration_hours', 2))).toBeNull();
  });
});
