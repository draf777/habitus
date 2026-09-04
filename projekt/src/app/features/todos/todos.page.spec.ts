import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosPage } from './todos.page';
import { today } from '../../core/date.util';
import { TodoStorageService } from '../../core/services/todo-storage.service';
import { Todo } from '../../models/todo.model';

/** Waits for pending microtasks (e.g. the constructor's async reload) to settle. */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('TodosPage', () => {
  let fixture: ComponentFixture<TodosPage>;
  let storage: {
    getTodosForDate: ReturnType<typeof vi.fn>;
    addTodo: ReturnType<typeof vi.fn>;
    setDone: ReturnType<typeof vi.fn>;
    deleteTodo: ReturnType<typeof vi.fn>;
  };

  const openTodo: Todo = { id: 'a', text: 'Einkaufen', done: false, date: today(), createdAt: 'now' };
  const doneTodo: Todo = { id: 'b', text: 'Mails beantworten', done: true, date: today(), createdAt: 'now' };

  beforeEach(() => {
    storage = {
      getTodosForDate: vi.fn().mockResolvedValue([openTodo, doneTodo]),
      addTodo: vi.fn(),
      setDone: vi.fn(),
      deleteTodo: vi.fn().mockResolvedValue(undefined),
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

  it("loads today's todos on creation", async () => {
    await flushPromises();

    expect(storage.getTodosForDate).toHaveBeenCalledWith(today());
    expect(fixture.componentInstance.todos()).toEqual([openTodo, doneTodo]);
  });

  it('splits the tasks into open and done', async () => {
    await flushPromises();

    expect(fixture.componentInstance.openTodos()).toEqual([openTodo]);
    expect(fixture.componentInstance.doneTodos()).toEqual([doneTodo]);
  });

  it('shows a hint when nothing is open', async () => {
    storage.getTodosForDate.mockResolvedValue([doneTodo]);
    fixture = TestBed.createComponent(TodosPage);
    fixture.detectChanges();
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nichts mehr offen.');
  });

  it('renders a row per task', async () => {
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-todo-item').length).toBe(2);
  });

  it('adds a todo for today, clears the input and reloads', async () => {
    await flushPromises();
    const created: Todo = { id: 'c', text: 'Neu', done: false, date: today(), createdAt: 'now' };
    storage.addTodo.mockResolvedValue(created);
    storage.getTodosForDate.mockResolvedValue([openTodo, doneTodo, created]);
    fixture.componentInstance.newTodoText.set('Neu');

    await fixture.componentInstance.addTodo();

    expect(storage.addTodo).toHaveBeenCalledWith({ text: 'Neu', date: today() });
    expect(fixture.componentInstance.newTodoText()).toBe('');
    expect(fixture.componentInstance.todos()).toEqual([openTodo, doneTodo, created]);
  });

  it('does not add a todo when the input is blank', async () => {
    await flushPromises();
    fixture.componentInstance.newTodoText.set('   ');

    await fixture.componentInstance.addTodo();

    expect(storage.addTodo).not.toHaveBeenCalled();
  });

  it('toggles a todo and reloads', async () => {
    await flushPromises();
    storage.setDone.mockResolvedValue({ ...openTodo, done: true });

    await fixture.componentInstance.onToggle(openTodo);

    expect(storage.setDone).toHaveBeenCalledWith('a', true);
    expect(storage.getTodosForDate).toHaveBeenCalledTimes(2);
  });

  it('deletes a todo and reloads', async () => {
    await flushPromises();
    storage.getTodosForDate.mockResolvedValue([doneTodo]);

    await fixture.componentInstance.onRemove(openTodo);

    expect(storage.deleteTodo).toHaveBeenCalledWith('a');
    expect(fixture.componentInstance.todos()).toEqual([doneTodo]);
  });
});
