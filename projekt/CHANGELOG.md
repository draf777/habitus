# Changelog

Alle nennenswerten Änderungen an diesem Projekt. Neueste Version zuoberst.

## [0.4.0] - 2026-09-10

Aktuelle Version.

### Added

- Statistik-Tab: Wochendiagramm pro Habit (ng2-charts)
- StatsService für Aggregationslogik inkl. Ja/Nein-Habits
- Charts folgen aktivem Farbschema/Theme
- Unit-Tests für StatsService
- App startet erstmalig mit zwei Beispiel-Habits (inkl. realistisch gefüllter letzter Woche samt laufendem Streak) und zwei Beispiel-Todos
- "Über" > "Daten": Demo-Daten lassen sich mit einem Klick vollständig löschen, ohne eigene Daten zu beeinflussen
- Statistik zeigt den aktuellen Streak (Tage am Stück) pro Habit
- Todos: Links im Text werden automatisch erkannt und sind klickbar
- Todos: per Drag & Drop frei sortierbar, Ziehpunkt direkt in der normalen Ansicht sichtbar (kein eigener Modus nötig)
- Todos-Tab in drei Abschnitte gegliedert: Heute, frühere noch offene Todos, Erledigt — frühere offene Todos verschwinden nicht mehr einfach

### Changed

- Todo-Text bricht jetzt um statt bei langen Texten abgeschnitten zu werden

### Fixed

- "Statistik", "Heute" und "Todos" zeigten teils veraltete Daten, wenn Habits/Todos auf einem anderen Tab geändert wurden, solange man nicht neu geladen hat

## [0.3.1] - 2026-09-04

### Added

- Todo-Tab: erfassen, abhaken, löschen, persistiert
- Light/Dark-Mode + zwei Farbschemen (Ocean, Sunset), Einstellung persistiert
- Responsives Layout für Tablet/Landscape geprüft
- Weitere Unit-Tests (Todo-Service, Settings-Service)

### Fixed

- Neue App-Version wurde zwar im Hintergrund geladen, aber nie aktiviert, solange die App offen blieb; jetzt Hinweis mit "Neu laden"-Option, sobald eine neue Version bereitsteht

## [0.2.0] - 2026-09-04

### Added

- Datenmodell (Habit, HabitEntry, Todo) + Ionic-Storage-Service
- "Neues Habit"-Formular mit Validierung (Name, Typ, Tagesziel)
- Tageseingabe pro Habit-Typ (Minuten/Stunden/Anzahl/Ja-Nein) mit +/- Buttons und direkt editierbarem Wert (auch Dezimalzahlen), persistiert
- Icon-Auswahl beim Anlegen eines Habits (25 vorgeschlagene Icons)
- "Heute" zeigt zwei Bereiche: "Noch offen" und "Erledigt"
- Meldung, sobald ein Habit sein Tagesziel erreicht
- Bestätigung vor dem Löschen eines Habits
- Habit bearbeiten (Typ und Häufigkeit danach nicht mehr änderbar)
- Häufigkeit "Täglich" oder "X-mal pro Woche" (z. B. "Gym, 3x pro Woche"); bei Wochen-Habits entfällt das Tagesziel
- Erweiterte Einstellungen beim Anlegen/Bearbeiten: eigene Schrittgrösse, eigene Einheit, Farbe
- Wochenfortschritt ("1 / 3x diese Woche") auf "Heute", bei Wochen-Habits
- Habit löschen
- Erste Unit-Tests (Storage-Service, Formular-Validatoren)

### Changed

- Zahlen-Eingabe: kein Browser-Spinner mehr, dafür überall direkt tippbare Zahlenfelder
- "Erweiterte Einstellungen" optisch an den Rest der App angeglichen (Karten-Look statt lose Felder)
- Ja/Nein-Habits: kompakter Kreis-Button zum Abhaken statt Toggle-Schalter/Checkbox
- Bearbeiten/Löschen: auf Touch-Geräten Wisch-Aktionen (nach links wischen, kein Versehen-Tippen, mehr Platz für den Namen); auf Geräten mit Maus weiterhin feste, sichtbare Buttons, da Wischen dort nicht nativ wirkt

### Fixed

- Farb-Auswahl war beim ersten Rendern kurz oval statt rund (Web-Component-Hydration-Timing)
- Grauer Streifen unter den "Erweiterte Einstellungen", wenn geöffnet
- "Abbrechen" und "Speichern" sahen unterschiedlich fett aus
- Zu wenig Abstand bei den Hinweisen "... kann nachträglich nicht mehr geändert werden."
- Abhaken-Button in App-Akzentfarbe statt generischem Grün, passt jetzt zum Rest der App

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
