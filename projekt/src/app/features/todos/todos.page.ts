import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonList,
  IonListHeader,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { DEMO_TODOS } from '../../core/data/demo-todos';
import { Todo } from '../../core/models/todo.model';
import { TodoItemComponent } from '../../shared/components/todo-item/todo-item.component';

/**
 * "Todos" — one-off tasks next to the recurring habits.
 *
 * v0.1.0 renders placeholder data from `DEMO_TODOS`.
 */
@Component({
  selector: 'app-todos',
  templateUrl: './todos.page.html',
  styleUrls: ['./todos.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    TodoItemComponent,
  ],
})
export class TodosPage {
  /** All tasks on the list. */
  readonly todos = signal<readonly Todo[]>(DEMO_TODOS);

  /** The tasks that are still open. */
  readonly openTodos = computed(() => this.todos().filter((todo) => !todo.done));

  /** The tasks that are already done. */
  readonly doneTodos = computed(() => this.todos().filter((todo) => todo.done));
}
