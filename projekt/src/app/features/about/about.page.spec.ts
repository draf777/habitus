import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutPage } from './about.page';
import { APP_INFO } from '../../core/app-info';

describe('AboutPage', () => {
  let fixture: ComponentFixture<AboutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the project description and the author', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain(APP_INFO.description);
    expect(text).toContain(APP_INFO.author);
  });

  it('links to the README and to the repository', () => {
    const items = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('ion-item'));
    const hrefs = items.map((item) => (item as HTMLElement & { href?: string }).href);
    expect(hrefs).toContain(APP_INFO.readmeUrl);
    expect(hrefs).toContain(APP_INFO.repositoryUrl);
  });
});
