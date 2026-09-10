import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AlertController } from '@ionic/angular';

import { AboutPage } from './about.page';
import { APP_INFO } from '../../core/app-info';
import { DemoDataService } from '../../core/services/demo-data.service';
import { SettingsService } from '../../core/services/settings.service';

/** Waits for pending microtasks (e.g. the constructor's async reload) to settle. */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('AboutPage', () => {
  let fixture: ComponentFixture<AboutPage>;
  let settings: {
    theme: ReturnType<typeof signal<'light' | 'dark' | 'system'>>;
    colorScheme: ReturnType<typeof signal<'ocean' | 'sunset'>>;
    setTheme: ReturnType<typeof vi.fn>;
    setColorScheme: ReturnType<typeof vi.fn>;
  };
  let demoData: { hasDemoData: ReturnType<typeof vi.fn>; clearDemoData: ReturnType<typeof vi.fn> };
  /** The role returned by the confirm alert once dismissed; set per test. */
  let alertDismissRole: string | undefined;

  beforeEach(() => {
    settings = {
      theme: signal('system'),
      colorScheme: signal('ocean'),
      setTheme: vi.fn().mockResolvedValue(undefined),
      setColorScheme: vi.fn().mockResolvedValue(undefined),
    };
    demoData = {
      hasDemoData: vi.fn().mockResolvedValue(true),
      clearDemoData: vi.fn().mockResolvedValue(undefined),
    };
    alertDismissRole = 'cancel';

    TestBed.configureTestingModule({
      providers: [
        { provide: SettingsService, useValue: settings },
        { provide: DemoDataService, useValue: demoData },
        {
          provide: AlertController,
          useValue: {
            create: vi.fn().mockImplementation(() =>
              Promise.resolve({
                present: vi.fn().mockResolvedValue(undefined),
                onDidDismiss: () => Promise.resolve({ role: alertDismissRole }),
              }),
            ),
          },
        },
      ],
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

  it('does not link to the README or the repository', () => {
    const items = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('ion-item'));
    const hrefs = items.map((item) => (item as HTMLElement & { href?: string }).href).filter(Boolean);
    expect(hrefs).toEqual([]);
  });

  it('changes the theme via the settings service', () => {
    fixture.componentInstance.onThemeChange('dark');
    expect(settings.setTheme).toHaveBeenCalledWith('dark');
  });

  it('changes the color scheme via the settings service', () => {
    fixture.componentInstance.onColorSchemeChange('sunset');
    expect(settings.setColorScheme).toHaveBeenCalledWith('sunset');
  });

  it('shows whether demo data still exists on creation', async () => {
    await flushPromises();

    expect(fixture.componentInstance.hasDemoData()).toBe(true);
  });

  it('does not clear demo data when the confirmation is cancelled', async () => {
    await flushPromises();
    alertDismissRole = 'cancel';

    await fixture.componentInstance.confirmClearDemoData();

    expect(demoData.clearDemoData).not.toHaveBeenCalled();
  });

  it('clears demo data and refreshes once the confirmation is accepted', async () => {
    await flushPromises();
    alertDismissRole = 'destructive';
    demoData.hasDemoData.mockResolvedValue(false);

    await fixture.componentInstance.confirmClearDemoData();

    expect(demoData.clearDemoData).toHaveBeenCalled();
    expect(fixture.componentInstance.hasDemoData()).toBe(false);
  });

  it('reloads whether demo data exists when the page becomes active again', async () => {
    await flushPromises();
    demoData.hasDemoData.mockResolvedValue(false);

    fixture.componentInstance.ionViewWillEnter();
    await flushPromises();

    expect(fixture.componentInstance.hasDemoData()).toBe(false);
  });
});
