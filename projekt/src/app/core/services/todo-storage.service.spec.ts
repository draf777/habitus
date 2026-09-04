import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';

import { TodoStorageService } from './todo-storage.service';

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

describe('TodoStorageService', () => {
  let service: TodoStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TodoStorageService, { provide: Storage, useClass: FakeStorage }],
    });
    service = TestBed.inject(TodoStorageService);
  });

  it('starts with no todos', async () => {
    expect(await service.getTodos()).toEqual([]);
  });

  it('adds a todo and assigns it an id, createdAt and done: false', async () => {
    const todo = await service.addTodo({ text: 'Einkaufen', date: '2026-09-04' });

    expect(todo.id).toBeTruthy();
    expect(todo.createdAt).toBeTruthy();
    expect(todo.done).toBe(false);
    expect(await service.getTodos()).toEqual([todo]);
  });

  it('keeps previously added todos when adding another one', async () => {
    const first = await service.addTodo({ text: 'Einkaufen', date: '2026-09-04' });
    const second = await service.addTodo({ text: 'Mails beantworten', date: '2026-09-04' });

    expect(await service.getTodos()).toEqual([first, second]);
  });

  it('marks a todo done and open again', async () => {
    const todo = await service.addTodo({ text: 'Einkaufen', date: '2026-09-04' });

    const done = await service.setDone(todo.id, true);
    expect(done.done).toBe(true);
    expect(await service.getTodos()).toEqual([done]);

    const open = await service.setDone(todo.id, false);
    expect(open.done).toBe(false);
  });

  it('rejects marking a todo done that does not exist', async () => {
    await expect(service.setDone('missing', true)).rejects.toThrow();
  });

  it('deletes a todo', async () => {
    const todo = await service.addTodo({ text: 'Einkaufen', date: '2026-09-04' });

    await service.deleteTodo(todo.id);

    expect(await service.getTodos()).toEqual([]);
  });

  it('returns only the todos for a given date', async () => {
    const today = await service.addTodo({ text: 'Einkaufen', date: '2026-09-04' });
    await service.addTodo({ text: 'Steuererklärung', date: '2026-09-10' });

    expect(await service.getTodosForDate('2026-09-04')).toEqual([today]);
  });

  it('groups all todos by date', async () => {
    const first = await service.addTodo({ text: 'Einkaufen', date: '2026-09-04' });
    const second = await service.addTodo({ text: 'Mails beantworten', date: '2026-09-04' });
    const third = await service.addTodo({ text: 'Steuererklärung', date: '2026-09-10' });

    const grouped = await service.getTodosGroupedByDate();

    expect(grouped.get('2026-09-04')).toEqual([first, second]);
    expect(grouped.get('2026-09-10')).toEqual([third]);
  });
});
