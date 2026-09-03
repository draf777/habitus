import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosPage } from './todos.page';

describe('TodosPage', () => {
  let fixture: ComponentFixture<TodosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TodosPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('splits the tasks into open and done', () => {
    const component = fixture.componentInstance;
    component.todos.set([
      { id: 'a', title: 'A', done: false },
      { id: 'b', title: 'B', done: true },
      { id: 'c', title: 'C', done: false },
    ]);
    expect(component.openTodos().map((todo) => todo.id)).toEqual(['a', 'c']);
    expect(component.doneTodos().map((todo) => todo.id)).toEqual(['b']);
  });

  it('renders a row per task', () => {
    const rows = fixture.nativeElement.querySelectorAll('app-todo-item');
    expect(rows.length).toBe(fixture.componentInstance.todos().length);
  });

  it('shows a hint when nothing is open', () => {
    fixture.componentInstance.todos.set([{ id: 'a', title: 'A', done: true }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nichts mehr offen.');
  });
});
