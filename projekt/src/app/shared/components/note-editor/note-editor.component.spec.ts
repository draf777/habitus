import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertController } from '@ionic/angular';

import { NoteEditorComponent } from './note-editor.component';
import { NotesStorageService } from '../../../core/services/notes-storage.service';
import { Note } from '../../../models/note.model';

describe('NoteEditorComponent', () => {
  let fixture: ComponentFixture<NoteEditorComponent>;
  let storage: {
    addNote: ReturnType<typeof vi.fn>;
    updateNote: ReturnType<typeof vi.fn>;
    deleteNote: ReturnType<typeof vi.fn>;
  };
  let alertCreate: ReturnType<typeof vi.fn>;
  let alertDismiss: ReturnType<typeof vi.fn>;

  const existingNote: Note = {
    id: 'n1',
    title: 'Bestehend',
    content: 'Inhalt',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-05T00:00:00.000Z',
  };

  function setup(note: Note | undefined): void {
    storage = {
      addNote: vi.fn(),
      updateNote: vi.fn(),
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

    fixture = TestBed.createComponent(NoteEditorComponent);
    fixture.componentRef.setInput('note', note);
    fixture.detectChanges();
  }

  describe('creating a new note', () => {
    beforeEach(() => setup(undefined));

    it('starts in edit mode with empty fields', () => {
      expect(fixture.componentInstance.isNew()).toBe(true);
      expect(fixture.componentInstance.mode()).toBe('edit');
      expect(fixture.componentInstance.title()).toBe('');
      expect(fixture.componentInstance.content()).toBe('');
    });

    it('disables saving while the title is blank', () => {
      expect(fixture.componentInstance.canSave()).toBe(false);
      fixture.componentInstance.title.set('   ');
      expect(fixture.componentInstance.canSave()).toBe(false);
      fixture.componentInstance.title.set('Titel');
      expect(fixture.componentInstance.canSave()).toBe(true);
    });

    it('creates the note on save and switches to view mode', async () => {
      storage.addNote.mockResolvedValue({ id: 'new-id', title: 'Titel', content: 'Text', updatedAt: 'now' });
      fixture.componentInstance.title.set('Titel');
      fixture.componentInstance.content.set('Text');

      await fixture.componentInstance.onSave();

      expect(storage.addNote).toHaveBeenCalledWith({ title: 'Titel', content: 'Text' });
      expect(fixture.componentInstance.mode()).toBe('view');
      expect(fixture.componentInstance.isNew()).toBe(false);
    });

    it('does not save when the title is blank', async () => {
      await fixture.componentInstance.onSave();

      expect(storage.addNote).not.toHaveBeenCalled();
    });

    it('requests close instead of saving anything when cancelled', async () => {
      const closed = vi.fn();
      fixture.componentInstance.closeRequested.subscribe(closed);
      fixture.componentInstance.title.set('Nie gespeichert');

      fixture.componentInstance.onCancel();

      expect(storage.addNote).not.toHaveBeenCalled();
      expect(closed).toHaveBeenCalled();
    });

    it('does not offer deleting a note that was never saved', () => {
      expect(fixture.nativeElement.querySelector('ion-button[aria-label="Notiz löschen"]')).toBeNull();
    });
  });

  describe('viewing/editing an existing note', () => {
    beforeEach(() => setup(existingNote));

    it('starts in view mode with the note loaded', () => {
      expect(fixture.componentInstance.isNew()).toBe(false);
      expect(fixture.componentInstance.mode()).toBe('view');
      expect(fixture.componentInstance.title()).toBe('Bestehend');
      expect(fixture.componentInstance.content()).toBe('Inhalt');
    });

    it('switches to edit mode via startEditing', () => {
      fixture.componentInstance.startEditing();

      expect(fixture.componentInstance.mode()).toBe('edit');
    });

    it('updates the note on save and switches back to view mode', async () => {
      storage.updateNote.mockResolvedValue({ ...existingNote, title: 'Geändert', updatedAt: 'later' });
      fixture.componentInstance.startEditing();
      fixture.componentInstance.title.set('Geändert');

      await fixture.componentInstance.onSave();

      expect(storage.updateNote).toHaveBeenCalledWith('n1', { title: 'Geändert', content: 'Inhalt' });
      expect(fixture.componentInstance.mode()).toBe('view');
    });

    it('reverts unsaved edits and returns to view mode when cancelled, without saving anything', () => {
      fixture.componentInstance.startEditing();
      fixture.componentInstance.title.set('Verworfen');
      fixture.componentInstance.content.set('Auch verworfen');

      fixture.componentInstance.onCancel();

      expect(fixture.componentInstance.mode()).toBe('view');
      expect(fixture.componentInstance.title()).toBe('Bestehend');
      expect(fixture.componentInstance.content()).toBe('Inhalt');
      expect(storage.updateNote).not.toHaveBeenCalled();
    });

    it('deletes the note after confirmation and requests close', async () => {
      const closed = vi.fn();
      fixture.componentInstance.closeRequested.subscribe(closed);

      await fixture.componentInstance.confirmDelete();

      expect(storage.deleteNote).toHaveBeenCalledWith('n1');
      expect(closed).toHaveBeenCalled();
    });

    it('does not delete when the confirmation is cancelled', async () => {
      alertDismiss.mockResolvedValue({ role: 'cancel' });

      await fixture.componentInstance.confirmDelete();

      expect(storage.deleteNote).not.toHaveBeenCalled();
    });

    it('emits closeRequested from the "Fertig" button', () => {
      const closed = vi.fn();
      fixture.componentInstance.closeRequested.subscribe(closed);

      fixture.nativeElement.querySelector('ion-button').click();

      expect(closed).toHaveBeenCalled();
    });

    it('shows "Abbrechen" (not "Fertig") in edit mode', () => {
      fixture.componentInstance.startEditing();
      fixture.detectChanges();

      const startButton = fixture.nativeElement.querySelector('ion-buttons ion-button');
      expect(startButton.textContent.trim()).toBe('Abbrechen');
    });
  });
});
