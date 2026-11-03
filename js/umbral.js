/* =========================================================================
   ATLAS · UMBRAL
   Dos gestos antes de entrar:
     1. La mirada  → arrastrar (o tocar) un actor hasta el símbolo ATLAS.
     2. La puerta  → dos vistas previas vivas: RECORRIDO y ARCHIVO.
        La mirada sugiere una (con su porqué), pero las dos quedan abiertas.
        La que mirás se agranda.
   Lo elegido se guarda en A.store("mirada") y lo usan las dos vistas.
   ========================================================================= */
(function (A) {
  const s = A.s, h = A.h;
  const PERF = window.ATLAS_INFORME.perfiles;
  const svg = document.getElementById("u-svg");
  const miradaEl = document.getElementById("u-mirada");
  const doorsEl = document.getElementById("u-doors");
  const split = document.getElementById("u-split");
  const hint = document.getElementById("u-hint");

  const VERBOS = { ciudadanos: "lo uso · lo vivo", publico: "lo gestiono · lo regulo", privado: "invierto · evalúo" };
  const SUGIERE = {
    ciudadanos: ["recorrido", "Para quien usa el parque: horarios, seguridad y voces del barrio, a tu ritmo."],
    publico:    ["archivo",   "Para quien gestiona: evidencia con fuente, tensiones entre actores y criterios para priorizar."],
    privado:    ["archivo",   "Para quien evalúa: normas, valor del suelo y proyectos en curso, con sus fuentes."]
  };

  /* ---------------- Paso 1 · la mirada ---------------- */
  const CX = 500, CY = 255;
  const POS = [[500, 78], [255, 395], [745, 395]];
  const linesG = s("g", {}, svg);
  // Centro: el símbolo vacío que espera una mirada
  const center = s("g", { transform: `translate(${CX} ${CY})` }, svg);
  s("circle", { r: 96, fill: "none", stroke: "#111", "stroke-opacity": .08, class: "pulse" }, center);
  const slot = s("path", { d: A.shape("reuleaux", 0, 0, 62), fill: "#111", "fill-opacity": .04, stroke: "#111", "stroke-opacity": .55, "stroke-width": 2, "stroke-dasharray": "5 6" }, center);
  const slotLbl = s("text", { y: 92, "text-anchor": "middle", fill: "#77776f", "font-size": 12, "font-family": "Inter Tight", "letter-spacing": 1.5 }, center, "TU MIRADA");

  const actors = PERF.map((p, i) => {
    const [x0, y0] = POS[i];
    const line = s("line", { x1: x0, y1: y0, x2: CX, y2: CY, stroke: p.color, "stroke-opacity": .25, "stroke-dasharray": "2 7", "stroke-width": 1.5 }, linesG);
    const g = s("g", { class: "u-actor", tabindex: 0, role: "button", "aria-label": `Mirar como ${p.nombre}` }, svg);
    const inner = s("g", {}, g);
    s("circle", { r: 66, fill: p.color }, inner);
    const parts = p.nombre.split(" ");
    if (parts.length > 1) {
      s("text", { y: -8, "text-anchor": "middle", fill: "#111", "font-size": 13, "font-weight": 700, "font-family": "Inter Tight", "letter-spacing": 1 }, inner, parts[0].toUpperCase());
      s("text", { y: 9, "text-anchor": "middle", fill: "#111", "font-size": 13, "font-weight": 700, "font-family": "Inter Tight", "letter-spacing": 1 }, inner, parts.slice(1).join(" ").toUpperCase());
    } else s("text", { y: 2, "text-anchor": "middle", fill: "#111", "font-size": 13, "font-weight": 700, "font-family": "Inter Tight", "letter-spacing": 1 }, inner, p.nombre.toUpperCase());
    s("text", { y: 28, "text-anchor": "middle", fill: "#111", "fill-opacity": .85, "font-size": 10, "font-family": "Inter Tight" }, inner, VERBOS[p.id]);
    const a = { p, g, inner, line, x: x0, y: y0, x0, y0, ph: i * 2.1, dragging: false, gone: false };
    let moved = 0;
    g.addEventListener("pointerdown", ev => { if (st.perfil) return; a.dragging = true; moved = 0; g.setPointerCapture(ev.pointerId); g.classList.add("drag"); });
    g.addEventListener("pointermove", ev => {
      if (!a.dragging) return;
      const q = A.svgPoint(svg, ev); moved += Math.abs(q.x - a.x) + Math.abs(q.y - a.y);
      a.x = q.x; a.y = q.y;
      slot.setAttribute("stroke", Math.hypot(a.x - CX, a.y - CY) < 120 ? p.color : "#111");
    });
    g.addEventListener("pointerup", () => {
      if (!a.dragging) return; a.dragging = false; g.classList.remove("drag");
      if (moved < 8 || Math.hypot(a.x - CX, a.y - CY) < 140) choose(a); else fly(a, a.x0, a.y0);
    });
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(a); } });
    g.addEventListener("pointerenter", () => line.setAttribute("stroke-opacity", .7));
    g.addEventListener("pointerleave", () => line.setAttribute("stroke-opacity", .25));
    return a;
  });

  // Flotación suave + líneas que siguen a cada actor
  let t = 0;
  A.loop(dt => {
    if (document.body.dataset.view !== "umbral") return;
    t += dt;
    actors.forEach(a => {
      const fx = a.dragging || a.flying ? 0 : Math.sin(t * .8 + a.ph) * 5, fy = a.dragging || a.flying ? 0 : Math.cos(t * .6 + a.ph) * 6;
      a.g.setAttribute("transform", `translate(${(a.x + fx).toFixed(1)} ${(a.y + fy).toFixed(1)})`);
      a.line.setAttribute("x1", a.x + fx); a.line.setAttribute("y1", a.y + fy);
    });
  });

  function fly(a, x, y, done, ms = 420) {
    const sx = a.x, sy = a.y, t0 = performance.now(); a.flying = true;
    const stop = A.loop(() => {
      const k = A.ease(A.clamp((performance.now() - t0) / ms));
      a.x = A.lerp(sx, x, k); a.y = A.lerp(sy, y, k);
      if (k >= 1) { stop(); a.flying = false; done && done(); }
    });
  }

  const st = { perfil: null };

  function choose(a) {
    if (st.perfil) return;
    st.perfil = a.p.id;
    fly(a, CX, CY, () => {
      a.inner.style.transition = "transform .5s cubic-bezier(.2,1.4,.4,1), opacity .4s";
      a.inner.style.transform = "scale(.2)"; a.inner.style.opacity = 0;
      slot.setAttribute("fill", a.p.color); slot.setAttribute("fill-opacity", 1);
      slot.setAttribute("stroke", a.p.color); slot.setAttribute("stroke-dasharray", "none");
      slotLbl.textContent = a.p.nombre.toUpperCase(); slotLbl.setAttribute("fill", a.p.color);
      hint.innerHTML = `Mirada: <b class="hl" style="--c:${a.p.color}">${a.p.nombre}</b>.`;
      setTimeout(() => showDoors(false), 520);
    });
    actors.forEach(o => {
      o.line.style.transition = "opacity .4s"; o.line.style.opacity = 0;
      if (o !== a) { o.inner.style.transition = "opacity .5s, transform .5s"; o.inner.style.opacity = .1; o.inner.style.transform = "scale(.8)"; }
    });
  }

  function resetMirada() {
    st.perfil = null;
    actors.forEach(a => {
      a.x = a.x0; a.y = a.y0;
      a.inner.style.opacity = 1; a.inner.style.transform = "none"; a.line.style.opacity = 1;
    });
    slot.setAttribute("fill", "#111"); slot.setAttribute("fill-opacity", .04);
    slot.setAttribute("stroke", "#111"); slot.setAttribute("stroke-dasharray", "5 6");
    slotLbl.textContent = "TU MIRADA"; slotLbl.setAttribute("fill", "#77776f");
    hint.textContent = "¿Desde dónde mirás? Arrastrá tu mirada al centro, o tocala.";
  }

  /* En pantallas angostas el lienzo se recorta para que los círculos se vean grandes */
  const fit = () => svg.setAttribute("viewBox", innerWidth < 700 ? "170 0 660 470" : "0 0 1000 470");
  addEventListener("resize", fit); fit();

  /* ---------------- Paso 2 · las dos puertas ---------------- */
  function previewRecorrido() {
    // Mini ciudad que se dibuja + personas caminando
    const out = A.CABA_MINI || "";
    return `<svg class="pv" viewBox="0 0 300 200" aria-hidden="true">
      <path class="pv-draw" d="${out}" fill="none" stroke="#111" stroke-width="1.6" pathLength="1"/>
      <g class="pv-grid">${Array.from({ length: 9 }, (_, i) => `<line x1="${40 + i * 26}" y1="20" x2="${10 + i * 26}" y2="190"/>`).join("")}</g>
      <path d="${A.shape("reuleaux", 168, 92, 11)}" fill="#f8e544" class="pulse"/>
      <path d="${A.shape("circulo", 120, 70, 7)}" fill="none" stroke="#00e887"/>
      <path d="${A.shape("hexagono", 205, 140, 9)}" fill="none" stroke="#00e887"/>
      <path d="${A.shape("triangulo", 95, 135, 8)}" fill="none" stroke="#00e887"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<circle r="2.6" fill="#111" class="pv-walk" style="animation-delay:${-i * 1.1}s"/>`).join("")}
    </svg>`;
  }
  function previewArchivo() {
    const est = ["#00e887", "#f8e544", "#ff5a4e", "#00e887"];
    return `<div class="pv pv-stack" aria-hidden="true">${est.map((c, i) => `<div class="pv-card" style="--i:${i}"><i style="background:${c}"></i><b></b><span></span><span></span></div>`).join("")}
      <div class="pv-bars">${[30, 55, 40, 80, 62, 92, 70, 45].map((v, i) => `<em style="--h:${v}%;animation-delay:${i * .12}s"></em>`).join("")}</div></div>`;
  }

  function showDoors(volviste) {
    const p = PERF.find(x => x.id === st.perfil);
    const sug = p ? SUGIERE[p.id] : null;
    const last = A.store.get("mirada", null);
    // La palabra resaltada ES el botón para cambiar la mirada
    const chip = `<button class="hl hl-btn" data-cambiar style="--c:${p ? p.color : "#e6e6e2"}" title="Cambiar la mirada">${p ? p.nombre : "Mirada libre"}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8a5 5 0 0 1 8.6-3.5M13 8a5 5 0 0 1-8.6 3.5M11.5 1.8v2.9H8.6M4.5 14.2v-2.9h2.9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
    document.getElementById("u-doors-kicker").innerHTML = (volviste && last ? "Volviste · mirada " : p ? "Mirada " : "") + chip;
    document.querySelector("[data-cambiar]").onclick = showMirada;
    const door = (id, kicker, titulo, texto, meta, cta, color, pv) => {
      const rec = sug && sug[0] === id, prev = volviste && last && last.camino === id;
      return `<button class="half${rec ? " rec" : ""}" data-camino="${id}" style="--c:${color}">
        <span class="half-pv">${pv}</span>
        <span class="half-txt">
          ${rec ? `<span class="half-badge">sugerido para tu mirada</span>` : prev ? `<span class="half-badge ghost">donde estabas</span>` : ""}
          <span class="kicker">${kicker}</span>
          <span class="half-title">${titulo}</span>
          <span class="half-body">${texto}</span>
          ${rec ? `<span class="half-why">${sug[1]}</span>` : ""}
          <span class="half-meta">${meta}</span>
          <span class="half-cta">${cta} →</span>
        </span></button>`;
    };
    split.innerHTML =
      door("recorrido", "Recorrido", "Caminá el parque.", "Un mapa que se dibuja mientras bajás, diez capas para tocar, tu marca en el plano y la comparación con otro parque.", "5 a 10 minutos · para explorar", "Caminar el parque", "#f8e544", previewRecorrido()) +
      door("archivo", "Evidencia", "Consultá la evidencia.", "Fichas con fuente, números, relaciones entre actores y oportunidades. Elegís lo que te sirve y armás tu propio informe.", "15 minutos o más · para citar y presentar", "Consultar la evidencia", "#08b8f8", previewArchivo());
    split.querySelectorAll(".half").forEach(b => {
      b.addEventListener("pointerenter", () => split.dataset.hover = b.dataset.camino);
      b.addEventListener("pointerleave", () => delete split.dataset.hover);
      b.addEventListener("click", () => {
        A.store.set("mirada", { perfil: st.perfil, camino: b.dataset.camino, fresh: true });
        location.hash = "#" + b.dataset.camino;
      });
    });
    miradaEl.classList.add("out");
    setTimeout(() => { miradaEl.hidden = true; doorsEl.hidden = false; requestAnimationFrame(() => doorsEl.classList.add("in")); }, volviste ? 0 : 260);
  }

  function showMirada() {
    doorsEl.classList.remove("in"); doorsEl.hidden = true;
    miradaEl.hidden = false; miradaEl.classList.remove("out");
    resetMirada();
  }

  document.getElementById("u-skip").onclick = () => { st.perfil = null; showDoors(false); };

  A.umbral = {
    show(sub) {
      const last = A.store.get("mirada", null);
      if (sub === "mirada") { showMirada(); return; }               // botón "cambiar mirada" de la barra
      if (last && last.camino && !doorsEl.classList.contains("in")) { st.perfil = last.perfil; showDoors(true); }
      else if (!last) showMirada();
    }
  };
})(window.ATLAS);
