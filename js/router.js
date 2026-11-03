/* =========================================================================
   ATLAS · ROUTER (una sola web, cuatro vistas)
   #intro      → ¿Qué es ATLAS?  (SIEMPRE es la entrada: primera visita o la número mil)
   #umbral     → elegir mirada y puerta      (#umbral/mirada abre directo el cambio de mirada)
   #recorrido  → caminar el parque           (#recorrido/capa-seguridad, #recorrido/compara)
   #archivo    → consultar la evidencia      (#archivo/normas, #archivo/matriz)
   Entre vistas: un fundido corto. "Atrás" del navegador funciona.
   ========================================================================= */
(function (A) {
  const VIEWS = ["intro", "umbral", "recorrido", "archivo"];
  const ALIAS = { jugar: "recorrido", leer: "archivo" };
  const TITLES = { intro: "ATLAS · Qué es", umbral: "ATLAS · territorios compartidos", recorrido: "ATLAS · Recorrido", archivo: "ATLAS · Evidencia" };
  let current = null;

  /* Nombre y color de la mirada en la barra superior */
  A.updateMirada = function () {
    const m = A.store.get("mirada", null), p = m && window.ATLAS_INFORME.perfiles.find(x => x.id === m.perfil);
    document.getElementById("mirada-dot").style.background = p ? p.color : "#111";
    document.getElementById("mirada-name").textContent = p ? p.nombre : "Elegir mirada";
    return p;
  };

  function parse() {
    const raw = location.hash.replace(/^#\/?/, "");
    let [view, sub] = raw.split("/");
    view = ALIAS[view] || view;
    if (!VIEWS.includes(view)) {
      if (raw && document.getElementById(raw)) { sub = raw; view = "recorrido"; }
      else view = "intro";
    }
    return [view, sub];
  }

  function apply(view, sub, changed) {
    if (current === "archivo" && changed) A.archivo.hide();
    current = view;
    document.body.dataset.view = view;
    document.title = TITLES[view];
    const p = A.updateMirada();
    if (view !== "umbral" && view !== "intro") { const m = A.store.get("mirada", {}) || {}; m.camino = view; A.store.set("mirada", m); }
    if (view === "intro") { if (changed) scrollTo(0, 0); A.intro.update(); }
    if (view === "umbral") { if (changed) scrollTo(0, 0); A.umbral.show(sub); }
    if (view === "archivo") { if (changed) scrollTo(0, 0); A.archivo.show(sub); }
    if (view === "recorrido") {
      A.setMiradaRecorrido(p ? p.id : null);
      if (changed && !sub) { scrollTo(0, 0); A.city.welcome(p ? p.nombre : ""); }
      A.recorridoRefresh();
      if (sub) requestAnimationFrame(() => requestAnimationFrame(() => {
        const el = document.getElementById(sub);
        if (el) el.scrollIntoView({ block: el.classList.contains("chapter") ? (A.sm ? "end" : "center") : "start" });
      }));
    }
  }

  /* Fundido corto entre vistas (sin símbolos que crecen) */
  const veil = A.h("div", { class: "veil", "aria-hidden": "true" }, document.body);
  function transition(done) {
    if (A.reduced) { done(); return; }
    veil.classList.add("on");
    setTimeout(() => { done(); requestAnimationFrame(() => veil.classList.remove("on")); }, 180);
  }

  function route(first) {
    const [view, sub] = parse();
    const changed = view !== current;
    if (!changed || first === true) { apply(view, sub, changed); return; }
    transition(() => apply(view, sub, true));
  }

  // Botones con data-route y data-scroll
  document.addEventListener("click", e => {
    if (e.target.closest("[data-intro-done]")) A.intro.done();
    const r = e.target.closest("[data-route]");
    if (r) { e.preventDefault(); location.hash = "#" + r.dataset.route; return; }
    const sc = e.target.closest("[data-scroll]");
    if (sc) {
      e.preventDefault();
      const el = document.getElementById(sc.dataset.scroll);
      if (el) el.scrollIntoView({ behavior: A.reduced ? "auto" : "smooth" });
    }
  });
  addEventListener("hashchange", () => route());
  addEventListener("scroll", () => { if (current === "intro") requestAnimationFrame(A.intro.update); }, { passive: true });

  /* La entrada SIEMPRE es "¿Qué es ATLAS?": se ignora cualquier enlace guardado (#umbral, #recorrido…) */
  if (location.hash !== "#intro") history.replaceState(null, "", location.pathname + location.search + "#intro");
  route(true);
})(window.ATLAS);
