/* =========================================================================
   GALAKTION AI — PREGUNTAS FRECUENTES
   Abre y cierra cada respuesta con una transición suave (sin GSAP funciona
   igual, solo que sin animación). Solo una pregunta abierta a la vez.
   ========================================================================= */

(function () {
  'use strict';

  const items = Array.from(document.querySelectorAll('.faq__item'));
  if (!items.length) return;
  const animar = window.GK && GK.animar && window.gsap;

  function cerrar(item) {
    const resp = item.querySelector('.faq__respuesta');
    if (!animar) { item.open = false; return; }
    gsap.to(resp, { height: 0, opacity: 0, duration: 0.4, ease: 'power2.inOut', onComplete: () => { item.open = false; gsap.set(resp, { clearProps: 'height,opacity' }); } });
    item.classList.remove('faq__item--abierto');
  }
  function abrir(item) {
    const resp = item.querySelector('.faq__respuesta');
    item.open = true;
    item.classList.add('faq__item--abierto');
    if (!animar) return;
    gsap.fromTo(resp, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'height' });
  }

  items.forEach((item) => {
    item.querySelector('summary').addEventListener('click', (e) => {
      e.preventDefault();
      if (item.open) { cerrar(item); return; }
      items.filter((o) => o !== item && o.open).forEach(cerrar);
      abrir(item);
      // El alto de la página cambia: recalcular posiciones de las animaciones
      if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 550);
    });
  });
})();
