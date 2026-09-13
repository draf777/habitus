import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';

import { AuthService } from './auth.service';
import { Todo } from '../../models/todo.model';

/**
 * Persists todos in Firestore, under `users/{uid}/todos` for the signed-in
 * user — see `HabitStorageService` for why per-document writes replace the
 * old Ionic-Storage array + write-queue approach.
 */
@Injectable({ providedIn: 'root' })
export class TodoStorageService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);

  private requireUid(): string {
    const uid = this.authService.currentUser()?.uid;
    if (!uid) {
      throw new Error('TodoStorageService used while signed out');
    }
    return uid;
  }

  private todosPath(): string {
    return `users/${this.requireUid()}/todos`;
  }

  /** All stored todos, in the order they were created. */
  async getTodos(): Promise<Todo[]> {
    const snapshot = await getDocs(query(collection(this.firestore, this.todosPath()), orderBy('createdAt')));
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Todo);
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
    const data = {
      ...input,
      done: false,
      createdAt: new Date().toISOString(),
      order: Date.now(),
    };
    const ref = doc(collection(this.firestore, this.todosPath()));
    await setDoc(ref, data);
    return { id: ref.id, ...data };
  }

  /**
   * Applies a new drag-and-drop order within one section of the "Todos"
   * list: `orderedIds` is that section's todos in their new order, and each
   * one's `order` is rewritten to match its position. Todos outside that
   * section (a different id) are left untouched, since sections are always
   * sorted independently of each other.
   */
  async reorderTodos(orderedIds: readonly string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) => setDoc(doc(this.firestore, `${this.todosPath()}/${id}`), { order: index }, { merge: true })),
    );
  }

  /** Marks a todo done or open again. */
  async setDone(id: string, done: boolean): Promise<Todo> {
    return this.updateTodo(id, { done });
  }

  /** Moves a todo to a different day, e.g. rescheduling a still-open earlier task to today. */
  async setDate(id: string, date: string): Promise<Todo> {
    return this.updateTodo(id, { date });
  }

  /** Removes a todo. */
  async deleteTodo(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `${this.todosPath()}/${id}`));
  }

  private async updateTodo(id: string, changes: Partial<Pick<Todo, 'done' | 'date'>>): Promise<Todo> {
    const ref = doc(this.firestore, `${this.todosPath()}/${id}`);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      throw new Error(`Todo ${id} does not exist`);
    }

    await setDoc(ref, changes, { merge: true });
    return { id, ...(snapshot.data() as Omit<Todo, 'id'>), ...changes };
  }
}
