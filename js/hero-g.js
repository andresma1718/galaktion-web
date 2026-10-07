/* =========================================================================
   GALAKTION — HERO: LA G QUE SE CONSTRUYE CON EL SCROLL
   -------------------------------------------------------------------------
   1. Al llegar, las 6 piezas de la G aparecen sueltas por la pantalla,
      giradas y a distintas profundidades (escala + opacidad).
   2. Con el scroll (sección fijada), cada pieza viaja, gira y encaja en su
      lugar, una tras otra. Al encajar, un destello recorre el metal.
   3. Con la G completa aparece GALAKTION letra por letra.
   4. El logo se reduce a su sitio y entran titular, subtítulo y botones.
   Sin JS o con movimiento reducido, se ve directamente el estado final.
   ========================================================================= */

(function () {
  'use strict';

  const hero = document.querySelector('.hero');
  if (!hero || !window.GK || !GK.animar) return;

  const html = document.documentElement;
  const logo = hero.querySelector('.hero__logo');
  const svg = hero.querySelector('.hero__g');
  const piezas = gsap.utils.toArray('.pieza', svg);
  const completa = svg.querySelector('.hero__completa');
  const marca = hero.querySelector('.hero__marca');
  const textos = gsap.utils.toArray('.hero__titular, .hero__subtitulo, .hero__acciones', hero);
  const indicador = hero.querySelector('.indicador-scroll');

  /* Dónde arranca cada pieza, en fracciones de la pantalla desde el centro.
     fx/fy: posición · r: giro · s: escala (profundidad) · o: opacidad */
  const DISPERSION = [
    { fx: 0.30, fy: -0.30, r: 28, s: 0.7, o: 0.55 },   // 1. barra superior
    { fx: -0.33, fy: -0.27, r: -64, s: 1.25, o: 0.85 }, // 2. chaflán
    { fx: -0.40, fy: 0.08, r: 82, s: 0.8, o: 0.6 },     // 3. lado izquierdo
    { fx: -0.17, fy: 0.34, r: -38, s: 1.35, o: 0.9 },   // 4. diagonal inferior + cola
    { fx: 0.37, fy: 0.22, r: 56, s: 0.9, o: 0.7 },      // 5. lado derecho
    { fx: 0.16, fy: -0.03, r: -120, s: 1.15, o: 0.8 },  // 6. lengüeta
  ];

  const movil = () => window.innerWidth < 768;

  /* ---- Medidas (se recalculan en cada refresh / cambio de tamaño) ----
     Se usan medidas de layout (offset*), que no cambian con las transformaciones. */
  const m = { escala: 2, dy: 0, unidad: 1, vw: 1, vh: 1 };
  function medir() {
    const gAlto = svg.clientHeight;
    const gAncho = svg.clientWidth;
    let arriba = 0;
    for (let n = logo; n && n !== hero; n = n.offsetParent) arriba += n.offsetTop;
    m.vw = window.innerWidth;
    m.vh = window.innerHeight;
    m.escala = Math.min(movil() ? 1.8 : 2.4, (m.vh * 0.5) / gAlto, (m.vw * 0.6) / gAncho);
    m.dy = m.vh / 2 - (arriba + gAlto / 2);
    m.unidad = (gAlto / 568) * m.escala; // px de pantalla por unidad del SVG al inicio
    logo.style.transformOrigin = '50% ' + gAlto / 2 + 'px';
  }

  GK.fuentes.then(() => {
    medir();
    ScrollTrigger.addEventListener('refreshInit', medir);

    // GALAKTION letra por letra
    let letras = [marca];
    if (window.SplitText) {
      const division = new SplitText(marca, { type: 'chars', charsClass: 'letra' });
      marca.classList.add('dividido');
      letras = division.chars;
    }

    const destellos = piezas.map((p) => p.querySelector('.pieza__destello'));
    const cuerpos = piezas.map((p) => p.querySelector('.pieza__cuerpo'));
    const luces = gsap.utils.toArray('.pieza__luz', svg);
    gsap.set(cuerpos, { opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * (movil() ? 2.2 : 3)),
        pin: true,
        scrub: movil() ? 0.5 : 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => svg.classList.toggle('hero__g--completa', self.progress > 0.56),
      },
    });

    // El indicador "desliza" se va apenas empieza el scroll
    if (indicador) tl.to(indicador, { opacity: 0, y: 20, duration: 0.35 }, 0);

    // 1–2. Cada pieza viaja desde su dispersión hasta encajar, con destello al llegar
    piezas.forEach((pieza, i) => {
      const d = DISPERSION[i];
      const inicio = i * 0.6;
      tl.fromTo(pieza, {
        // En celular la dispersión es más contenida para que ninguna pieza quede fuera
        x: () => (d.fx * m.vw * (movil() ? 0.72 : 1)) / m.unidad,
        y: () => (d.fy * m.vh * (movil() ? 0.8 : 1)) / m.unidad,
        rotation: d.r,
        scale: d.s,
        opacity: d.o,
        transformOrigin: '50% 50%',
        smoothOrigin: false,
      }, {
        x: 0, y: 0, rotation: 0, scale: 1, opacity: 1,
        duration: 1.1,
        ease: 'power3.inOut',
      }, inicio);
      // Destello: una banda de luz (degradado) cruza la pieza en diagonal
      tl.set(destellos[i], { opacity: 1 }, inicio + 1.0)
        .fromTo(luces[i], { attr: { x1: -320, x2: -160 } }, { attr: { x1: 560, x2: 720 }, duration: 0.5, ease: 'power1.inOut' }, inicio + 1.0)
        .set(destellos[i], { opacity: 0 }, inicio + 1.5);
    });

    // La G completa (una sola pieza, con relieve) tapa las uniones
    tl.fromTo(completa, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 4.15);

    // 3. GALAKTION letra por letra
    tl.fromTo(letras, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: 'power2.out' }, 4.35);

    // 4. El logo baja a su tamaño final y entran los textos
    tl.fromTo(logo, {
      scale: () => m.escala,
      y: () => m.dy,
    }, {
      scale: 1, y: 0,
      duration: 1.25,
      ease: 'power2.inOut',
      force3D: false, // mantiene el SVG nítido mientras escala
    }, 5.15);
    tl.fromTo(textos, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.22, ease: 'power2.out' }, 5.8);
    tl.to({}, { duration: 0.6 }); // pausa final antes de soltar la sección

    html.classList.add('hero-animado');

    // Entrada inicial (no ligada al scroll): las piezas sueltas aparecen
    GK.listo.then(() => {
      gsap.to(cuerpos, { opacity: 1, duration: 1.4, stagger: { each: 0.12, from: 'random' }, ease: 'power2.out' });
      if (indicador) gsap.fromTo(indicador, { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.9 });
    });
  });
})();
