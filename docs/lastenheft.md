# 📋 Lastenheft: Fenster- & Türen-Konfigurator PWA

**Projekt:** Digitalisierung der Materialermittlung und -dokumentation

**Version:** 1.0

**Verantwortlich:** Projektleitung

---

## 1. Einführung und Zielsetzung

Die aktuelle Materialermittlung und Dokumentation erfolgt manuell durch Abgleichen und Nutzen von Excel-Tabellen. Dies ist fehleranfällig und zeitintensiv.

**Ziel:** Entwicklung einer digitalen Anwendung zur Materialbestimmung nach dem Aufmaß und automatische Generierung und Dokumentation der Materialübersicht basierend auf den eingegebenen Maßen. 

**Nutzen:** Zeitersparnis und fehlerminimierung bei der Montagevorbereitung und Dokumentation.

---

## 2. Ist-Zustand und Schwachstellen

**Ist-Zustand:** Monteure messen Flügel-Falzmaße und suchen in Excel-Listen nach passenden Beschlagsteilen.

**Schwachstellen:**
- Excel-Tabellen können fehlerhaft und unvollständig sein.
- Rechenfehler beim Abzug des Falzmaßes (-40 mm).
- Kein Zugriff auf aktuelle Daten bei Materialänderungen.

---

## 3. Ziel-Zustand (Soll-Konzept)

Die Anwendung soll als Offline-fähiges Tool im Arbeitsalltag eingesetzt werden und als mobile App auf Tablets zur Verfügung stehen.
- **Zielplattformen:** Die Applikation muss als installierbare PWA auf iOS, Android und Desktop-Systemen lauffähig sein.
- **Geräteoptimierung:** Die Benutzeroberfläche muss touch-optimiert sein, wobei der Fokus auf Tablets wie dem iPad Pro 12,9″ im Hoch- und Querformat liegt.
- **Betriebsumgebung:** Die App muss ohne aktive Internetverbindung voll funktionsfähig bleiben.

### 3.1 Funktionale Anforderungen (Was muss die App können?)

Diese Anforderungen definieren die konkreten Funktionen, die das System dem Nutzer bereitstellen muss:

- **FA-01 Datenerfassung:** Das System muss Eingabefelder für Vorgangsnummer, Name (Kunde), Position und Menge (Standardwert: 1) bereitstellen.
- **FA-02 Produktauswahl:** Der Nutzer muss zwischen den Produktkategorien "Fenster" und "Balkontür" wählen können.
- **FA-03 Typenauswahl:** Für die Kategorie "Fenster" müssen die Typen Dreh, Kipp, Drehkipp und Stulp zur Auswahl stehen. Für "Balkontür" sind die Typen Drehkipp und Stulp vorzusehen.
- **FA-04 Maßeingabe:** Es müssen Eingabefelder für die Flügelbreite und Flügelhöhe (in mm) vorhanden sein.
- **FA-05 Materialberechnung:** Das System muss einen automatischen Offset von -40 mm auf die eingegebene Flügelbreite (FFB) und Flügelhöhe (FFH) anwenden.
- **FA-06 Materialzuordnung:** Die App muss anhand der berechneten Maße die passenden Beschläge für die Positionen Links, Rechts, Oben und Unten aus einer Datenbank mit 108 Materialeinträgen ermitteln. Dabei basiert die Zuweisung für Links/Rechts auf der Höhe und für Oben/Unten auf der Breite.
- **FA-07 Zwischenspeicherung:** Die App muss über eine Funktion ("Daten Zwischenspeichern") verfügen, um erfasste Vorgänge lokal zu sammeln, bevor sie exportiert werden. Nach dem Speichern sind die Eingabefelder zu leeren.
- **FA-08 Excel-Import:** Das System muss das Einlesen bestehender Excel-Dateien (.xlsx) unterstützen, um neue Vorgänge an diese anzuhängen. Der Name der importierten Datei muss für den späteren Export gemerkt werden.
- **FA-09 Excel-Export:** Alle zwischengespeicherten Daten müssen als .xlsx-Datei exportiert werden können. Der Export muss ohne Spaltenüberschriften erfolgen und festgelegte Spalten (Vorgangsnummer, Kunde, Pos, Menge, Typ, Flügelbreite, Flügelhöhe, Beschlag Rechts/Links/Oben/Unten) aufweisen.

### 3.2 Nicht-funktionale Anforderungen (Wie soll die App sein?)

Diese Anforderungen definieren die technischen und qualitativen Rahmenbedingungen des Systems:

- **NFA-01 Offline-Verfügbarkeit:** Ein Service Worker mit Cache-First-Strategie muss implementiert werden, um alle statischen Assets (HTML, CSS, JS, Bilder, Schriftarten) offline bereitzustellen.
- **NFA-02 Datenpersistenz (Stammdaten):** Die App muss IndexedDB verwenden, um die JSON-basierten Materialstammdaten lokal auf dem Gerät zu speichern (aktuelle DB_VERSION = 13).
- **NFA-03 Datenpersistenz (Nutzerdaten):** Für die Zwischenspeicherung der erfassten Zeilen muss der native localStorage des Browsers unter dem Key exportRows genutzt werden.
- **NFA-04 Offline-Bibliotheken:** Die für den Excel-Export/-Import genutzte Bibliothek (SheetJS) muss lokal als vendor/xlsx.full.min.js eingebunden sein, um eine Abhängigkeit von externen CDNs im Offline-Betrieb zu vermeiden.
- **NFA-05 UX-Feedback:** Das System muss den aktuellen Netzwerkstatus ("Online" oder "Offline") visuell anzeigen.

---

## 4. Einsatzbereich und Zielgruppe

**Einsatzort:** Werkstatt.

**Nutzer:** Fenster-Monteure

---

## 5. Rahmenbedingungen und Abnahmekriterien

**Sicherheit:** Keine Speicherung von personenbezogenen Kundendaten (Datenschutz-konform).

**Abnahme:**
- Die Materialausgabe muss bei 10 Referenz-Maßen exakt mit den manuellen Listen übereinstimmen.
- Die App muss sich nach einmaligem Laden vollständig offline öffnen lassen.
- Die Zwischengespeicherten Daten müssen exakt in die geladene Excel-Datei eingefügt werden.

---

## 6. Lieferumfang/Systemkomponenten

Das finale Produkt muss aus folgenden Komponenten bestehen:

- Funktionsfähige Web-Applikation (PWA inkl. lokaler Materialdatenbank).
- Dokumentation der Berechnungslogik.
- Kurze Bedienungsanleitung für das Personal.
