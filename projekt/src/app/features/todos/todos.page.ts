import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonTitle,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';

import { today } from '../../core/date.util';
import { TodoStorageService } from '../../core/services/todo-storage.service';
import { Todo } from '../../models/todo.model';
import { TodoItemComponent } from '../../shared/components/todo-item/todo-item.component';

/**
 * "Todos" — one-off tasks for today, next to the recurring habits. Backed by
 * `TodoStorageService`; only today's tasks are shown, since there is
 * (currently) no UI to pick another day.
 *
 * Todos can also be deleted from another tab (clearing demo data on
 * "Über"), and Ionic keeps this page's component instance alive across tab
 * switches instead of recreating it — so it reloads on `ionViewWillEnter`,
 * not just once in the constructor.
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
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    TodoItemComponent,
  ],
})
export class TodosPage implements ViewWillEnter {
  private readonly storage = inject(TodoStorageService);
  private readonly date = today();

  /** Today's tasks. */
  readonly todos = signal<readonly Todo[]>([]);
  /** Text currently typed into the "new task" field. */
  readonly newTodoText = signal('');

  /** Today's tasks that are still open. */
  readonly openTodos = computed(() => this.todos().filter((todo) => !todo.done));
  /** Today's tasks that are already done. */
  readonly doneTodos = computed(() => this.todos().filter((todo) => todo.done));

  constructor() {
    addIcons({ addOutline });
    void this.reload();
  }

  /** Reloads whenever this (cached) page becomes active again, e.g. after clearing demo data on "Über". */
  ionViewWillEnter(): void {
    void this.reload();
  }

  /** Creates a new task for today from `newTodoText`, if it isn't blank. */
  async addTodo(): Promise<void> {
    const text = this.newTodoText().trim();
    if (!text) {
      return;
    }
    await this.storage.addTodo({ text, date: this.date });
    this.newTodoText.set('');
    await this.reload();
  }

  async onToggle(todo: Todo): Promise<void> {
    await this.storage.setDone(todo.id, !todo.done);
    await this.reload();
  }

  async onRemove(todo: Todo): Promise<void> {
    await this.storage.deleteTodo(todo.id);
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.todos.set(await this.storage.getTodosForDate(this.date));
  }
}
