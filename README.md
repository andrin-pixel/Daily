# Wochenbriefing – Interaktive App

Automatisches News- & Börsen-Dashboard, das jeden Montag (Vorschau) und
Freitag (Rückblick) selbstständig aktualisiert wird. Läuft komplett
kostenlos auf GitHub.

## Was du dafür brauchst (alles gratis)

| Tool | Wofür | Account nötig? |
|---|---|---|
| **GitHub** | Hosting (GitHub Pages) + Zeitplan (GitHub Actions) | Ja, kostenlos |
| **Alpha Vantage** | Finanz-News-Daten | Ja, kostenloser API-Key (hast du schon) |
| Ein Browser | Zum Ansehen der fertigen App | – |

Kein Zapier, kein Make, keine Kreditkarte.

---

## Schritt 1 – Repo erstellen

1. Gehe auf **github.com** → einloggen (Account erstellen falls nötig, gratis)
2. **"New repository"** → Name z.B. `wochenbriefing` → **Public** wählen
   (muss für GitHub Pages gratis öffentlich sein) → "Create repository"
3. Alle Dateien aus diesem Ordner in das neue Repo hochladen:
   - Entweder per Drag & Drop im Browser (Repo öffnen → "Add file" →
     "Upload files")
   - Oder mit Git auf der Kommandozeile, falls du das schon kennst

## Schritt 2 – Alpha Vantage Key als Secret hinterlegen

1. Im Repo: **Settings** → **Secrets and variables** → **Actions**
2. **"New repository secret"**
3. Name: `ALPHA_VANTAGE_KEY`
4. Wert: dein Alpha-Vantage-API-Key
5. Speichern

*(Wichtig: NIE den Key direkt in eine Datei schreiben, die du hochlädst –
nur als Secret!)*

## Schritt 3 – GitHub Pages aktivieren

1. **Settings** → **Pages**
2. Unter "Build and deployment": Source = **"Deploy from a branch"**
3. Branch: `main`, Ordner: `/ (root)` → Save
4. Nach 1-2 Minuten ist die App live unter:
   `https://DEIN-USERNAME.github.io/wochenbriefing/`

## Schritt 4 – Ersten Datenabruf manuell testen

1. Im Repo: **Actions**-Tab
2. Workflow **"Wochenbriefing aktualisieren"** anklicken
3. **"Run workflow"** → **"Run workflow"** (manueller Testlauf)
4. Nach ~30-60 Sekunden: grüner Haken = erfolgreich
5. Prüfe, ob im Ordner `data/` eine neue `latest.json` erschienen ist
6. Öffne deine GitHub-Pages-URL → die App sollte jetzt Daten zeigen

Falls ein roter Fehler erscheint: auf den Workflow-Lauf klicken → Logs
lesen (meist: Secret falsch benannt/fehlt, oder ein RSS-Feed antwortet
gerade nicht – dann einfach nochmal laufen lassen).

## Schritt 5 – Automatik prüfen

Der Workflow läuft automatisch:
- **Montag** (Vorschau-Modus)
- **Freitag** (Rückblick-Modus)

Die Uhrzeiten in `.github/workflows/update-briefing.yml` sind in **UTC**
angegeben – bei Bedarf anpassen (Schweiz = UTC+1 im Winter, UTC+2 im
Sommer).

## Schritt 6 – Als App aufs Handy installieren (PWA)

1. Öffne die GitHub-Pages-URL auf deinem Handy
2. **iPhone (Safari):** Teilen-Symbol → "Zum Home-Bildschirm"
3. **Android (Chrome):** Menü (⋮) → "Zum Startbildschirm hinzufügen" /
   Installations-Prompt erscheint automatisch
4. Fertig – die App öffnet sich jetzt vom Homescreen aus, ohne
   Browserleiste

## Schritt 7 (optional) – Eigene Icons

Aktuell zeigt `manifest.json` auf `icons/icon-192.png` und
`icons/icon-512.png`, die noch nicht existieren. Kurzfristig kein
Problem (die App funktioniert trotzdem), aber für ein "echtes" App-Icon:

1. Erstelle/lade ein quadratisches Logo hoch (z.B. via Canva, kostenlos)
2. Exportiere in 192×192 und 512×512 Pixel als PNG
3. Lade sie in den `icons/`-Ordner hoch, mit genau diesen Dateinamen

## Erweiterung: Archiv automatisch pflegen

`archive.html` listet aktuell Dateien **manuell** aus einer Liste im
Code. Wenn du später willst, dass sich diese Liste selbst aktualisiert:
Sag mir Bescheid – dann bauen wir einen kleinen Zusatzschritt im
GitHub-Actions-Workflow, der automatisch ein Inhaltsverzeichnis aller
Archiv-Dateien generiert (`data/archive/index.json`), das `archive.html`
dann einliest statt der fest eingetragenen Liste.

## Grenzen, die du kennen solltest

- **Alpha Vantage Gratis-Key:** max. 25 Anfragen/Tag – das Skript
  braucht nur 1 Anfrage pro Lauf, also unproblematisch bei 2×/Woche
- **Daten sind bis zu 15 Minuten verzögert** (Gratis-Tier) – für ein
  Wochenbriefing irrelevant
- **Repo ist öffentlich** – jeder mit dem Link kann die App sehen
  (aber niemand deinen API-Key, der bleibt als Secret geschützt)
- **RSS-Feeds können sich ändern** – falls SRF/Reuters/NZZ die Feed-URL
  mal ändern, zeigt das Skript für diesen Block einfach "Keine Daten"
  statt abzustürzen

## Wenn etwas nicht klappt

Screenshot vom Fehler (Actions-Log oder Browser-Konsole) an Claude
schicken – wir debuggen das gemeinsam.
