import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewHabitFormComponent } from './new-habit-form.component';
import { Habit } from '../../../models/habit.model';

describe('NewHabitFormComponent', () => {
  let fixture: ComponentFixture<NewHabitFormComponent>;
  let component: NewHabitFormComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(NewHabitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not emit save and marks fields touched when the name is too short', () => {
    const saved = vi.fn();
    component.save.subscribe(saved);

    component.form.controls.name.setValue('A');
    component.form.controls.goal.setValue(10);
    component.submit();

    expect(saved).not.toHaveBeenCalled();
    expect(component.form.controls.name.touched).toBe(true);
  });

  it('requires a goal for tracked types', () => {
    const saved = vi.fn();
    component.save.subscribe(saved);

    component.form.controls.name.setValue('Lesen');
    component.form.controls.type.setValue('count');
    component.form.controls.goal.setValue(null);
    component.submit();

    expect(saved).not.toHaveBeenCalled();
    expect(component.form.hasError('goalRequired')).toBe(true);
  });

  it('does not require a goal for boolean habits', () => {
    const saved = vi.fn();
    component.save.subscribe(saved);

    component.form.controls.name.setValue('Meditation');
    component.form.controls.type.setValue('boolean');
    component.submit();

    expect(saved).toHaveBeenCalledWith({ name: 'Meditation', type: 'boolean', frequency: 'daily' });
  });

  it('emits the trimmed, ready-to-persist value for a valid tracked habit, defaulting step to 1', () => {
    const saved = vi.fn();
    component.save.subscribe(saved);

    component.form.controls.name.setValue('  Lesen  ');
    component.form.controls.type.setValue('duration_min');
    component.form.controls.goal.setValue(30);
    component.submit();

    expect(saved).toHaveBeenCalledWith({ name: 'Lesen', type: 'duration_min', frequency: 'daily', goal: 30, step: 1 });
  });

  it('includes a custom step and unit when set', () => {
    const saved = vi.fn();
    component.save.subscribe(saved);

    component.form.controls.name.setValue('Schritte');
    component.form.controls.type.setValue('count');
    component.form.controls.goal.setValue(10000);
    component.form.controls.step.setValue(100);
    component.form.controls.unit.setValue('Schritte');
    component.submit();

    expect(saved).toHaveBeenCalledWith({
      name: 'Schritte',
      type: 'count',
      frequency: 'daily',
      goal: 10000,
      step: 100,
      unit: 'Schritte',
    });
  });

  it('selects an icon and includes it in the emitted value', () => {
    const saved = vi.fn();
    component.save.subscribe(saved);

    component.selectIcon('barbell-outline');
    component.form.controls.name.setValue('Sport');
    component.form.controls.type.setValue('boolean');
    component.submit();

    expect(component.selectedIcon()).toBe('barbell-outline');
    expect(saved).toHaveBeenCalledWith({
      name: 'Sport',
      type: 'boolean',
      frequency: 'daily',
      icon: 'barbell-outline',
    });
  });

  it('deselects an icon when it is picked again', () => {
    component.selectIcon('barbell-outline');
    component.selectIcon('barbell-outline');

    expect(component.selectedIcon()).toBeNull();
  });

  it('selects a color and includes it in the emitted value', () => {
    const saved = vi.fn();
    component.save.subscribe(saved);

    component.selectColor('#0054e9');
    component.form.controls.name.setValue('Sport');
    component.form.controls.type.setValue('boolean');
    component.submit();

    expect(component.selectedColor()).toBe('#0054e9');
    expect(saved).toHaveBeenCalledWith({
      name: 'Sport',
      type: 'boolean',
      frequency: 'daily',
      color: '#0054e9',
    });
  });

  it('deselects a color when it is picked again', () => {
    component.selectColor('#0054e9');
    component.selectColor('#0054e9');

    expect(component.selectedColor()).toBeNull();
  });

  it('emits canceled', () => {
    const cancelled = vi.fn();
    component.canceled.subscribe(cancelled);

    component.canceled.emit();

    expect(cancelled).toHaveBeenCalled();
  });

  describe('weekly frequency', () => {
    it('forces the type to boolean when switched to weekly', () => {
      component.form.controls.type.setValue('duration_min');

      component.form.controls.frequency.setValue('weekly');

      expect(component.form.controls.type.value).toBe('boolean');
    });

    it('requires a weeklyGoal instead of a daily goal', () => {
      const saved = vi.fn();
      component.save.subscribe(saved);

      component.form.controls.name.setValue('Gym');
      component.form.controls.frequency.setValue('weekly');
      component.submit();

      expect(saved).not.toHaveBeenCalled();
      expect(component.form.hasError('weeklyGoalRequired')).toBe(true);
    });

    it('rejects a weeklyGoal outside 1-7', () => {
      const saved = vi.fn();
      component.save.subscribe(saved);

      component.form.controls.name.setValue('Gym');
      component.form.controls.frequency.setValue('weekly');
      component.form.controls.weeklyGoal.setValue(8);
      component.submit();

      expect(saved).not.toHaveBeenCalled();
      expect(component.form.hasError('weeklyGoalOutOfRange')).toBe(true);
    });

    it('emits a weekly habit as boolean type with its weeklyGoal, and no daily goal fields', () => {
      const saved = vi.fn();
      component.save.subscribe(saved);

      component.form.controls.name.setValue('Gym');
      component.form.controls.frequency.setValue('weekly');
      component.form.controls.weeklyGoal.setValue(3);
      component.submit();

      expect(saved).toHaveBeenCalledWith({
        name: 'Gym',
        type: 'boolean',
        frequency: 'weekly',
        weeklyGoal: 3,
      });
    });
  });

  describe('editing an existing daily habit', () => {
    const existing: Habit = {
      id: 'lesen',
      name: 'Lesen',
      type: 'duration_min',
      frequency: 'daily',
      goal: 20,
      icon: 'book-outline',
      color: '#2dd55b',
      unit: 'Seiten',
      step: 5,
      createdAt: '2026-09-01T00:00:00.000Z',
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(NewHabitFormComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('habit', existing);
      fixture.detectChanges();
    });

    it('prefills the form and reports isEditing', () => {
      expect(component.isEditing()).toBe(true);
      expect(component.form.getRawValue()).toEqual({
        name: 'Lesen',
        frequency: 'daily',
        type: 'duration_min',
        goal: 20,
        weeklyGoal: null,
        icon: 'book-outline',
        color: '#2dd55b',
        unit: 'Seiten',
        step: 5,
      });
    });

    it('leaves type and frequency editable', () => {
      expect(component.form.controls.type.disabled).toBe(false);
      expect(component.form.controls.frequency.disabled).toBe(false);
    });

    it('emits a clean value when the type is changed while editing, dropping fields the new type no longer uses', () => {
      const saved = vi.fn();
      component.save.subscribe(saved);

      component.form.controls.type.setValue('boolean');
      component.submit();

      expect(saved).toHaveBeenCalledWith({
        name: 'Lesen',
        type: 'boolean',
        frequency: 'daily',
        icon: 'book-outline',
        color: '#2dd55b',
      });
    });

    it('emits weeklyGoal (and switches type to boolean) when frequency is changed to weekly while editing', () => {
      const saved = vi.fn();
      component.save.subscribe(saved);

      component.form.controls.frequency.setValue('weekly');
      component.form.controls.weeklyGoal.setValue(3);
      component.submit();

      expect(saved).toHaveBeenCalledWith({
        name: 'Lesen',
        type: 'boolean',
        frequency: 'weekly',
        weeklyGoal: 3,
        icon: 'book-outline',
        color: '#2dd55b',
      });
    });

    it('emits the updated value on save, keeping the original type and frequency', () => {
      const saved = vi.fn();
      component.save.subscribe(saved);

      component.form.controls.name.setValue('Lesen (abends)');
      component.form.controls.goal.setValue(30);
      component.submit();

      expect(saved).toHaveBeenCalledWith({
        name: 'Lesen (abends)',
        type: 'duration_min',
        frequency: 'daily',
        goal: 30,
        step: 5,
        unit: 'Seiten',
        icon: 'book-outline',
        color: '#2dd55b',
      });
    });
  });

  describe('editing an existing weekly habit', () => {
    const existing: Habit = {
      id: 'gym',
      name: 'Gym',
      type: 'boolean',
      frequency: 'weekly',
      weeklyGoal: 3,
      createdAt: '2026-09-01T00:00:00.000Z',
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(NewHabitFormComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('habit', existing);
      fixture.detectChanges();
    });

    it('prefills frequency and weeklyGoal', () => {
      expect(component.form.controls.frequency.value).toBe('weekly');
      expect(component.form.controls.weeklyGoal.value).toBe(3);
    });

    it('emits the updated weeklyGoal on save', () => {
      const saved = vi.fn();
      component.save.subscribe(saved);

      component.form.controls.weeklyGoal.setValue(4);
      component.submit();

      expect(saved).toHaveBeenCalledWith({ name: 'Gym', type: 'boolean', frequency: 'weekly', weeklyGoal: 4 });
    });

    it('drops weeklyGoal when frequency is switched back to daily while editing', () => {
      const saved = vi.fn();
      component.save.subscribe(saved);

      component.form.controls.frequency.setValue('daily');
      component.form.controls.type.setValue('count');
      component.form.controls.goal.setValue(5);
      component.submit();

      expect(saved).toHaveBeenCalledWith({ name: 'Gym', type: 'count', frequency: 'daily', goal: 5, step: 1 });
    });
  });
});
