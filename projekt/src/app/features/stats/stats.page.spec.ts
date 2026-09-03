import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsPage } from './stats.page';

describe('StatsPage', () => {
  let fixture: ComponentFixture<StatsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one progress row per habit', () => {
    const rows = fixture.nativeElement.querySelectorAll('app-habit-progress');
    expect(rows.length).toBe(fixture.componentInstance.stats().length);
  });

  it('derives the weekly completion from all goals together', () => {
    const component = fixture.componentInstance;
    component.stats.set([
      { habit: { id: 'a', title: 'A', icon: 'leaf-outline', weeklyGoal: 4 }, completed: 2 },
      { habit: { id: 'b', title: 'B', icon: 'leaf-outline', weeklyGoal: 6 }, completed: 3 },
    ]);
    expect(component.weeklyCompletionPercent()).toBe(50);
  });

  it('reports 0% when there are no habits', () => {
    const component = fixture.componentInstance;
    component.stats.set([]);
    expect(component.weeklyCompletionPercent()).toBe(0);
  });
});
