import { Route } from '@angular/router';

import { DEFAULT_TAB, TABS } from './tabs.config';
import { routes } from './tabs.routes';

describe('tabs routes', () => {
  const tabsRoute = routes.find((route) => route.path === 'tabs') as Route;
  const children = tabsRoute.children ?? [];

  it('has a child route for every tab', () => {
    const paths = children.map((child) => child.path);
    for (const tab of TABS) {
      expect(paths).toContain(tab.path);
    }
  });

  it('lazily loads every tab page', () => {
    const tabPaths = TABS.map((tab) => tab.path);
    for (const child of children.filter((route) => tabPaths.includes(route.path ?? ''))) {
      expect(child.loadComponent).toBeDefined();
    }
  });

  it('redirects the empty path to the default tab', () => {
    const fallback = routes.find((route) => route.path === '');
    expect(fallback?.redirectTo).toBe(`/tabs/${DEFAULT_TAB}`);
  });
});
