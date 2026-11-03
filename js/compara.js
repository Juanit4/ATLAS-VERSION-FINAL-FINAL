/* =========================================================================
   ATLAS · COMPARÁ
   El parque actual (Ferroviario Colegiales, en curso) al lado de un parque
   completado (Centenario), leídos con las mismas capas sociales:
     · en vivo: circulación y densidad a la misma hora, en los dos planos
     · gráficos: personas por hora, quiénes van, qué piden
   Así se comprueba si las categorías de ATLAS sirven en otro territorio.
   ========================================================================= */
(function (A) {
  const s = A.s, h = A.h, D = A.D;
  const ctrl = document.getElementById("cmp-controls");
  const liveEl = document.getElementById("cmp-live");
  const chartsEl = document.getElementById("cmp-charts");
  const hh = n => String(n).padStart(2, "0") + ":00";

  /* Los dos parques con la misma estructura de datos */
  const PARKS = [
    { id: "colegiales", nombre: "Parque Ferroviario Colegiales", corto: "Ferroviario", lugar: "Colegiales · Comuna 13", estado: "En curso", color: A.C.acento, m2: 14200,
      transito: D.capas.transito, personas: D.capas.personas, voces: D.capas.voces.palabras },
    { id: "centenario", nombre: D.centenario.nombre, corto: "Centenario", lugar: D.centenario.ubicacion, estado: "Completado", color: A.C.publico, m2: D.centenario.m2,
      transito: D.centenario.transito, personas: D.centenario.personas, voces: D.centenario.voces }
  ];
  const ha = p => p.m2 / 10000;
  const st = { modo: A.park.isWeekend() ? "finde" : "semana", hora: new Date().getHours(), escala: "personas", dim: "edad" };

  /* ---------------- Controles compartidos ---------------- */
  ctrl.innerHTML = `
    <div class="chips" role="group" aria-label="Tipo de día">
      <button class="chip" data-modo="semana">Lunes a viernes</button><button class="chip" data-modo="finde">Fin de semana</button>
    </div>
    <label class="cmp-hour"><span>Hora</span><input type="range" min="0" max="23" step="1" aria-label="Hora del día"><b></b></label>
    <button class="chip" data-ahora>Ahora</button>`;
  const range = ctrl.querySelector("input"), hourOut = ctrl.querySelector(".cmp-hour b");
  ctrl.querySelectorAll("[data-modo]").forEach(b => b.onclick = () => { st.modo = b.dataset.modo; update(); });
  range.oninput = () => { st.hora = +range.value; update(); };
  ctrl.querySelector("[data-ahora]").onclick = () => { st.hora = new Date().getHours(); st.modo = A.park.isWeekend() ? "finde" : "semana"; update(); };

  /* ---------------- Los dos planos en vivo ---------------- */
  // Geometría simplificada de cada parque en un lienzo de 600 x 300
  const G = A.parkGeom;
  const FERRO = (() => {
    const k = .385, ox = 300 - (95 + 1536) / 2 * k, oy = 150 - 271 * k;
    const tr = ([x, y]) => [x * k + ox, y * k + oy];
    return { tr, outline: G.park.map(tr), path: G.mainPath.map(tr),
      spots: D.parque.zonas.filter(z => A.inPark(z.x, z.y)).map(z => tr([z.x, z.y])) };
  })();
  const CENT = (() => {
    const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2; pts.push([300 + Math.cos(a) * 105, 150 + Math.sin(a) * 105]); }
    return { ring: pts, spots: [[300, 150], [235, 112], [372, 120], [250, 205], [360, 196]] };
  })();

  function drawFerro(svg) {
    s("path", { d: "M" + FERRO.outline.map(q => q.map(v => v.toFixed(1)).join(" ")).join("L") + "Z", fill: A.C.publico, "fill-opacity": .2, stroke: "#111", "stroke-width": 1.4, "vector-effect": "non-scaling-stroke" }, svg);
    s("path", { d: "M" + FERRO.path.map(q => q.map(v => v.toFixed(1)).join(" ")).join("L"), fill: "none", stroke: "#fff", "stroke-width": 4, "stroke-linecap": "round" }, svg);
    // Vías del Mitre al sur, con la misma geometría del plano
    const a = FERRO.tr([-40, G.railY(-40) + 13]), b = FERRO.tr([1680, G.railY(1680) + 13]);
    s("path", { d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`, stroke: "#111", "stroke-opacity": .6, "stroke-width": 1, fill: "none" }, svg);
    s("path", { d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`, stroke: "#111", "stroke-opacity": .35, "stroke-dasharray": "1 4", "stroke-width": 4, fill: "none" }, svg);
    const m = FERRO.tr([1250, G.railY(1250) + 13]);
    A.mapLabel(svg, 0, 0, "Vías FFCC Mitre", { cls: "rail" }).setAttribute("transform", `translate(${m[0].toFixed(1)} ${m[1].toFixed(1)}) rotate(-4)`);
  }
  function drawCent(svg) {
    s("circle", { cx: 300, cy: 150, r: 128, fill: A.C.publico, "fill-opacity": .2, stroke: "#111", "stroke-width": 1.4 }, svg);
    s("circle", { cx: 300, cy: 150, r: 105, fill: "none", stroke: "#fff", "stroke-width": 4 }, svg);
    s("ellipse", { cx: 300, cy: 150, rx: 44, ry: 30, fill: "#cfeffd", stroke: "#111", "stroke-width": 1.1 }, svg);
    A.mapLabel(svg, 300, 150, "Lago", { cls: "zona" });
    A.mapLabel(svg, 300, 300 - 6, "Av. Díaz Vélez", { cls: "street" });
  }

  const cards = PARKS.map((p, i) => {
    const card = h("article", { class: "cmp-card", style: `--c:${p.color}` }, liveEl, `
      <header><span class="cmp-badge">${p.estado}</span><h3>${p.nombre}</h3><p>${p.lugar} · ${A.fmt(p.m2)} m²</p></header>
      <svg class="cmp-map" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet" aria-label="Plano de ${p.nombre} con personas en vivo"></svg>
      <dl class="cmp-metrics">
        <div><dt>Personas ahora</dt><dd data-m="n"></dd></div>
        <div><dt>Densidad</dt><dd data-m="d"></dd></div>
        <div><dt>Pico del día</dt><dd data-m="p"></dd></div>
      </dl>`);
    const svg = card.querySelector("svg");
    svg.style.setProperty("--k", 1);
    (i ? drawCent : drawFerro)(svg);
    const peopleG = s("g", {}, svg);
    return { p, card, svg, peopleG, dots: [], target: 0, ring: i === 1 };
  });
  h("p", { class: "small muted cmp-note" }, liveEl, `Cada punto son 2 personas. Datos de conteo ${A.tag(false)}: se reemplazan con sensores y relevamientos.`);
  // Ajustar --k de los mini planos (rótulos legibles)
  const fitK = () => cards.forEach(c => { const r = c.svg.getBoundingClientRect(); if (r.width) c.svg.style.setProperty("--k", (600 / r.width).toFixed(3)); });
  addEventListener("resize", fitK);

  // Caminantes: por el sendero principal (Ferroviario) o por el anillo (Centenario)
  const along = (path, t) => {
    const segs = []; let tot = 0;
    for (let i = 1; i < path.length; i++) { const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); segs.push(l); tot += l; }
    let d = t * tot;
    for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const k = d / segs[i]; return [A.lerp(path[i][0], path[i + 1][0], k), A.lerp(path[i][1], path[i + 1][1], k)]; } d -= segs[i]; }
    return path[path.length - 1];
  };
  A.loop(dt => {
    if (document.body.dataset.view !== "recorrido") return;
    cards.forEach(c => {
      const alive = c.dots.filter(d => !d.dying);
      if (alive.length < c.target) for (let i = 0; i < Math.min(4, c.target - alive.length); i++) {
        const walker = Math.random() < .6, spots = c.ring ? CENT.spots : FERRO.spots;
        c.dots.push({ walker, t: Math.random(), v: (Math.random() < .5 ? -1 : 1) * A.rand(.01, .025), off: A.rand(-6, 6),
          spot: spots[Math.floor(Math.random() * spots.length)], ang: Math.random() * 6.28, rad: A.rand(4, 22), a: 0,
          el: s("circle", { r: 3, fill: "#111" }, c.peopleG) });
      } else if (alive.length > c.target) alive.slice(0, Math.min(4, alive.length - c.target)).forEach(d => d.dying = true);
      for (let i = c.dots.length - 1; i >= 0; i--) {
        const d = c.dots[i];
        d.a = A.clamp(d.a + (d.dying ? -dt * 2 : dt * 1.5));
        if (d.dying && d.a <= 0) { d.el.remove(); c.dots.splice(i, 1); continue; }
        let x, y;
        if (d.walker) {
          d.t += d.v * dt; if (d.t > 1 || d.t < 0) { if (c.ring) d.t = (d.t + 1) % 1; else { d.v *= -1; d.t = A.clamp(d.t); } }
          [x, y] = c.ring ? along(CENT.ring, d.t) : along(FERRO.path, d.t);
          y += d.off * (c.ring ? .5 : .6); if (c.ring) x += d.off * .5;
        } else { d.ang += dt * .2; x = d.spot[0] + Math.cos(d.ang) * d.rad * .6; y = d.spot[1] + Math.sin(d.ang) * d.rad * .35; }
        d.el.setAttribute("cx", x.toFixed(1)); d.el.setAttribute("cy", y.toFixed(1)); d.el.setAttribute("opacity", (d.a * .9).toFixed(2));
      }
    });
  });

  /* ---------------- Gráficos comparados ---------------- */
  const panel = (icon, color, kicker, title, extra = "") => h("section", { class: "cmp-panel", style: `--c:${color}` }, chartsEl,
    `<header><p class="num"><i class="bullet"></i>${kicker}</p><h3>${title}</h3>${extra}</header><div class="cmp-body"></div>`);
  const legendHTML = `<p class="cmp-legend">${PARKS.map(p => `<span><i style="--c:${p.color}"></i>${p.corto}</span>`).join("")}</p>`;

  // 1 · Circulación por hora
  const pFlow = panel("circulo", "#08b8f8", "Horarios más transitados", "¿Cuándo se llena cada uno?",
    `<div class="chips" data-escala><button class="chip" data-e="personas">Personas</button><button class="chip" data-e="ha">Por hectárea</button></div>${legendHTML}`);
  pFlow.querySelectorAll("[data-e]").forEach(b => b.onclick = () => { st.escala = b.dataset.e; update(); });
  const flowSvg = s("svg", { viewBox: "0 0 640 240", class: "cmp-chart" }, pFlow.querySelector(".cmp-body"));
  const flowRead = h("p", { class: "readout" }, pFlow.querySelector(".cmp-body"));
  flowSvg.addEventListener("pointermove", ev => { const q = A.svgPoint(flowSvg, ev); st.hora = A.clamp(Math.round((q.x - 44) / (FW - 64) * 23), 0, 23); update(); });
  addEventListener("resize", () => drawFlow());

  // 2 · Quiénes están
  const DIMS = { edad: "Edad", genero: "Género", mascota: "Mascotas", compania: "Compañía" };
  const pWho = panel("hexagono", "#9b6cff", "Quiénes están", "¿Quiénes van a cada uno?",
    `<div class="chips">${Object.entries(DIMS).map(([k, n]) => `<button class="chip" data-dim="${k}">${n}</button>`).join("")}</div>${legendHTML}`);
  pWho.querySelectorAll("[data-dim]").forEach(b => b.onclick = () => { st.dim = b.dataset.dim; update(); });
  const whoBody = pWho.querySelector(".cmp-body");

  // 3 · Qué piden (voces)
  const VT = { queja: "#ff8a7a", recomendacion: "#00e887", pedido: "#f8e544" };
  const pVoc = panel("circulo", "#c4b5f5", "Voces del barrio", "¿Qué pide la gente en cada uno?", legendHTML);
  const vocBody = pVoc.querySelector(".cmp-body");
  (function renderVoces() {
    const top = p => [...p.voces].sort((a, b) => b.n - a.n).slice(0, 8);
    const words = PARKS.map(p => new Set(p.voces.map(w => w.t)));
    const both = [...words[0]].filter(w => words[1].has(w));
    vocBody.innerHTML = `<div class="cmp-two">${PARKS.map(p => {
      const t = top(p), max = t[0].n;
      return `<div><p class="lsub"><i class="sq" style="--c:${p.color}"></i>${p.corto}</p><ul class="vbars">${t.map(w =>
        `<li class="${both.includes(w.t) ? "both" : ""}"><span>${w.t}</span><i style="--w:${(w.n / max * 100).toFixed(0)}%;--c:${VT[w.tipo]}"></i><b>${w.n}</b></li>`).join("")}</ul></div>`;
    }).join("")}</div>
    <p class="cmp-finding"><b>${both.length} temas se repiten en los dos parques:</b> ${both.map(w => `<span class="hl" style="--c:#e6e6e2">${w}</span>`).join(" ")}. Las categorías de ATLAS (quejas, pedidos, recomendaciones) ordenan igual las voces de otro territorio.</p>
    <p class="cmp-key"><span><i style="--c:${VT.queja}"></i>Queja</span><span><i style="--c:${VT.pedido}"></i>Pedido</span><span><i style="--c:${VT.recomendacion}"></i>Recomendación</span><span class="both-k">Subrayado: está en los dos</span></p>`;
  })();

  let FW = 640;
  function drawFlow() {
    A.clear(flowSvg);
    // El lienzo mide lo mismo que en pantalla: el texto no se agranda ni se achica
    FW = Math.max(300, Math.round(flowSvg.getBoundingClientRect().width) || 640);
    flowSvg.setAttribute("viewBox", `0 0 ${FW} 240`);
    const val = (p, i) => p.transito[st.modo][i] / (st.escala === "ha" ? ha(p) : 1);
    const max = Math.max(...PARKS.flatMap(p => p.transito[st.modo].map((_, i) => val(p, i)))) * 1.08;
    const X = i => 44 + i / 23 * (FW - 64), Y = v => 200 - v / max * 180;
    [0, .5, 1].forEach(f => { s("line", { x1: 44, x2: FW - 20, y1: Y(max * f), y2: Y(max * f), stroke: "#e6e6e2" }, flowSvg); s("text", { x: 36, y: Y(max * f) + 4, "text-anchor": "end", class: "ax" }, flowSvg, A.fmt(max * f)); });
    [0, 6, 12, 18, 23].forEach(i => s("text", { x: X(i), y: 222, "text-anchor": "middle", class: "ax" }, flowSvg, hh(i)));
    s("line", { x1: X(st.hora), x2: X(st.hora), y1: 14, y2: 200, stroke: "#111", "stroke-dasharray": "3 4" }, flowSvg);
    PARKS.forEach(p => {
      const d = p.transito[st.modo].map((_, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(val(p, i)).toFixed(1)).join("");
      s("path", { d, fill: "none", stroke: "#111", "stroke-width": 5, "stroke-linejoin": "round", "stroke-linecap": "round" }, flowSvg);
      s("path", { d, fill: "none", stroke: p.color, "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round" }, flowSvg);
      s("circle", { cx: X(st.hora), cy: Y(val(p, st.hora)), r: 5.5, fill: p.color, stroke: "#111", "stroke-width": 1.5 }, flowSvg);
    });
    const [a, b] = PARKS.map(p => val(p, st.hora));
    const u = st.escala === "ha" ? " por hectárea" : "";
    flowRead.innerHTML = `${hh(st.hora)} · ${st.modo === "finde" ? "fin de semana" : "lunes a viernes"}: <b>${A.fmt(a)}</b> en Ferroviario y <b>${A.fmt(b)}</b> en Centenario${u}.`;
  }

  function drawWho() {
    const keys = Object.keys(PARKS[0].personas[st.dim]);
    whoBody.innerHTML = `<ul class="pbars">${keys.map(k => `<li><span>${k}</span><div>${PARKS.map(p => {
      const v = p.personas[st.dim][k] || 0;
      return `<p><i style="--w:${v}%;--c:${p.color}"></i><b>${v}%</b></p>`;
    }).join("")}</div></li>`).join("")}</ul><p class="small muted">Distribuciones ${A.tag(false)} · conteos por cámara sin identificar personas y encuestas.</p>`;
  }

  function update() {
    range.value = st.hora; hourOut.textContent = hh(st.hora);
    ctrl.querySelectorAll("[data-modo]").forEach(b => b.classList.toggle("on", b.dataset.modo === st.modo));
    pFlow.querySelectorAll("[data-e]").forEach(b => b.classList.toggle("on", b.dataset.e === st.escala));
    pWho.querySelectorAll("[data-dim]").forEach(b => b.classList.toggle("on", b.dataset.dim === st.dim));
    cards.forEach(c => {
      const arr = c.p.transito[st.modo], v = arr[st.hora], max = Math.max(...arr);
      c.target = Math.round(v / 2);
      c.card.querySelector('[data-m="n"]').textContent = A.fmt(v);
      c.card.querySelector('[data-m="d"]').innerHTML = `${(v / ha(c.p)).toFixed(0)} <small>por ha</small>`;
      c.card.querySelector('[data-m="p"]').innerHTML = `${hh(arr.indexOf(max))} <small>${A.fmt(max)}</small>`;
    });
    drawFlow(); drawWho();
  }
  update();
  requestAnimationFrame(() => { fitK(); drawFlow(); });
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fitK(); drawFlow(); } })).observe(document.getElementById("compara"));
  A.compara = { update, fitK };
})(window.ATLAS);
