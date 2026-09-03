# Arbeitsjournal — Habitus

## 3.9., 08:55

* Projekt-Setup: Ionic/Angular-Standalone-App mit 4 Tabs (Heute, Statistik, Todos, Über) erstellt.
* Entscheidung Persistenz: Ionic Storage (IndexedDB) statt Capacitor SQLite oder Firebase, weil es ohne Zusatz-Setup im Web/PWA läuft und kein Backend/Account braucht.
* Entscheidung Deploy: GitLab CI (test-build-deploy) mit dem Vorgabe-Deploy-Job (SCP auf den Schulserver) statt GitLab Pages, weil der Vorgabe-Job im Repo bereits vorhanden und erprobt ist.
* Entscheidung Testing: Vitest mit jsdom (der Standard des Angular-22-Test-Builders), weil ohne Zusatzkonfiguration lauffähig und ohne Browser in der Pipeline ausführbar.
* PWA-Grundkonfiguration inkl. eigenem Icon gesetzt.
* v0.1.0 getaggt, Pipeline grün, App live.

