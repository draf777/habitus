import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonCheckbox, IonItem, IonLabel } from '@ionic/angular';

import { Todo } from '../../../core/models/todo.model';

/**
 * One task as a row in the todo list.
 *
 * Purely presentational — toggling is not wired up in v0.1.0.
 */
@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonItem, IonLabel, IonCheckbox],
})
export class TodoItemComponent {
  /** The task to display. */
  readonly todo = input.required<Todo>();
}
