import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { Todo } from '../../models/todo.model';

const TODOS_KEY = 'todos';

/**
 * Persists todos via Ionic Storage, as a single array under one key — see
 * `HabitStorageService` for why that's enough for this app's data size.
 */
@Injectable({ providedIn: 'root' })
export class TodoStorageService {
  private readonly storage = inject(Storage);
  private ready: Promise<unknown> | null = null;

  private ensureReady(): Promise<unknown> {
    if (!this.ready) {
      this.ready = this.storage.create();
    }
    return this.ready;
  }

  /** All stored todos, in the order they were created. */
  async getTodos(): Promise<Todo[]> {
    await this.ensureReady();
    const todos = (await this.storage.get(TODOS_KEY)) as Todo[] | null;
    return todos ?? [];
  }

  /** The stored todos for one day. */
  async getTodosForDate(date: string): Promise<Todo[]> {
    const todos = await this.getTodos();
    return todos.filter((todo) => todo.date === date);
  }

  /** All stored todos grouped by their `date`. */
  async getTodosGroupedByDate(): Promise<ReadonlyMap<string, Todo[]>> {
    const todos = await this.getTodos();
    const groups = new Map<string, Todo[]>();
    for (const todo of todos) {
      const group = groups.get(todo.date);
      if (group) {
        group.push(todo);
      } else {
        groups.set(todo.date, [todo]);
      }
    }
    return groups;
  }

  /** Creates a new todo and persists it. */
  async addTodo(input: { text: string; date: string }): Promise<Todo> {
    await this.ensureReady();
    const todo: Todo = {
      ...input,
      id: crypto.randomUUID(),
      done: false,
      createdAt: new Date().toISOString(),
      order: Date.now(),
    };
    const todos = await this.getTodos();
    await this.storage.set(TODOS_KEY, [...todos, todo]);
    return todo;
  }

  /**
   * Applies a new drag-and-drop order within one section of the "Todos"
   * list: `orderedIds` is that section's todos in their new order, and each
   * one's `order` is rewritten to match its position. Todos outside that
   * section (a different id) are left untouched, since sections are always
   * sorted independently of each other.
   */
  async reorderTodos(orderedIds: readonly string[]): Promise<void> {
    await this.ensureReady();
    const positionById = new Map(orderedIds.map((id, index) => [id, index] as const));
    const todos = await this.getTodos();
    const next = todos.map((todo) => {
      const order = positionById.get(todo.id);
      return order == null ? todo : { ...todo, order };
    });
    await this.storage.set(TODOS_KEY, next);
  }

  /** Marks a todo done or open again. */
  async setDone(id: string, done: boolean): Promise<Todo> {
    await this.ensureReady();
    const todos = await this.getTodos();
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) {
      throw new Error(`Todo ${id} does not exist`);
    }

    const updated: Todo = { ...todos[index], done };
    const next = [...todos];
    next[index] = updated;
    await this.storage.set(TODOS_KEY, next);
    return updated;
  }

  /** Removes a todo. */
  async deleteTodo(id: string): Promise<void> {
    await this.ensureReady();
    const todos = await this.getTodos();
    await this.storage.set(
      TODOS_KEY,
      todos.filter((todo) => todo.id !== id),
    );
  }
}
