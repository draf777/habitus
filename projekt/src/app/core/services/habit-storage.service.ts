import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore';

import { AuthService } from './auth.service';
import { Habit, HabitEntry } from '../../models/habit.model';

/**
 * Persists habits and their daily entries in Firestore, under
 * `users/{uid}/habits` and `users/{uid}/entries` for the signed-in user —
 * scoped by path, not a `userId` field, so `firestore.rules` can enforce
 * per-user isolation on the path alone. Offline persistence (IndexedDB) is
 * configured once in `main.ts`, so these calls keep working offline and sync
 * once reconnected.
 *
 * Each habit/entry is its own document, so — unlike the old Ionic-Storage
 * version of this service — mutations don't need to serialize against a
 * shared "read the whole array, write it back" step; Firestore's per-document
 * writes are already atomic.
 */
@Injectable({ providedIn: 'root' })
export class HabitStorageService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);

  private requireUid(): string {
    const uid = this.authService.currentUser()?.uid;
    if (!uid) {
      throw new Error('HabitStorageService used while signed out');
    }
    return uid;
  }

  private habitsPath(): string {
    return `users/${this.requireUid()}/habits`;
  }

  private entriesPath(): string {
    return `users/${this.requireUid()}/entries`;
  }

  private entryPath(habitId: string, date: string): string {
    return `${this.entriesPath()}/${habitId}_${date}`;
  }

  /** All stored habits, in the order they were created. */
  async getHabits(): Promise<Habit[]> {
    const snapshot = await getDocs(query(collection(this.firestore, this.habitsPath()), orderBy('createdAt')));
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Habit);
  }

  /** Creates a new habit and persists it. */
  async addHabit(input: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
    const data = { ...input, createdAt: new Date().toISOString() };
    const ref = doc(collection(this.firestore, this.habitsPath()));
    await setDoc(ref, data);
    return { id: ref.id, ...data };
  }

  /**
   * Replaces an existing habit's fields, keeping only its `id` and
   * `createdAt`. `changes` is the habit's complete new definition (not a
   * partial patch) — e.g. a field left out because the new `type` doesn't
   * use it (like `weeklyGoal` after switching off a weekly frequency) is
   * dropped, not left behind as stale data from the old definition.
   */
  async updateHabit(id: string, changes: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
    const ref = doc(this.firestore, `${this.habitsPath()}/${id}`);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      throw new Error(`Habit ${id} does not exist`);
    }

    const createdAt = (snapshot.data() as Habit).createdAt;
    const data = { ...changes, createdAt };
    await setDoc(ref, data);
    return { id, ...data };
  }

  /** Removes a habit together with all of its recorded entries. */
  async deleteHabit(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `${this.habitsPath()}/${id}`));

    const entriesSnapshot = await getDocs(query(collection(this.firestore, this.entriesPath()), where('habitId', '==', id)));
    await Promise.all(entriesSnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)));
  }

  /** The entry for a habit on a given day, if one was recorded. */
  async getEntry(habitId: string, date: string): Promise<HabitEntry | undefined> {
    const snapshot = await getDoc(doc(this.firestore, this.entryPath(habitId, date)));
    return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as HabitEntry) : undefined;
  }

  /**
   * Records (or overwrites) the value for a habit on a given day. Uses a
   * deterministic document id (`{habitId}_{date}`) instead of looking up an
   * existing entry before writing — a plain upsert, which avoids the race
   * two concurrent calls for the same habit/day would otherwise have.
   */
  async setEntry(habitId: string, date: string, value: number): Promise<HabitEntry> {
    const ref = doc(this.firestore, this.entryPath(habitId, date));
    await setDoc(ref, { habitId, date, value });
    return { id: ref.id, habitId, date, value };
  }

  /** All recorded entries for one habit, across every day. */
  async getEntriesForHabit(habitId: string): Promise<HabitEntry[]> {
    const snapshot = await getDocs(query(collection(this.firestore, this.entriesPath()), where('habitId', '==', habitId)));
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as HabitEntry);
  }
}
