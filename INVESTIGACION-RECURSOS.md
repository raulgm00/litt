# Recursos para webs «caras»: qué es gratis y qué no (29-oct-2026, Exa)

Revisión de los 8 sitios del post + alternativas gratuitas. Resumen: **solo 3 de los 8 dan algo usable gratis**;
el resto son galerías de inspiración (capturas de sitios reales, no plantillas descargables).

## Los 8 sitios del post

| Sitio | Qué es | ¿Gratis? | Para qué nos sirve |
|---|---|---|---|
| scrolltide.co | 132 plantillas/prompts de webs con scroll y 3D, componentes sueltos, fondos animados | **6 de 132 gratis** (SELENE, Glacier, Fluxora, Visor, Monsoon, Aurora). Resto: $39/mes, $144/año o $299 de por vida; 3D solo anual o vitalicio | Los prompts generan React + Tailwind + Framer Motion. Ideas de componentes: *Fan Deck, Expanded Cards, Card Folder, Zoom Reveal, Image Tunnel, Parallax Row, Focus Reveal* |
| navbar.gallery | Galería de barras de navegación de sitios reales | Gratis, solo inspiración | Referencias de menú |
| footer.design | Galería de footers | Gratis, solo inspiración | Referencias de pie de página |
| cta.gallery | Galería de llamadas a la acción | Inspiración gratis; algunas plantillas Webflow/Framer de terceros «Use for free» | Referencias de botones/CTA |
| styles.refero.design | +2,000 design systems de sitios reales con su **DESIGN.md** | Navegación gratis (precios no publicados en la página) | Dar «gusto de diseño» a Claude: colores, tipografía, espaciado de Notion, Ramp, Intercom… |
| supahero.io | Galería de hero sections | Gratis, solo inspiración | Referencias de portada |
| 3dicons.co | +1,500 íconos 3D renderizados en Blender | **Gratis, licencia CC0** (uso comercial sin atribución) | Íconos 3D para tarjetas y secciones |
| glass.samasante.com | `@samasante/liquid-glass`: vidrio con refracción real en Chrome, Safari y Firefox | **Gratis, MIT** (npm) | Es componente **React**; nuestro sitio es HTML estático → habría que portarlo |

## Alternativas gratuitas más útiles (componentes animados)

| Librería | Licencia | Gratis | Nota |
|---|---|---|---|
| React Bits | MIT + Commons Clause | 218 componentes | La más grande; texto, fondos, cursores. No se pueden revender |
| Magic UI | MIT | 75–150 | shadcn; MCP propio |
| Aceternity UI | Licencia propia (uso comercial sí, reventa no) | 114 | Hero sections, Container Scroll, Liquid Glass |
| Eldora UI · Animata · Motion Primitives | MIT | Todo | Bloques para landings |
| Uiverse.io | MIT | Todo | **HTML/CSS puro**: botones, loaders, toggles. El único que no exige React |

**Trampa para nuestros sitios:** casi todo lo bueno es React + Tailwind + Motion. LITT y las landings de WeSoft son
HTML estático, así que se toma la **idea** y se re-implementa en vanilla (como ya hacemos con el skill web-premium).

## Qué tomamos para la propuesta LITT (re-implementado en vanilla)

- **Titular que entra palabra por palabra** con desenfoque → nitidez (Scrolltide Fluxora / catálogo «Letras que entran»).
- **Portada que se vuelve marco de cine** al hacer scroll (catálogo «Cine», XU:751, en reversa).
- **Expanded Cards** (Scrolltide): el reto en tres tarjetas con foto que se expanden al pasar el mouse.
- **Texto que se ilumina palabra por palabra con el scroll** (Scrolltide Ondine «pinned promise lights up word by word»).
- **Zoom Reveal** (Scrolltide) en la galería: la foto se abre desde un recorte al entrar en pantalla.

## Fuentes
scrolltide.co, scrolltide.co/pricing, scrolltide.co/free, scrolltide.co/faq · navbar.gallery · footer.design · cta.gallery ·
styles.refero.design · supahero.io · 3dicons.co/about · glass.samasante.com y npmjs.com/package/@samasante/liquid-glass ·
github.com/DavidHDev/react-bits · github.com/magicuidesign/magicui · ui.aceternity.com · eased.dev/compare · qodesign.dev/alternatives/react-bits
