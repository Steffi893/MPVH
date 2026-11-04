/**
 * =============================================================================
 * POODLE PAWS BACKGROUND ENGINE
 * Realistische goldene Pudel-Tatzen & Stapfen auf dunklem Hintergrund
 * =============================================================================
 *
 * Speziell entwickelt für eine exklusive Pudelzucht-Webseite:
 * - Autonome Hunde wandern entlang weicher, natürlicher Splines (Catmull-Rom)
 * - Biologischer 4-Takt-Schrittgang: Vorder- und Hinterpfoten als abgestimmte Paare
 * - Hinterläufe setzen mit sauber definiertem Versatz hinter & neben den Vorderpfoten auf
 * - Komplett dezent: Kein Aufblitzen, kein lauter Glitzer (vollständig konfigurierbar)
 * - Alle Variablen sind am Anfang der Datei sauber definiert und anpassbar
 * - 0% CPU-Verschwendung dank vorgerenderter Offscreen-Sprites (60 FPS)
 * - Responsiv & Retina / High-DPI fähig
 */

(function (window) {
  'use strict';

  // ===========================================================================
  // SAUBERE KONFIGURATION (Hier alle Variablen zentral anpassen)
  // ===========================================================================
  const POODLE_CONFIG = {
    // --- 1. Hunde-Anzahl & Bewegung ---
    dogCount: 1,                 // Anzahl der Hunde, die gleichzeitig laufen dürfen (z.B. 1, 2 oder 3)
    dogSpeed: 95,                // Laufgeschwindigkeit in Pixeln pro Sekunde (60 = gemächlich, 120 = zügig)
    pauseBetweenWalksMin: 2000,  // Minimale Pause in ms, bevor der nächste Hund losläuft
    pauseBetweenWalksMax: 5500,  // Maximale Pause in ms, bevor der nächste Hund losläuft

    // --- 2. Schrittmuster & Versatz der Pfoten ---
    strideLength: 46,            // Schrittlänge (Distanz zwischen aufeinanderfolgenden Schritten in px)
    trackWidth: 28,              // Spurbreite (seitlicher Abstand zwischen linker und rechter Pfote)
    hindOffsetLongitudinal: 16,  // Längs-Versatz: Hinterpfote setzt X Pixel HINTER der Vorderpfote auf
    hindOffsetLateral: 7,        // Quer-Versatz: Hinterpfote setzt X Pixel nach INNEN versetzt auf
    // -> Garantiert, dass Vorder- und Hinterpfote NIE auf demselben Punkt aufsetzen!
    hindPawScaleRatio: 1,     // Größe der Hinterpfote im Verhältnis zur Vorderpfote (Hinterpfoten sind zarter)

    // --- 3. Tatzen-Design & Größe ---
    pawBaseScale: 0.85,          // Grundgröße (0.6 = Zwergpudel, 0.85 = Kleinpudel, 1.15 = Königspudel)
    showClaws: true,             // Zarte, gepflegte Krallenspitzen anzeigen (true / false)

    // --- 4. Aussehen, Gold-Farbe & Glanz ---
    goldColor: '#cbb776ff',        // Primäre Goldfarbe (edles Königs-Gold)
    goldHighlight: '#d9cd92ff',    // Glanzpunkt auf den Ballen
    goldShadow: '#8b6914',       // Warme Schattierung für Tiefe
    glowColor: 'rgba(212, 175, 55, 0.32)', // Farbe des sanften Scheins
    glowBlur: 10,                // Weichzeichner des Scheins in px (0 = aus, dezent = 8-12)

    // --- 5. Animation, Aufblitzen & Ausfaden (Dezente Optik) ---
    fadeDuration: 8500,          // Zeit in ms, bis ein Abdruck vollkommen verblasst ist (z.B. 8500 = 8.5s)
    touchdownFlash: false,       // Aufblitzen / Druck-Impuls beim Auftreten (false = absolut ruhig & dezent)
    touchdownSparkles: false,    // Glitzer-Partikel beim Auftreten (false = keine störenden Partikel)
    smoothFadeIn: true,          // Sanftes Einblenden beim Auftreten (kein harter Pop-in)
    fadeInDuration: 300,         // Dauer des sanften Einblendens in ms (nur aktiv wenn smoothFadeIn: true)

    // --- 6. Canvas & DOM ---
    canvasId: 'poodle-paws-canvas',
    zIndex: 0,
    container: document.body
  };

  class PoodlePawEngine {
    constructor(userOptions = {}) {
      // Benutzerdefinierte Optionen verschmelzen mit der Standard-Konfiguration
      this.config = Object.assign({}, POODLE_CONFIG, userOptions);

      this.canvas = null;
      this.ctx = null;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = 0;
      this.height = 0;

      // Vorgerenderte Sprites (Front-Left, Front-Right, Hind-Left, Hind-Right)
      this.sprites = {};

      // Aktive Abdrücke & Hunde
      this.footprints = [];
      this.particles = [];
      this.dogs = [];

      this.lastTime = 0;
      this.animId = null;
      this.nextSpawnTime = 0;
      this.isPaused = false;

      this.init();
    }

    init() {
      this.setupCanvas();
      this.generateSprites();

      // Responsives Verhalten bei Größenänderung des Fensters
      window.addEventListener('resize', () => this.resize());

      // Akkusparend: Pausieren, wenn der Tab nicht sichtbar ist
      document.addEventListener('visibilitychange', () => {
        this.isPaused = document.hidden;
        if (!this.isPaused) {
          this.lastTime = performance.now();
        }
      });

      // Ersten Hund zeitnah starten
      this.scheduleNextDog(600);

      // Render-Loop starten
      this.lastTime = performance.now();
      this.loop = this.loop.bind(this);
      this.animId = requestAnimationFrame(this.loop);
    }

    setupCanvas() {
      let canvas = document.getElementById(this.config.canvasId);
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = this.config.canvasId;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none'; // Keine Interaktion mit der Webseite
        canvas.style.zIndex = this.config.zIndex;
        this.config.container.appendChild(canvas);
      }
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true });
      this.resize();
    }

    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.width = w;
      this.height = h;
      this.canvas.width = Math.floor(w * this.dpr);
      this.canvas.height = Math.floor(h * this.dpr);
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
    }

    /**
     * Erzeugt hochaufgelöste Sprites in Offscreen-Canvases.
     * Dies garantiert maximale Performance (0ms Render-Last pro Frame).
     */
    generateSprites() {
      const types = ['front-left', 'front-right', 'hind-left', 'hind-right'];
      types.forEach(type => {
        this.sprites[type] = this.renderPawSprite(type);
      });
    }

    renderPawSprite(type) {
      const size = 130;
      const offCanvas = document.createElement('canvas');
      offCanvas.width = size;
      offCanvas.height = size;
      const octx = offCanvas.getContext('2d');

      const isHind = type.startsWith('hind');
      const isRight = type.endsWith('right');

      octx.save();
      octx.translate(size / 2, size / 2);

      // Rechte Pfote ist anatomisch gespiegelt
      if (isRight) {
        octx.scale(-1, 1);
      }

      // Hinterpfoten sind kompakter als Vorderpfoten
      const scale = isHind ? this.config.hindPawScaleRatio : 1.0;
      octx.scale(scale, scale);

      // Edler Gold-Farbverlauf
      const grad = octx.createRadialGradient(-3, -4, 2, 0, 2, 38);
      grad.addColorStop(0.0, this.config.goldHighlight);
      grad.addColorStop(0.32, this.config.goldColor);
      grad.addColorStop(0.82, this.config.goldShadow);
      grad.addColorStop(1.0, 'rgba(110, 79, 8, 0.4)');

      octx.fillStyle = grad;
      octx.shadowColor = this.config.glowColor;
      octx.shadowBlur = this.config.glowBlur;

      // --- 1. Hauptballen (Metacarpal/Metatarsal Pad) ---
      octx.beginPath();
      if (isHind) {
        // Hinterpfote: birnenförmiger Ballen
        octx.moveTo(0, -5);
        octx.bezierCurveTo(8, -7, 16, 2, 14, 12);
        octx.bezierCurveTo(12, 19, 4, 21, 0, 17);
        octx.bezierCurveTo(-4, 21, -12, 19, -14, 12);
        octx.bezierCurveTo(-16, 2, -8, -7, 0, -5);
      } else {
        // Vorderpfote: markant dreilappiger Ballen mit Herz-Einbuchtung
        octx.moveTo(0, -3);
        octx.bezierCurveTo(7, -8, 17, 0, 16, 12);
        octx.bezierCurveTo(15, 20, 6, 22, 1.5, 17.5);
        octx.bezierCurveTo(0, 16.5, -1.5, 16.5, -1.5, 17.5);
        octx.bezierCurveTo(-6, 22, -15, 20, -16, 12);
        octx.bezierCurveTo(-17, 0, -7, -8, 0, -3);
      }
      octx.closePath();
      octx.fill();

      // Feines inneres Glanzlicht
      const innerGrad = octx.createRadialGradient(-2, 3, 1, 0, 5, 13);
      innerGrad.addColorStop(0, 'rgba(255, 255, 245, 0.45)');
      innerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      octx.fillStyle = innerGrad;
      octx.fill();

      // --- 2. Vier Zehenballen im anatomischen Bogen ---
      octx.fillStyle = grad;
      const toes = [
        { x: -14, y: -9, rx: 5.0, ry: 7.0, rot: -0.42 }, // Zehe 2 (außen links)
        { x: -5.5, y: -20, rx: 5.8, ry: 8.8, rot: -0.12 }, // Zehe 3 (innen links)
        { x: 5.5, y: -19, rx: 5.6, ry: 8.4, rot: 0.12 },  // Zehe 4 (innen rechts)
        { x: 13.5, y: -8, rx: 4.8, ry: 6.8, rot: 0.40 }   // Zehe 5 (außen rechts)
      ];

      toes.forEach(toe => {
        octx.save();
        octx.translate(toe.x, toe.y);
        octx.rotate(toe.rot);

        octx.beginPath();
        octx.ellipse(0, 0, toe.rx, toe.ry, 0, 0, Math.PI * 2);
        octx.fill();

        // Zehen-Glanzpunkt
        const toeHighlight = octx.createRadialGradient(-1, -2, 0.5, 0, 0, toe.rx);
        toeHighlight.addColorStop(0, 'rgba(255, 255, 245, 0.5)');
        toeHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        octx.fillStyle = toeHighlight;
        octx.fill();

        // 3. Krallen (fein & dezent)
        if (this.config.showClaws) {
          octx.fillStyle = 'rgba(255, 250, 220, 0.65)';
          octx.beginPath();
          octx.moveTo(-1.1, -toe.ry - 0.5);
          octx.quadraticCurveTo(0, -toe.ry - 4.5, 0, -toe.ry - 5.5);
          octx.quadraticCurveTo(0, -toe.ry - 4.5, 1.1, -toe.ry - 0.5);
          octx.closePath();
          octx.fill();
        }

        octx.restore();
      });

      octx.restore();
      return offCanvas;
    }

    scheduleNextDog(delay) {
      this.nextSpawnTime = performance.now() + (delay !== undefined ? delay : (
        this.config.pauseBetweenWalksMin +
        Math.random() * (this.config.pauseBetweenWalksMax - this.config.pauseBetweenWalksMin)
      ));
    }

    /**
     * Startet einen neuen Hund auf einem natürlich geschwungenen Catmull-Rom-Spline
     */
    spawnDog() {
      const w = this.width;
      const h = this.height;

      // Start- und Zielkanten zufällig wählen
      const sides = ['left', 'right', 'top', 'bottom'];
      const startSide = sides[Math.floor(Math.random() * sides.length)];
      let exitSide = sides[Math.floor(Math.random() * sides.length)];
      while (exitSide === startSide) {
        exitSide = sides[Math.floor(Math.random() * sides.length)];
      }

      const margin = 100;
      let startX, startY, endX, endY;

      if (startSide === 'left') { startX = -margin; startY = Math.random() * h; }
      else if (startSide === 'right') { startX = w + margin; startY = Math.random() * h; }
      else if (startSide === 'top') { startX = Math.random() * w; startY = -margin; }
      else { startX = Math.random() * w; startY = h + margin; }

      if (exitSide === 'left') { endX = -margin; endY = Math.random() * h; }
      else if (exitSide === 'right') { endX = w + margin; endY = Math.random() * h; }
      else if (exitSide === 'top') { endX = Math.random() * w; endY = -margin; }
      else { endX = Math.random() * w; endY = h + margin; }

      // 2 weiche Zwischenpunkte für geschwungene, lebendige Pfade
      const p1 = {
        x: w * (0.25 + Math.random() * 0.5) + (Math.random() - 0.5) * 120,
        y: h * (0.25 + Math.random() * 0.5) + (Math.random() - 0.5) * 120
      };
      const p2 = {
        x: (p1.x + endX) * 0.5 + (Math.random() - 0.5) * 140,
        y: (p1.y + endY) * 0.5 + (Math.random() - 0.5) * 140
      };

      const waypoints = [
        { x: startX, y: startY },
        p1,
        p2,
        { x: endX, y: endY }
      ];

      const dog = new QuadrupedPoodle({
        waypoints: waypoints,
        speed: this.config.dogSpeed * (0.9 + Math.random() * 0.2),
        strideLength: this.config.strideLength,
        trackWidth: this.config.trackWidth,
        hindOffsetLongitudinal: this.config.hindOffsetLongitudinal,
        hindOffsetLateral: this.config.hindOffsetLateral,
        hindPawScaleRatio: this.config.hindPawScaleRatio,
        scale: this.config.pawBaseScale * (0.95 + Math.random() * 0.1),
        onStep: (stepData) => this.addFootprint(stepData)
      });

      this.dogs.push(dog);
    }

    addFootprint(data) {
      this.footprints.push({
        x: data.x,
        y: data.y,
        angle: data.angle,
        type: data.type,
        scale: data.scale,
        createdAt: performance.now(),
        initialAlpha: 0.94
      });

      // Partikel nur erzeugen, wenn explizit aktiviert
      if (this.config.touchdownSparkles) {
        const count = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 3 + Math.random() * 8;
          this.particles.push({
            x: data.x + Math.cos(angle) * dist,
            y: data.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 0.15,
            vy: Math.sin(angle) * 0.15,
            alpha: 0.7,
            size: 0.8 + Math.random() * 1.2,
            life: 1.0,
            fadeSpeed: 0.002
          });
        }
      }
    }

    loop(currentTime) {
      this.animId = requestAnimationFrame(this.loop);

      if (this.isPaused) return;

      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      // Neue Hunde spawnen gemäß 'dogCount'
      if (currentTime >= this.nextSpawnTime) {
        if (this.dogs.length < this.config.dogCount) {
          this.spawnDog();
        }
        this.scheduleNextDog();
      }

      // Hunde auf dem Spline bewegen
      for (let i = this.dogs.length - 1; i >= 0; i--) {
        const dog = this.dogs[i];
        dog.update(dt);
        if (dog.isFinished) {
          this.dogs.splice(i, 1);
        }
      }

      // Zeichnen
      this.draw(currentTime, dt);
    }

    draw(currentTime, dt) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      const fadeDuration = this.config.fadeDuration;
      const smoothFadeIn = this.config.smoothFadeIn;
      const fadeInDuration = this.config.fadeInDuration;
      const touchdownFlash = this.config.touchdownFlash;

      // --- 1. Fußabdrücke zeichnen ---
      for (let i = this.footprints.length - 1; i >= 0; i--) {
        const fp = this.footprints[i];
        const age = currentTime - fp.createdAt;

        // Vollständig verblasste Abdrücke entfernen
        if (age >= fadeDuration) {
          this.footprints.splice(i, 1);
          continue;
        }

        // Sanftes Einblenden (kein plötzlicher Ruck/Aufblitzen)
        let alpha = fp.initialAlpha;
        if (smoothFadeIn && age < fadeInDuration) {
          alpha *= Math.min(1.0, age / fadeInDuration);
        }

        // Ruhiges, exponentielles Ausfaden
        const progress = age / fadeDuration;
        alpha *= Math.pow(1 - progress, 1.45);

        if (alpha <= 0.005) continue;

        const sprite = this.sprites[fp.type];
        if (!sprite) continue;

        ctx.save();
        ctx.translate(fp.x, fp.y);
        ctx.rotate(fp.angle + Math.PI / 2); // Ausrichtung in Laufrichtung

        // Skalierung: Bei deaktiviertem Aufblitzen absolut ruhig & stabil
        let currentScale = fp.scale;
        if (touchdownFlash && age < 200) {
          const impact = 1 - (age / 200);
          currentScale *= (1.0 + 0.07 * impact);
        }

        const drawSize = 42 * currentScale;
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          sprite,
          -drawSize / 2,
          -drawSize / 2,
          drawSize,
          drawSize
        );

        ctx.restore();
      }

      // --- 2. Partikel zeichnen (nur falls aktiviert) ---
      if (this.particles.length > 0) {
        ctx.save();
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= p.fadeSpeed * (dt * 1000);

          if (p.life <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          ctx.fillStyle = this.config.goldHighlight;
          ctx.globalAlpha = p.alpha * p.life;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    /**
     * Konfiguration zur Laufzeit aktualisieren
     */
    updateConfig(newOptions) {
      Object.assign(this.config, newOptions);

      // Falls sich Farben oder Glow ändern, Sprites neu cachen
      if (newOptions.goldColor || newOptions.goldHighlight || newOptions.goldShadow || newOptions.glowBlur !== undefined) {
        this.generateSprites();
      }

      // Falls die Anzahl der Hunde erhöht wurde, direkt prüfen ob nachgespawnt werden soll
      if (newOptions.dogCount && this.dogs.length < this.config.dogCount) {
        this.spawnDog();
      }
    }

    clear() {
      this.footprints = [];
      this.particles = [];
      this.dogs = [];
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
    }

    destroy() {
      if (this.animId) cancelAnimationFrame(this.animId);
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  /**
   * QuadrupedPoodle:
   * Steuert die 4-Takt-Schrittmechanik entlang eines Splines.
   * Vorder- und Hinterpfoten setzen als abgestimmtes Paar auf:
   * - Vorderpfote tritt zuerst auf
   * - Hinterpfote tritt kurz darauf mit klarem Längs- und Querversatz auf
   * -> Dadurch berühren sich Vorder- und Hinterpfote nie auf demselben Punkt!
   */
  class QuadrupedPoodle {
    constructor(config) {
      this.waypoints = config.waypoints;
      this.speed = config.speed;
      this.strideLength = config.strideLength;
      this.trackWidth = config.trackWidth;
      this.hindOffsetLongitudinal = config.hindOffsetLongitudinal;
      this.hindOffsetLateral = config.hindOffsetLateral;
      this.hindPawScaleRatio = config.hindPawScaleRatio;
      this.scale = config.scale;
      this.onStep = config.onStep;

      // Glatter Catmull-Rom Spline
      this.curve = new SmoothSpline(this.waypoints);
      this.totalLength = this.curve.getLength();

      this.currentDist = 0;
      this.isFinished = false;

      // 0 = Links, 1 = Rechts
      this.strideSide = Math.random() < 0.5 ? 0 : 1;
      this.pendingSteps = [];

      this.nextStrideDist = 20;
    }

    update(dt) {
      if (this.isFinished) return;

      const deltaDist = this.speed * dt;
      this.currentDist += deltaDist;

      // Neue Strides (Schrittpaare) auf dem Spline einplanen
      while (this.currentDist >= this.nextStrideDist && this.nextStrideDist <= this.totalLength + 40) {
        this.planStridePair(this.nextStrideDist, this.strideSide);
        this.nextStrideDist += this.strideLength;
        this.strideSide = 1 - this.strideSide; // Wechsel von Links zu Rechts
      }

      // Anstehende Schritte ausführen, wenn die Distanz erreicht ist
      for (let i = this.pendingSteps.length - 1; i >= 0; i--) {
        const step = this.pendingSteps[i];
        if (this.currentDist >= step.triggerDist) {
          this.executeStep(step);
          this.pendingSteps.splice(i, 1);
        }
      }

      // Beenden, sobald der Hund den Bildschirm komplett verlassen hat
      if (this.currentDist > this.totalLength + 70 && this.pendingSteps.length === 0) {
        this.isFinished = true;
      }
    }

    planStridePair(frontDist, side) {
      const isRight = (side === 1);
      // Hinterpfote setzt ca. 120-150ms nach der Vorderpfote auf
      const hindLagDist = Math.max(10, this.strideLength * 0.24);

      // 1. Vorderpfote
      this.pendingSteps.push({
        triggerDist: frontDist,
        sampleDist: frontDist,
        isHind: false,
        isRight: isRight
      });

      // 2. Hinterpfote: Mit klarem Längs- und Querversatz zur Vorderpfote
      this.pendingSteps.push({
        triggerDist: frontDist + hindLagDist,
        sampleDist: frontDist - this.hindOffsetLongitudinal, // Klar versetzt nach hinten
        isHind: true,
        isRight: isRight
      });
    }

    executeStep(step) {
      const sampleDist = Math.max(0, Math.min(this.totalLength, step.sampleDist));
      const pt = this.curve.getPointAtDistance(sampleDist);
      const tangent = this.curve.getTangentAtDistance(sampleDist);
      const angle = Math.atan2(tangent.y, tangent.x);

      // Seitlicher Normalenvektor
      const normalAngle = angle + Math.PI / 2;

      // Seitlicher Versatz:
      // Vorderpfoten: +-(trackWidth / 2)
      // Hinterpfoten: +-(trackWidth / 2 - hindOffsetLateral)
      // -> Hinterpfote steht sichtbar weiter innen und weiter hinten!
      let lateralOffset = this.trackWidth * 0.5;
      if (step.isHind) {
        lateralOffset = Math.max(4, (this.trackWidth * 0.5) - this.hindOffsetLateral);
      }
      const lateralDist = lateralOffset * (step.isRight ? 1 : -1);

      const pawX = pt.x + Math.cos(normalAngle) * lateralDist;
      const pawY = pt.y + Math.sin(normalAngle) * lateralDist;

      // Feine Einwärtsdrehung der Zehen
      const toeIn = (step.isRight ? -0.04 : 0.04) + (Math.random() - 0.5) * 0.03;

      const type = (step.isHind ? 'hind-' : 'front-') + (step.isRight ? 'right' : 'left');

      this.onStep({
        x: pawX,
        y: pawY,
        angle: angle + toeIn,
        type: type,
        scale: this.scale * (step.isHind ? this.hindPawScaleRatio : 1.0)
      });
    }
  }

  /**
   * Catmull-Rom Spline mit gleichmäßiger Bogenlängen-Parametrisierung
   */
  class SmoothSpline {
    constructor(points) {
      this.points = points;
      this.samples = [];
      this.totalLength = 0;
      this.buildTable();
    }

    buildTable() {
      const step = 0.02;
      const n = this.points.length - 1;
      let prevPt = this.interpolate(0);
      this.samples.push({ t: 0, dist: 0, pt: prevPt });

      let accumulated = 0;
      for (let t = step; t <= n; t += step) {
        const pt = this.interpolate(t);
        accumulated += Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y);
        this.samples.push({ t: t, dist: accumulated, pt: pt });
        prevPt = pt;
      }
      this.totalLength = accumulated;
    }

    getLength() {
      return this.totalLength;
    }

    getPointAtDistance(distance) {
      if (distance <= 0) return this.samples[0].pt;
      if (distance >= this.totalLength) return this.samples[this.samples.length - 1].pt;

      let low = 0, high = this.samples.length - 1;
      while (low <= high) {
        const mid = (low + high) >> 1;
        if (this.samples[mid].dist < distance) low = mid + 1;
        else high = mid - 1;
      }

      const i0 = Math.max(0, high);
      const i1 = Math.min(this.samples.length - 1, low);
      if (i0 === i1) return this.samples[i0].pt;

      const d0 = this.samples[i0].dist;
      const d1 = this.samples[i1].dist;
      const ratio = (distance - d0) / (d1 - d0 || 1);

      return {
        x: this.samples[i0].pt.x + (this.samples[i1].pt.x - this.samples[i0].pt.x) * ratio,
        y: this.samples[i0].pt.y + (this.samples[i1].pt.y - this.samples[i0].pt.y) * ratio
      };
    }

    getTangentAtDistance(distance) {
      const d1 = Math.max(0, distance - 4);
      const d2 = Math.min(this.totalLength, distance + 4);
      const p1 = this.getPointAtDistance(d1);
      const p2 = this.getPointAtDistance(d2);
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || 1;
      return { x: dx / len, y: dy / len };
    }

    interpolate(t) {
      const pts = this.points;
      const n = pts.length - 1;
      const clampedT = Math.max(0, Math.min(n, t));
      const i = Math.floor(clampedT);
      const frac = clampedT - i;

      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[Math.min(n, i + 1)];
      const p3 = pts[Math.min(n, i + 2)];

      return {
        x: this.catmullRom(p0.x, p1.x, p2.x, p3.x, frac),
        y: this.catmullRom(p0.y, p1.y, p2.y, p3.y, frac)
      };
    }

    catmullRom(p0, p1, p2, p3, t) {
      const t2 = t * t;
      const t3 = t2 * t;
      return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
      );
    }
  }

  // Global für window bereitstellen
  window.PoodlePawEngine = PoodlePawEngine;

  // Automatische Initialisierung bei Vorhandensein von data-poodle-paws
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-poodle-paws]')) {
      window.poodlePawsInstance = new PoodlePawEngine();
    }
  });

})(window);
