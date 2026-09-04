import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayPage } from './today.page';
import { today } from '../../core/date.util';
import { HabitStorageService } from '../../core/services/habit-storage.service';
import { Habit, HabitEntry } from '../../models/habit.model';

/** Waits for pending microtasks (e.g. the constructor's async reload) to settle. */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('TodayPage', () => {
  let fixture: ComponentFixture<TodayPage>;
  let storage: {
    getHabits: ReturnType<typeof vi.fn>;
    addHabit: ReturnType<typeof vi.fn>;
    deleteHabit: ReturnType<typeof vi.fn>;
    getEntry: ReturnType<typeof vi.fn>;
    setEntry: ReturnType<typeof vi.fn>;
  };

  const habit: Habit = { id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' };

  beforeEach(() => {
    storage = {
      getHabits: vi.fn().mockResolvedValue([habit]),
      addHabit: vi.fn(),
      deleteHabit: vi.fn().mockResolvedValue(undefined),
      getEntry: vi.fn().mockResolvedValue(undefined),
      setEntry: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: HabitStorageService, useValue: storage }],
    });

    fixture = TestBed.createComponent(TodayPage);
    fixture.detectChanges();
  });

  it('loads habits and today\'s entries on creation', async () => {
    await flushPromises();

    expect(storage.getHabits).toHaveBeenCalled();
    expect(storage.getEntry).toHaveBeenCalledWith('meditation', today());
    expect(fixture.componentInstance.habits()).toEqual([habit]);
  });

  it('counts a habit as done once it has a value greater than 0', async () => {
    storage.getEntry.mockResolvedValue({ id: 'e1', habitId: 'meditation', date: today(), value: 1 } as HabitEntry);
    fixture = TestBed.createComponent(TodayPage);
    fixture.detectChanges();
    await flushPromises();

    expect(fixture.componentInstance.doneCount()).toBe(1);
  });

  it('persists a value change and reflects it immediately', async () => {
    await flushPromises();
    storage.setEntry.mockResolvedValue({ id: 'e1', habitId: 'meditation', date: today(), value: 1 });

    await fixture.componentInstance.onValueChange(habit, 1);

    expect(storage.setEntry).toHaveBeenCalledWith('meditation', today(), 1);
    expect(fixture.componentInstance.valueFor('meditation')).toBe(1);
  });

  it('deletes a habit and reloads the list', async () => {
    await flushPromises();
    storage.getHabits.mockResolvedValue([]);

    await fixture.componentInstance.onDelete(habit);

    expect(storage.deleteHabit).toHaveBeenCalledWith('meditation');
    expect(fixture.componentInstance.habits()).toEqual([]);
  });

  it('adds a habit, closes the form and reloads the list', async () => {
    await flushPromises();
    const created: Habit = { id: 'lesen', name: 'Lesen', type: 'count', goal: 3, createdAt: 'now' };
    storage.addHabit.mockResolvedValue(created);
    storage.getHabits.mockResolvedValue([habit, created]);
    fixture.componentInstance.showForm.set(true);

    await fixture.componentInstance.onSave({ name: 'Lesen', type: 'count', goal: 3 });

    expect(storage.addHabit).toHaveBeenCalledWith({ name: 'Lesen', type: 'count', goal: 3 });
    expect(fixture.componentInstance.showForm()).toBe(false);
    expect(fixture.componentInstance.habits()).toEqual([habit, created]);
  });
});
