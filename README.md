# GALAKTION — sitio web oficial

Sitio de 5 páginas en HTML, CSS y JavaScript puro, con GSAP + ScrollTrigger + SplitText y Lenis (desde CDN). No necesita instalar nada ni compilar.

## Qué editar (sin tocar código)

Todo está en **`js/config.js`**:

| Qué | Dónde en `config.js` |
|---|---|
| Número de WhatsApp | `contacto.whatsapp` (solo dígitos, con 57) y `contacto.whatsappVisible` |
| Correo (hoy galaktionai1@gmail.com) e Instagram | `contacto.correo`, `contacto.instagram` (sin @) |
| Mensajes que se envían por WhatsApp | `mensajes` |
| Titular, subtítulo, manifiesto, llamado final | `inicio` |
| Contadores (100 %, 7–15 días…) | `cifras` |
| Precios de los paquetes | `paquetes.esencial.precio`, etc. (cambia `$X`) |
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
index.html · servicios.html · portafolio.html · nosotros.html · contacto.html · 404.html
css/   variables (paleta y tipografías) · base · fondos (A, B, C) · componentes · paginas
js/    config (datos editables) · main (arranque + Lenis) · cargador · transiciones · cursor · menu
       hero-g (la G que se construye) · animaciones (scroll de todas las páginas) · formulario
assets/  favicon, imagen para compartir (og-galaktion.jpg) y logos en svg/
images/portafolio/   capturas de proyectos
```

## Accesibilidad y rendimiento

- Con "reducir movimiento" activado en el sistema, el sitio se muestra completo y sin animaciones.
- Si los CDN de animación no cargan, a los 6 segundos se muestra todo el contenido igualmente.
- Las animaciones usan solo `transform` y `opacity`. En celular, el scroll es nativo (sin Lenis) y la G usa menos efectos.
