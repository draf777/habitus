import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { DEMO_STATS } from '../../core/data/demo-habits';
import { HabitStat } from '../../core/models/habit.model';
import { DemoNoticeComponent } from '../../shared/components/demo-notice/demo-notice.component';
import { HabitProgressComponent } from '../../shared/components/habit-progress/habit-progress.component';

/**
 * "Statistik" — how the week is going per habit.
 *
 * v0.1.0 renders placeholder data from `DEMO_STATS`.
 */
@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    DemoNoticeComponent,
    HabitProgressComponent,
  ],
})
export class StatsPage {
  /** Weekly numbers per habit. */
  readonly stats = signal<readonly HabitStat[]>(DEMO_STATS);

  /** Share of all weekly goals reached so far, in the range 0…1. */
  readonly weeklyCompletion = computed(() => {
    const stats = this.stats();
    const goal = stats.reduce((sum, stat) => sum + stat.habit.weeklyGoal, 0);
    if (goal <= 0) {
      return 0;
    }
    const completed = stats.reduce((sum, stat) => sum + Math.min(stat.completed, stat.habit.weeklyGoal), 0);
    return completed / goal;
  });

  /** The same share as a rounded percentage, for display. */
  readonly weeklyCompletionPercent = computed(() => Math.round(this.weeklyCompletion() * 100));
}
