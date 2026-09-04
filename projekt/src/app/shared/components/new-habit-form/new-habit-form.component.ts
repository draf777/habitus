import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Output, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { HABIT_TYPE_OPTIONS } from '../../habit-type-options';
import { Habit, HabitType } from '../../../models/habit.model';
import { goalRequiredUnlessBoolean } from '../../validators/new-habit.validators';

export type NewHabitFormValue = Omit<Habit, 'id' | 'createdAt'>;

/**
 * Form to create a new habit: name, type and (for tracked types) a daily
 * goal. Emits `save` with a ready-to-persist value once the form is valid.
 */
@Component({
  selector: 'app-new-habit-form',
  templateUrl: './new-habit-form.component.html',
  styleUrls: ['./new-habit-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    IonInput,
    IonSelect,
    IonSelectOption,
    IonNote,
  ],
})
export class NewHabitFormComponent {
  @Output() readonly save = new EventEmitter<NewHabitFormValue>();
  @Output() readonly canceled = new EventEmitter<void>();

  readonly typeOptions = HABIT_TYPE_OPTIONS;

  readonly form = new FormGroup(
    {
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(30)],
      }),
      type: new FormControl<HabitType>('count', { nonNullable: true, validators: [Validators.required] }),
      goal: new FormControl<number | null>(null, [Validators.min(1)]),
    },
    { validators: goalRequiredUnlessBoolean },
  );

  /** Current `type` value as a signal, so the template can react to it under `OnPush`. */
  readonly selectedType = toSignal(this.form.controls.type.valueChanges, {
    initialValue: this.form.controls.type.value,
  });

  constructor() {
    this.form.controls.type.valueChanges.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(() => {
      this.form.controls.goal.updateValueAndValidity();
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, type, goal } = this.form.getRawValue();
    this.save.emit({
      name: name.trim(),
      type,
      ...(type === 'boolean' ? {} : { goal: goal ?? undefined }),
    });
  }
}
