import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { Subject } from 'rxjs';

import { HabitItemComponent } from './habit-item.component';
import { Habit } from '../../../models/habit.model';

/** Stand-in for Ionic's Platform service, so tests control mobile/desktop without touching the real window. */
class FakePlatform {
  readonly resize = new Subject<void>();
  constructor(public mobile: boolean) {}
  is(name: string): boolean {
    return name === 'mobile' && this.mobile;
  }
}

describe('HabitItemComponent', () => {
  let fixture: ComponentFixture<HabitItemComponent>;

  /** Defaults to a mobile viewport, since most tests exercise content shared by both layouts. */
  function setup(habit: Habit, value = 0, mobile = true): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: Platform, useValue: new FakePlatform(mobile) }],
    });
    fixture = TestBed.createComponent(HabitItemComponent);
    fixture.componentRef.setInput('habit', habit);
    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();
  }

  it('should create', () => {
    setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the habit name and goal with its unit for a tracked habit', () => {
    setup({
      id: 'lesen',
      name: 'Lesen',
      type: 'duration_min',
      goal: 20,
      createdAt: '2026-09-04T00:00:00.000Z',
    });

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Lesen');
    expect(text).toContain('Ziel: 20 Minuten');
  });

  it('renders a check button for a boolean habit and emits 1/0 when it changes', () => {
    setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' }, 0);

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    const checkButton = fixture.nativeElement.querySelector('ion-button[aria-label*="erledigt"]');
    expect(checkButton).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ion-input')).toBeNull();

    fixture.componentInstance.onCheckedChange(true);
    expect(emitted).toEqual([1]);
  });

  it('toggles the check button off when it is already checked', () => {
    setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' }, 1);

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    fixture.nativeElement.querySelector('ion-button[aria-label*="erledigt"]').click();
    expect(emitted).toEqual([0]);
  });

  it('renders a number input for a tracked habit and emits the parsed value', () => {
    setup({ id: 'lesen', name: 'Lesen', type: 'count', goal: 3, createdAt: '2026-09-04T00:00:00.000Z' }, 1);

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    expect(fixture.nativeElement.querySelector('ion-input')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ion-button[aria-label*="erledigt"]')).toBeNull();

    fixture.componentInstance.onNumberChange('2');
    expect(emitted).toEqual([2]);
  });

  it('falls back to 0 for an invalid or negative number', () => {
    setup({ id: 'lesen', name: 'Lesen', type: 'count', goal: 3, createdAt: '2026-09-04T00:00:00.000Z' });

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    fixture.componentInstance.onNumberChange('abc');
    fixture.componentInstance.onNumberChange(-5);
    expect(emitted).toEqual([0, 0]);
  });

  it('accepts a decimal value typed directly, e.g. for litres of water', () => {
    setup({ id: 'wasser', name: 'Wasser', type: 'count', goal: 3, createdAt: '2026-09-04T00:00:00.000Z' });

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    fixture.componentInstance.onNumberChange('2.5');
    expect(emitted).toEqual([2.5]);
  });

  it('nudges the value up/down by 1 when the habit has no custom step', () => {
    setup({ id: 'lesen', name: 'Lesen', type: 'duration_min', goal: 20, createdAt: '2026-09-04T00:00:00.000Z' }, 10);

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    fixture.componentInstance.nudge(1);
    expect(emitted).toEqual([11]);
  });

  it('nudges by the habit\'s custom step when one is set', () => {
    setup(
      { id: 'schritte', name: 'Schritte', type: 'count', goal: 10000, step: 100, createdAt: '2026-09-04T00:00:00.000Z' },
      9800,
    );

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    fixture.componentInstance.nudge(1);
    expect(emitted).toEqual([9900]);
  });

  it('shows the custom unit instead of the type default when one is set', () => {
    setup({
      id: 'wasser',
      name: 'Wasser',
      type: 'count',
      goal: 2.5,
      unit: 'Liter',
      createdAt: '2026-09-04T00:00:00.000Z',
    });

    expect(fixture.nativeElement.textContent).toContain('Ziel: 2.5 Liter');
  });

  it('shows the weekly progress when the habit has a weeklyGoal', () => {
    setup({ id: 'gym', name: 'Gym', type: 'boolean', weeklyGoal: 4, createdAt: '2026-09-04T00:00:00.000Z' });
    fixture.componentRef.setInput('weeklyProgress', { done: 2, goal: 4 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('2 / 4x diese Woche');
  });

  it('does not nudge below 0', () => {
    setup({ id: 'lesen', name: 'Lesen', type: 'count', goal: 3, createdAt: '2026-09-04T00:00:00.000Z' }, 0);

    const emitted: number[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    fixture.componentInstance.nudge(-1);
    expect(emitted).toEqual([0]);
  });

  it('renders +/- stepper buttons for a tracked habit', () => {
    setup({ id: 'lesen', name: 'Lesen', type: 'count', goal: 3, createdAt: '2026-09-04T00:00:00.000Z' });

    expect(fixture.nativeElement.querySelectorAll('.habit-item__nudge').length).toBe(2);
  });

  it('uses the fallback icon when the habit has none, and the chosen one otherwise', () => {
    setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' });
    const icon = fixture.nativeElement.querySelector('ion-icon') as HTMLElement & { name?: string };
    expect(icon.name).toBe('ellipse-outline');

    setup({
      id: 'sport',
      name: 'Sport',
      type: 'boolean',
      icon: 'barbell-outline',
      createdAt: '2026-09-04T00:00:00.000Z',
    });
    const iconWithHabitIcon = fixture.nativeElement.querySelector('ion-icon') as HTMLElement & { name?: string };
    expect(iconWithHabitIcon.name).toBe('barbell-outline');
  });

  describe('on a mobile viewport', () => {
    it('renders swipe-revealed edit and delete options, no always-visible buttons', () => {
      setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' }, 0, true);

      expect(fixture.nativeElement.querySelector('ion-item-sliding')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-item-option[aria-label*="bearbeiten"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-item-option[aria-label*="löschen"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-button[aria-label*="bearbeiten"]')).toBeNull();
    });

    it('emits edit and closes the sliding item when the swipe edit action fires', () => {
      setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' }, 0, true);

      const edited = vi.fn();
      fixture.componentInstance.edit.subscribe(edited);
      const closed = vi.fn().mockResolvedValue(undefined);

      fixture.componentInstance.onSwipeEdit({ close: closed } as never);

      expect(edited).toHaveBeenCalled();
      expect(closed).toHaveBeenCalled();
    });

    it('emits remove and closes the sliding item when the swipe delete action fires', () => {
      setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' }, 0, true);

      const removed = vi.fn();
      fixture.componentInstance.remove.subscribe(removed);
      const closed = vi.fn().mockResolvedValue(undefined);

      fixture.componentInstance.onSwipeRemove({ close: closed } as never);

      expect(removed).toHaveBeenCalled();
      expect(closed).toHaveBeenCalled();
    });
  });

  describe('on a desktop viewport', () => {
    it('renders always-visible edit/delete buttons instead of swipe actions', () => {
      setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' }, 0, false);

      expect(fixture.nativeElement.querySelector('ion-item-sliding')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-button[aria-label*="bearbeiten"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-button[aria-label*="löschen"]')).toBeTruthy();
    });

    it('emits edit when the edit button is clicked', () => {
      setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' }, 0, false);

      const edited = vi.fn();
      fixture.componentInstance.edit.subscribe(edited);

      fixture.nativeElement.querySelector('ion-button[aria-label*="bearbeiten"]').click();
      expect(edited).toHaveBeenCalled();
    });

    it('emits remove when the delete button is clicked', () => {
      setup({ id: 'meditation', name: 'Meditation', type: 'boolean', createdAt: '2026-09-04T00:00:00.000Z' }, 0, false);

      const removed = vi.fn();
      fixture.componentInstance.remove.subscribe(removed);

      fixture.nativeElement.querySelector('ion-button[aria-label*="löschen"]').click();
      expect(removed).toHaveBeenCalled();
    });
  });

  it('switches from desktop to mobile layout when the platform resizes', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: Platform, useValue: new FakePlatform(false) }],
    });
    fixture = TestBed.createComponent(HabitItemComponent);
    fixture.componentRef.setInput('habit', {
      id: 'meditation',
      name: 'Meditation',
      type: 'boolean',
      createdAt: '2026-09-04T00:00:00.000Z',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ion-item-sliding')).toBeNull();

    const platform = TestBed.inject(Platform) as unknown as FakePlatform;
    platform.mobile = true;
    platform.resize.next();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('ion-item-sliding')).toBeTruthy();
  });
});
