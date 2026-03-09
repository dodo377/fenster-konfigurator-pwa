# 📘 Pflichtenheft: Fenster- & Türen-Konfigurator PWA

## Projekt: Entwicklung einer Progressive Web App zur Materialermittlung und -dokumentation

**Version:** 1.0  
**Status:** Finalisiert / In Umsetzung

---

### 0. Dokumentenkontrolle & Versionshistorie

| Version | Datum | Status | Änderungsgrund / Beschreibung | Autor |
|---------|-------|--------|-------------------------------|-------|
| 0.1 | 10.02.2026 | Entwurf | Erstellung der funktionalen Anforderungen (-40mm Logik). | [Dein Name] |
| 0.2 | 14.02.2026 | In Prüfung | Integration der technischen Spezifikationen (PWA/Service Worker). | [Dein Name] |
| 0.9 | 18.02.2026 | Testphase | Ergänzung der Risikoanalyse und der ISO 25010 Qualitätsmerkmale. | [Dein Name] |
| 1.0 | 20.02.2026 | Final | Abschluss der Testdokumentation und Freigabe zur Produktion. | [Dein Name] |
| 1.0 |	24.02.2026 | Final | Zusammenführung von Lastenheft-Anforderungen und technischer Spezifikation. | |

---

### 1. Zielbestimmung
Das System dient der mobilen, offline-fähigen Ermittlung von Materiallisten für Fenster und Balkontüren basierend auf Flügel-Falzmaßen (FFB/FFH).
**Muss-Kriterien:** Korrekte Berechnung mit -40mm Offset, Offline-Verfügbarkeit via Service Worker, Datenpersistenz in IndexedDB. 
**Wunsch-Kriterien:** Installierbarkeit als PWA, optisches Feedback bei fehlenden Daten.  
**Abgrenzung:** Das System ist ein rein technisches Kalkulationstool, führt keine kaufmännischen Preisberechnungen durch und ersetzt kein ERP-System.

### 2. Produkteinsatz
**Anwendungsbereiche:** Werkstatt  
**Zielgruppen:** Fenster-Monteure  
**Betriebsumgebung:** Mobile Endgeräte (primär Tablets), aktuelle Browser (Chrome/Brave/Safari).

### 3. Anforderungen 
In diesem Abschnitt werden die fachlichen Anforderungen technisch konkretisiert:

#### 3.1 Funktionale Anforderungen (FA)
- **FA-01 Datenerfassung:**	Erfassung von orderNumber, customerName, position und quantity via HTML5-Formular. Die Validierung erfolgt nativ im Browser.
- **FA-05 Berechnungs-Logik:** Die Funktion calculateMaterial() subtrahiert vor dem Datenbank-Query einen statischen Wert von 40 mm von Breite und Höhe.
- **FA-06 Material-Matching:** Abfrage der IndexedDB window-door-db (v13). Es werden vier parallele Suchen (Links, Rechts, Oben, Unten) durchgeführt, gefiltert nach Typ und Maßbereichen (min/max).
- **FA-07 Zwischenspeicherung:** Erfasste Zeilen werden in einem Array gesammelt und im localStorage unter dem Key exportRows persistent abgelegt.
- **FA-09 Excel-Export:** Umsetzung via SheetJS (xlsx.full.min.js). Export erfolgt ohne Header (skipHeader: true) unter Beibehaltung des ursprünglichen Dateinamens.

#### 3.2 Nicht-funktionale Anforderungen (NFA)
- **NFA-01 Offline-Fähigkeit:** Service Worker (sw.js) nutzt eine Cache-First-Strategie. Alle statischen Assets (JS, CSS, JSON, Images) werden lokal vorgehalten.
- **NFA-02 Datenkonsistenz:** Bei einem Update der Materialdaten wird die DB_VERSION erhöht. Die Funktion cleanOldDatabase() sorgt für die Bereinigung alter Bestände vor dem Neu-Import.
- **NFA-06 Usability (Tablet):** CSS-Grid-Layout mit spezifischen Media-Queries für iPad Pro 12,9". Touch-optimierte Buttons und ein Long-Press-Reload-Mechanismus (2 Sek.).

### 4. Qualitätsmerkmale nach ISO/IEC 25010
Die Software wird nach den Qualitätskriterien der ISO/IEC 25010 entwickelt und evaluiert. Besonderer Fokus liegt auf:
- Benutzbarkeit: Optimierung für mobile Endgeräte (Tablets) im rauen Baustellenumfeld.
- Zuverlässigkeit: Sicherstellung der Offline-Funktionalität durch Service Worker Technologie.
- Portabilität: Plattformunabhängige Bereitstellung als Progressive Web App (PWA).

### 5. Systemarchitektur & Technisches Design
Beschreibung der technischen Bausteine.

#### 5.1 Software-Stack
**Frontend:** HTML5, CSS3 (Grid-Layout), Vanilla JavaScript (ES6+).  
**PWA-Komponenten:** Web App Manifest (manifest.json), Service Worker (sw.js).  
**Speichertechnologie:** IndexedDB zur Speicherung der JSON-Daten.

#### 5.2 Datenmodell
Die Materialdaten werden in einer flachen JSON-Struktur vorgehalten.  
**Attribute:** typ, position, min, max, material_name.

#### 5.3 Lifecycle-Management & Versionierung (Service Worker)
Um sicherzustellen, dass immer mit den aktuellsten Materialdaten gearbeitet wird, gleichzeitig aber die Offline-Verfügbarkeit garantiert bleibt, wird ein spezifisches Versionierungskonzept implementiert.

##### 5.3.1 Dynamische Cache-Invalidierung
Anstatt einer statischen Versionsnummer (v1, v2) verwendet das System in der sw.js einen Timestamp-basierten Identifier.

**Mechanismus:** Beim Speichern oder Deployen der Anwendung wird die Konstante CACHE_NAME mit dem aktuellen Zeitstempel generiert:
```js
const CACHE_NAME = 'fenster-konfigurator-' + new Date().getTime();
```

**Vorteil:** Jede kleinste Änderung am Quellcode oder an der materials.json führt bei einem Refresh dazu, dass der Browser eine neue Version erkennt.

##### 5.3.2 Aktivierungs-Logik (Cleanup)
Damit der Speicherplatz auf dem Endgerät (Tablet) nicht durch veraltete Versionen belegt wird, enthält das Pflichtenheft eine automatische Bereinigungsroutine im activate-Event des Service Workers:

Der Service Worker prüft alle vorhandenen Cache-Speicher des Browsers.

Caches, deren Name nicht dem aktuellsten CACHE_NAME entsprechen, werden über `caches.delete(key)` entfernt.

Dadurch wird sichergestellt, dass immer nur genau eine (die aktuellste) Version der App lokal vorgehalten wird.

##### 5.3.3 Update-Trigger via UI
Für den Fall, dass Daten im laufenden Betrieb aktualisiert werden müssen (z. B. bei neuen Beschlagsteilen), wurde eine manuelle Update-Funktion implementiert:

**Long-Press-Feature:** Durch langes Drücken (2 Sekunden) auf eine definierte Fläche wird ein `location.reload(true)` ausgelöst.

**Ablauf:** Der Browser erkennt die neue Version der sw.js, installiert diese im Hintergrund und der Service Worker übernimmt durch den Befehl `self.skipWaiting()` sofort die Kontrolle. Die App startet automatisch mit den neuen Daten neu.



### 6. Benutzeroberfläche (GUI)
**Header:** Logo und Titel (6-7% Höhe).  
**Input-Bereich:** Eingabefelder für Vorgangsdaten, Radio-Buttons für Produktartwahl und Selectfeld für Typwahl, Input-Felder für B x H (ca. 15% Höhe).  
**Visualisierung:** Fenster-/Tür-Grafik mit dynamischen Materialanzeigen (zentraler Bereich).  
**Interaktion:**  
Eingabe der Maße triggert sofortige Neuberechnung.  
"Long-Press" (2 Sek.) löst Cache-Refresh aus.

### 7. Qualitätssicherung & Abnahme
Um die Einhaltung der Anforderungen sicherzustellen, wird ein mehrstufiger Prüfprozess etabliert:

#### 7.1 Qualitätssicherungsmaßnahmen
- **Statischer Test:** Validierung der materials.json gegen ein JSON-Schema, um Syntaxfehler vor dem Deployment auszuschließen.
- **PWA-Audit:** Durchführung von automatisierten Lighthouse-Tests zur Verifizierung der Installierbarkeit, Performance und Best Practices.
- **Cross-Browser-Check:** Prüfung der Darstellung auf iPadOS (Safari), Android (Chrome) und Windows (Edge/Chrome).

#### 7.2. Abnahmekriterien (Auszug)
Die Abnahme gilt als erfolgreich, wenn:

- Die Berechnung der Materialmaße nachweislich den -40 mm Offset korrekt anwendet.
- Die App im Flugmodus (Offline) vollständig lädt und funktionsfähig bleibt.
- Der Excel-Export exakt 11 Spalten ohne Header-Zeile generiert.
- Alle 108 Materialdatensätze erfolgreich in die IndexedDB geladen wurden.

### 8. Glossar
**FFB / FFH** Flügel-Falzbreite / Flügel-Falzhöhe. Die Basis-Eingabemaße für die Berechnung.
**IndexedDB** Eine im Browser integrierte, transaktionale Datenbank zur dauerhaften Speicherung großer Datenmengen (hier: Materialstamm).
**PWA**	Progressive Web App. Eine Webseite, die sich wie eine installierbare App verhält und offline genutzt werden kann.
**Service Worker** Ein im Hintergrund laufendes Skript, das Netzwerkanfragen abfängt und Inhalte aus dem Cache lädt (sw.js).
**SheetJS** Die technische Bibliothek (xlsx.full.min.js), die den Excel-Import und -Export ermöglicht.
**Standalone** Anzeigemodus der PWA ohne Adresszeile und Browserelemente.

### 9. Risikoanalyse & Notfallkonzept
In diesem Kapitel werden technische und betriebliche Risiken bewertet. Die Bewertung erfolgt nach Eintrittswahrscheinlichkeit (E) und Schadensausmaß (S) (Skala 1–5, wobei 5 das Maximum darstellt).

#### 9.1 Technisches Risikomanagement

| Risiko-ID | Beschreibung | E | S | Mitigationsstrategie (Lösung) |
|-----------|--------------|---|---|-------------------------------|
| R-01 | Datenverlust in der IndexedDB: Der Browser löscht den lokalen Speicher (z.B. durch Speicherplatzmangel). | 2 | 5 | Die App prüft bei jedem Start, ob die DB vorhanden ist. Falls nicht, erfolgt ein automatischer Re-Import aus der materials.json. |
| R-02 | Veraltete Materialdaten: Monteur arbeitet mit alten Preisen/Maßen, da die App nicht aktualisiert wurde. | 3 | 4 | Implementierung der Timestamp-Versionierung im Service Worker. "Long-Press-Reload" ermöglicht manuelles Erzwingen des Updates. |
| R-03 | Inkompatibilität: Neues Browser-Update führt zu Fehlern in der PWA-Darstellung. | 2 | 3 | Verzicht auf experimentelle APIs. Nutzung von Standard-Vanilla-JS und CSS-Grids. Regelmäßige Regressionstests (siehe Testdokumentation). |
| R-04 | Korrupte JSON-Datei: Syntaxfehler in der materials.json verhindert den Import. | 1 | 5 | Implementierung eines try-catch-Blocks beim Import-Skript. Validierung der JSON-Struktur vor dem Deployment. |

#### 9.2 Funktionale Risiken (Logik-Fehler)

| Risiko-ID | Beschreibung | Maßnahme |
|-----------|--------------|---------|
| R-05 | Falsche Maßeingabe: Nutzer gibt Maße ein, die außerhalb des machbaren Bereichs liegen. | Die App zeigt „—" an, wenn kein Material-Match in der Datenbank gefunden wird. Eine „Validierungs-Warnung" kann bei Extremwerten eingeblendet werden. |
| R-06 | Hardware-Defekt (Baustelle): Das Tablet fällt aus oder wird beschädigt. | Da es eine PWA ist, kann sich der Monteur sofort mit jedem anderen mobilen Endgerät einloggen/aufrufen – alle Assets werden sofort neu geladen. |

#### 9.3 Strategie zur Risikominimierung (Quality Gate)
Um die identifizierten Risiken zu minimieren, wird ein Quality Gate vor der Produktion eingeführt:

- **Statischer Code-Check:** Validierung der materials.json gegen ein Schema.
- **Lighthouse-Audit:** Sicherstellung, dass die PWA-Kriterien zu 100% erfüllt sind (Vermeidung von Installationsfehlern).
- **Automatisches Cleanup:** Der Service Worker löscht beim Aktivieren zwingend alle alten Cache-Leichen, um Konflikte zwischen Skript-Versionen zu vermeiden.
- **Versionierung:** Jede Änderung an der materials.json erfordert zwingend eine Erhöhung der DB_VERSION in der app.js.
- **Backup-Workflow:** Nutzer werden angewiesen, wichtige Daten regelmäßig über den Button „In Datei schreiben“ zu exportieren, um den flüchtigen localStorage zu entlasten.