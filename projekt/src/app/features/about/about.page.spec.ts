import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { AboutPage } from './about.page';
import { APP_INFO } from '../../core/app-info';
import { SettingsService } from '../../core/services/settings.service';

describe('AboutPage', () => {
  let fixture: ComponentFixture<AboutPage>;
  let settings: {
    theme: ReturnType<typeof signal<'light' | 'dark' | 'system'>>;
    colorScheme: ReturnType<typeof signal<'ocean' | 'sunset'>>;
    setTheme: ReturnType<typeof vi.fn>;
    setColorScheme: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    settings = {
      theme: signal('system'),
      colorScheme: signal('ocean'),
      setTheme: vi.fn().mockResolvedValue(undefined),
      setColorScheme: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: SettingsService, useValue: settings }],
    });

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

  it('changes the theme via the settings service', () => {
    fixture.componentInstance.onThemeChange('dark');
    expect(settings.setTheme).toHaveBeenCalledWith('dark');
  });

  it('changes the color scheme via the settings service', () => {
    fixture.componentInstance.onColorSchemeChange('sunset');
    expect(settings.setColorScheme).toHaveBeenCalledWith('sunset');
  });
});
