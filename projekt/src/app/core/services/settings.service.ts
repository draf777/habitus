import { Injectable, inject, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { ColorScheme, Settings, Theme } from '../../models/settings.model';

const SETTINGS_KEY = 'settings';

/**
 * Holds and persists the user's appearance settings (light/dark/system theme,
 * accent color scheme) and applies them to the document.
 *
 * Applying is plain CSS: an `ion-palette-dark` class (Ionic's own dark-mode
 * switch, imported as `dark.class.css` so it no longer follows the OS
 * automatically) plus a `data-color-scheme` attribute that `variables.scss`
 * keys its color custom properties off. That means switching is instant and
 * needs no reload, unlike swapping Angular modules per theme would.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly storage = inject(Storage);
  private ready: Promise<unknown> | null = null;
  private readonly darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  /** The selected theme; `system` follows `darkMediaQuery`. */
  readonly theme = signal<Theme>('system');
  /** The selected accent color scheme. */
  readonly colorScheme = signal<ColorScheme>('ocean');

  constructor() {
    this.darkMediaQuery.addEventListener('change', () => {
      if (this.theme() === 'system') {
        this.applyToDocument();
      }
    });
  }

  private ensureReady(): Promise<unknown> {
    if (!this.ready) {
      this.ready = this.storage.create();
    }
    return this.ready;
  }

  /** Loads previously persisted settings, if any, and applies them. Call once at app start. */
  async load(): Promise<void> {
    await this.ensureReady();
    const stored = (await this.storage.get(SETTINGS_KEY)) as Settings | null;
    if (stored) {
      this.theme.set(stored.theme);
      this.colorScheme.set(stored.colorScheme);
    }
    this.applyToDocument();
  }

  /** Changes the theme, applies it immediately and persists the choice. */
  async setTheme(theme: Theme): Promise<void> {
    this.theme.set(theme);
    this.applyToDocument();
    await this.persist();
  }

  /** Changes the color scheme, applies it immediately and persists the choice. */
  async setColorScheme(colorScheme: ColorScheme): Promise<void> {
    this.colorScheme.set(colorScheme);
    this.applyToDocument();
    await this.persist();
  }

  private async persist(): Promise<void> {
    await this.ensureReady();
    const settings: Settings = { theme: this.theme(), colorScheme: this.colorScheme() };
    await this.storage.set(SETTINGS_KEY, settings);
  }

  /** Whether dark mode is currently in effect, resolving `system` against the OS setting. */
  private isDarkEffective(): boolean {
    return this.theme() === 'dark' || (this.theme() === 'system' && this.darkMediaQuery.matches);
  }

  private applyToDocument(): void {
    const dark = this.isDarkEffective();
    document.documentElement.classList.toggle('ion-palette-dark', dark);
    document.documentElement.setAttribute('data-color-scheme', this.colorScheme());
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1f1f1f' : '#ffffff');
  }
}
