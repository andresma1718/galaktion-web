/* =========================================================================
   GALAKTION — FONDO VIVO (red neuronal / circuitos)
   -------------------------------------------------------------------------
   Un canvas fijo detrás de todo el contenido:
   · Nodos de luz plateada tenue, unidos por líneas finas, que flotan lento.
   · Escritorio: los nodos cercanos al mouse se iluminan y se conectan a él.
   · Celular: la red se desliza suavemente con el scroll (parallax por profundidad).
   · De vez en cuando un pulso de luz recorre una línea, como un dato.
   Rendimiento:
   · Cantidad de nodos según el tamaño de pantalla y la potencia del equipo,
     y se reduce sola si los cuadros por segundo caen.
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

  /* ---- Capacidades del equipo ---- */
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const nucleos = navigator.hardwareConcurrency || 4;
  const memoria = navigator.deviceMemory || 4;
  const equipoModesto = nucleos <= 2 || memoria <= 2; // equipos realmente básicos; los demás se ajustan solos midiendo los fps

  /* ---- Ajustes visuales (todo en tonos plata) ---- */
  const AJUSTES = {
    densidad: conMouse ? 11500 : 11000, // px² de pantalla por nodo
    maxNodos: conMouse ? 120 : 48,
    minNodos: 18,
    distancia: conMouse ? 150 : 115,   // distancia máxima para unir dos nodos
    radioMouse: 190,
    velocidad: 0.12,                   // px por cuadro (muy lento)
    alfaLinea: 0.5,
    alfaNodo: 0.75,
    pulsoCada: [1400, 2800],           // ms entre pulsos
    maxPulsos: 3,
  };

  let ancho = 0, alto = 0, dpr = 1;
  let nodos = [];
  let pulsos = [];
  let proximoPulso = 0;
  const mouse = { x: -9999, y: -9999, activo: false };
  let scrollPrevio = window.scrollY;
  let empujeScroll = 0;

  /* Brillo pre-dibujado (más barato que shadowBlur en cada cuadro) */
  const brillo = document.createElement('canvas');
  (function prepararBrillo() {
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

  /* -----------------------------------------------------------------------
     Tamaño y creación de nodos
     ----------------------------------------------------------------------- */
  let factorCalidad = equipoModesto ? 0.6 : 1;

  function cantidadNodos() {
    const n = Math.round(((ancho * alto) / AJUSTES.densidad) * factorCalidad);
    return Math.max(AJUSTES.minNodos, Math.min(Math.round(AJUSTES.maxNodos * factorCalidad), n));
  }

  function crearNodo(x, y) {
    const angulo = Math.random() * Math.PI * 2;
    const profundidad = 0.35 + Math.random() * 0.65; // 0.35 lejos · 1 cerca
    return {
      x: x != null ? x : Math.random() * ancho,
      y: y != null ? y : Math.random() * alto,
      vx: Math.cos(angulo) * AJUSTES.velocidad * profundidad,
      vy: Math.sin(angulo) * AJUSTES.velocidad * profundidad,
      z: profundidad,
      r: 0.7 + profundidad * 1.1,
      luz: 0, // brillo extra por cercanía al mouse (0–1, suavizado)
    };
  }

  function ajustarTamano() {
    dpr = Math.min(window.devicePixelRatio || 1, conMouse ? 1.5 : 1.25);
    const anchoPrevio = ancho || window.innerWidth;
    const altoPrevio = alto || window.innerHeight;
    ancho = window.innerWidth;
    alto = window.innerHeight;
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Reubicar los nodos existentes proporcionalmente y ajustar la cantidad
    nodos.forEach((n) => { n.x *= ancho / anchoPrevio; n.y *= alto / altoPrevio; });
    const objetivo = cantidadNodos();
    while (nodos.length < objetivo) nodos.push(crearNodo());
    if (nodos.length > objetivo) nodos.length = objetivo;
  }

  /* -----------------------------------------------------------------------
     Entrada: mouse (escritorio) y scroll (celular)
     ----------------------------------------------------------------------- */
  if (conMouse) {
    window.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.activo = true;
    }, { passive: true });
    document.addEventListener('mouseleave', () => { mouse.activo = false; });
  }
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    empujeScroll += y - scrollPrevio;
    scrollPrevio = y;
  }, { passive: true });

  /* -----------------------------------------------------------------------
     Pulsos de luz que viajan por una conexión
     ----------------------------------------------------------------------- */
  function lanzarPulso(ahora) {
    proximoPulso = ahora + AJUSTES.pulsoCada[0] + Math.random() * (AJUSTES.pulsoCada[1] - AJUSTES.pulsoCada[0]);
    if (pulsos.length >= AJUSTES.maxPulsos || nodos.length < 2) return;
    // Busca una pareja de nodos conectados, empezando desde un nodo al azar
    const d2max = AJUSTES.distancia * AJUSTES.distancia * 0.8;
    for (let intento = 0; intento < 12; intento++) {
      const a = nodos[(Math.random() * nodos.length) | 0];
      for (let k = 0; k < nodos.length; k++) {
        const b = nodos[k];
        if (b === a) continue;
        const dx = a.x - b.x, dy = a.y - b.y;
        if (dx * dx + dy * dy < d2max) {
          pulsos.push({ a, b, inicio: ahora, duracion: 900 + Math.random() * 700 });
          return;
        }
      }
    }
  }

  /* -----------------------------------------------------------------------
     Dibujo de un cuadro
     ----------------------------------------------------------------------- */
  function dibujar(ahora, moverse) {
    ctx.clearRect(0, 0, ancho, alto);

    // Empuje del scroll: en celular la red se desliza por profundidad (parallax)
    const empuje = moverse ? empujeScroll * (conMouse ? 0.04 : 0.12) : 0;
    empujeScroll *= 0.85;
    if (Math.abs(empujeScroll) < 0.1) empujeScroll = 0;

    const rm2 = AJUSTES.radioMouse * AJUSTES.radioMouse;
    const n = nodos.length;

    // 1. Mover nodos
    for (let i = 0; i < n; i++) {
      const p = nodos[i];
      if (moverse) {
        p.x += p.vx;
        p.y += p.vy - empuje * p.z;
        // Rebote suave en los bordes horizontales, vuelta por arriba/abajo
        if (p.x < -20) p.x = ancho + 20; else if (p.x > ancho + 20) p.x = -20;
        if (p.y < -20) p.y = alto + 20; else if (p.y > alto + 20) p.y = -20;
      }
      // Cercanía al mouse → la luz sube despacio y baja despacio
      let objetivo = 0;
      if (mouse.activo) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < rm2) {
          objetivo = 1 - Math.sqrt(d2) / AJUSTES.radioMouse;
          // Atracción muy leve hacia el cursor
          if (moverse) { p.x -= dx * 0.004 * objetivo; p.y -= dy * 0.004 * objetivo; }
        }
      }
      p.luz += (objetivo - p.luz) * 0.08;
    }

    // 2. Líneas entre nodos cercanos
    const dmax = AJUSTES.distancia;
    const dmax2 = dmax * dmax;
    ctx.lineWidth = 0.6;
    for (let i = 0; i < n; i++) {
      const a = nodos[i];
      for (let j = i + 1; j < n; j++) {
        const b = nodos[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > dmax2) continue;
        const cercania = 1 - Math.sqrt(d2) / dmax;
        const luz = Math.max(a.luz, b.luz);
        const alfa = cercania * AJUSTES.alfaLinea * ((a.z + b.z) / 2) * (1 + luz * 2.2);
        ctx.strokeStyle = 'rgba(200,200,200,' + Math.min(alfa, 0.7).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // 3. Líneas de los nodos cercanos hacia el mouse
    if (mouse.activo) {
      for (let i = 0; i < n; i++) {
        const p = nodos[i];
        if (p.luz < 0.05) continue;
        ctx.strokeStyle = 'rgba(232,232,232,' + (p.luz * 0.38).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // 4. Nodos (con halo cuando están iluminados)
    for (let i = 0; i < n; i++) {
      const p = nodos[i];
      const alfa = AJUSTES.alfaNodo * p.z + p.luz * 0.45;
      ctx.fillStyle = 'rgba(232,232,232,' + Math.min(alfa, 1).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + p.luz * 1.2, 0, Math.PI * 2);
      ctx.fill();
      if (p.luz > 0.08) {
        const t = 18 + p.luz * 22;
        ctx.globalAlpha = p.luz * 0.6;
        ctx.drawImage(brillo, p.x - t / 2, p.y - t / 2, t, t);
        ctx.globalAlpha = 1;
      }
    }

    // 5. Pulsos de datos
    if (moverse) {
      if (ahora > proximoPulso) lanzarPulso(ahora);
      pulsos = pulsos.filter((pu) => {
        const t = (ahora - pu.inicio) / pu.duracion;
        if (t >= 1) return false;
        const dx = pu.b.x - pu.a.x, dy = pu.b.y - pu.a.y;
        if (dx * dx + dy * dy > dmax2 * 1.4) return false; // la conexión se rompió
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // suave
        const x = pu.a.x + dx * e, y = pu.a.y + dy * e;
        const intensidad = Math.sin(Math.PI * t); // aparece y se apaga
        // Estela sobre la línea
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.35 * intensidad).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pu.a.x + dx * Math.max(0, e - 0.18), pu.a.y + dy * Math.max(0, e - 0.18));
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.lineWidth = 0.6;
        // Punto de luz
        const t2 = 26;
        ctx.globalAlpha = intensidad;
        ctx.drawImage(brillo, x - t2 / 2, y - t2 / 2, t2, t2);
        ctx.globalAlpha = 1;
        return true;
      });
    }
  }

  /* -----------------------------------------------------------------------
     Bucle: pausa si la pestaña está oculta o si el hero cubre la pantalla
     ----------------------------------------------------------------------- */
  const hero = document.querySelector('.hero');
  function heroCubre() {
    if (!hero) return false;
    return hero.getBoundingClientRect().bottom >= window.innerHeight - 1;
  }

  let corriendo = false;
  let rafId = 0;
  let ultimo = 0;
  const muestras = [];

  function cuadro(ahora) {
    rafId = requestAnimationFrame(cuadro);
    // Medidor de rendimiento: si los cuadros tardan mucho, bajamos la cantidad de nodos
    if (ultimo) {
      muestras.push(ahora - ultimo);
      if (muestras.length >= 90) {
        const promedio = muestras.reduce((s, v) => s + v, 0) / muestras.length;
        muestras.length = 0;
        if (promedio > 24 && factorCalidad > 0.35) {
          factorCalidad *= 0.7;
          nodos.length = cantidadNodos();
        }
      }
    }
    ultimo = ahora;

    if (heroCubre()) { canvas.style.opacity = '0'; return; }
    canvas.style.opacity = '';
    dibujar(ahora, true);
  }

  function iniciar() {
    if (corriendo || reducido) return;
    corriendo = true;
    ultimo = 0;
    rafId = requestAnimationFrame(cuadro);
  }
  function detener() {
    corriendo = false;
    cancelAnimationFrame(rafId);
  }

  document.addEventListener('visibilitychange', () => (document.hidden ? detener() : iniciar()));

  let temporizador = 0;
  window.addEventListener('resize', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => { ajustarTamano(); if (reducido) dibujar(0, false); }, 150);
  });

  ajustarTamano();
  if (reducido) {
    dibujar(0, false); // fondo estático
  } else {
    iniciar();
  }
})();
