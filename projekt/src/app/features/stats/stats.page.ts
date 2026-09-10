import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular';
import { ChartConfiguration, ChartData } from 'chart.js';
import { addIcons } from 'ionicons';
import { flame } from 'ionicons/icons';
import { BaseChartDirective } from 'ng2-charts';

import { HabitStorageService } from '../../core/services/habit-storage.service';
import { HabitMonthStats, HabitWeekStats, StatsService } from '../../core/services/stats.service';
import { SettingsService } from '../../core/services/settings.service';
import { Habit } from '../../models/habit.model';
import { resolveHabitUnit } from '../../shared/habit-display.util';

/** Which window the chart shows, picked via the "Woche"/"Monat" segment. */
export type StatsPeriod = 'week' | 'month';

/** German short weekday label for a "YYYY-MM-DD" date, e.g. "Do". */
function weekdayLabel(date: string): string {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(new Date(`${date}T00:00:00`));
}

/** Day-of-month label for a "YYYY-MM-DD" date, e.g. "9" for "2026-09-09". */
function dayOfMonthLabel(date: string): string {
  return String(Number(date.slice(-2)));
}

/** The chart colors derived from the currently active theme/color scheme. */
interface ThemeColors {
  readonly accent: string;
  readonly text: string;
}

/**
 * "Statistik" — a bar chart of one habit's last 7 days or current calendar
 * month, backed by `StatsService`. Which habit is shown is picked from a
 * select above the chart; the period from a "Woche"/"Monat" segment.
 *
 * Habits and entries are created/changed on other tabs, and Ionic keeps this
 * page's component instance alive across tab switches instead of recreating
 * it — so it reloads on `ionViewWillEnter`, not just once in the constructor.
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
    IonItem,
    IonIcon,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    BaseChartDirective,
  ],
})
export class StatsPage implements ViewWillEnter {
  private readonly habitStorage = inject(HabitStorageService);
  private readonly statsService = inject(StatsService);
  private readonly settings = inject(SettingsService);

  /**
   * Whether the very first load is still in flight — see `TodayPage.loading`
   * for why this exists and why it never flips back to `true`.
   */
  readonly loading = signal(true);

  /** All stored habits. */
  readonly habits = signal<readonly Habit[]>([]);
  /** The habit currently shown in the chart. */
  readonly selectedHabitId = signal<string | null>(null);
  /** Which window the chart currently shows. */
  readonly period = signal<StatsPeriod>('week');
  /** The selected habit's last 7 days, once loaded. */
  readonly weekStats = signal<HabitWeekStats | null>(null);
  /** The selected habit's current calendar month so far, once loaded. */
  readonly monthStats = signal<HabitMonthStats | null>(null);

  /** Stats for whichever period is currently selected. */
  private readonly activeStats = computed(() => (this.period() === 'week' ? this.weekStats() : this.monthStats()));

  /** Whether the selected habit has any recorded entry within the currently shown period. */
  readonly hasEntries = computed(() => this.activeStats()?.hasEntries ?? false);

  /** How many of the last 7 days a boolean habit was done. */
  readonly doneDays = computed(() => this.weekStats()?.days.filter((day) => day.value >= 1).length ?? 0);

  /** Days shown so far this month, and how many of the boolean habit's days were done, or the numeric total. */
  readonly monthDayCount = computed(() => this.monthStats()?.days.length ?? 0);
  readonly monthTotal = computed(() => this.monthStats()?.total ?? 0);

  /** Consecutive days the selected habit has been kept up, ending today (or yesterday if today isn't done yet). */
  readonly streak = computed(() => this.activeStats()?.streak ?? 0);

  private readonly selectedHabit = computed(
    () => this.habits().find((habit) => habit.id === this.selectedHabitId()) ?? null,
  );

  /** Unit label for the selected habit's values, e.g. "Minuten" or "Erledigt". */
  readonly unitLabel = computed(() => {
    const habit = this.selectedHabit();
    if (!habit) {
      return '';
    }
    return habit.type === 'boolean' ? 'Erledigt' : (resolveHabitUnit(habit) ?? '');
  });

  /** Whether the selected habit is done at all vs. done to a numeric goal. */
  readonly isSelectedHabitBoolean = computed(() => this.selectedHabit()?.type === 'boolean');

  /** The chart's accent and text color, re-read whenever the theme/color scheme changes. */
  private readonly themeColors = computed<ThemeColors>(() => {
    this.settings.theme();
    this.settings.colorScheme();
    const styles = getComputedStyle(document.documentElement);
    return {
      accent: styles.getPropertyValue('--ion-color-primary').trim() || '#0e7c86',
      text: styles.getPropertyValue('--ion-color-medium').trim() || '#666666',
    };
  });

  readonly chartData = computed<ChartData<'bar'>>(() => {
    const days = this.activeStats()?.days ?? [];
    const labelFn = this.period() === 'week' ? weekdayLabel : dayOfMonthLabel;
    return {
      labels: days.map((day) => labelFn(day.date)),
      datasets: [
        {
          label: this.unitLabel(),
          data: days.map((day) => day.value),
          backgroundColor: this.themeColors().accent,
          borderRadius: 4,
        },
      ],
    };
  });

  readonly chartOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const colors = this.themeColors();
    const isBoolean = this.isSelectedHabitBoolean();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: colors.text } },
      },
      scales: {
        x: { ticks: { color: colors.text }, grid: { display: false } },
        y: {
          beginAtZero: true,
          max: isBoolean ? 1 : undefined,
          ticks: { color: colors.text, stepSize: isBoolean ? 1 : undefined },
          title: { display: true, text: this.unitLabel(), color: colors.text },
        },
      },
    };
  });

  constructor() {
    addIcons({ flame });
    void this.reload();
  }

  /** Reloads whenever this (cached) page becomes active again, e.g. after creating a habit on "Heute". */
  ionViewWillEnter(): void {
    void this.reload();
  }

  /** Switches the chart to a different habit and loads its stats. */
  async onHabitChange(habitId: string): Promise<void> {
    this.selectedHabitId.set(habitId);
    await this.loadStatsForSelected();
  }

  /** Switches the chart between the week and month view. */
  onPeriodChange(period: StatsPeriod): void {
    this.period.set(period);
  }

  private async reload(): Promise<void> {
    const habits = await this.habitStorage.getHabits();
    this.habits.set(habits);

    const currentId = this.selectedHabitId();
    const stillExists = habits.some((habit) => habit.id === currentId);
    this.selectedHabitId.set(stillExists ? currentId : (habits[0]?.id ?? null));

    await this.loadStatsForSelected();
    this.loading.set(false);
  }

  /** Loads both the week and month stats for the selected habit, so switching periods is instant. */
  private async loadStatsForSelected(): Promise<void> {
    const habit = this.selectedHabit();
    if (!habit) {
      this.weekStats.set(null);
      this.monthStats.set(null);
      return;
    }

    const [week, month] = await Promise.all([this.statsService.getWeekStats(habit), this.statsService.getMonthStats(habit)]);
    this.weekStats.set(week);
    this.monthStats.set(month);
  }
}
