import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { AsyncWriteQueue } from '../async-write-queue.util';
import { Note } from '../../models/note.model';

const NOTES_KEY = 'notes';

/**
 * Persists notes via Ionic Storage, as a single array under one key — see
 * `HabitStorageService` for why that's enough for this app's data size, and
 * `AsyncWriteQueue` for why every mutating method runs through `writeQueue`.
 */
@Injectable({ providedIn: 'root' })
export class NotesStorageService {
  private readonly storage = inject(Storage);
  private readonly writeQueue = new AsyncWriteQueue();
  private ready: Promise<unknown> | null = null;

  private ensureReady(): Promise<unknown> {
    if (!this.ready) {
      this.ready = this.storage.create();
    }
    return this.ready;
  }

  /** All stored notes, in the order they were created. */
  async getNotes(): Promise<Note[]> {
    await this.ensureReady();
    const notes = (await this.storage.get(NOTES_KEY)) as Note[] | null;
    return notes ?? [];
  }

  /** One stored note by id, if it exists. */
  async getNote(id: string): Promise<Note | undefined> {
    const notes = await this.getNotes();
    return notes.find((note) => note.id === id);
  }

  /** Creates a new note and persists it. */
  async addNote(input: { title: string; content: string }): Promise<Note> {
    await this.ensureReady();
    return this.writeQueue.run(async () => {
      const now = new Date().toISOString();
      const note: Note = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      const notes = await this.getNotes();
      await this.storage.set(NOTES_KEY, [...notes, note]);
      return note;
    });
  }

  /** Updates a note's title and/or content, refreshing `updatedAt`. */
  async updateNote(id: string, changes: Partial<Pick<Note, 'title' | 'content'>>): Promise<Note> {
    await this.ensureReady();
    return this.writeQueue.run(async () => {
      const notes = await this.getNotes();
      const index = notes.findIndex((note) => note.id === id);
      if (index === -1) {
        throw new Error(`Note ${id} does not exist`);
      }

      const updated: Note = { ...notes[index], ...changes, updatedAt: new Date().toISOString() };
      const next = [...notes];
      next[index] = updated;
      await this.storage.set(NOTES_KEY, next);
      return updated;
    });
  }

  /** Removes a note. */
  async deleteNote(id: string): Promise<void> {
    await this.ensureReady();
    return this.writeQueue.run(async () => {
      const notes = await this.getNotes();
      await this.storage.set(
        NOTES_KEY,
        notes.filter((note) => note.id !== id),
      );
    });
  }
}
