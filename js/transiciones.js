/* =========================================================================
   GALAKTION — TRANSICIONES ENTRE PÁGINAS
   -------------------------------------------------------------------------
   Al hacer clic en un enlace interno, una cortina negra con la G sube y
   cubre la pantalla; se carga la siguiente página ya cubierta y la
   cortina se retira hacia arriba. Así el cambio se siente continuo.
   ========================================================================= */

(function () {
  'use strict';

  const html = document.documentElement;
  const cortina = document.getElementById('cortina');
  if (!cortina || !window.GK || !GK.animar) return;

  const g = cortina.querySelector('.cortina__g');
  const esLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';

  /* ---- Llegada: la cortina ya cubre (lo hizo el CSS) y se retira ---- */
  function retirar() {
    gsap.timeline({
      onComplete: () => {
        html.classList.remove('con-transicion');
        gsap.set([cortina, g], { clearProps: 'all' });
      },
    })
      .add(() => GK.marcarListo(), 0.15)
      .to(g, { opacity: 0, scale: 0.94, duration: 0.3, ease: 'power2.in' }, 0)
      .to(cortina, { yPercent: -100, duration: 0.55, ease: 'expo.inOut' }, 0.05);
  }

  // Destello que recorre el metal de la G (el degradado cruza en diagonal)
  const luz = cortina.querySelector('.cortina__luz');
  const destello = (duracion) => (luz
    ? gsap.fromTo(luz, { attr: { x1: -320, x2: -160 } }, { attr: { x1: 560, x2: 720 }, duration: duracion, ease: 'power1.inOut' })
    : gsap.timeline());
  if (html.classList.contains('con-transicion')) retirar();

  /* ---- Salida: interceptar clics en enlaces internos ---- */
  function esEnlaceInterno(a, evento) {
    if (!a || evento.defaultPrevented || evento.button !== 0) return false;
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return false;
    if (a.target === '_blank' || a.hasAttribute('download') || a.dataset.enlace) return false;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    // Enlace a una sección de la misma página: lo maneja Lenis
    if (url.pathname === location.pathname && url.hash) return false;
    return url;
  }

  // En producción (Vercel con URLs limpias) quitamos el ".html" para evitar una redirección
  function limpiar(url) {
    if (esLocal) return url.href;
    url.pathname = url.pathname.replace(/index\.html$/, '').replace(/\.html$/, '');
    return url.href;
  }

  let saliendo = false;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    const url = esEnlaceInterno(a, e);
    if (!url || saliendo) return;
    e.preventDefault();

    // Misma página sin ancla: solo volver arriba
    if (url.pathname === location.pathname || (url.pathname.endsWith('/index.html') && /\/$/.test(location.pathname))) {
      if (window.GKMenu) GKMenu.cerrar();
      GK.irA(0);
      return;
    }

    saliendo = true;
    try { sessionStorage.setItem('gk-transicion', '1'); } catch (err) { /* sin problema */ }
    if (GK.lenis) GK.lenis.stop();

    // Salida (~0,45 s) + llegada (~0,55 s) = alrededor de 1 segundo en total
    gsap.timeline({ onComplete: () => { window.location.href = limpiar(url); } })
      .set(cortina, { visibility: 'visible', yPercent: 100 })
      .set(g, { opacity: 0, scale: 0.9 })
      .to(cortina, { yPercent: 0, duration: 0.42, ease: 'expo.inOut' })
      .to(g, { opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out' }, '-=0.18')
      .add(destello(0.3), '-=0.12');
  });

  /* ---- Volver con el botón "atrás": la página sale de caché con la cortina puesta ---- */
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    saliendo = false;
    gsap.set([cortina, g], { clearProps: 'all' });
    html.classList.remove('con-transicion');
    try { sessionStorage.removeItem('gk-transicion'); } catch (err) { /* sin problema */ }
    if (GK.lenis) GK.lenis.start();
  });
})();
