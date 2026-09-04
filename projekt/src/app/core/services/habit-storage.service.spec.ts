import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';

import { HabitStorageService } from './habit-storage.service';

/** In-memory stand-in for Ionic Storage, so tests don't need a real driver. */
class FakeStorage {
  private readonly store = new Map<string, unknown>();

  async create(): Promise<this> {
    return this;
  }

  async get(key: string): Promise<unknown> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
  }
}

describe('HabitStorageService', () => {
  let service: HabitStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HabitStorageService, { provide: Storage, useClass: FakeStorage }],
    });
    service = TestBed.inject(HabitStorageService);
  });

  it('starts with no habits', async () => {
    expect(await service.getHabits()).toEqual([]);
  });

  it('adds a habit and assigns it an id and createdAt', async () => {
    const habit = await service.addHabit({ name: 'Meditation', type: 'count', goal: 1 });

    expect(habit.id).toBeTruthy();
    expect(habit.createdAt).toBeTruthy();
    expect(await service.getHabits()).toEqual([habit]);
  });

  it('keeps previously added habits when adding another one', async () => {
    const first = await service.addHabit({ name: 'Meditation', type: 'boolean' });
    const second = await service.addHabit({ name: 'Lesen', type: 'duration_min', goal: 30 });

    expect(await service.getHabits()).toEqual([first, second]);
  });

  it('deletes a habit', async () => {
    const habit = await service.addHabit({ name: 'Meditation', type: 'boolean' });

    await service.deleteHabit(habit.id);

    expect(await service.getHabits()).toEqual([]);
  });

  it('deletes a habit\'s entries together with the habit', async () => {
    const habit = await service.addHabit({ name: 'Meditation', type: 'boolean' });
    await service.setEntry(habit.id, '2026-09-04', 1);

    await service.deleteHabit(habit.id);

    expect(await service.getEntry(habit.id, '2026-09-04')).toBeUndefined();
  });

  it('has no entry for a day nothing was recorded on', async () => {
    const habit = await service.addHabit({ name: 'Meditation', type: 'boolean' });

    expect(await service.getEntry(habit.id, '2026-09-04')).toBeUndefined();
  });

  it('records an entry for a habit on a given day', async () => {
    const habit = await service.addHabit({ name: 'Lesen', type: 'duration_min', goal: 30 });

    const entry = await service.setEntry(habit.id, '2026-09-04', 20);

    expect(entry.habitId).toBe(habit.id);
    expect(entry.date).toBe('2026-09-04');
    expect(entry.value).toBe(20);
    expect(await service.getEntry(habit.id, '2026-09-04')).toEqual(entry);
  });

  it('overwrites the entry for the same habit and day instead of duplicating it', async () => {
    const habit = await service.addHabit({ name: 'Lesen', type: 'duration_min', goal: 30 });

    const first = await service.setEntry(habit.id, '2026-09-04', 10);
    const second = await service.setEntry(habit.id, '2026-09-04', 25);

    expect(second.id).toBe(first.id);
    expect(await service.getEntry(habit.id, '2026-09-04')).toEqual(second);
  });

  it('keeps entries for different days apart', async () => {
    const habit = await service.addHabit({ name: 'Lesen', type: 'duration_min', goal: 30 });

    await service.setEntry(habit.id, '2026-09-03', 10);
    await service.setEntry(habit.id, '2026-09-04', 25);

    expect((await service.getEntry(habit.id, '2026-09-03'))?.value).toBe(10);
    expect((await service.getEntry(habit.id, '2026-09-04'))?.value).toBe(25);
  });
});
