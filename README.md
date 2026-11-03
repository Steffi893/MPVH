# Pudel von Heersberg

Offizielle Website für die Pudelzucht **Pudel von Heersberg**, gehostet auf **GitHub Pages** unter [pudel-von-heersberg.de](https://pudel-von-heersberg.de).

---

## Architektur & Besonderheiten

1. **GitHub Pages & Jekyll-basiert**:
   - Blitzschnelle Ladezeiten durch statische HTML/CSS-Auslieferung über das weltweite GitHub CDN.
   - Keine langsame Datenbank, kein schwerfälliges CMS auf dem Server.
2. **Globale Header & Footer**:
   - In `_includes/header.html` und `_includes/footer.html` zentral definiert.
   - Alle Menü-Links und Änderungen greifen sofort seitenweit.
3. **Selbstaktualisierendes Copyright**:
   - Automatische Jahreszahl im Footer per Liquid-Template `{{ site.time | date: '%Y' }}` und JavaScript-Fallback.
4. **Sicheres Kontaktformular (Spam- & Botschutz)**:
   - Verwendet **Web3Forms**.
   - Deine persönliche E-Mail-Adresse steht **weder im Quellcode noch auf der Website**. Bots können keine E-Mails abgreifen.
   - Ausgestattet mit einem Honeypot-Feld zum automatischen Verwerfen von Spambots.
5. **Keine sensiblen Daten im Repo**:
   - `.gitignore` schließt temporäre und sensible Dateien aus.
   - `CNAME` ist auf `pudel-von-heersberg.de` konfiguriert.

---

## Inhalte bearbeiten (Auch ohne Programmierkenntnisse!)

### Grafische Umgebung auf dem lokalen Rechner

Auf dem Schreibtisch oder im Projektordner liegt die Datei `Mittelpudel Studio starten.command`.
Ein Doppelklick öffnet das **Studio** im Browser:

- **Live-Vorschau**: Die komplette Website live ansehen und zwischen Desktop-, Tablet- und Handy-Ansicht umschalten.
- **Farben & Typografie**: Visuelle Farbwähler und Schriftenauswahl.
- **Hündinnen & News**: Fotos direkt hochladen und Texte anpassen.
- **Seiten-Texte & Rechtliches**: Impressum, Datenschutz und alle Seiteninhalte direkt im Editor bearbeiten.
- **Website veröffentlichen**: Mit Sicherheitswarnung und Statusmeldung direkt zu GitHub pushen.

---

### Wo liegen welche Daten im Repo?

* **Neuigkeiten auf der Startseite**: Datei `_data/news.yml`
* **Hündinnen**: Datei `_data/huendinnen.yml`
* **Allgemeine Daten (Zuchtname, Inhaber, Telefon)**: Datei `_config.yml`
* **Einzelseiten (Texte)**:
  * `index.html` (Startseite)
  * `huendinnen.html`
  * `aufzucht.html`
  * `info.html`
  * `ueber-uns.html`
  * `kontakt.html`
  * `impressum.html`
  * `datenschutz.html`

---

## Kontaktformular aktivieren (In 2 Minuten)

Das Kontaktformular nutzt **Web3Forms** (kostenlos):

1. Gehe auf [web3forms.com](https://web3forms.com/) und gib deine Ziel-E-Mail-Adresse ein, an die Anfragen gesendet werden sollen.
2. Du erhältst sofort per E-Mail einen persönlichen `Access Key`.
3. Trage diesen Schlüssel in der Datei `_config.yml` bei `web3forms_access_key:` ein:
   ```yaml
   web3forms_access_key: "DEIN_ERHALTENER_KEY"
   ```
4. Fertig! Ab jetzt leitet das Formular alle Anfragen direkt an dein Postfach weiter.

---

## GitHub Pages aktivieren

1. Repository auf GitHub pushen.
2. Im Repository auf **Settings** -> **Pages** gehen.
3. Unter **Build and deployment** -> **Source** wählen: `GitHub Actions`.
4. Unter **Custom domain** steht `pudel-von-heersberg.de` durch die `CNAME`-Datei fest. "Enforce HTTPS" aktivieren.
