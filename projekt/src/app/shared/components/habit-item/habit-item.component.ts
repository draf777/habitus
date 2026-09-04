import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from '@angular/core';
import { IonButton, IonIcon, IonInput, IonItem, IonLabel, IonToggle } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { ellipseOutline, trashOutline } from 'ionicons/icons';

import { Habit } from '../../../models/habit.model';
import { habitTypeUnit } from '../../habit-type-options';

/**
 * One habit as a row in the "Heute" list: icon, name and a type-appropriate
 * control (toggle for `boolean`, number input otherwise) for today's value.
 *
 * The control reflects `value` but does not persist it — the parent page
 * owns storage and passes the current value back in via `value`.
 */
@Component({
  selector: 'app-habit-item',
  templateUrl: './habit-item.component.html',
  styleUrls: ['./habit-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonItem, IonIcon, IonLabel, IonToggle, IonInput, IonButton],
})
export class HabitItemComponent {
  /** The habit shown by this row. */
  readonly habit = input.required<Habit>();
  /** Today's recorded value for this habit (0/1 for `boolean` habits). */
  readonly value = input<number>(0);

  /** Emits the new value whenever the user changes the control. */
  @Output() readonly valueChange = new EventEmitter<number>();
  /** Emitted when the user requests this habit be deleted. */
  @Output() readonly remove = new EventEmitter<void>();

  /** Unit shown next to the goal, e.g. "Minuten"; absent for `boolean` habits. */
  readonly unit = computed(() => habitTypeUnit(this.habit().type));

  constructor() {
    addIcons({ ellipseOutline, trashOutline });
  }

  onToggleChange(checked: boolean): void {
    this.valueChange.emit(checked ? 1 : 0);
  }

  onNumberChange(raw: string | number | null | undefined): void {
    const parsed = Number(raw);
    this.valueChange.emit(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
  }
}
