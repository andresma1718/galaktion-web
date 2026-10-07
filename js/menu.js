/* =========================================================================
   GALAKTION — MENÚ MÓVIL DE PANTALLA COMPLETA
   -------------------------------------------------------------------------
   Se abre con una cortina que baja y los enlaces suben uno a uno.
   Funciona también sin GSAP (simplemente aparece).
   ========================================================================= */

(function () {
  'use strict';

  const html = document.documentElement;
  const boton = document.querySelector('.cabecera__hamburguesa');
  const menu = document.getElementById('menu-movil');
  if (!boton || !menu) return;

  const animar = window.GK && GK.animar;
  let abierto = false;
  let tl = null;

  if (animar) {
    tl = gsap.timeline({
      paused: true,
      onReverseComplete: () => gsap.set(menu, { visibility: 'hidden' }),
    })
      .set(menu, { visibility: 'visible' })
      .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'expo.inOut' })
      .fromTo(menu.querySelectorAll('.menu-movil__texto'), { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out' }, '-=0.35')
      .fromTo(menu.querySelector('.menu-movil__pie'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.6');
  }

  function abrir() {
    if (abierto) return;
    abierto = true;
    html.classList.add('menu-abierto');
    boton.setAttribute('aria-expanded', 'true');
    boton.setAttribute('aria-label', 'Cerrar menú');
    menu.setAttribute('aria-hidden', 'false');
    if (tl) tl.timeScale(1).play(); else menu.classList.add('esta-abierto');
    if (window.GK && GK.lenis) GK.lenis.stop();
  }

  function cerrar() {
    if (!abierto) return;
    abierto = false;
    html.classList.remove('menu-abierto');
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-label', 'Abrir menú');
    menu.setAttribute('aria-hidden', 'true');
    if (tl) tl.timeScale(1.6).reverse(); else menu.classList.remove('esta-abierto');
    if (window.GK && GK.lenis) GK.lenis.start();
  }

  boton.addEventListener('click', () => (abierto ? cerrar() : abrir()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) cerrar(); });

  window.GKMenu = { abrir, cerrar };
})();
