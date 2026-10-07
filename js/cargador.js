/* =========================================================================
   GALAKTION — PANTALLA DE CARGA
   -------------------------------------------------------------------------
   Solo en la primera visita de la sesión: la G se dibuja con una línea
   plateada mientras el contador sube de 0 a 100, se rellena de metal
   y la pantalla sube para descubrir la página.
   ========================================================================= */

(function () {
  'use strict';

  const html = document.documentElement;
  const el = document.getElementById('cargador');
  if (!el || !window.GK || !GK.animar || !html.classList.contains('primera-visita')) return;

  const numero = el.querySelector('.cargador__numero');
  const contador = { valor: 0 };
  const DURACION = 1.7;

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

  tl.to(el.querySelector('.cargador__trazo'), { strokeDashoffset: 0, duration: DURACION }, 0)
    .to(el.querySelector('.cargador__barra'), { scaleX: 1, duration: DURACION }, 0)
    .to(contador, {
      valor: 100,
      duration: DURACION,
      onUpdate: () => { numero.textContent = Math.round(contador.valor); },
    }, 0)
    .to(el.querySelector('.cargador__relleno'), { opacity: 1, duration: 0.5 }, DURACION - 0.35)
    // Espera a que las tipografías estén listas antes de salir
    .add(() => {
      tl.pause();
      GK.fuentes.then(() => tl.resume());
    }, DURACION + 0.15)
    .add(() => GK.marcarListo(), '+=0.15')
    .to(el, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '<')
    .to(el.querySelector('.cargador__g'), { y: -60, opacity: 0, duration: 0.6, ease: 'power2.in' }, '<')
    .add(() => {
      html.classList.remove('primera-visita');
      gsap.set(el, { clearProps: 'all' });
    });
})();
