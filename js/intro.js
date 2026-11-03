/* =========================================================================
   ATLAS · INTRO (marco contextual, sólo la primera visita)
   Un relato con scroll: los círculos se redistribuyen en cada paso.
     0 Miradas · 1 Problema · 2 Recolectar · 3 Procesar · 4 Capas ·
     5 Explorar · 6 Oportunidad · 7 Cómo se usa
   Se puede saltar siempre y volver a ver desde "¿Qué es ATLAS?".
   ========================================================================= */
(function (A) {
  const s = A.s, I = window.ATLAS_INFORME;
  const sec = document.getElementById("intro-scroll");
  const svg = document.getElementById("intro-svg");
  const steps = [...document.querySelectorAll(".istep")];
  // Los textos viven dentro del escenario fijo: cambian en sincronía con los círculos
  sec.querySelector(".istage").appendChild(sec.querySelector(".isteps"));
  const N = 72, STEPS = 8;
  const COL = [A.C.ciudadanos, A.C.publico, A.C.privado];
  const W = 1000, H = 640;

  /* Semilla fija: el dibujo es siempre el mismo */
  let seed = 11; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

  /* ---------- Actores / grandes círculos ---------- */
  const big = [
    { lab: ["CIUDADANÍA", "CONFLICTOS"], c: A.C.ciudadanos },
    { lab: ["SECTOR PÚBLICO", "NECESIDADES"], c: A.C.publico },
    { lab: ["SECTOR PRIVADO", "RECURSOS"], c: A.C.privado }
  ];
  const BIG_SPREAD = [[300, 330], [520, 330], [740, 330]];
  const R0 = 92, D = 120, RR = D / Math.sqrt(3), OC = [640, 330];
  const BIG_OVER = [[OC[0], OC[1] - RR], [OC[0] - D / 2, OC[1] + RR / 2], [OC[0] + D / 2, OC[1] + RR / 2]];
  const defs = s("defs", {}, svg);
  const clips = big.map((b, i) => s("circle", {}, s("clipPath", { id: "ic" + i }, defs)));
  const bigG = s("g", {}, svg);
  big.forEach((b, i) => {
    b.el = s("circle", { r: R0, fill: b.c, "fill-opacity": .9 }, bigG);
    b.t = s("text", { "text-anchor": "middle", "dominant-baseline": "middle", fill: "#111", "font-size": 15, "font-weight": 600, "font-family": "Inter Tight", "letter-spacing": 1 }, bigG);
  });
  // Intersección negra (el símbolo)
  const interG = s("g", { "clip-path": "url(#ic1)" }, svg);
  const inter2 = s("g", { "clip-path": "url(#ic2)" }, interG);
  const interC = s("circle", { fill: "#111" }, inter2);

  /* ---------- Capas (papel vegetal apilado) ---------- */
  const layersG = s("g", { opacity: 0 }, svg);
  const GR = I.grupos;
  const planes = GR.map((g, i) => {
    const y = 470 - i * 62, x = 640;
    const gg = s("g", { transform: `translate(${x} ${y})` }, layersG);
    const poly = s("path", { d: "M-210 0 L0 -80 L210 0 L0 80 Z", fill: "#fff", "fill-opacity": .72, stroke: "#111", "stroke-width": 1.2 }, gg);
    return { gg, poly, y0: y };
  });

  /* ---------- Puntos ---------- */
  const dots = Array.from({ length: N }, (_, i) => ({
    g: i % 3, el: s("circle", { r: 6 }, svg),
    rx: rnd(), ry: rnd(), rs: rnd(), ang: rnd() * Math.PI * 2, rad: rnd()
  }));

  /* Posición/tamaño/color de cada punto en cada paso */
  function layout(k, d, i) {
    switch (k) {
      case 0: { // alrededor de su actor
        const [cx, cy] = BIG_SPREAD[d.g], r = R0 + 18 + d.rad * 60;
        return [cx + Math.cos(d.ang) * r, cy + Math.sin(d.ang) * r * .9, 4 + d.rs * 4, COL[d.g], .85];
      }
      case 1: // dispersión: algunas voces pesan más
        return [380 + d.rx * 560, 70 + d.ry * 500, 3 + Math.pow(d.rs, 3) * 22, COL[d.g], .8];
      case 2: { // recolectar: todo junto, negro
        const a = i * 2.4, r = 9 * Math.sqrt(i);
        return [640 + Math.cos(a) * r, 330 + Math.sin(a) * r, 6.5, "#111111", 1];
      }
      case 3: { // procesar: tres grupos por voz
        const c = [[500, 230], [760, 230], [630, 450]][d.g], j = Math.floor(i / 3), a = j * 2.4, r = 12 * Math.sqrt(j);
        return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, 8, COL[d.g], 1];
      }
      case 4: { // capas: los puntos bajan a las hojas
        const p = i % 5, y = 470 - p * 62;
        return [640 + (d.rx - .5) * 260, y + (d.ry - .5) * 50, 3, "#111111", 0];
      }
      case 5: { // explorar: grilla, uno amarillo
        const col = i % 12, row = Math.floor(i / 12);
        return [420 + col * 40, 150 + row * 40, 8, i === 31 ? A.C.acento : "#d2d2cd", 1];
      }
      case 6: // oportunidad: todo converge al cruce
        return [OC[0] + (d.rx - .5) * 30, OC[1] + (d.ry - .5) * 30, 2, "#111111", 0];
      default:
        return [OC[0], OC[1], 0, "#111111", 0];
    }
  }
  const lerpColor = (a, b, t) => {
    const p = h => [1, 3, 5].map(j => parseInt(h.slice(j, j + 2), 16));
    const x = p(a), y = p(b);
    return "rgb(" + x.map((v, j) => Math.round(v + (y[j] - v) * t)).join(",") + ")";
  };

  function render(p) {
    const f = A.clamp(p * STEPS, 0, STEPS - .0001), k = Math.floor(f), local = f - k;
    // Cada paso se sostiene y en su último 40% transiciona al siguiente
    const t = A.ease(A.seg(local, .6, 1)), k2 = Math.min(STEPS - 1, k + 1);
    steps.forEach((el, i) => el.classList.toggle("on", i === k));

    dots.forEach((d, i) => {
      const a = layout(k, d, i), b = layout(k2, d, i);
      d.el.setAttribute("cx", A.lerp(a[0], b[0], t).toFixed(1));
      d.el.setAttribute("cy", A.lerp(a[1], b[1], t).toFixed(1));
      d.el.setAttribute("r", Math.max(0, A.lerp(a[2], b[2], t)).toFixed(2));
      d.el.setAttribute("fill", a[3] === b[3] ? a[3] : lerpColor(a[3], b[3], t));
      d.el.setAttribute("opacity", A.lerp(a[4], b[4], t).toFixed(2));
    });

    // Grandes círculos: visibles en 0, ausentes 1–5, superpuestos en 6
    const vis = st => st === 0 || st === 6 ? 1 : 0;
    const bo = A.lerp(vis(k), vis(k2), t);
    big.forEach((b, i) => {
      const pos = st => st === 6 || st === 7 ? BIG_OVER[i] : BIG_SPREAD[i];
      const pa = pos(k), pb = pos(k2);
      const x = A.lerp(pa[0], pb[0], t), y = A.lerp(pa[1], pb[1], t);
      const r = (k >= 6 || k2 >= 6) ? A.lerp(k >= 6 ? 120 : R0, 120, t) : R0;
      [b.el, clips[i]].forEach(e => { e.setAttribute("cx", x); e.setAttribute("cy", y); e.setAttribute("r", r); });
      b.el.setAttribute("opacity", (k === 7 ? 1 - local : bo) * .95);
      b.t.setAttribute("x", x); b.t.setAttribute("y", y + (k >= 6 && i === 0 ? -30 : k >= 6 ? 26 : 0) + (k >= 6 && i === 1 ? 0 : 0));
      b.t.setAttribute("x", x + (k >= 6 ? (i === 1 ? -26 : i === 2 ? 26 : 0) : 0));
      b.t.textContent = k >= 6 || (k === 5 && t > .5) ? b.lab[1] : b.lab[0];
      b.t.setAttribute("opacity", bo * (k === 7 ? 1 - local : 1));
    });
    interC.setAttribute("cx", clips[0].getAttribute("cx")); interC.setAttribute("cy", clips[0].getAttribute("cy"));
    interC.setAttribute("r", clips[0].getAttribute("r"));
    interC.setAttribute("opacity", k === 6 ? 1 : k === 5 ? t : k === 7 ? 1 - local * .3 : 0);

    // Capas: aparecen en el paso 4 y se resaltan de a una con el scroll
    const lo = A.lerp(k === 4 ? 1 : 0, k2 === 4 ? 1 : 0, t);
    layersG.setAttribute("opacity", lo);
    const act = k === 4 ? Math.min(4, Math.floor(local / .6 * 5)) : -1;
    planes.forEach((pl, i) => {
      const lift = i === act ? -18 : 0, spread = k === 4 ? 1 : A.lerp(.4, 1, lo);
      pl.gg.setAttribute("transform", `translate(640 ${330 + (pl.y0 - 330) * spread + lift})`);
      pl.poly.setAttribute("fill", i === act ? A.C.acento : "#fff");
      pl.poly.setAttribute("fill-opacity", i === act ? .95 : .72);
    });
    const lgList = document.getElementById("istep-capas");
    if (lgList) lgList.querySelectorAll("li").forEach((li, i) => li.classList.toggle("on", i === act));

    if (p > .97) A.store.set("introVista", true);
  }

  // Lista de capas en el texto del paso 4
  const ul = document.getElementById("istep-capas");
  if (ul) ul.innerHTML = GR.map(g => `<li><b>${g.nombre}</b><span>${g.cats.length} tema${g.cats.length > 1 ? "s" : ""}</span></li>`).join("");

  A.intro = {
    update() { render(A.progress(sec)); },
    done() { A.store.set("introVista", true); }
  };
  render(0);
})(window.ATLAS);
