import { AsyncWriteQueue } from './async-write-queue.util';

/** Resolves after a macrotask, so operations can be forced to overlap in tests. */
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('AsyncWriteQueue', () => {
  it('resolves each run() with its own operation\'s result', async () => {
    const queue = new AsyncWriteQueue();

    const [first, second] = await Promise.all([
      queue.run(async () => 1),
      queue.run(async () => 2),
    ]);

    expect(first).toBe(1);
    expect(second).toBe(2);
  });

  it('runs a slower first operation to completion before starting the next one', async () => {
    const queue = new AsyncWriteQueue();
    const order: string[] = [];

    const slowFirst = queue.run(async () => {
      order.push('first:start');
      await tick();
      order.push('first:end');
    });
    const fastSecond = queue.run(async () => {
      order.push('second:start');
      order.push('second:end');
    });

    await Promise.all([slowFirst, fastSecond]);

    expect(order).toEqual(['first:start', 'first:end', 'second:start', 'second:end']);
  });

  it('rejects only the failing run() call, not later ones queued after it', async () => {
    const queue = new AsyncWriteQueue();

    const failing = queue.run(async () => {
      throw new Error('boom');
    });
    const after = queue.run(async () => 'still runs');

    await expect(failing).rejects.toThrow('boom');
    await expect(after).resolves.toBe('still runs');
  });

  it('still runs a queued operation after an earlier one failed, in order', async () => {
    const queue = new AsyncWriteQueue();
    const order: string[] = [];

    const failing = queue
      .run(async () => {
        order.push('first');
        throw new Error('boom');
      })
      .catch(() => undefined);
    const after = queue.run(async () => {
      order.push('second');
    });

    await Promise.all([failing, after]);

    expect(order).toEqual(['first', 'second']);
  });
});
