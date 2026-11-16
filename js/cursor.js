/* =========================================================================
   GALAKTION AI — CURSOR PERSONALIZADO
   -------------------------------------------------------------------------
   Un punto plateado que sigue al mouse al instante (sin retraso).
   · Sobre enlaces y botones: crece un poco.
   · Sobre tarjetas (data-cursor="ver"): se convierte en un círculo que dice "Ver".
   Solo en computadores con mouse; en celular no hay cursor personalizado.
   El efecto magnético de los botones está en js/animaciones.js.
   ========================================================================= */

(function () {
  'use strict';

  if (!window.GK || !GK.animar) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const html = document.documentElement;
  const cursor = document.querySelector('.cursor');
  if (!cursor) return;
  html.classList.add('tiene-cursor');

  let visible = false;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    // Al instante: se escribe la posición directamente, sin interpolación
    cursor.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
    if (!visible) { html.classList.add('cursor-visible'); visible = true; }
  }, { passive: true });

  document.addEventListener('mouseleave', () => { html.classList.remove('cursor-visible'); visible = false; });

  const INTERACTIVOS = 'a, button, select, label, summary, input[type="checkbox"]';
  document.addEventListener('mouseover', (e) => {
    const ver = e.target.closest('[data-cursor="ver"]');
    cursor.classList.toggle('cursor--ver', !!ver);
    cursor.classList.toggle('cursor--activo', !ver && !!e.target.closest(INTERACTIVOS));
  });

  window.addEventListener('mousedown', () => cursor.classList.add('cursor--oprimido'));
  window.addEventListener('mouseup', () => cursor.classList.remove('cursor--oprimido'));
})();
