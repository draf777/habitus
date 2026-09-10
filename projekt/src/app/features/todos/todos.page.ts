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
  IonReorderGroup,
  IonTitle,
  IonToolbar,
  ReorderEndCustomEvent,
  ViewWillEnter,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';

import { today } from '../../core/date.util';
import { TodoStorageService } from '../../core/services/todo-storage.service';
import { Todo } from '../../models/todo.model';
import { TodoItemComponent } from '../../shared/components/todo-item/todo-item.component';

/** Ascending by `order` — how every section on this page is sorted. */
function byOrder(a: Todo, b: Todo): number {
  return a.order - b.order;
}

/** "DD.MM." for a "YYYY-MM-DD" date, e.g. "08.09.". */
function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(new Date(`${date}T00:00:00`));
}

/**
 * "Todos" — one-off tasks, next to the recurring habits. Backed by
 * `TodoStorageService`. Split into three sections: today's open tasks,
 * still-open tasks from earlier days (which used to simply vanish once the
 * day had passed), and done tasks (from any day). Each section can be
 * reordered by hand via drag-and-drop, always available via the handle on
 * each row — no separate mode needed.
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
    IonReorderGroup,
    TodoItemComponent,
  ],
})
export class TodosPage implements ViewWillEnter {
  private readonly storage = inject(TodoStorageService);
  private readonly date = today();

  /** All stored todos. */
  readonly todos = signal<readonly Todo[]>([]);
  /** Text currently typed into the "new task" field. */
  readonly newTodoText = signal('');

  /** Today's tasks that are still open. */
  readonly todayOpenTodos = computed(() =>
    this.todos()
      .filter((todo) => todo.date === this.date && !todo.done)
      .sort(byOrder),
  );
  /** Still-open tasks left over from earlier days, oldest first. */
  readonly earlierOpenTodos = computed(() =>
    this.todos()
      .filter((todo) => todo.date < this.date && !todo.done)
      .sort(byOrder),
  );
  /** Done tasks, from any day. */
  readonly doneTodos = computed(() => this.todos().filter((todo) => todo.done).sort(byOrder));

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

  /** The original date to show under a task, or `undefined` for today's own tasks. */
  dateLabelFor(todo: Todo): string | undefined {
    return todo.date === this.date ? undefined : formatShortDate(todo.date);
  }

  /** Applies a drag-and-drop reorder within one section (`sectionTodos`, already in on-screen order). */
  async onReorder(event: ReorderEndCustomEvent, sectionTodos: readonly Todo[]): Promise<void> {
    const reordered = event.detail.complete([...sectionTodos]) as Todo[];
    await this.storage.reorderTodos(reordered.map((todo) => todo.id));
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.todos.set(await this.storage.getTodos());
  }
}
