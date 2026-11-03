/* =========================================================================
   ATLAS · GUÍA DE PRIMERA VEZ (Consultar la evidencia)
   Como cuando abrís una app nueva: ilumina cada parte y explica qué hacer.
   Aparece solo la primera vez (A.store "guiaVista"). Se puede volver a ver
   desde "Ver la guía" en la portada.
   ========================================================================= */
(function (A) {
  const root = document.getElementById("guide");
  const spot = document.getElementById("guide-spot");
  const card = document.getElementById("guide-card");

  const PASOS = [
    { sel: ".ar-mirada", t: "Elegí desde dónde leés", d: "Tu mirada ordena la evidencia: qué temas aparecen primero y qué fichas te sugerimos." },
    { sel: ".ar-stats", t: "Los números son atajos", d: "Tocá uno y vas directo a esas fichas: las verificadas, las que se contradicen, las que están en revisión." },
    { sel: "#ar-start", t: "Para empezar", d: "Tres fichas elegidas para tu mirada. Abrí una para ver de dónde sale el dato y qué falta saber." },
    { sel: "#ar-tabs", t: "Seis maneras de leer", d: "Fichas, números, relaciones entre actores, oportunidades, cómo se procesa y las fuentes." },
    { sel: "#ar-fab", t: "Armá tu informe", d: "Cuando una ficha te sirve, dale prioridad: se suma acá. Después lo descargás o lo imprimís." }
  ];
  let i = 0, on = false;

  function place() {
    if (!on) return;
    const p = PASOS[i], el = document.querySelector(p.sel);
    if (!el) { next(); return; }
    const r = el.getBoundingClientRect(), pad = 8;
    Object.assign(spot.style, { left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
    // Tarjeta: debajo del elemento si entra; si no, arriba
    const cw = Math.min(340, innerWidth - 32), below = r.bottom + 16 + 190 < innerHeight;
    card.style.width = cw + "px";
    card.style.left = A.clamp(r.left, 16, innerWidth - cw - 16) + "px";
    card.style.top = (below ? r.bottom + 16 : Math.max(16, r.top - 16 - card.offsetHeight)) + "px";
  }

  function show(k) {
    i = k;
    const p = PASOS[i], el = document.querySelector(p.sel);
    if (el && p.sel !== "#ar-fab") el.scrollIntoView({ block: "center", behavior: "auto" });
    card.innerHTML = `<p class="kicker">Guía · ${i + 1} de ${PASOS.length}</p><h3>${p.t}</h3><p>${p.d}</p>
      <div class="guide-btns"><button class="linkbtn" data-g="skip">Saltar guía</button>
      <span class="guide-dots">${PASOS.map((_, j) => `<i class="${j === i ? "on" : ""}"></i>`).join("")}</span>
      <button class="btn small" data-g="next">${i < PASOS.length - 1 ? "Siguiente" : "Empezar"}</button></div>`;
    requestAnimationFrame(place);
  }
  function next() { if (i < PASOS.length - 1) show(i + 1); else close(); }
  function close() { on = false; root.hidden = true; document.body.classList.remove("guiding"); A.store.set("guiaVista", true); }
  function open() {
    on = true; root.hidden = false; document.body.classList.add("guiding");
    show(0);
  }
  card.addEventListener("click", e => {
    const b = e.target.closest("[data-g]"); if (!b) return;
    b.dataset.g === "next" ? next() : close();
  });
  addEventListener("keydown", e => { if (!on) return; if (e.key === "Escape") close(); if (e.key === "ArrowRight" || e.key === "Enter") next(); });
  addEventListener("resize", place);
  addEventListener("scroll", place, { passive: true });
  document.addEventListener("click", e => { if (e.target.closest("[data-guia]")) { scrollTo(0, 0); setTimeout(open, 50); } });

  A.guia = {
    // Se llama al entrar a la evidencia: solo la primera vez
    auto() { if (!A.store.get("guiaVista", false)) setTimeout(() => { if (document.body.dataset.view === "archivo") open(); }, 900); },
    close() { if (on) close(); }
  };
})(window.ATLAS);
