# 📖 Installations- & Wartungshandbuch

**Projekt:** Fenster- & Türen-Konfigurator PWA
**Zielgruppe:** Monteure
**Stand:** 24.02.2026

---

## 1. Erstinstallation auf dem Tablet

Da der Fenster-Konfigurator eine Progressive Web App (PWA) ist, wird er nicht über den Google Play Store oder Apple App Store installiert, sondern direkt über den Browser.

### Für Android (Chrome)

1. Öffnen Sie den Browser und rufen Sie die URL der App auf (z. B. `https://ihre-firma.de/fenster`).
2. Warten Sie kurz, bis die Seite vollständig geladen ist.
3. Tippen Sie auf das Drei-Punkte-Menü oben rechts
4. Wählen Sie "App installieren".
5. Die App erscheint nun als Icon auf Ihrem Homescreen und lässt sich wie eine normale App starten.

### Für iOS (Safari)

1. Öffnen Sie die URL in Safari.
2. Tippen Sie auf das Teilen-Symbol (Quadrat mit Pfeil nach oben).
3. Scrollen Sie nach unten und wählen Sie "Zum Home-Bildschirm".
4. Bestätigen Sie mit "Hinzufügen".
5. Die App erscheint nun als Icon auf Ihrem Homescreen und startet ohne Browser-Leisten (Standalone-Modus).

---

## 2. Bedienung & Workflow
Die App ist speziell für die Offline-Nutzung auf Baustellen konzipiert.
- Sie benötigen keine Internetverbindung, um Berechnungen durchzuführen.
- Alle Daten (Materiallisten und Bilder) werden automatisch im lokalen Speicher des Tablets abgelegt.

## 2.1 Daten erfassen & Berechnen
1. Geben Sie die Vorgangsnummer und den Kunden ein.
2. Wählen Sie die Kategorie (Fenster/Balkontür) und den Typ (z. B. Drehkipp).
3. Geben Sie die Flügelmaße (Breite & Höhe) in mm ein.
4. Die App wendet automatisch den -40 mm Offset an und zeigt sofort die passenden Beschlagsteile für alle vier Seiten an.

## 2.2 Excel-Workflow (Daten sichern)
- Laden: Über **"Datei laden"** können Sie eine vorhandene Liste importieren, um weitere Positionen hinzuzufügen.
- Zwischenspeichern: Tippen Sie nach jeder Position auf **"Daten Zwischenspeichern"**. Die Felder werden geleert, und die Daten werden sicher im Gerät abgelegt.
- Exportieren: Klicken Sie am Ende des Tages auf **"In Datei schreiben"**, um die gesamte Liste als .xlsx-Datei zu speichern.

---

# 3. Wartung & Notfall-Funktionen
## 3.1 Datenbank-Aktualisierung
Die App enthält aktuell 108 Materialdatensätze (Version 13). Sobald Sie mit dem Internet verbunden sind und die App starten, prüft das System automatisch auf Updates.

## 3.2 Manueller Neustart (Long-Press)
Sollte die App einmal nicht reagieren oder die Materialbilder nicht korrekt laden:

- Halten Sie den Finger für 2 Sekunden an einer beliebigen Stelle auf dem Bildschirm gedrückt.
- Die App erzwingt einen Hard-Reload, löscht den alten Cache und lädt alle Daten neu.

---

# 4. Troubleshooting (Fehlerbehebung)
| Problem | Ursache | Lösung |
|---|---|---|
| Material zeigt "—" | Maß außerhalb des Bereichs | Prüfen Sie die Eingabe. Für Maße außerhalb der Stammdaten (materials.json) ist kein Beschlag definiert. |
| Bilder laden nicht | Cache-Fehler | Führen Sie den Long-Press-Reload (2 Sek.) durch. |
| Excel-Datei leer | Nicht zwischengespeichert | Stellen Sie sicher, dass Sie jede Zeile zuerst mit "Daten Zwischenspeichern" bestätigen. |
| Offline-Status "Rot" | Keine Internetverbindung | Normalzustand unterwegs. Die App arbeitet dennoch uneingeschränkt weiter. |

## Kontakt & Support
Bei fachlichen Fragen zu den Beschlägen oder technischen Fehlern wenden Sie sich bitte an die Systemadministration. Geben Sie dabei die im Header angezeigte DB-Version an.
