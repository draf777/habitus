import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitProgressComponent } from './habit-progress.component';
import { Habit, HabitStat } from '../../../core/models/habit.model';

describe('HabitProgressComponent', () => {
  let fixture: ComponentFixture<HabitProgressComponent>;

  const habit: Habit = { id: 'workout', title: 'Workout', icon: 'barbell-outline', weeklyGoal: 4 };

  function setStat(stat: HabitStat): void {
    fixture.componentRef.setInput('stat', stat);
    fixture.detectChanges();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitProgressComponent);
    setStat({ habit, completed: 3 });
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('computes the progress as completed / goal', () => {
    expect(fixture.componentInstance.progress()).toBeCloseTo(0.75);
  });

  it('caps the progress at 1 when the goal is exceeded', () => {
    setStat({ habit, completed: 9 });
    expect(fixture.componentInstance.progress()).toBe(1);
  });

  it('reports no progress when the goal is zero', () => {
    setStat({ habit: { ...habit, weeklyGoal: 0 }, completed: 2 });
    expect(fixture.componentInstance.progress()).toBe(0);
  });

  it('shows the completed count next to the goal', () => {
    expect(fixture.nativeElement.textContent).toContain('3 / 4');
  });
});
