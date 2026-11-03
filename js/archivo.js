/* =========================================================================
   ATLAS · ARCHIVO
   Consultar la evidencia del territorio:
   portada curada según la mirada → "para empezar" (3 fichas elegidas) →
   Fichas · Números · Relaciones · Oportunidades · Cómo se procesa · Fuentes
   + "Tu informe" en un panel lateral (lectura propia, exportable).
   ========================================================================= */
(function (A) {
  const s = A.s, h = A.h, I = window.ATLAS_INFORME, D = A.D;
  const wrap = document.querySelector(".archivo");
  const heroEl = document.getElementById("ar-hero");
  const startEl = document.getElementById("ar-start");
  const tabsEl = document.getElementById("ar-tabs");
  const main = document.getElementById("ar-main");
  const report = document.getElementById("ar-drawer");
  const fab = document.getElementById("ar-fab"), fabN = document.getElementById("ar-fab-n");
  const modal = document.getElementById("modal"), modalBody = document.getElementById("modal-body");

  const CATS = I.grupos.flatMap(g => g.cats.map(c => Object.assign({ grupo: g.nombre }, c)));
  const catById = id => CATS.find(c => c.id === id);
  const fuente = f => f.src ? I.fuentes[f.src] : f.fuenteTxt ? { fuente: f.fuenteTxt } : null;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const TABS = [
    ["biblioteca", "Fichas"], ["indicadores", "Números"], ["relaciones", "Relaciones"],
    ["matriz", "Oportunidades"], ["flujo", "Cómo se procesa"], ["documentos", "Fuentes"]
  ];
  /* Curaduría: por dónde empezar según la mirada */
  const EMPEZAR = {
    ciudadanos: ["f15", "f09", "f10"],
    publico:    ["f02", "f07", "f27"],
    privado:    ["f23", "f05", "f22"],
    libre:      ["f02", "f14", "f21"]
  };

  /* ---------- Estado ---------- */
  const st = {
    territorio: "colegiales", perfil: null, cats: new Set(), estado: "todos", origen: "todos",
    tab: "biblioteca", q: "", orden: "categoria", solo: false, open: null, temas: false
  };
  let inf = A.store.get("informe", { items: {}, lecturas: [] });
  const saveInf = () => { A.store.set("informe", inf); renderReport(); if (typeof renderDots === "function" && dotsData) renderDots(); };

  /* Registro de todo lo que se puede sumar al informe (fichas + indicadores + matriz) */
  const REG = {};
  I.fichas.forEach(f => REG[f.id] = { tipo: "Ficha", titulo: f.titulo, cat: f.cat, estado: f.estado, real: f.real, f });
  const regExtra = (id, titulo, real, cat) => REG[id] = { tipo: "Indicador", titulo, real, cat };
  I.matriz.items.forEach((it, i) => regExtra("m-" + i, "Oportunidad: " + it[0], false, "obras"));
  [["i-flujo", "Personas por hora", false, "usos"], ["i-seg", "Seguridad percibida por hora", false, "seguridad"],
   ["i-ruido", "Ruido por fuente", false, "ambiente"], ["i-sup", "¿Cuánto mide el parque?", true, "contexto"]].forEach(a => regExtra(...a));

  function applyPerfil(id) {
    st.perfil = id || null;
    const p = I.perfiles.find(x => x.id === id);
    st.cats = new Set(p ? p.sugeridas : CATS.map(c => c.id));
  }
  applyPerfil(null);

  const visibles = () => I.fichas.filter(f =>
    st.cats.has(f.cat) &&
    (st.estado === "todos" || f.estado === st.estado) &&
    (st.origen === "todos" || (st.origen === "real") === f.real) &&
    (!st.solo || inf.items[f.id]) &&
    (!st.q || (f.titulo + " " + f.texto + " " + f.relacion).toLowerCase().includes(st.q.toLowerCase()))
  );

  /* =====================================================================
     PORTADA
     ===================================================================== */
  function renderHero() {
    const terr = D.espacios.find(e => e.id === st.territorio), act = terr.estado === "activo";
    const real = I.fichas.filter(f => f.real).length, contra = I.fichas.filter(f => f.estado === "contradictorio").length;
    const rev = I.fichas.filter(f => f.estado === "revision").length;
    heroEl.innerHTML = `
      <p class="kicker ar-k">Evidencia · ${terr.nombre} · Comuna ${terr.comuna}</p>
      <h2 class="ar-title">${act ? "Lo que sabemos del parque,<br>de dónde lo sabemos<br><span>y qué falta saber.</span>" : terr.estado === "completado" ? `${terr.nombre}<br><span>se leyó para comparar.</span>` : `${terr.nombre}<br><span>todavía no tiene lectura.</span>`}</h2>
      <div class="ar-mirada"><span class="muted">Leyendo como</span>
        ${I.perfiles.map(p => `<button class="mpill${st.perfil === p.id ? " on" : ""}" style="--c:${p.color}" data-perfil="${p.id}"><i></i>${p.nombre}</button>`).join("")}
        <button class="mpill${st.perfil ? "" : " on"}" style="--c:#111" data-perfil=""><i></i>Mirada libre</button>
      </div>
      ${act ? `<div class="ar-stats">
        <button data-stat="todos"><b>${I.fichas.length}</b><span>fichas</span></button>
        <button data-stat="real"><b>${real}</b><span>con fuente verificada</span></button>
        <button data-stat="contradictorio"><b>${contra}</b><span>${contra === 1 ? "dato que se contradice" : "datos que se contradicen"}</span></button>
        <button data-stat="revision"><b>${rev}</b><span>en revisión</span></button>
      </div>` : ""}
      <div class="ar-meta">
        <label>Territorio <select id="f-terr">${D.espacios.map(e => `<option value="${e.id}"${e.id === st.territorio ? " selected" : ""}>${e.nombre}${e.estado === "activo" ? " · parque actual" : e.estado === "completado" ? " · completado (comparación)" : " · sin relevar"}</option>`).join("")}</select></label>
        <button class="linkbtn" data-how>¿Cómo funciona?</button> <button class="linkbtn" data-guia>Ver la guía</button>
      </div>`;
    heroEl.querySelector("#f-terr").onchange = e => { st.territorio = e.target.value; refresh(); };
    heroEl.querySelectorAll("[data-perfil]").forEach(b => b.onclick = () => {
      applyPerfil(b.dataset.perfil);
      const m = A.store.get("mirada", {}) || {}; m.perfil = st.perfil; A.store.set("mirada", m); A.updateMirada && A.updateMirada();
      refresh();
    });
    heroEl.querySelectorAll("[data-stat]").forEach(b => b.onclick = () => {
      const k = b.dataset.stat;
      st.tab = "biblioteca"; st.q = ""; st.solo = false;
      st.estado = ["contradictorio", "revision"].includes(k) ? k : "todos";
      st.origen = k === "real" ? "real" : "todos";
      if (k !== "todos" || true) st.cats = new Set(CATS.map(c => c.id));
      refresh(); tabsEl.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* Recorrido de línea blanca con dos puntos (como las teselas del moodboard) */
  function route(seed) {
    let n = [...seed].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
    const r = () => ((n = (n * 9301 + 49297) % 233280) / 233280);
    let x = 10 + r() * 20, y = 60 - r() * 20, d = `M${x.toFixed(0)} ${y.toFixed(0)}`, pts = [[x, y]];
    for (let k = 0; k < 5; k++) { if (k % 2) y = A.clamp(y + (r() - .5) * 50, 8, 64); else x = A.clamp(x + 10 + r() * 22, 8, 104); d += `L${x.toFixed(0)} ${y.toFixed(0)}`; pts.push([x, y]); }
    const [a0, b0] = pts[0], [a1, b1] = pts[pts.length - 1];
    return `<svg class="route" viewBox="0 0 112 72" aria-hidden="true"><path d="${d}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${a0}" cy="${b0}" r="4" fill="#fff"/><circle cx="${a1}" cy="${b1}" r="4" fill="#fff"/></svg>`;
  }

  function renderStart() {
    const terr = D.espacios.find(e => e.id === st.territorio);
    if (terr.estado !== "activo") { startEl.innerHTML = ""; return; }
    const p = I.perfiles.find(x => x.id === st.perfil);
    const ids = EMPEZAR[st.perfil || "libre"];
    startEl.innerHTML = `<p class="kicker">Para empezar${p ? `, <span class="hl" style="--c:${p.color}">desde tu mirada</span>` : ""}</p>
      <div class="ar-cards">${ids.map((id, i) => {
        const f = I.fichas.find(x => x.id === id), e = I.estados[f.estado], c = catById(f.cat), fu = fuente(f);
        const bg = ["#9b6cff", "#08b8f8", "#00e887"][i];
        return `<button class="ar-card" data-open="${id}" style="--c:${e.color};--tile:${bg};--d:${i * .12 + .35}s">${route(id)}
          <span class="ar-card-cat">${A.icon(c.forma, "#77776f", false)} ${c.nombre}</span>
          <b>${f.titulo}</b>
          <span class="ar-card-why">${f.relacion}</span>
          <span class="ar-card-meta"><i></i>${e.nombre} · ${fu ? fu.fuente : "ejemplo"}</span>
          <span class="ar-card-go">Abrir ficha →</span></button>`;
      }).join("")}</div>`;
    startEl.querySelectorAll("[data-open]").forEach(b => b.onclick = () => openFicha(b.dataset.open));
  }

  /* =====================================================================
     LA EVIDENCIA EN CÍRCULOS (scroll): fichas → por estado → tu informe
     ===================================================================== */
  const dotsEl = document.getElementById("ar-dots");
  let dotsData = null;
  function renderDots() {
    const terr = D.espacios.find(e => e.id === st.territorio);
    if (terr.estado !== "activo") { dotsEl.innerHTML = ""; dotsData = null; return; }
    const F = I.fichas, real = F.filter(f => f.real).length;
    const enInf = F.filter(f => inf.items[f.id]).length;
    dotsEl.innerHTML = `<div class="ar-dots-stage">
      <div class="ar-dots-txt">
        <div class="adt"><p class="kicker">La evidencia, en círculos</p><h3>${F.length} fichas</h3><p>Cada círculo es un dato del parque. Los llenos tienen fuente verificada (${real}); los vacíos son de ejemplo (${F.length - real}).</p></div>
        <div class="adt"><p class="kicker">Por estado</p><h3>No todo está igual de firme</h3><p>Se ordenan según su estado: validados, en revisión, contradictorios y desactualizados.</p></div>
        <div class="adt"><p class="kicker">Tu informe</p><h3>${enInf ? `${enInf} en tu informe` : "Tu informe está vacío"}</h3><p>${enInf ? "Los amarillos son los que elegiste. Tocá cualquiera para abrirlo." : "Dale prioridad a una ficha y aparece acá en amarillo."}</p>
          <button class="btn small" data-open-inf>Abrir tu informe</button></div>
      </div>
      <svg class="ar-dots-svg" viewBox="0 0 600 420" aria-hidden="true"></svg></div>`;
    const sv = dotsEl.querySelector("svg");
    const est = Object.keys(I.estados);
    const lbls = est.map((k, i) => s("text", { x: 75 + i * 150, y: 380, "text-anchor": "middle", "font-size": 13, "font-family": "Inter Tight", fill: "#111", opacity: 0 }, sv,
      `${I.estados[k].nombre} · ${F.filter(f => f.estado === k).length}`));
    let sd = 5; const r = () => ((sd = (sd * 9301 + 49297) % 233280) / 233280);
    const items = F.map((f, i) => {
      const g = s("g", { style: "cursor:pointer" }, sv);
      const c = s("circle", { r: 13 }, g);
      s("title", {}, g, f.titulo);
      g.onclick = () => openFicha(f.id);
      // posiciones
      const A0 = [40 + r() * 520, 30 + r() * 320];
      const ei = est.indexOf(f.estado), j = F.filter((x, k) => k < i && x.estado === f.estado).length;
      const a = j * 2.4, rr = 17 * Math.sqrt(j);
      const B0 = [75 + ei * 150 + Math.cos(a) * rr, 200 + Math.sin(a) * rr];
      const C0 = [60 + (i % 8) * 68, 70 + Math.floor(i / 8) * 68];
      return { f, g, c, A0, B0, C0 };
    });
    dotsData = { items, lbls };
    dotsEl.querySelector("[data-open-inf]").onclick = openDrawer;
    updateDots();
  }
  function updateDots() {
    if (!dotsData) return;
    const p = A.progress(dotsEl), f = A.clamp(p * 3, 0, 2.999), k = Math.floor(f), t = A.ease(A.seg(f - k, .55, 1));
    dotsEl.querySelectorAll(".adt").forEach((el, i) => el.classList.toggle("on", i === k));
    const P = [it => it.A0, it => it.B0, it => it.C0];
    dotsData.items.forEach(it => {
      const a = P[k](it), b = P[Math.min(2, k + 1)](it);
      it.g.setAttribute("transform", `translate(${A.lerp(a[0], b[0], t).toFixed(1)} ${A.lerp(a[1], b[1], t).toFixed(1)})`);
      const inI = !!inf.items[it.f.id], ec = I.estados[it.f.estado].color;
      const fillAt = st => st === 0 ? (it.f.real ? "#111" : "#fff") : st === 1 ? ec : (inI ? A.C.acento : "#e6e6e2");
      const kk = t > .5 ? Math.min(2, k + 1) : k;
      it.c.setAttribute("fill", fillAt(kk));
      it.c.setAttribute("stroke", kk === 2 && inI ? "#111" : kk === 0 ? "#111" : "none");
      it.c.setAttribute("stroke-width", 1.5);
      it.c.setAttribute("r", kk === 2 && inI ? 17 : 13);
    });
    const lo = k === 0 ? t : k === 1 ? 1 - t : 0;
    dotsData.lbls.forEach(l => l.setAttribute("opacity", lo));
  }
  addEventListener("scroll", () => { if (document.body.dataset.view === "archivo") requestAnimationFrame(updateDots); }, { passive: true });

  function renderTabs() {
    const terr = D.espacios.find(e => e.id === st.territorio);
    tabsEl.style.display = terr.estado === "activo" ? "" : "none";
    tabsEl.innerHTML = TABS.map(([id, n]) => `<button class="tab${st.tab === id ? " on" : ""}" data-tab="${id}" aria-current="${st.tab === id}">${n}</button>`).join("");
    tabsEl.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => {
      st.tab = b.dataset.tab; renderTabs(); renderMain();
      if (tabsEl.getBoundingClientRect().top < 0 || tabsEl.getBoundingClientRect().top > 120) tabsEl.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* Filtros que viven dentro de "Fichas" (no estorban en las demás secciones) */
  function filtrosHTML() {
    const p = I.perfiles.find(x => x.id === st.perfil);
    return `<div class="ar-filters">
      <div class="chips">${[["todos", "Todas"], ["real", "Con fuente"], ["ejemplo", "Ejemplo"]]
        .map(([k, n]) => `<button class="chip${st.origen === k ? " on" : ""}" data-origen="${k}">${n}</button>`).join("")}</div>
      <button class="chip temas-toggle${st.temas ? " on" : ""}" data-temas>Temas · ${st.cats.size} de ${CATS.length} ${st.temas ? "▴" : "▾"}</button>
    </div>
    ${st.temas ? `<div class="ar-temas">
      <div class="lrow small"><span class="muted">${p ? `Los marcados con • son los sugeridos para ${p.nombre.toLowerCase()}.` : "Elegí los temas que te interesan."}</span>
        <span><button class="linkbtn" data-allcats>Todos</button> · <button class="linkbtn" data-nocats>Ninguno</button></span></div>
      ${I.grupos.map(g => `<div class="tg"><p class="lsub">${g.nombre}</p><div class="chips">${g.cats.map(c =>
        `<button class="chip${st.cats.has(c.id) ? " on" : ""}" style="--c:${p ? p.color : "#111"}" data-cat="${c.id}">${p && p.sugeridas.includes(c.id) ? "• " : ""}${c.nombre}</button>`).join("")}</div></div>`).join("")}
    </div>` : ""}`;
  }
  function bindFiltros(tp) {
    tp.querySelectorAll("[data-origen]").forEach(b => b.onclick = () => { st.origen = b.dataset.origen; renderMain(); });
    tp.querySelector("[data-temas]").onclick = () => { st.temas = !st.temas; renderMain(); };
    tp.querySelectorAll("[data-cat]").forEach(b => b.onclick = () => { const c = b.dataset.cat; st.cats.has(c) ? st.cats.delete(c) : st.cats.add(c); renderMain(); });
    const all = tp.querySelector("[data-allcats]"); if (all) all.onclick = () => { st.cats = new Set(CATS.map(c => c.id)); renderMain(); };
    const none = tp.querySelector("[data-nocats]"); if (none) none.onclick = () => { st.cats.clear(); renderMain(); };
  }

  /* =====================================================================
     CONTENIDO
     ===================================================================== */
  let stopTab = null;
  function renderMain() {
    if (stopTab) { stopTab(); stopTab = null; }
    const terr = D.espacios.find(e => e.id === st.territorio);
    if (terr.estado === "completado") {
      main.innerHTML = `<div class="lcard empty">
        <p>${terr.nombre} tiene una lectura completada solo de sus capas sociales: circulación, quiénes van y qué piden. Se usa para comparar con el parque actual.</p>
        <div class="row" style="max-width:460px"><a class="btn" href="#recorrido/compara">Ver la comparación →</a><button class="btn ghost" id="back-col">Volver a Colegiales</button></div></div>`;
      main.querySelector("#back-col").onclick = () => { st.territorio = "colegiales"; refresh(); };
      return;
    }
    if (terr.estado !== "activo") {
      const votos = (A.store.get("votos", {})[terr.id] || 0);
      main.innerHTML = `<div class="lcard empty">
        <p>Cuando haya fuentes, voces y evidencias de ${terr.nombre}, vas a poder consultarlas acá. Mientras tanto, podés votar para que sea el próximo territorio relevado.</p>
        <p class="mono small">${votos} votos</p>
        <div class="row" style="max-width:440px"><button class="btn" id="vote">Votar este territorio</button><button class="btn ghost" id="back-col">Volver a Colegiales</button></div></div>`;
      main.querySelector("#vote").onclick = () => { const v = A.store.get("votos", {}); v[terr.id] = (v[terr.id] || 0) + 1; A.store.set("votos", v); renderMain(); };
      main.querySelector("#back-col").onclick = () => { st.territorio = "colegiales"; refresh(); };
      return;
    }
    main.innerHTML = `<div class="tabpanel" id="tabpanel"></div>`;
    const tp = main.querySelector("#tabpanel");
    ({ biblioteca, indicadores, relaciones, matriz, flujo, documentos })[st.tab](tp);
  }

  /* ---------------- BIBLIOTECA ---------------- */
  function biblioteca(tp) {
    const list = visibles();
    // Barra de evidencia (toy): proporción por estado, clic para filtrar
    const base = I.fichas.filter(f => st.cats.has(f.cat));
    const counts = Object.keys(I.estados).map(k => [k, base.filter(f => f.estado === k).length]);
    tp.innerHTML = `
      <div class="lcard">
        <p class="kicker">Fichas</p>
        <h3>Cada dato, con su fuente y su estado</h3>
        <p class="small muted">Desplegá una ficha para ver qué relación aparece y qué falta saber. Dale prioridad para sumarla a tu informe.</p>
        <div class="evbar" role="group" aria-label="Estado de la evidencia">${counts.filter(c => c[1]).map(([k, n]) =>
          `<button style="flex:${n};--c:${I.estados[k].color}" class="${st.estado === k ? "on" : ""}" data-ev="${k}" title="${I.estados[k].nombre}: ${n}"><span>${I.estados[k].nombre} · ${n}</span></button>`).join("")}</div>
        <div class="row lib-tools">
          <input type="search" id="q" placeholder="Buscar en las fichas…" value="${esc(st.q)}" aria-label="Buscar">
          <select id="orden" aria-label="Ordenar"><option value="categoria">Por categoría</option><option value="estado">Por estado</option><option value="real">Con fuente primero</option></select>
          <label class="small check"><input type="checkbox" id="solo"${st.solo ? " checked" : ""}> Sólo agregadas</label>
        </div>
        ${filtrosHTML()}
        <p class="small muted">${list.length} ficha${list.length === 1 ? "" : "s"}</p>
      </div>
      <div id="lib"></div>`;
    tp.querySelector("#orden").value = st.orden;
    bindFiltros(tp);
    tp.querySelectorAll("[data-ev]").forEach(b => b.onclick = () => { st.estado = st.estado === b.dataset.ev ? "todos" : b.dataset.ev; refresh(); });
    const q = tp.querySelector("#q");
    q.oninput = () => { st.q = q.value; clearTimeout(q._t); q._t = setTimeout(() => { renderMain(); const n = main.querySelector("#q"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
    tp.querySelector("#orden").onchange = e => { st.orden = e.target.value; renderMain(); };
    tp.querySelector("#solo").onchange = e => { st.solo = e.target.checked; renderMain(); };

    const lib = tp.querySelector("#lib");
    if (!list.length) { lib.innerHTML = `<div class="lcard"><p>No hay fichas con estos filtros. Probá sumar temas o quitar filtros.</p></div>`; return; }
    let groups;
    if (st.orden === "categoria") groups = CATS.filter(c => st.cats.has(c.id)).map(c => [c.nombre, c.forma, list.filter(f => f.cat === c.id), c.id]).filter(g => g[2].length);
    else if (st.orden === "estado") groups = Object.entries(I.estados).map(([k, v]) => [v.nombre, "circulo", list.filter(f => f.estado === k), k]).filter(g => g[2].length);
    else groups = [["Con fuente verificada", "cuadrado", list.filter(f => f.real), "r"], ["Ejemplo / simulado", "circulo", list.filter(f => !f.real), "e"]].filter(g => g[2].length);

    groups.forEach(([nombre, forma, fichas, gid]) => {
      const sec = h("section", { class: "lgroup", id: "grupo-" + gid }, lib,
        `<header>${A.icon(forma, "#111", false)}<b>${nombre}</b><span class="mono small">${fichas.length} registro${fichas.length > 1 ? "s" : ""}</span></header>`);
      fichas.forEach(f => sec.appendChild(fichaEl(f)));
    });
  }

  function fichaEl(f) {
    const e = I.estados[f.estado], fu = fuente(f), pr = inf.items[f.id];
    const d = h("details", { class: "ficha" + (pr ? " added" : ""), id: "ficha-" + f.id });
    if (st.open === f.id) d.open = true;
    const tens = f.tension ? I.fichas.find(x => x.id === f.tension) : null;
    d.innerHTML = `<summary><span class="estado" style="--c:${e.color}" title="${e.nombre}"></span>
        <span class="ft">${f.titulo}<small>${fu ? fu.fuente : "sin fuente · ejemplo"} · ${e.nombre}</small></span>
        ${A.tag(f.real)}${pr ? `<span class="pill">en informe · ${pr}</span>` : ""}</summary>
      <div class="fbody">
        <p>${f.texto}</p>
        <div class="fcols">
          <div><p class="lsub">Qué relación aparece</p><p>${f.relacion}</p></div>
          <div><p class="lsub">Qué todavía falta saber</p><p>${f.falta}</p></div>
        </div>
        ${tens ? `<p class="tension">⚡ En tensión con: <button class="linkbtn" data-open="${tens.id}">${tens.titulo}</button></p>` : ""}
        ${fu ? `<p class="small muted">Fuente: ${fu.url ? `<a href="${fu.url}" target="_blank" rel="noopener">${fu.fuente} ↗</a>` : fu.fuente}</p>` : ""}
        <div class="factions">
          <span class="lsub" style="margin:0">Prioridad para tu lectura</span>
          <div class="chips">${["Alta", "Media", "Baja"].map(p => `<button class="chip${pr === p ? " on" : ""}" style="--c:#f8e544" data-pr="${p}">${p}</button>`).join("")}
            ${pr ? `<button class="chip" data-pr="">Quitar</button>` : ""}</div>
          ${f.capa ? `<a class="to-recorrido" href="#recorrido/capa-${f.capa}" data-cut="#f8e544">${A.icon("circulo", "#f8e544")} Verlo en el recorrido →</a>` : ""}
        </div>
      </div>`;
    d.addEventListener("toggle", () => { if (d.open) st.open = f.id; });
    d.querySelectorAll("[data-pr]").forEach(b => b.onclick = () => {
      if (b.dataset.pr) inf.items[f.id] = b.dataset.pr; else delete inf.items[f.id];
      st.open = f.id; saveInf(); renderMain();
    });
    d.querySelectorAll("[data-open]").forEach(b => b.onclick = () => openFicha(b.dataset.open));
    return d;
  }

  function openFicha(id) {
    const f = I.fichas.find(x => x.id === id); if (!f) return;
    st.cats.add(f.cat); st.estado = "todos"; st.origen = "todos"; st.q = ""; st.solo = false;
    st.tab = "biblioteca"; st.open = id; st.orden = "categoria";
    refresh();
    requestAnimationFrame(() => { const el = document.getElementById("ficha-" + id); if (el) { el.scrollIntoView({ block: "center", behavior: "smooth" }); el.classList.add("flash"); } });
  }

  /* ---------------- INDICADORES ---------------- */
  function indicadores(tp) {
    const C = D.capas;
    tp.innerHTML = `<div class="lcard"><p class="kicker">Números</p><h3>Los números del territorio</h3>
      <p class="small muted">Pasá el cursor o arrastrá sobre los gráficos. Sumá al informe los que uses en tu lectura.</p>
      <div class="kpis">${D.parque.datos.map(d => `<div class="kpi"><b>${d.valor}</b><span>${d.label}</span><small>${d.fuente}</small></div>`).join("")}
        <div class="kpi"><b>${A.fmt(C.censo.poblacionComuna.valor)}</b><span>${C.censo.poblacionComuna.label}</span><small>${C.censo.poblacionComuna.fuente} · desactualizado</small></div>
        <div class="kpi"><b>USD ${A.fmt(C.censo.m2Usado.valor)}</b><span>${C.censo.m2Usado.label}</span><small>${C.censo.m2Usado.fuente}</small></div></div></div>
      <div class="ind-grid" id="ind"></div>`;
    const grid = tp.querySelector("#ind");

    const card = (id, titulo, real, cat, bajada) => {
      regExtra(id, titulo, real, cat);
      const c = h("div", { class: "lcard ind" }, grid, `<div class="lrow"><b>${titulo}</b>${A.tag(real)}</div><p class="small muted">${bajada}</p><div class="ind-body"></div>
        <button class="chip addind${inf.items[id] ? " on" : ""}" style="--c:#f8e544">${inf.items[id] ? "✓ En el informe" : "+ Sumar al informe"}</button>`);
      c.querySelector(".addind").onclick = () => { inf.items[id] ? delete inf.items[id] : inf.items[id] = "Media"; saveInf(); renderMain(); };
      return c.querySelector(".ind-body");
    };

    // 1. Flujo por hora (barras, semana/finde)
    let modo = "semana";
    const b1 = card("i-flujo", "Personas por hora", false, "usos", "Conteo simulado de personas en el parque.");
    const ch = h("div", { class: "chips" }, b1, `<button class="chip on" style="--c:#08b8f8" data-m="semana">Lunes a viernes</button><button class="chip" style="--c:#08b8f8" data-m="finde">Fin de semana</button>`);
    const bars = h("div", { class: "bars", style: "--c:#08b8f8;height:110px" }, b1);
    h("div", { class: "bars-axis" }, b1, "<span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>");
    const out1 = h("div", { class: "readout" }, b1);
    const draw1 = (sel) => {
      const arr = C.transito[modo], max = Math.max(...arr);
      bars.innerHTML = arr.map((v, i) => `<i style="height:${v / max * 100}%" class="${i === sel ? "on" : ""}" data-h="${i}"></i>`).join("");
      const i = sel ?? arr.indexOf(max);
      out1.innerHTML = `<b>${arr[i]}</b> personas a las ${String(i).padStart(2, "0")}:00 ${sel == null ? "(pico)" : ""}`;
      bars.querySelectorAll("i").forEach(b => b.onmouseenter = () => draw1(+b.dataset.h));
    };
    ch.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { modo = b.dataset.m; ch.querySelectorAll(".chip").forEach(x => x.classList.toggle("on", x === b)); draw1(); });
    draw1();

    // 2. Seguridad percibida: línea con cursor arrastrable
    const b2 = card("i-seg", "Seguridad percibida por hora", false, "seguridad", "Índice 0–100. Arrastrá el cursor por el día.");
    const sv = s("svg", { viewBox: "0 0 320 150", class: "dial" }, b2);
    const arr = C.seguridad.porHora, X = i => 14 + i * 12.6, Y = v => 130 - v * 1.15;
    s("path", { d: "M" + arr.map((v, i) => `${X(i)} ${Y(v)}`).join("L") + `L${X(23)} 130L${X(0)} 130Z`, fill: "#f8e54418" }, sv);
    s("path", { d: "M" + arr.map((v, i) => `${X(i)} ${Y(v)}`).join("L"), fill: "none", stroke: "#f8e544", "stroke-width": 2 }, sv);
    [0, 6, 12, 18, 23].forEach(i => s("text", { x: X(i), y: 145, "text-anchor": "middle", fill: "#77776f", "font-size": 9, "font-family": "Inter Tight" }, sv, String(i).padStart(2, "0")));
    const cur = s("line", { y1: 10, y2: 130, stroke: "#111", "stroke-dasharray": "3 3" }, sv);
    const dot = s("circle", { r: 5, fill: "#111" }, sv);
    const lbl = s("text", { "text-anchor": "middle", fill: "#111", "font-size": 12, "font-family": "Inter Tight", "font-weight": 600 }, sv);
    const setH = i => { i = A.clamp(Math.round(i), 0, 23); cur.setAttribute("x1", X(i)); cur.setAttribute("x2", X(i)); dot.setAttribute("cx", X(i)); dot.setAttribute("cy", Y(arr[i])); lbl.setAttribute("x", A.clamp(X(i), 30, 290)); lbl.setAttribute("y", Y(arr[i]) - 10); lbl.textContent = `${String(i).padStart(2, "0")} h · ${arr[i]}`; };
    const mv = ev => setH((A.svgPoint(sv, ev).x - 14) / 12.6);
    sv.addEventListener("pointerdown", ev => { sv.setPointerCapture(ev.pointerId); mv(ev); });
    sv.addEventListener("pointermove", ev => { if (sv.hasPointerCapture(ev.pointerId) || ev.pointerType === "mouse") mv(ev); });
    setH(new Date().getHours());

    // 3. Ruido por fuente
    const b3 = card("i-ruido", "Ruido por fuente", false, "ambiente", "Decibeles estimados por sensor.");
    b3.innerHTML = [...C.ruido.fuentes].sort((a, b) => b.db - a.db).map(f => `<div class="hbar"><span>${f.nombre}</span><div class="meter" style="--c:#ff5a4e"><i style="width:${(f.db - 30) / 70 * 100}%"></i></div><b class="mono">${f.db} dB</b></div>`).join("");

    // 4. Superficie según la fuente (contradicción visible)
    const b4 = card("i-sup", "¿Cuánto mide el parque?", true, "contexto", "Tres fuentes, tres recortes distintos. Tocá cada cuadrado.");
    const sup = [["Predio total (Perfil 2021)", 87582, "#cfcfca"], ["Espacio público (La Nación: 3 ha)", 30000, "#08b8f8"], ["Verde (La Nación)", 19000, "#00e887"], ["Relevado ATLAS", 14200, "#f8e544"]];
    const sv4 = s("svg", { viewBox: "0 0 320 170" }, b4);
    const o4 = h("div", { class: "readout" }, b4, "Tocá un cuadrado.");
    sup.forEach(([n, v, c], i) => {
      const side = Math.sqrt(v / 87582) * 160;
      const r = s("rect", { x: 4, y: 166 - side, width: side, height: side, fill: c, "fill-opacity": i ? .55 : .15, stroke: c, style: "cursor:pointer" }, sv4);
      r.onclick = r.onmouseenter = () => o4.innerHTML = `<b>${A.fmt(v)} m²</b> · ${n}`;
    });
    s("text", { x: 200, y: 40, fill: "#77776f", "font-size": 10, "font-family": "Inter Tight" }, sv4, "estado: contradictorio");
    const lk = h("button", { class: "linkbtn small" }, b4, "Ver la ficha →"); lk.onclick = () => openFicha("f02");
  }

  /* ---------------- RELACIONES (red interactiva) ---------------- */
  function relaciones(tp) {
    tp.innerHTML = `<div class="lcard"><p class="kicker">Relaciones</p><h3>Mapa de red: actores, temas y evidencias</h3>
      <p class="small muted">Arrastrá los nodos. Tocá uno para ver con qué se conecta. Las líneas rojas son tensiones entre fichas.</p>
      <div class="chips"><button class="chip" data-net="reset">Reordenar</button><button class="chip" data-net="labels">Etiquetas: sí</button></div>
      <div class="net-wrap"><svg id="net" viewBox="0 0 900 560"></svg></div>
      <div id="net-info" class="net-info small muted">Tocá un nodo.</div></div>`;
    const svg = tp.querySelector("#net"), info = tp.querySelector("#net-info");
    const p = I.perfiles;
    const fichas = visibles(), cats = CATS.filter(c => st.cats.has(c.id) && fichas.some(f => f.cat === c.id));
    const N = [], E = [];
    const add = n => { n.x = 450 + A.rand(-200, 200); n.y = 280 + A.rand(-150, 150); n.vx = n.vy = 0; N.push(n); return n; };
    const actorN = p.map((a, i) => add({ id: a.id, kind: "actor", label: a.nombre, r: 30, color: a.color, fx: 150 + i * 300, fy: 60 }));
    actorN.forEach(n => { n.x = n.fx; n.y = n.fy; });
    const catN = cats.map(c => add({ id: c.id, kind: "cat", label: c.nombre, r: 16, color: "#111", forma: c.forma }));
    const fN = fichas.map(f => add({ id: f.id, kind: "ficha", label: f.titulo, r: 6, color: I.estados[f.estado].color, f }));
    const byId = id => N.find(n => n.id === id);
    fN.forEach(n => { const c = byId(n.f.cat); if (c) E.push({ a: n, b: c, len: 50 }); });
    catN.forEach(c => p.forEach(a => { if (a.sugeridas.includes(c.id)) E.push({ a: c, b: byId(a.id), len: 170, weak: true }); }));
    fN.forEach(n => { if (n.f.tension) { const o = byId(n.f.tension); if (o && n.id < o.id) E.push({ a: n, b: o, len: 90, tension: true }); } });

    const gE = s("g", {}, svg), gN = s("g", {}, svg);
    E.forEach(e => e.el = s("line", { stroke: e.tension ? "#ff5a4e" : e.weak ? e.b.color : "#cfcfca", "stroke-opacity": e.weak ? .25 : .6, "stroke-width": e.tension ? 2 : 1, "stroke-dasharray": e.tension ? "5 4" : "none" }, gE));
    let labels = true, sel = null;
    N.forEach(n => {
      n.g = s("g", { style: "cursor:pointer;touch-action:none" }, gN);
      if (n.kind === "cat") s("path", { d: A.shape(n.forma, 0, 0, n.r), fill: "#fff", stroke: "#111", "stroke-width": 1.5 }, n.g);
      else s("circle", { r: n.r, fill: n.color, "fill-opacity": n.kind === "actor" ? .9 : 1 }, n.g);
      n.t = s("text", { y: n.kind === "actor" ? 4 : n.r + 12, "text-anchor": "middle", fill: n.kind === "actor" ? "#111" : "#77776f", "font-size": n.kind === "actor" ? 11 : n.kind === "cat" ? 10 : 8, "font-weight": n.kind === "actor" ? 700 : 400, "font-family": n.kind === "ficha" ? "Inter Tight" : "Inter Tight", style: "pointer-events:none" }, n.g,
        n.kind === "ficha" ? "" : n.label);
      let drag = false, moved = 0;
      n.g.addEventListener("pointerdown", ev => { drag = true; moved = 0; n.g.setPointerCapture(ev.pointerId); n.pin = true; });
      n.g.addEventListener("pointermove", ev => { if (!drag) return; const q = A.svgPoint(svg, ev); moved += Math.abs(q.x - n.x) + Math.abs(q.y - n.y); n.x = q.x; n.y = q.y; n.vx = n.vy = 0; heat = 1; });
      n.g.addEventListener("pointerup", () => { drag = false; if (moved < 6) select(n); });
    });
    function select(n) {
      sel = sel === n ? null : n;
      const nb = new Set(sel ? [sel] : []);
      if (sel) E.forEach(e => { if (e.a === sel) nb.add(e.b); if (e.b === sel) nb.add(e.a); });
      N.forEach(m => m.g.style.opacity = !sel || nb.has(m) ? 1 : .15);
      E.forEach(e => e.el.style.opacity = !sel || e.a === sel || e.b === sel ? 1 : .08);
      fN.forEach(m => m.t.textContent = sel && nb.has(m) && m !== sel ? m.label.slice(0, 34) + (m.label.length > 34 ? "…" : "") : (m === sel ? m.label.slice(0, 40) : ""));
      if (!sel) { info.innerHTML = "Tocá un nodo."; return; }
      const near = [...nb].filter(m => m !== sel);
      if (sel.kind === "ficha") info.innerHTML = `<b>${sel.label}</b> ${A.tag(sel.f.real)} · ${I.estados[sel.f.estado].nombre}<br>${sel.f.relacion} <button class="linkbtn" data-open="${sel.id}">Abrir ficha →</button>`;
      else info.innerHTML = `<b>${sel.label}</b> se conecta con ${near.length} nodos: ` + near.slice(0, 12).map(m => m.kind === "ficha" ? `<button class="linkbtn" data-open="${m.id}">${m.label}</button>` : `<span>${m.label}</span>`).join(" · ");
      info.querySelectorAll("[data-open]").forEach(b => b.onclick = () => openFicha(b.dataset.open));
    }
    tp.querySelector('[data-net="reset"]').onclick = () => { N.forEach(n => { if (n.kind !== "actor") { n.x = 450 + A.rand(-200, 200); n.y = 300 + A.rand(-150, 150); n.pin = false; } }); heat = 1; };
    tp.querySelector('[data-net="labels"]').onclick = (e) => { labels = !labels; e.target.textContent = "Etiquetas: " + (labels ? "sí" : "no"); catN.forEach(n => n.t.style.display = labels ? "" : "none"); };

    let heat = 1;
    stopTab = A.loop(dt => {
      if (heat < .02) return;
      for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
        const a = N[i], b = N[j]; let dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy + .01, d = Math.sqrt(d2);
        const f = 900 * (a.r + b.r) / d2; dx /= d; dy /= d;
        a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f;
      }
      E.forEach(e => { const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, d = Math.hypot(dx, dy) || 1, k = (d - e.len) * (e.weak ? .004 : .03); e.a.vx += dx / d * k * 10; e.a.vy += dy / d * k * 10; e.b.vx -= dx / d * k * 10; e.b.vy -= dy / d * k * 10; });
      N.forEach(n => {
        if (n.kind === "actor") { n.vx += (n.fx - n.x) * .2; n.vy += (n.fy - n.y) * .2; }
        n.vy += (330 - n.y) * .004; n.vx += (450 - n.x) * .002;
        n.vx *= .82; n.vy *= .82;
        n.x = A.clamp(n.x + n.vx * dt * 6 * heat, 20, 880); n.y = A.clamp(n.y + n.vy * dt * 6 * heat, 20, 540);
        n.g.setAttribute("transform", `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`);
      });
      E.forEach(e => { e.el.setAttribute("x1", e.a.x); e.el.setAttribute("y1", e.a.y); e.el.setAttribute("x2", e.b.x); e.el.setAttribute("y2", e.b.y); });
      heat *= .996;
    });
  }

  /* ---------------- MATRIZ DE OPORTUNIDADES ---------------- */
  function matriz(tp) {
    const M = I.matriz, A3 = { u: ["Ciudadanos", "#9b6cff"], p: ["Sector público", "#00e887"], v: ["Sector privado", "#08b8f8"] };
    const off = { tipos: new Set(), imp: new Set() };
    tp.innerHTML = `<div class="lcard"><p class="kicker">Análisis</p><h3>Oportunidades de desarrollo según demanda y potencial</h3>
      <p class="small muted">El cruce de información sobre ciudadanos, sector público y privado permite identificar dónde y qué tipo de proyectos pueden generar mayor impacto. Tocá la leyenda para filtrar; tocá una burbuja para sumarla al informe.</p>
      <div class="chips" id="mx-tipos">${Object.entries(M.tipos).map(([k, [n, c]]) => `<button class="chip on" style="--c:${c}" data-t="${k}">${n}</button>`).join("")}</div>
      <div class="chips" id="mx-imp">${[[3, "Alto impacto"], [2, "Medio"], [1, "Bajo"]].map(([k, n]) => `<button class="chip on" style="--c:#f8e544" data-i="${k}">${"●".repeat(k)} ${n}</button>`).join("")}</div>
      <div class="net-wrap"><svg id="mx" viewBox="0 0 900 600"></svg></div>
      <div id="mx-info" class="net-info small muted">Pasá el cursor por una burbuja.</div></div>`;
    const svg = tp.querySelector("#mx"), info = tp.querySelector("#mx-info");
    const X = v => 110 + v * 740, Y = v => 540 - v * 480;
    s("path", { d: "M110 545V40M98 56L110 40L122 56", fill: "none", stroke: "#111", "stroke-width": 3 }, svg);
    s("path", { d: "M105 540H865M849 528L865 540L849 552", fill: "none", stroke: "#111", "stroke-width": 3 }, svg);
    s("line", { x1: X(.5), y1: 60, x2: X(.5), y2: 530, stroke: "#cfcfca" }, svg);
    s("line", { x1: 120, y1: Y(.5), x2: 850, y2: Y(.5), stroke: "#cfcfca" }, svg);
    const ft = { "font-family": "Inter Tight", fill: "#111" };
    [["OPORTUNIDAD EMERGENTE", 130, 70], ["OPORTUNIDAD PRIORITARIA", X(.5) + 16, 70], ["BAJA PRIORIDAD", 130, Y(.5) + 26], ["NECESIDAD SIN CONDICIONES", X(.5) + 16, Y(.5) + 26]]
      .forEach(([t, x, y]) => s("text", Object.assign({ x, y, "font-size": 13, "font-weight": 600, "letter-spacing": 1, fill: "#77776f" }, { "font-family": "Inter Tight" }), svg, t));
    s("text", Object.assign({ x: 488, y: 585, "text-anchor": "middle", "font-size": 16 }, ft), svg, "Demanda / necesidades →");
    s("text", Object.assign({ transform: "translate(70 290) rotate(-90)", "text-anchor": "middle", "font-size": 16 }, ft), svg, "Potencial de desarrollo →");
    const items = M.items.map((it, i) => {
      const [n, dx, py, t, imp, ac] = it, r = [0, 14, 21, 30][imp];
      const g = s("g", { style: "cursor:pointer", transform: `translate(${X(dx)} ${Y(py)})` }, svg);
      s("circle", { r, fill: M.tipos[t][1], class: "ring" }, g);
      ac.split("").forEach((c, j, arr) => s("circle", { cx: arr.length > 1 ? (j ? 6 : -6) : 0, r: 6, fill: A3[c][1], stroke: "#fff", "stroke-width": 1.5 }, g));
      s("text", Object.assign({ x: r + 6, y: 4, "font-size": 12 }, ft), g, n.length > 24 ? n.slice(0, 22) + "…" : n);
      const id = "m-" + i; regExtra(id, "Oportunidad: " + n, false, "obras");
      if (inf.items[id]) g.querySelector("circle").setAttribute("stroke", "#111"), g.querySelector("circle").setAttribute("stroke-width", 3);
      const q = py >= .5 ? (dx >= .5 ? "Oportunidad prioritaria" : "Oportunidad emergente") : (dx >= .5 ? "Necesidad sin condiciones" : "Baja prioridad");
      g.onmouseenter = () => info.innerHTML = `<b>${n}</b> · ${M.tipos[t][0]} · ${["", "Bajo", "Medio", "Alto"][imp]} impacto · ${q}<br>Actores: ${ac.split("").map(c => `<span class="hl" style="--c:${A3[c][1]}">●</span> ${A3[c][0]}`).join(" &nbsp; ")} ${inf.items[id] ? " · <b>en tu informe</b>" : ""}`;
      g.onclick = () => { inf.items[id] ? delete inf.items[id] : inf.items[id] = imp === 3 ? "Alta" : "Media"; saveInf(); g.onmouseenter(); const c0 = g.querySelector("circle"); c0.setAttribute("stroke", inf.items[id] ? "#111" : "none"); c0.setAttribute("stroke-width", 3); };
      return { g, t, imp };
    });
    const apply = () => items.forEach(it => it.g.style.opacity = off.tipos.has(it.t) || off.imp.has(it.imp) ? .08 : 1);
    tp.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { const k = b.dataset.t; off.tipos.has(k) ? off.tipos.delete(k) : off.tipos.add(k); b.classList.toggle("on"); apply(); });
    tp.querySelectorAll("[data-i]").forEach(b => b.onclick = () => { const k = +b.dataset.i; off.imp.has(k) ? off.imp.delete(k) : off.imp.add(k); b.classList.toggle("on"); apply(); });
  }

  /* ---------------- FLUJO DE DATOS (toy) ---------------- */
  function flujo(tp) {
    const F = I.flujo;
    tp.innerHTML = `<div class="lcard"><p class="kicker">Recolectar · Procesar · Explorar</p><h3>Cómo viaja un dato por ATLAS</h3>
      <p class="small muted">Cada fuente entra, se normaliza, se geolocaliza y se relaciona. Después cada actor recibe una lectura distinta. Tocá una fuente o un actor para seguir su recorrido.</p>
      <div class="chips" id="fl-speed"><button class="chip" data-sp=".4">Lenta</button><button class="chip on" data-sp="1">Normal</button><button class="chip" data-sp="2.2">Rápida</button><button class="chip on" data-pt>Partículas</button></div>
      <div class="net-wrap"><svg id="fl" viewBox="0 0 900 460"></svg></div>
      <div id="fl-info" class="net-info small muted">Tocá una fuente o un actor.</div></div>`;
    const svg = tp.querySelector("#fl"), info = tp.querySelector("#fl-info");
    const CX0 = 450, CY0 = 230;
    const gL = s("g", {}, svg), gP = s("g", {}, svg), gN = s("g", {}, svg);
    // ATLAS al centro
    s("path", { d: A.shape("reuleaux", CX0, CY0, 52), fill: "#111" }, gN);
    s("text", { x: CX0, y: CY0 + 82, "text-anchor": "middle", fill: "#111", "font-size": 14, "font-weight": 600, "font-family": "Inter Tight", "letter-spacing": 2 }, gN, "ATLAS");
    s("text", { x: CX0, y: CY0 + 100, "text-anchor": "middle", fill: "#77776f", "font-size": 10, "font-family": "Inter Tight" }, gN, "normalizar · geolocalizar · relacionar");
    const paths = [];
    const mk = (x1, y1, x2, y2, col, k, owner) => {
      for (let i = 0; i < 5; i++) {
        const o = (i - 2) * 6 + k, mx = (x1 + x2) / 2;
        const d = `M${x1} ${y1 + o}C${mx} ${y1 + o + Math.sin(i) * 30},${mx} ${y2 + o * .3 - Math.cos(i) * 30},${x2} ${y2 + o * .3}`;
        const el = s("path", { d, fill: "none", stroke: col, "stroke-opacity": .35, "stroke-width": 1.2 }, gL);
        paths.push({ el, owner, col, len: 0 });
      }
    };
    const nodes = [];
    F.entradas.forEach((e, i) => {
      const y = 60 + i * 110;
      mk(190, y, CX0 - 50, CY0, e.color, 0, e.id);
      const g = s("g", { style: "cursor:pointer" }, gN);
      s("rect", { x: 10, y: y - 30, width: 180, height: 60, rx: 12, fill: "#fff", stroke: "#111", "stroke-width": 1.2 }, g);
      s("text", { x: 24, y: y - 6, fill: "#111", "font-size": 13, "font-weight": 600, "font-family": "Inter Tight" }, g, e.nombre);
      s("text", { x: 24, y: y + 12, fill: "#77776f", "font-size": 9.5, "font-family": "Inter Tight" }, g, e.via.length > 30 ? e.via.slice(0, 29) + "…" : e.via);
      g.onclick = () => focus(e.id, `<b class="hl" style="--c:${e.color}">${e.nombre}</b>: ${e.detalle}. Llega por: ${e.via}.`);
      nodes.push(g);
    });
    F.salidas.forEach((o, i) => {
      const y = 90 + i * 140;
      mk(CX0 + 50, CY0, 710, y, o.color, 0, o.id);
      const g = s("g", { style: "cursor:pointer" }, gN);
      s("circle", { cx: 740, cy: y, r: 26, fill: o.color }, g);
      s("text", { x: 774, y: y + 5, fill: "#111", "font-size": 14, "font-weight": 600, "font-family": "Inter Tight" }, g, o.nombre);
      g.onclick = () => focus(o.id, `<b class="hl" style="--c:${o.color}">${o.nombre}</b> recibe: ${o.recibe}.`);
    });
    paths.forEach(p => p.len = p.el.getTotalLength());
    let speed = 1, showP = true, focusId = null;
    function focus(id, html) {
      focusId = focusId === id ? null : id;
      paths.forEach(p => { p.el.setAttribute("stroke-opacity", !focusId || p.owner === focusId ? .6 : .06); p.el.setAttribute("stroke-width", p.owner === focusId ? 2 : 1.2); });
      info.innerHTML = focusId ? html : "Tocá una fuente o un actor.";
    }
    tp.querySelectorAll("[data-sp]").forEach(b => b.onclick = () => { speed = +b.dataset.sp; tp.querySelectorAll("[data-sp]").forEach(x => x.classList.toggle("on", x === b)); });
    tp.querySelector("[data-pt]").onclick = e => { showP = !showP; e.target.classList.toggle("on", showP); gP.style.display = showP ? "" : "none"; };
    const parts = Array.from({ length: 70 }, () => ({ p: paths[Math.floor(Math.random() * paths.length)], t: Math.random(), el: s("circle", { r: 3 }, gP) }));
    stopTab = A.loop(dt => parts.forEach(q => {
      q.t += dt * .22 * speed;
      if (q.t > 1) { q.t = 0; q.p = paths[Math.floor(Math.random() * paths.length)]; }
      const pt = q.p.el.getPointAtLength(q.t * q.p.len);
      q.el.setAttribute("cx", pt.x); q.el.setAttribute("cy", pt.y); q.el.setAttribute("fill", q.p.col);
      q.el.setAttribute("opacity", !focusId || q.p.owner === focusId ? .95 : .08);
    }));
  }

  /* ---------------- DOCUMENTOS ---------------- */
  function documentos(tp) {
    tp.innerHTML = `<div class="lcard"><p class="kicker">Fuentes</p><h3>Notas, datos, normas y manuales para citar</h3>
      <p class="small muted">Notas, datos oficiales, normativa y el manual de ATLAS.</p><div class="docs" id="docs"></div></div>`;
    const docs = tp.querySelector("#docs");
    I.documentos.forEach(d => {
      const fu = d.src ? I.fuentes[d.src] : null, url = d.url || (fu && fu.url);
      const el = h(url ? "a" : "button", Object.assign({ class: "doc" }, url ? { href: url, target: "_blank", rel: "noopener" } : {}), docs,
        `<span class="doc-type">${d.tipo}</span><b>${d.titulo}</b><span class="small muted">${fu ? fu.fuente : url ? new URL(url).hostname : "ATLAS"}</span><span class="doc-go">${url ? "Abrir ↗" : "Leer →"}</span>`);
      if (d.accion === "manual") el.onclick = openHow;
    });
  }

  /* =====================================================================
     COLUMNA DERECHA: escribir una lectura + informe
     ===================================================================== */
  function renderReport() {
    const ids = Object.keys(inf.items).filter(id => REG[id]);
    const order = { Alta: 0, Media: 1, Baja: 2 };
    ids.sort((a, b) => order[inf.items[a]] - order[inf.items[b]]);
    const p = I.perfiles.find(x => x.id === st.perfil) || { nombre: "Mirada libre", color: "#111" };
    const n = ids.length;
    if (+fabN.textContent !== n) { fabN.textContent = n; fab.classList.remove("bump"); void fab.offsetWidth; fab.classList.add("bump"); }
    fab.classList.toggle("has", n > 0);
    report.innerHTML = `
      <div class="ar-drawer-head"><p class="kicker" style="margin:0">Tu informe</p><button class="modal-x" data-close aria-label="Cerrar">×</button></div>
      <div class="lbox">
        <p class="kicker">Escribir una lectura</p>
        <p class="lq">Tu interpretación</p>
        <p class="small muted">Atlas organiza evidencia. La conclusión la construís vos.</p>
        <p class="small">Con esta selección: <b>${D.espacios.find(e => e.id === st.territorio).nombre}</b> · <span class="hl" style="--c:${p.color}">${p.nombre}</span> · ${st.cats.size} temas</p>
        <label class="field"><span>Título de la lectura</span><input id="l-tit" maxlength="90" placeholder="Ej: El borde de las vías concentra los reclamos"></label>
        <label class="field"><span>Hipótesis, observación o pregunta</span><textarea id="l-txt" rows="4" placeholder="Lo que ves cuando cruzás la evidencia…"></textarea></label>
        <p class="lsub">Contenidos seleccionados (${ids.length})</p>
        ${ids.length ? `<ul class="sel">${ids.map(id => `<li><span class="prio p-${inf.items[id]}">${inf.items[id]}</span><span>${REG[id].titulo}</span><button class="linkbtn" data-rm="${id}" aria-label="Quitar">×</button></li>`).join("")}</ul>`
          : `<p class="small muted">Todavía no agregaste contenidos. Marcá prioridad en una ficha o sumá un indicador.</p>`}
        <button class="btn" id="l-save"${ids.length ? "" : " disabled"}>Guardar en el informe</button>
      </div>
      <div class="lbox">
        <p class="kicker">Informe en construcción</p>
        <p class="lq">${inf.lecturas.length} lectura${inf.lecturas.length === 1 ? "" : "s"}</p>
        ${inf.lecturas.map((l, i) => `<div class="lect"><b>${esc(l.titulo)}</b><p>${esc(l.texto)}</p><span class="small muted">${l.items.length} evidencias · ${l.perfil} · ${new Date(l.fecha).toLocaleDateString("es-AR")}</span><button class="linkbtn" data-del="${i}">borrar</button></div>`).join("")}
        <div class="row" style="flex-wrap:wrap">
          <button class="btn small" id="r-md"${inf.lecturas.length || ids.length ? "" : " disabled"}>Descargar (.md)</button>
          <button class="btn ghost small" id="r-print"${inf.lecturas.length || ids.length ? "" : " disabled"}>Imprimir / PDF</button>
        </div>
        ${inf.lecturas.length || ids.length ? `<button class="linkbtn small" id="r-clear">Vaciar informe</button>` : ""}
      </div>`;
    report.querySelector("[data-close]").onclick = closeDrawer;
    report.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { delete inf.items[b.dataset.rm]; saveInf(); renderMain(); });
    report.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { inf.lecturas.splice(+b.dataset.del, 1); saveInf(); });
    report.querySelector("#l-save").onclick = () => {
      const t = report.querySelector("#l-tit").value.trim() || "Lectura sin título", x = report.querySelector("#l-txt").value.trim();
      inf.lecturas.push({ titulo: t, texto: x, items: ids.map(id => ({ id, prioridad: inf.items[id] })), perfil: p.nombre, fecha: new Date().toISOString() });
      saveInf();
    };
    const md = report.querySelector("#r-md"); if (md) md.onclick = download;
    const pr = report.querySelector("#r-print"); if (pr) pr.onclick = printReport;
    const cl = report.querySelector("#r-clear"); if (cl) cl.onclick = () => { inf = { items: {}, lecturas: [] }; saveInf(); renderMain(); };
  }

  function buildMarkdown() {
    const terr = D.espacios.find(e => e.id === st.territorio), p = I.perfiles.find(x => x.id === st.perfil);
    const line = id => { const r = REG[id]; if (!r) return ""; const f = r.f, fu = f && fuente(f);
      return `- **[${inf.items[id] || "—"}]** ${r.titulo} · ${f ? I.estados[f.estado].nombre : "indicador"} · ${r.real ? "con fuente" : "ejemplo"}${fu ? ` · ${fu.fuente}${fu.url ? ` (${fu.url})` : ""}` : ""}`; };
    let m = `# Informe ATLAS · ${terr.nombre}\n\n${terr.barrio} · Comuna ${terr.comuna}\n\nMirada: ${p ? p.nombre : "libre"} · Fecha: ${new Date().toLocaleDateString("es-AR")}\nTemas: ${CATS.filter(c => st.cats.has(c.id)).map(c => c.nombre).join(", ")}\n\n`;
    if (inf.lecturas.length) { m += `## Lecturas\n\n`; inf.lecturas.forEach(l => { m += `### ${l.titulo}\n\n${l.texto || "_(sin texto)_"}\n\nEvidencia citada:\n${l.items.map(i => line(i.id)).join("\n")}\n\n`; }); }
    const ids = Object.keys(inf.items).filter(id => REG[id]);
    if (ids.length) {
      m += `## Evidencia seleccionada\n\n${ids.map(line).join("\n")}\n\n`;
      const falt = ids.map(id => REG[id].f).filter(Boolean);
      if (falt.length) m += `## Preguntas pendientes\n\n${falt.map(f => `- ${f.falta}`).join("\n")}\n\n`;
    }
    return m + `---\nGenerado con ATLAS · LAB VIII · Fuentes · Oro · Zita\n`;
  }
  function download() {
    const blob = new Blob([buildMarkdown()], { type: "text/markdown" });
    const a = h("a", { href: URL.createObjectURL(blob), download: "informe-atlas-colegiales.md" }, document.body);
    a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function printReport() {
    const html = buildMarkdown().replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/^### (.*)$/gm, "<h3>$1</h3>").replace(/^## (.*)$/gm, "<h2>$1</h2>").replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/^- (.*)$/gm, "<li>$1</li>").replace(/\n\n/g, "<br><br>");
    document.getElementById("print-report").innerHTML = html;
    window.print();
  }

  /* ---------- Modal "Cómo funciona" ---------- */
  function openHow() {
    modalBody.innerHTML = `<p class="kicker">Cómo funciona</p><h3>Atlas permite leer y escribir el territorio</h3>
      <ol class="steps6">${I.pasos.map(([t, d], i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><b>${t}</b><p>${d}</p></li>`).join("")}</ol>
      <p class="small muted">Dos formas de entrar a la misma evidencia: el <b>Recorrido</b> para caminar el parque capa por capa, y el <b>Archivo</b> para consultar fichas, números y fuentes. Cada ficha te lleva a su capa y cada capa, a su evidencia.</p>
      <p>Atlas no produce una solución. Produce condiciones para construir y discutir una lectura.</p>`;
    modal.showModal();
  }
  document.addEventListener("click", e => { if (e.target.closest("[data-how]")) openHow(); });

  /* ---------- Panel lateral "Tu informe" ---------- */
  function openDrawer() { report.hidden = false; requestAnimationFrame(() => report.classList.add("open")); fab.setAttribute("aria-expanded", "true"); }
  function closeDrawer() { report.classList.remove("open"); fab.setAttribute("aria-expanded", "false"); setTimeout(() => { if (!report.classList.contains("open")) report.hidden = true; }, 350); }
  fab.onclick = () => report.classList.contains("open") ? closeDrawer() : openDrawer();
  addEventListener("keydown", e => { if (e.key === "Escape" && report.classList.contains("open")) closeDrawer(); });
  document.getElementById("modal-x").onclick = () => modal.close();
  modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });

  function refresh() { renderHero(); renderStart(); renderDots(); renderTabs(); renderMain(); renderReport(); }

  /* ---------- API para el router ---------- */
  A.archivo = {
    show(sub) {
      const m = A.store.get("mirada", null);
      if (m && m.fresh) { applyPerfil(m.perfil); st.tab = "biblioteca"; st.estado = "todos"; st.origen = "todos"; m.fresh = false; A.store.set("mirada", m); }
      else if (m && m.perfil !== st.perfil && !sub) applyPerfil(m.perfil);
      // Entrada amable: la portada aparece por partes
      wrap.classList.remove("enter"); void wrap.offsetWidth; wrap.classList.add("enter");
      if (sub && catById(sub)) {
        st.cats.add(sub); st.tab = "biblioteca"; st.orden = "categoria"; st.estado = "todos"; st.origen = "todos"; st.q = ""; st.solo = false;
        refresh();
        setTimeout(() => { const el = document.getElementById("grupo-" + sub); if (el) { el.scrollIntoView({ block: "start", behavior: "smooth" }); el.classList.add("flash"); } }, 500);
        return;
      }
      if (sub && TABS.some(t => t[0] === sub)) st.tab = sub;
      refresh();
      A.guia && A.guia.auto();
    },
    hide() { if (stopTab) { stopTab(); stopTab = null; } closeDrawer(); A.guia && A.guia.close(); }
  };
})(window.ATLAS);
