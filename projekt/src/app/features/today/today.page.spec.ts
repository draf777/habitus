import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertController, ToastController } from '@ionic/angular';

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
    updateHabit: ReturnType<typeof vi.fn>;
    deleteHabit: ReturnType<typeof vi.fn>;
    getEntry: ReturnType<typeof vi.fn>;
    setEntry: ReturnType<typeof vi.fn>;
    getEntriesForHabit: ReturnType<typeof vi.fn>;
  };
  /** The role returned by the confirm-delete alert once dismissed; set per test. */
  let alertDismissRole: string | undefined;
  let toastPresent: ReturnType<typeof vi.fn>;
  let toastCreate: ReturnType<typeof vi.fn>;

  const habit: Habit = { id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' };
  const trackedHabit: Habit = {
    id: 'lesen',
    name: 'Lesen',
    type: 'duration_min',
    goal: 20,
    createdAt: '2026-09-04T00:00:00.000Z',
  };

  beforeEach(() => {
    alertDismissRole = 'cancel';
    toastPresent = vi.fn().mockResolvedValue(undefined);
    toastCreate = vi.fn().mockResolvedValue({ present: toastPresent });

    storage = {
      getHabits: vi.fn().mockResolvedValue([habit]),
      addHabit: vi.fn(),
      updateHabit: vi.fn(),
      deleteHabit: vi.fn().mockResolvedValue(undefined),
      getEntry: vi.fn().mockResolvedValue(undefined),
      setEntry: vi.fn(),
      getEntriesForHabit: vi.fn().mockResolvedValue([]),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: HabitStorageService, useValue: storage },
        {
          provide: AlertController,
          useValue: {
            create: vi.fn().mockImplementation(() =>
              Promise.resolve({
                present: vi.fn().mockResolvedValue(undefined),
                onDidDismiss: () => Promise.resolve({ role: alertDismissRole }),
              }),
            ),
          },
        },
        { provide: ToastController, useValue: { create: toastCreate } },
      ],
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

  it('lists an unfinished habit under openHabits and a finished one under doneHabits', async () => {
    storage.getHabits.mockResolvedValue([habit, trackedHabit]);
    storage.getEntry.mockImplementation((habitId: string) =>
      Promise.resolve(
        habitId === 'meditation' ? undefined : ({ id: 'e1', habitId, date: today(), value: 20 } as HabitEntry),
      ),
    );
    fixture = TestBed.createComponent(TodayPage);
    fixture.detectChanges();
    await flushPromises();

    expect(fixture.componentInstance.openHabits()).toEqual([habit]);
    expect(fixture.componentInstance.doneHabits()).toEqual([trackedHabit]);
  });

  it('persists a value change and reflects it immediately', async () => {
    await flushPromises();
    storage.setEntry.mockResolvedValue({ id: 'e1', habitId: 'meditation', date: today(), value: 1 });

    await fixture.componentInstance.onValueChange(habit, 1);

    expect(storage.setEntry).toHaveBeenCalledWith('meditation', today(), 1);
    expect(fixture.componentInstance.valueFor('meditation')).toBe(1);
  });

  it('shows a toast the moment a habit newly reaches its goal', async () => {
    await flushPromises();
    storage.setEntry.mockResolvedValue({ id: 'e1', habitId: 'meditation', date: today(), value: 1 });

    await fixture.componentInstance.onValueChange(habit, 1);

    expect(toastCreate).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Meditation') }));
    expect(toastPresent).toHaveBeenCalled();
  });

  it('does not show a toast again once the habit is already done', async () => {
    storage.getEntry.mockResolvedValue({ id: 'e1', habitId: 'meditation', date: today(), value: 1 } as HabitEntry);
    fixture = TestBed.createComponent(TodayPage);
    fixture.detectChanges();
    await flushPromises();
    toastCreate.mockClear();

    await fixture.componentInstance.onValueChange(habit, 1);

    expect(toastCreate).not.toHaveBeenCalled();
  });

  it('does not delete when the confirmation is cancelled', async () => {
    await flushPromises();
    alertDismissRole = 'cancel';

    await fixture.componentInstance.confirmDelete(habit);

    expect(storage.deleteHabit).not.toHaveBeenCalled();
  });

  it('deletes a habit and reloads the list once the confirmation is accepted', async () => {
    await flushPromises();
    alertDismissRole = 'destructive';
    storage.getHabits.mockResolvedValue([]);

    await fixture.componentInstance.confirmDelete(habit);

    expect(storage.deleteHabit).toHaveBeenCalledWith('meditation');
    expect(fixture.componentInstance.habits()).toEqual([]);
  });

  it('adds a habit, closes the form and reloads the list', async () => {
    await flushPromises();
    const created: Habit = { id: 'lesen', name: 'Lesen', type: 'count', goal: 3, createdAt: 'now' };
    storage.addHabit.mockResolvedValue(created);
    storage.getHabits.mockResolvedValue([habit, created]);
    fixture.componentInstance.formMode.set('new');

    await fixture.componentInstance.onSave({ name: 'Lesen', type: 'count', goal: 3 });

    expect(storage.addHabit).toHaveBeenCalledWith({ name: 'Lesen', type: 'count', goal: 3 });
    expect(fixture.componentInstance.formMode()).toBeNull();
    expect(fixture.componentInstance.habits()).toEqual([habit, created]);
  });

  it('opens the form pre-set to the habit being edited', async () => {
    await flushPromises();

    fixture.componentInstance.formMode.set(habit);

    expect(fixture.componentInstance.editingHabit()).toEqual(habit);
  });

  it('updates (not adds) a habit when saving while editing', async () => {
    await flushPromises();
    const updated: Habit = { ...habit, name: 'Meditation (Morgen)' };
    storage.updateHabit.mockResolvedValue(updated);
    storage.getHabits.mockResolvedValue([updated]);
    fixture.componentInstance.formMode.set(habit);

    await fixture.componentInstance.onSave({ name: 'Meditation (Morgen)', type: 'boolean' });

    expect(storage.updateHabit).toHaveBeenCalledWith('meditation', { name: 'Meditation (Morgen)', type: 'boolean' });
    expect(storage.addHabit).not.toHaveBeenCalled();
    expect(fixture.componentInstance.formMode()).toBeNull();
    expect(fixture.componentInstance.habits()).toEqual([updated]);
  });

  it('computes how many days this week a habit with a weeklyGoal was done', async () => {
    const withWeeklyGoal: Habit = { ...trackedHabit, weeklyGoal: 4 };
    storage.getHabits.mockResolvedValue([withWeeklyGoal]);
    storage.getEntriesForHabit.mockResolvedValue([
      { id: 'e1', habitId: 'lesen', date: today(), value: 20 },
      { id: 'e2', habitId: 'lesen', date: '2000-01-01', value: 20 }, // ausserhalb dieser Woche
    ] satisfies HabitEntry[]);
    fixture = TestBed.createComponent(TodayPage);
    fixture.detectChanges();
    await flushPromises();

    expect(fixture.componentInstance.weeklyProgressFor(withWeeklyGoal)).toEqual({ done: 1, goal: 4 });
  });

  it('has no weekly progress for a habit without a weeklyGoal', async () => {
    await flushPromises();

    expect(fixture.componentInstance.weeklyProgressFor(habit)).toBeUndefined();
  });
});
