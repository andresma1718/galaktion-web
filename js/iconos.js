/* =========================================================================
   GALAKTION — ÍCONOS ANIMADOS DE LAS TARJETAS DE SERVICIOS (inicio)
   -------------------------------------------------------------------------
   01 Diseño web   → una página se diseña sola dentro de un navegador
   02 Campañas Ads → barras y tendencia que suben, flecha y pulso de "clic"
   03 IA           → cerebro-red neuronal con impulsos de luz
   · Bucle lento mientras la tarjeta está en pantalla (se pausa fuera de ella).
   · Al pasar el mouse (o tocar en celular) se intensifican: más brillo y velocidad.
   · Con movimiento reducido o sin GSAP se muestran completos y quietos.
   ========================================================================= */

(function () {
  'use strict';

  if (!window.GK || !GK.animar) return; // sin animación: el SVG ya está dibujado completo

  const iconos = gsap.utils.toArray('.icono-animado');
  if (!iconos.length) return;

  // Prepara un trazo para "dibujarse" (stroke-dashoffset)
  function preparaTrazo(el) {
    const largo = el.getTotalLength ? Math.ceil(el.getTotalLength()) + 1 : 200;
    gsap.set(el, { strokeDasharray: largo, strokeDashoffset: largo });
    return largo;
  }

  /* ---------------------------------------------------------------------
     01 — DISEÑO WEB
     --------------------------------------------------------------------- */
  function iconoWeb(svg) {
    const piezas = gsap.utils.toArray('.web-pieza', svg);
    const cursor = svg.querySelector('.web-cursor');
    const boton = svg.querySelector('.web-boton');
    piezas.forEach(preparaTrazo);

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: true });
    tl.set(piezas, { opacity: 1 })
      .set(cursor, { x: 30, y: 40 })
      .to(cursor, { opacity: 1, duration: 0.3 });
    piezas.forEach((p) => {
      const [x, y] = p.dataset.fin.split(',').map(Number);
      tl.to(p, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.inOut' })
        .to(cursor, { x, y, duration: 0.45, ease: 'power2.inOut' }, '<');
    });
    tl.to(boton, { fill: 'rgba(232,232,232,0.28)', duration: 0.25 })   // el botón "se presiona"
      .to(cursor, { scale: 0.8, duration: 0.12, yoyo: true, repeat: 1, transformOrigin: '0% 0%' }, '<')
      .to(boton, { fill: 'rgba(232,232,232,0)', duration: 0.4 })
      .to({}, { duration: 0.9 })                                       // se queda un momento completo
      .to([piezas, cursor], { opacity: 0, duration: 0.5 })
      .add(() => piezas.forEach((p) => gsap.set(p, { strokeDashoffset: p.style.strokeDasharray })));
    return { tl };
  }

  /* ---------------------------------------------------------------------
     02 — PUBLICIDAD Y CAMPAÑAS ADS
     --------------------------------------------------------------------- */
  function iconoAds(svg) {
    const barras = gsap.utils.toArray('.ads-barras rect', svg);
    const linea = svg.querySelector('.ads-linea');
    const flecha = svg.querySelector('.ads-flecha');
    const pulsos = gsap.utils.toArray('.ads-pulso', svg);
    const centro = svg.querySelector('.ads-centro');
    preparaTrazo(linea);
    preparaTrazo(flecha);
    gsap.set(barras, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(centro, { scale: 0, transformOrigin: '50% 50%' });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5, paused: true });
    tl.to(barras, { scaleY: 1, duration: 0.6, stagger: 0.18, ease: 'power3.out' })
      .to(linea, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0.2)
      .to(flecha, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' })
      .to(centro, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, '<')
      .fromTo(pulsos, { attr: { r: 3 }, opacity: 0.9 }, { attr: { r: 15 }, opacity: 0, duration: 1.1, stagger: 0.35, ease: 'power2.out' })
      .to({}, { duration: 0.5 })
      .to([barras, linea, flecha, centro], { opacity: 0, duration: 0.45 })
      .add(() => {
        gsap.set(barras, { scaleY: 0, opacity: 1 });
        gsap.set([linea, flecha], { strokeDashoffset: (i, el) => el.style.strokeDasharray, opacity: 1 });
        gsap.set(centro, { scale: 0, opacity: 1 });
      });
    return { tl };
  }

  /* ---------------------------------------------------------------------
     03 — AUTOMATIZACIÓN CON IA (cerebro-red neuronal)
     --------------------------------------------------------------------- */
  function iconoIA(svg) {
    const nodos = gsap.utils.toArray('.ia-nodos circle', svg);
    const lineas = gsap.utils.toArray('.ia-lineas line', svg);
    const capaImpulsos = svg.querySelector('.ia-impulsos');
    const pos = nodos.map((n) => [+n.getAttribute('cx'), +n.getAttribute('cy')]);
    const radios = nodos.map((n) => n.getAttribute('r'));

    // Vecinos de cada nodo, con la línea que los une
    const vecinos = nodos.map(() => []);
    lineas.forEach((l) => {
      const a = +l.dataset.a, b = +l.dataset.b;
      vecinos[a].push({ n: b, l });
      vecinos[b].push({ n: a, l });
    });

    // Los nodos "respiran" a ritmos distintos
    const tl = gsap.timeline({ paused: true });
    nodos.forEach((n) => {
      tl.fromTo(n, { opacity: 0.45 }, { opacity: 1, duration: gsap.utils.random(0.9, 1.8), repeat: -1, yoyo: true, ease: 'sine.inOut' }, gsap.utils.random(0, 1.5));
    });

    // Impulso: viaja de izquierda a derecha saltando de nodo en nodo
    function impulso() {
      const inicios = pos.map((p, i) => i).filter((i) => pos[i][0] < 30);
      let actual = inicios[(Math.random() * inicios.length) | 0];
      const punto = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      punto.setAttribute('r', '1.6');
      punto.setAttribute('cx', pos[actual][0]);
      punto.setAttribute('cy', pos[actual][1]);
      capaImpulsos.appendChild(punto);
      const viaje = gsap.timeline({ onComplete: () => punto.remove() });
      for (let salto = 0; salto < 7 && pos[actual][0] < 74; salto++) {
        const opciones = vecinos[actual].filter((v) => pos[v.n][0] > pos[actual][0] - 2);
        if (!opciones.length) break;
        const { n: siguiente, l } = opciones[(Math.random() * opciones.length) | 0];
        viaje.to(punto, { attr: { cx: pos[siguiente][0], cy: pos[siguiente][1] }, duration: 0.2, ease: 'none' })
          .fromTo(l, { opacity: 1 }, { opacity: 0.35, duration: 0.6, ease: 'power2.out', clearProps: 'opacity' }, '<')
          .fromTo(nodos[siguiente], { attr: { r: 2.4 } }, { attr: { r: radios[siguiente] }, duration: 0.5 }, '>-0.05');
        actual = siguiente;
      }
      viaje.to(punto, { opacity: 0, duration: 0.2 });
    }

    let espera = null;
    let intenso = false;
    function programar() {
      espera = gsap.delayedCall(intenso ? gsap.utils.random(0.12, 0.3) : gsap.utils.random(0.7, 1.4), () => {
        impulso();
        if (intenso) impulso(); // al pasar el mouse se activan más conexiones a la vez
        programar();
      });
    }
    return {
      tl,
      iniciar() { if (!espera) programar(); },
      detener() { if (espera) { espera.kill(); espera = null; } },
      intensidad(si) { intenso = si; if (espera) { espera.kill(); programar(); } },
    };
  }

  /* ---------------------------------------------------------------------
     Arranque, pausa fuera de pantalla e intensidad al pasar el mouse
     --------------------------------------------------------------------- */
  const FABRICAS = { web: iconoWeb, ads: iconoAds, ia: iconoIA };

  iconos.forEach((caja) => {
    const svg = caja.querySelector('svg');
    const icono = FABRICAS[caja.dataset.icono](svg);
    const tarjeta = caja.closest('.tarjeta') || caja;
    let visible = false;

    function intensificar(si) {
      caja.classList.toggle('icono-animado--activo', si);
      icono.tl.timeScale(si ? 1.8 : 1);
      if (icono.intensidad) icono.intensidad(si);
    }

    // Solo anima mientras la tarjeta está en pantalla (y la pestaña visible)
    const observador = new IntersectionObserver(([entrada]) => {
      visible = entrada.isIntersecting;
      if (visible && !document.hidden) { icono.tl.play(); if (icono.iniciar) icono.iniciar(); }
      else { icono.tl.pause(); if (icono.detener) icono.detener(); }
    }, { threshold: 0.15 });
    observador.observe(caja);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { icono.tl.pause(); if (icono.detener) icono.detener(); }
      else if (visible) { icono.tl.play(); if (icono.iniciar) icono.iniciar(); }
    });

    // Escritorio: al pasar el mouse · Celular: al tocar (se calma después de 2,5 s)
    tarjeta.addEventListener('mouseenter', () => intensificar(true));
    tarjeta.addEventListener('mouseleave', () => intensificar(false));
    let calma = 0;
    tarjeta.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      intensificar(true);
      clearTimeout(calma);
      calma = setTimeout(() => intensificar(false), 2500);
    });
  });
})();
