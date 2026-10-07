/* =========================================================================
   GALAKTION — ARRANQUE GENERAL
   -------------------------------------------------------------------------
   1. Aplica los datos de config.js a la página (textos, enlaces, año).
   2. Prepara GSAP + ScrollTrigger + Lenis (scroll suave sincronizado).
   3. Expone utilidades en window.GK para los demás scripts.
   4. Comportamiento de la cabecera al hacer scroll.
   ========================================================================= */

(function () {
  'use strict';

  const CFG = window.GALAKTION || {};
  const html = document.documentElement;

  /* Lee un valor de la configuración con una ruta tipo "inicio.heroTitular"
     o "cifras.0.numero". Devuelve undefined si no existe. */
  function leer(ruta) {
    return ruta.split('.').reduce((obj, clave) => (obj == null ? undefined : obj[clave]), CFG);
  }

  /* Arma un enlace de WhatsApp con el mensaje indicado (clave de CFG.mensajes). */
  function enlaceWhatsApp(claveMensaje) {
    const numero = (CFG.contacto && CFG.contacto.whatsapp) || '';
    const mensaje = (CFG.mensajes && CFG.mensajes[claveMensaje || 'general']) || '';
    return 'https://wa.me/' + numero + (mensaje ? '?text=' + encodeURIComponent(mensaje) : '');
  }

  /* =======================================================================
     1. DATOS DE config.js → PÁGINA
     ======================================================================= */

  // Textos: <span data-texto="inicio.heroTitular">...</span>
  // El texto que ya está en el HTML queda como respaldo (y para Google).
  document.querySelectorAll('[data-texto]').forEach((el) => {
    const valor = leer(el.dataset.texto);
    if (typeof valor === 'string' || typeof valor === 'number') el.textContent = valor;
  });

  // Enlaces: data-enlace="whatsapp | correo | instagram | dominio"
  // Para WhatsApp, data-mensaje="cotizarWeb" elige el mensaje.
  const c = CFG.contacto || {};
  document.querySelectorAll('[data-enlace]').forEach((el) => {
    switch (el.dataset.enlace) {
      case 'whatsapp': el.href = enlaceWhatsApp(el.dataset.mensaje); break;
      case 'correo': if (c.correo) el.href = 'mailto:' + c.correo; break;
      case 'instagram': if (c.instagram) el.href = 'https://instagram.com/' + c.instagram; break;
      case 'dominio': if (c.dominio) el.href = 'https://' + c.dominio; break;
    }
    if (el.dataset.enlace !== 'correo') { el.target = '_blank'; el.rel = 'noopener'; }
  });

  // Textos de contacto visibles: <span data-contacto="correo"></span>
  document.querySelectorAll('[data-contacto]').forEach((el) => {
    const clave = el.dataset.contacto;
    if (clave === 'instagram' && c.instagram) el.textContent = '@' + c.instagram;
    else if (c[clave]) el.textContent = c[clave];
  });

  // Año actual en el pie de página
  document.querySelectorAll('[data-anio]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* =======================================================================
     2. ANIMACIÓN: GSAP + SCROLLTRIGGER + LENIS
     ======================================================================= */
  const reducido = html.classList.contains('movimiento-reducido');
  const hayGsap = !!(window.gsap && window.ScrollTrigger);
  const animar = hayGsap && !reducido && !html.classList.contains('sin-animacion');

  // La sesión ya vio la pantalla de carga; no se repite al cambiar de página
  try {
    sessionStorage.setItem('gk-visitado', '1');
    sessionStorage.removeItem('gk-transicion');
  } catch (e) { /* modo privado: sin problema */ }

  if (!animar) {
    // Sin animaciones: todo visible y quieto
    html.classList.remove('primera-visita', 'con-transicion');
    if (!reducido) html.classList.add('sin-animacion');
  }

  let lenis = null;
  if (animar) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    ScrollTrigger.config({ ignoreMobileResize: true });
    gsap.defaults({ ease: 'power3.out' });

    // Siempre arrancar arriba (la G del inicio se arma desde cero), salvo enlaces con #ancla
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!location.hash) window.scrollTo(0, 0);

    // Lenis: scroll suave en escritorio; en celular se respeta el scroll nativo (más fluido)
    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, anchors: { offset: -80 } });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  // Promesa "listo": se cumple cuando termina la pantalla de carga o la cortina.
  // Las animaciones de entrada esperan a esto para no correr escondidas.
  let marcarListo;
  const listo = new Promise((resolver) => { marcarListo = resolver; });
  const hayIntro = html.classList.contains('primera-visita') || html.classList.contains('con-transicion');
  if (lenis && hayIntro) lenis.stop();
  listo.then(() => { if (lenis) lenis.start(); });
  if (!hayIntro) marcarListo();

  // Tipografías cargadas (para medir textos antes de dividirlos en letras)
  const fuentes = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

  /* =======================================================================
     3. UTILIDADES PARA LOS DEMÁS SCRIPTS
     ======================================================================= */
  window.GK = {
    leer,
    enlaceWhatsApp,
    animar,
    reducido,
    lenis,
    listo,
    fuentes,
    marcarListo: () => marcarListo(),
    esEscritorio: () => window.matchMedia('(min-width: 1024px)').matches,
    // Llevar el scroll a una posición o elemento (con Lenis si existe)
    irA(destino, opciones) {
      if (lenis) lenis.scrollTo(destino, Object.assign({ offset: -80 }, opciones));
      else if (typeof destino === 'number') window.scrollTo(0, destino);
      else if (destino && destino.scrollIntoView) destino.scrollIntoView();
    },
  };

  /* =======================================================================
     4. CABECERA: fondo al bajar, se esconde al seguir bajando, vuelve al subir
     ======================================================================= */
  const cabecera = document.getElementById('cabecera');
  let ultimoY = window.scrollY;
  function alHacerScroll() {
    const y = window.scrollY;
    cabecera.classList.toggle('cabecera--solida', y > 40);
    const bajando = y > ultimoY + 2;
    const subiendo = y < ultimoY - 2;
    if (bajando && y > 480 && !html.classList.contains('menu-abierto')) cabecera.classList.add('cabecera--oculta');
    if (subiendo || y <= 480) cabecera.classList.remove('cabecera--oculta');
    ultimoY = y;
  }
  window.addEventListener('scroll', alHacerScroll, { passive: true });
  alHacerScroll();
})();
