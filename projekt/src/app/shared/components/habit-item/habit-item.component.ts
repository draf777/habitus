import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from '@angular/core';
import { IonButton, IonIcon, IonInput, IonItem, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addCircleOutline, checkmarkCircle, pencilOutline, removeCircleOutline, trashOutline } from 'ionicons/icons';

import { Habit } from '../../../models/habit.model';
import { resolveHabitStep, resolveHabitUnit } from '../../habit-display.util';
import { registerHabitIcons } from '../../habit-icon-registration';

/** Progress of a habit's weekly (not daily) goal, e.g. "3 / 4 diese Woche". */
export interface WeeklyProgress {
  readonly done: number;
  readonly goal: number;
}

/** Avoids floating-point artifacts (e.g. 0.1 + 0.2) after repeated +/- taps. */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * One habit as a row in the "Heute" list: icon, name and a type-appropriate
 * control (a small check button for `boolean`, +/- stepper with an editable
 * value otherwise) for today's value.
 *
 * The control reflects `value` but does not persist it — the parent page
 * owns storage and passes the current value back in via `value`.
 */
@Component({
  selector: 'app-habit-item',
  templateUrl: './habit-item.component.html',
  styleUrls: ['./habit-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonItem, IonIcon, IonLabel, IonInput, IonButton],
})
export class HabitItemComponent {
  /** The habit shown by this row. */
  readonly habit = input.required<Habit>();
  /** Today's recorded value for this habit (0/1 for `boolean` habits). */
  readonly value = input<number>(0);
  /** This week's progress toward `habit().weeklyGoal`, if one is set. */
  readonly weeklyProgress = input<WeeklyProgress | undefined>(undefined);

  /** Emits the new value whenever the user changes the control. */
  @Output() readonly valueChange = new EventEmitter<number>();
  /** Emitted when the user requests this habit be edited. */
  @Output() readonly edit = new EventEmitter<void>();
  /** Emitted when the user requests this habit be deleted. */
  @Output() readonly remove = new EventEmitter<void>();

  /** Unit shown next to the goal, e.g. "Minuten"; absent for `boolean` habits. */
  readonly unit = computed(() => resolveHabitUnit(this.habit()));
  /** How much the +/- buttons nudge the value by. */
  readonly step = computed(() => resolveHabitStep(this.habit()));

  constructor() {
    registerHabitIcons();
    addIcons({ trashOutline, pencilOutline, addCircleOutline, removeCircleOutline, checkmarkCircle });
  }

  onCheckedChange(checked: boolean): void {
    this.valueChange.emit(checked ? 1 : 0);
  }

  /** From the +/- buttons: nudges by `step`, never below 0. */
  nudge(direction: 1 | -1): void {
    const next = roundToTwoDecimals(this.value() + direction * this.step());
    this.valueChange.emit(Math.max(0, next));
  }

  /** From typing directly into the value field — any non-negative number, decimals included. */
  onNumberChange(raw: string | number | null | undefined): void {
    const parsed = Number(raw);
    this.valueChange.emit(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
  }
}
