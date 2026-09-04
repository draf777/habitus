import { HabitType } from '../models/habit.model';

/** A `HabitType` together with its German display labels. */
export interface HabitTypeOption {
  readonly value: HabitType;
  /** Label shown in the "Typ" select of the new-habit form. */
  readonly label: string;
  /** Default unit shown next to the numeric value, e.g. "Minuten". Absent for `boolean`. */
  readonly unit?: string;
}

export const HABIT_TYPE_OPTIONS: readonly HabitTypeOption[] = [
  { value: 'duration_min', label: 'Minuten', unit: 'Minuten' },
  { value: 'duration_hours', label: 'Stunden', unit: 'Stunden' },
  { value: 'count', label: 'Anzahl', unit: 'Mal' },
  { value: 'boolean', label: 'Ja / Nein' },
];

/** The default unit label for a habit type, or `undefined` for `boolean` habits. */
export function habitTypeUnit(type: HabitType): string | undefined {
  return HABIT_TYPE_OPTIONS.find((option) => option.value === type)?.unit;
}
