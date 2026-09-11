import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';

import { NotesStorageService } from './notes-storage.service';

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

describe('NotesStorageService', () => {
  let service: NotesStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotesStorageService, { provide: Storage, useClass: FakeStorage }],
    });
    service = TestBed.inject(NotesStorageService);
  });

  it('starts with no notes', async () => {
    expect(await service.getNotes()).toEqual([]);
  });

  it('adds a note and assigns it an id, createdAt and updatedAt', async () => {
    const note = await service.addNote({ title: 'Einkaufsliste', content: '- Milch\n- Brot' });

    expect(note.id).toBeTruthy();
    expect(note.createdAt).toBeTruthy();
    expect(note.updatedAt).toBe(note.createdAt);
    expect(await service.getNotes()).toEqual([note]);
  });

  it('keeps previously added notes when adding another one', async () => {
    const first = await service.addNote({ title: 'Erste', content: 'a' });
    const second = await service.addNote({ title: 'Zweite', content: 'b' });

    expect(await service.getNotes()).toEqual([first, second]);
  });

  it('reads back a single note by id', async () => {
    const note = await service.addNote({ title: 'Notiz', content: 'Inhalt' });

    expect(await service.getNote(note.id)).toEqual(note);
  });

  it('returns undefined for a note that does not exist', async () => {
    expect(await service.getNote('missing')).toBeUndefined();
  });

  it('updates a note and refreshes updatedAt without changing createdAt', async () => {
    const note = await service.addNote({ title: 'Alt', content: 'Alter Inhalt' });

    const updated = await service.updateNote(note.id, { title: 'Neu', content: 'Neuer Inhalt' });

    expect(updated.title).toBe('Neu');
    expect(updated.content).toBe('Neuer Inhalt');
    expect(updated.createdAt).toBe(note.createdAt);
    expect(await service.getNotes()).toEqual([updated]);
  });

  it('updates only the given fields, leaving the rest untouched', async () => {
    const note = await service.addNote({ title: 'Titel', content: 'Inhalt' });

    const updated = await service.updateNote(note.id, { content: 'Neuer Inhalt' });

    expect(updated.title).toBe('Titel');
    expect(updated.content).toBe('Neuer Inhalt');
  });

  it('rejects updating a note that does not exist', async () => {
    await expect(service.updateNote('missing', { title: 'x' })).rejects.toThrow();
  });

  it('deletes a note', async () => {
    const note = await service.addNote({ title: 'Löschen', content: 'weg' });

    await service.deleteNote(note.id);

    expect(await service.getNotes()).toEqual([]);
  });

  it('keeps every add when several notes are added concurrently', async () => {
    // Weder awaited noch nacheinander — sonst würde der zweite Aufruf mit
    // einer veralteten Kopie der Liste schreiben und den ersten überschreiben.
    const [first, second, third] = await Promise.all([
      service.addNote({ title: 'A', content: '1' }),
      service.addNote({ title: 'B', content: '2' }),
      service.addNote({ title: 'C', content: '3' }),
    ]);

    const notes = await service.getNotes();
    expect(notes.map((note) => note.id).sort()).toEqual([first.id, second.id, third.id].sort());
  });
});
