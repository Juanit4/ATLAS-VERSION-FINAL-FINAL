/* =========================================================================
   ATLAS · MAPA ESQUEMÁTICO DE CABA
   Se dibuja con el scroll: contorno → avenidas y tren (con nombre) →
   barrios → espacios verdes por estado → zoom al parque actual.
   Estados: en curso (amarillo) · completado (verde) · sin relevar (gris, votable).
   ========================================================================= */
(function (A) {
  const sec = document.getElementById("city");
  const stage = sec.querySelector(".stage");
  const svg = document.getElementById("city-svg");
  const tip = document.getElementById("city-tip");
  const legend = document.getElementById("city-legend");
  const zoomCtrl = document.getElementById("zoom-ctrl");
  const s = A.s, CABA = A.D.caba;
  const NS = { "vector-effect": "non-scaling-stroke" };
  const COL = { activo: A.C.acento, completado: A.C.publico, pendiente: "#d6d6d1" };

  /* ---------- Proyección lat/lon → plano ---------- */
  const K = 5000, LON0 = -58.545, LAT0 = -34.528, COS = Math.cos(34.62 * Math.PI / 180);
  const P = (lat, lon) => [(lon - LON0) * COS * K, (LAT0 - lat) * K];
  A.project = P;
  const pathOf = (pts, close) => pts.map((q, i) => (i ? "L" : "M") + P(q[0], q[1]).map(v => v.toFixed(1)).join(" ")).join("") + (close ? "Z" : "");
  // Siempre de oeste a este, para que el nombre se lea derecho
  const westEast = pts => (P(...pts[0])[0] > P(...pts[pts.length - 1])[0] ? [...pts].reverse() : pts);

  const outline = CABA.contorno.map(q => P(q[0], q[1]));
  const xs = outline.map(q => q[0]), ys = outline.map(q => q[1]);
  const BB = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  {
    const k = Math.min(260 / BB.w, 180 / BB.h);
    const ox = (300 - BB.w * k) / 2, oy = (200 - BB.h * k) / 2;
    A.CABA_MINI = "M" + outline.map(q => ((q[0] - BB.x) * k + ox).toFixed(1) + " " + ((q[1] - BB.y) * k + oy).toFixed(1)).join("L") + "Z";
  }
  const FULL = { x: BB.x - 60, y: BB.y - 90, w: BB.w + 120, h: BB.h + 130 };
  const colegiales = A.D.espacios.find(e => e.id === "colegiales");
  const [CX, CY] = P(colegiales.lat, colegiales.lon);
  /* El parque se apoya sobre las vías: punto del Mitre más cercano y su dirección (oeste → este) */
  const mitre = CABA.vias.find(v => v.nombre === "FFCC Mitre");
  const MP = westEast(mitre.pts).map(q => P(q[0], q[1]));
  let F = MP[0], dU = [1, 0], best = Infinity;
  for (let i = 1; i < MP.length; i++) {
    const a = MP[i - 1], b = MP[i], vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy;
    const t = A.clamp(((CX - a[0]) * vx + (CY - a[1]) * vy) / L2), q = [a[0] + vx * t, a[1] + vy * t];
    const d = Math.hypot(q[0] - CX, q[1] - CY);
    if (d < best) { best = d; F = q; const l = Math.sqrt(L2); dU = [vx / l, vy / l]; }
  }
  // Dirección local de las vías en Colegiales (recta, de oeste a este)
  { const r1 = P(-34.5600, -58.4750), r3 = P(-34.5770, -58.4180), l = Math.hypot(r3[0] - r1[0], r3[1] - r1[1]); dU = [(r3[0] - r1[0]) / l, (r3[1] - r1[1]) / l]; }
  const nU = [dU[1], -dU[0]];                         // normal hacia el norte (arriba)
  const at = (a, b) => [F[0] + dU[0] * a + nU[0] * b, F[1] + dU[1] * a + nU[1] * b];
  const ZOOM = { x: F[0] - 9 - 46, y: F[1] - 2 - 26, w: 92, h: 52 };
  svg.setAttribute("viewBox", `${FULL.x} ${FULL.y} ${FULL.w} ${FULL.h}`);

  const defs = s("defs", {}, svg);
  const root = s("g", {}, svg);
  const geo = s("g", {}, root);

  /* ---------- Río (textura suave) ---------- */
  const water = s("g", { opacity: 0 }, geo);
  for (let i = 0; i < 18; i++) {
    const y = BB.y + 20 + i * 44;
    s("path", Object.assign({ d: `M${BB.x + BB.w * .62 + i * 10} ${y} q 30 -5 60 0 t 60 0 t 60 0`, stroke: "#08b8f8", "stroke-opacity": .35, fill: "none", "stroke-width": 1 }, NS), water);
  }

  /* ---------- Contorno, avenidas (sin cruces), tren ---------- */
  const draw = (d, w, op, parent, extra = {}) => s("path", Object.assign({ d, fill: "none", stroke: "#111", "stroke-width": w, "stroke-opacity": op, "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 }, NS, extra), parent);
  s("path", Object.assign({ d: pathOf(CABA.contorno, true), fill: "#fff", stroke: "none" }, NS), geo);
  const outlinePath = draw(pathOf(CABA.contorno, true), 1.8, 1, geo);
  const outlinePath2 = draw(pathOf(CABA.contorno, true), 1.8, .18, geo);
  // Solo avenidas que no se cruzan entre sí: se leen como franjas paralelas
  const AVS = ["Av. Corrientes", "Av. Rivadavia"];
  const avData = AVS.map(n => CABA.avenidas.find(a => a.nombre === n)).filter(Boolean);
  const avs = avData.map((a, i) => {
    const d = pathOf(westEast(a.pts));
    s("path", { id: "av-" + i, d, fill: "none" }, defs);
    return draw(d, 1.3, .7, geo);
  });
  const mitreD = pathOf(westEast(mitre.pts));
  s("path", { id: "rail-mitre", d: mitreD, fill: "none" }, defs);
  const rail = draw(mitreD, 1, .85, geo);
  const ties = s("path", Object.assign({ d: mitreD, fill: "none", stroke: "#111", "stroke-width": 5, "stroke-opacity": .5, "stroke-dasharray": "1 5", opacity: 0 }, NS), geo);

  /* ---------- Nombres de avenidas y tren (sobre la línea, con halo blanco) ---------- */
  const lines = s("g", { opacity: 0, class: "city-lines" }, root);
  avData.forEach((a, i) => {
    const t = s("text", { class: "city-av", dy: "-0.45em" }, lines);
    s("textPath", { href: "#av-" + i, startOffset: ["70%", "42%"][i] }, t, a.nombre);
  });
  { const t = s("text", { class: "city-av rail", dy: "-0.6em" }, lines); s("textPath", { href: "#rail-mitre", startOffset: "62%" }, t, "FFCC Mitre"); }
  const gp = P(-34.612, -58.531);
  s("text", { class: "city-av", x: gp[0] - 8, y: gp[1], transform: `rotate(-84 ${gp[0] - 8} ${gp[1]})`, "text-anchor": "middle" }, lines, "Av. General Paz");
  const ri = P(-34.668, -58.425);
  s("text", { class: "city-av", x: ri[0] + 6, y: ri[1] + 12, transform: `rotate(38 ${ri[0] + 6} ${ri[1] + 12})` }, lines, "Riachuelo");
  const riverLbl = s("text", { class: "city-river", x: BB.x + BB.w * .86, y: BB.y + BB.h * .22, "text-anchor": "middle", opacity: 0 }, root, "Río de la Plata");

  /* ---------- Barrios (paso 3) ---------- */
  const BARRIOS = ["Núñez", "Belgrano", "Palermo", "Recoleta", "Villa Urquiza", "Caballito", "Flores", "Villa Devoto", "Mataderos", "Villa Lugano", "Barracas", "San Telmo", "Saavedra", "Chacarita"];
  const labels = s("g", { opacity: 0, class: "city-barrios" }, root);
  CABA.barrios.filter(b => BARRIOS.includes(b[0])).forEach(b => {
    const [x, y] = P(b[1], b[2]);
    s("text", { x, y, "text-anchor": "middle" }, labels, b[0].toUpperCase());
  });

  /* ---------- Zoom: el parque actual, apoyado al norte de las vías ----------
     Vía recta local (dos rieles + durmientes), Lacroze cruzando en la
     estación y el parque hacia el oeste. Rótulos sin pisar nada. */
  const zoomG = s("g", { opacity: 0 }, root);
  const seg = (a0, a1, b) => { const p = at(a0, b), q = at(a1, b); return `M${p[0].toFixed(2)} ${p[1].toFixed(2)}L${q[0].toFixed(2)} ${q[1].toFixed(2)}`; };
  [-0.5, 0.5].forEach(b => s("path", Object.assign({ d: seg(-80, 80, b), stroke: "#111", "stroke-width": 1, fill: "none" }, NS), zoomG));
  s("path", Object.assign({ d: seg(-80, 80, 0), stroke: "#111", "stroke-opacity": .45, "stroke-width": 6, "stroke-dasharray": "1.4 5", fill: "none" }, NS), zoomG);
  // Av. Federico Lacroze: cruza las vías en la estación (extremo este del parque)
  const th = Math.atan2(dU[1], dU[0]) - 1.2, vL = [Math.cos(th), Math.sin(th)], c0 = at(4, 0);
  s("path", Object.assign({ d: `M${c0[0] - vL[0] * 60} ${c0[1] - vL[1] * 60}L${c0[0] + vL[0] * 60} ${c0[1] + vL[1] * 60}`, stroke: "#111", "stroke-opacity": .6, "stroke-width": 1.4, fill: "none" }, NS), zoomG);
  const parkPoly = [at(-26, 1.1), at(2, 1.1), at(2.4, 3.2), at(-25.4, 4.2)];
  s("path", Object.assign({ d: "M" + parkPoly.map(q => q.map(v => v.toFixed(2)).join(" ")).join("L") + "Z", fill: A.C.acento, stroke: "#111", "stroke-width": 1.6 }, NS), zoomG);
  const zSigns = s("g", {}, zoomG);
  const ang = (Math.atan2(dU[1], dU[0]) * 180 / Math.PI).toFixed(1);
  const top = at(-14, 4.0);
  A.sign(zSigns, top[0], top[1], "Parque Ferroviario Colegiales", A.C.acento, { dir: "n", len: 44, sub: "parque actual" });
  const rl = at(22, 0);
  A.mapLabel(zSigns, 0, 0, "Vías FFCC Mitre", { cls: "rail" }).setAttribute("transform", `translate(${rl[0].toFixed(2)} ${rl[1].toFixed(2)}) rotate(${ang})`);
  const stn = at(6, -2.6);
  A.mapLabel(zSigns, 0, 0, "Estación Colegiales", { cls: "hito", anchor: "start" }).setAttribute("transform", `translate(${stn[0].toFixed(2)} ${stn[1].toFixed(2)}) rotate(${ang})`);
  const lp = [c0[0] - vL[0] * 22, c0[1] - vL[1] * 22];
  A.mapLabel(zSigns, 0, 0, "Av. Federico Lacroze", { cls: "street av" }).setAttribute("transform", `translate(${(lp[0] + 1.4).toFixed(2)} ${lp[1].toFixed(2)}) rotate(${(th * 180 / Math.PI + (Math.cos(th) < 0 ? 180 : 0)).toFixed(1)})`);

  /* ---------- Espacios verdes por estado ---------- */
  const parksG = s("g", {}, root);
  const parks = A.D.espacios.map((e, i) => {
    const [x, y] = P(e.lat, e.lon);
    const est = e.estado;
    const r = est === "activo" ? 11 : est === "completado" ? 10 : 7;
    const g = s("g", { class: "park-shape st-" + est, tabindex: 0, role: "button", "aria-label": e.nombre }, parksG);
    const scaleG = s("g", {}, g);
    if (est === "activo") s("circle", Object.assign({ cx: x, cy: y, r: r * 1.7, fill: "none", stroke: "#111", "stroke-width": 1, class: "pulse" }, NS), scaleG);
    s("path", Object.assign({
      d: A.shape(e.forma, x, y, r), fill: COL[est],
      stroke: est === "pendiente" ? "#8a8a84" : "#111", "stroke-width": est === "pendiente" ? 1.1 : 1.4
    }, NS), scaleG);
    const votes = () => (A.store.get("votos", {})[e.id] || 0);
    const info = () => est === "activo"
      ? `<b>${e.nombre}</b><span class="mono">${e.barrio} · Comuna ${e.comuna}</span><br>En curso: ATLAS está acá ahora.<br><span class="mono">tocá para entrar →</span>`
      : est === "completado"
      ? `<b>${e.nombre}</b><span class="mono">${e.barrio} · Comuna ${e.comuna}</span><br>Lectura completada (capas sociales).<br><span class="mono">tocá para comparar →</span>`
      : `<b>${e.nombre}</b><span class="mono">${e.barrio} · Comuna ${e.comuna}</span><br>Sin relevar todavía · bloqueado.<br><span class="mono">${votes()} voto${votes() === 1 ? "" : "s"} para que sea el próximo</span>`;
    g.addEventListener("pointermove", ev => { if (!tip.classList.contains("pinned")) A.showTip(tip, info(), ev, stage); });
    g.addEventListener("pointerleave", () => { if (!tip.classList.contains("pinned")) A.hideTip(tip); });
    const open = ev => {
      ev.stopPropagation();
      if (est === "activo") { document.getElementById("park").scrollIntoView({ behavior: A.reduced ? "auto" : "smooth" }); return; }
      if (est === "completado") { document.getElementById("compara").scrollIntoView({ behavior: A.reduced ? "auto" : "smooth" }); return; }
      A.showTip(tip, info() + `<br><button class="btn small" id="vote-btn">Votar para que sea el próximo</button>`, ev, stage);
      tip.classList.add("pinned");
      document.getElementById("vote-btn").onclick = (e2) => {
        e2.stopPropagation();
        const v = A.store.get("votos", {}); v[e.id] = (v[e.id] || 0) + 1; A.store.set("votos", v);
        A.showTip(tip, info() + `<br><span class="mono">Gracias: tu voto quedó registrado.</span>`, ev, stage);
        tip.classList.add("pinned");
      };
    };
    g.addEventListener("click", open);
    g.addEventListener("keydown", ev => { if (ev.key === "Enter") open(Object.assign(ev, { clientX: stage.clientWidth / 2, clientY: stage.clientHeight / 2 })); });
    return { e, g, scaleG, x, y, i, est };
  });
  // Rótulos fijos para los dos parques leídos
  const parkSigns = s("g", { opacity: 0 }, root);
  parks.filter(p => p.est !== "pendiente").forEach(p =>
    A.sign(parkSigns, p.x, p.y - (p.est === "activo" ? 12 : 11), p.e.nombre.replace("Parque ", ""), COL[p.est], { dir: "n", len: 14, sub: p.est === "activo" ? "en curso" : "completado" }));
  stage.addEventListener("click", () => A.hideTip(tip));

  /* ---------- Zoom con botones (mueve el scroll) ---------- */
  zoomCtrl.addEventListener("click", ev => {
    const b = ev.target.closest("button"); if (!b) return;
    const total = sec.offsetHeight - window.innerHeight;
    const target = b.dataset.zoom === "in" ? .97 : .64;
    window.scrollTo({ top: sec.offsetTop + total * target, behavior: A.reduced ? "auto" : "smooth" });
  });

  /* ---------- Render por scroll ---------- */
  let zoomK = 1;
  function render(p) {
    const o = A.ease(A.seg(p, 0, .16));
    outlinePath.setAttribute("stroke-dashoffset", 1 - o);
    outlinePath2.setAttribute("stroke-dashoffset", 1 - Math.max(pre, A.ease(A.seg(p, .04, .2))));
    hello.style.opacity = 1 - A.seg(p, 0, .045);
    hello.style.visibility = p > .05 ? "hidden" : "visible";
    water.setAttribute("opacity", A.seg(p, .08, .2));
    riverLbl.setAttribute("opacity", A.seg(p, .1, .2) * (1 - A.seg(p, .74, .8)));

    avs.forEach((a, i) => a.setAttribute("stroke-dashoffset", 1 - A.ease(A.seg(p, .14 + i * .02, .3 + i * .01))));
    rail.setAttribute("stroke-dashoffset", 1 - A.ease(A.seg(p, .18, .32)));
    ties.setAttribute("opacity", A.seg(p, .26, .34));
    lines.setAttribute("opacity", A.seg(p, .24, .32) * (1 - A.seg(p, .74, .8)));
    labels.setAttribute("opacity", A.seg(p, .36, .44) * (1 - A.seg(p, .5, .56)));

    parks.forEach(pk => {
      const t = A.seg(p, .48 + pk.i * .005, .56 + pk.i * .005);
      pk.g.style.opacity = t;
      pk.g.style.pointerEvents = t > .5 ? "auto" : "none";
      pk.scaleG.setAttribute("transform", `translate(${pk.x} ${pk.y}) scale(${A.ease(t) / zoomK}) translate(${-pk.x} ${-pk.y})`);
    });
    parkSigns.setAttribute("opacity", A.seg(p, .56, .62) * (1 - A.seg(p, .74, .8)));
    legend.classList.toggle("on", p > .5);
    zoomCtrl.classList.toggle("on", p > .55);

    // Zoom al parque actual
    const z = A.ease(A.seg(p, .72, .94));
    const vb = { x: A.lerp(FULL.x, ZOOM.x, z), y: A.lerp(FULL.y, ZOOM.y, z), w: A.lerp(FULL.w, ZOOM.w, z), h: A.lerp(FULL.h, ZOOM.h, z) };
    svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    zoomK = FULL.w / vb.w;
    const r = svg.getBoundingClientRect();
    if (r.width) svg.style.setProperty("--k", Math.max(vb.w / r.width, vb.h / r.height).toFixed(4));
    zoomG.setAttribute("opacity", A.seg(p, .84, .92));
    const hideRail = 1 - A.seg(p, .84, .9);
    rail.style.opacity = hideRail; ties.style.opacity = Math.min(+ties.getAttribute("opacity"), hideRail);
    parks.forEach(pk => {
      if (pk.est === "activo") pk.g.style.opacity = Math.min(+pk.g.style.opacity, 1 - A.seg(p, .84, .9));
      else pk.g.style.opacity = +pk.g.style.opacity * (1 - z * .7);
    });
  }
  const hello = document.getElementById("city-hello");
  /* Bienvenida: el contorno de la ciudad se dibuja solo mientras la persona lee */
  let pre = 0, preStop = null;
  function welcome(mirada) {
    document.getElementById("hello-kicker").textContent = "Recorrido" + (mirada ? " · mirada " + mirada : "");
    pre = 0; if (preStop) preStop();
    const t0 = performance.now();
    preStop = A.loop(() => { pre = A.ease(A.clamp((performance.now() - t0) / 2600)); render(A.progress(sec)); if (pre >= 1) { preStop(); preStop = null; } });
  }

  A.city = { update() { render(A.progress(sec)); }, welcome, outline, BB, P };
  render(0);
})(window.ATLAS);
