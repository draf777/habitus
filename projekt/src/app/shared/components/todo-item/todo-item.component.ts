import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonButton,
  IonCheckbox,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonReorder,
  Platform,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { map } from 'rxjs';

import { Todo } from '../../../models/todo.model';
import { linkify } from '../../linkify.util';

/**
 * One task as a row in the todo list: a checkbox to toggle it done, a
 * delete action, and a drag handle to reorder it.
 *
 * Deleting is used far less often than checking a task off, so — mirroring
 * `HabitItemComponent` — it stays out of the row's fixed layout: a swipe
 * action (`ion-item-sliding`) on touch viewports, an always-visible button
 * on desktop, where swiping isn't discoverable. The reorder handle sits
 * alongside it either way; dragging only starts when the handle itself is
 * grabbed, so it doesn't compete with the swipe gesture.
 */
@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonLabel,
    IonCheckbox,
    IonButton,
    IonReorder,
  ],
})
export class TodoItemComponent {
  private readonly platform = inject(Platform);

  /** The task to display. */
  readonly todo = input.required<Todo>();
  /** Shown as a subtitle under the text, e.g. the task's original date in the "earlier" section. */
  readonly dateLabel = input<string | undefined>(undefined);

  /** Emitted when the user checks or unchecks this task. */
  @Output() readonly toggled = new EventEmitter<void>();
  /** Emitted when the user requests this task be deleted. */
  @Output() readonly remove = new EventEmitter<void>();

  /** Whether to show a swipe-revealed delete action (mobile-width viewport) instead of a button. */
  readonly isMobile = toSignal(this.platform.resize.pipe(map(() => this.platform.is('mobile'))), {
    initialValue: this.platform.is('mobile'),
  });

  /** The task text as safe HTML, with any URLs turned into clickable links. */
  readonly linkedText = computed(() => linkify(this.todo().text));

  constructor() {
    addIcons({ trashOutline });
  }

  /** From the swipe-revealed "Löschen" action. */
  onSwipeRemove(sliding: IonItemSliding): void {
    void sliding.close();
    this.remove.emit();
  }

  /** Toggles the task when its text is clicked, unless the click was on one of the linked URLs. */
  onLabelClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('a')) {
      return;
    }
    this.toggled.emit();
  }
}
