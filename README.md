# GALAKTION — sitio web oficial

Sitio de 5 páginas en HTML, CSS y JavaScript puro, con GSAP + ScrollTrigger + SplitText y Lenis (desde CDN). No necesita instalar nada ni compilar.

## Qué editar (sin tocar código)

Todo está en **`js/config.js`**:

| Qué | Dónde en `config.js` |
|---|---|
| WhatsApp (vacío = oculto en todo el sitio) | `contacto.whatsapp` (solo dígitos, con 57) y `contacto.whatsappVisible` |
| Correo e Instagram | `contacto.correo`, `contacto.instagram` (sin @) |
| A qué correo llegan las solicitudes del formulario | `formulario.destino` |
| NIT o RUT (vacío = no se muestra) | `empresa.rut` |
| Titular y subtítulo del inicio, llamado final | `inicio` |
| Historia y frase final de Nosotros | `nosotros` |

Guarda el archivo y recarga la página.

Los demás textos (listas de servicios, pasos del proceso, valores) están directamente en cada `.html`, marcados con comentarios.

## Imágenes del portafolio

Pon las capturas en `images/portafolio/` con estos nombres exactos:
`cerrajeria-1.jpg` (escritorio, horizontal), `cerrajeria-2.jpg` (horizontal), `cerrajeria-3.jpg` (celular, vertical).
Si una imagen no existe, se muestra un recuadro elegante de ejemplo en su lugar.

## Ver el sitio en tu computador

En una terminal, dentro de la carpeta `claude nueva`:

```
powershell -ExecutionPolicy Bypass -File .claude/serve.ps1 -Root galaktion -Port 5520
```

Abre http://localhost:5520 en el navegador.

> La pantalla de carga sale solo en la primera visita de cada sesión. Para volver a verla, abre una ventana de incógnito.

## Dónde está publicado

- **Hosting:** Cloudflare Pages (gratis, red mundial, HTTPS automático).
- **Código:** GitHub. Cada cambio que se sube a GitHub se publica solo en 1–2 minutos.
- **Dominio:** galaktionai.com, comprado en Namecheap, con los DNS administrados por Cloudflare.
- Cloudflare quita el `.html` de las direcciones (`/servicios`), usa `404.html` para enlaces rotos y lee `_headers` (caché y seguridad).

## Después de publicar

- Prueba cómo se ve el enlace al compartir: https://developers.facebook.com/tools/debug/ (pega `https://galaktionai.com`).
- Da de alta el sitio en Google Search Console y envía `https://galaktionai.com/sitemap.xml`.

## Estructura

```
index · servicios · laboratorio · nosotros · contacto · politica-de-datos · terminos · 404 (portafolio.html queda oculto: fuera del menú y con noindex)
css/   variables (paleta y tipografías) · base · fondos (A, B, C) · componentes · paginas
js/    config (datos editables) · main (arranque + Lenis) · cargador · transiciones · cursor · menu
       hero-g (la G que se construye) · animaciones (scroll de todas las páginas) · formulario · faq · iconos (íconos animados de servicios)
assets/  favicon, imagen para compartir (og-galaktion.jpg) y logos en svg/
images/portafolio/   capturas de proyectos
```

## Accesibilidad y rendimiento

- Con "reducir movimiento" activado en el sistema, el sitio se muestra completo y sin animaciones.
- Si los CDN de animación no cargan, a los 6 segundos se muestra todo el contenido igualmente.
- Las animaciones usan solo `transform` y `opacity`. En celular, el scroll es nativo (sin Lenis) y la G usa menos efectos.

## Formulario "Solicitar diagnóstico"

- Las solicitudes se envían con **FormSubmit** (formsubmit.co) al correo de `formulario.destino`.
- **La primera vez** que alguien envíe el formulario, FormSubmit manda un correo de activación a ese buzón: hay que abrirlo y confirmar. Desde ahí llegan todas las solicitudes.
- Si el envío falla, el sitio abre el programa de correo del visitante con la solicitud ya escrita.
- La casilla de autorización (Ley 1581) es obligatoria para enviar.

## Legal

`politica-de-datos.html` y `terminos.html` son documentos base. Conviene que un abogado los revise y agregar el NIT en `config.js` cuando exista.
