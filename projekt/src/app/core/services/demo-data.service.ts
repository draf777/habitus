import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { lastDays, today } from '../date.util';
import { HabitStorageService } from './habit-storage.service';
import { TodoStorageService } from './todo-storage.service';

const SEEDED_KEY = 'demoDataSeeded';
const TRACKED_IDS_KEY = 'demoDataIds';

/** Ids of the habits/todos `seedIfNeeded` created, so `clearDemoData` can tell them apart from the user's own data. */
interface DemoDataIds {
  readonly habitIds: readonly string[];
  readonly todoIds: readonly string[];
}

const EMPTY_IDS: DemoDataIds = { habitIds: [], todoIds: [] };

/**
 * Seeds a first-time install with two example habits (a week of history
 * already filled in, so "Statistik" isn't empty) and two example todos, so
 * the app doesn't start out completely blank.
 *
 * Seeding runs at most once, ever — tracked via a persisted flag rather than
 * by checking whether habits/todos exist, so deleting everything by hand
 * doesn't bring the demo data back. The seeded ids are tracked separately so
 * `clearDemoData` removes exactly those (whether or not the user has since
 * edited them) without ever touching anything the user added themselves.
 */
@Injectable({ providedIn: 'root' })
export class DemoDataService {
  private readonly storage = inject(Storage);
  private readonly habitStorage = inject(HabitStorageService);
  private readonly todoStorage = inject(TodoStorageService);
  private ready: Promise<unknown> | null = null;

  private ensureReady(): Promise<unknown> {
    if (!this.ready) {
      this.ready = this.storage.create();
    }
    return this.ready;
  }

  /** Creates the demo habits/entries/todos, but only the very first time the app runs. */
  async seedIfNeeded(): Promise<void> {
    await this.ensureReady();
    const alreadySeeded = (await this.storage.get(SEEDED_KEY)) as boolean | null;
    if (alreadySeeded) {
      return;
    }
    await this.storage.set(SEEDED_KEY, true);

    const meditation = await this.habitStorage.addHabit({
      name: 'Meditieren',
      type: 'boolean',
      icon: 'leaf-outline',
    });
    const reading = await this.habitStorage.addHabit({
      name: 'Lesen',
      type: 'duration_min',
      goal: 20,
      icon: 'book-outline',
    });

    // Last 7 days, oldest first; index 6 is today. Both habits are already
    // done today, with a 3-day streak leading up to it, a gap before that
    // (so the chart shows a realistic miss, not a perfect week), and one more
    // done day near the start of the week — so "Statistik" has a live streak
    // to show right away instead of starting at 0.
    const dates = lastDays(new Date(), 7);
    for (const i of [0, 4, 5, 6]) {
      await this.habitStorage.setEntry(meditation.id, dates[i], 1);
    }
    const readingEntries: ReadonlyArray<readonly [number, number]> = [
      [0, 25],
      [1, 10],
      [3, 15],
      [4, 20],
      [5, 25],
      [6, 30],
    ];
    for (const [i, value] of readingEntries) {
      await this.habitStorage.setEntry(reading.id, dates[i], value);
    }

    const date = today();
    const shopping = await this.todoStorage.addTodo({ text: 'Einkaufsliste schreiben', date });
    const mails = await this.todoStorage.addTodo({ text: 'Mails beantworten', date });

    await this.storage.set(TRACKED_IDS_KEY, {
      habitIds: [meditation.id, reading.id],
      todoIds: [shopping.id, mails.id],
    } satisfies DemoDataIds);
  }

  /** Whether any of the seeded demo habits/todos still exist. */
  async hasDemoData(): Promise<boolean> {
    const ids = await this.trackedIds();
    return ids.habitIds.length > 0 || ids.todoIds.length > 0;
  }

  /** Deletes exactly the seeded demo habits (with their entries) and todos; never touches anything else. */
  async clearDemoData(): Promise<void> {
    const ids = await this.trackedIds();
    for (const habitId of ids.habitIds) {
      await this.habitStorage.deleteHabit(habitId);
    }
    for (const todoId of ids.todoIds) {
      await this.todoStorage.deleteTodo(todoId);
    }
    await this.storage.set(TRACKED_IDS_KEY, EMPTY_IDS);
  }

  private async trackedIds(): Promise<DemoDataIds> {
    await this.ensureReady();
    const ids = (await this.storage.get(TRACKED_IDS_KEY)) as DemoDataIds | null;
    return ids ?? EMPTY_IDS;
  }
}
