/* =========================================================================
   ATLAS · PLANO DEL PARQUE FERROVIARIO COLEGIALES
   Esquema (no a escala) en un lienzo de 1600 x 700.
   Sin manzanas: calles con nombre para orientarse + las zonas del parque
   dibujadas como pictogramas (pérgolas, juegos, vagones, galpón…).
   ========================================================================= */
(function (A) {
  const s = A.s, PD = A.D.parque;

  /* ---------- Geometría base (editable) ---------- */
  const G = {
    park: [[95,322],[140,214],[1500,168],[1536,180],[1526,250],[1300,272],[900,300],[500,336],[250,366],[118,374]],
    moldesY: x => 192 - (x - 30) * 0.0333,     // eje de la calle Moldes
    railY:   x => 410 - (x - 30) * 0.0714,     // primera vía
    cramerY: x => 512 - (x - 30) * 0.0714,     // calle Crámer
    streetsX: [110, 360, 620, 880, 1140, 1400], // cruces (izq → der) = PD.calles
    mainPath: [[115,335],[300,322],[520,306],[800,281],[1100,255],[1350,232],[1515,205]]
  };
  A.parkGeom = G;
  /* Encuadre completo del plano (lo que entra con "Todo") */
  A.PARK_FULL = [20, 110, 1580, 430];

  const inPoly = (x, y, poly) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  A.inPark = (x, y) => inPoly(x, y, G.park);
  const polyD = (pts, close = true) => "M" + pts.map(q => q.join(" ")).join("L") + (close ? "Z" : "");
  const NS = { "vector-effect": "non-scaling-stroke" };


  /* Zona más cercana a un punto (para nombrar dónde cae un aporte) */
  A.zonaCerca = (x, y) => PD.zonas.map(z => ({ z, d: Math.hypot(z.x - x, z.y - y) })).sort((a, b) => a.d - b.d)[0].z;

  /* ---------- Dibuja el plano base dentro de un <svg> ----------
     opts.labels: "min" (calles + hitos) | "all" (también todas las zonas) */
  let uid = 0;
  A.drawParkBase = function (svg, opts = {}) {
    const id = "pk" + (++uid);
    const defs = s("defs", {}, svg);
    const hp = s("pattern", { id: id + "-hatch", width: 8, height: 8, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    s("line", { x1: 0, y1: 0, x2: 0, y2: 8, stroke: "#111", "stroke-opacity": .35, "stroke-width": 1.4 }, hp);

    const base = s("g", { class: "pk-base" }, svg);
    const line = (d, w = 1, op = .7, extra = {}) => s("path", Object.assign({ d, fill: "none", stroke: "#111", "stroke-width": w, "stroke-opacity": op, "stroke-linecap": "round" }, NS, extra), base);
    const X0 = -40, X1 = 1680;

    // Calles principales (sin manzanas): Moldes arriba, Crámer abajo
    [-8, 8].forEach(d => line(`M${X0} ${G.moldesY(X0) + d}L${X1} ${G.moldesY(X1) + d}`, 1.2, .55));
    [-8, 8].forEach(d => line(`M${X0} ${G.cramerY(X0) + d}L${X1} ${G.cramerY(X1) + d}`, 1.2, .55));
    // Cruces: tramos cortos con su nombre (Av. Federico Lacroze, más ancha y completa)
    G.streetsX.forEach((x, i) => {
      if (i === 0) {
        [-14, 14].forEach(d => line(`M${x + d} ${G.moldesY(x) - 70}L${x + d} ${G.cramerY(x) + 70}`, 1.4, .6));
        return;
      }
      [-7, 7].forEach(d => {
        line(`M${x + d} ${G.moldesY(x) - 60}L${x + d} ${G.moldesY(x) - 8}`, 1, .45);
        line(`M${x + d} ${G.cramerY(x) + 8}L${x + d} ${G.cramerY(x) + 60}`, 1, .45);
      });
    });
    // Vías del Mitre: 3 líneas + durmientes
    for (let k = 0; k < 3; k++) {
      line(`M${X0} ${G.railY(X0) + k * 13}L${X1} ${G.railY(X1) + k * 13}`, 1, .8);
      line(`M${X0} ${G.railY(X0) + k * 13}L${X1} ${G.railY(X1) + k * 13}`, 5, .22, { "stroke-dasharray": "1.4 7", "stroke-linecap": "butt", "vector-effect": "none" });
    }

    // Parque
    const park = s("g", { class: "pk-park" }, svg);
    s("path", Object.assign({ d: polyD(G.park), fill: A.C.publico, "fill-opacity": .2, stroke: "#111", "stroke-width": 1.5 }, NS), park);
    s("path", { d: polyD(G.mainPath, false), fill: "none", stroke: "#fff", "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round" }, park);
    [[[150,250],[300,322]], [[360,226],[420,312]], [[620,212],[660,296]], [[880,200],[900,284]], [[1140,186],[1170,258]], [[1300,272],[1320,236]]]
      .forEach(pts => s("path", { d: polyD(pts, false), fill: "none", stroke: "#fff", "stroke-width": 5, "stroke-linecap": "round" }, park));

    // Árboles (+250 en la realidad; acá una muestra que no pisa las zonas)
    const trees = s("g", {}, park);
    let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    let n = 0;
    for (let i = 0; i < 1400 && n < 90; i++) {
      const x = 100 + rnd() * 1430, y = 165 + rnd() * 210;
      if (!inPoly(x, y, G.park)) continue;
      if (PD.zonas.some(z => Math.hypot(z.x - x, (z.y - y) * 1.6) < 46)) continue;
      const onPath = G.mainPath.some((q, j) => j && x >= G.mainPath[j - 1][0] && x <= q[0] &&
        Math.abs(y - A.lerp(G.mainPath[j - 1][1], q[1], (x - G.mainPath[j - 1][0]) / (q[0] - G.mainPath[j - 1][0]))) < 10);
      if (onPath) continue;
      s("circle", Object.assign({ cx: x.toFixed(1), cy: y.toFixed(1), r: (2.6 + rnd() * 3).toFixed(1), fill: "#fff", stroke: "#05a865", "stroke-width": 1 }, NS), trees);
      n++;
    }

    // Zonas: pictogramas simples, trazo negro sobre blanco
    const f = s("g", { class: "pk-feat" }, park);
    const box = (x, y, w, h, rot = -4, extra = {}) => s("rect", Object.assign({ x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 2, fill: "#fff", stroke: "#111", "stroke-width": 1.2, transform: `rotate(${rot} ${x} ${y})` }, NS, extra), f);
    const Z = Object.fromEntries(PD.zonas.map(z => [z.id, z]));
    // Plaza Lacroze: explanada circular
    s("circle", Object.assign({ cx: Z.lacroze.x, cy: Z.lacroze.y, r: 24, fill: "#fff", stroke: "#111", "stroke-width": 1.2 }, NS), f);
    s("circle", Object.assign({ cx: Z.lacroze.x, cy: Z.lacroze.y, r: 6, fill: "none", stroke: "#111", "stroke-width": 1 }, NS), f);
    // Feria gastronómica: puestos
    for (let k = 0; k < 4; k++) box(Z.feria.x - 27 + k * 18, Z.feria.y - k * 1.2, 12, 12, -4);
    // Vagones: tres coches sobre el borde de las vías
    for (let k = 0; k < 3; k++) {
      const x = Z.vagones.x - 40 + k * 40, y = Z.vagones.y - k * 2.8;
      box(x, y, 34, 12, -4);
      s("line", Object.assign({ x1: x - 11, y1: y + 0.8, x2: x + 11, y2: y - 0.8, stroke: "#111", "stroke-width": 1, "stroke-dasharray": "3 3" }, NS), f);
    }
    // Galpón Mitre
    box(Z.galpon.x, Z.galpon.y, 110, 26, -4);
    // Juegos infantiles: arenero + tobogán + hamacas
    s("rect", Object.assign({ x: Z.juegos.x - 34, y: Z.juegos.y - 20, width: 68, height: 40, rx: 14, fill: "#fff", stroke: "#111", "stroke-width": 1.2, transform: `rotate(-4 ${Z.juegos.x} ${Z.juegos.y})` }, NS), f);
    s("path", Object.assign({ d: A.shape("triangulo", Z.juegos.x - 14, Z.juegos.y + 2, 9), fill: "none", stroke: "#111", "stroke-width": 1.1 }, NS), f);
    [6, 18].forEach(dx => s("circle", Object.assign({ cx: Z.juegos.x + dx, cy: Z.juegos.y, r: 4.5, fill: "none", stroke: "#111", "stroke-width": 1.1 }, NS), f));
    // Pérgolas: estructura con listones
    const pergola = (z) => {
      box(z.x, z.y, 84, 16, -3);
      for (let k = 1; k < 7; k++) {
        const x = z.x - 42 + k * 12;
        s("line", Object.assign({ x1: x, y1: z.y - 8 + 0, x2: x, y2: z.y + 8, stroke: "#111", "stroke-width": 1, transform: `rotate(-3 ${z.x} ${z.y})` }, NS), f);
      }
    };
    pergola(Z.pergolas); pergola(Z.pergolas2);
    // Lote privado (Distrito Colegiales): rayado
    s("rect", Object.assign({ x: Z.distrito.x - 75, y: Z.distrito.y - 20, width: 150, height: 40, fill: `url(#${id}-hatch)`, stroke: "#111", "stroke-width": 1.1, "stroke-dasharray": "5 4", transform: `rotate(-3 ${Z.distrito.x} ${Z.distrito.y})` }, NS), f);
    // Skate y BMX: pista
    s("ellipse", Object.assign({ cx: Z.skate.x, cy: Z.skate.y, rx: 42, ry: 16, fill: "#fff", stroke: "#111", "stroke-width": 1.2, transform: `rotate(-3 ${Z.skate.x} ${Z.skate.y})` }, NS), f);
    s("path", Object.assign({ d: `M${Z.skate.x - 24} ${Z.skate.y + 4}q24 -18 48 -2`, fill: "none", stroke: "#111", "stroke-width": 1 }, NS), f);
    // Huerta: canteros
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) box(Z.huerta.x - 16 + c * 16, Z.huerta.y - 6 + r * 13 - c, 12, 9, -3);
    // Plaza Juan José Paso
    s("circle", Object.assign({ cx: Z.jjpaso.x, cy: Z.jjpaso.y, r: 18, fill: "#fff", stroke: "#111", "stroke-width": 1.2 }, NS), f);
    // Acceso Olaguer y Feliú
    s("path", Object.assign({ d: A.shape("triangulo", Z.olaguer.x, Z.olaguer.y, 9), fill: "#111" }, NS), f);
    // Estación Colegiales (andén + edificio), al sur de las vías
    const ey = G.railY(215);
    s("rect", Object.assign({ x: 160, y: ey - 15, width: 120, height: 9, fill: "#fff", stroke: "#111", "stroke-width": 1, transform: `rotate(-4 220 ${ey - 10})` }, NS), f);
    s("rect", Object.assign({ x: 160, y: ey + 34, width: 110, height: 18, fill: "#fff", stroke: "#111", "stroke-width": 1.2, transform: `rotate(-4 215 ${ey + 42})` }, NS), f);

    // Rótulos: calles (siempre) + hitos o todas las zonas
    const lab = s("g", { class: "pk-labels" }, svg);
    A.mapLabel(lab, 1500, G.moldesY(1500) - 22, "Moldes", { cls: "street" });
    A.mapLabel(lab, 1500, G.cramerY(1500) + 24, "Crámer", { cls: "street" });
    A.mapLabel(lab, G.streetsX[0] - 26, G.cramerY(110) + 40, "Av. Federico Lacroze", { cls: "street av", rot: -90 });
    PD.calles.slice(1).forEach((c, i) => A.mapLabel(lab, G.streetsX[i + 1], G.moldesY(G.streetsX[i + 1]) - 72, c, { cls: "street" }));
    // Vías: rótulo con fondo blanco, las vías pasan "por detrás"
    const rl = A.mapLabel(lab, 1180, G.railY(1180) + 13, "Vías FFCC Mitre", { cls: "rail" });
    rl.setAttribute("transform", `translate(1180 ${G.railY(1180) + 13}) rotate(-4)`);
    A.mapLabel(lab, 215, ey + 66, "Estación Colegiales", { cls: "hito" });
    const show = opts.labels === "all" ? PD.zonas.filter(z => z.id !== "estacion") : PD.zonas.filter(z => ["galpon", "vagones", "juegos", "pergolas"].includes(z.id));
    const below = { vagones: 1, galpon: 1, feria: 0 };
    show.forEach(z => {
      const dy = below[z.id] ? 30 : -30;
      A.mapLabel(lab, z.x, z.y + dy, z.corto, { cls: "zona" });
    });
    return { base, park, labels: lab };
  };

  /* ======================================================================
     ESCENARIO PRINCIPAL DEL PARQUE
     ====================================================================== */
  const svg = document.getElementById("park-svg");
  const mapBox = document.getElementById("park-map");
  const overlay = document.getElementById("park-overlay");
  const tip = document.getElementById("park-tip");

  A.drawParkBase(svg, { labels: "min" });
  const fxUnder = s("g", {}, svg);
  const peopleG = s("g", {}, svg);
  const sensorsG = s("g", {}, svg);
  const fx = s("g", {}, svg);
  const cam = A.panZoom(svg, { full: A.PARK_FULL, minW: 260, buttons: document.getElementById("park-zoom") });

  /* ---------- Sensores (cada tipo con su figura bien distinta) ---------- */
  const SENS = { camara: ["Cámara de seguridad", "triangulo", A.C.acento], sonido: ["Sensor de sonido", "circulo", A.C.ciudadanos], movimiento: ["Sensor de movimiento", "cuadrado", A.C.privado] };
  const sensorEls = PD.sensores.map(se => {
    const [nombre, forma, col] = SENS[se.tipo];
    const g = s("g", { class: "sensor", "data-tipo": se.tipo, style: "cursor:help", "data-nopan": "" }, sensorsG);
    if (se.tipo === "camara") {
      const a = (se.dir || 0) * Math.PI / 180;
      s("path", { d: `M${se.x} ${se.y}L${se.x + Math.cos(a - .45) * 70} ${se.y + Math.sin(a - .45) * 70}A70 70 0 0 1 ${se.x + Math.cos(a + .45) * 70} ${se.y + Math.sin(a + .45) * 70}Z`, fill: A.C.acento, "fill-opacity": .1, class: "cone" }, g);
    }
    const k = s("g", { class: "k-wrap", transform: `translate(${se.x} ${se.y})` }, g);
    s("path", { class: "k", d: A.shape(forma, 0, 0, 6), fill: col, stroke: "#111", "stroke-width": 1.2 }, k);
    g.addEventListener("pointermove", ev => {
      const val = se.tipo === "sonido" ? `${Math.round(A.park.noiseAt(se.x, se.y))} dB` : se.tipo === "camara" ? `${A.park.countNear(se.x, se.y, 90)} personas en cuadro` : `${A.park.countNear(se.x, se.y, 60)} movimientos / min`;
      A.showTip(tip, `<b>${se.id} · ${nombre}</b><span class="mono">lectura en vivo · simulada</span><br>${val}`, ev, mapBox);
    });
    g.addEventListener("pointerleave", () => A.hideTip(tip));
    return { se, g };
  });
  const showSensors = (types) => sensorEls.forEach(({ se, g }) => g.style.display = types === "all" || (types || []).includes(se.tipo) ? "" : "none");

  /* ---------- Personas (simulación en tiempo real) ---------- */
  const PP = A.D.capas.personas;
  const pick = (dist) => { let r = Math.random() * 100; for (const k in dist) { r -= dist[k]; if (r <= 0) return k; } return Object.keys(dist)[0]; };
  const pathLen = []; let total = 0;
  for (let i = 1; i < G.mainPath.length; i++) { const l = Math.hypot(G.mainPath[i][0] - G.mainPath[i - 1][0], G.mainPath[i][1] - G.mainPath[i - 1][1]); pathLen.push(l); total += l; }
  function along(t) {
    let d = t * total;
    for (let i = 0; i < pathLen.length; i++) {
      if (d <= pathLen[i]) { const a = G.mainPath[i], b = G.mainPath[i + 1], k = d / pathLen[i]; return [A.lerp(a[0], b[0], k), A.lerp(a[1], b[1], k)]; }
      d -= pathLen[i];
    }
    return G.mainPath[G.mainPath.length - 1];
  }
  const spots = PD.zonas.filter(z => A.inPark(z.x, z.y));
  const people = [];
  function spawn() {
    const walker = Math.random() < .65;
    const p = {
      walker, t: Math.random(), v: (Math.random() < .5 ? -1 : 1) * A.rand(.008, .02), off: A.rand(-14, 14),
      zone: spots[Math.floor(Math.random() * spots.length)], ang: Math.random() * 6.28, rad: A.rand(4, 36),
      edad: pick(PP.edad), genero: pick(PP.genero), mascota: pick(PP.mascota) === "Con mascota",
      alpha: 0, dying: false, x: 0, y: 0
    };
    p.el = s("circle", { r: p.edad.startsWith("Niñez") ? 3 : 4.2, fill: "#111" }, peopleG);
    if (p.mascota) p.dog = s("rect", { width: 5, height: 5, fill: "#111", opacity: .8 }, peopleG);
    people.push(p);
  }
  let target = 0;
  const crowd = {
    colorFn: null,
    set(n) { target = Math.round(n); },
    get count() { return people.filter(p => !p.dying).length; }
  };
  A.loop((dt) => {
    const alive = people.filter(p => !p.dying);
    if (alive.length < target) for (let i = 0; i < Math.min(3, target - alive.length); i++) spawn();
    else if (alive.length > target) alive.slice(0, Math.min(3, alive.length - target)).forEach(p => p.dying = true);
    for (let i = people.length - 1; i >= 0; i--) {
      const p = people[i];
      p.alpha = A.clamp(p.alpha + (p.dying ? -dt * 2 : dt * 1.5));
      if (p.dying && p.alpha <= 0) { p.el.remove(); p.dog && p.dog.remove(); people.splice(i, 1); continue; }
      if (p.walker) {
        p.t += p.v * dt * (A.reduced ? .2 : 1);
        if (p.t > 1 || p.t < 0) { p.v *= -1; p.t = A.clamp(p.t); }
        const [x, y] = along(p.t); p.x = x; p.y = y + p.off;
      } else {
        p.ang += dt * .15;
        p.x = p.zone.x + Math.cos(p.ang) * p.rad * .3 + Math.cos(p.ang * 3) * 2;
        p.y = p.zone.y + Math.sin(p.ang) * p.rad * .2;
      }
      p.el.setAttribute("cx", p.x.toFixed(1)); p.el.setAttribute("cy", p.y.toFixed(1));
      p.el.setAttribute("opacity", (p.alpha * .9).toFixed(2));
      const col = crowd.colorFn ? crowd.colorFn(p) : "#111";
      p.el.setAttribute("fill", col);
      if (p.dog) { p.dog.setAttribute("x", (p.x + 6).toFixed(1)); p.dog.setAttribute("y", (p.y + 2).toFixed(1)); p.dog.setAttribute("opacity", (p.alpha * .8).toFixed(2)); p.dog.setAttribute("fill", crowd.colorFn ? crowd.colorFn(p, true) : "#111"); }
    }
  });

  /* ---------- Ruido (modelo simple) ---------- */
  function noiseAt(x, y) {
    let e = Math.pow(10, 38 / 10);
    A.D.capas.ruido.fuentes.forEach(f => { const d = Math.max(20, Math.hypot(x - f.x, y - f.y)); e += Math.pow(10, (f.db - 20 * Math.log10(d / 20)) / 10); });
    return 10 * Math.log10(e);
  }

  /* ---------- Hora actual / flujo ---------- */
  const now = () => new Date();
  const isWeekend = () => [0, 6].includes(now().getDay());
  const liveFlow = () => (isWeekend() ? A.D.capas.transito.finde : A.D.capas.transito.semana)[now().getHours()];

  /* ---------- HUD "en vivo" ---------- */
  const $ = id => document.getElementById(id);
  setInterval(() => {
    const d = now();
    $("live-clock").textContent = d.toLocaleTimeString("es-AR", { hour12: false });
    $("live-people").textContent = crowd.count;
    $("live-db").textContent = Math.round(noiseAt(700, 290) + A.rand(-2, 2));
    $("live-sensors").textContent = PD.sensores.length;
  }, 1000);

  A.park = {
    svg, stage: mapBox, overlay, tip, fx, fxUnder, peopleG, sensorsG, sensorEls, crowd, people, cam, showSensors,
    noiseAt, liveFlow, isWeekend,
    countNear(x, y, r) { return people.filter(p => !p.dying && Math.hypot(p.x - x, p.y - y) < r).length; },
    resetCrowd() { crowd.colorFn = null; crowd.set(liveFlow()); }
  };
  A.park.resetCrowd();
})(window.ATLAS);
