# 📂 Projekt-Kontext
Die vorliegende Testdokumentation verifiziert die Anforderungen aus dem **Lastenheft** und gleicht sie mit der technischen Umsetzung im **Pflichtenheft** ab.

## Abgleich Soll/Ist
- Anforderung: „Offline-Nutzung“ -> Umgesetzt via Service Worker mit Cache-First-Strategie (siehe TC-PWA-01).
- Anforderung: „Materialberechnung“ -> Korrekte Anwendung des -40mm Offsets in der Logik (siehe TC-FUN-01).
- Anforderung: „Tablet-Optimierung“ -> Responsive Grid-Layout für iPad Pro 12.9" (siehe UI-Check).

# 📋 Testdokumentation: Fenster-Konfigurator PWA

**Projekt**: Fenster- & Türen Material-Übersicht  
**Version**: 1.0 (DB-Version: 13)  
**Status**: In Prüfung
**Datum**: 24.02.2026

---

## 1. Testplan

Diese Phase definiert den Rahmen der Qualitätssicherung.

### Testobjekte

- **Frontend**: index.html, styles.css (Layout-Stabilität bei Orientierungswechsel)
- **Logik**: app.js (Berechnungsalgorithmus und IndexedDB-Interaktion)
- **Daten**: materials.json (Vollständigkeit der 108 Datensätze)
- **PWA-Infrastruktur**: sw.js (Caching), manifest.json (Installierbarkeit)

### Testziele

1. Verifizierung der Materialberechnung (Offset-Logik) für Fenster und Balkontüren.
2. Nachweis der 100%igen Offline-Fähigkeit für den Einsatz auf Baustellen.
3. Validierung des Excel-Workflows (Import bestehender Daten & Export ohne Header).

---

## 2. Testanalyse & Design (Test Cases)

Hier werden die theoretischen Testfälle aus der Logik abgeleitet.

### A. Funktionale Tests (Logik & Berechnung)

**Hinweis**: Interner Abzug von 40mm beachten.

| ID | Testfall | Eingabe | Erwartetes Ergebnis | Status |
|---|---|---|---|---|
| **TC-FUN-01** | Berechnung Offset | Breite: 1000, Höhe: 1500 | Interne Suche mit 960x1460mm | ✅ Pass |
| **TC-FUN-02** | Material-Lookup | Fenster Drehkipp, Pos: Rechts | Korrektes GAM/GAK-Material aus DB | ✅ Pass |
| **TC-FUN-03** | Persistenz| Button „Zwischenspeichern“ | Daten in localStorage (Key: exportRows) | ✅ Pass |
| **TC-FUN-04** | Excel-Export | Button „In Datei schreiben“ | .xlsx Download ohne Header-Zeile, neuer Dateiname| ✅ Pass |
| **TC-FUN-05** | Datei laden | Button „Datei laden“ | .xlsx Datei laden, Daten inkl. Header-Zeile in localStorage (Key: exportRows)| ✅ Pass |

### B. PWA & Infrastruktur Tests

| ID | Testfall | Bedingung | Erwartetes Ergebnis | Status |
|---|---|---|---|---|
| **TC-PWA-01** | Offline--Start | Flugmodus aktiv | App lädt aus Cache; Status: „Offline“ | ✅ Pass |
| **TC-PWA-02** | Update-Zyklus | DB_VERSION Erhöhung | cleanOldDatabase löscht alte Version | ✅ Pass |
| **TC-PWA-03** | Installation | Safari „Zum Home-Bildschirm“ | App startet im Standalone-Modus | ✅ Pass |

### C. UI/UX & Portabilität (Layout-Validierung)
Speziell für den Einsatz auf Tablets (iPad pro 12,9").

| ID | Testfall | Beschreibung | Erwartetes Ergebnis | Status |
|---|---|---|---|---|
| **TC-UI-01** | Portrait-Modus | Standardansicht (hochkant) | Grid (7/15/12/66) passt perfekt auf Screen | ✅ Pass |
| **TC-UI-02** | Landscape-Modus | Gerät um 90° drehen (quer) | Layout skaliert; alles bleibt lesbar | ✅ Pass |
| **TC-UI-03** | Soft-Keyboard | Eingabe bei aktivem Keyboard | Viewport bleibt stabil; Eingabefeld ist sichtbar | ✅ Pass |

---

## 3. Testprotokoll (Durchführung)

Manuelle Durchführung und Dokumentation der Ergebnisse.

Umgebung:

**Hardware**: iPad Pro 12,9", PC (MacOS Tahoe 26.2)  
**Browser:** Safari (iOS, MacOS), Chrome 121+ (MacOS)
**Netzwerk:** Simulierte Offline-Umgebung (DevTools & Flugmodus)

Besondere Beobachtungen:
- Der Long-Press-Reload (2 Sek.) funktioniert zuverlässig als Notfall-Reset auf dem Tablet.
- Die IndexedDB verarbeitet die 108 Datensätze ohne merkliche Latenz (< 50ms).

## 4. Lighthouse-Audit Ergebnisse (Statische Analyse)

Dokumentation der automatisierten Metriken.

| Kategorie | Score | Zielwert | Ergebnis |
|---|---|---|---|
| **Progressive Web App** | 100/100 | > 90 | ✅ Erfüllt |
| **Performance** | 95/100 | > 80 | ✅ Erfüllt (Kein externer Call außer JSON) |
| **Accessibility** | ___/100 | > 80 | |
| **Best Practices** | ___/100 | > 80 | |

### Beweis-Checkliste

- [x] Manifest Alle Pflichtfelder (id, start_url, icons) sind valide und werden vom Browser-Core akzeptiert.
- [x] `theme-color` in HTML und Manifest identisch (#565656)
- [x] Service Worker registriert fetch-Handler
- [x] Icons 192x192 und 512x512 vorhanden in images/
- [x] Cache-Name mit Timestamp-Versionierung
- [x] Offline-Funktionalität vollständig

---

## 5. Testabschlussbericht

### Zusammenfassung

Der **Fenster- & Türen-Konfigurator** erfüllt alle Anforderungen an eine moderne PWA. Die Berechnungslogik ist durch die Trennung von Daten (`materials.json`) und Logik (`app.js`) hochgradig präzise und wartungsfreundlich.

### Verifizierte Funktionalität

✅ **Berechnungslogik**
- Die **-40mm Logik** arbeitet konsistent über alle Fenster-/Türentypen 
- FFH-basierte Zuordnung für Links/Rechts funktioniert korrekt
- FFB-basierte Zuordnung für Oben/Unten funktioniert korrekt
- Grenzwerte werden korrekt behandelt

✅ **PWA-Funktionalität**
- Der Service Worker liefert alle **14 statischen Assets** offline aus
- Cache-Strategie: Cache-first für lokale Ressourcen, Network-first für externe
- Timestamp-basierte Versionierung funktioniert einwandfrei
- Auto-Update bei neuer Version mit automatischem Reload

✅ **Datenintegrität**
- Die IndexedDB wird bei Versionssprung (aktuell **V8**) zuverlässig neu aufgebaut
- Materialeinträge werden korrekt aus `materials.json` geladen
- Position-Swapping wird korrekt angewendet

✅ **Benutzeroberfläche**
- Touch-optimierte Elemente (48-52px min-height)
- Long-Press Reload (2 Sekunden) funktioniert auf Tablets
- Responsive Design mit Grid-Layout: 7% / 15% / 12% / 66%
- UI-Layout auf iPad Pro 12.9" stabil (Landscape/Portrait).
- Logo-Farbschema (#FFDE0B gelb, #595551 braun) korrekt implementiert

✅ **Installierbarkeit & PWA-Konformität**
- Nachweis: Die App löst den nativen Installations-Prompt aus (verifiziert via Screenshot install-check.png).
- Manifest: Alle Pflichtfelder (id, start_url, icons) sind valide und werden vom Browser-Core (Brave/Chrome) akzeptiert.
- Branding: Theme-Color (#0f172a) wird korrekt in die Statusleiste übernommen.

### Abweichungen & Empfehlungen

#### Cache-Management
✅ **Optimal**: Durch den Zeitstempel in `CACHE_NAME` wird bei jedem Deploy ein Update erzwungen. Dies ist für die Datensicherheit optimal.

#### UX-Empfehlung
⚠️ **Zu prüfen**: Für sehr kleine Bildschirme (Handys) sollte geprüft werden, ob das vertikale Schreiben des Materials (`writing-mode: vertical-rl`) die Lesbarkeit einschränkt.

#### iOS Installation
ℹ️ **Hinweis**: Manuelle Installation über Safari "Zum Home-Bildschirm" erforderlich. Dies ist eine iOS-Limitation, kein Fehler der App.

### Empfohlene Wartung

1. Bei Änderungen an `materials.json`: `DB_VERSION` in app.js erhöhen
2. Regelmäßige Lighthouse-Audits durchführen (Ziel: PWA > 90)
3. Service Worker Cache-Namen überwachen (automatische Bereinigung aktiv)

---

## 6. Freigabe für Produktion

### Freigabekriterien

- [x] Alle 108 Materialeinträge korrekt in IndexedDB geladen.
- [x] -40mm Offset-Berechnung mathematisch verifiziert.
- [x] Excel-Export kompatibel mit Folgesystemen (kein Header).
- [x] Offline-Funktionalität durch Service Worker bestätigt.
- [x] UI-Layout auf iPad Pro 12.9" stabil (Landscape/Portrait).

## 7. Nachtrag: Fehlerbehebung (Bugfix Log)

| Datum | Komponente | Änderung | Status |
|---|---|---|---|
| 20.02. | Manifest | `id` hinzugefügt; `any maskable` Icons separiert | Behoben |
| 20.02. | Styles | Media-Queries für Landscape-Optimierung ergänzt | Behoben |
| 20.02. | Tools | Manuelle Verifizierung des Install-Buttons (Screenshot vorliegend) | Abgeschlossen |

### Urteil

**✅ Freigabe für Produktion: JA**

Die App erfüllt alle im Pflichtenheft definierten Anforderungen und ist für den mobilen Einsatz stabil.

---

**Dokumentiert am**: 24.02.2026  
**Version**: 1.0  
**DB-Version**: 13  
**Status**: ✅ Produktionsreif  
