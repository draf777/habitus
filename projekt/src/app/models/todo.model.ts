/**
 * A single one-off task on the todo list.
 *
 * Unlike a `Habit`, a todo is not repeated — it is done once and then gone.
 */
export interface Todo {
  /** Stable identifier, unique across all todos. */
  readonly id: string;
  /** What has to be done. */
  readonly text: string;
  /** Whether the task has been completed. */
  readonly done: boolean;
  /** Day the todo is for, as "YYYY-MM-DD". */
  readonly date: string;
  /** ISO timestamp of when the todo was created. */
  readonly createdAt: string;
  /** Sort key within its section on "Todos"; lower comes first. Rewritten by drag-and-drop reordering. */
  readonly order: number;
}
