import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, computed, inject, input, signal } from '@angular/core';
import { AlertController, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { pencilOutline, trashOutline } from 'ionicons/icons';

import { formatIsoDate } from '../../../core/date.util';
import { NotesStorageService } from '../../../core/services/notes-storage.service';
import { Note } from '../../../models/note.model';
import { confirmDeleteNote } from '../../confirm-delete-note.util';
import { NoteContentPipe } from '../../pipes/note-content.pipe';

/** Whether the editor shows the formatted, read-only content or the raw-text editing form. */
type Mode = 'view' | 'edit';

/**
 * View/edit a single note, presented in the sheet modal opened from
 * `NotesPage` (pass an existing `note` to view/edit it, or omit it to create
 * a new one).
 *
 * A note is either viewed (title + formatted content, via `NoteContentPipe`
 * — list lines and links only render here, never while typing) or edited
 * (plain title/content fields). New notes open straight into editing, since
 * there is nothing to view yet.
 *
 * Saving is always explicit, mirroring `NewHabitFormComponent`'s
 * "Abbrechen"/"Speichern" pair: "Speichern" persists and switches back to
 * view mode, "Abbrechen" discards the edits (reverting to the last saved
 * version, or closing the sheet outright for a still-unsaved new note) —
 * nothing is saved implicitly just because the sheet gets closed some other
 * way (swipe down, backdrop tap), so there is no hidden autosave to be
 * surprised by. A blank title is never persisted; "Speichern" simply stays
 * disabled until there is one.
 */
@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Modal content presented outside the router (no `ion-page` from `IonRouterOutlet`
  // in this case) needs the class itself, or `ion-content` collapses to 0 height.
  host: { class: 'ion-page' },
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonItem, IonInput, IonTextarea, NoteContentPipe],
})
export class NoteEditorComponent implements OnInit {
  private readonly storage = inject(NotesStorageService);
  private readonly alertCtrl = inject(AlertController);

  /** The note to view/edit; omit to create a new one. */
  readonly note = input<Note | undefined>(undefined);

  /** Emitted once the sheet should close (Fertig/Abbrechen, or after deleting). */
  @Output() readonly closeRequested = new EventEmitter<void>();

  /** The id of the note being edited, or `null` while it hasn't been saved yet. */
  private readonly noteId = signal<string | null>(null);
  /** Title/content as last saved, so "Abbrechen" can revert to them. */
  private savedTitle = '';
  private savedContent = '';

  readonly isNew = computed(() => this.noteId() === null);
  readonly mode = signal<Mode>('edit');

  readonly title = signal('');
  readonly content = signal('');
  readonly updatedAt = signal<string | null>(null);

  readonly canSave = computed(() => this.title().trim().length > 0);
  readonly updatedAtLabel = computed(() => {
    const updatedAt = this.updatedAt();
    return updatedAt ? formatIsoDate(updatedAt) : '';
  });

  constructor() {
    addIcons({ pencilOutline, trashOutline });
  }

  ngOnInit(): void {
    const note = this.note();
    if (!note) {
      return;
    }

    this.noteId.set(note.id);
    this.title.set(note.title);
    this.content.set(note.content);
    this.updatedAt.set(note.updatedAt);
    this.savedTitle = note.title;
    this.savedContent = note.content;
    this.mode.set('view');
  }

  startEditing(): void {
    this.mode.set('edit');
  }

  /** Discards any unsaved edits: back to view mode for an existing note, or closes the sheet for a new one. */
  onCancel(): void {
    if (this.isNew()) {
      this.closeRequested.emit();
      return;
    }
    this.title.set(this.savedTitle);
    this.content.set(this.savedContent);
    this.mode.set('view');
  }

  /** Persists the current field values and switches back to view mode; a blank title saves nothing. */
  async onSave(): Promise<void> {
    if (!this.canSave()) {
      return;
    }

    const title = this.title().trim();
    const content = this.content();
    const id = this.noteId();
    const note = id ? await this.storage.updateNote(id, { title, content }) : await this.storage.addNote({ title, content });

    this.noteId.set(note.id);
    this.updatedAt.set(note.updatedAt);
    this.savedTitle = title;
    this.savedContent = content;
    this.mode.set('view');
  }

  /** Asks for confirmation, then deletes the note and closes the sheet. */
  async confirmDelete(): Promise<void> {
    const id = this.noteId();
    if (!id || !(await confirmDeleteNote(this.alertCtrl, this.title()))) {
      return;
    }
    await this.storage.deleteNote(id);
    this.closeRequested.emit();
  }
}
