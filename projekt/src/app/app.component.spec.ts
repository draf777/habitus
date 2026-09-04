import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './core/services/settings.service';

describe('AppComponent', () => {
  let versionUpdates: Subject<VersionEvent>;
  let toastCreate: ReturnType<typeof vi.fn>;
  let toastPresent: ReturnType<typeof vi.fn>;

  function setup(isEnabled: boolean): void {
    versionUpdates = new Subject<VersionEvent>();
    toastPresent = vi.fn().mockResolvedValue(undefined);
    toastCreate = vi.fn().mockResolvedValue({ present: toastPresent });

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: SettingsService, useValue: { load: () => Promise.resolve() } },
        { provide: SwUpdate, useValue: { isEnabled, versionUpdates } },
        { provide: ToastController, useValue: { create: toastCreate } },
      ],
    });
  }

  it('should create the app', () => {
    setup(false);
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('ignores service worker version events when the service worker is disabled', () => {
    setup(false);
    TestBed.createComponent(AppComponent);

    versionUpdates.next({ type: 'VERSION_READY' } as VersionEvent);

    expect(toastCreate).not.toHaveBeenCalled();
  });

  it('ignores version events other than VERSION_READY', () => {
    setup(true);
    TestBed.createComponent(AppComponent);

    versionUpdates.next({ type: 'VERSION_DETECTED', version: { hash: 'x' } } as VersionEvent);

    expect(toastCreate).not.toHaveBeenCalled();
  });

  it('offers to reload once a new version is ready', async () => {
    setup(true);
    TestBed.createComponent(AppComponent);

    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'old' },
      latestVersion: { hash: 'new' },
    } as VersionEvent);
    await Promise.resolve();

    expect(toastCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('neue Version'),
        buttons: [expect.objectContaining({ text: 'Neu laden', handler: expect.any(Function) })],
      }),
    );
    expect(toastPresent).toHaveBeenCalled();
  });
});
