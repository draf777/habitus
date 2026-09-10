/**
 * Serializes async operations passed to the same queue instance, so a
 * read-modify-write step (read the stored array, compute the next one,
 * write it back) can't interleave with another one racing it.
 *
 * `HabitStorageService`/`TodoStorageService` need this because Ionic Storage
 * has no atomic "append"/"upsert" — without serializing, two operations
 * fired in quick succession (e.g. two rapid taps on a habit's +/- stepper)
 * can both read the array before either has written back, so neither sees
 * the other's change; the second write then overwrites the first instead of
 * building on it (e.g. producing two entries for the same habit/day instead
 * of one, or silently dropping one of the two changes).
 */
export class AsyncWriteQueue {
  private tail: Promise<unknown> = Promise.resolve();

  /** Runs `operation` once every previously enqueued operation has settled, in order. */
  run<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.tail.then(operation, operation);
    this.tail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
}
