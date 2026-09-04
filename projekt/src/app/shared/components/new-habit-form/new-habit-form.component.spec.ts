import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewHabitFormComponent } from './new-habit-form.component';

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

    expect(saved).toHaveBeenCalledWith({ name: 'Meditation', type: 'boolean' });
  });

  it('emits the trimmed, ready-to-persist value for a valid tracked habit', () => {
    const saved = vi.fn();
    component.save.subscribe(saved);

    component.form.controls.name.setValue('  Lesen  ');
    component.form.controls.type.setValue('duration_min');
    component.form.controls.goal.setValue(30);
    component.submit();

    expect(saved).toHaveBeenCalledWith({ name: 'Lesen', type: 'duration_min', goal: 30 });
  });

  it('emits canceled', () => {
    const cancelled = vi.fn();
    component.canceled.subscribe(cancelled);

    component.canceled.emit();

    expect(cancelled).toHaveBeenCalled();
  });
});
