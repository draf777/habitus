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

  it('renders a toggle for a boolean habit and emits 1/0 when it changes', () => {
    setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' }, 0);

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    const toggle = fixture.nativeElement.querySelector('ion-toggle');
    expect(toggle).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ion-input')).toBeNull();

    fixture.componentInstance.onToggleChange(true);
    expect(emitted).toEqual([1]);
  });

  it('renders a number input for a tracked habit and emits the parsed value', () => {
    setup({ id: 'lesen', name: 'Lesen', type: 'count', goal: 3, createdAt: '2026-09-04T00:00:00.000Z' }, 1);

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    expect(fixture.nativeElement.querySelector('ion-input')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ion-toggle')).toBeNull();

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

  it('emits remove when the delete button is clicked', () => {
    setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' });

    const removed = vi.fn();
    fixture.componentInstance.remove.subscribe(removed);

    fixture.nativeElement.querySelector('ion-button').click();
    expect(removed).toHaveBeenCalled();
  });
});
