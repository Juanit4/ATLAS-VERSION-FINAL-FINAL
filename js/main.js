/* =========================================================================
   ATLAS · ORQUESTADOR DEL PARQUE
   Columna izquierda: íconos de capas + tarjeta interactiva (lectura de
   izquierda a derecha). Derecha: el plano, con la información como
   señalética y un encuadre (zoom) propio para cada capa.
   ========================================================================= */
(function (A) {
  const chaptersEl = document.getElementById("chapters");
  const dock = document.getElementById("dock");
  const nameEl = document.getElementById("layer-name");
  const kickerEl = document.getElementById("park-kicker");
  const dotEl = document.getElementById("layer-dot");
  const park = A.park;

  /* ---------- Gestor de capas ---------- */
  let current = null, stops = [], listeners = [];
  const L = {
    fx: park.fx, under: park.fxUnder, overlay: park.overlay,
    on(el, ev, fn) { el.addEventListener(ev, fn); listeners.push([el, ev, fn]); },
    loop(fn) { const stop = A.loop(fn); stops.push(stop); return stop; },
    sign(x, y, text, color, o) { return A.sign(park.fx, x, y, text, color, o); },
    activate(id) {
      const layer = A.layers.find(l => l.id === id);
      if (!layer || layer === current) return;
      if (current && current.exit) current.exit(L);
      stops.forEach(f => f()); stops = [];
      listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn)); listeners = [];
      A.clear(park.fx); A.clear(park.fxUnder); A.clear(park.overlay);
      A.hideTip(park.tip);
      park.resetCrowd();
      current = layer;
      const idx = A.layers.indexOf(layer);
      nameEl.textContent = idx ? layer.nombre : "Parque Ferroviario Colegiales";
      kickerEl.textContent = idx ? `Capa ${String(idx).padStart(2, "0")}` : "Parque actual";
      dotEl.style.background = idx ? layer.color : A.C.acento;
      document.getElementById("park-stage").style.setProperty("--c", idx ? layer.color : A.C.acento);
      dock.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.id === id));
      chaptersEl.querySelectorAll(".chapter").forEach(c => c.classList.toggle("on", c.dataset.layer === id));
      // Sensores: solo los que hablan de esta capa
      park.showSensors(layer.sensores || []);
      // Encuadre propio de la capa (zoom in / zoom out)
      const v = layer.view || A.PARK_FULL;
      if (A.sm) park.cam.focus(v[0] + v[2] / 2, v[1] + v[3] / 2, Math.min(v[2], 640), 900);
      else park.cam.to(v, 900);
      layer.enter(L);
    }
  };
  A.layerManager = L;

  /* Capa del juego → categoría del archivo de evidencia */
  const CAPA_CAT = { parque:"contexto", seguridad:"seguridad", transito:"usos", personas:"poblacion", ruido:"ambiente",
    proyectos:"obras", eventos:"participacion", noticias:"antecedentes", voces:"voces", restricciones:"normas", censo:"poblacion" };
  A.CAPA_CAT = CAPA_CAT;

  /* ---------- Capítulos + íconos ---------- */
  A.layers.forEach((layer, i) => {
    const col = i ? layer.color : A.C.acento;
    const art = A.h("article", { class: "chapter", "data-layer": layer.id, style: `--c:${col}`, id: "capa-" + layer.id }, chaptersEl,
      `<p class="num"><i class="bullet"></i>${i ? String(i).padStart(2, "0") + " · " + layer.nombre : "Parque actual"}<span class="sug-note">sugerida para tu mirada</span></p>
       <h3>${layer.titulo}</h3><p class="lead">${layer.texto}</p><p class="how">${layer.how}</p>`);
    const cat = CAPA_CAT[layer.id];
    const toy = A.h("div", { class: "toy" }, art);
    layer.build(toy, L);
    if (cat) A.h("a", { class: "to-archivo", href: "#archivo/" + cat }, art, "Ver la evidencia de esta capa →");
    art.addEventListener("pointerdown", () => L.activate(layer.id));

    const b = A.h("button", { "data-id": layer.id, style: `--c:${col}`, "aria-label": layer.nombre }, dock,
      A.icon(layer.forma, col, i !== 0) + `<span>${i ? layer.nombre : "Parque actual"}</span>`);
    b.onclick = () => { L.activate(layer.id); art.scrollIntoView({ behavior: A.reduced ? "auto" : "smooth", block: A.sm ? "end" : "center" }); };
  });

  /* ---------- Activación por scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      if (e.target.classList.contains("step")) {
        e.target.parentElement.querySelectorAll(".step").forEach(s => s.classList.toggle("on", s === e.target));
      } else L.activate(e.target.dataset.layer);
    });
  }, { rootMargin: A.sm ? "-64% 0px -34% 0px" : "-45% 0px -45% 0px" });
  document.querySelectorAll(".step, .chapter").forEach(el => io.observe(el));
  L.activate("parque");

  /* ---------- Minimapa: volver a la ciudad ---------- */
  const mm = document.getElementById("minimap-svg");
  const BB = A.city.BB;
  mm.setAttribute("viewBox", `${BB.x - 10} ${BB.y - 10} ${BB.w + 20} ${BB.h + 20}`);
  A.s("path", { d: "M" + A.city.outline.map(q => q.map(v => v.toFixed(1)).join(" ")).join("L") + "Z", fill: "#fff", stroke: "#111", "stroke-width": 1.2, "vector-effect": "non-scaling-stroke" }, mm);
  A.D.espacios.forEach(e => {
    const [x, y] = A.project(e.lat, e.lon);
    const col = e.estado === "activo" ? A.C.acento : e.estado === "completado" ? A.C.publico : "#d2d2cd";
    A.s("circle", { cx: x, cy: y, r: e.estado === "pendiente" ? 10 : 22, fill: col, stroke: e.estado === "pendiente" ? "none" : "#111", "stroke-width": 1, "vector-effect": "non-scaling-stroke" }, mm);
  });
  document.getElementById("minimap").addEventListener("click", () => {
    const sec = document.getElementById("city");
    window.scrollTo({ top: sec.offsetTop + (sec.offsetHeight - innerHeight) * .62, behavior: A.reduced ? "auto" : "smooth" });
  });

  /* ---------- Bucle de scroll ---------- */
  const live = document.getElementById("live");
  const nav = document.getElementById("topnav");
  const SECS = ["city", "park", "participa", "compara"];
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      if (document.body.dataset.view === "recorrido") {
        A.city.update();
        live.classList.toggle("on", scrollY > innerHeight * .5);
        // Sección actual resaltada en la barra
        const y = innerHeight * .45;
        const cur = SECS.find(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.top <= y && r.bottom > y; });
        nav.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.scroll === cur));
      }
      ticking = false;
    });
  }
  A.recorridoRefresh = onScroll;

  /* Curaduría según la mirada: capas sugeridas para cada actor */
  const SUG = {
    ciudadanos: ["seguridad", "transito", "voces", "eventos"],
    publico:    ["seguridad", "voces", "restricciones", "proyectos"],
    privado:    ["censo", "proyectos", "restricciones", "transito"]
  };
  A.setMiradaRecorrido = function (perfil) {
    const list = SUG[perfil] || [];
    dock.querySelectorAll("button").forEach(b => b.classList.toggle("sug", list.includes(b.dataset.id)));
    chaptersEl.querySelectorAll(".chapter").forEach(c => c.classList.toggle("sug", list.includes(c.dataset.layer)));
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
})(window.ATLAS);
