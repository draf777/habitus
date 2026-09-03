import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TABS } from './tabs.config';
import { TabsPage } from './tabs.page';

describe('TabsPage', () => {
  let fixture: ComponentFixture<TabsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a button for every tab', () => {
    const buttons = fixture.nativeElement.querySelectorAll('ion-tab-button');
    expect(buttons.length).toBe(TABS.length);
  });

  it('labels the tabs Heute, Statistik, Todos and Über', () => {
    const labels = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('ion-tab-button ion-label')).map(
      (label) => label.textContent?.trim(),
    );
    expect(labels).toEqual(['Heute', 'Statistik', 'Todos', 'Über']);
  });
});
