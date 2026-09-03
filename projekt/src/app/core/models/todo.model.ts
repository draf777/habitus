/**
 * A single one-off task on the todo list.
 *
 * Unlike a `Habit`, a todo is not repeated — it is done once and then gone.
 */
export interface Todo {
  /** Stable identifier, unique across all todos. */
  readonly id: string;
  /** What has to be done. */
  readonly title: string;
  /** Whether the task has been completed. */
  readonly done: boolean;
}
