/** Light/dark mode: `system` follows the OS/browser setting. */
export type Theme = 'light' | 'dark' | 'system';

/** Accent color palette applied across the app. */
export type ColorScheme = 'ocean' | 'sunset';

/** The user's persisted appearance settings. */
export interface Settings {
  readonly theme: Theme;
  readonly colorScheme: ColorScheme;
}
