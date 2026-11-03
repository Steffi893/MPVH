# Mittelpudel von Heersberg 🐩

Offizielle Website für die Mittelpudelzucht **Mittelpudel von Heersberg**, gehostet auf **GitHub Pages** unter [mittelpudel-von-heersberg.de](https://mittelpudel-von-heersberg.de).

---

## 🚀 Architektur & Besonderheiten

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
   - `CNAME` ist auf `mittelpudel-von-heersberg.de` konfiguriert.

---

## ✍️ Inhalte bearbeiten (Auch ohne Programmierkenntnisse!)

### Option A: Grafische Tools auf dem lokalen Rechner (Empfohlen)

Für Personen ohne Code-Erfahrung eignen sich hervorragend:

1. **Obsidian / MarkText / Typora (Kostenlose Markdown-Editoren)**:
   - Öffne einfach den Projektordner.
   - Texte und Daten können wie in Microsoft Word / Apple Pages geschrieben werden.
   - Änderungen speichern und mit **GitHub Desktop** mit einem Klick auf "Commit" & "Push" online bringen.
2. **GitHub Desktop (Sehr einfach)**:
   - Grafisches Programm von GitHub für Mac & Windows.
   - Zeigt geänderte Dateien an. Ein Klick auf "Commit to main" und "Push origin" aktualisiert die Website automatisch!
3. **Direkt im Browser auf GitHub.com**:
   - Man kann jede Datei (z. B. `_data/news.yml` oder Texte) direkt auf GitHub.com mit Stift-Symbol im Browser editieren. GitHub Pages baut die Seite in ca. 30 Sekunden neu.

---

### Wo bearbeite ich was?

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

## 📬 Kontaktformular aktivieren (In 2 Minuten)

Das Kontaktformular nutzt **Web3Forms** (kostenlos):

1. Gehe auf [web3forms.com](https://web3forms.com/) und gib deine Ziel-E-Mail-Adresse ein, an die Anfragen gesendet werden sollen.
2. Du erhältst sofort per E-Mail einen persönlichen `Access Key` (z. B. `a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
3. Trage diesen Schlüssel in der Datei `_config.yml` bei `web3forms_access_key:` ein:
   ```yaml
   web3forms_access_key: "DEIN_ERHALTENER_KEY"
   ```
4. Fertig! Ab jetzt leitet das Formular alle Anfragen direkt an dein Postfach weiter – absolut anonym und ohne E-Mail-Klartext im Internet.

---

## 🌐 GitHub Pages aktivieren

1. Repository auf GitHub pushen.
2. Im Repository auf **Settings** -> **Pages** gehen.
3. Unter **Build and deployment** -> **Source** wählen: `GitHub Actions` (der beiliegende Workflow `.github/workflows/deploy.yml` baut die Seite automatisch).
4. Unter **Custom domain** steht `mittelpudel-von-heersberg.de` bereits durch die `CNAME`-Datei fest. "Enforce HTTPS" aktivieren.
