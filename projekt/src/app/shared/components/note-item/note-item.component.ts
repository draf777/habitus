import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  Platform,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { map } from 'rxjs';

import { formatIsoDate } from '../../../core/date.util';
import { Note } from '../../../models/note.model';

/**
 * One note as a row in the "Notizen" overview: title, last-changed date and
 * the first line of its content as a preview. Tapping the row opens it;
 * deleting is used far less often, so — mirroring `TodoItemComponent` — it
 * stays out of the row's fixed layout: a swipe action on touch viewports, an
 * always-visible button on desktop.
 */
@Component({
  selector: 'app-note-item',
  templateUrl: './note-item.component.html',
  styleUrls: ['./note-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonLabel, IonButton],
})
export class NoteItemComponent {
  private readonly platform = inject(Platform);

  /** The note to display. */
  readonly note = input.required<Note>();

  /** Emitted when the user taps this row to open the note. */
  @Output() readonly open = new EventEmitter<void>();
  /** Emitted when the user requests this note be deleted. */
  @Output() readonly remove = new EventEmitter<void>();

  /** Whether to show a swipe-revealed delete action (mobile-width viewport) instead of a button. */
  readonly isMobile = toSignal(this.platform.resize.pipe(map(() => this.platform.is('mobile'))), {
    initialValue: this.platform.is('mobile'),
  });

  /** The note's last-changed date, human-readable. */
  readonly updatedAtLabel = computed(() => formatIsoDate(this.note().updatedAt));

  /** The first line of the content, as a short preview. */
  readonly preview = computed(() => this.note().content.split('\n')[0]?.trim() ?? '');

  constructor() {
    addIcons({ trashOutline });
  }

  /** From the swipe-revealed "Löschen" action. */
  onSwipeRemove(sliding: IonItemSliding): void {
    void sliding.close();
    this.remove.emit();
  }
}
