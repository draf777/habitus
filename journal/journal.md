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

## 4.9. Morgen

* Datenmodell Habit/HabitEntry/Todo implementiert, HabitStorageService kapselt Ionic Storage.
* Entscheidung Habit-Typen: vier feste Tracking-Typen (Minuten, Stunden, Anzahl, Ja/Nein) statt freier Einheit, damit die Erfassung beim Anlegen ein einziges Dropdown bleibt und trotzdem die meisten Alltags-Habits abgedeckt sind.
* "Neues Habit"-Formular mit Reactive-Forms-Validierung (Name Pflicht/min. 2 Zeichen, Tagesziel Pflicht ausser bei Ja/Nein).
* "Heute"-Tab zeigt jetzt echte, gespeicherte Habits statt Demo-Daten; Statistik und Todos bleiben vorerst Demo.
* Erste Unit-Tests für Storage-Service und Validatoren geschrieben.
* Manuell im Browser geprüft: Habit anlegen, Wert eintragen, Reload — Daten bleiben erhalten; Löschen funktioniert.

## 4.9., Nachmittag

- Todo-Tab implementiert (TodoStorageService, täglich erfassen/abhaken/löschen).
- Zwei Farbschemen (Ocean: Teal, Sunset: Orange) je in Hell/Dunkel umgesetzt, über SettingsService + CSS-Custom-Properties, Wahl wird persistiert.
- Entscheidung Theme-Technik: CSS Custom Properties + signal-basierter SettingsService statt separater Angular-Module pro Theme, weil Umschalten so ohne Reload funktioniert.
- Layout auf Tablet-Breite/Landscape gegengeprüft, Grid-Breakpoints angepasst.
- v0.3.0 getaggt, live deployed.

## 10.9., Morgen

- Statistik-Tab mit Wochendiagramm pro Habit umgesetzt (ng2-charts/Chart.js — aktiv gepflegt, standalone-fähig, Farben binden sich sauber an die Theme-Variablen), StatsService kapselt die Aggregation. Ja/Nein-Habits als "erledigt an X von 7 Tagen"; Unit-Tests ergänzt.
- Bug behoben: Statistik (und potenziell Heute/Todos) zeigten nach Tab-Wechsel veraltete Daten, weil Ionic die Tab-Seiten im Hintergrund am Leben hält statt neu zu erzeugen — mit `ionViewWillEnter` auf allen drei Seiten gelöst.
- Statistik zeigt jetzt den aktuellen Streak als Badge (bricht erst bei einem tatsächlich verpassten Tag, nicht schon wenn "heute" noch fehlt). Dabei einen Bug gefunden und behoben: die Berechnung brach fälschlich an `habit.createdAt` ab.
- Erststart legt jetzt automatisch zwei Beispiel-Habits (inkl. gefüllter letzter Woche) sowie vier Beispiel-Todos an, statt dass die App leer startet; unter "Über" > "Daten" lassen sich diese anhand ihrer tatsächlichen IDs (nicht Namen) wieder vollständig und gefahrlos löschen.
- Todos: langer Text wurde bisher abgeschnitten (Kürzung durch `ion-checkbox`) — behoben mit separatem, umbrechendem `ion-label`. Links im Text werden jetzt automatisch erkannt und klickbar (eigenes `linkify()`-Util). Frei sortierbar per Drag & Drop (`ion-reorder-group`), Ziehpunkt permanent sichtbar statt hinter einem eigenen Sortier-Modus. Drei Abschnitte (Heute, frühere offene, Erledigt) statt bisher verschwindender älterer Todos; frühere offene Todos lassen sich direkt zu "Heute" verschieben (`TodoStorageService.setDate()`).
- Zwei Bugs nur im echten Browser gefunden, in Unit-Tests unsichtbar: `[innerHTML]` direkt auf `ion-label` liess Text verschwinden (Shadow-DOM/Slot-Konflikt, behoben über ein `<span>` im Label); ausserdem triggert ein schmaler Viewport allein nicht Ionics Mobile-Erkennung — ohne echte Touch-/UA-Emulation testet man unbemerkt immer den Desktop-Pfad. Mit Playwright-Geräteemulation nachgeholt.
- v0.4.0 getaggt, live deployed.

## 10.9., Nachmittag

- Monatsansicht in der Statistik ergänzt (Umschalter Woche/Monat). StatsService.getMonthStats() liefert die Tage vom 1. des Monats bis zum Referenzdatum plus eine Monatssumme; der Streak bleibt unverändert (er hängt nicht vom Anzeigezeitraum ab, deshalb selbe Berechnung wie bisher). Woche und Monat werden beim Laden parallel geholt, damit der Umschalter ohne erneutes Nachladen reagiert.
- Bekannte Bugs aus vorherigen Releases behoben (u.a. doppelte Einträge pro Tag): HabitStorageService.setEntry() und die übrigen schreibenden Methoden in Habit-/TodoStorageService lasen das gespeicherte Array und schrieben es ungesperrt zurück — zwei schnell aufeinanderfolgende Aufrufe (z. B. doppeltes Antippen des +/- Steppers) konnten beide denselben alten Stand lesen und sich dadurch gegenseitig überschreiben, statt den jeweils anderen Eintrag zu berücksichtigen. Behoben mit einer kleinen AsyncWriteQueue, über die jetzt alle mutierenden Methoden beider Storage-Services laufen und dadurch strikt nacheinander abgearbeitet werden.
- Testabdeckung erhöht: StatsService-Monatslogik (inkl. Monatsgrenzen), eigene Tests für die Race-Condition-Fixes in Habit-/TodoStorageService sowie für AsyncWriteQueue selbst.

## 11.9., Morgen

Notizen-Tab mit mehreren frei bearbeitbaren Notizen, als eigener Tab vor 'Über' eingehängt.
- Entscheidung Formatierung: kein Live-Rich-Text-Editor beim Tippen, stattdessen einfaches Textfeld beim Editieren. '- '-Zeilen werden nur beim reinen Anzeigen der gespeicherten Notiz als eingerückte Liste dargestellt.
- URLs im Text werden automatisch per Regex erkannt und klickbar gemacht

## 11.9., Nachmittag

- Notiz-Ansicht/-Bearbeitung ist jetzt ein Bottom-Sheet-Modal über der Notizen-Liste statt eine eigene Seite: nimmt nur einen Teil des Bildschirms ein, Liste bleibt sichtbar. Speichern ist immer explizit über "Abbrechen"/"Speichern", kein automatisches Speichern beim Schliessen mehr.
- Zwei Bugs behoben, die nur im echten Browser auftraten, nicht in Unit-Tests: Angulars `[innerHTML]`-Sanitizer entfernte `style`-Attribute, wodurch die Listen-Einrückung und die Link-Farbe nicht griffen (behoben über `DomSanitizer.bypassSecurityTrustHtml()` in `NoteContentPipe`). Ausserdem zeigte die Notizen-Liste nach dem Schliessen der (inzwischen entfernten) separaten Notiz-Seite veraltete Daten, weil Ionics `ionViewWillEnter` beim Seitenwechsel nicht zuverlässig feuerte — mit dem Umbau aufs Modal erledigt.
