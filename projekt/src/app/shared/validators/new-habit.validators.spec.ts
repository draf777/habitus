import { FormControl, FormGroup } from '@angular/forms';

import { goalRequiredUnlessBoolean, weeklyGoalRequiredWhenWeekly } from './new-habit.validators';

describe('goalRequiredUnlessBoolean', () => {
  function group(type: string, goal: unknown, frequency: string = 'daily'): FormGroup {
    return new FormGroup({
      type: new FormControl(type),
      goal: new FormControl(goal),
      frequency: new FormControl(frequency),
    });
  }

  it('passes when the type is boolean, even without a goal', () => {
    expect(goalRequiredUnlessBoolean(group('boolean', null))).toBeNull();
  });

  it('passes for a weekly habit, even without a goal', () => {
    expect(goalRequiredUnlessBoolean(group('count', null, 'weekly'))).toBeNull();
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

describe('weeklyGoalRequiredWhenWeekly', () => {
  function group(frequency: string, weeklyGoal: unknown): FormGroup {
    return new FormGroup({
      frequency: new FormControl(frequency),
      weeklyGoal: new FormControl(weeklyGoal),
    });
  }

  it('passes for a daily habit, even without a weeklyGoal', () => {
    expect(weeklyGoalRequiredWhenWeekly(group('daily', null))).toBeNull();
  });

  it('fails when a weekly habit has no weeklyGoal', () => {
    expect(weeklyGoalRequiredWhenWeekly(group('weekly', null))).toEqual({ weeklyGoalRequired: true });
  });

  it('fails when a weekly habit has an empty-string weeklyGoal', () => {
    expect(weeklyGoalRequiredWhenWeekly(group('weekly', ''))).toEqual({ weeklyGoalRequired: true });
  });

  it('fails when weeklyGoal is outside 1-7', () => {
    expect(weeklyGoalRequiredWhenWeekly(group('weekly', 0))).toEqual({ weeklyGoalOutOfRange: true });
    expect(weeklyGoalRequiredWhenWeekly(group('weekly', 8))).toEqual({ weeklyGoalOutOfRange: true });
  });

  it('passes when a weekly habit has a valid weeklyGoal', () => {
    expect(weeklyGoalRequiredWhenWeekly(group('weekly', 3))).toBeNull();
  });
});
