/* =========================================================================
   GALAKTION AI — FORMULARIO "SOLICITAR DIAGNÓSTICO"
   -------------------------------------------------------------------------
   Envía la solicitud al correo configurado en js/config.js → formulario.destino
   mediante FormSubmit (sin servidor propio). Si el envío falla, abre el
   programa de correo con la solicitud ya escrita, para no perder el contacto.
   La autorización de tratamiento de datos (Ley 1581) es obligatoria.
   ========================================================================= */

(function () {
  'use strict';

  const form = document.getElementById('form-contacto');
  if (!form) return;

  const CFG = window.GALAKTION || {};
  const destino = (CFG.formulario && CFG.formulario.destino) || (CFG.contacto && CFG.contacto.correo) || '';
  const asunto = (CFG.formulario && CFG.formulario.asunto) || 'Solicitud de diagnóstico';
  const aviso = form.querySelector('.formulario__aviso');
  const boton = form.querySelector('button[type="submit"]');
  const textoBoton = boton.innerHTML;

  // Llegando desde un servicio (contacto.html?servicio=ia), se preselecciona el tipo de proyecto
  const servicio = new URLSearchParams(location.search).get('servicio');
  if (servicio && form.tipo.querySelector('option[value="' + servicio + '"]')) form.tipo.value = servicio;

  function texto(campo) { return (form[campo] && form[campo].value || '').trim(); }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    aviso.textContent = '';
    if (!form.checkValidity()) {
      form.reportValidity();
      if (!form.autorizacion.checked) aviso.textContent = 'Para enviar la solicitud debe autorizar el tratamiento de sus datos.';
      return;
    }
    if (texto('_honey')) return; // robot

    const tipo = form.tipo.options[form.tipo.selectedIndex].text;
    const datos = {
      Nombre: texto('nombre'),
      Empresa: texto('empresa'),
      Correo: texto('correo'),
      'Teléfono': texto('telefono'),
      'Tipo de proyecto': tipo,
      Mensaje: texto('mensaje'),
      'Autorización Ley 1581': 'Sí, otorgada el ' + new Date().toLocaleString('es-CO'),
      _subject: asunto + ' — ' + texto('empresa'),
      _replyto: texto('correo'),
      _template: 'table',
      _captcha: 'false',
    };

    boton.disabled = true;
    boton.textContent = 'Enviando…';

    try {
      const r = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(destino), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(datos),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || String(j.success) === 'false') throw new Error(j.message || 'error');
      form.reset();
      aviso.textContent = 'Recibimos su solicitud. Le responderemos en menos de 24 horas hábiles.';
    } catch (err) {
      // Respaldo: abrir el correo con la solicitud ya escrita
      const cuerpo = Object.keys(datos).filter((k) => k[0] !== '_').map((k) => k + ': ' + datos[k]).join('\n');
      const correo = (CFG.contacto && CFG.contacto.correo) || destino;
      window.location.href = 'mailto:' + correo + '?subject=' + encodeURIComponent(datos._subject) + '&body=' + encodeURIComponent(cuerpo);
      aviso.textContent = 'No pudimos enviar en línea. Abrimos su correo con la solicitud lista; si no se abre, escríbanos a ' + correo + '.';
    } finally {
      boton.disabled = false;
      boton.innerHTML = textoBoton;
    }
  });
})();
