import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayPage } from './today.page';

describe('TodayPage', () => {
  let fixture: ComponentFixture<TodayPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TodayPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one row per habit', () => {
    const rows = fixture.nativeElement.querySelectorAll('app-habit-item');
    expect(rows.length).toBe(fixture.componentInstance.entries().length);
  });

  it('counts the habits that are already done', () => {
    const component = fixture.componentInstance;
    const expected = component.entries().filter((entry) => entry.done).length;
    expect(component.doneCount()).toBe(expected);
  });
});
