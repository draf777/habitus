import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitItemComponent } from './habit-item.component';
import { Habit } from '../../../models/habit.model';

describe('HabitItemComponent', () => {
  let fixture: ComponentFixture<HabitItemComponent>;

  function setup(habit: Habit, value = 0): void {
    fixture = TestBed.createComponent(HabitItemComponent);
    fixture.componentRef.setInput('habit', habit);
    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();
  }

  it('should create', () => {
    setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the habit name and goal with its unit for a tracked habit', () => {
    setup({
      id: 'lesen',
      name: 'Lesen',
      type: 'duration_min',
      goal: 20,
      createdAt: '2026-09-04T00:00:00.000Z',
    });

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Lesen');
    expect(text).toContain('Ziel: 20 Minuten');
  });

  it('renders a check button for a boolean habit and emits 1/0 when it changes', () => {
    setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' }, 0);

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    const checkButton = fixture.nativeElement.querySelector('ion-button[aria-label*="erledigt"]');
    expect(checkButton).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ion-input')).toBeNull();

    fixture.componentInstance.onCheckedChange(true);
    expect(emitted).toEqual([1]);
  });

  it('toggles the check button off when it is already checked', () => {
    setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' }, 1);

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    fixture.nativeElement.querySelector('ion-button[aria-label*="erledigt"]').click();
    expect(emitted).toEqual([0]);
  });

  it('renders a number input for a tracked habit and emits the parsed value', () => {
    setup({ id: 'lesen', name: 'Lesen', type: 'count', goal: 3, createdAt: '2026-09-04T00:00:00.000Z' }, 1);

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    expect(fixture.nativeElement.querySelector('ion-input')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ion-button[aria-label*="erledigt"]')).toBeNull();

    fixture.componentInstance.onNumberChange('2');
    expect(emitted).toEqual([2]);
  });

  it('falls back to 0 for an invalid or negative number', () => {
    setup({ id: 'lesen', name: 'Lesen', type: 'count', goal: 3, createdAt: '2026-09-04T00:00:00.000Z' });

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    fixture.componentInstance.onNumberChange('abc');
    fixture.componentInstance.onNumberChange(-5);
    expect(emitted).toEqual([0, 0]);
  });

  it('accepts a decimal value typed directly, e.g. for litres of water', () => {
    setup({ id: 'wasser', name: 'Wasser', type: 'count', goal: 3, createdAt: '2026-09-04T00:00:00.000Z' });

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    fixture.componentInstance.onNumberChange('2.5');
    expect(emitted).toEqual([2.5]);
  });

  it('nudges the value up/down by 1 when the habit has no custom step', () => {
    setup({ id: 'lesen', name: 'Lesen', type: 'duration_min', goal: 20, createdAt: '2026-09-04T00:00:00.000Z' }, 10);

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    fixture.componentInstance.nudge(1);
    expect(emitted).toEqual([11]);
  });

  it('nudges by the habit\'s custom step when one is set', () => {
    setup(
      { id: 'schritte', name: 'Schritte', type: 'count', goal: 10000, step: 100, createdAt: '2026-09-04T00:00:00.000Z' },
      9800,
    );

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    fixture.componentInstance.nudge(1);
    expect(emitted).toEqual([9900]);
  });

  it('shows the custom unit instead of the type default when one is set', () => {
    setup({
      id: 'wasser',
      name: 'Wasser',
      type: 'count',
      goal: 2.5,
      unit: 'Liter',
      createdAt: '2026-09-04T00:00:00.000Z',
    });

    expect(fixture.nativeElement.textContent).toContain('Ziel: 2.5 Liter');
  });

  it('shows the weekly progress when the habit has a weeklyGoal', () => {
    setup({ id: 'gym', name: 'Gym', type: 'boolean', weeklyGoal: 4, createdAt: '2026-09-04T00:00:00.000Z' });
    fixture.componentRef.setInput('weeklyProgress', { done: 2, goal: 4 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('2 / 4x diese Woche');
  });

  it('does not nudge below 0', () => {
    setup({ id: 'lesen', name: 'Lesen', type: 'count', goal: 3, createdAt: '2026-09-04T00:00:00.000Z' }, 0);

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    fixture.componentInstance.nudge(-1);
    expect(emitted).toEqual([0]);
  });

  it('renders +/- stepper buttons for a tracked habit', () => {
    setup({ id: 'lesen', name: 'Lesen', type: 'count', goal: 3, createdAt: '2026-09-04T00:00:00.000Z' });

    expect(fixture.nativeElement.querySelectorAll('.habit-item__nudge').length).toBe(2);
  });

  it('uses the fallback icon when the habit has none, and the chosen one otherwise', () => {
    setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' });
    const icon = fixture.nativeElement.querySelector('ion-icon') as HTMLElement & { name?: string };
    expect(icon.name).toBe('ellipse-outline');

    setup({
      id: 'sport',
      name: 'Sport',
      type: 'boolean',
      icon: 'barbell-outline',
      createdAt: '2026-09-04T00:00:00.000Z',
    });
    const iconWithHabitIcon = fixture.nativeElement.querySelector('ion-icon') as HTMLElement & { name?: string };
    expect(iconWithHabitIcon.name).toBe('barbell-outline');
  });

  it('emits edit when the edit button is clicked', () => {
    setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' });

    const edited = vi.fn();
    fixture.componentInstance.edit.subscribe(edited);

    fixture.nativeElement.querySelector('ion-button[aria-label*="bearbeiten"]').click();
    expect(edited).toHaveBeenCalled();
  });

  it('emits remove when the delete button is clicked', () => {
    setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' });

    const removed = vi.fn();
    fixture.componentInstance.remove.subscribe(removed);

    fixture.nativeElement.querySelector('ion-button[aria-label*="löschen"]').click();
    expect(removed).toHaveBeenCalled();
  });
});
