import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage-angular';

import { AuthService } from './auth.service';
import { DemoDataService } from './demo-data.service';
import { HabitStorageService } from './habit-storage.service';
import { NotesStorageService } from './notes-storage.service';
import { TodoStorageService } from './todo-storage.service';
import { today } from '../date.util';
import { Habit, HabitEntry } from '../../models/habit.model';
import { Note } from '../../models/note.model';
import { Todo } from '../../models/todo.model';

const firestoreState = vi.hoisted(() => ({ documents: new Map<string, Record<string, unknown>>() }));

vi.mock('firebase/firestore', async () => {
  const { createFakeFirestoreModule } = await import('./testing/fake-firestore.util');
  return createFakeFirestoreModule(firestoreState.documents);
});

/** In-memory stand-in for Ionic Storage, so tests don't need a real driver. */
class FakeStorage {
  readonly store = new Map<string, unknown>();

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
  let storage: FakeStorage;
  let habitStorage: HabitStorageService;
  let todoStorage: TodoStorageService;
  let notesStorage: NotesStorageService;

  beforeEach(() => {
    firestoreState.documents.clear();
    storage = new FakeStorage();

    TestBed.configureTestingModule({
      providers: [
        DemoDataService,
        HabitStorageService,
        TodoStorageService,
        NotesStorageService,
        { provide: Storage, useValue: storage },
        { provide: Firestore, useValue: {} },
        { provide: AuthService, useValue: { currentUser: () => ({ uid: 'test-uid' }) } },
      ],
    });
    service = TestBed.inject(DemoDataService);
    habitStorage = TestBed.inject(HabitStorageService);
    todoStorage = TestBed.inject(TodoStorageService);
    notesStorage = TestBed.inject(NotesStorageService);
  });

  // `seedIfNeeded` runs before any login exists, so it writes straight to the
  // local Ionic Storage keys instead of through the (now Firestore-backed)
  // storage services — see `DemoDataService`'s doc comment. These helpers
  // read those same local keys back, the way `MigrationService` would.
  function localHabits(): Habit[] {
    return (storage.store.get('habits') as Habit[] | undefined) ?? [];
  }
  function localEntries(): HabitEntry[] {
    return (storage.store.get('entries') as HabitEntry[] | undefined) ?? [];
  }
  function localTodos(): Todo[] {
    return (storage.store.get('todos') as Todo[] | undefined) ?? [];
  }
  function localNotes(): Note[] {
    return (storage.store.get('notes') as Note[] | undefined) ?? [];
  }

  it('seeds two habits, four todos and one note on first run', async () => {
    await service.seedIfNeeded();

    expect(localHabits().length).toBe(2);
    expect(localTodos().length).toBe(4);
    expect(localNotes().length).toBe(1);
    expect(localNotes()[0].title).toBeTruthy();
    expect(localNotes()[0].content).toBeTruthy();
  });

  it('gives todos from all three "Todos" sections: today, still-open from earlier, and done', async () => {
    await service.seedIfNeeded();

    const todos = localTodos();
    const todayStr = today();
    expect(todos.some((todo) => todo.date === todayStr && !todo.done)).toBe(true);
    expect(todos.some((todo) => todo.date < todayStr && !todo.done)).toBe(true);
    expect(todos.some((todo) => todo.date < todayStr && todo.done)).toBe(true);
  });

  it('marks the meditation habit done on 4 of the last 7 days, including today — a realistic streak, not every day', async () => {
    await service.seedIfNeeded();

    const meditation = localHabits().find((habit) => habit.type === 'boolean')!;
    const entries = localEntries().filter((entry) => entry.habitId === meditation.id);

    expect(entries).toHaveLength(4);
    expect(entries.some((entry) => entry.date === today() && entry.value === 1)).toBe(true);
  });

  it('gives the reading habit an entry for today at or above its goal', async () => {
    await service.seedIfNeeded();

    const reading = localHabits().find((habit) => habit.type === 'duration_min')!;
    const entries = localEntries().filter((entry) => entry.habitId === reading.id);
    const todayEntry = entries.find((entry) => entry.date === today());

    expect(todayEntry?.value).toBeGreaterThanOrEqual(reading.goal!);
  });

  it('does not seed a second time once already seeded', async () => {
    await service.seedIfNeeded();
    await service.seedIfNeeded();

    expect(localHabits().length).toBe(2);
    expect(localTodos().length).toBe(4);
    expect(localNotes().length).toBe(1);
  });

  it('does not reseed even if the local data is cleared by hand', async () => {
    await service.seedIfNeeded();
    await storage.set('habits', []);
    await storage.set('entries', []);
    await storage.set('todos', []);
    await storage.set('notes', []);

    await service.seedIfNeeded();

    expect(localHabits()).toEqual([]);
    expect(localTodos()).toEqual([]);
    expect(localNotes()).toEqual([]);
  });

  it('reports no demo data before seeding', async () => {
    expect(await service.hasDemoData()).toBe(false);
  });

  it('reports demo data present after seeding', async () => {
    await service.seedIfNeeded();

    expect(await service.hasDemoData()).toBe(true);
  });

  it("clears exactly the seeded ids, leaving the account's own data untouched", async () => {
    await service.seedIfNeeded();
    const own = await habitStorage.addHabit({ name: 'Eigenes Habit', type: 'boolean' });
    const ownTodo = await todoStorage.addTodo({ text: 'Eigenes Todo', date: '2026-09-10' });
    const ownNote = await notesStorage.addNote({ title: 'Eigene Notiz', content: 'x' });

    await service.clearDemoData();

    expect(await habitStorage.getHabits()).toEqual([own]);
    expect(await todoStorage.getTodos()).toEqual([ownTodo]);
    expect(await notesStorage.getNotes()).toEqual([ownNote]);
    expect(await service.hasDemoData()).toBe(false);
  });

  it('is a no-op to clear demo data when none was ever seeded', async () => {
    await expect(service.clearDemoData()).resolves.toBeUndefined();
    expect(await habitStorage.getHabits()).toEqual([]);
  });
});
