/** Static facts about the app, shown on the "Über" page. */
export const APP_INFO = {
  name: 'Habitus',
  version: '0.1.0',
  description:
    'Habitus hilft dir, tägliche Gewohnheiten durchzuziehen und einzelne Aufgaben nicht zu vergessen — ' +
    'alles in einer App, offline nutzbar und ohne Account.',
  author: 'David Roth',
  repositoryUrl: 'https://gitlab.santis-basis.ch/il24/335-david',
  readmeUrl: 'https://gitlab.santis-basis.ch/il24/335-david/-/blob/main/README.md',
} as const;

/** The technologies the app is built on, listed on the "Über" page. */
export const TECH_STACK: readonly { readonly name: string; readonly role: string }[] = [
  { name: 'Angular 22', role: 'Standalone Components, Signals' },
  { name: 'Ionic 9', role: 'UI-Komponenten und Tab-Navigation' },
  { name: 'Angular Service Worker', role: 'PWA: installierbar und offline-fähig' },
  { name: 'Vitest', role: 'Unit-Tests' },
  { name: 'GitLab CI/CD', role: 'Pipeline: test, build, deploy' },
];
