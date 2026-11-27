/* =========================================================================
   GALAKTION AI — ARCHIVO DE CONFIGURACIÓN
   -------------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas tocar para cambiar datos de
   contacto, datos de la empresa y textos clave.

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
    // WhatsApp SOLO con dígitos y con indicativo (57 = Colombia), por ejemplo '573001234567'.
    // Mientras esté vacío, todos los botones y enlaces de WhatsApp permanecen ocultos.
    whatsapp: '',
    // Cómo se ve el número escrito en la página, por ejemplo '+57 300 123 4567'
    whatsappVisible: '',
    correo: 'contacto@galaktionai.com',
    // Usuario de Instagram SIN la @
    instagram: 'galaktion.ai',
    // Enlaces de reservas de Cal.com para el botón de diagnóstico.
    // calcomEn = páginas en inglés (/logistics); calcomEs = páginas en español (/inmobiliarias).
    // Vacío = el botón lleva a contacto.html.
    calcomEn: 'https://cal.com/andres-marin-hrw4et/diagnostic-call',
    calcomEs: 'https://cal.com/andres-marin-hrw4et/diagnostico',
    dominio: 'galaktionai.com',
  },

  /* -----------------------------------------------------------------------
     EMPRESA (pie de página y política de datos)
     ----------------------------------------------------------------------- */
  empresa: {
    nombre: 'Galaktion AI',
    ciudad: 'Medellín, Colombia',
    // Cuando exista, escribe aquí el NIT o RUT, por ejemplo 'NIT 901.234.567-8'. Vacío = no se muestra.
    rut: '',
    // Responsable legal del tratamiento de datos (Ley 1581). Completar ANTES de publicar.
    responsable: '',      // nombre completo, por ejemplo 'Nombre Apellido Apellido, persona natural'
    documento: '',        // por ejemplo 'C.C. 1.234.567.890'
    direccion: '',        // dirección física en Medellín
    telefono: '',         // teléfono de contacto
  },

  /* -----------------------------------------------------------------------
     FORMULARIO "SOLICITAR DIAGNÓSTICO"
     Las solicitudes llegan a este correo (servicio FormSubmit, sin servidor propio).
     Cuando se active contacto@galaktionai.com, se puede cambiar aquí.
     ----------------------------------------------------------------------- */
  formulario: {
    destino: 'galaktionai1@gmail.com',
    asunto: 'Nueva solicitud de diagnóstico — galaktionai.com',
  },

  /* -----------------------------------------------------------------------
     MENSAJE DE WHATSAPP (cuando se configure el número)
     ----------------------------------------------------------------------- */
  mensajes: {
    general: 'Hola, vengo de galaktionai.com y quiero solicitar un diagnóstico.',
  },

  /* -----------------------------------------------------------------------
     TEXTOS CLAVE — INICIO
     ----------------------------------------------------------------------- */
  inicio: {
    heroTitular: 'Desarrollo de software y\u00A0automatización con IA para\u00A0empresas.',
    heroSubtitulo: 'Desarrollamos software a medida, automatizaciones con IA y plataformas web corporativas. Con alcance definido por escrito, código propiedad del cliente, soporte después del lanzamiento y estrategia digital para hacer crecer su empresa.',
    ctaTitular: '¿Tiene un proyecto en mente?',
    ctaTexto: 'Cuéntenos el contexto. Le respondemos en menos de un día hábil con los siguientes pasos.',
  },

  /* -----------------------------------------------------------------------
     NOSOTROS
     ----------------------------------------------------------------------- */
  nosotros: {
    historia1: 'Galaktion AI es una firma de tecnología con sede en Medellín. Diseñamos y construimos software a medida, automatizaciones con inteligencia artificial y plataformas web para empresas.',
    historia2: 'Trabajamos con pocos proyectos a la vez para que cada uno tenga dirección técnica directa, desde el diagnóstico hasta el soporte.',
    historia3: 'Nuestro criterio es simple: construir solo lo que resuelve un problema real del negocio, documentarlo bien y entregarlo bajo control del cliente.',
    fraseFinal: 'La buena tecnología es la que su empresa puede usar, entender y hacer crecer.',
  },

  /* -----------------------------------------------------------------------
     CONTACTO (página)
     ----------------------------------------------------------------------- */
  paginaContacto: {
    intro: 'Cuéntenos sobre su empresa y el proyecto. Le respondemos en menos de un día hábil para agendar la llamada.',
  },
};
