import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertController } from '@ionic/angular';

import { NotesPage } from './notes.page';
import { NotesStorageService } from '../../core/services/notes-storage.service';
import { Note } from '../../models/note.model';

/** Waits for pending microtasks (e.g. the constructor's async reload) to settle. */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('NotesPage', () => {
  let fixture: ComponentFixture<NotesPage>;
  let storage: {
    getNotes: ReturnType<typeof vi.fn>;
    deleteNote: ReturnType<typeof vi.fn>;
  };
  let alertCreate: ReturnType<typeof vi.fn>;
  let alertDismiss: ReturnType<typeof vi.fn>;

  const older: Note = {
    id: 'a',
    title: 'Älter',
    content: 'Erste Zeile a',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  };
  const newer: Note = {
    id: 'b',
    title: 'Neuer',
    content: 'Erste Zeile b',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-10T00:00:00.000Z',
  };
  const allNotes = [older, newer];

  beforeEach(() => {
    storage = {
      getNotes: vi.fn().mockResolvedValue(allNotes),
      deleteNote: vi.fn().mockResolvedValue(undefined),
    };
    alertDismiss = vi.fn().mockResolvedValue({ role: 'destructive' });
    alertCreate = vi.fn().mockResolvedValue({ present: vi.fn().mockResolvedValue(undefined), onDidDismiss: alertDismiss });

    TestBed.configureTestingModule({
      providers: [
        { provide: NotesStorageService, useValue: storage },
        { provide: AlertController, useValue: { create: alertCreate } },
      ],
    });

    fixture = TestBed.createComponent(NotesPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads all notes on creation', async () => {
    await flushPromises();

    expect(storage.getNotes).toHaveBeenCalled();
  });

  it('sorts notes by last change, most recent first', async () => {
    await flushPromises();

    expect(fixture.componentInstance.sortedNotes()).toEqual([newer, older]);
  });

  it('renders a row per note', async () => {
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-note-item').length).toBe(allNotes.length);
  });

  it('shows a hint when there are no notes', async () => {
    storage.getNotes.mockResolvedValue([]);
    fixture = TestBed.createComponent(NotesPage);
    fixture.detectChanges();
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Noch keine Notizen');
  });

  it('opens the sheet in "new" mode', async () => {
    await flushPromises();

    fixture.componentInstance.createNote();

    expect(fixture.componentInstance.noteModalMode()).toBe('new');
    expect(fixture.componentInstance.editingNote()).toBeUndefined();
  });

  it('opens the sheet pre-set to the note being viewed', async () => {
    await flushPromises();

    fixture.componentInstance.openNote(older);

    expect(fixture.componentInstance.editingNote()).toEqual(older);
  });

  it('closes the sheet and reloads once it is dismissed (Fertig, swipe, delete, or backdrop tap)', async () => {
    await flushPromises();
    fixture.componentInstance.openNote(older);
    storage.getNotes.mockResolvedValue([newer]);

    fixture.componentInstance.onNoteModalDismissed();
    await flushPromises();

    expect(fixture.componentInstance.noteModalMode()).toBeNull();
    expect(fixture.componentInstance.sortedNotes()).toEqual([newer]);
  });

  it('deletes a note after confirmation and reloads', async () => {
    await flushPromises();
    storage.getNotes.mockResolvedValue([newer]);

    await fixture.componentInstance.confirmDelete(older);

    expect(storage.deleteNote).toHaveBeenCalledWith('a');
    expect(storage.getNotes).toHaveBeenCalledTimes(2);
  });

  it('does not delete when the confirmation is cancelled', async () => {
    await flushPromises();
    alertDismiss.mockResolvedValue({ role: 'cancel' });

    await fixture.componentInstance.confirmDelete(older);

    expect(storage.deleteNote).not.toHaveBeenCalled();
  });

  it('reloads when the page becomes active again (e.g. after a tab switch)', async () => {
    await flushPromises();
    storage.getNotes.mockResolvedValue([older]);

    fixture.componentInstance.ionViewWillEnter();
    await flushPromises();

    expect(fixture.componentInstance.sortedNotes()).toEqual([older]);
  });
});
