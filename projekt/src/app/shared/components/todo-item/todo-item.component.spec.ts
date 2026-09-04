import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { Subject } from 'rxjs';

import { TodoItemComponent } from './todo-item.component';
import { Todo } from '../../../models/todo.model';

/** Stand-in for Ionic's Platform service, so tests control mobile/desktop without touching the real window. */
class FakePlatform {
  readonly resize = new Subject<void>();
  constructor(public mobile: boolean) {}
  is(name: string): boolean {
    return name === 'mobile' && this.mobile;
  }
}

describe('TodoItemComponent', () => {
  let fixture: ComponentFixture<TodoItemComponent>;

  const todo: Todo = {
    id: 'shopping',
    text: 'Einkaufen gehen',
    done: false,
    date: '2026-09-04',
    createdAt: '2026-09-04T00:00:00.000Z',
  };

  function setup(value: Todo, mobile = true): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: Platform, useValue: new FakePlatform(mobile) }],
    });
    fixture = TestBed.createComponent(TodoItemComponent);
    fixture.componentRef.setInput('todo', value);
    fixture.detectChanges();
  }

  it('should create', () => {
    setup(todo);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the task text', () => {
    setup(todo);
    expect(fixture.nativeElement.textContent).toContain('Einkaufen gehen');
  });

  it('strikes through a completed task', () => {
    setup({ ...todo, done: true });
    expect(fixture.nativeElement.querySelector('.todo-done')).not.toBeNull();
  });

  it('emits toggled when the checkbox changes', () => {
    setup(todo);
    const toggled = vi.fn();
    fixture.componentInstance.toggled.subscribe(toggled);

    fixture.nativeElement.querySelector('ion-checkbox').dispatchEvent(new CustomEvent('ionChange'));

    expect(toggled).toHaveBeenCalled();
  });

  describe('on a mobile viewport', () => {
    it('renders a swipe-revealed delete option, no always-visible button', () => {
      setup(todo, true);

      expect(fixture.nativeElement.querySelector('ion-item-sliding')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-item-option[aria-label*="löschen"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-button[aria-label*="löschen"]')).toBeNull();
    });

    it('emits remove and closes the sliding item when the swipe delete action fires', () => {
      setup(todo, true);

      const removed = vi.fn();
      fixture.componentInstance.remove.subscribe(removed);
      const closed = vi.fn().mockResolvedValue(undefined);

      fixture.componentInstance.onSwipeRemove({ close: closed } as never);

      expect(removed).toHaveBeenCalled();
      expect(closed).toHaveBeenCalled();
    });
  });

  describe('on a desktop viewport', () => {
    it('renders an always-visible delete button instead of a swipe action', () => {
      setup(todo, false);

      expect(fixture.nativeElement.querySelector('ion-item-sliding')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-button[aria-label*="löschen"]')).toBeTruthy();
    });

    it('emits remove when the delete button is clicked', () => {
      setup(todo, false);

      const removed = vi.fn();
      fixture.componentInstance.remove.subscribe(removed);

      fixture.nativeElement.querySelector('ion-button[aria-label*="löschen"]').click();
      expect(removed).toHaveBeenCalled();
    });
  });
});
