# Changelog

Alle nennenswerten Änderungen an diesem Projekt. Neueste Version zuoberst.

## [0.2.0] - 2026-09-04

Aktuelle Version.

### Added

- Datenmodell (Habit, HabitEntry, Todo) + Ionic-Storage-Service
- "Neues Habit"-Formular mit Validierung (Name, Typ, Tagesziel)
- Tageseingabe pro Habit-Typ (Minuten/Stunden/Anzahl/Ja-Nein), persistiert
- Habit löschen
- Erste Unit-Tests (Storage-Service, Formular-Validatoren)

## [0.1.0] - 2026-09-03

### Added

- Projekt-Grundgerüst (Angular/Ionic, standalone) mit 4 Tabs erstellt
- PWA-Grundkonfiguration inkl. eigenem Icon
- GitLab-CI-Pipeline (test-build-deploy) eingerichtet
- Über-Seite mit Projektbeschreibung und Eintrag "Status"
- Hinweis-Banner auf "Heute", "Statistik" und "Todos": zeigt an, dass dort Demo-Daten stehen

### Changed

- Statusleiste folgt dem Farbmodus (hell/dunkel)

### Removed

- Capacitor entfernt, App läuft rein als PWA

### Fixed

- Vitest-Globals in der Root-tsconfig angemeldet
