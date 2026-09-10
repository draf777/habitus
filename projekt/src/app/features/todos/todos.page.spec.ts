import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosPage } from './todos.page';
import { today } from '../../core/date.util';
import { TodoStorageService } from '../../core/services/todo-storage.service';
import { Todo } from '../../models/todo.model';

/** Waits for pending microtasks (e.g. the constructor's async reload) to settle. */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const TODAY = today();
const EARLIER_DATE = '2000-01-01'; // sicher vor "heute"

describe('TodosPage', () => {
  let fixture: ComponentFixture<TodosPage>;
  let storage: {
    getTodos: ReturnType<typeof vi.fn>;
    addTodo: ReturnType<typeof vi.fn>;
    setDone: ReturnType<typeof vi.fn>;
    setDate: ReturnType<typeof vi.fn>;
    deleteTodo: ReturnType<typeof vi.fn>;
    reorderTodos: ReturnType<typeof vi.fn>;
  };

  const todayOpenA: Todo = { id: 'a', text: 'Einkaufen', done: false, date: TODAY, createdAt: 'now', order: 2 };
  const todayOpenB: Todo = { id: 'b', text: 'Kochen', done: false, date: TODAY, createdAt: 'now', order: 1 };
  const earlierOpen: Todo = {
    id: 'c',
    text: 'Steuererklärung',
    done: false,
    date: EARLIER_DATE,
    createdAt: 'old',
    order: 1,
  };
  const doneToday: Todo = { id: 'd', text: 'Mails beantworten', done: true, date: TODAY, createdAt: 'now', order: 1 };
  const doneEarlier: Todo = {
    id: 'e',
    text: 'Altes erledigt',
    done: true,
    date: EARLIER_DATE,
    createdAt: 'old',
    order: 2,
  };
  const allTodos = [todayOpenA, todayOpenB, earlierOpen, doneToday, doneEarlier];

  beforeEach(() => {
    storage = {
      getTodos: vi.fn().mockResolvedValue(allTodos),
      addTodo: vi.fn(),
      setDone: vi.fn(),
      setDate: vi.fn(),
      deleteTodo: vi.fn().mockResolvedValue(undefined),
      reorderTodos: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: TodoStorageService, useValue: storage }],
    });

    fixture = TestBed.createComponent(TodosPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads all todos on creation', async () => {
    await flushPromises();

    expect(storage.getTodos).toHaveBeenCalled();
    expect(fixture.componentInstance.todos()).toEqual(allTodos);
  });

  it("splits today's open todos into their own section, sorted by order", async () => {
    await flushPromises();

    expect(fixture.componentInstance.todayOpenTodos()).toEqual([todayOpenB, todayOpenA]);
  });

  it('keeps still-open todos from earlier days in a separate section instead of dropping them', async () => {
    await flushPromises();

    expect(fixture.componentInstance.earlierOpenTodos()).toEqual([earlierOpen]);
  });

  it('groups done todos from any day together, sorted by order', async () => {
    await flushPromises();

    expect(fixture.componentInstance.doneTodos()).toEqual([doneToday, doneEarlier]);
  });

  it('renders a row per todo, across all three sections', async () => {
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-todo-item').length).toBe(allTodos.length);
  });

  it('shows a hint when nothing is open today', async () => {
    storage.getTodos.mockResolvedValue([doneToday]);
    fixture = TestBed.createComponent(TodosPage);
    fixture.detectChanges();
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nichts mehr offen.');
  });

  it('hides the "Frühere" and "Erledigt" sections when there is nothing in them', async () => {
    storage.getTodos.mockResolvedValue([todayOpenA]);
    fixture = TestBed.createComponent(TodosPage);
    fixture.detectChanges();
    await flushPromises();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).not.toContain('Frühere, noch offene Todos');
    expect(text).not.toContain('Erledigt');
  });

  it('adds a todo for today, clears the input and reloads', async () => {
    await flushPromises();
    const created: Todo = { id: 'f', text: 'Neu', done: false, date: TODAY, createdAt: 'now', order: 3 };
    storage.addTodo.mockResolvedValue(created);
    storage.getTodos.mockResolvedValue([...allTodos, created]);
    fixture.componentInstance.newTodoText.set('Neu');

    await fixture.componentInstance.addTodo();

    expect(storage.addTodo).toHaveBeenCalledWith({ text: 'Neu', date: TODAY });
    expect(fixture.componentInstance.newTodoText()).toBe('');
    expect(fixture.componentInstance.todos()).toEqual([...allTodos, created]);
  });

  it('does not add a todo when the input is blank', async () => {
    await flushPromises();
    fixture.componentInstance.newTodoText.set('   ');

    await fixture.componentInstance.addTodo();

    expect(storage.addTodo).not.toHaveBeenCalled();
  });

  it('toggles a todo and reloads', async () => {
    await flushPromises();
    storage.setDone.mockResolvedValue({ ...todayOpenA, done: true });

    await fixture.componentInstance.onToggle(todayOpenA);

    expect(storage.setDone).toHaveBeenCalledWith('a', true);
    expect(storage.getTodos).toHaveBeenCalledTimes(2);
  });

  it('deletes a todo and reloads', async () => {
    await flushPromises();
    storage.getTodos.mockResolvedValue(allTodos.filter((todo) => todo.id !== 'a'));

    await fixture.componentInstance.onRemove(todayOpenA);

    expect(storage.deleteTodo).toHaveBeenCalledWith('a');
    expect(fixture.componentInstance.todos()).toEqual(allTodos.filter((todo) => todo.id !== 'a'));
  });

  it('reschedules an earlier todo to today and reloads', async () => {
    await flushPromises();
    storage.setDate.mockResolvedValue({ ...earlierOpen, date: TODAY });
    storage.getTodos.mockResolvedValue(allTodos.map((todo) => (todo.id === 'c' ? { ...todo, date: TODAY } : todo)));

    await fixture.componentInstance.onMoveToToday(earlierOpen);

    expect(storage.setDate).toHaveBeenCalledWith('c', TODAY);
    expect(fixture.componentInstance.todayOpenTodos().some((todo) => todo.id === 'c')).toBe(true);
    expect(fixture.componentInstance.earlierOpenTodos().some((todo) => todo.id === 'c')).toBe(false);
  });

  it('offers "move to today" only for todos in the earlier-open section', async () => {
    await flushPromises();
    fixture.detectChanges();

    const moveIcons = fixture.nativeElement.querySelectorAll('ion-icon[name="today-outline"]');
    expect(moveIcons.length).toBe(1);
  });

  it('persists a drag-and-drop reorder and reloads', async () => {
    await flushPromises();
    const reordered = [todayOpenA, todayOpenB];
    const complete = vi.fn().mockReturnValue(reordered);

    await fixture.componentInstance.onReorder({ detail: { complete } } as never, [todayOpenB, todayOpenA]);

    expect(complete).toHaveBeenCalledWith([todayOpenB, todayOpenA]);
    expect(storage.reorderTodos).toHaveBeenCalledWith(['a', 'b']);
    expect(storage.getTodos).toHaveBeenCalledTimes(2);
  });

  it('reloads when the page becomes active again (e.g. after a todo was deleted on another tab)', async () => {
    await flushPromises();
    storage.getTodos.mockResolvedValue([todayOpenA]);

    fixture.componentInstance.ionViewWillEnter();
    await flushPromises();

    expect(fixture.componentInstance.todos()).toEqual([todayOpenA]);
  });

  describe('loading state', () => {
    /** Lets a test hold `storage.getTodos()` unresolved to inspect the in-between loading state. */
    function makeDeferredTodos(): { resolve: (todos: Todo[]) => void } {
      let resolve!: (todos: Todo[]) => void;
      storage.getTodos.mockReturnValue(new Promise<Todo[]>((res) => (resolve = res)));
      return { resolve };
    }

    it('shows a spinner (not "nothing open") while storage is still loading for the first time', () => {
      const deferred = makeDeferredTodos();
      fixture = TestBed.createComponent(TodosPage);
      fixture.detectChanges();

      expect(fixture.componentInstance.loading()).toBe(true);
      expect(fixture.nativeElement.querySelector('ion-spinner')).not.toBeNull();
      expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Nichts mehr offen.');

      deferred.resolve([]);
    });

    it('stops loading and hides the spinner once the todos have been fetched', async () => {
      const deferred = makeDeferredTodos();
      fixture = TestBed.createComponent(TodosPage);
      fixture.detectChanges();

      deferred.resolve([]);
      await flushPromises();
      fixture.detectChanges();

      expect(fixture.componentInstance.loading()).toBe(false);
      expect(fixture.nativeElement.querySelector('ion-spinner')).toBeNull();
    });

    it('does not flash the spinner again on a later reload (e.g. a tab revisit)', async () => {
      await flushPromises();
      fixture.detectChanges();

      fixture.componentInstance.ionViewWillEnter();

      expect(fixture.componentInstance.loading()).toBe(false);
    });
  });
});
