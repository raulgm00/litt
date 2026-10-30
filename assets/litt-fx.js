/* =============================================================================
   Efectos de LITT (página principal y propuesta). Recetas del skill web-premium:
   - Túnel de perspectiva y carpeta de vidrio: vendedor.ruflestv.com (XU:1599, carpeta()).
   - Timeline horizontal fijado: portal ISSSTE (IX:266).
   Reglas: solo transform/opacity, rAF agrupado, nada con prefers-reduced-motion
   (sin JS o con movimiento reducido todo queda estático y legible).
   ============================================================================= */
(function () {
  "use strict";
  var QUIETO = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINO = matchMedia("(hover:hover) and (pointer:fine)").matches;
  function lim(v, a, b) { return v < a ? a : v > b ? b : v; }
  function seguro(n, fn) { try { fn(); } catch (e) { if (window.console) console.warn("[litt-fx] " + n + ":", e); } }

  // Video de fondo del hero: solo sin reduced-motion ni ahorro de datos; si falla, queda la foto
  seguro("video", function () {
    var v = document.getElementById("heroVideo"); if (!v) return;
    var ahorro = navigator.connection && navigator.connection.saveData;
    if (QUIETO || ahorro) { v.remove(); return; }
    v.addEventListener("canplay", function () { v.classList.add("listo"); v.play().catch(function () {}); }, { once: true });
    v.addEventListener("error", function () { v.remove(); }, { once: true });
    v.src = v.getAttribute("data-src") || "img/hero-loop.mp4";
  });

  // Música de fondo en bucle. Los navegadores no dejan sonar una página sin un gesto del visitante:
  // se intenta al cargar y, si lo bloquean, arranca con el primer clic, toque o tecla en cualquier parte.
  // data-fx-musica="video" = la pista va dentro del video del hero (sincronía perfecta en cada vuelta);
  // si no hay video (movimiento reducido o ahorro de datos) se usa data-alt. El icono solo sirve para silenciar.
  seguro("musica", function () {
    var ctl = document.querySelector("[data-fx-musica]"); if (!ctl) return;
    var modo = ctl.getAttribute("data-fx-musica"), v = document.getElementById("heroVideo"), a = null, on = false, callada = false;
    var GESTOS = ["pointerdown", "keydown", "touchend"];
    function fuente() {
      if (modo === "video" && v && v.isConnected) return v;
      if (!a) { var s = modo === "video" ? ctl.getAttribute("data-alt") : modo; if (!s) return null; a = new Audio(s); a.loop = true; a.volume = .75; }
      return a;
    }
    function pintar() { ctl.classList.toggle("on", on); ctl.setAttribute("aria-pressed", on ? "true" : "false"); ctl.setAttribute("aria-label", on ? "Silenciar la música" : "Activar la música"); }
    function sonar(si) {
      var f = fuente(); if (!f) return;
      if (f === v) {
        v.muted = !si; on = si; pintar();
        if (si) v.play().catch(function () { v.muted = true; on = false; pintar(); v.play().catch(function () {}); });
      } else if (si) { f.play().then(function () { on = true; pintar(); }).catch(function () { on = false; pintar(); }); }
      else { f.pause(); on = false; pintar(); }
    }
    function primero(e) { if (ctl.contains(e.target)) return; soltar(); if (!callada) sonar(true); }
    function soltar() { GESTOS.forEach(function (t) { removeEventListener(t, primero, true); }); }
    GESTOS.forEach(function (t) { addEventListener(t, primero, true); });
    ctl.addEventListener("click", function () { soltar(); callada = on; sonar(!on); });
    pintar();
    // intento sin gesto (Chrome lo permite en sitios que el visitante ya frecuenta)
    if (modo !== "video") { var f = fuente(); if (f) f.play().then(function () { on = true; pintar(); soltar(); }).catch(function () {}); }
    else if (v && v.isConnected) v.addEventListener("playing", function () { if (!v.muted) { on = true; pintar(); soltar(); } }, { once: true });
  });

  // Túnel de perspectiva: cada tarjeta viaja en Z durante su tramo del scroll, en ángulo dorado
  seguro("tunel", function () {
    if (QUIETO) return;
    [].forEach.call(document.querySelectorAll("section.tunel"), function (sec) {
      sec.classList.add("tunel--3d");
      var pin = sec.querySelector(".tunel__pin"), tit = sec.querySelector(".tunel__titulo"),
        cards = [].slice.call(sec.querySelectorAll(".tcard")), n = cards.length, G = 137.5 * Math.PI / 180;
      var D = cards.map(function (c, i) { return { c: c, cos: Math.cos(i * G), sin: Math.sin(i * G), rx: .27 + (i % 3) * .06, ry: .22 + (i % 2) * .07, rz: (i % 2 ? -1 : 1) * (2 + (i % 5) * 1.5) }; });
      var p = 0, px = 0, py = 0, tx = 0, ty = 0, cw = 0, raf = 0;
      function pedir() { if (!raf) raf = requestAnimationFrame(pintar); }
      if (FINO) addEventListener("pointermove", function (e) { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; pedir(); }, { passive: true });
      function pintar() {
        raf = 0;
        var r = sec.getBoundingClientRect(), W = document.documentElement.clientWidth, H = innerHeight;
        if (r.top > H || r.bottom < 0) return;
        var obj = lim(-r.top / Math.max(1, r.height - H), 0, 1); p += (obj - p) * .22; px += (tx - px) * .08; py += (ty - py) * .08;
        var mov = W < 768, span = mov ? .30 : .52, paso = (1 - span - .04) / Math.max(1, n - 1), z0 = mov ? -900 : -1700, z1 = mov ? 40 : 500, par = mov ? 0 : 38;
        var w = Math.round(mov ? lim(W * .66, 210, 280) : lim(W * .2, 230, 300)); if (w !== cw) { cw = w; pin.style.setProperty("--cw", w + "px"); }
        D.forEach(function (d, i) {
          var y = lim((p - i * paso) / span, 0, 1), z = z0 + (z1 - z0) * y, c = mov ? .74 : .84,
            o = y < .16 ? y / .16 : y > c ? Math.max(0, 1 - (y - c) / (mov ? .18 : .14)) : 1;
          var x = d.cos * W * (mov ? .08 : d.rx) - px * par, yy = d.sin * H * (mov ? .2 : d.ry) - py * par;
          d.c.style.transform = "translate3d(calc(-50% + " + x.toFixed(1) + "px),calc(-50% + " + yy.toFixed(1) + "px)," + z.toFixed(1) + "px) rotateZ(" + d.rz + "deg)";
          d.c.style.opacity = o.toFixed(3);
        });
        var to = p < .05 ? 1 : Math.max(.14, 1 - (p - .05) * 4.2), fin = p > .94 ? Math.max(0, 1 - (p - .94) / .06) : 1;
        tit.style.transform = "scale(" + (.86 + .4 * p).toFixed(3) + ")"; tit.style.opacity = (to * fin).toFixed(3);
        if (Math.abs(obj - p) > .0004 || Math.abs(tx - px) > .002 || Math.abs(ty - py) > .002) pedir();
      }
      addEventListener("scroll", pedir, { passive: true }); addEventListener("resize", pedir); pedir();
    });
  });

  // Carpeta de vidrio: se arma al entrar en pantalla y se abre al tocarla (sin JS / reduced-motion: abierta y quieta)
  seguro("carpeta", function () {
    [].forEach.call(document.querySelectorAll(".gf"), function (gf) {
      gf.classList.add("gf--js");
      var hojas = gf.querySelector(".gf__hojas"), hit = gf.querySelector(".gf__hit"), nombre = gf.getAttribute("data-nombre") || "la carpeta";
      function abierta() { return gf.hasAttribute("data-open"); }
      function abrir(v) {
        gf.toggleAttribute("data-open", v); hit.setAttribute("aria-expanded", v ? "true" : "false");
        hit.setAttribute("aria-label", (v ? "Cerrar " : "Abrir ") + nombre);
        if (v) hojas.removeAttribute("inert"); else hojas.setAttribute("inert", "");
      }
      abrir(QUIETO);
      hit.addEventListener("click", function () { abrir(!abierta()); });
      document.addEventListener("pointerdown", function (e) { if (abierta() && !gf.contains(e.target)) abrir(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && abierta()) { abrir(false); try { hit.focus({ preventScroll: true }); } catch (_) {} } });
      if (FINO && !QUIETO) {
        var r = 0, x = 0, y = 0;
        var pon = function () { r = 0; gf.style.setProperty("--px", x.toFixed(3)); gf.style.setProperty("--py", y.toFixed(3)); };
        gf.addEventListener("pointermove", function (e) { if (e.pointerType === "touch") return; var b = gf.getBoundingClientRect(); x = lim((e.clientX - b.left) / b.width * 2 - 1, -1.4, 1.4); y = lim((e.clientY - b.top) / b.height * 2 - 1, -1.4, 1.4); if (!r) r = requestAnimationFrame(pon); });
        gf.addEventListener("pointerleave", function () { x = 0; y = 0; if (!r) r = requestAnimationFrame(pon); });
      }
      if ("IntersectionObserver" in window && !QUIETO) {
        var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); setTimeout(function () { gf.setAttribute("data-entrado", ""); }, 80); } }, { threshold: .35 });
        io.observe(gf);
      } else gf.setAttribute("data-entrado", "");
    });
  });

  // Timeline horizontal fijado: el avance vertical dentro de la sección mueve la pista
  seguro("timeline", function () {
    if (QUIETO) return;
    var secs = [].slice.call(document.querySelectorAll("section.h-tl"));
    if (!secs.length) return;
    document.documentElement.classList.remove("sin-tl");
    secs.forEach(function (sec) {
      var track = sec.querySelector(".tl-track"), fill = sec.querySelector(".tl-line i"), cnt = sec.querySelector(".tl-cnt b");
      var hitos = [].slice.call(track.querySelectorAll(".tl-hito")), vw = 0, vh = 0, dist = 0, tw = 0, nPrev = -1, raf = 0;
      function medir() {
        vw = document.documentElement.clientWidth; vh = innerHeight;
        tw = track.scrollWidth; dist = Math.max(0, tw - vw);
        sec.style.height = Math.round(vh + dist * 1.1) + "px";
        pintar();
      }
      function pintar() {
        raf = 0;
        var r = sec.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) return;
        var total = r.height - vh, p = total > 0 ? lim(-r.top / total, 0, 1) : 0, x = -p * dist, n = 0;
        track.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
        fill.style.transform = "scaleX(" + lim((vw * .5 - x) / (tw || 1), 0, 1).toFixed(4) + ")";
        hitos.forEach(function (h) { var on = h.offsetLeft + x < vw * .5 + 1; h.classList.toggle("on", on); if (on) n++; });
        if (n !== nPrev && cnt) { nPrev = n; cnt.textContent = "0" + Math.max(1, n); }
      }
      addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(pintar); }, { passive: true });
      addEventListener("resize", medir); addEventListener("load", medir); medir();
    });
  });

  // Parte un texto en palabras (conserva los <span class="acento"> y sus clases en cada palabra)
  function partir(el, clase) {
    var i = 0, frag = document.createDocumentFragment();
    [].slice.call(el.childNodes).forEach(function (nodo) {
      var cls = nodo.nodeType === 1 ? nodo.className : "", txt = nodo.textContent;
      txt.split(/(\s+)/).forEach(function (t) {
        if (!t) return;
        if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
        var s = document.createElement("span"); s.className = clase + (cls ? " " + cls : ""); s.textContent = t;
        s.setAttribute("data-w", i); s.style.setProperty("--w", i++); frag.appendChild(s);
      });
    });
    el.textContent = ""; el.appendChild(frag); return i;
  }

  // Titular que entra palabra por palabra (desenfoque → nítido)
  seguro("palabras", function () {
    if (QUIETO) return;
    [].forEach.call(document.querySelectorAll("[data-fx-palabras]"), function (el) {
      el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
      partir(el, "fx-palabra"); el.classList.add("fx-palabras-on");
      [].forEach.call(el.children, function (c) { c.setAttribute("aria-hidden", "true"); });
    });
  });

  // Portada que se vuelve marco de cine: la foto se recorta con esquinas redondas y el texto sube
  seguro("cine", function () {
    if (QUIETO) return;
    [].forEach.call(document.querySelectorAll(".hero[data-fx-cine]"), function (hero) {
      var foto = hero.querySelector(".hero-foto"), txt = hero.querySelector(".hero-texto"), raf = 0;
      function pintar() {
        raf = 0;
        var r = hero.getBoundingClientRect(), H = innerHeight;
        if (r.bottom < 0) return;
        var p = lim(-r.top / (H * .75), 0, 1), e = p * p * (3 - 2 * p);
        var lado = (e * 5).toFixed(2), abajo = (e * 10).toFixed(2), rad = Math.round(e * 28);
        foto.style.clipPath = "inset(" + (e * 3).toFixed(2) + "% " + lado + "% " + abajo + "% " + lado + "% round " + rad + "px)";
        foto.style.transform = "scale(" + (1 + e * .06).toFixed(4) + ")";
        txt.style.transform = "translateY(" + (-e * 60).toFixed(1) + "px)";
        txt.style.opacity = (1 - e * .85).toFixed(3);
      }
      addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(pintar); }, { passive: true });
      pintar();
    });
  });

  // Expanded Cards: la activa crece; se activa con el mouse, el foco o un toque
  seguro("expandir", function () {
    [].forEach.call(document.querySelectorAll(".expandir"), function (grupo) {
      var cs = [].slice.call(grupo.querySelectorAll(".exp"));
      function activar(c) { cs.forEach(function (x) { x.classList.toggle("activa", x === c); x.setAttribute("aria-expanded", x === c ? "true" : "false"); }); }
      cs.forEach(function (c) {
        c.addEventListener("mouseenter", function () { if (FINO) activar(c); });
        c.addEventListener("focus", function () { activar(c); });
        c.addEventListener("click", function () { activar(c); });
      });
      activar(grupo.querySelector(".exp.activa") || cs[0]);
    });
  });

  // Texto que se ilumina palabra por palabra mientras cruza la pantalla
  seguro("leer", function () {
    if (QUIETO) return;
    [].forEach.call(document.querySelectorAll("[data-fx-leer]"), function (el) {
      var dest = (el.getAttribute("data-destacar") || "").split("|").filter(Boolean);
      var n = partir(el, "fx-w"), ws = [].slice.call(el.querySelectorAll(".fx-w")), raf = 0, prev = -1;
      ws.forEach(function (w) { if (dest.some(function (d) { return w.textContent.indexOf(d) === 0; })) w.classList.add("dest"); });
      el.classList.add("leer-on");
      function pintar() {
        raf = 0;
        var r = el.getBoundingClientRect(), H = innerHeight;
        var p = lim((H * .85 - r.top) / (H * .55), 0, 1), k = Math.round(p * n);
        if (k === prev) return; prev = k;
        ws.forEach(function (w, i) { w.classList.toggle("on", i < k); });
      }
      addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(pintar); }, { passive: true });
      pintar();
    });
  });

  // Zoom reveal: la foto se abre desde un recorte y se aleja mientras entra en pantalla
  seguro("zoom", function () {
    if (QUIETO) return;
    var figs = [].slice.call(document.querySelectorAll("[data-fx-zoom]")), raf = 0;
    if (!figs.length) return;
    function pintar() {
      raf = 0; var H = innerHeight;
      figs.forEach(function (f) {
        var r = f.getBoundingClientRect(); if (r.top > H || r.bottom < 0) return;
        var p = lim((H - r.top) / (H * .6), 0, 1), e = 1 - Math.pow(1 - p, 3), img = f.querySelector("img");
        var c = ((1 - e) * 16).toFixed(2);
        img.style.clipPath = "inset(" + c + "% " + c + "% " + c + "% " + c + "% round " + Math.round((1 - e) * 40) + "px)";
        img.style.transform = "scale(" + (1.28 - e * .28).toFixed(4) + ")";
      });
    }
    addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(pintar); }, { passive: true });
    addEventListener("resize", pintar); pintar();
  });

  // Tarjetas que salen hacia adelante: cada una viaja desde el fondo (Z) mientras la rejilla cruza la pantalla.
  // Mismo lenguaje que el túnel, pero sin fijar la sección. Escalonado por columna.
  seguro("profundidad", function () {
    if (QUIETO) return;
    var items = [], raf = 0;
    [].forEach.call(document.querySelectorAll("[data-fx-profundidad]"), function (g) {
      g.classList.add("prof-on");
      [].forEach.call(g.children, function (c) { items.push({ c: c, g: g, col: 0, dy: 0 }); });
    });
    if (!items.length) return;
    function medir() {
      var fila = {};
      items.forEach(function (d) {
        d.dy = d.c.offsetTop - d.g.offsetTop;
        var k = d.g.dataset.fxId || (d.g.dataset.fxId = Math.random().toString(36).slice(2)), clave = k + ":" + d.dy;
        d.col = fila[clave] = (fila[clave] === undefined ? 0 : fila[clave] + 1);
      });
      pintar();
    }
    function pintar() {
      raf = 0; var H = innerHeight;
      items.forEach(function (d) {
        var top = d.g.getBoundingClientRect().top + d.dy;
        if (top > H * 1.2 || top < -H) return;
        var p = lim((H * .98 - top) / (H * .42) - d.col * .14, 0, 1), e = 1 - Math.pow(1 - p, 3), q = 1 - e;
        d.c.style.transform = "translate3d(0," + (q * 70).toFixed(1) + "px," + (-q * 360).toFixed(1) + "px) rotateX(" + (q * 16).toFixed(2) + "deg)";
        d.c.style.opacity = (.12 + .88 * e).toFixed(3);
      });
    }
    addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(pintar); }, { passive: true });
    addEventListener("resize", medir); addEventListener("load", medir); medir();
  });

  // Parallax: la sierra del fondo en dos capas (la cercana se hunde más que la lejana)
  // y la galería como fila con velocidades distintas por columna (usa `translate`, no choca con la cascada ni el zoom)
  seguro("parallax", function () {
    if (QUIETO) return;
    var capas = [].slice.call(document.querySelectorAll(".sierra path")),
      figs = [].slice.call(document.querySelectorAll(".galeria .foto")), vel = [.07, -.05, .07], raf = 0;
    function pintar() {
      raf = 0; var H = innerHeight, doc = document.documentElement, ancho = doc.clientWidth >= 760;
      var p = lim(scrollY / Math.max(1, doc.scrollHeight - H), 0, 1);
      if (capas[0]) capas[0].style.transform = "translateY(" + (p * 26).toFixed(1) + "px)";
      if (capas[1]) capas[1].style.transform = "translateY(" + (p * 58).toFixed(1) + "px)";
      figs.forEach(function (f, i) {
        if (!ancho) { f.style.translate = ""; return; }
        var r = f.parentNode.getBoundingClientRect(); if (r.top > H || r.bottom < 0) return;
        var c = (r.top + r.height / 2 - H / 2);
        f.style.translate = "0 " + (c * vel[i % 3]).toFixed(1) + "px";
      });
    }
    addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(pintar); }, { passive: true });
    addEventListener("resize", pintar); pintar();
  });

  // Cabeceras de sección: misma entrada en toda la página (sube desde abajo y se enfoca)
  seguro("cabeceras", function () {
    if (QUIETO || !("IntersectionObserver" in window)) return;
    var secs = [].slice.call(document.querySelectorAll("main section:not(.hero):not(.tunel):not(.h-tl)"));
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("cab-vista"); io.unobserve(e.target); } }); }, { threshold: .12 });
    secs.forEach(function (s) {
      var eb = s.querySelector(".eyebrow"); if (!eb) return;
      eb.classList.add("cab"); var h = eb.nextElementSibling; if (h && /^H2$/.test(h.tagName)) h.classList.add("cab", "cab-2");
      if (s.getBoundingClientRect().top < innerHeight) s.classList.add("cab-vista"); else io.observe(s);
    });
    document.documentElement.classList.add("cab-js");
  });

  // Cascada al entrar cada bloque .revela en pantalla (una sola vez)
  seguro("cascada", function () {
    if (!("IntersectionObserver" in window) || !window.Fx) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { Fx.entrada(e.target, ".fx-item"); io.unobserve(e.target); } }); }, { threshold: .2 });
    [].forEach.call(document.querySelectorAll(".revela"), function (b) { io.observe(b); });
  });
})();
