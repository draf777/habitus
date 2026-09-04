import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output,
  computed,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { checkmarkOutline } from 'ionicons/icons';
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { HABIT_COLOR_OPTIONS } from '../../habit-color-options';
import { HABIT_ICON_OPTIONS } from '../../habit-icon-options';
import { registerHabitIcons } from '../../habit-icon-registration';
import { HABIT_TYPE_OPTIONS, habitTypeUnit } from '../../habit-type-options';
import { Habit, HabitFrequency, HabitType } from '../../../models/habit.model';
import { goalRequiredUnlessBoolean, weeklyGoalRequiredWhenWeekly } from '../../validators/new-habit.validators';

export type NewHabitFormValue = Omit<Habit, 'id' | 'createdAt'>;

/**
 * Form to create or edit a habit: name, frequency (daily vs. a weekly
 * count target), type/goal for daily habits, and a collapsed "Erweiterte
 * Einstellungen" section (step size, custom unit, color). Emits `save` with
 * a ready-to-persist value once the form is valid.
 *
 * Pass an existing `habit` to edit it — the form is prefilled, and `type`
 * and `frequency` become read-only, since changing either would make past
 * entries ambiguous.
 */
@Component({
  selector: 'app-new-habit-form',
  templateUrl: './new-habit-form.component.html',
  styleUrls: ['./new-habit-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Modal content presented outside the router (no `ion-page` from `IonRouterOutlet`
  // in this case) needs the class itself, or `ion-content` collapses to 0 height.
  host: { class: 'ion-page' },
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonInput,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonNote,
    IonIcon,
    IonAccordionGroup,
    IonAccordion,
  ],
})
export class NewHabitFormComponent implements OnInit {
  /** The habit to edit; omit to create a new one. */
  readonly habit = input<Habit | undefined>(undefined);

  @Output() readonly save = new EventEmitter<NewHabitFormValue>();
  @Output() readonly canceled = new EventEmitter<void>();

  readonly typeOptions = HABIT_TYPE_OPTIONS;
  readonly iconOptions = HABIT_ICON_OPTIONS;
  readonly colorOptions = HABIT_COLOR_OPTIONS;

  readonly isEditing = computed(() => this.habit() != null);

  readonly form = new FormGroup(
    {
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(30)],
      }),
      frequency: new FormControl<HabitFrequency>('daily', { nonNullable: true, validators: [Validators.required] }),
      type: new FormControl<HabitType>('count', { nonNullable: true, validators: [Validators.required] }),
      goal: new FormControl<number | null>(null, [Validators.min(1)]),
      weeklyGoal: new FormControl<number | null>(null, [Validators.min(1), Validators.max(7)]),
      icon: new FormControl<string | null>(null),
      color: new FormControl<string | null>(null),
      unit: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(12)] }),
      step: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    },
    { validators: [goalRequiredUnlessBoolean, weeklyGoalRequiredWhenWeekly] },
  );

  /** Current `frequency` value as a signal, so the template can react to it under `OnPush`. */
  readonly selectedFrequency = toSignal(this.form.controls.frequency.valueChanges, {
    initialValue: this.form.controls.frequency.value,
  });

  /** Current `type` value as a signal, so the template can react to it under `OnPush`. */
  readonly selectedType = toSignal(this.form.controls.type.valueChanges, {
    initialValue: this.form.controls.type.value,
  });

  /** Current `icon` value as a signal, so the picker highlights under `OnPush`. */
  readonly selectedIcon = toSignal(this.form.controls.icon.valueChanges, {
    initialValue: this.form.controls.icon.value,
  });

  /** Current `color` value as a signal, so the picker highlights under `OnPush`. */
  readonly selectedColor = toSignal(this.form.controls.color.valueChanges, {
    initialValue: this.form.controls.color.value,
  });

  /** The selected type's default unit, shown as a placeholder for the custom-unit field. */
  readonly unitPlaceholder = computed(() => habitTypeUnit(this.selectedType()) ?? '');

  constructor() {
    registerHabitIcons();
    addIcons({ checkmarkOutline });

    const destroyRef = inject(DestroyRef);
    this.form.controls.type.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
      this.form.controls.goal.updateValueAndValidity();
    });
    this.form.controls.frequency.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe((frequency) => {
      // A weekly habit is a plain yes/no per day — there is no separate daily target.
      if (frequency === 'weekly') {
        this.form.controls.type.setValue('boolean');
      }
      this.form.controls.goal.updateValueAndValidity();
      this.form.controls.weeklyGoal.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    const habit = this.habit();
    if (!habit) {
      return;
    }

    this.form.patchValue({
      name: habit.name,
      frequency: habit.frequency ?? 'daily',
      type: habit.type,
      goal: habit.goal ?? null,
      weeklyGoal: habit.weeklyGoal ?? null,
      icon: habit.icon ?? null,
      color: habit.color ?? null,
      unit: habit.unit ?? '',
      step: habit.step ?? 1,
    });
    // Changing type or frequency after creation would make past entries
    // ambiguous (e.g. old "20 Minuten" entries under a habit switched to
    // Ja/Nein, or daily entries under a habit switched to a weekly target).
    this.form.controls.type.disable();
    this.form.controls.frequency.disable();
  }

  /** Picks an icon, or clears the selection when tapping the already-selected one. */
  selectIcon(name: string): void {
    const current = this.form.controls.icon.value;
    this.form.controls.icon.setValue(current === name ? null : name);
  }

  /** Picks a color, or clears the selection when tapping the already-selected one. */
  selectColor(color: string): void {
    const current = this.form.controls.color.value;
    this.form.controls.color.setValue(current === color ? null : color);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, frequency, type, goal, weeklyGoal, icon, color, unit, step } = this.form.getRawValue();
    const isWeekly = frequency === 'weekly';
    const effectiveType = isWeekly ? 'boolean' : type;

    this.save.emit({
      name: name.trim(),
      type: effectiveType,
      frequency,
      ...(effectiveType !== 'boolean'
        ? { goal: goal ?? undefined, step, ...(unit.trim() ? { unit: unit.trim() } : {}) }
        : {}),
      ...(isWeekly ? { weeklyGoal: weeklyGoal ?? undefined } : {}),
      ...(icon ? { icon } : {}),
      ...(color ? { color } : {}),
    });
  }
}
