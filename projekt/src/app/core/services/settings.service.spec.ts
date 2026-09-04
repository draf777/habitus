import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';

import { SettingsService } from './settings.service';
import { Settings } from '../../models/settings.model';

/** In-memory stand-in for Ionic Storage, so tests don't need a real driver. */
class FakeStorage {
  private readonly store = new Map<string, unknown>();

  async create(): Promise<this> {
    return this;
  }

  async get(key: string): Promise<unknown> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
  }
}

/** Stand-in for `window.matchMedia('(prefers-color-scheme: dark)')`. */
class FakeMediaQueryList {
  private listener: (() => void) | undefined;
  constructor(public matches: boolean) {}
  addEventListener(_type: 'change', listener: () => void): void {
    this.listener = listener;
  }
  removeEventListener(): void {
    this.listener = undefined;
  }
  fireChange(matches: boolean): void {
    this.matches = matches;
    this.listener?.();
  }
}

describe('SettingsService', () => {
  let service: SettingsService;
  let media: FakeMediaQueryList;

  function setup(systemPrefersDark = false): void {
    media = new FakeMediaQueryList(systemPrefersDark);
    vi.spyOn(window, 'matchMedia').mockReturnValue(media as unknown as MediaQueryList);

    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-color-scheme');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [SettingsService, { provide: Storage, useClass: FakeStorage }],
    });
    service = TestBed.inject(SettingsService);
  }

  beforeEach(() => setup());

  afterEach(() => {
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-color-scheme');
    vi.restoreAllMocks();
  });

  it('defaults to system theme and the ocean color scheme', () => {
    expect(service.theme()).toBe('system');
    expect(service.colorScheme()).toBe('ocean');
  });

  it('loads previously persisted settings and applies them', async () => {
    const storage = TestBed.inject(Storage);
    await storage.set('settings', { theme: 'dark', colorScheme: 'sunset' } satisfies Settings);

    await service.load();

    expect(service.theme()).toBe('dark');
    expect(service.colorScheme()).toBe('sunset');
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-color-scheme')).toBe('sunset');
  });

  it('keeps the defaults when nothing was persisted yet', async () => {
    await service.load();

    expect(service.theme()).toBe('system');
    expect(document.documentElement.getAttribute('data-color-scheme')).toBe('ocean');
  });

  it('applies and persists an explicit light theme', async () => {
    await service.setTheme('light');

    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(false);
    const storage = TestBed.inject(Storage);
    expect(await storage.get('settings')).toEqual({ theme: 'light', colorScheme: 'ocean' });
  });

  it('applies and persists an explicit dark theme', async () => {
    await service.setTheme('dark');

    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true);
    const storage = TestBed.inject(Storage);
    expect(await storage.get('settings')).toEqual({ theme: 'dark', colorScheme: 'ocean' });
  });

  it('resolves the system theme against the OS preference', async () => {
    setup(true);
    await service.setTheme('system');

    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true);
  });

  it('reacts to the OS preference changing while on the system theme', async () => {
    await service.setTheme('system');
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(false);

    media.fireChange(true);

    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true);
  });

  it('ignores the OS preference changing while on an explicit theme', async () => {
    await service.setTheme('light');

    media.fireChange(true);

    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(false);
  });

  it('applies and persists the color scheme', async () => {
    await service.setColorScheme('sunset');

    expect(document.documentElement.getAttribute('data-color-scheme')).toBe('sunset');
    const storage = TestBed.inject(Storage);
    expect(await storage.get('settings')).toEqual({ theme: 'system', colorScheme: 'sunset' });
  });
});
