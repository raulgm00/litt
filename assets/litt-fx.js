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

  // Cascada al entrar cada bloque .revela en pantalla (una sola vez)
  seguro("cascada", function () {
    if (!("IntersectionObserver" in window) || !window.Fx) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { Fx.entrada(e.target, ".fx-item"); io.unobserve(e.target); } }); }, { threshold: .2 });
    [].forEach.call(document.querySelectorAll(".revela"), function (b) { io.observe(b); });
  });
})();
