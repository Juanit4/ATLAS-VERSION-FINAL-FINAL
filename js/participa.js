/* =========================================================================
   ATLAS · PARTICIPÁ
   Tres pasos: qué querés marcar → contalo → tocá el lugar.
   El plano se acerca por zonas (pérgolas, juegos, vagones…) o con + y −,
   y se mueve arrastrando. Cada aporte guarda su zona.
   (Se guarda en el navegador. Ver README para compartirlo con todos.)
   ========================================================================= */
(function (A) {
  const svg = document.getElementById("pin-svg");
  const typesEl = document.getElementById("pin-types");
  const input = document.getElementById("pin-text");
  const listEl = document.getElementById("pin-list");
  const doneEl = document.getElementById("pin-done");
  const hint = document.getElementById("pm-hint");
  const zoneBar = document.getElementById("zone-bar");
  const s = A.s, PD = A.D.parque;

  const TYPES = [
    { id: "problema", nombre: "Problema", forma: "triangulo", color: A.C.alerta },
    { id: "idea",     nombre: "Idea",     forma: "circulo",   color: A.C.publico },
    { id: "uso",      nombre: "Uso",      forma: "cuadrado",  color: A.C.ciudadanos },
    { id: "pedido",   nombre: "Pedido",   forma: "hexagono",  color: A.C.acento }
  ];
  let type = TYPES[0];

  TYPES.forEach((t, i) => {
    const b = A.h("button", { class: i ? "" : "on", style: `--c:${t.color}`, role: "radio", "aria-checked": i ? "false" : "true" }, typesEl, A.icon(t.forma, t.color) + t.nombre);
    b.onclick = () => { type = t; typesEl.querySelectorAll("button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); }); };
  });

  /* Plano con todas las zonas rotuladas */
  A.drawParkBase(svg, { labels: "all" });
  const pinsG = s("g", {}, svg);
  const cam = A.panZoom(svg, { full: A.PARK_FULL, minW: 240, buttons: document.getElementById("pin-zoom") });
  // En celular arranca más cerca, con las zonas legibles
  if (A.sm) cam.focus(560, 300, 470, 0); else cam.focus(780, 290, 1240, 0);

  /* Zonas: acercan el plano a ese sector */
  const ZW = 460;
  const all = A.h("button", { class: "on" }, zoneBar, "Todo el parque");
  all.onclick = () => { cam.fit(); mark(all); };
  PD.zonas.forEach(z => {
    const b = A.h("button", {}, zoneBar, z.corto);
    b.onclick = () => { cam.focus(z.x, z.y, ZW); mark(b); };
  });
  function mark(b) { zoneBar.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); }

  function render() {
    A.clear(pinsG);
    const pins = A.store.get("pins", []);
    pins.forEach((p, i) => {
      const t = TYPES.find(x => x.id === p.tipo) || TYPES[0];
      const g = s("g", { class: "pin", transform: `translate(${p.x} ${p.y})`, "data-nopan": "" }, pinsG);
      const k = s("g", { class: "k" }, g);
      s("line", { x1: 0, y1: 0, x2: 0, y2: -18, stroke: "#111", "stroke-width": 1.5 }, k);
      s("path", { d: A.shape(t.forma, 0, -26, 9), fill: t.color, stroke: "#111", "stroke-width": 1.5 }, k);
      s("circle", { r: 2.5, fill: "#111" }, k);
      s("title", {}, g, `${t.nombre} · ${p.zona || ""}: ${p.texto}`);
    });
    listEl.innerHTML = pins.slice().reverse().slice(0, 5).map(p => {
      const t = TYPES.find(x => x.id === p.tipo) || TYPES[0];
      return `<li style="--c:${t.color}">${A.icon(t.forma, t.color)}<div><b>${t.nombre}</b> · ${p.zona || "Parque"}<br><span>${p.texto}</span></div></li>`;
    }).join("");
    if (pins.length) listEl.insertAdjacentHTML("afterbegin", `<li class="pin-count">${pins.length} aporte${pins.length > 1 ? "s" : ""} tuyo${pins.length > 1 ? "s" : ""} en el plano</li>`);
    hint.hidden = pins.length > 0;
  }

  svg.addEventListener("click", ev => {
    if (svg.dataset.dragged) return;                 // fue un arrastre, no un toque
    if (ev.target.closest(".pin")) return;
    const p = A.svgPoint(svg, ev);
    const zona = A.zonaCerca(p.x, p.y);
    const pins = A.store.get("pins", []);
    const texto = input.value.trim() || type.nombre;
    pins.push({ x: Math.round(p.x), y: Math.round(p.y), tipo: type.id, zona: zona.nombre, texto, fecha: new Date().toISOString() });
    A.store.set("pins", pins);
    input.value = "";
    render();
    doneEl.hidden = false;
    doneEl.innerHTML = `<b>Listo.</b> Tu ${type.nombre.toLowerCase()} quedó en <b>${zona.nombre}</b>.`;
    clearTimeout(doneEl._t); doneEl._t = setTimeout(() => { doneEl.hidden = true; }, 4200);
    // >>> Para compartirlo con toda la comunidad, mandá el aporte a tu backend acá:
    // fetch("https://TU-API/aportes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pins[pins.length - 1]) });
  });

  render();
})(window.ATLAS);
