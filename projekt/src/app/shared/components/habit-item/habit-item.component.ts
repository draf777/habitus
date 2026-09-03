import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonCheckbox, IonIcon, IonItem, IonLabel } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { barbellOutline, bulbOutline, leafOutline } from 'ionicons/icons';

import { HabitEntry } from '../../../core/models/habit.model';

/**
 * One habit as a row in the "Heute" list: icon, title, weekly goal and a
 * checkbox showing whether it is done.
 *
 * Purely presentational — toggling is not wired up in v0.1.0.
 */
@Component({
  selector: 'app-habit-item',
  templateUrl: './habit-item.component.html',
  styleUrls: ['./habit-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonItem, IonIcon, IonLabel, IonCheckbox],
})
export class HabitItemComponent {
  /** The habit and its state for the displayed day. */
  readonly entry = input.required<HabitEntry>();

  constructor() {
    addIcons({ leafOutline, barbellOutline, bulbOutline });
  }
}
