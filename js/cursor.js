/* =========================================================================
   GALAKTION — CURSOR PERSONALIZADO
   -------------------------------------------------------------------------
   Un círculo plateado fino que sigue al mouse con un leve retraso y crece
   sobre enlaces y botones. Solo en computadores con mouse.
   ========================================================================= */

(function () {
  'use strict';

  if (!window.GK || !GK.animar) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const html = document.documentElement;
  const cursor = document.querySelector('.cursor');
  const punto = document.querySelector('.cursor-punto');
  if (!cursor || !punto) return;

  html.classList.add('tiene-cursor');

  // quickTo: la forma más eficiente de seguir el mouse con GSAP
  const cx = gsap.quickTo(cursor, 'x', { duration: 0.55, ease: 'power3' });
  const cy = gsap.quickTo(cursor, 'y', { duration: 0.55, ease: 'power3' });
  const px = gsap.quickTo(punto, 'x', { duration: 0.12, ease: 'power3' });
  const py = gsap.quickTo(punto, 'y', { duration: 0.12, ease: 'power3' });

  let visible = false;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!visible) {
      gsap.set([cursor, punto], { x: e.clientX, y: e.clientY });
      html.classList.add('cursor-visible');
      visible = true;
    }
    cx(e.clientX); cy(e.clientY);
    px(e.clientX); py(e.clientY);
  }, { passive: true });

  document.addEventListener('mouseleave', () => { html.classList.remove('cursor-visible'); visible = false; });

  // Crece sobre elementos interactivos
  const INTERACTIVOS = 'a, button, select, label, [data-inclinar], .proyecto__media, input[type="submit"]';
  document.addEventListener('mouseover', (e) => {
    cursor.classList.toggle('cursor--activo', !!e.target.closest(INTERACTIVOS));
  });

  window.addEventListener('mousedown', () => cursor.classList.add('cursor--oprimido'));
  window.addEventListener('mouseup', () => cursor.classList.remove('cursor--oprimido'));
})();
