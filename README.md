# Fenster- & Türen-Konfigurator PWA

Progressive Web App zur Konfiguration von Fenstern und Balkontüren mit automatischer Materiallisten-Generierung basierend auf den eingegebenen Falzmaßen.

---

## Features

- 🔌 **Offline-fähig** – Service Worker mit Cache-First-Strategie
- 💾 **IndexedDB** – 108 Materialeinträge lokal gespeichert (Fenster + Türen)
- 📱 **PWA-Installierbar** – iOS / Android / Desktop
- 🧮 **Automatische Materialberechnung** mit –40 mm Offset auf Falzmaße
- 📥 **Excel-Import** – bestehende Datei laden und weiter befüllen
- 💾 **Zwischenspeichern** – mehrere Zeilen sammeln, bevor in Datei geschrieben wird
- 🧾 **Excel-Export** – ohne Spaltenüberschriften, gleicher Dateiname wie Import
- 🖱️ **Touch-optimiert** – iPad Pro 12,9″, Hoch- & Querformat

---

## Produkttypen

| Kategorie   | Typ             |
|-------------|-----------------|
| Fenster     | Drehfenster     |
| Fenster     | Kippfenster     |
| Fenster     | Drehkippfenster |
| Fenster     | Stulpfenster    |
| Balkontür   | Drehkipptür     |
| Balkontür   | Stulptür        |

---

## Excel-Workflow

1. **Datei laden** *(optional)* – vorhandene Excel-Datei einlesen; der Dateiname wird für den späteren Export gespeichert.
2. **Daten Zwischenspeichern** – aktuelle Zeile in `localStorage` ablegen, Eingabefelder werden automatisch geleert.
3. **In Datei schreiben** – alle zwischengespeicherten Zeilen als `.xlsx` exportieren (ohne Header). Wurde vorher eine Datei geladen, wird deren Name wiederverwendet.

**Spaltenreihenfolge im Export:**

| Vorgangsnummer | Kunde | Pos | Menge | Typ | Flügelbreite | Flügelhöhe | Beschlag Rechts | Beschlag Links | Beschlag Oben | Beschlag Unten |
|---|---|---|---|---|---|---|---|---|---|---|

---

## Material-Lookup-Logik

- **Datenquelle:** `materials.json` (108 Einträge) – wird beim ersten App-Start in IndexedDB importiert.
- **Eingabe:** Flügelbreite (FFB) & Flügelhöhe (FFH) in mm.
- **Offset:** FFB − 40 mm → Breiten-Lookup; FFH − 40 mm → Höhen-Lookup.
- **Zuordnung:**
  - **Links / Rechts** → Lookup über FFH
  - **Oben / Unten** → Lookup über FFB
- **windowType-Werte in materials.json:** `fenster-dreh`, `fenster-kipp`, `fenster-drehkipp`, `fenster-stulp`, `tuer-drehkipp`, `tuer-stulp`

---

## Technische Details

| Bereich | Detail |
|---|---|
| Frontend | Vanilla JavaScript (ES6+) |
| Datenpersistenz | IndexedDB, DB_VERSION = 13 |
| DB-Versionswechsel | Automatische Löschung & Neu-Import |
| Excel | SheetJS lokal (`vendor/xlsx.full.min.js`) |
| Service Worker | Filtert Nicht-HTTP(S)-Requests (z. B. `chrome-extension://`) |
| Speicher | `localStorage` Key `exportRows` für zwischengespeicherte Zeilen |

---

## Dateistruktur

```
window_door/
├── index.html          # App-Shell
├── styles.css          # Styling inkl. .btn--secondary
├── app.js              # Hauptlogik, IndexedDB, Export/Import
├── sw.js               # Service Worker
├── manifest.json       # PWA-Manifest
├── materials.json      # 108 Materialeinträge
├── vendor/
│   └── xlsx.full.min.js
└── images/
    ├── LOGO_HR.png
    ├── dreh.png
    ├── kipp.png
    ├── dreh_kipp.png
    ├── stulp.svg
    ├── tuer_drehkipp.png
    ├── tuer_stulp.png
    ├── icon-192.png
    ├── icon-512.png
    └── apple-touch-icon.png
```

---

## Lokale Entwicklung

```bash
cd window_door
python3 -m http.server 5173
```

Öffne anschließend [http://localhost:5173](http://localhost:5173).

---

## Hinweise

- **PWA-Installation auf iOS:** Safari → Teilen → „Zum Home-Bildschirm"
- **Materialien aktualisieren:** `DB_VERSION` in `app.js` erhöhen → IndexedDB wird beim nächsten Start neu befüllt.
- **Neue Produkttypen:** Einträge in `materials.json` ergänzen und `DB_VERSION` erhöhen.
