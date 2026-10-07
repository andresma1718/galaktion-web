/* =========================================================================
   GALAKTION — FORMULARIO DE CONTACTO → WHATSAPP
   -------------------------------------------------------------------------
   No hay servidor: al enviar, armamos un mensaje con los datos del
   formulario y abrimos WhatsApp con ese mensaje listo para enviar.
   ========================================================================= */

(function () {
  'use strict';

  const form = document.getElementById('form-contacto');
  if (!form) return;

  const aviso = form.querySelector('.formulario__aviso');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validación nativa del navegador (campos requeridos, formato, etc.)
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const datos = new FormData(form);
    const valor = (campo) => (datos.get(campo) || '').toString().trim();

    const lineas = [
      'Hola, vengo de la web de Galaktion. Estos son mis datos:',
      '',
      '• Nombre: ' + valor('nombre'),
      '• WhatsApp: ' + valor('whatsapp'),
      '• Tipo de negocio: ' + valor('negocio'),
      '• Servicio de interés: ' + valor('servicio'),
    ];
    if (valor('mensaje')) lineas.push('', 'Mensaje:', valor('mensaje'));

    const numero = (window.GALAKTION && window.GALAKTION.contacto.whatsapp) || '';
    const url = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(lineas.join('\n'));

    window.open(url, '_blank', 'noopener');

    if (aviso) aviso.textContent = 'Listo. Se abrió WhatsApp con tu mensaje; solo dale enviar.';
    form.reset();
  });
})();
