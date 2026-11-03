/* =========================================================================
   ATLAS · utilidades compartidas (namespace global window.ATLAS)
   ========================================================================= */
window.ATLAS = window.ATLAS || {};

(function (A) {
  const NS = "http://www.w3.org/2000/svg";
  A.D = window.ATLAS_DATA;
  A.C = A.D.colores;

  /* Crear elementos SVG / HTML */
  A.s = function (tag, attrs, parent, text) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  A.h = function (tag, attrs, parent, html) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "style") e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  };
  A.clear = (el) => { while (el && el.firstChild) el.removeChild(el.firstChild); };

  /* Matemática */
  A.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  A.lerp = (a, b, t) => a + (b - a) * t;
  A.seg = (t, a, b) => A.clamp((t - a) / (b - a));           // sub-progreso
  A.ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  A.rand = (a, b) => a + Math.random() * (b - a);
  A.fmt = (n) => Math.round(n).toLocaleString("es-AR");

  /* Progreso de scroll de una sección "scrolly" (0 → 1) */
  A.progress = function (section) {
    const r = section.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return total <= 0 ? 0 : A.clamp(-r.top / total);
  };

  /* Etiquetas de dato real / ejemplo */
  A.tag = (real) => real ? '<span class="tag real">real</span>' : '<span class="tag ej">ejemplo</span>';
  A.src = (d) => d && d.fuente
    ? `<div class="src">Fuente: ${d.url ? `<a href="${d.url}" target="_blank" rel="noopener">${d.fuente}</a>` : d.fuente}</div>` : "";

  /* Guardado local (aportes de la persona) */
  A.store = {
    get(k, d) { try { const v = localStorage.getItem("atlas:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("atlas:" + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* Figuras geométricas → atributo "d" de un path centrado en (cx, cy) */
  A.shape = function (forma, cx, cy, r) {
    const poly = (n, rot) => {
      let d = "";
      for (let i = 0; i < n; i++) {
        const a = rot + (i * 2 * Math.PI) / n;
        d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(2) + " " + (cy + r * Math.sin(a)).toFixed(2);
      }
      return d + "Z";
    };
    switch (forma) {
      case "triangulo": return poly(3, -Math.PI / 2);
      case "cuadrado":  return poly(4, -Math.PI / 4);
      case "rombo":     return poly(4, -Math.PI / 2);
      case "hexagono":  return poly(6, 0);
      case "pentagono": return poly(5, -Math.PI / 2);
      case "reuleaux": {
        const p = [0, 1, 2].map(i => {
          const a = -Math.PI / 2 + i * 2 * Math.PI / 3;
          return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
        });
        const s = (r * Math.sqrt(3)).toFixed(2);
        const f = (q) => q[0].toFixed(2) + " " + q[1].toFixed(2);
        return `M${f(p[0])}A${s} ${s} 0 0 1 ${f(p[1])}A${s} ${s} 0 0 1 ${f(p[2])}A${s} ${s} 0 0 1 ${f(p[0])}Z`;
      }
      default: // círculo
        return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
    }
  };

  /* Ícono SVG pequeño de una figura (para botones) */
  /* Pictograma ATLAS: figura negra + punto de color (lenguaje de señalética) */
  A.icon = function (forma, color, filled = true) {
    const dot = /^#(f5f5f0|fff|ffffff|111|111111)$/i.test(color) ? "#f8e544" : color;
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${A.shape(forma, 10.5, 13.5, 8.2)}" fill="${filled ? "#111" : "none"}" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/><circle cx="19.2" cy="5.2" r="3.6" fill="${dot}"/></svg>`;
  };

  /* Coordenadas del puntero dentro de un SVG */
  A.svgPoint = function (svg, evt) {
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 };
  };

  /* Posicionar tooltip dentro de un contenedor */
  A.showTip = function (tip, html, evt, container) {
    tip.innerHTML = html;
    tip.classList.add("on");
    const box = container.getBoundingClientRect();
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let x = evt.clientX - box.left + 16, y = evt.clientY - box.top + 16;
    if (x + w > box.width - 10) x = evt.clientX - box.left - w - 16;
    if (y + h > box.height - 10) y = evt.clientY - box.top - h - 16;
    tip.style.left = Math.max(10, x) + "px";
    tip.style.top = Math.max(10, y) + "px";
  };
  A.hideTip = (tip) => { tip.classList.remove("on", "pinned"); };

  /* Bucle de animación compartido */
  const loops = new Set();
  A.loop = (fn) => { loops.add(fn); return () => loops.delete(fn); };
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    loops.forEach(fn => fn(dt, now));
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  A.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Celular: en pantallas chicas el recorrido arranca por Participá
  A.sm = window.matchMedia("(max-width:760px)").matches;

  /* =======================================================================
     ZOOM Y ARRASTRE DE UN PLANO <svg>
     Cambia el viewBox con una animación corta. Mantiene la variable --k
     (unidades del plano por píxel de pantalla) para que la señalética y
     los pines conserven su tamaño en pantalla con cualquier zoom.
     ======================================================================= */
  A.panZoom = function (svg, opts) {
    const full = opts.full;                       // [x, y, w, h]
    const minW = opts.minW || full[2] / 6;
    let vb = full.slice(), anim = null;
    const setK = () => {
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      const k = Math.max(vb[2] / r.width, vb[3] / r.height);   // "meet"
      svg.style.setProperty("--k", k.toFixed(4));
      // Nivel de detalle: los nombres de zonas y calles aparecen al acercarse
      svg.dataset.lod = k <= 1.5 ? "near" : k <= 2.6 ? "mid" : "far";
    };
    const apply = () => { svg.setAttribute("viewBox", vb.map(v => v.toFixed(1)).join(" ")); setK(); opts.onChange && opts.onChange(vb); };
    const clampVb = v => {
      const w = A.clamp(v[2], minW, full[2] * 1.15), h = w * (full[3] / full[2]);
      const cx = A.clamp(v[0] + v[2] / 2, full[0], full[0] + full[2]), cy = A.clamp(v[1] + v[3] / 2, full[1], full[1] + full[3]);
      return [cx - w / 2, cy - h / 2, w, h];
    };
    function to(target, ms = 650) {
      const from = vb.slice(), goal = clampVb(target), t0 = performance.now();
      if (anim) anim();
      if (A.reduced || ms === 0) { vb = goal; apply(); return; }
      anim = A.loop(() => {
        const k = A.ease(A.clamp((performance.now() - t0) / ms));
        vb = from.map((v, i) => A.lerp(v, goal[i], k)); apply();
        if (k >= 1) { anim(); anim = null; }
      });
    }
    // Encuadre centrado en un punto con un ancho dado (mantiene la proporción del plano)
    const focus = (x, y, w, ms) => { const h = w * (full[3] / full[2]); to([x - w / 2, y - h / 2, w, h], ms); };
    const zoom = (f) => focus(vb[0] + vb[2] / 2, vb[1] + vb[3] / 2, vb[2] / f);

    // Arrastrar para moverse (si no se movió, cuenta como clic)
    let drag = null;
    svg.addEventListener("pointerdown", ev => {
      if (ev.button !== 0 || ev.target.closest("[data-nopan]")) return;
      drag = { x: ev.clientX, y: ev.clientY, vb: vb.slice(), moved: 0, id: ev.pointerId };
    });
    svg.addEventListener("pointermove", ev => {
      if (!drag || ev.pointerId !== drag.id) return;
      const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      if (drag.moved < 6) return;
      if (!svg.hasPointerCapture(ev.pointerId)) svg.setPointerCapture(ev.pointerId);
      svg.classList.add("panning");
      const k = parseFloat(getComputedStyle(svg).getPropertyValue("--k")) || 1;
      if (anim) { anim(); anim = null; }
      vb = clampVb([drag.vb[0] - dx * k, drag.vb[1] - dy * k, drag.vb[2], drag.vb[3]]); apply();
    });
    const end = () => {
      if (!drag) return;
      if (drag.moved >= 6) { svg.dataset.dragged = "1"; setTimeout(() => delete svg.dataset.dragged, 0); }
      svg.classList.remove("panning"); drag = null;
    };
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
    // Doble clic: acercar ahí
    svg.addEventListener("dblclick", ev => { const p = A.svgPoint(svg, ev); focus(p.x, p.y, vb[2] / 1.8); });

    if (opts.buttons) opts.buttons.addEventListener("click", ev => {
      const b = ev.target.closest("[data-z]"); if (!b) return;
      ev.stopPropagation();
      if (b.dataset.z === "in") zoom(1.6); else if (b.dataset.z === "out") zoom(1 / 1.6); else to(full);
    });
    addEventListener("resize", setK);
    if ("ResizeObserver" in window) new ResizeObserver(setK).observe(svg);
    apply();
    return { to, focus, zoom, fit: (ms) => to(full, ms), get: () => vb.slice(), full };
  };

  /* =======================================================================
     SEÑALÉTICA SOBRE EL PLANO
     Un punto del color de la capa + un rótulo corto con fondo blanco.
     Se dibuja en píxeles de pantalla (escala con --k), siempre legible.
     A.sign(parent, x, y, texto, color, { dir: "n"|"s"|"e"|"w", sub, forma })
     ======================================================================= */
  A.sign = function (parent, x, y, text, color, o = {}) {
    const g = A.s("g", { class: "sign" + (o.cls ? " " + o.cls : ""), transform: `translate(${x} ${y})` }, parent);
    const k = A.s("g", { class: "k" }, g);
    const dir = o.dir || "n", L = o.len == null ? 18 : o.len;
    const off = { n: [0, -L], s: [0, L], e: [L, 0], w: [-L, 0] }[dir];
    if (L) A.s("line", { x1: 0, y1: 0, x2: off[0], y2: off[1], stroke: "#111", "stroke-width": 1 }, k);
    if (o.forma) A.s("path", { d: A.shape(o.forma, 0, 0, 6), fill: color, stroke: "#111", "stroke-width": 1.2 }, k);
    else A.s("circle", { r: 4.5, fill: color, stroke: "#111", "stroke-width": 1.2 }, k);
    const lab = A.s("g", { transform: `translate(${off[0]} ${off[1]})` }, k);
    const bg = A.s("rect", { rx: 4, fill: "#fff", stroke: "#111", "stroke-opacity": .14 }, lab);
    const t = A.s("text", { class: "sign-t", "dominant-baseline": "central" }, lab);
    A.s("tspan", { "font-weight": 600 }, t, text);
    if (o.sub) A.s("tspan", { class: "sign-sub", dx: 6 }, t, o.sub);
    // Medir y ubicar la etiqueta (12 px, peso 600 + bajada 400)
    const layout = () => {
      const w = A.textW(text, 600) + (o.sub ? 6 + A.textW(o.sub, 400) : 0);
      const pad = 6, hgt = 20;
      let tx = -w / 2, ty = dir === "n" ? -hgt / 2 - 2 : dir === "s" ? hgt / 2 + 2 : 0;
      if (dir === "e") tx = 6; if (dir === "w") tx = -w - 6;
      t.setAttribute("x", tx); t.setAttribute("y", ty);
      bg.setAttribute("x", tx - pad); bg.setAttribute("y", ty - hgt / 2); bg.setAttribute("width", w + pad * 2); bg.setAttribute("height", hgt);
    };
    layout(); if (!fontsOk) pending.push(layout);
    return g;
  };
  // Cuando termina de cargar la tipografía, se vuelven a medir los rótulos
  let fontsOk = false; const pending = [];
  if (document.fonts) document.fonts.load('600 12px "Inter Tight"').then(() => { fontsOk = true; pending.splice(0).forEach(f => f()); });
  /* Rótulo fijo de un plano (calles, zonas, hitos): tamaño constante en pantalla */
  A.mapLabel = function (parent, x, y, text, o = {}) {
    const g = A.s("g", { class: "mlabel" + (o.cls ? " " + o.cls : ""), transform: `translate(${x} ${y})` }, parent);
    const k = A.s("g", { class: "k" }, g);
    const t = A.s("text", { class: "mlabel-t", "text-anchor": o.anchor || "middle", "dominant-baseline": "central" }, k, text);
    if (o.rot) t.setAttribute("transform", `rotate(${o.rot})`);
    return g;
  };
  /* Ancho de un texto en la tipografía ATLAS (12 px) */
  const mctx = document.createElement("canvas").getContext("2d");
  A.textW = (t, weight = 400, size = 12) => { mctx.font = `${weight} ${size}px "Inter Tight", sans-serif`; return mctx.measureText(t).width; };
})(window.ATLAS);
