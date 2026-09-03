import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { DEMO_TODAY } from '../../core/data/demo-habits';
import { HabitEntry } from '../../core/models/habit.model';
import { HabitItemComponent } from '../../shared/components/habit-item/habit-item.component';

/**
 * "Heute" — the habits to check off today.
 *
 * v0.1.0 renders placeholder data from `DEMO_TODAY`; a later release swaps
 * the signal for one fed by a storage-backed service.
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
    IonContent,
    IonLabel,
    IonList,
    IonListHeader,
    IonNote,
    HabitItemComponent,
  ],
})
export class TodayPage {
  /** The habits shown for today. */
  readonly entries = signal<readonly HabitEntry[]>(DEMO_TODAY);

  /** How many of today's habits are already checked off. */
  readonly doneCount = computed(() => this.entries().filter((entry) => entry.done).length);
}
