import { Routes } from '@angular/router';

import { authGuard } from '../core/guards/auth.guard';
import { DEFAULT_TAB } from './tabs.config';
import { TabsPage } from './tabs.page';

/**
 * Routes below the tab bar. Every tab is lazily loaded so a tab only costs
 * its own bundle; the paths must match `TABS` in `tabs.config.ts`.
 *
 * `authGuard` is applied once on the parent `tabs` route, which gates every
 * child (and the redirects into them) in a single place.
 */
export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      {
        path: 'heute',
        loadComponent: () => import('../features/today/today.page').then((m) => m.TodayPage),
      },
      {
        path: 'statistik',
        loadComponent: () => import('../features/stats/stats.page').then((m) => m.StatsPage),
      },
      {
        path: 'todos',
        loadComponent: () => import('../features/todos/todos.page').then((m) => m.TodosPage),
      },
      {
        path: 'notizen',
        loadComponent: () => import('../features/notes/notes.page').then((m) => m.NotesPage),
      },
      {
        path: 'ueber',
        loadComponent: () => import('../features/about/about.page').then((m) => m.AboutPage),
      },
      {
        path: '',
        redirectTo: `/tabs/${DEFAULT_TAB}`,
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: `/tabs/${DEFAULT_TAB}`,
    pathMatch: 'full',
  },
];
