import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { Subject } from 'rxjs';

import { NoteItemComponent } from './note-item.component';
import { Note } from '../../../models/note.model';

/** Stand-in for Ionic's Platform service, so tests control mobile/desktop without touching the real window. */
class FakePlatform {
  readonly resize = new Subject<void>();
  constructor(public mobile: boolean) {}
  is(name: string): boolean {
    return name === 'mobile' && this.mobile;
  }
}

describe('NoteItemComponent', () => {
  let fixture: ComponentFixture<NoteItemComponent>;

  const note: Note = {
    id: 'n1',
    title: 'Einkaufsliste',
    content: 'Milch, Brot\n- Käse\n- Butter',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-11T00:00:00.000Z',
  };

  function setup(value: Note, mobile = true): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: Platform, useValue: new FakePlatform(mobile) }],
    });
    fixture = TestBed.createComponent(NoteItemComponent);
    fixture.componentRef.setInput('note', value);
    fixture.detectChanges();
  }

  it('should create', () => {
    setup(note);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the title and the first line of the content as a preview', () => {
    setup(note);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Einkaufsliste');
    expect(text).toContain('Milch, Brot');
    expect(text).not.toContain('Käse');
  });

  it('shows the last-changed date', () => {
    setup(note);
    expect(fixture.nativeElement.textContent).toMatch(/\d{2}\.\d{2}\.2026/);
  });

  it('emits open when the row is tapped', () => {
    setup(note);
    const opened = vi.fn();
    fixture.componentInstance.open.subscribe(opened);

    fixture.nativeElement.querySelector('ion-item').click();

    expect(opened).toHaveBeenCalledTimes(1);
  });

  describe('on a mobile viewport', () => {
    it('renders a swipe-revealed delete option, no always-visible button', () => {
      setup(note, true);

      expect(fixture.nativeElement.querySelector('ion-item-sliding')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-item-option[aria-label*="löschen"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-button[aria-label*="löschen"]')).toBeNull();
    });

    it('emits remove and closes the sliding item when the swipe delete action fires', () => {
      setup(note, true);

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
      setup(note, false);

      expect(fixture.nativeElement.querySelector('ion-item-sliding')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-button[aria-label*="löschen"]')).toBeTruthy();
    });

    it('emits remove when the delete button is clicked, without also opening the note', () => {
      setup(note, false);

      const removed = vi.fn();
      const opened = vi.fn();
      fixture.componentInstance.remove.subscribe(removed);
      fixture.componentInstance.open.subscribe(opened);

      fixture.nativeElement.querySelector('ion-button[aria-label*="löschen"]').click();

      expect(removed).toHaveBeenCalled();
      expect(opened).not.toHaveBeenCalled();
    });
  });
});
