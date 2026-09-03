/** One entry of the tab bar. */
export interface TabDefinition {
  /** Route segment below `/tabs`, also used as the tab id. */
  readonly path: string;
  /** Label under the icon. */
  readonly label: string;
  /** Ionicons icon name. */
  readonly icon: string;
}

/**
 * The tabs of the app, in the order they appear in the bar.
 *
 * `tabs.page.html` renders this list and `tabs.routes.ts` derives the child
 * routes from it, so a new tab only has to be added here plus a lazy route.
 */
export const TABS: readonly TabDefinition[] = [
  { path: 'heute', label: 'Heute', icon: 'today-outline' },
  { path: 'statistik', label: 'Statistik', icon: 'bar-chart-outline' },
  { path: 'todos', label: 'Todos', icon: 'checkbox-outline' },
  { path: 'ueber', label: 'Über', icon: 'information-circle-outline' },
];

/** The tab the app opens on. */
export const DEFAULT_TAB = TABS[0].path;
