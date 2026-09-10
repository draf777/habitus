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

## 4.9., 18:00

- Todo-Tab implementiert (TodoStorageService, täglich erfassen/abhaken/löschen).
- Zwei Farbschemen (Ocean: Teal, Sunset: Orange) je in Hell/Dunkel umgesetzt, über SettingsService + CSS-Custom-Properties, Wahl wird persistiert.
- Entscheidung Theme-Technik: CSS Custom Properties + signal-basierter SettingsService statt separater Angular-Module pro Theme, weil Umschalten so ohne Reload funktioniert.
- Layout auf Tablet-Breite/Landscape gegengeprüft, Grid-Breakpoints angepasst.
- v0.3.0 getaggt, live deployed.

## 10.9., 12:00

- Statistik-Tab mit Wochendiagramm (ng2-charts/Chart.js) pro Habit umgesetzt, StatsService kapselt die Aggregation.
- Entscheidung Chart-Library: ng2-charts/Chart.js statt ngx-charts oder ApexCharts, weil aktiv gepflegt, standalone-fähig und Farben sich sauber an die eigenen Theme-Variablen binden lassen (wichtig für 2 Farbschemen × Hell/Dunkel).
- Ja/Nein-Habits werden in der Statistik als "erledigt an X von 7 Tagen" gezählt.
- Unit-Tests für StatsService (inkl. Randfälle ohne Einträge) ergänzt.
- Beim ersten Start werden jetzt automatisch zwei Beispiel-Habits (eine bereits mit gefüllter letzter Woche, damit "Statistik" nicht leer ist) und zwei Beispiel-Todos angelegt, statt dass die App komplett leer startet.
- Unter "Über" > "Daten" lassen sich diese Demo-Daten mit einem Klick wieder vollständig löschen; getrackt wird das über die tatsächlich angelegten IDs, nicht über Namen, damit eigene, später angelegte Daten nie versehentlich mitgelöscht werden und die Demo-Daten nach dem Löschen auch nicht erneut erscheinen.
- Beim Testen im Browser (nicht nur mit Unit-Tests) aufgefallen: "Statistik" (und potenziell "Heute"/"Todos") zeigten veraltete Daten, wenn man Habits/Todos auf einem anderen Tab änderte, weil Ionic die Tab-Seiten im Hintergrund am Leben hält statt sie neu zu erzeugen. Mit `ionViewWillEnter` auf allen drei Seiten behoben.
- Statistik zeigt jetzt zusätzlich den aktuellen Streak (Tage am Stück) pro Habit, als Badge über dem Diagramm. Der Streak zählt rückwärts ab heute, bricht aber nicht sofort ab, wenn der heutige Eintrag noch fehlt — erst ein tatsächlich verpasster Tag beendet ihn.
- Beim Feintuning der Demo-Daten (letzte 3 Tage erledigt, davor eine Lücke, davor nochmal ein Tag) einen Bug im Streak gefunden: die Berechnung brach an `habit.createdAt` ab, weil das Demo-Habit "heute" angelegt wird, die Einträge aber rückdatiert sind. Da echte Habits über die UI ohnehin nie rückdatierte Einträge bekommen können, die Grenze ersatzlos entfernt statt die Demo-Daten künstlich anzupassen.
- Drei kleinere Bugs/Wünsche zu den Todos umgesetzt, nachdem David sie gemeldet hat:
  - Zu lange Todo-Texte wurden abgeschnitten, weil der Text bisher im Label von `ion-checkbox` lag, das intern per CSS immer auf eine Zeile mit "…" kürzt (dafür gibt es keinen offiziellen Override). Text jetzt in einem separaten `ion-label` daneben, das normal umbricht — der Nutzer hat sich bei der Rückfrage explizit für "einfach umbrechen" statt Kürzen/Popup entschieden.
  - Links im Todo-Text werden jetzt per eigenem `linkify()`-Util automatisch erkannt und klickbar gemacht (http/https/www., HTML zuerst escaped, dann `<a>` eingefügt — sicher für `[innerHTML]`).
  - Todos lassen sich jetzt per Drag & Drop frei sortieren (Ionics `ion-reorder-group`), statt fester Prioritätsstufen — Davids ausdrückliche Wahl bei der Rückfrage, weil flexibler.
  - Todos-Tab jetzt in drei Abschnitte gegliedert: Heute, frühere noch offene Todos (bisher verschwanden die einfach), Erledigt — beide letzteren mit Datumsangabe und weiterhin vollständig löschbar.
  - Alles in einem echten Browser end-to-end geprüft, inkl. simuliertem Drag-and-drop (mit Mouse-Events, da Ionics Reorder-Geste kein natives HTML5-DnD nutzt) — Reihenfolge blieb auch nach vollständigem Seiten-Reload erhalten.
- Direktes Feedback danach: der Ziehpunkt sollte nicht erst hinter einem eigenen "Sortieren"-Modus stecken, sondern immer direkt neben dem Löschen-Symbol sichtbar sein. Umgesetzt — Ionics Reorder-Geste greift ohnehin nur, wenn man den Ziehpunkt selbst anfasst, daher kollidiert sie gar nicht erst mit der Wisch-zum-Löschen-Geste; der eigene Modus war unnötige Vorsicht.
- Dabei eine Lücke in der bisherigen Browser-Testmethode entdeckt: ein schmaler Viewport (420px) allein reicht nicht, um Ionics "mobile" Erkennung (`Platform.is('mobile')`) zu triggern — ohne echte Touch-/User-Agent-Emulation (Playwrights `devices['Pixel 5']`) rendert die App immer den Desktop-Zweig, auch bei Handy-Breite. Alle bisherigen "Mobile"-Browsertests in dieser Session haben dadurch nie wirklich den Wisch-Pfad geprüft. Mit echter Geräte-Emulation nachgeholt: Ziehen und Wischen funktionieren nebeneinander wie vorgesehen.
- v0.4.0 getaggt, live deployed.
