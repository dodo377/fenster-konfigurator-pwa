# Fenster-Konfigurator PWA

Progressive Web App für Fenster- und Türen-Konfiguration mit automatischer Material-Übersicht basierend auf Falzmaßen.

## Features

- 🔌 **Offline-Funktionalität** durch Service Worker mit automatischer Versionierung
- 💾 **IndexedDB** mit 83 Materialeinträgen für alle Fenstertypen
- 📱 **Installierbar** als native App (PWA) auf iOS/Android/Desktop
- 🎨 **Tablet-optimiertes Design** ohne Scrolling (7%/15%/12%/66% Grid)
- 🪟 **4 Fenstertypen** mit spezifischer Material-Logik
- 📏 **Automatische Materialberechnung** mit -40mm Offset
- 🔄 **Auto-Update** lädt neue Versionen automatisch
- 🎨 **Branding**: Logo-Integration mit Firmenfarben (#FFDE0B gelb, #565656 grau)
- 👆 **Touch-optimiert**: Lange-Druck-Reload (2 Sekunden) für Tablet-Nutzung

## Fenstertypen & Material-Logik

Jeder Fenstertyp hat eine spezifische Zuordnungslogik basierend auf FFH (Falzmaß Höhe) und FFB (Falzmaß Breite):

### Dreh (26 Materialeinträge)
- **Links/Rechts**: FFH-basiert (231-2725mm)
- **Oben**: FFB 271-1725mm (6 Varianten)
- **Unten**: FFB 0-1725mm (4 Varianten)

### Kipp (14 Materialeinträge)
- **Links/Rechts**: FFH-basiert 0-1525mm (identische Daten, 3 Varianten)
- **Oben/Unten**: FFB 326-2300mm (5 bzw. 3 Varianten)

### DrehKipp (26 Materialeinträge)
- **Links/Rechts**: FFH-basiert (231-2725mm)
- **Oben**: FFB 271-1725mm (6 Varianten)
- **Unten**: FFB 0-1725mm (4 Varianten)

### Stulp (17 Materialeinträge)
- **Links**: FFH 801-2725mm (3 Varianten)
- **Rechts**: FFH 411-2725mm (6 Varianten)
- **Oben/Unten**: FFB 0-1725mm (je 4 Varianten)

## Technische Details

### Frontend
- **Vanilla JavaScript** (ES6+)
- **CSS Grid Layout** (7% Header / 15% Fenstertyp / 12% Maße / 66% Display)
- **IndexedDB Version 8** mit automatischer Daten-Migration aus materials.json
- **Material-Labels**: 26px Font, 60%/90% Container-Größe, vertikale Ausrichtung
- **Touch-Optimierung**: 48-52px min-height, 14-18px padding, 16-26px Schriftgrößen
- **Long-Press Reload**: 2-Sekunden touchstart Timer für Seiten-Reload

### Service Worker
- **Automatische Versionierung** mit Timestamp: `fenster-konfigurator-${new Date().getTime()}`
- **Cache-Strategie**: Cache-first für lokale Ressourcen, Network-first für externe
- **Auto-Update**: `skipWaiting()` und `clients.claim()` mit automatischem Reload
- **Cached Assets**: HTML, CSS, JS, materials.json, Manifest, Icons, Logo, 4 Fensterbilder (im images/ Ordner)

### Material-Lookup-Logik
1. **Datenquelle**: materials.json mit 83 Einträgen wird beim ersten Start in IndexedDB geladen
2. **Eingabe**: Flügelbreite (in mm) und Flügelhöhe (in mm) vom Benutzer
3. **Adjustment**: Automatischer Abzug von 40mm (adjustedWidth/Height)
4. **Suche**:
   - **Links/Rechts**: FFH (Höhe) bestimmt Material
   - **Oben/Unten**: FFB (Breite) bestimmt Material
5. **Position-Swapping**: Dreh/DrehKipp/Stulp haben vertauschte left/right Positionen in DB

### Styling-Besonderheiten
- **Farbschema**: --primary: #FFDE0B (gelb), --text: #565656 (grau)
- **Links-Label**: `writing-mode: vertical-rl` + `rotate(180deg)` (Text von unten nach oben)
- **Rechts-Label**: `writing-mode: vertical-rl` (Text von oben nach unten)
- **Bilder**: 90% Container-Größe mit `object-fit: contain`, im images/ Ordner
- **Header**: 3-Spalten Grid (Text | Logo | Status/Button)
- **Input-Felder**: Gelber Hintergrund mit --accent Border
- **Selector**: gelb normal, --accent Hintergrund wenn ausgewählt

### Dateistruktur
```
window_door/
├── index.html           # Haupt-HTML mit 3 Sections (Fenstertyp, Maße, Display)
├── styles.css           # CSS mit Logo-Farben und Touch-Optimierung
├── app.js               # Logik, IndexedDB, Long-Press Reload
├── sw.js                # Service Worker mit Timestamp-Versioning
├── manifest.json        # PWA-Manifest
├── materials.json       # 83 Material-Einträge (extern)
└── images/              # Alle Bilder
    ├── LOGO_HR.png      # Firmen-Logo
    ├── dreh.png         # Fenstertyp Dreh
    ├── kipp.png         # Fenstertyp Kipp
    ├── dreh_kipp.png    # Fenstertyp DrehKipp
    ├── icon-192.png     # PWA Icon 192x192
    ├── icon-512.png     # PWA Icon 512x512
    └── apple-touch-icon.png  # iOS Icon
```

## Installation als PWA

### Desktop/Android
1. **Browser öffnen** (HTTPS erforderlich für volle Funktionalität)
2. **"Installieren"** Button klicken (erscheint automatisch)
3. **Offline-Nutzung** direkt nach Installation verfügbar

### iOS/iPad
1. Safari öffnen (Chrome unterstützt keine PWA-Installation auf iOS)
2. **Teilen** → **"Zum Home-Bildschirm hinzufügen"**
3. App vom Home-Bildschirm starten

**Hinweis**: iOS zeigt keine automatische "Installieren"-Aufforderung. Die manuelle Installation über Safari ist erforderlich.

## Lokale Entwicklung

```bash
# Python HTTP Server starten
python3 -m http.server 5173
```

Dann öffne `http://localhost:5173`

### Development-Workflow
1. Änderungen in HTML/CSS/JS vornehmen
2. Service Worker generiert automatisch neue Cache-Version (Timestamp)
3. Browser neu laden → Auto-Update greift (oder Long-Press auf Tablet)
4. Alte Caches werden automatisch gelöscht
5. Bei materials.json Änderungen: DB_VERSION in app.js erhöhen

## Deployment

**GitHub-Repo**: dodo377/fenster-konfigurator-pwa

Bei jedem Push zu `main`:

1. Service Worker erstellt neuen Timestamp-Cache
2. Benutzer erhalten automatisch die neueste Version

## Debugging

### Browser DevTools (F12)

#### Console-Ausgaben
```javascript
// DB-Initialisierung
"Service Worker registriert"
"83 Materialien aus JSON in DB geladen"

// Material-Suche
"Alle Materialien: 83"
"Suche für: { windowType: 'dreh', width: 1200, height: 1500 }"
"Links: Material XY | Rechts: Material XY | Oben: Material XY | Unten: Material XY"
```

#### Wichtige Checks
- **Application → IndexedDB** 
  - Datenbank: `window-door-db` (Version 8)
  - Store: `materials` (83 Einträge)
  - Indizes: windowType, position, minWidth, maxWidth, minHeight, maxHeight
  
- **Application → Service Worker**
  - Status: "activated"
  - Cache-Name: `fenster-konfigurator-[timestamp]`
  - Nach Update: Automatischer Reload bei neuem Controller
  
- **Application → Cache Storage**
  - 14 gecachte Dateien (HTML, CSS, JS, JSON, images/)
  - Bei jedem Deploy neuer Timestamp-basierter Cache
  - Alte Caches werden automatisch gelöscht
  
- **Network Tab**
  - `materials.json`: Sollte nur beim ersten Laden von Server kommen
  - Bilder aus images/ Ordner: Cache-first Strategy
  - `(from ServiceWorker)` bei allen lokalen Assets

#### Häufige Probleme
- **Material zeigt "—"**: Kein Material für diese Maße gefunden
- **Logo fehlt**: LOGO_HR.png nicht im images/ Ordner
- **Alte Version**: Service Worker Cache leeren oder Hard-Reload (Cmd+Shift+R)
- **IndexedDB leer**: DB_VERSION erhöhen erzwingt Reload aus materials.json

## Bekannte Besonderheiten

- **Position-Swapping**: Dreh/DrehKipp/Stulp speichern left-Daten in right-Position und umgekehrt
- **Kipp-Logik**: Links und Rechts verwenden identische FFH-basierte Daten
- **-40mm Offset**: Wird vor DB-Suche automatisch abgezogen
- **DB-Version**: Bei materials.json Änderungen DB_VERSION erhöhen → löst `onupgradeneeded` aus
- **Long-Press**: 2 Sekunden halten zum Reload (touchstart Timer, cleared bei touchend/touchmove)
- **Auto-Berechnung**: Keine Submit-Button, Material-Update bei input-Event
- **iOS PWA**: Manuelle Installation über Safari "Zum Home-Bildschirm", keine Auto-Prompt
- **Farben**: Logo-Farben #FFDE0B (gelb) und #595551 (braun) bestimmen gesamtes Farbschema
