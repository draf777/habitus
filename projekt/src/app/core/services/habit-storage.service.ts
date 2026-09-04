import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { Habit, HabitEntry } from '../../models/habit.model';

const HABITS_KEY = 'habits';
const ENTRIES_KEY = 'entries';

/**
 * Persists habits and their daily entries via Ionic Storage.
 *
 * Both are kept as a single array under one key each — the data set of a
 * personal habit tracker is small enough that this stays simple and fast
 * enough, and it avoids a bespoke key scheme per habit/day.
 */
@Injectable({ providedIn: 'root' })
export class HabitStorageService {
  private readonly storage = inject(Storage);
  private ready: Promise<unknown> | null = null;

  private ensureReady(): Promise<unknown> {
    if (!this.ready) {
      this.ready = this.storage.create();
    }
    return this.ready;
  }

  /** All stored habits, in the order they were created. */
  async getHabits(): Promise<Habit[]> {
    await this.ensureReady();
    const habits = (await this.storage.get(HABITS_KEY)) as Habit[] | null;
    return habits ?? [];
  }

  /** Creates a new habit and persists it. */
  async addHabit(input: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
    await this.ensureReady();
    const habit: Habit = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const habits = await this.getHabits();
    await this.storage.set(HABITS_KEY, [...habits, habit]);
    return habit;
  }

  /** Removes a habit together with all of its recorded entries. */
  async deleteHabit(id: string): Promise<void> {
    await this.ensureReady();
    const habits = await this.getHabits();
    await this.storage.set(
      HABITS_KEY,
      habits.filter((habit) => habit.id !== id),
    );

    const entries = await this.getAllEntries();
    await this.storage.set(
      ENTRIES_KEY,
      entries.filter((entry) => entry.habitId !== id),
    );
  }

  /** The entry for a habit on a given day, if one was recorded. */
  async getEntry(habitId: string, date: string): Promise<HabitEntry | undefined> {
    await this.ensureReady();
    const entries = await this.getAllEntries();
    return entries.find((entry) => entry.habitId === habitId && entry.date === date);
  }

  /** Records (or overwrites) the value for a habit on a given day. */
  async setEntry(habitId: string, date: string, value: number): Promise<HabitEntry> {
    await this.ensureReady();
    const entries = await this.getAllEntries();
    const existing = entries.find((entry) => entry.habitId === habitId && entry.date === date);
    const entry: HabitEntry = existing ? { ...existing, value } : { id: crypto.randomUUID(), habitId, date, value };

    const next = existing ? entries.map((e) => (e.id === entry.id ? entry : e)) : [...entries, entry];
    await this.storage.set(ENTRIES_KEY, next);
    return entry;
  }

  private async getAllEntries(): Promise<HabitEntry[]> {
    const entries = (await this.storage.get(ENTRIES_KEY)) as HabitEntry[] | null;
    return entries ?? [];
  }
}
