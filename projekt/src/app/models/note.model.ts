/** A single freely-worded note. */
export interface Note {
  /** Stable identifier, unique across all notes. */
  readonly id: string;
  /** Short heading shown in the notes list. */
  readonly title: string;
  /** The note's body text, as typed — list lines ("- ...") and URLs are only rendered specially when viewing it. */
  readonly content: string;
  /** ISO timestamp of when the note was created. */
  readonly createdAt: string;
  /** ISO timestamp of the last change to title or content. */
  readonly updatedAt: string;
}
