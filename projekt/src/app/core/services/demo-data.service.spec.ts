import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';

import { DemoDataService } from './demo-data.service';
import { HabitStorageService } from './habit-storage.service';
import { StatsService } from './stats.service';
import { TodoStorageService } from './todo-storage.service';
import { today } from '../date.util';

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

describe('DemoDataService', () => {
  let service: DemoDataService;
  let habitStorage: HabitStorageService;
  let todoStorage: TodoStorageService;
  let statsService: StatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DemoDataService,
        HabitStorageService,
        TodoStorageService,
        StatsService,
        { provide: Storage, useClass: FakeStorage },
      ],
    });
    service = TestBed.inject(DemoDataService);
    habitStorage = TestBed.inject(HabitStorageService);
    todoStorage = TestBed.inject(TodoStorageService);
    statsService = TestBed.inject(StatsService);
  });

  it('seeds two habits and four todos on first run', async () => {
    await service.seedIfNeeded();

    const habits = await habitStorage.getHabits();
    const todos = await todoStorage.getTodos();
    expect(habits.length).toBe(2);
    expect(todos.length).toBe(4);
  });

  it('gives todos from all three "Todos" sections: today, still-open from earlier, and done', async () => {
    await service.seedIfNeeded();

    const todos = await todoStorage.getTodos();
    const todayStr = today();
    expect(todos.some((todo) => todo.date === todayStr && !todo.done)).toBe(true);
    expect(todos.some((todo) => todo.date < todayStr && !todo.done)).toBe(true);
    expect(todos.some((todo) => todo.date < todayStr && todo.done)).toBe(true);
  });

  it('marks both seeded habits done today, with a current streak already running', async () => {
    await service.seedIfNeeded();

    const habits = await habitStorage.getHabits();
    const meditation = habits.find((habit) => habit.type === 'boolean')!;
    const reading = habits.find((habit) => habit.type === 'duration_min')!;

    expect((await habitStorage.getEntry(meditation.id, today()))?.value).toBe(1);
    expect((await habitStorage.getEntry(reading.id, today()))?.value).toBeGreaterThanOrEqual(reading.goal!);

    const meditationStats = await statsService.getWeekStats(meditation);
    const readingStats = await statsService.getWeekStats(reading);
    expect(meditationStats.streak).toBeGreaterThan(0);
    expect(readingStats.streak).toBeGreaterThan(0);
  });

  it('gives the seeded boolean habit a realistic week with a gap, not every day done', async () => {
    await service.seedIfNeeded();

    const habits = await habitStorage.getHabits();
    const meditation = habits.find((habit) => habit.type === 'boolean')!;
    const stats = await statsService.getWeekStats(meditation);

    expect(stats.days.some((day) => day.value === 0)).toBe(true);
    expect(stats.days.some((day) => day.value === 1)).toBe(true);
  });

  it('does not seed a second time once already seeded', async () => {
    await service.seedIfNeeded();
    await service.seedIfNeeded();

    expect((await habitStorage.getHabits()).length).toBe(2);
    expect((await todoStorage.getTodos()).length).toBe(4);
  });

  it('does not reseed even if the user deletes everything by hand', async () => {
    await service.seedIfNeeded();
    for (const habit of await habitStorage.getHabits()) {
      await habitStorage.deleteHabit(habit.id);
    }
    for (const todo of await todoStorage.getTodos()) {
      await todoStorage.deleteTodo(todo.id);
    }

    await service.seedIfNeeded();

    expect(await habitStorage.getHabits()).toEqual([]);
    expect(await todoStorage.getTodos()).toEqual([]);
  });

  it('reports no demo data before seeding', async () => {
    expect(await service.hasDemoData()).toBe(false);
  });

  it('reports demo data present after seeding', async () => {
    await service.seedIfNeeded();

    expect(await service.hasDemoData()).toBe(true);
  });

  it('clears exactly the seeded habits and todos, leaving other data untouched', async () => {
    await service.seedIfNeeded();
    const own = await habitStorage.addHabit({ name: 'Eigenes Habit', type: 'boolean' });
    const ownTodo = await todoStorage.addTodo({ text: 'Eigenes Todo', date: '2026-09-10' });

    await service.clearDemoData();

    expect(await habitStorage.getHabits()).toEqual([own]);
    expect(await todoStorage.getTodos()).toEqual([ownTodo]);
    expect(await service.hasDemoData()).toBe(false);
  });

  it('does not affect data added after clearing demo data', async () => {
    await service.seedIfNeeded();
    await service.clearDemoData();

    const own = await habitStorage.addHabit({ name: 'Neues Habit', type: 'boolean' });

    expect(await habitStorage.getHabits()).toEqual([own]);
    expect(await service.hasDemoData()).toBe(false);
  });

  it('is a no-op to clear demo data when none was ever seeded', async () => {
    await expect(service.clearDemoData()).resolves.toBeUndefined();
    expect(await habitStorage.getHabits()).toEqual([]);
  });
});
