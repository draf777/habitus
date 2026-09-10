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
    order: 1,
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

  it('wraps the text instead of truncating it, via a plain ion-label next to the checkbox', () => {
    setup(todo);

    const label = fixture.nativeElement.querySelector('ion-label.todo-text');
    expect(label).not.toBeNull();
    expect(label.classList).toContain('ion-text-wrap');
    // The text lives in a sibling ion-label, not inside the checkbox itself,
    // which is what lets it wrap instead of being clipped by the checkbox's
    // own (fixed, ellipsis-truncating) label styling.
    expect(fixture.nativeElement.querySelector('ion-checkbox').textContent.trim()).toBe('');
  });

  it('renders a URL in the text as a clickable link', () => {
    setup({ ...todo, text: 'Siehe https://example.com' });

    const link = fixture.nativeElement.querySelector('ion-label.todo-text a');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('https://example.com');
  });

  it('emits toggled when the label text (not a link) is clicked', () => {
    setup(todo);
    const toggled = vi.fn();
    fixture.componentInstance.toggled.subscribe(toggled);

    fixture.nativeElement.querySelector('ion-label.todo-text').click();

    expect(toggled).toHaveBeenCalled();
  });

  it('does not toggle when a link inside the text is clicked', () => {
    setup({ ...todo, text: 'Siehe https://example.com' });
    const toggled = vi.fn();
    fixture.componentInstance.toggled.subscribe(toggled);

    fixture.nativeElement.querySelector('ion-label.todo-text a').click();

    expect(toggled).not.toHaveBeenCalled();
  });

  describe('on a mobile viewport', () => {
    it('renders a swipe-revealed delete option and a reorder handle, no always-visible button', () => {
      setup(todo, true);

      expect(fixture.nativeElement.querySelector('ion-item-sliding')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-item-option[aria-label*="löschen"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-button[aria-label*="löschen"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-reorder')).toBeTruthy();
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
    it('renders an always-visible delete button and a reorder handle instead of a swipe action', () => {
      setup(todo, false);

      expect(fixture.nativeElement.querySelector('ion-item-sliding')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-button[aria-label*="löschen"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-reorder')).toBeTruthy();
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
