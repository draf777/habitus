import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitItemComponent } from './habit-item.component';
import { HabitEntry } from '../../../core/models/habit.model';

describe('HabitItemComponent', () => {
  let fixture: ComponentFixture<HabitItemComponent>;

  const entry: HabitEntry = {
    habit: { id: 'meditation', title: 'Meditation', icon: 'leaf-outline', weeklyGoal: 7 },
    done: true,
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitItemComponent);
    fixture.componentRef.setInput('entry', entry);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the habit title and its weekly goal', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Meditation');
    expect(text).toContain('7× pro Woche');
  });

  it('reflects the done state in the checkbox', () => {
    const checkbox = fixture.nativeElement.querySelector('ion-checkbox');
    expect(checkbox.checked).toBe(true);
  });
});
