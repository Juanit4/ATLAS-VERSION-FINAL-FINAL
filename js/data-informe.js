/* =========================================================================
   ATLAS · DATOS DEL CAMINO "LEER" (informes, fichas, análisis)
   -------------------------------------------------------------------------
   Igual que data.js: real:true lleva fuente; real:false es EJEMPLO.
   estado: validado | revision | contradictorio | desactualizado
   capa:   id de la capa del camino "Jugar" donde se ve ese dato (opcional)
   ========================================================================= */

window.ATLAS_INFORME = {

  /* Perfiles de entrada (los mismos tres actores de ATLAS) */
  perfiles: [
    { id:"ciudadanos", nombre:"Ciudadanía",     bajada:"Uso cotidiano y seguimiento",  color:"#9b6cff",
      sugeridas:["contexto","voces","usos","movilidad","seguridad","participacion"] },
    { id:"publico",    nombre:"Sector público", bajada:"Gestión y evidencia territorial", color:"#00e887",
      sugeridas:["contexto","poblacion","voces","seguridad","normas","obras","gestion","participacion"] },
    { id:"privado",    nombre:"Sector privado", bajada:"Viabilidad y contexto",         color:"#08b8f8",
      sugeridas:["contexto","poblacion","usos","ambiente","patrimonio","normas","obras","antecedentes"] }
  ],

  /* 13 categorías en 5 grupos */
  grupos: [
    { nombre:"Territorio y población", cats:[
      { id:"contexto",  nombre:"Territorio y contexto", forma:"hexagono" },
      { id:"poblacion", nombre:"Población y actores",   forma:"circulo" } ] },
    { nombre:"Experiencias y vida cotidiana", cats:[
      { id:"voces",     nombre:"Voces y reclamos",            forma:"circulo" },
      { id:"usos",      nombre:"Usos, flujos y horarios",     forma:"circulo" },
      { id:"movilidad", nombre:"Accesibilidad y movilidad",   forma:"rombo" },
      { id:"seguridad", nombre:"Seguridad, cuidados y servicios", forma:"triangulo" } ] },
    { nombre:"Condiciones territoriales", cats:[
      { id:"ambiente",   nombre:"Ambiente y biodiversidad", forma:"hexagono" },
      { id:"patrimonio", nombre:"Patrimonio e historia",    forma:"cuadrado" },
      { id:"normas",     nombre:"Leyes y restricciones",    forma:"triangulo" } ] },
    { nombre:"Decisiones y gestión", cats:[
      { id:"obras",         nombre:"Obras y proyectos",                 forma:"cuadrado" },
      { id:"gestion",       nombre:"Gestión, presupuesto y mantenimiento", forma:"cuadrado" },
      { id:"participacion", nombre:"Participación y respuestas",        forma:"rombo" } ] },
    { nombre:"Antecedentes", cats:[
      { id:"antecedentes", nombre:"Antecedentes", forma:"pentagono" } ] }
  ],

  estados: {
    validado:       { nombre:"Validado",       color:"#00e887" },
    revision:       { nombre:"En revisión",    color:"#f8e544" },
    contradictorio: { nombre:"Contradictorio", color:"#ff5a4e" },
    desactualizado: { nombre:"Desactualizado", color:"#8b8b88" }
  },

  /* Fuentes reutilizables */
  fuentes: {
    ln:  { fuente:"La Nación, 27/07/2024", url:"https://www.lanacion.com.ar/sociedad/de-estreno-nuevo-parque-publico-en-uno-de-los-barrios-con-menos-espacio-verde-de-la-ciudad-nid27072024/" },
    pf:  { fuente:"Perfil, 30/01/2021", url:"https://www.perfil.com/noticias/sociedad/colegiales-avanza-la-urbanizacion-en-terreno-de-ex-playon-ferroviario.phtml" },
    c26: { fuente:"Canal 26, 17/03/2026", url:"https://www.canal26.com/general/2026/03/17/colegiales-vive-su-gran-transformacion-del-viejo-playon-ferroviario-a-un-nuevo-boom-inmobiliario-en-el-norte-porteno/" },
    sv:  { fuente:"DGEyC CABA, 1er trim. 2026 (vía servidos.ar)", url:"https://servidos.ar/precio-m2-caba/colegiales" },
    at:  { fuente:"Relevamiento ATLAS, 05/10/2026" }
  },

  /* Fichas de la biblioteca */
  fichas: [
    // ---- Territorio y contexto
    { id:"f01", cat:"contexto", estado:"validado", real:true, src:"ln", capa:"parque",
      titulo:"El parque ocupa el ex playón de maniobras del FFCC Mitre",
      texto:"Está junto a la Estación Colegiales, entre Virrey Olaguer y Feliú, Moldes, Av. Federico Lacroze y las vías del Mitre.",
      relacion:"El borde ferroviario define los accesos, el ruido y la forma alargada del parque.",
      falta:"Planos oficiales actualizados de cada etapa." },
    { id:"f02", cat:"contexto", estado:"contradictorio", real:true, src:"ln", capa:"parque",
      titulo:"Las fuentes no coinciden en la superficie del parque",
      texto:"La Nación habla de 3 ha de espacio público y de 19.000 m² verdes; el relevamiento ATLAS registra 14.200 m² oficiales; el predio completo tenía 87.582 m² (Perfil, 2021).",
      relacion:"Cada fuente usa un recorte distinto: parque, área verde o predio total.",
      falta:"Una superficie oficial única con fecha y criterio de medición." },
    { id:"f03", cat:"contexto", estado:"validado", real:true, src:"ln",
      titulo:"El área de influencia supera los límites del barrio",
      texto:"El parque está pensado para más de 80.000 vecinos.",
      relacion:"Los límites administrativos (Comuna 13) no coinciden con quienes lo usan.",
      falta:"De qué barrios llegan las personas usuarias." },

    // ---- Población y actores
    { id:"f04", cat:"poblacion", estado:"desactualizado", real:true, src:null, fuenteTxt:"Censo 2010 (INDEC / DGEyC)", capa:"censo",
      titulo:"La Comuna 13 tenía 231.331 habitantes",
      texto:"Es el último dato desagregado por comuna que usa ATLAS.",
      relacion:"La composición por edades condiciona las necesidades cotidianas del parque.",
      falta:"Reemplazar por los resultados del Censo 2022 por comuna." },
    { id:"f05", cat:"poblacion", estado:"validado", real:true, src:"sv", capa:"censo",
      titulo:"El m² usado en Colegiales cuesta USD 2.725",
      texto:"Departamento usado de 2 ambientes, precio de oferta. En pozo, desde USD 3.200 (Canal 26, 2026).",
      relacion:"El parque y los nuevos desarrollos presionan el valor del suelo del entorno.",
      falta:"Serie histórica antes y después de la apertura del parque." },
    { id:"f06", cat:"poblacion", estado:"revision", real:false, capa:"personas",
      titulo:"Quiénes usan el parque: perfil por edad, género y mascotas",
      texto:"Adultos 30–59 (34%) y jóvenes 13–29 (31%) son mayoría; 22% llega con mascota.",
      relacion:"La población usuaria no es igual a la población residente.",
      falta:"Conteos sistemáticos por horario, sin identificar personas." },

    // ---- Voces y reclamos
    { id:"f07", cat:"voces", estado:"validado", real:true, src:"pf",
      titulo:"Una parte del barrio pidió que el 100% del playón sea parque",
      texto:"La asociación vecinal Colegiales Participa y Decide se opuso a construir edificios en el predio.",
      relacion:"Tensión directa con el desarrollo privado sobre Moldes.",
      falta:"Qué peso tuvo esta posición en las decisiones finales.", tension:"f08" },
    { id:"f08", cat:"voces", estado:"validado", real:true, src:"pf",
      titulo:"Otros vecinos esperaban del proyecto seguridad, iluminación y revalorización",
      texto:"Según la nota, la mayoría estaba de acuerdo con el proyecto.",
      relacion:"Posición contrapuesta a la del 100% parque: dos lecturas del mismo territorio.",
      falta:"Fuente de la afirmación \"la mayoría\" (encuesta, audiencia, otra).", tension:"f07" },
    { id:"f09", cat:"voces", estado:"revision", real:false, capa:"voces",
      titulo:"Pedidos más repetidos: baños públicos, seguridad e iluminación",
      texto:"Le siguen sombra, gastronomía y actividades culturales.",
      relacion:"Los reclamos cambian según el horario y la forma de uso.",
      falta:"Cruzar reseñas, redes y consultas públicas con su procedencia." },

    // ---- Usos, flujos y horarios
    { id:"f10", cat:"usos", estado:"revision", real:false, capa:"transito",
      titulo:"Picos de uso: 17 a 19 h entre semana, 12 a 18 h el fin de semana",
      texto:"El conteo máximo ronda 80–86 personas simultáneas.",
      relacion:"Los picos coinciden con salida escolar y laboral, y con las ferias del fin de semana.",
      falta:"Sensores de movimiento o wifi público para medir sin estimar." },
    { id:"f11", cat:"usos", estado:"revision", real:false, capa:"eventos",
      titulo:"Las permanencias se concentran en Plaza Lacroze y la plaza de juegos",
      texto:"El sector Zabala se usa más para pasar que para quedarse.",
      relacion:"Servicios, sombra y bancos condicionan cuánto tiempo se queda cada grupo.",
      falta:"Mapa de permanencias por sector y franja horaria." },

    // ---- Accesibilidad y movilidad
    { id:"f12", cat:"movilidad", estado:"validado", real:true, src:"ln",
      titulo:"El acceso principal está en la esquina de Av. Federico Lacroze",
      texto:"La etapa 3 abrió y extendió Palpa y Aguilar, y construyó las veredas de Moldes.",
      relacion:"La relación con el entorno cambia según cada acceso.",
      falta:"Relevamiento de accesibilidad universal en cada ingreso." },
    { id:"f13", cat:"movilidad", estado:"revision", real:false, capa:"proyectos",
      titulo:"Las vías del Mitre funcionan como barrera",
      texto:"ATLAS propone un Nodo de Transbordo en la estación (920 personas/hora estimadas).",
      relacion:"Conectar andenes y parque podría cambiar los flujos del borde sur.",
      falta:"Conteos reales de pasajeros en la Estación Colegiales." },

    // ---- Seguridad, cuidados y servicios
    { id:"f14", cat:"seguridad", estado:"validado", real:true, src:"ln", capa:"seguridad",
      titulo:"Iluminación 100% LED para uso las 24 horas",
      texto:"El parque forma parte del Plan de Parques Seguros de la Ciudad.",
      relacion:"Seguridad, iluminación, mantenimiento y permanencia se afectan mutuamente.",
      falta:"Registro de fallas de luminarias por sector." },
    { id:"f15", cat:"seguridad", estado:"revision", real:false, capa:"seguridad",
      titulo:"La percepción de seguridad cae de noche",
      texto:"El índice percibido baja de 88/100 al mediodía a 22/100 de madrugada.",
      relacion:"El borde de las vías entre Palpa y Aguilar aparece como la zona más oscura.",
      falta:"Diferenciar percepción, incidente registrado, horario y sector." },
    { id:"f16", cat:"seguridad", estado:"revision", real:false, capa:"voces",
      titulo:"No hay baños públicos en el parque",
      texto:"Es el pedido más repetido en las voces relevadas.",
      relacion:"Los servicios disponibles condicionan la duración de la visita.",
      falta:"Confirmar con el inventario oficial de equipamiento." },

    // ---- Ambiente y biodiversidad
    { id:"f17", cat:"ambiente", estado:"validado", real:true, src:"ln",
      titulo:"Se plantaron más de 250 árboles",
      texto:"Peral de flor, roble piramidal, liquidámbar, lapacho, jacarandá y chañar. Hay suelo absorbente.",
      relacion:"El arbolado define sombra y permanencia en verano.",
      falta:"Qué porcentaje son especies nativas." },
    { id:"f18", cat:"ambiente", estado:"validado", real:true, src:"ln",
      titulo:"Colegiales es uno de los barrios con menos superficie verde",
      texto:"La nota no da un número por habitante.",
      relacion:"Explica la presión de uso y el reclamo por más espacio verde.",
      falta:"m² verdes por habitante de la Comuna 13." },
    { id:"f19", cat:"ambiente", estado:"revision", real:false, capa:"ruido",
      titulo:"El paso del tren es la fuente de ruido más fuerte (≈82 dB)",
      texto:"Le siguen Av. Lacroze (74 dB) y la feria gastronómica (70 dB).",
      relacion:"Ruido, iluminación y permanencia aparecen relacionados.",
      falta:"Sensores de sonido calibrados y series por hora." },

    // ---- Patrimonio e historia
    { id:"f20", cat:"patrimonio", estado:"revision", real:false, capa:"restricciones",
      titulo:"La estación y el galpón conservan la memoria ferroviaria",
      texto:"ATLAS propone un Centro de Interpretación Ferroviaria y recuperar el Galpón Mitre.",
      relacion:"El patrimonio condiciona qué se puede construir o demoler.",
      falta:"Verificar el grado de protección patrimonial de cada edificio." },

    // ---- Leyes y restricciones
    { id:"f21", cat:"normas", estado:"validado", real:true, src:"pf", capa:"restricciones",
      titulo:"52% del predio es superficie verde y 48% superficie seca",
      texto:"Y el 78% de la superficie es para los vecinos; el 22% para construcción privada.",
      relacion:"Define el equilibrio entre parque y desarrollo inmobiliario.",
      falta:"Norma exacta que fija estos porcentajes." },
    { id:"f22", cat:"normas", estado:"revision", real:true, src:"pf", capa:"restricciones",
      titulo:"Lo nuevo no puede superar la altura del entorno",
      texto:"La nota no precisa pisos ni metros.",
      relacion:"Existen vacíos entre la regulación general y la lectura territorial.",
      falta:"Altura máxima según el Código Urbanístico de CABA." },

    // ---- Obras y proyectos
    { id:"f23", cat:"obras", estado:"validado", real:true, src:"pf", capa:"proyectos",
      titulo:"Distrito Colegiales: desarrollo privado sobre Moldes",
      texto:"Entre Palpa y Aguilar. Inversión superior a USD 25 millones (Fernández Prieto y G&D).",
      relacion:"Proyectos cercanos pueden producir efectos acumulativos.",
      falta:"Cantidad de unidades, altura y fecha de finalización." },
    { id:"f24", cat:"obras", estado:"validado", real:true, src:"ln", capa:"proyectos",
      titulo:"El parque se hizo en tres etapas",
      texto:"Etapas 1 y 2: +6.600 m² y +17.000 m². La etapa 3 completó el tramo Zabala–Palpa.",
      relacion:"El espacio actual es resultado de transformaciones sucesivas.",
      falta:"Fechas previstas versus fechas reales de cada etapa." },
    { id:"f25", cat:"obras", estado:"revision", real:false, capa:"proyectos",
      titulo:"ATLAS identifica 9 intervenciones posibles",
      texto:"Plaza Lacroze, Galpón Mitre, Plaza de Juegos Palpa, Pabellón Zabala, Punto Verde Aguilar, entre otras.",
      relacion:"Ordenadas por demanda y potencial de desarrollo (ver Matriz).",
      falta:"Validación con los tres actores." },

    // ---- Gestión, presupuesto y mantenimiento
    { id:"f26", cat:"gestion", estado:"validado", real:true, src:"pf",
      titulo:"Los lotes privados se vendieron a Sancor Seguros por ~USD 19 M",
      texto:"La venta financió parte de la transformación del predio.",
      relacion:"Presupuesto asignado y ejecutado deben leerse por separado.",
      falta:"Destino documentado de los fondos de la venta." },
    { id:"f27", cat:"gestion", estado:"revision", real:false,
      titulo:"No hay datos públicos desagregados de mantenimiento",
      texto:"La responsabilidad se reparte entre varios organismos.",
      relacion:"El mantenimiento presenta diferencias entre sectores.",
      falta:"Contratos, frecuencia y presupuesto ejecutado por año." },

    // ---- Participación y respuestas
    { id:"f28", cat:"participacion", estado:"validado", real:true, src:"ln", capa:"eventos",
      titulo:"Inauguración con Ferias Especiales, shows, skate y BMX",
      texto:"El parque abrió formalmente el 27 de julio de 2024.",
      relacion:"Los eventos funcionan como primer contacto del barrio con el espacio.",
      falta:"Agenda oficial de eventos posteriores." },
    { id:"f29", cat:"participacion", estado:"revision", real:false, capa:"voces",
      titulo:"No todos los aportes recibieron una respuesta verificable",
      texto:"La devolución institucional es parte del proceso participativo.",
      relacion:"Sin seguimiento, la participación pierde confianza.",
      falta:"Registro de aportes y respuestas con fecha." },

    // ---- Antecedentes
    { id:"f30", cat:"antecedentes", estado:"validado", real:true, src:"pf", capa:"noticias",
      titulo:"En 2018 la Nación traspasó los terrenos a la Ciudad",
      texto:"El traspaso generó polémica con los vecinos.",
      relacion:"Origen de la tensión entre parque público y desarrollo privado.",
      falta:"Texto de la norma de traspaso y rezonificación." },
    { id:"f31", cat:"antecedentes", estado:"validado", real:true, src:"c26", capa:"noticias",
      titulo:"El entorno vive un nuevo boom inmobiliario",
      texto:"Departamentos en pozo desde USD 3.200 el m²; más demanda de 2 y 3 ambientes.",
      relacion:"El parque revaloriza el suelo y atrae inversión.",
      falta:"Efectos sobre alquileres y permanencia de vecinos." }
  ],

  /* Documentos y manuales */
  documentos: [
    { tipo:"Nota", titulo:"De estreno: nuevo parque público en uno de los barrios con menos espacio verde", src:"ln" },
    { tipo:"Nota", titulo:"Colegiales: avanza la urbanización en terreno de ex playón ferroviario", src:"pf" },
    { tipo:"Nota", titulo:"Colegiales vive su gran transformación: del viejo playón a un boom inmobiliario", src:"c26" },
    { tipo:"Dato", titulo:"Precio del m² en Colegiales", src:"sv" },
    { tipo:"Datos abiertos", titulo:"Buenos Aires Data: espacios verdes, arbolado, censos", url:"https://data.buenosaires.gob.ar" },
    { tipo:"Normativa", titulo:"Código Urbanístico de la Ciudad de Buenos Aires (cuerpo principal, PDF)", url:"https://static.buenosaires.gob.ar/sites/default/files/2026-05/cu_cuerpo_principal.pdf" },
    { tipo:"Manual", titulo:"Manual de uso de ATLAS: cómo leer y escribir el territorio", accion:"manual" }
  ],

  /* Cómo funciona (6 pasos) */
  pasos: [
    ["Reunir", "Datos oficiales, experiencias, observaciones, normas, proyectos y antecedentes."],
    ["Conservar", "Cada registro mantiene fuente, fecha, lugar, método, versión y validación."],
    ["Filtrar", "Los perfiles proponen un inicio, pero todas las categorías pueden combinarse."],
    ["Relacionar", "Se hacen visibles coincidencias, contradicciones, vacíos y cambios en el tiempo."],
    ["Escribir", "Cada persona construye una interpretación y cita la evidencia que eligió."],
    ["Compartir", "El informe registra filtros, lecturas, fuentes y preguntas pendientes."]
  ],

  /* Flujo de datos: quién aporta y quién recibe (presentación ATLAS) */
  flujo: {
    entradas: [
      { id:"dicen",  nombre:"Personas dicen",        detalle:"reclamos, comentarios y entrevistas", via:"Reseñas, redes y consultas públicas", color:"#9b6cff" },
      { id:"hacen",  nombre:"Personas hacen",        detalle:"recorridos, permanencias y usos",     via:"Observación, conteos y registros",   color:"#9b6cff" },
      { id:"muestra",nombre:"El territorio muestra", detalle:"accesos, clima, movilidad y estado",  via:"Sensores, mapas y datos abiertos",   color:"#f8e544" },
      { id:"definen",nombre:"Instituciones definen", detalle:"normas, permisos, obras y presupuesto",via:"Documentos y portales oficiales",    color:"#00e887" }
    ],
    salidas: [
      { id:"ciudadanos", nombre:"Ciudadanía",     recibe:"información comprensible, seguimiento de sus aportes, espacios para participar", color:"#9b6cff" },
      { id:"publico",    nombre:"Sector público", recibe:"necesidades identificadas, tensiones entre actores, criterios para priorizar", color:"#00e887" },
      { id:"privado",    nombre:"Sector privado", recibe:"necesidades del territorio, inversiones, criterios para evaluar propuestas", color:"#08b8f8" }
    ]
  },

  /* Matriz de oportunidades (del gráfico del equipo) */
  matriz: {
    tipos: { gastro:["Espacio gastronómico","#e07ab5"], deporte:["Deporte y recreación","#f2a04a"], cultura:["Cultura y eventos","#5cb85c"], infra:["Infraestructura y servicio","#ef6b6b"], comercio:["Comercio y economía","#c4b5f5"], tec:["Tecnología/innovación","#7cc4f2"], inmo:["Desarrollo inmobiliario","#b5e655"], otros:["Otros","#f5c542"] },
    // nombre, demanda (0-1), potencial (0-1), tipo, impacto 1-3, actores (u=ciudadanos p=público v=privado)
    items: [
      ["Polo tecnológico",.22,.85,"tec",1,"v"], ["Desarrollo inmobiliario",.34,.72,"inmo",1,"v"], ["Espacios de cowork",.33,.56,"comercio",2,"u"],
      ["Gastronomía y servicios",.72,.86,"gastro",3,"v"], ["Infraestructura deportiva",.67,.73,"deporte",2,"p"], ["Actividades culturales y eventos",.84,.64,"cultura",2,"up"],
      ["Mejora de espacios verdes y mobiliario",.68,.55,"otros",2,"uv"], ["Nuevos centros comerciales",.4,.36,"comercio",1,"v"], ["Estacionamiento",.08,.2,"infra",1,"u"],
      ["Equipamiento administrativo",.38,.16,"otros",2,"p"], ["Accesibilidad y movilidad",.63,.33,"infra",2,"up"], ["Baños públicos y servicios básicos",.88,.29,"infra",2,"p"],
      ["Más seguridad",.66,.15,"infra",1,"pv"], ["Iluminación",.85,.12,"infra",1,"p"]
    ]
  }
};
