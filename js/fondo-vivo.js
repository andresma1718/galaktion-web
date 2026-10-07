/* =========================================================================
   GALAKTION — FONDOS VIVOS POR PÁGINA
   -------------------------------------------------------------------------
   Un solo canvas fijo detrás del contenido, con una "escena" distinta en
   cada página, todas de la misma familia (líneas y luz plateada):

     INICIO      → red neuronal: nodos y líneas, pulsos de datos, reacciona al mouse
     SERVICIOS   → circuito impreso: pistas que se dibujan y encienden con el scroll
     PORTAFOLIO  → rejilla de luz en perspectiva que se ilumina donde pasa el cursor
     NOSOTROS    → partículas que flotan y forman la G en la sección de valores
     CONTACTO    → destello plateado que "respira" y sigue suavemente al mouse

   Motor común (rendimiento):
   · Resolución limitada (devicePixelRatio máx. 1.5 / 1.25 en celular).
   · Mide los cuadros por segundo y reduce la cantidad de elementos si el
     equipo no da abasto.
   · Se pausa con la pestaña oculta y mientras el hero de la G cubre la pantalla.
   · Con movimiento reducido se dibuja una sola vez, quieto.
   ========================================================================= */

(function () {
  'use strict';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  canvas.className = 'fondo-vivo';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  /* =======================================================================
     ESTADO COMPARTIDO
     ======================================================================= */
  const conMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const E = {
    ancho: 0,
    alto: 0,
    dpr: 1,
    reducido: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    // Equipos realmente básicos arrancan con menos elementos; el resto se ajusta midiendo los fps
    calidad: ((navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory || 4) <= 2) ? 0.6 : 1,
    mouse: { x: -9999, y: -9999, activo: false },
    scrollY: window.scrollY,
    velScroll: 0, // px por cuadro, suavizado
  };

  /* Brillo pre-dibujado (más barato que shadowBlur en cada cuadro) */
  const brillo = document.createElement('canvas');
  (function () {
    const t = 64;
    brillo.width = brillo.height = t;
    const b = brillo.getContext('2d');
    const g = b.createRadialGradient(t / 2, t / 2, 0, t / 2, t / 2, t / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.25, 'rgba(232,232,232,0.35)');
    g.addColorStop(1, 'rgba(232,232,232,0)');
    b.fillStyle = g;
    b.fillRect(0, 0, t, t);
  })();
  function destello(x, y, tam, a) {
    ctx.globalAlpha = a;
    ctx.drawImage(brillo, x - tam / 2, y - tam / 2, tam, tam);
    ctx.globalAlpha = 1;
  }

  const rnd = (a, b) => a + Math.random() * (b - a);
  const limitar = (v, a, b) => Math.max(a, Math.min(b, v));
  const suave = (t) => t * t * (3 - 2 * t); // smoothstep
  const alfa = (a) => Math.max(0, Math.min(1, a)).toFixed(3);

  /* Contorno de la G (mismas coordenadas que el logo: caja 420 × 560) */
  const G = [[136, 0], [368, 0], [304, 64], [162.5, 64], [64, 162.5], [64, 296.4], [247.6, 452.5], [356, 360.4], [356, 254], [168, 254], [232, 190], [420, 190], [420, 390], [220, 560], [220, 513], [0, 326], [0, 136]];

  /* =======================================================================
     ESCENA 1 — RED NEURONAL (inicio y página de error)
     ======================================================================= */
  function escenaRed() {
    const A = {
      densidad: conMouse ? 11500 : 11000, // px² de pantalla por nodo
      maxNodos: conMouse ? 120 : 48,
      distancia: conMouse ? 150 : 115,    // distancia máxima para unir dos nodos
      radioMouse: 190,
      velocidad: 0.12,
      alfaLinea: 0.5,
      alfaNodo: 0.75,
    };
    const nodos = [];
    let pulsos = [];
    let proximoPulso = 0;

    function crearNodo() {
      const ang = Math.random() * Math.PI * 2;
      const z = rnd(0.35, 1); // profundidad: 0.35 lejos · 1 cerca
      return { x: rnd(0, E.ancho), y: rnd(0, E.alto), vx: Math.cos(ang) * A.velocidad * z, vy: Math.sin(ang) * A.velocidad * z, z, r: 0.7 + z * 1.1, luz: 0 };
    }

    return {
      ajustar(anchoPrevio, altoPrevio) {
        nodos.forEach((n) => { n.x *= E.ancho / anchoPrevio; n.y *= E.alto / altoPrevio; });
        const objetivo = Math.max(18, Math.min(Math.round(A.maxNodos * E.calidad), Math.round((E.ancho * E.alto) / A.densidad * E.calidad)));
        while (nodos.length < objetivo) nodos.push(crearNodo());
        nodos.length = objetivo;
      },
      dibujar(ahora, mover) {
        const { mouse } = E;
        const empuje = mover ? E.velScroll * (conMouse ? 0.04 : 0.12) : 0;
        const rm2 = A.radioMouse * A.radioMouse;
        const n = nodos.length;

        // 1. Mover nodos y calcular su luz por cercanía al mouse
        for (let i = 0; i < n; i++) {
          const p = nodos[i];
          if (mover) {
            p.x += p.vx;
            p.y += p.vy - empuje * p.z;
            if (p.x < -20) p.x = E.ancho + 20; else if (p.x > E.ancho + 20) p.x = -20;
            if (p.y < -20) p.y = E.alto + 20; else if (p.y > E.alto + 20) p.y = -20;
          }
          let objetivo = 0;
          if (mouse.activo) {
            const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
            if (d2 < rm2) {
              objetivo = 1 - Math.sqrt(d2) / A.radioMouse;
              if (mover) { p.x -= dx * 0.004 * objetivo; p.y -= dy * 0.004 * objetivo; }
            }
          }
          p.luz += (objetivo - p.luz) * 0.08;
        }

        // 2. Líneas entre nodos cercanos
        const dmax = A.distancia, dmax2 = dmax * dmax;
        ctx.lineWidth = 0.6;
        for (let i = 0; i < n; i++) {
          const a = nodos[i];
          for (let j = i + 1; j < n; j++) {
            const b = nodos[j];
            const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
            if (d2 > dmax2) continue;
            const cerca = 1 - Math.sqrt(d2) / dmax;
            const luz = Math.max(a.luz, b.luz);
            ctx.strokeStyle = 'rgba(200,200,200,' + alfa(Math.min(0.7, cerca * A.alfaLinea * ((a.z + b.z) / 2) * (1 + luz * 2.2))) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }

        // 3. Conexiones hacia el mouse
        if (mouse.activo) {
          for (let i = 0; i < n; i++) {
            const p = nodos[i];
            if (p.luz < 0.05) continue;
            ctx.strokeStyle = 'rgba(232,232,232,' + alfa(p.luz * 0.38) + ')';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }

        // 4. Nodos (con halo cuando están iluminados)
        for (let i = 0; i < n; i++) {
          const p = nodos[i];
          ctx.fillStyle = 'rgba(232,232,232,' + alfa(A.alfaNodo * p.z + p.luz * 0.45) + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r + p.luz * 1.2, 0, Math.PI * 2); ctx.fill();
          if (p.luz > 0.08) destello(p.x, p.y, 18 + p.luz * 22, p.luz * 0.6);
        }

        // 5. Pulsos de datos que viajan por una conexión
        if (!mover) return;
        if (ahora > proximoPulso) {
          proximoPulso = ahora + rnd(1400, 2800);
          if (pulsos.length < 3 && n > 1) {
            const lim = dmax2 * 0.8;
            buscar: for (let k = 0; k < 12; k++) {
              const a = nodos[(Math.random() * n) | 0];
              for (let j = 0; j < n; j++) {
                const b = nodos[j];
                if (b === a) continue;
                const dx = a.x - b.x, dy = a.y - b.y;
                if (dx * dx + dy * dy < lim) { pulsos.push({ a, b, inicio: ahora, dur: rnd(900, 1600) }); break buscar; }
              }
            }
          }
        }
        pulsos = pulsos.filter((pu) => {
          const t = (ahora - pu.inicio) / pu.dur;
          if (t >= 1) return false;
          const dx = pu.b.x - pu.a.x, dy = pu.b.y - pu.a.y;
          if (dx * dx + dy * dy > dmax2 * 1.4) return false; // la conexión se rompió
          const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const x = pu.a.x + dx * e, y = pu.a.y + dy * e, k = Math.sin(Math.PI * t);
          ctx.strokeStyle = 'rgba(255,255,255,' + alfa(0.35 * k) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pu.a.x + dx * Math.max(0, e - 0.18), pu.a.y + dy * Math.max(0, e - 0.18));
          ctx.lineTo(x, y); ctx.stroke();
          ctx.lineWidth = 0.6;
          destello(x, y, 26, k);
          return true;
        });
      },
    };
  }

  /* =======================================================================
     ESCENA 2 — CIRCUITO IMPRESO (servicios)
     Pistas con giros a 45° repartidas a lo largo de la página. Se dibujan a
     medida que bajas y, una vez completas, las recorren pulsos de luz.
     La placa se mueve más lento que el contenido (parallax).
     ======================================================================= */
  function escenaCircuito() {
    const PASO = 22;        // retícula de la placa
    const PARALLAX = 0.55;  // la placa se mueve al 55 % del scroll
    let pistas = [];
    let pulsos = [];
    let proximoPulso = 0;

    function crearPista(x, y) {
      // Camino hacia abajo con desvíos diagonales y tramos cortos horizontales
      const pts = [[x, y]];
      let tramos = 3 + ((Math.random() * 4) | 0);
      while (tramos--) {
        const [px, py] = pts[pts.length - 1];
        const tipo = Math.random();
        const lado = Math.random() < 0.5 ? -1 : 1;
        if (tipo < 0.5) pts.push([px, py + PASO * (2 + ((Math.random() * 6) | 0))]);                       // baja
        else if (tipo < 0.85) { const d = PASO * (1 + ((Math.random() * 3) | 0)); pts.push([px + d * lado, py + d]); } // diagonal 45°
        else pts.push([px + PASO * (1 + ((Math.random() * 3) | 0)) * lado, py]);                          // horizontal
      }
      const largos = [0];
      for (let i = 1; i < pts.length; i++) largos.push(largos[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const ys = pts.map((p) => p[1]);
      return { pts, largos, total: largos[largos.length - 1], arriba: Math.min(...ys), abajo: Math.max(...ys), brillo: rnd(0.55, 1) };
    }

    function generar() {
      const doc = document.documentElement.scrollHeight;
      const altoCapa = Math.max(0, doc - E.alto) * PARALLAX + E.alto;
      const porPantalla = (E.ancho / (conMouse ? 85 : 70)) * E.calidad;
      const total = Math.round(porPantalla * (altoCapa / E.alto));
      pistas = [];
      pulsos = [];
      for (let i = 0; i < total; i++) {
        const x = Math.round(rnd(-0.05, 1.05) * E.ancho / PASO) * PASO;
        const y = Math.round(rnd(-0.1, 1) * altoCapa / PASO) * PASO;
        pistas.push(crearPista(x, y));
      }
    }

    // Punto a una distancia L desde el inicio de la pista
    function puntoEn(p, L) {
      for (let i = 1; i < p.pts.length; i++) {
        if (L <= p.largos[i]) {
          const t = (L - p.largos[i - 1]) / (p.largos[i] - p.largos[i - 1] || 1);
          return [p.pts[i - 1][0] + (p.pts[i][0] - p.pts[i - 1][0]) * t, p.pts[i - 1][1] + (p.pts[i][1] - p.pts[i - 1][1]) * t];
        }
      }
      return p.pts[p.pts.length - 1];
    }
    // Traza la pista desde la distancia L0 hasta L1
    function trazar(p, L0, L1, dy) {
      ctx.beginPath();
      const a = puntoEn(p, L0);
      ctx.moveTo(a[0], a[1] - dy);
      for (let i = 1; i < p.pts.length; i++) {
        if (p.largos[i] <= L0) continue;
        if (p.largos[i] >= L1) break;
        ctx.lineTo(p.pts[i][0], p.pts[i][1] - dy);
      }
      const b = puntoEn(p, L1);
      ctx.lineTo(b[0], b[1] - dy);
      ctx.stroke();
    }

    return {
      ajustar: generar,
      regenerar: generar,
      dibujar(ahora, mover) {
        const dy = E.reducido ? 0 : E.scrollY * PARALLAX; // desplazamiento de la placa
        const encendido = dy + E.alto * 0.92;             // hasta dónde ya se encendió
        const completas = [];
        ctx.lineWidth = 1;
        ctx.lineJoin = 'round';

        for (const p of pistas) {
          if (p.abajo < dy - 40 || p.arriba > dy + E.alto + 40) continue;
          const prog = E.reducido ? 1 : limitar((encendido - p.arriba) / (p.abajo - p.arriba + E.alto * 0.35), 0, 1);
          // Pista apagada (el "cobre" tenue) y la parte ya encendida
          ctx.strokeStyle = 'rgba(192,192,192,' + alfa(0.05 * p.brillo) + ')';
          trazar(p, 0, p.total, dy);
          if (prog <= 0) continue;
          const L = p.total * suave(prog);
          ctx.strokeStyle = 'rgba(220,220,220,' + alfa(0.26 * p.brillo) + ')';
          trazar(p, 0, L, dy);
          // Pad de inicio
          const [x0, y0] = p.pts[0];
          ctx.strokeStyle = 'rgba(220,220,220,' + alfa(0.35 * p.brillo) + ')';
          ctx.beginPath(); ctx.arc(x0, y0 - dy, 2.5, 0, Math.PI * 2); ctx.stroke();
          if (prog < 1) {
            const [hx, hy] = puntoEn(p, L); // cabeza que se va encendiendo
            destello(hx, hy - dy, 22, 0.75 * p.brillo);
          } else {
            const [x1, y1] = p.pts[p.pts.length - 1]; // pad final
            ctx.fillStyle = 'rgba(232,232,232,' + alfa(0.4 * p.brillo) + ')';
            ctx.beginPath(); ctx.arc(x1, y1 - dy, 2.2, 0, Math.PI * 2); ctx.fill();
            completas.push(p);
          }
        }

        // Pulsos que fluyen por las pistas encendidas (más rápidos al hacer scroll)
        if (!mover) return;
        if (ahora > proximoPulso && completas.length) {
          proximoPulso = ahora + rnd(350, 900);
          if (pulsos.length < 6) pulsos.push({ p: completas[(Math.random() * completas.length) | 0], L: 0, vel: rnd(1.2, 2.2) });
        }
        const extra = Math.min(6, Math.abs(E.velScroll) * 0.25);
        pulsos = pulsos.filter((pu) => {
          pu.L += pu.vel + extra;
          if (pu.L >= pu.p.total) return false;
          ctx.strokeStyle = 'rgba(255,255,255,0.45)';
          ctx.lineWidth = 1.2;
          trazar(pu.p, Math.max(0, pu.L - 40), pu.L, dy);
          ctx.lineWidth = 1;
          const [x, y] = puntoEn(pu.p, pu.L);
          destello(x, y - dy, 20, 0.9);
          return true;
        });
      },
    };
  }

  /* =======================================================================
     ESCENA 3 — REJILLA DE LUZ EN PERSPECTIVA (portafolio)
     Un piso de líneas que se pierde en el horizonte y avanza muy lento.
     Una luz (el cursor, o un punto que deambula en celular) la ilumina.
     ======================================================================= */
  function escenaRejilla() {
    const luz = { x: 0, y: 0 };
    let avance = 0;

    return {
      ajustar() { luz.x = E.ancho * 0.6; luz.y = E.alto * 0.7; },
      dibujar(ahora, mover) {
        const W = E.ancho, H = E.alto;
        const horizonte = H * 0.38;
        const cx = W / 2;
        const f = H * 0.45;        // escala de la proyección
        const camara = 1.2;        // altura de la cámara sobre el piso
        const cerca = 0.5, lejos = 26;

        if (mover) avance = (avance + 0.004 + Math.abs(E.velScroll) * 0.0009) % 1;

        // La luz sigue al mouse; en celular deambula sola y reacciona al scroll
        let tx, ty;
        if (E.mouse.activo) { tx = E.mouse.x; ty = E.mouse.y; }
        else {
          const t = ahora / 1000;
          tx = W * (0.5 + 0.32 * Math.sin(t * 0.23));
          ty = H * (0.68 + 0.18 * Math.sin(t * 0.31 + 1)) - E.velScroll * 2;
        }
        luz.x += (tx - luz.x) * 0.08;
        luz.y += (ty - luz.y) * 0.08;

        const proyX = (x, z) => cx + (x / z) * f;
        const proyY = (z) => horizonte + (camara / z) * f;

        const ruta = new Path2D();
        // Líneas hacia el horizonte
        const media = Math.ceil(((W / 2) / f) * cerca) + 1;
        for (let x = -media * 4; x <= media * 4; x++) {
          ruta.moveTo(proyX(x, cerca), proyY(cerca));
          ruta.lineTo(proyX(x, lejos), proyY(lejos));
        }
        // Líneas transversales que avanzan hacia quien mira
        for (let z = lejos; z > cerca; z--) {
          const zz = z - avance;
          if (zz <= cerca) continue;
          const y = proyY(zz);
          if (y > H + 2) continue;
          ruta.moveTo(0, y); ruta.lineTo(W, y);
        }

        // 1. Rejilla base, que se desvanece hacia el horizonte
        const base = ctx.createLinearGradient(0, horizonte, 0, H);
        base.addColorStop(0, 'rgba(192,192,192,0)');
        base.addColorStop(0.35, 'rgba(192,192,192,0.05)');
        base.addColorStop(1, 'rgba(192,192,192,0.11)');
        ctx.lineWidth = 1;
        ctx.strokeStyle = base;
        ctx.stroke(ruta);

        // 2. La misma rejilla, iluminada alrededor de la luz
        const r = Math.max(W, H) * 0.22;
        const foco = ctx.createRadialGradient(luz.x, luz.y, 0, luz.x, luz.y, r);
        foco.addColorStop(0, 'rgba(240,240,240,0.55)');
        foco.addColorStop(0.4, 'rgba(220,220,220,0.18)');
        foco.addColorStop(1, 'rgba(220,220,220,0)');
        ctx.strokeStyle = foco;
        ctx.stroke(ruta);

        // 3. Línea de horizonte con un leve resplandor
        const h = ctx.createLinearGradient(0, 0, W, 0);
        h.addColorStop(0, 'rgba(232,232,232,0)');
        h.addColorStop(0.5, 'rgba(232,232,232,0.16)');
        h.addColorStop(1, 'rgba(232,232,232,0)');
        ctx.fillStyle = h;
        ctx.fillRect(0, horizonte, W, 1);
      },
    };
  }

  /* =======================================================================
     ESCENA 4 — PARTÍCULAS QUE FORMAN LA G (nosotros)
     Flotan libres; mientras la sección de valores pasa por el centro de la
     pantalla se agrupan dibujando la G, y luego se vuelven a dispersar.
     ======================================================================= */
  function escenaParticulas() {
    const parts = [];
    const seccion = document.querySelector('.valores');

    function dentroDeG(x, y) {
      let dentro = false;
      for (let i = 0, j = G.length - 1; i < G.length; j = i++) {
        const [xi, yi] = G[i], [xj, yj] = G[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
      }
      return dentro;
    }
    function puntoDeG() {
      // 40 % sobre el borde (silueta nítida), 60 % adentro (relleno)
      if (Math.random() < 0.4) {
        const i = (Math.random() * G.length) | 0, j = (i + 1) % G.length, t = Math.random();
        return [G[i][0] + (G[j][0] - G[i][0]) * t, G[i][1] + (G[j][1] - G[i][1]) * t];
      }
      let x, y;
      do { x = Math.random() * 420; y = Math.random() * 560; } while (!dentroDeG(x, y));
      return [x, y];
    }

    return {
      ajustar() {
        const n = Math.round((conMouse ? 520 : 220) * E.calidad);
        while (parts.length < n) {
          const [gx, gy] = puntoDeG();
          const ang = Math.random() * Math.PI * 2, z = rnd(0.3, 1);
          parts.push({ x: rnd(0, E.ancho), y: rnd(0, E.alto), vx: Math.cos(ang) * 0.15 * z, vy: Math.sin(ang) * 0.15 * z, z, gx, gy, retraso: Math.random() * 0.35 });
        }
        parts.length = n;
      },
      dibujar(ahora, mover) {
        // Qué tanto se forma la G: 1 cuando la sección de valores está centrada
        let forma = 0;
        if (seccion && !E.reducido) {
          const r = seccion.getBoundingClientRect();
          forma = limitar(1 - Math.abs(r.top + r.height / 2 - E.alto / 2) / (E.alto * 0.8), 0, 1);
        }
        // Tamaño y posición de la G en pantalla (centrada)
        const alto = Math.min(E.alto * 0.62, (E.ancho * 0.72) * 560 / 420);
        const esc = alto / 560;
        const ox = (E.ancho - 420 * esc) / 2;
        const oy = (E.alto - alto) / 2;
        const { mouse } = E;
        const empuje = E.velScroll * 0.08;

        for (const p of parts) {
          if (mover) {
            p.x += p.vx; p.y += p.vy - empuje * p.z;
            if (p.x < -10) p.x = E.ancho + 10; else if (p.x > E.ancho + 10) p.x = -10;
            if (p.y < -10) p.y = E.alto + 10; else if (p.y > E.alto + 10) p.y = -10;
            // El mouse aparta suavemente a las partículas libres
            if (mouse.activo && forma < 0.5) {
              const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
              if (d2 < 14400) {
                const d = Math.sqrt(d2) || 1, k = (1 - d / 120) * 0.8;
                p.x += (dx / d) * k; p.y += (dy / d) * k;
              }
            }
          }
          // Cada partícula se une a la forma con un pequeño retraso propio
          const f = suave(limitar((forma - p.retraso) / (1 - p.retraso), 0, 1));
          const x = p.x + (ox + p.gx * esc - p.x) * f;
          const y = p.y + (oy + p.gy * esc - p.y) * f;
          ctx.fillStyle = 'rgba(232,232,232,' + alfa((0.28 + 0.4 * p.z) * (0.75 + f * 0.5)) + ')';
          const s = (0.8 + p.z * 1.1) * (1 - f * 0.25);
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      },
    };
  }

  /* =======================================================================
     ESCENA 5 — DESTELLO QUE RESPIRA (contacto)
     ======================================================================= */
  function escenaDestello() {
    const luz = { x: 0, y: 0 }, eco = { x: 0, y: 0 };

    function halo(x, y, r, a) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(240,240,240,' + alfa(a) + ')');
      g.addColorStop(0.35, 'rgba(200,200,200,' + alfa(a * 0.35) + ')');
      g.addColorStop(1, 'rgba(192,192,192,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    return {
      ajustar() { luz.x = eco.x = E.ancho * 0.72; luz.y = eco.y = E.alto * 0.3; },
      dibujar(ahora) {
        const t = ahora / 1000;
        let tx, ty;
        if (E.mouse.activo) { tx = E.mouse.x; ty = E.mouse.y; }
        else { tx = E.ancho * (0.62 + 0.22 * Math.sin(t * 0.17)); ty = E.alto * (0.35 + 0.2 * Math.sin(t * 0.23 + 2)) - E.velScroll * 3; }
        luz.x += (tx - luz.x) * 0.035; luz.y += (ty - luz.y) * 0.035; // sigue con calma
        eco.x += (luz.x - eco.x) * 0.02; eco.y += (luz.y - eco.y) * 0.02; // segundo halo, más lento

        const respira = E.reducido ? 0.5 : 0.5 + 0.5 * Math.sin(t * (Math.PI * 2) / 6); // ciclo de 6 s
        const base = Math.max(E.ancho, E.alto);
        halo(eco.x, eco.y, base * (0.42 + respira * 0.06), 0.05 + respira * 0.025);
        halo(luz.x, luz.y, base * (0.26 + respira * 0.07), 0.1 + respira * 0.07);
      },
    };
  }

  /* =======================================================================
     MOTOR
     ======================================================================= */
  const ESCENAS = {
    inicio: escenaRed,
    servicios: escenaCircuito,
    portafolio: escenaRejilla,
    nosotros: escenaParticulas,
    contacto: escenaDestello,
  };
  const escena = (ESCENAS[document.body.dataset.pagina] || escenaRed)();

  function ajustarTamano() {
    const anchoPrevio = E.ancho || window.innerWidth;
    const altoPrevio = E.alto || window.innerHeight;
    E.dpr = Math.min(window.devicePixelRatio || 1, conMouse ? 1.5 : 1.25);
    E.ancho = window.innerWidth;
    E.alto = window.innerHeight;
    canvas.width = Math.round(E.ancho * E.dpr);
    canvas.height = Math.round(E.alto * E.dpr);
    ctx.setTransform(E.dpr, 0, 0, E.dpr, 0, 0);
    escena.ajustar(anchoPrevio, altoPrevio);
  }

  function pintarQuieto() {
    ctx.clearRect(0, 0, E.ancho, E.alto);
    escena.dibujar(0, false);
  }

  /* ---- Entradas: mouse (escritorio) y scroll ---- */
  if (conMouse) {
    window.addEventListener('pointermove', (e) => { E.mouse.x = e.clientX; E.mouse.y = e.clientY; E.mouse.activo = true; }, { passive: true });
    document.addEventListener('mouseleave', () => { E.mouse.activo = false; });
  }
  let scrollPrevio = window.scrollY;
  let deltaScroll = 0;
  window.addEventListener('scroll', () => {
    E.scrollY = window.scrollY;
    deltaScroll += E.scrollY - scrollPrevio;
    scrollPrevio = E.scrollY;
    if (E.reducido) pintarQuieto();
  }, { passive: true });

  /* ---- Bucle con pausas ---- */
  const hero = document.querySelector('.hero');
  const heroCubre = () => !!hero && hero.getBoundingClientRect().bottom >= E.alto - 1;

  let corriendo = false, rafId = 0, ultimo = 0;
  const muestras = [];

  function cuadro(ahora) {
    rafId = requestAnimationFrame(cuadro);

    // Medidor de rendimiento: si los cuadros tardan más de 24 ms, menos elementos
    if (ultimo) {
      muestras.push(ahora - ultimo);
      if (muestras.length >= 90) {
        const prom = muestras.reduce((s, v) => s + v, 0) / muestras.length;
        muestras.length = 0;
        if (prom > 24 && E.calidad > 0.35) {
          E.calidad *= 0.7;
          escena.ajustar(E.ancho, E.alto);
        }
      }
    }
    ultimo = ahora;

    // Velocidad del scroll, suavizada
    E.velScroll = E.velScroll * 0.85 + deltaScroll * 0.15;
    deltaScroll = 0;

    // Mientras la G del inicio ocupa la pantalla, no hace falta dibujar
    if (heroCubre()) { canvas.style.opacity = '0'; return; }
    canvas.style.opacity = '';
    ctx.clearRect(0, 0, E.ancho, E.alto);
    escena.dibujar(ahora, true);
  }

  function iniciar() {
    if (corriendo || E.reducido) return;
    corriendo = true; ultimo = 0;
    rafId = requestAnimationFrame(cuadro);
  }
  function detener() { corriendo = false; cancelAnimationFrame(rafId); }

  document.addEventListener('visibilitychange', () => (document.hidden ? detener() : iniciar()));

  let espera = 0;
  window.addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(() => { ajustarTamano(); if (E.reducido) pintarQuieto(); }, 150);
  });
  // La altura de la página cambia cuando cargan imágenes y se crean las secciones fijadas
  window.addEventListener('load', () => setTimeout(() => {
    if (escena.regenerar) escena.regenerar();
    if (E.reducido) pintarQuieto();
  }, 800));

  ajustarTamano();
  if (E.reducido) pintarQuieto(); else iniciar();
})();
