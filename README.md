# Habitus

Habitus ist ein Habit-Tracker mit integrierter Todo-Liste: Du legst die Gewohnheiten fest, die du regelmässig durchziehen willst, hakst sie täglich ab und siehst auf einen Blick, wie gut deine Woche läuft — dazu eine einfache Liste für einmalige Aufgaben. Die App läuft als PWA im Browser, ist installierbar und braucht weder Account noch Backend.

![TODO: Screenshot](docs/screenshot.png)

> TODO: Screenshot der App einfügen (`docs/screenshot.png`).

## Status

Aktuelle Version: **v0.1.0** — lauffähiges Grundgerüst mit vier Tabs (Heute, Statistik, Todos, Über), PWA-Konfiguration und automatischem Deploy.

Was noch **nicht** funktioniert: "Heute", "Statistik" und "Todos" zeigen fest eingebaute Demo-Daten aus `projekt/src/app/core/data/`. Habits und Aufgaben lassen sich nicht abhaken, anlegen, bearbeiten oder löschen — die Checkboxen sind bewusst deaktiviert, und es gibt keine Persistenz. Jede dieser drei Seiten weist im UI selbst mit einem Hinweis-Banner darauf hin. Funktionsfähig sind bisher die Navigation, das Layout, die Über-Seite und die PWA-Installation.

Live: TODO: URL des Deployments eintragen.

## Tech-Stack

| Technologie | Wofür |
| --- | --- |
| [Angular 22](https://angular.dev) | Applikations-Framework, Standalone Components und Signals |
| [Ionic 9](https://ionicframework.com) | UI-Komponenten und Tab-Navigation |
| [Angular Service Worker](https://angular.dev/ecosystem/service-workers) | PWA: installierbar und offline-fähig |
| [Vitest](https://vitest.dev) | Unit-Tests (`ng test`, jsdom) |
| [ESLint](https://eslint.org) | Linting |
| GitLab CI/CD | Pipeline mit den Stages test, build und deploy |

## Projektstruktur

| Ordner | Inhalt |
| --- | --- |
| [`/projekt`](projekt/) | Die Angular-/Ionic-App inklusive [CHANGELOG](projekt/CHANGELOG.md) |
| [`/journal`](journal/journal.md) | Arbeitsjournal mit Entscheiden und Fortschritt |
| [`/store`](store/beschreibung.md) | Store-Beschreibung (Texte für die Veröffentlichung) |

Innerhalb von `/projekt/src/app`:

| Ordner | Inhalt |
| --- | --- |
| `core/` | Modelle (`Habit`, `Todo`), App-Infos und die aktuellen Demo-Daten |
| `features/` | Je eine Page pro Tab: `today`, `stats`, `todos`, `about` |
| `shared/components/` | Wiederverwendbare Bausteine (`habit-item`, `habit-progress`, `todo-item`, `demo-notice`) |
| `tabs/` | Tab-Bar, Tab-Konfiguration und Routing |

## Entwicklung

```bash
cd projekt
npm ci
npm start          # Dev-Server auf http://localhost:4200
npm run test:ci    # Unit-Tests einmalig ausführen
npm run lint       # Linting
npm run build      # Produktions-Build nach projekt/www
npm run serve:prod # Produktions-Build auf http://localhost:4400 ausliefern
npm run icons      # App-Icons aus dem SVG in scripts/generate-icons.mjs neu rendern
```

## PWA testen

Der Service Worker ist im Dev-Server bewusst deaktiviert (`enabled: !isDevMode()` in
[`src/main.ts`](projekt/src/main.ts)) — unter `localhost:4200` ist die App deshalb
**nicht** installierbar. Zum Testen der PWA braucht es den Produktions-Build:

```bash
npm run build
npm run serve:prod   # http://localhost:4400
```

Service Worker laufen nur in einem sicheren Kontext: `localhost` oder HTTPS. Über eine
reine `http://`-Adresse registriert sich der Worker nicht, und die App lässt sich dort
nicht installieren.

## Deployment

Die Pipeline in [`.gitlab-ci.yml`](.gitlab-ci.yml) läuft in drei Stages:

1. **test** — `npm ci` und `npm run test:ci`
2. **build** — `npm run build` (Produktions-Build nach `projekt/www`)
3. **deploy** — Upload des Build-Ergebnisses auf den Webserver

Die Pipeline wird manuell über die GitLab-Weboberfläche gestartet (`workflow: rules` lässt nur `web`-Pipelines zu).

## Autor

David Roth
