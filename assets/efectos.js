/* =============================================================================
   Efectos "web cara" · JS (skill web-premium). Sin dependencias. Acompaña a efectos.css.
   Auto-arranque: data-fx="dock" | "spot" | "contador" (y [data-fx-contador] en cada cifra).
   API: Fx.crossfade(fn) · Fx.compartido(origen, cambiar, destino) · Fx.entrada(cont) · Fx.empujar(app, on) · Fx.paginar(caja, cambiar, dir)
   Reglas: solo transform/opacity/filter; pointermove agrupado en rAF; nada con reduced-motion;
   lo que sigue al cursor solo con (hover:hover) and (pointer:fine).
   ============================================================================= */
(function (global) {
  "use strict";
  var quieto = function () { return global.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var fino = function () { return global.matchMedia && matchMedia("(hover:hover) and (pointer:fine)").matches; };

  // 1) Crossfade dentro del mismo documento (pestañas / vistas). Sin soporte o con reduced-motion: cambio en seco.
  function crossfade(fn) {
    if (!document.startViewTransition || quieto() || document.visibilityState === "hidden") { fn(); return null; }
    try { return document.startViewTransition(fn); } catch (e) { fn(); return null; }
  }

  // 2) Elemento compartido: `origen` viaja hasta lo que devuelva `destino()` después de `cambiar()`.
  //    El view-transition-name debe ser ÚNICO: se pasa del origen al destino dentro del callback.
  function compartido(origen, cambiar, destino) {
    if (!origen || !document.startViewTransition || quieto()) { cambiar(); return null; }
    var NOMBRE = "fx-compartido", puestos = [];
    var poner = function (n) { if (n) { n.style.viewTransitionName = NOMBRE; puestos.push(n); } };
    var quitar = function () { puestos.forEach(function (n) { n.style.viewTransitionName = ""; }); puestos = []; };
    poner(origen);
    var vt = document.startViewTransition(function () { quitar(); cambiar(); poner(destino && destino()); });
    vt.finished.then(quitar, quitar); vt.ready.catch(function () {});
    return vt;
  }

  // 3) Dock: cada hijo recibe --dock (0..1) según la distancia al cursor (campana gaussiana)
  function dock(lista, radio) {
    if (!fino()) return;
    radio = radio || 62;
    var items = [].slice.call(lista.children), raf = 0, px = null, py = null;
    var vertical = lista.getBoundingClientRect().height > lista.getBoundingClientRect().width;
    function pinta() {
      raf = 0;
      items.forEach(function (it) {
        var m = 0;
        if (px !== null && !quieto()) {
          var r = it.getBoundingClientRect();
          var d = (vertical ? (r.top + r.height / 2 - py) : (r.left + r.width / 2 - px)) / radio;
          m = Math.exp(-d * d); if (m < .02) m = 0;
        }
        it.style.setProperty("--dock", m.toFixed(3));
      });
    }
    lista.addEventListener("pointermove", function (e) { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(pinta); });
    lista.addEventListener("pointerleave", function () { px = py = null; if (!raf) raf = requestAnimationFrame(pinta); });
  }

  // 4) Spotlight: la luz sigue al cursor dentro de cada .fx-spot-item (variables --x / --y)
  function spot(rejilla) {
    if (!fino()) return;
    var raf = 0, ev = null;
    rejilla.addEventListener("pointermove", function (e) {
      ev = e; if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        rejilla.querySelectorAll(".fx-spot-item").forEach(function (c) {
          var r = c.getBoundingClientRect();
          c.style.setProperty("--x", (ev.clientX - r.left) + "px"); c.style.setProperty("--y", (ev.clientY - r.top) + "px");
        });
      });
    });
  }

  // 5) Contador: [data-fx-contador] cuenta de 0 a su número al entrar en pantalla (respeta prefijo/sufijo y decimales)
  function contador(raiz) {
    var els = [].slice.call((raiz || document).querySelectorAll("[data-fx-contador]"));
    if (!els.length) return;
    var corre = function (el) {
      if (el.dataset.fxContado) return; el.dataset.fxContado = "1";
      var txt = el.textContent, m = txt.match(/-?[\d,.]+/); if (!m) return;
      var crudo = m[0], dec = (crudo.split(".")[1] || "").length, fin = parseFloat(crudo.replace(/,/g, ""));
      if (quieto() || !isFinite(fin)) return;
      var antes = txt.slice(0, m.index), despues = txt.slice(m.index + crudo.length);
      var fmt = function (v) { return antes + v.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + despues; };
      var dur = +(el.dataset.fxContador || 900), t0 = 0;
      el.style.fontVariantNumeric = "tabular-nums";       // las cifras no "bailan" de ancho
      (function paso(t) { t0 = t0 || t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(fin * e); if (p < 1) requestAnimationFrame(paso); else el.textContent = txt; })(performance.now());
    };
    if (!("IntersectionObserver" in global)) { els.forEach(corre); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { corre(e.target); io.unobserve(e.target); } }); }, { threshold: .4 });
    els.forEach(function (el) { io.observe(el); });
  }

  // 6) Entrada en cascada: marca .fx-item con --i (tope 10 → ≤450 ms en total) y dispara la animación
  function entrada(cont, selector) {
    if (!cont || quieto()) return;
    var items = cont.querySelectorAll(selector || ".fx-item");
    for (var i = 0; i < items.length; i++) { items[i].classList.add("fx-item"); items[i].style.setProperty("--i", Math.min(i, 10)); }
    cont.classList.remove("fx-entrando"); void cont.offsetWidth; cont.classList.add("fx-entrando");
    clearTimeout(cont._fxT); cont._fxT = setTimeout(function () { cont.classList.remove("fx-entrando"); }, 1200);
  }

  // 7) Empuje de fondo al abrir un panel: la app se encoge y se corre; velo desenfocado encima
  function empujar(app, on) {
    var velo = document.querySelector(".fx-velo");
    if (!velo) { velo = document.createElement("div"); velo.className = "fx-velo"; document.body.appendChild(velo); }
    app.classList.add("fx-empujable");
    var escritorio = !global.matchMedia || matchMedia("(min-width:1024px)").matches;   // en móvil corta el layout
    app.classList.toggle("fx-empujado", !!on && escritorio);
    velo.classList.toggle("on", !!on);
    document.body.style.overflow = on ? "hidden" : "";
    return velo;
  }

  // 8) Paginación como tarjeta (Siguiente/Anterior de una tabla o lista): la página actual se va hacia atrás
  //    desvanecida y la nueva llega desde el fondo; las filas entran en cascada. `cambiar()` repinta el contenido
  //    (debe leer el estado actual, p. ej. la variable `pag`); dir = 1 siguiente, -1 anterior.
  //    Clics rápidos: corta la animación y repinta al estado final. Origen: Portal ISSSTE (25-oct-2026).
  //    dir = 0 para filtros/orden (llega de frente, sin desliz lateral).
  //    op.esqueleto (número de filas o función que lo devuelve): "tipo Supabase" — mientras llega la página se ve un
  //    esqueleto con brillo del mismo alto que las filas reales (columnas congeladas para que no brinquen) y luego
  //    entran las filas reales. Requiere .fx-sk de efectos.css. Si devuelve 0 (sin resultados) se repinta directo.
  function paginar(caja, cambiar, dir, filasSel, op) {
    dir = dir == null ? 1 : dir; op = op || {};
    if (!caja.animate || quieto()) { cambiar(); return; }
    var enCurso = caja.getAnimations().length > 0 || !!caja._fxSk;
    caja.getAnimations().forEach(function (a) { a.cancel(); });
    clearTimeout(caja._fxSk); caja._fxSk = 0;
    var tbody = caja.querySelector("tbody"), ths = caja.querySelectorAll("thead th");
    var altoFila = ((tbody && (tbody.querySelector("tr:not(.fx-sk-fila)") || tbody.firstElementChild)) || {}).offsetHeight || 48;
    // Una caja con overflow-x:auto también hace scroll vertical: las filas que entran desplazadas 8px
    // sacaban una barra durante la transición. Se oculta el eje Y mientras dura y luego se restaura.
    if (!caja.hasAttribute("data-fx-oy")) caja.setAttribute("data-fx-oy", caja.style.overflowY || "");
    caja.style.overflowY = "hidden";
    clearTimeout(caja._fxOy);
    caja._fxOy = setTimeout(function () { caja.style.overflowY = caja.getAttribute("data-fx-oy"); caja.removeAttribute("data-fx-oy"); }, 170 + 70 + 14 * 26 + 280 + 120 + (op.esqueleto ? (op.msEsqueleto || 340) : 0));
    function cascada(base) {
      var filas = caja.querySelectorAll(filasSel || "tbody > tr, [data-fx-fila]");
      for (var i = 0; i < Math.min(filas.length, 14); i++)
        filas[i].animate([{ opacity: 0, transform: "translateY(8px)", filter: "blur(3px)" }, { opacity: 1, transform: "none", filter: "none" }],
          { duration: 280, delay: base + i * 26, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
    }
    function llega() {
      caja.animate([{ opacity: 0, transform: "perspective(1200px) translate3d(" + (28 * dir) + "px,0,-160px)", filter: "blur(8px)" },
                    { opacity: 1, transform: "none", filter: "none" }], { duration: 480, easing: "cubic-bezier(.25,.8,.3,1)" });
    }
    function entrar() {
      var n = typeof op.esqueleto === "function" ? op.esqueleto() : op.esqueleto;
      if (!n || !tbody) { cambiar(); llega(); cascada(70); return; }
      var anchos = [].map.call(ths, function (th) { return th.getBoundingClientRect().width; });
      [].forEach.call(ths, function (th, i) { th.style.width = anchos[i] + "px"; });
      var cols = Math.max(1, ths.length || (tbody.rows[0] && tbody.rows[0].cells.length) || 1), h = "";
      for (var r = 0; r < n; r++) {
        h += '<tr class="fx-sk-fila" aria-hidden="true" style="height:' + altoFila + 'px">';
        for (var c = 0; c < cols; c++) h += '<td><span class="fx-sk" style="width:' + (42 + ((r * 7 + c * 13) % 40)) + '%"></span></td>';
        h += "</tr>";
      }
      tbody.innerHTML = h; llega();
      caja._fxSk = setTimeout(function () {
        caja._fxSk = 0; [].forEach.call(ths, function (th) { th.style.width = ""; });
        cambiar(); cascada(0);
      }, op.msEsqueleto || 340);
    }
    if (enCurso) { entrar(); return; }
    var sal = caja.animate([{ opacity: 1, transform: "none", filter: "none" },
                            { opacity: 0, transform: "perspective(1200px) translate3d(" + (-28 * dir) + "px,0,-90px)", filter: "blur(4px)" }],
                           { duration: 170, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" });
    sal.onfinish = function () { entrar(); sal.cancel(); };
  }

  function auto() {
    document.querySelectorAll('[data-fx="dock"]').forEach(function (l) { dock(l); });
    document.querySelectorAll('[data-fx="spot"]').forEach(function (r) { spot(r); });
    contador(document);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();

  global.Fx = { crossfade: crossfade, compartido: compartido, dock: dock, spot: spot, contador: contador, entrada: entrada, empujar: empujar, paginar: paginar };
})(window);
