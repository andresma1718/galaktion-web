/* =========================================================================
   GALAKTION — ARCHIVO DE CONFIGURACIÓN
   -------------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas tocar para cambiar datos de
   contacto, mensajes de WhatsApp, textos clave, cifras y precios.

   Reglas para editar sin romper nada:
   - Cambia solo lo que está entre comillas '...'.
   - Si tu texto lleva un apóstrofe ('), escríbelo como \'
   - No borres comas ni llaves { }.
   - Guarda y recarga el navegador para ver el cambio.
   ========================================================================= */

window.GALAKTION = {

  /* -----------------------------------------------------------------------
     CONTACTO
     ----------------------------------------------------------------------- */
  contacto: {
    // Número de WhatsApp SOLO con dígitos, con indicativo de país (57 = Colombia)
    whatsapp: '573000000000',
    // Cómo se ve el número escrito en la página
    whatsappVisible: '+57 300 000 0000',
    correo: 'galaktionai1@gmail.com',
    // Usuario de Instagram SIN la @
    instagram: 'galaktion',
    dominio: 'galaktionai.com',
    ciudad: 'Colombia',
  },

  /* -----------------------------------------------------------------------
     MENSAJES DE WHATSAPP
     Cada botón de WhatsApp usa uno de estos mensajes ya escritos.
     ----------------------------------------------------------------------- */
  mensajes: {
    general: 'Hola, vengo de la web de Galaktion y quiero información sobre una página web',
    cotizarWeb: 'Hola, vengo de la web de Galaktion y quiero cotizar un sitio web premium',
    cotizarAds: 'Hola, vengo de la web de Galaktion y quiero cotizar publicidad y campañas Ads',
    cotizarIA: 'Hola, vengo de la web de Galaktion y quiero saber más sobre la automatización con IA',
    paqueteEsencial: 'Hola, vengo de la web de Galaktion y me interesa el paquete Esencial',
    paqueteProfesional: 'Hola, vengo de la web de Galaktion y me interesa el paquete Profesional',
    paquetePremium: 'Hola, vengo de la web de Galaktion y me interesa el paquete Premium',
  },

  /* -----------------------------------------------------------------------
     TEXTOS CLAVE — INICIO
     ----------------------------------------------------------------------- */
  inicio: {
    heroTitular: 'Construimos experiencias digitales que venden.',
    heroSubtitulo: 'Sitios web premium, animados e interactivos, y publicidad que convierte.',
    manifiesto: 'No hacemos páginas. Diseñamos la primera impresión de tu marca.',
    ctaTitular: '¿Listo para que tu marca se vea como merece?',
    ctaTexto: 'Cuéntanos tu idea por WhatsApp. Te respondemos el mismo día con una propuesta clara.',
  },

  /* -----------------------------------------------------------------------
     CIFRAS / GARANTÍAS (sección de contadores del inicio)
     numero: el valor al que llega el contador
     antes / despues: texto que va pegado antes o después del número
     ----------------------------------------------------------------------- */
  cifras: [
    { numero: '100', antes: '',   despues: '%',     etiqueta: 'A la medida. Cero plantillas.' },
    { numero: '15',  antes: '7–', despues: ' días', etiqueta: 'Entrega de tu sitio' },
    { numero: '100', antes: '',   despues: '%',     etiqueta: 'Optimizado para celular' },
    { numero: '60',  antes: '',   despues: ' fps',  etiqueta: 'Animaciones fluidas' },
  ],

  /* -----------------------------------------------------------------------
     PAQUETES (página Servicios)
     Reemplaza '$X' por tu precio, por ejemplo: '$1.200.000'
     ----------------------------------------------------------------------- */
  paquetes: {
    esencial: {
      nombre: 'Esencial',
      precio: '$X',
      descripcion: 'Una landing page premium para vender un producto o servicio.',
    },
    profesional: {
      nombre: 'Profesional',
      precio: '$X',
      descripcion: 'Sitio completo de varias páginas con animaciones a la medida.',
    },
    premium: {
      nombre: 'Premium',
      precio: '$X',
      descripcion: 'Sitio de alto nivel + campaña de publicidad lista para vender.',
    },
  },

  /* -----------------------------------------------------------------------
     NOSOTROS
     ----------------------------------------------------------------------- */
  nosotros: {
    historia1: 'Galaktion nace en Colombia con una idea simple: los negocios que hacen las cosas bien merecen verse igual de bien en internet.',
    historia2: 'Unimos diseño, tecnología e inteligencia artificial para construir sitios que se sienten premium desde el primer segundo, y campañas que convierten visitas en clientes.',
    historia3: 'Trabajamos con pocos proyectos a la vez para cuidar cada detalle. Precisión de ingeniería, sensibilidad de diseño.',
    fraseFinal: 'La precisión no es un detalle. Es nuestra firma.',
  },

  /* -----------------------------------------------------------------------
     CONTACTO (página)
     ----------------------------------------------------------------------- */
  paginaContacto: {
    intro: 'Cuéntanos qué necesitas. Al enviar, se abre WhatsApp con tu mensaje listo y te respondemos el mismo día.',
  },
};
