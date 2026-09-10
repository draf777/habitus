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
  IonListHeader,
  IonModal,
  IonNote,
  IonTitle,
  IonToolbar,
  ToastController,
  ViewWillEnter,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';

import { datesThisWeekUpTo, today } from '../../core/date.util';
import { HabitStorageService } from '../../core/services/habit-storage.service';
import { Habit } from '../../models/habit.model';
import { HabitItemComponent, WeeklyProgress } from '../../shared/components/habit-item/habit-item.component';
import {
  NewHabitFormComponent,
  NewHabitFormValue,
} from '../../shared/components/new-habit-form/new-habit-form.component';
import { isHabitDone } from '../../shared/habit-progress.util';

/** What the "Neues Habit"/"Habit bearbeiten" modal is currently doing. */
type FormMode = 'new' | Habit | null;

/**
 * "Heute" — today's habits with their input for today's value, backed by
 * `HabitStorageService`. Also where habits are created and edited.
 *
 * Habits can also be deleted from another tab (clearing demo data on
 * "Über"), and Ionic keeps this page's component instance alive across tab
 * switches instead of recreating it — so it reloads on `ionViewWillEnter`,
 * not just once in the constructor.
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
export class TodayPage implements ViewWillEnter {
  private readonly storage = inject(HabitStorageService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);
  private readonly date = today();

  /** All stored habits. */
  readonly habits = signal<readonly Habit[]>([]);
  /** Today's value per habit id; a habit without an entry defaults to 0. */
  private readonly values = signal<ReadonlyMap<string, number>>(new Map());
  /** Days this week (so far) a habit with a `weeklyGoal` was done, per habit id. */
  private readonly weeklyDone = signal<ReadonlyMap<string, number>>(new Map());
  /** Whether the create/edit modal is open, and for what. */
  readonly formMode = signal<FormMode>(null);

  /** Today's habits that haven't reached their goal yet. */
  readonly openHabits = computed(() => this.habits().filter((habit) => !isHabitDone(habit, this.valueFor(habit.id))));
  /** Today's habits that already reached their goal. */
  readonly doneHabits = computed(() => this.habits().filter((habit) => isHabitDone(habit, this.valueFor(habit.id))));

  /** The habit passed to the form when editing, or `undefined` when creating. */
  readonly editingHabit = computed(() => {
    const mode = this.formMode();
    return mode && mode !== 'new' ? mode : undefined;
  });

  constructor() {
    addIcons({ addOutline });
    void this.reload();
  }

  /** Reloads whenever this (cached) page becomes active again, e.g. after clearing demo data on "Über". */
  ionViewWillEnter(): void {
    void this.reload();
  }

  /** Today's recorded value for a habit, or 0 if nothing was entered yet. */
  valueFor(habitId: string): number {
    return this.values().get(habitId) ?? 0;
  }

  /** This week's progress toward a habit's `weeklyGoal`, if it has one. */
  weeklyProgressFor(habit: Habit): WeeklyProgress | undefined {
    if (habit.weeklyGoal == null) {
      return undefined;
    }
    return { done: this.weeklyDone().get(habit.id) ?? 0, goal: habit.weeklyGoal };
  }

  async onValueChange(habit: Habit, value: number): Promise<void> {
    const previousValue = this.valueFor(habit.id);
    await this.storage.setEntry(habit.id, this.date, value);

    const next = new Map(this.values());
    next.set(habit.id, value);
    this.values.set(next);

    if (!isHabitDone(habit, previousValue) && isHabitDone(habit, value)) {
      await this.announceDone(habit);
    }
    if (habit.weeklyGoal != null) {
      await this.reloadWeeklyProgress([habit]);
    }
  }

  /** Asks for confirmation, then deletes the habit if the user confirms. */
  async confirmDelete(habit: Habit): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Habit löschen?',
      message: `„${habit.name}“ und alle bisherigen Einträge werden endgültig gelöscht.`,
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        { text: 'Löschen', role: 'destructive' },
      ],
    });
    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'destructive') {
      await this.storage.deleteHabit(habit.id);
      await this.reload();
    }
  }

  async onSave(value: NewHabitFormValue): Promise<void> {
    const mode = this.formMode();
    if (mode && mode !== 'new') {
      await this.storage.updateHabit(mode.id, value);
    } else {
      await this.storage.addHabit(value);
    }
    this.formMode.set(null);
    await this.reload();
  }

  private async announceDone(habit: Habit): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: `🎉 „${habit.name}“ erreicht!`,
      duration: 2000,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
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

    await this.reloadWeeklyProgress(habits.filter((habit) => habit.weeklyGoal != null));
  }

  /** Recomputes how many days this week each of the given habits was done. */
  private async reloadWeeklyProgress(habits: readonly Habit[]): Promise<void> {
    if (habits.length === 0) {
      return;
    }
    const weekDates = new Set(datesThisWeekUpTo(new Date(`${this.date}T00:00:00`)));

    const counts = await Promise.all(
      habits.map(async (habit) => {
        const entries = await this.storage.getEntriesForHabit(habit.id);
        const doneDays = new Set(
          entries.filter((entry) => weekDates.has(entry.date) && isHabitDone(habit, entry.value)).map((e) => e.date),
        );
        return [habit.id, doneDays.size] as const;
      }),
    );

    const next = new Map(this.weeklyDone());
    for (const [habitId, count] of counts) {
      next.set(habitId, count);
    }
    this.weeklyDone.set(next);
  }
}
