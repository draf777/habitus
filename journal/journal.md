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
* Hinweis-Banner ergänzt: die Seiten Heute, Statistik und Todos sagen jetzt selbst, dass sie Demo-Daten zeigen und das Abhaken/Speichern noch nicht funktioniert. Grund: eine deaktivierte Checkbox sieht sonst nach einem Bug aus statt nach einem noch nicht gebauten Feature.
* README, CHANGELOG und Store-Beschreibung entsprechend auf den tatsächlichen Funktionsumfang von v0.1.0 korrigiert.

## 4.9.

* Datenmodell Habit/HabitEntry/Todo implementiert, HabitStorageService kapselt Ionic Storage.
* Entscheidung Habit-Typen: vier feste Tracking-Typen (Minuten, Stunden, Anzahl, Ja/Nein) statt freier Einheit, damit die Erfassung beim Anlegen ein einziges Dropdown bleibt und trotzdem die meisten Alltags-Habits abgedeckt sind.
* "Neues Habit"-Formular mit Reactive-Forms-Validierung (Name Pflicht/min. 2 Zeichen, Tagesziel Pflicht ausser bei Ja/Nein).
* "Heute"-Tab zeigt jetzt echte, gespeicherte Habits statt Demo-Daten; Statistik und Todos bleiben vorerst Demo.
* Erste Unit-Tests für Storage-Service und Validatoren geschrieben.
* Manuell im Browser geprüft: Habit anlegen, Wert eintragen, Reload — Daten bleiben erhalten; Löschen funktioniert.
