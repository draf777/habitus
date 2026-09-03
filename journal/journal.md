# Arbeitsjournal — Habitus

## 3.9., Morgen

* Projekt-Setup: Ionic/Angular-Standalone-App mit 4 Tabs (Heute, Statistik, Todos, Über) erstellt.
* Entscheidung Persistenz: Ionic Storage (IndexedDB) statt Capacitor SQLite oder Firebase, weil es ohne Zusatz-Setup im Web/PWA läuft und kein Backend/Account braucht.
* Entscheidung Testing: Vitest mit jsdom (der Standard des Angular-22-Test-Builders), weil ohne Zusatzkonfiguration lauffähig und ohne Browser in der Pipeline ausführbar.
* PWA-Grundkonfiguration inkl. eigenem Icon gesetzt.
* v0.1.0 getaggt, Pipeline grün, App live.
* Einige Unit-Tests geschrieben.

## 3.9., Nachmittag

* Über-Seite überarbeitet: Technologie-Liste entfernt, dafür ausführlichere Beschreibung der App ergänzt.
* Statusleisten-Farbe (theme-color) reagiert jetzt per Media Query auf hell/dunkel, statt fix zu bleiben.