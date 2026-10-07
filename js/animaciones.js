/* =========================================================================
   GALAKTION — ANIMACIONES DE SCROLL DE TODAS LAS PÁGINAS
   -------------------------------------------------------------------------
   Titulares cinéticos · revelado por palabras · entradas escalonadas ·
   tarjetas 3D · máscaras y parallax · línea de proceso · contadores ·
   scroll horizontal de servicios.
   Todo usa transform/opacity para mantener 60 fps.
   ========================================================================= */

(function () {
  'use strict';

  const html = document.documentElement;
  if (!window.GK || !GK.animar) return;

  const hayDivision = !!window.SplitText;
  const $$ = (sel, ctx) => gsap.utils.toArray(sel, ctx);

  GK.fuentes.then(() => {
    titularesCineticos();
    revelarPalabras();
    entradas();
    tarjetas3D();
    mascarasYParallax();
    proceso();
    contadores();
    serviciosHorizontal();

    html.classList.add('animaciones-listas');
    ScrollTrigger.refresh();
    irAlAncla();
  });

  /* -----------------------------------------------------------------------
     Titular cinético: las letras llegan dispersas y se acomodan en su sitio
     (el mismo gesto de la G que se construye)
     ----------------------------------------------------------------------- */
  function titularesCineticos() {
    $$('[data-titular-cinetico]').forEach((el) => {
      if (!hayDivision) return;
      const division = new SplitText(el, { type: 'words,chars', wordsClass: 'palabra', charsClass: 'letra' });
      el.classList.add('dividido');
      const letras = division.chars;
      // El resto del encabezado (etiqueta, intro) entra justo después
      const resto = el.parentElement.querySelectorAll(':scope > :not([data-titular-cinetico])');
      gsap.set(resto, { opacity: 0, y: 24 });
      gsap.set(letras, {
        opacity: 0,
        x: () => gsap.utils.random(-40, 40),
        y: () => gsap.utils.random(-70, 70),
        rotation: () => gsap.utils.random(-35, 35),
        scale: () => gsap.utils.random(0.6, 1.4),
      });
      GK.listo.then(() => {
        gsap.to(letras, {
          opacity: 1, x: 0, y: 0, rotation: 0, scale: 1,
          duration: 1.3,
          ease: 'expo.out',
          stagger: { each: 0.028, from: 'random' },
          delay: 0.15,
        });
        gsap.to(resto, { opacity: 1, y: 0, duration: 1, stagger: 0.12, delay: 0.55 });
      });
    });
  }

  /* -----------------------------------------------------------------------
     Revelado palabra por palabra (de gris a blanco) ligado al scroll
     ----------------------------------------------------------------------- */
  function revelarPalabras() {
    $$('[data-revelar-palabras]').forEach((el) => {
      if (!hayDivision) return;
      const division = new SplitText(el, { type: 'words', wordsClass: 'palabra' });
      gsap.fromTo(division.words, { opacity: 0.13 }, {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: true },
      });
    });
  }

  /* -----------------------------------------------------------------------
     Entradas suaves de bloques de contenido al aparecer en pantalla
     ----------------------------------------------------------------------- */
  function entradas() {
    const SELECTORES = [
      '.encabezado-seccion > *',
      '.destacado__info > *',
      '.proyecto__info > *',
      '.historia__textos > *',
      '.cta__contenedor > *',
      '.frase-final .boton',
      '.proyecto--proximo',
      '.proyecto__galeria > *',
      '.pie__contenedor > *',
      '.contacto__directo',
      '.formulario > *',
    ].join(',');
    const elementos = $$(SELECTORES).filter((el) => !el.closest('.hero') && !el.closest('.encabezado-pagina') && !el.closest('.contacto__cabeza'));
    gsap.set(elementos, { opacity: 0, y: 40 });
    ScrollTrigger.batch(elementos, {
      start: 'top 90%',
      once: true,
      onEnter: (lote) => gsap.to(lote, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', overwrite: 'auto' }),
    });


    // Tarjetas y pasos: entran escalonados con un leve giro 3D
    const tarjetas = $$('.tarjetas > *, .paso, .cifra');
    gsap.set(tarjetas, { opacity: 0, y: 70, rotationX: 10, transformPerspective: 900, transformOrigin: '50% 100%' });
    ScrollTrigger.batch(tarjetas, {
      start: 'top 88%',
      once: true,
      onEnter: (lote) => gsap.to(lote, {
        opacity: 1, y: 0, rotationX: 0,
        duration: 1.2, stagger: 0.14, ease: 'expo.out', overwrite: 'auto',
        clearProps: 'transform',
      }),
    });
  }

  /* -----------------------------------------------------------------------
     Tarjetas que se inclinan en 3D siguiendo el mouse + brillo plateado
     ----------------------------------------------------------------------- */
  function tarjetas3D() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('[data-inclinar]').forEach((tarjeta) => {
      const rx = gsap.quickTo(tarjeta, 'rotationX', { duration: 0.6, ease: 'power3' });
      const ry = gsap.quickTo(tarjeta, 'rotationY', { duration: 0.6, ease: 'power3' });
      gsap.set(tarjeta, { transformPerspective: 1000 });
      tarjeta.addEventListener('pointermove', (e) => {
        const r = tarjeta.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 10);
        rx((0.5 - py) * 8);
        tarjeta.style.setProperty('--mx', px * 100 + '%');
        tarjeta.style.setProperty('--my', py * 100 + '%');
      });
      tarjeta.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* -----------------------------------------------------------------------
     Imágenes: máscara que se abre + parallax interno
     ----------------------------------------------------------------------- */
  function mascarasYParallax() {
    $$('[data-revelar-mascara]').forEach((figura) => {
      gsap.fromTo(figura, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.5,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: figura, start: 'top 85%', once: true },
      });
      const img = figura.querySelector('img');
      if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: figura, start: 'top 85%', once: true } });
    });

    $$('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  /* -----------------------------------------------------------------------
     Proceso: la línea se dibuja con el scroll y enciende cada paso
     ----------------------------------------------------------------------- */
  function proceso() {
    const recorrido = document.querySelector('.proceso__recorrido');
    if (!recorrido) return;
    const progreso = recorrido.querySelector('.proceso__progreso');
    const pasos = $$('.paso', recorrido);
    const mm = gsap.matchMedia();
    mm.add({ escritorio: '(min-width: 1024px)', movil: '(max-width: 1023px)' }, (ctx) => {
      const eje = ctx.conditions.escritorio ? 'scaleX' : 'scaleY';
      gsap.fromTo(progreso, { [eje]: 0 }, {
        [eje]: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: recorrido,
          start: ctx.conditions.escritorio ? 'top 70%' : 'top 65%',
          end: ctx.conditions.escritorio ? 'bottom 55%' : 'bottom 60%',
          scrub: 0.6,
          onUpdate: (self) => {
            pasos.forEach((paso, i) => {
              const umbral = pasos.length > 1 ? (i / (pasos.length - 1)) * 0.96 : 0;
              paso.classList.toggle('paso--activo', self.progress >= umbral && self.progress > 0.01);
            });
          },
        },
      });
    });
  }

  /* -----------------------------------------------------------------------
     Contadores animados (0 → valor de config.js)
     ----------------------------------------------------------------------- */
  function contadores() {
    $$('[data-contador]').forEach((el) => {
      const final = parseFloat(el.textContent) || 0;
      const obj = { v: 0 };
      el.textContent = '0';
      gsap.to(obj, {
        v: final,
        duration: 2.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.v); },
      });
    });
  }

  /* -----------------------------------------------------------------------
     Servicios: scroll horizontal fijado en escritorio, vertical en celular
     ----------------------------------------------------------------------- */
  let pistaST = null;
  function serviciosHorizontal() {
    const seccion = document.querySelector('.servicios-horizontal');
    if (!seccion) return;
    const pista = seccion.querySelector('.servicios-horizontal__pista');
    const paneles = $$('.servicio-panel', pista);

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      seccion.classList.add('servicios-horizontal--activo');
      const distancia = () => pista.scrollWidth - window.innerWidth;
      const tween = gsap.to(pista, {
        x: () => -distancia(),
        ease: 'none',
        scrollTrigger: {
          trigger: seccion,
          start: 'top top',
          end: () => '+=' + distancia(),
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      pistaST = tween.scrollTrigger;

      // El contenido de cada panel entra al llegar al centro de la pantalla
      paneles.forEach((panel, i) => {
        const piezas = panel.querySelectorAll('.servicio-panel__cabeza, .servicio-panel__columnas, :scope > .boton');
        gsap.from(piezas, {
          opacity: 0, x: 80, duration: 1, stagger: 0.12, ease: 'expo.out',
          scrollTrigger: i === 0
            ? { trigger: seccion, start: 'top 70%', once: true }
            : { trigger: panel, containerAnimation: tween, start: 'left 75%', once: true },
        });
        // Número gigante con parallax propio
        const numero = panel.querySelector('.servicio-panel__numero');
        gsap.fromTo(numero, { xPercent: 30 }, {
          xPercent: -30, ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
        });
      });

      return () => { seccion.classList.remove('servicios-horizontal--activo'); pistaST = null; };
    });

    mm.add('(max-width: 1023px)', () => {
      paneles.forEach((panel) => {
        gsap.from(panel.children, {
          opacity: 0, y: 40, duration: 1, stagger: 0.1, ease: 'expo.out',
          scrollTrigger: { trigger: panel, start: 'top 80%', once: true },
        });
      });
    });
  }

  /* -----------------------------------------------------------------------
     Enlaces con #ancla desde otra página (ej. servicios.html#meta-ads)
     ----------------------------------------------------------------------- */
  function irAlAncla() {
    if (!location.hash) return;
    let destino;
    try { destino = document.querySelector(location.hash); } catch (e) { return; }
    if (!destino) return;
    GK.listo.then(() => {
      // Dentro del scroll horizontal: calcular la posición vertical equivalente
      if (pistaST && destino.closest('.servicios-horizontal__pista')) {
        const pista = destino.parentElement;
        const total = pista.scrollWidth - window.innerWidth;
        const fraccion = Math.min(1, (destino.offsetLeft - parseFloat(getComputedStyle(pista.firstElementChild).marginLeft || 0)) / total);
        GK.irA(pistaST.start + fraccion * (pistaST.end - pistaST.start), { offset: 0, immediate: true });
      } else {
        GK.irA(destino, { immediate: true });
      }
    });
  }
})();
