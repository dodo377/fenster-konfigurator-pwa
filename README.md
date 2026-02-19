# Fenster-Konfigurator PWA

Progressive Web App für Fenster- und Türen-Konfiguration mit Material-Übersicht.

## Features

- 🔌 Offline-Funktionalität durch Service Worker
- 💾 Lokale Datenspeicherung mit IndexedDB
- 📱 Installierbar als native App (PWA)
- 🎨 Dunkles Design optimiert für Tablet-Nutzung
- 🪟 4 Fenstertypen: Dreh, Kipp, Drehkipp, Stulp
- 📏 Automatische Materialberechnung basierend auf Maßen

## Fenstertypen

- **Dreh**: Standard-Drehfenster
- **Kipp**: Kippfenster
- **Drehkipp**: Kombiniertes Dreh-Kipp-Fenster
- **Stulp**: Stulpfenster

## Technologie

- Vanilla JavaScript
- IndexedDB für Datenspeicherung
- Service Worker für Offline-Funktionalität
- CSS Grid Layout
- PWA Manifest

## Deployment

Deployed auf Netlify mit HTTPS für vollständige PWA-Funktionalität.

## Installation

1. Öffne die App im Browser (HTTPS erforderlich)
2. Klicke auf "Installieren" oder "Zum Home-Bildschirm hinzufügen"
3. Die App kann jetzt offline genutzt werden

## Lokale Entwicklung

```bash
python3 -m http.server 5173
```

Dann öffne `http://localhost:5173`
