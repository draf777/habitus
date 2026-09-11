import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';

import { NotesStorageService } from '../../core/services/notes-storage.service';
import { Note } from '../../models/note.model';
import { NoteEditorComponent } from '../../shared/components/note-editor/note-editor.component';
import { NoteItemComponent } from '../../shared/components/note-item/note-item.component';

/** What the note sheet is currently showing: a new draft, an existing note, or nothing (closed). */
type NoteModalMode = 'new' | Note | null;

/** Most recently changed first. */
function byUpdatedAtDesc(a: Note, b: Note): number {
  return b.updatedAt.localeCompare(a.updatedAt);
}

/**
 * "Notizen" — freely-worded notes, backed by `NotesStorageService`. Viewing,
 * creating and editing a note happens in a sheet modal (`NoteEditorComponent`)
 * opened over this list, not on a separate page — so unlike the other tabs'
 * modals (e.g. the habit form), it only covers part of the screen and the
 * list stays reachable underneath.
 *
 * Since the sheet lives entirely within this page (no navigating away from
 * it), a plain `didDismiss` reload is all that's needed to pick up
 * creates/edits/deletes — no reliance on Ionic's per-tab page lifecycle.
 * Saving is always explicit (`NoteEditorComponent`'s "Speichern"), so however
 * the sheet ends up closing — "Fertig"/"Abbrechen", swipe down, backdrop tap
 * — there is nothing this page needs to flush first.
 */
@Component({
  selector: 'app-notes',
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonModal,
    NoteItemComponent,
    NoteEditorComponent,
  ],
})
export class NotesPage implements ViewWillEnter {
  private readonly storage = inject(NotesStorageService);
  private readonly alertCtrl = inject(AlertController);

  /** Whether the very first load is still in flight — see `TodayPage.loading` for why. */
  readonly loading = signal(true);

  /** All stored notes. */
  private readonly notes = signal<readonly Note[]>([]);

  /** Notes sorted by last change, most recent first. */
  readonly sortedNotes = computed(() => [...this.notes()].sort(byUpdatedAtDesc));

  /** Whether the note sheet is open, and for what. */
  readonly noteModalMode = signal<NoteModalMode>(null);

  /** The note passed to the sheet when viewing/editing, or `undefined` when creating. */
  readonly editingNote = computed(() => {
    const mode = this.noteModalMode();
    return mode && mode !== 'new' ? mode : undefined;
  });

  constructor() {
    addIcons({ addOutline });
    void this.reload();
  }

  /** Reloads whenever this (cached) page becomes active again, e.g. after a tab switch. */
  ionViewWillEnter(): void {
    void this.reload();
  }

  createNote(): void {
    this.noteModalMode.set('new');
  }

  openNote(note: Note): void {
    this.noteModalMode.set(note);
  }

  /** Fires for every way the sheet can close (Fertig/Abbrechen, swipe down, delete, backdrop tap) — always reloads. */
  onNoteModalDismissed(): void {
    this.noteModalMode.set(null);
    void this.reload();
  }

  /** Asks for confirmation, then deletes the note if the user confirms. */
  async confirmDelete(note: Note): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Notiz löschen?',
      message: `„${note.title}“ wird endgültig gelöscht.`,
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        { text: 'Löschen', role: 'destructive' },
      ],
    });
    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'destructive') {
      await this.storage.deleteNote(note.id);
      await this.reload();
    }
  }

  private async reload(): Promise<void> {
    this.notes.set(await this.storage.getNotes());
    this.loading.set(false);
  }
}
