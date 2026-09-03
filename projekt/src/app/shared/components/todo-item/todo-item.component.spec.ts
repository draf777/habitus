import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoItemComponent } from './todo-item.component';
import { Todo } from '../../../core/models/todo.model';

describe('TodoItemComponent', () => {
  let fixture: ComponentFixture<TodoItemComponent>;

  const todo: Todo = { id: 'shopping', title: 'Einkaufen gehen', done: false };

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoItemComponent);
    fixture.componentRef.setInput('todo', todo);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the task title', () => {
    expect(fixture.nativeElement.textContent).toContain('Einkaufen gehen');
  });

  it('strikes through a completed task', () => {
    fixture.componentRef.setInput('todo', { ...todo, done: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.todo-done')).not.toBeNull();
  });
});
