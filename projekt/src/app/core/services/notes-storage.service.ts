import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';

import { AuthService } from './auth.service';
import { Note } from '../../models/note.model';

/**
 * Persists notes in Firestore, under `users/{uid}/notes` for the signed-in
 * user — see `HabitStorageService` for why per-document writes replace the
 * old Ionic-Storage array + write-queue approach.
 */
@Injectable({ providedIn: 'root' })
export class NotesStorageService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);

  private requireUid(): string {
    const uid = this.authService.currentUser()?.uid;
    if (!uid) {
      throw new Error('NotesStorageService used while signed out');
    }
    return uid;
  }

  private notesPath(): string {
    return `users/${this.requireUid()}/notes`;
  }

  /** All stored notes, in the order they were created. */
  async getNotes(): Promise<Note[]> {
    const snapshot = await getDocs(query(collection(this.firestore, this.notesPath()), orderBy('createdAt')));
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Note);
  }

  /** One stored note by id, if it exists. */
  async getNote(id: string): Promise<Note | undefined> {
    const snapshot = await getDoc(doc(this.firestore, `${this.notesPath()}/${id}`));
    return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Note) : undefined;
  }

  /** Creates a new note and persists it. */
  async addNote(input: { title: string; content: string }): Promise<Note> {
    const now = new Date().toISOString();
    const data = { ...input, createdAt: now, updatedAt: now };
    const ref = doc(collection(this.firestore, this.notesPath()));
    await setDoc(ref, data);
    return { id: ref.id, ...data };
  }

  /** Updates a note's title and/or content, refreshing `updatedAt`. */
  async updateNote(id: string, changes: Partial<Pick<Note, 'title' | 'content'>>): Promise<Note> {
    const ref = doc(this.firestore, `${this.notesPath()}/${id}`);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      throw new Error(`Note ${id} does not exist`);
    }

    const updatedAt = new Date().toISOString();
    await setDoc(ref, { ...changes, updatedAt }, { merge: true });
    return { id, ...(snapshot.data() as Omit<Note, 'id'>), ...changes, updatedAt };
  }

  /** Removes a note. */
  async deleteNote(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `${this.notesPath()}/${id}`));
  }
}
