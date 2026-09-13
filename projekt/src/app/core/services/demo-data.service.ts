import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { lastDays, today } from '../date.util';
import { HabitStorageService } from './habit-storage.service';
import { NotesStorageService } from './notes-storage.service';
import { TodoStorageService } from './todo-storage.service';
import { Habit, HabitEntry } from '../../models/habit.model';
import { Note } from '../../models/note.model';
import { Todo } from '../../models/todo.model';

const SEEDED_KEY = 'demoDataSeeded';
const TRACKED_IDS_KEY = 'demoDataIds';
const HABITS_KEY = 'habits';
const ENTRIES_KEY = 'entries';
const TODOS_KEY = 'todos';
const NOTES_KEY = 'notes';

/** Ids of the habits/todos/notes `seedIfNeeded` created, so `clearDemoData` can tell them apart from the user's own data. */
interface DemoDataIds {
  readonly habitIds: readonly string[];
  readonly todoIds: readonly string[];
  readonly noteIds: readonly string[];
}

const EMPTY_IDS: DemoDataIds = { habitIds: [], todoIds: [], noteIds: [] };

/**
 * Seeds a first-time install with two example habits (a week of history
 * already filled in, so "Statistik" isn't empty), four example todos — two
 * for today, plus one still-open and one done task left over from earlier in
 * the week, so "Todos" shows all three of its sections (Heute, frühere
 * offene Todos, Erledigt) right away instead of starting blank — and one
 * example note that doubles as a quick how-to for its own formatting (list
 * lines, links), so "Notizen" doesn't start on a bare empty state either.
 *
 * Seeding runs at most once, ever — tracked via a persisted flag rather than
 * by checking whether habits/todos/notes exist, so deleting everything by
 * hand doesn't bring the demo data back. The seeded ids are tracked
 * separately so `clearDemoData` removes exactly those (whether or not the
 * user has since edited them) without ever touching anything the user added
 * themselves.
 *
 * `seedIfNeeded` writes directly to the local Ionic Storage keys (`habits`,
 * `entries`, `todos`, `notes`) instead of going through
 * `HabitStorageService`/`TodoStorageService`/`NotesStorageService`: it runs
 * from `AppComponent`'s constructor, before any login is possible, but those
 * services are now Firestore-backed and require a signed-in user. The demo
 * data reaches the user's account like any other pre-existing local data
 * would — via `MigrationService`, on first login/registration. `clearDemoData`
 * runs after login (only reachable from the About page, behind the auth
 * guard), so it still goes through the real services against Firestore.
 */
@Injectable({ providedIn: 'root' })
export class DemoDataService {
  private readonly storage = inject(Storage);
  private readonly habitStorage = inject(HabitStorageService);
  private readonly todoStorage = inject(TodoStorageService);
  private readonly notesStorage = inject(NotesStorageService);
  private ready: Promise<unknown> | null = null;

  private ensureReady(): Promise<unknown> {
    if (!this.ready) {
      this.ready = this.storage.create();
    }
    return this.ready;
  }

  /** Creates the demo habits/entries/todos/note, but only the very first time the app runs. */
  async seedIfNeeded(): Promise<void> {
    await this.ensureReady();
    const alreadySeeded = (await this.storage.get(SEEDED_KEY)) as boolean | null;
    if (alreadySeeded) {
      return;
    }
    await this.storage.set(SEEDED_KEY, true);

    const meditation = await this.appendLocal<Habit>(HABITS_KEY, {
      id: crypto.randomUUID(),
      name: 'Meditieren',
      type: 'boolean',
      icon: 'leaf-outline',
      createdAt: new Date().toISOString(),
    });
    const reading = await this.appendLocal<Habit>(HABITS_KEY, {
      id: crypto.randomUUID(),
      name: 'Lesen',
      type: 'duration_min',
      goal: 20,
      icon: 'book-outline',
      createdAt: new Date().toISOString(),
    });

    // Last 7 days, oldest first; index 6 is today. Both habits are already
    // done today, with a 3-day streak leading up to it, a gap before that
    // (so the chart shows a realistic miss, not a perfect week), and one more
    // done day near the start of the week — so "Statistik" has a live streak
    // to show right away instead of starting at 0.
    const dates = lastDays(new Date(), 7);
    for (const i of [0, 4, 5, 6]) {
      await this.appendLocal<HabitEntry>(ENTRIES_KEY, { id: crypto.randomUUID(), habitId: meditation.id, date: dates[i], value: 1 });
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
      await this.appendLocal<HabitEntry>(ENTRIES_KEY, { id: crypto.randomUUID(), habitId: reading.id, date: dates[i], value });
    }

    const date = today();
    const shopping = await this.appendLocal<Todo>(TODOS_KEY, {
      id: crypto.randomUUID(),
      text: 'Einkaufsliste schreiben',
      date,
      done: false,
      createdAt: new Date().toISOString(),
      order: Date.now(),
    });
    const mails = await this.appendLocal<Todo>(TODOS_KEY, {
      id: crypto.randomUUID(),
      text: 'Mails beantworten',
      date,
      done: false,
      createdAt: new Date().toISOString(),
      order: Date.now(),
    });

    // Left over from earlier in the week: one still open, one already done —
    // so "Frühere, noch offene Todos" and "Erledigt" aren't empty either.
    const taxes = await this.appendLocal<Todo>(TODOS_KEY, {
      id: crypto.randomUUID(),
      text: 'Steuererklärung einreichen',
      date: dates[1],
      done: false,
      createdAt: new Date().toISOString(),
      order: Date.now(),
    });
    const bill = await this.appendLocal<Todo>(TODOS_KEY, {
      id: crypto.randomUUID(),
      text: 'Stromrechnung bezahlt',
      date: dates[3],
      done: true,
      createdAt: new Date().toISOString(),
      order: Date.now(),
    });

    const noteNow = new Date().toISOString();
    const note = await this.appendLocal<Note>(NOTES_KEY, {
      id: crypto.randomUUID(),
      title: 'Beispielnotiz',
      content:
        'Das ist eine Beispielnotiz — du kannst sie bearbeiten oder löschen.\n\n' +
        'Zeilen, die mit „- “ beginnen, werden beim Anzeigen als Liste dargestellt:\n' +
        '- Milch\n' +
        '- Brot\n\n' +
        'Links werden automatisch erkannt: https://ionicframework.com',
      createdAt: noteNow,
      updatedAt: noteNow,
    });

    await this.storage.set(TRACKED_IDS_KEY, {
      habitIds: [meditation.id, reading.id],
      todoIds: [shopping.id, mails.id, taxes.id, bill.id],
      noteIds: [note.id],
    } satisfies DemoDataIds);
  }

  /** Appends `item` to the local Ionic Storage array under `key` and returns it, for use before any login exists. */
  private async appendLocal<T>(key: string, item: T): Promise<T> {
    const items = ((await this.storage.get(key)) as T[] | null) ?? [];
    await this.storage.set(key, [...items, item]);
    return item;
  }

  /** Whether any of the seeded demo habits/todos/notes still exist. */
  async hasDemoData(): Promise<boolean> {
    const ids = await this.trackedIds();
    return ids.habitIds.length > 0 || ids.todoIds.length > 0 || ids.noteIds.length > 0;
  }

  /** Deletes exactly the seeded demo habits (with their entries), todos and note; never touches anything else. */
  async clearDemoData(): Promise<void> {
    const ids = await this.trackedIds();
    for (const habitId of ids.habitIds) {
      await this.habitStorage.deleteHabit(habitId);
    }
    for (const todoId of ids.todoIds) {
      await this.todoStorage.deleteTodo(todoId);
    }
    for (const noteId of ids.noteIds) {
      await this.notesStorage.deleteNote(noteId);
    }
    await this.storage.set(TRACKED_IDS_KEY, EMPTY_IDS);
  }

  private async trackedIds(): Promise<DemoDataIds> {
    await this.ensureReady();
    const ids = (await this.storage.get(TRACKED_IDS_KEY)) as DemoDataIds | null;
    return ids ?? EMPTY_IDS;
  }
}
