import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';

import { today } from '../../core/date.util';
import { HabitStorageService } from '../../core/services/habit-storage.service';
import { Habit } from '../../models/habit.model';
import { HabitItemComponent } from '../../shared/components/habit-item/habit-item.component';
import {
  NewHabitFormComponent,
  NewHabitFormValue,
} from '../../shared/components/new-habit-form/new-habit-form.component';

/**
 * "Heute" — today's habits with their input for today's value, backed by
 * `HabitStorageService`. Also where new habits are created.
 */
@Component({
  selector: 'app-today',
  templateUrl: './today.page.html',
  styleUrls: ['./today.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    IonModal,
    HabitItemComponent,
    NewHabitFormComponent,
  ],
})
export class TodayPage {
  private readonly storage = inject(HabitStorageService);
  private readonly date = today();

  /** All stored habits. */
  readonly habits = signal<readonly Habit[]>([]);
  /** Today's value per habit id; a habit without an entry defaults to 0. */
  private readonly values = signal<ReadonlyMap<string, number>>(new Map());
  /** Whether the "Neues Habit" modal is open. */
  readonly showForm = signal(false);

  /** How many of today's habits already have a value greater than 0. */
  readonly doneCount = computed(() => {
    const values = this.values();
    return this.habits().filter((habit) => (values.get(habit.id) ?? 0) > 0).length;
  });

  constructor() {
    addIcons({ addOutline });
    void this.reload();
  }

  /** Today's recorded value for a habit, or 0 if nothing was entered yet. */
  valueFor(habitId: string): number {
    return this.values().get(habitId) ?? 0;
  }

  async onValueChange(habit: Habit, value: number): Promise<void> {
    await this.storage.setEntry(habit.id, this.date, value);
    const next = new Map(this.values());
    next.set(habit.id, value);
    this.values.set(next);
  }

  async onDelete(habit: Habit): Promise<void> {
    await this.storage.deleteHabit(habit.id);
    await this.reload();
  }

  async onSave(value: NewHabitFormValue): Promise<void> {
    await this.storage.addHabit(value);
    this.showForm.set(false);
    await this.reload();
  }

  private async reload(): Promise<void> {
    const habits = await this.storage.getHabits();
    this.habits.set(habits);

    const entries = await Promise.all(
      habits.map(
        async (habit) => [habit.id, (await this.storage.getEntry(habit.id, this.date))?.value ?? 0] as const,
      ),
    );
    this.values.set(new Map(entries));
  }
}
