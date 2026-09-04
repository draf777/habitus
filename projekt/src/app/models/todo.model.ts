/**
 * A single one-off task on the todo list.
 *
 * Definition only for v0.2.0 — persistence and UI land in v0.3.0.
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
}
