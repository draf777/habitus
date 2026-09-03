import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IonItem, IonLabel, IonNote, IonProgressBar } from '@ionic/angular';

import { HabitStat } from '../../../core/models/habit.model';

/**
 * One habit as a row in the statistics list: title, "done / goal" and a
 * progress bar for the current week.
 */
@Component({
  selector: 'app-habit-progress',
  templateUrl: './habit-progress.component.html',
  styleUrls: ['./habit-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonItem, IonLabel, IonNote, IonProgressBar],
})
export class HabitProgressComponent {
  /** The habit and how often it was completed this week. */
  readonly stat = input.required<HabitStat>();

  /** Completion ratio in the range 0…1, as `ion-progress-bar` expects it. */
  readonly progress = computed(() => {
    const { completed, habit } = this.stat();
    if (habit.weeklyGoal <= 0) {
      return 0;
    }
    return Math.min(completed / habit.weeklyGoal, 1);
  });
}
