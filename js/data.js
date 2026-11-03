/* =========================================================================
   ATLAS · DATOS
   -------------------------------------------------------------------------
   Este archivo es el único lugar donde viven los datos del sitio.
   Podés editar todo desde acá sin tocar la lógica.

   Cada dato tiene una marca:
     real: true   → dato verificado (con su fuente en "fuente")
     real: false  → dato de EJEMPLO / simulado, para reemplazar con
                    datos de sensores, relevamientos o portales oficiales.

   Coordenadas:
     · Mapa de CABA  → latitud / longitud reales (aprox.)
     · Plano del parque → x / y dentro de un lienzo de 1600 x 700
       (esquema, no a escala). Para mover algo, cambiá x / y.
   ========================================================================= */

window.ATLAS_DATA = {

  meta: {
    proyecto: "ATLAS",
    bajada: "metodología participativa para leer territorios compartidos",
    equipo: ["Fuentes", "Oro", "Zita"],
    curso: "LAB VIII"
  },

  /* Paleta de la identidad ATLAS */
  colores: {
    ciudadanos: "#9b6cff",
    publico:    "#00e887",
    privado:    "#08b8f8",
    acento:     "#f8e544",
    conflictos: "#3fa45d",
    necesidades:"#5e45a8",
    recursos:   "#235676",
    alerta:     "#ff5a4e"
  },

  /* ---------------------------------------------------------------------
     MAPA ESQUEMÁTICO DE CABA (lat, lon)
     --------------------------------------------------------------------- */
  caba: {
    // Contorno simplificado: costa del Río de la Plata → Riachuelo → Gral. Paz
    contorno: [
      [-34.5365,-58.4640],[-34.5450,-58.4440],[-34.5560,-58.4165],[-34.5640,-58.4040],
      [-34.5780,-58.3900],[-34.5870,-58.3720],[-34.5950,-58.3640],[-34.6020,-58.3500],
      [-34.6100,-58.3330],[-34.6270,-58.3410],[-34.6360,-58.3500],[-34.6390,-58.3610],
      [-34.6460,-58.3700],[-34.6480,-58.3820],[-34.6530,-58.3960],[-34.6600,-58.4120],
      [-34.6650,-58.4260],[-34.6820,-58.4400],[-34.6950,-58.4560],[-34.7055,-58.4615],
      [-34.6850,-58.4880],[-34.6700,-58.5060],[-34.6550,-58.5220],[-34.6430,-58.5290],
      [-34.6300,-58.5310],[-34.6150,-58.5300],[-34.6020,-58.5290],[-34.5900,-58.5200],
      [-34.5800,-58.5110],[-34.5700,-58.5050],[-34.5600,-58.4980],[-34.5500,-58.4860],
      [-34.5420,-58.4740]
    ],
    avenidas: [
      { nombre: "Av. Rivadavia", pts: [[-34.6085,-58.3720],[-34.6110,-58.4050],[-34.6180,-58.4400],[-34.6280,-58.4800],[-34.6390,-58.5290]] },
      { nombre: "Av. Corrientes", pts: [[-34.6035,-58.3700],[-34.6040,-58.4100],[-34.5990,-58.4320],[-34.5870,-58.4540]] },
      { nombre: "Av. Santa Fe / Cabildo", pts: [[-34.5940,-58.3770],[-34.5880,-58.4100],[-34.5780,-58.4290],[-34.5650,-58.4530],[-34.5470,-58.4710]] },
      { nombre: "Av. del Libertador", pts: [[-34.5870,-58.3800],[-34.5780,-58.4040],[-34.5620,-58.4430],[-34.5440,-58.4630]] },
      { nombre: "Av. 9 de Julio", pts: [[-34.5910,-58.3820],[-34.6300,-58.3810]] },
      { nombre: "Av. Juan B. Justo", pts: [[-34.5780,-58.4250],[-34.5960,-58.4510],[-34.6150,-58.4900],[-34.6390,-58.5280]] },
      { nombre: "Av. Federico Lacroze", pts: [[-34.5680,-58.4370],[-34.5765,-58.4485],[-34.5860,-58.4560]] },
      { nombre: "Av. Directorio", pts: [[-34.6250,-58.4100],[-34.6350,-58.4500],[-34.6480,-58.4950]] },
      { nombre: "Av. Gral. Paz", pts: [] }
    ],
    vias: [
      { nombre: "FFCC Mitre", pts: [[-34.5910,-58.3740],[-34.5770,-58.4180],[-34.5735,-58.4490],[-34.5600,-58.4750],[-34.5470,-58.4890]] },
      { nombre: "FFCC Sarmiento", pts: [[-34.6090,-58.4060],[-34.6080,-58.4300],[-34.6270,-58.4910],[-34.6390,-58.5300]] },
      { nombre: "FFCC San Martín", pts: [[-34.5910,-58.3740],[-34.5800,-58.4280],[-34.5880,-58.4560],[-34.6010,-58.5280]] },
      { nombre: "FFCC Roca", pts: [[-34.6275,-58.3810],[-34.6420,-58.3800],[-34.6520,-58.3880]] }
    ],
    barrios: [
      ["Núñez",-34.5460,-58.4590],["Belgrano",-34.5610,-58.4560],["Colegiales",-34.5760,-58.4560],
      ["Palermo",-34.5800,-58.4250],["Recoleta",-34.5900,-58.3950],["Villa Urquiza",-34.5720,-58.4880],
      ["Chacarita",-34.5880,-58.4560],["Caballito",-34.6180,-58.4440],["Almagro",-34.6080,-58.4200],
      ["San Telmo",-34.6210,-58.3720],["La Boca",-34.6345,-58.3630],["Flores",-34.6300,-58.4650],
      ["Villa Devoto",-34.6000,-58.5130],["Mataderos",-34.6560,-58.5030],["Villa Lugano",-34.6770,-58.4720],
      ["Barracas",-34.6450,-58.3850],["Parque Patricios",-34.6380,-58.4050],["Saavedra",-34.5550,-58.4870]
    ]
  },

  /* ---------------------------------------------------------------------
     ESPACIOS VERDES (ubicación aproximada)
     estado: "activo"     → parque actual: ATLAS está ahí ahora (amarillo)
             "completado" → ya leído; se usa para comparar (verde)
             "pendiente"  → todavía no relevado: gris, se puede votar
     forma: circulo | triangulo | cuadrado | hexagono | reuleaux | rombo
     --------------------------------------------------------------------- */
  espacios: [
    { id:"colegiales", nombre:"Parque Ferroviario Colegiales", barrio:"Colegiales", comuna:13, lat:-34.5745, lon:-58.4505, ha:3,   forma:"reuleaux",  estado:"activo" },
    { id:"bosques",    nombre:"Bosques de Palermo",            barrio:"Palermo",    comuna:14, lat:-34.5715, lon:-58.4170, ha:80,  forma:"circulo",   estado:"pendiente" },
    { id:"reserva",    nombre:"Reserva Ecológica Costanera Sur",barrio:"Puerto Madero",comuna:1,lat:-34.6125,lon:-58.3480, ha:80, forma:"hexagono", estado:"pendiente" },
    { id:"centenario", nombre:"Parque Centenario",             barrio:"Caballito",  comuna:6,  lat:-34.6065, lon:-58.4355, ha:10,  forma:"circulo",   estado:"completado" },
    { id:"chacabuco",  nombre:"Parque Chacabuco",              barrio:"Parque Chacabuco",comuna:7,lat:-34.6350,lon:-58.4380,ha:18, forma:"cuadrado",  estado:"pendiente" },
    { id:"avellaneda", nombre:"Parque Avellaneda",             barrio:"Parque Avellaneda",comuna:9,lat:-34.6470,lon:-58.4785,ha:30,forma:"triangulo", estado:"pendiente" },
    { id:"indoamericano",nombre:"Parque Indoamericano",        barrio:"Villa Soldati",comuna:8,lat:-34.6680,lon:-58.4500, ha:60,  forma:"hexagono",  estado:"pendiente" },
    { id:"lezama",     nombre:"Parque Lezama",                 barrio:"San Telmo",  comuna:1,  lat:-34.6285, lon:-58.3695, ha:8,   forma:"triangulo", estado:"pendiente" },
    { id:"saavedra",   nombre:"Parque Saavedra",               barrio:"Saavedra",   comuna:12, lat:-34.5535, lon:-58.4825, ha:10,  forma:"cuadrado",  estado:"pendiente" },
    { id:"sarmiento",  nombre:"Parque Sarmiento",              barrio:"Saavedra",   comuna:12, lat:-34.5590, lon:-58.5020, ha:40,  forma:"rombo",     estado:"pendiente" },
    { id:"losandes",   nombre:"Parque Los Andes",              barrio:"Chacarita",  comuna:15, lat:-34.5890, lon:-58.4470, ha:6,   forma:"circulo",   estado:"pendiente" },
    { id:"lasheras",   nombre:"Parque Las Heras",              barrio:"Palermo",    comuna:14, lat:-34.5855, lon:-58.4060, ha:12,  forma:"cuadrado",  estado:"pendiente" },
    { id:"patricios",  nombre:"Parque de los Patricios",       barrio:"Parque Patricios",comuna:4,lat:-34.6375,lon:-58.4005,ha:10, forma:"rombo",     estado:"pendiente" },
    { id:"rivadavia",  nombre:"Parque Rivadavia",              barrio:"Caballito",  comuna:6,  lat:-34.6185, lon:-58.4345, ha:5,   forma:"triangulo", estado:"pendiente" },
    { id:"donado",     nombre:"Corredor Donado-Holmberg",      barrio:"Villa Urquiza",comuna:12,lat:-34.5700,lon:-58.4720, ha:3,   forma:"rombo",     estado:"pendiente" },
    { id:"estacion",   nombre:"Parque de la Estación",         barrio:"Balvanera",  comuna:3,  lat:-34.6085, lon:-58.4090, ha:2,   forma:"hexagono",  estado:"pendiente" }
  ],

  /* ---------------------------------------------------------------------
     TERRITORIO TESTIGO: PARQUE FERROVIARIO COLEGIALES
     --------------------------------------------------------------------- */
  parque: {
    nombre: "Parque Ferroviario Colegiales",
    ubicacion: "Colegiales · Comuna 13",
    lectura: "Parque construido por etapas sobre suelo ferroviario, con fuentes documentales, observación y evaluación en proceso.",
    datos: [
      { valor:"14.200 m²", label:"superficie oficial", nota:"actualización 5/10/2026", real:true, fuente:"Relevamiento ATLAS" },
      { valor:"17",        label:"evidencias conectadas", real:true, fuente:"Relevamiento ATLAS" },
      { valor:"+250",      label:"árboles plantados", real:true, fuente:"La Nación, 27/07/2024" },
      { valor:"27/07/2024",label:"inauguración formal", real:true, fuente:"La Nación, 27/07/2024" },
      { valor:"+80.000",   label:"vecinos en el área de influencia", real:true, fuente:"La Nación, 27/07/2024" },
      { valor:"100% LED",  label:"iluminación", real:true, fuente:"La Nación, 27/07/2024" }
    ],

    /* Calles del esquema (izquierda → derecha) */
    calles: ["Av. Federico Lacroze","Teodoro García","Palpa","Aguilar","Zabala","Virrey Olaguer y Feliú"],

    /* Zonas del parque (plano 1600 x 700). Sirven para ubicarse y para acercar el plano.
       corto: nombre breve para los botones de zona */
    zonas: [
      { id:"lacroze",   nombre:"Plaza Lacroze",               corto:"Plaza Lacroze", x:235,  y:300 },
      { id:"estacion",  nombre:"Estación Colegiales",         corto:"Estación",      x:215,  y:432 },
      { id:"feria",     nombre:"Feria gastronómica",          corto:"Feria",         x:345,  y:304 },
      { id:"vagones",   nombre:"Sector de los vagones",       corto:"Vagones",       x:415,  y:350 },
      { id:"galpon",    nombre:"Galpón Mitre",                corto:"Galpón",        x:525,  y:325 },
      { id:"juegos",    nombre:"Juegos infantiles Palpa",     corto:"Juegos",        x:665,  y:282 },
      { id:"pergolas",  nombre:"Pérgolas",                    corto:"Pérgolas",      x:805,  y:284 },
      { id:"distrito",  nombre:"Distrito Colegiales (privado)",corto:"Lote privado", x:775,  y:200 },
      { id:"skate",     nombre:"Skate y BMX",                 corto:"Skate",         x:1000, y:263 },
      { id:"huerta",    nombre:"Huerta comunitaria · Zabala", corto:"Huerta",        x:1135, y:254 },
      { id:"pergolas2", nombre:"Pérgolas Zabala",             corto:"Pérgolas 2",    x:1240, y:247 },
      { id:"jjpaso",    nombre:"Plaza Juan José Paso",        corto:"Plaza J. J. Paso", x:1355, y:236 },
      { id:"olaguer",   nombre:"Acceso Olaguer y Feliú",      corto:"Acceso Olaguer", x:1495, y:206 }
    ],

    /* Sensores (simulados). tipo: camara | sonido | movimiento */
    sensores: [
      { id:"C-01", tipo:"camara", x:170,  y:330, dir:20 },
      { id:"C-02", tipo:"camara", x:450,  y:300, dir:-10 },
      { id:"C-03", tipo:"camara", x:760,  y:265, dir:0 },
      { id:"C-04", tipo:"camara", x:1020, y:240, dir:190 },
      { id:"C-05", tipo:"camara", x:1290, y:255, dir:170 },
      { id:"C-06", tipo:"camara", x:1480, y:240, dir:180 },
      { id:"S-01", tipo:"sonido", x:280,  y:360 },
      { id:"S-02", tipo:"sonido", x:620,  y:300 },
      { id:"S-03", tipo:"sonido", x:960,  y:290 },
      { id:"S-04", tipo:"sonido", x:1240, y:270 },
      { id:"M-01", tipo:"movimiento", x:140,  y:300 },
      { id:"M-02", tipo:"movimiento", x:380,  y:330 },
      { id:"M-03", tipo:"movimiento", x:700,  y:300 },
      { id:"M-04", tipo:"movimiento", x:1080, y:265 },
      { id:"M-05", tipo:"movimiento", x:1400, y:240 }
    ]
  },

  /* ---------------------------------------------------------------------
     PARQUE CENTENARIO · lectura COMPLETADA, solo capas sociales.
     Sirve para comparar con el parque actual (sección "Compará").
     Todo es EJEMPLO hasta cargar conteos y encuestas reales.
     --------------------------------------------------------------------- */
  centenario: {
    nombre: "Parque Centenario",
    ubicacion: "Caballito · Comuna 6",
    m2: 100000,                 // ≈ 10 ha
    estado: "Lectura completada",
    real: false,
    transito: {
      semana: [10,5,3,2,2,6,30,80,110,95,90,100,130,140,120,115,140,190,230,210,160,100,50,20],
      finde:  [25,12,6,3,3,5,15,40,90,160,230,290,330,340,320,310,330,320,280,220,150,90,50,30]
    },
    personas: {
      edad:    { "Niñez 0–12":22, "Jóvenes 13–29":28, "Adultos 30–59":32, "Mayores 60+":18 },
      genero:  { "Mujeres":52, "Varones":45, "No binario / otro":3 },
      mascota: { "Con mascota":30, "Sin mascota":70 },
      compania:{ "Solas":26, "En pareja":20, "En familia":36, "En grupo":18 }
    },
    voces: [
      { t:"feria de libros", tipo:"recomendacion", n:31 },
      { t:"limpieza del lago", tipo:"pedido", n:28 },
      { t:"más seguridad", tipo:"queja", n:24 },
      { t:"baños públicos", tipo:"pedido", n:22 },
      { t:"shows en el anfiteatro", tipo:"recomendacion", n:20 },
      { t:"perros sueltos", tipo:"queja", n:18 },
      { t:"bicisenda", tipo:"pedido", n:15 },
      { t:"ruido de la avenida", tipo:"queja", n:14 },
      { t:"juegos inclusivos", tipo:"pedido", n:12 },
      { t:"más bancos", tipo:"pedido", n:10 },
      { t:"gastronomía", tipo:"recomendacion", n:9 }
    ]
  },

  /* ---------------------------------------------------------------------
     CAPAS DE INFORMACIÓN
     --------------------------------------------------------------------- */
  capas: {

    seguridad: {
      real: false,
      // Índice 0–100 de seguridad percibida por hora (0 = 00 h). EJEMPLO.
      porHora: [38,30,24,22,22,28,52,70,80,84,86,88,88,88,86,84,82,76,66,58,52,48,44,40],
      franjas: [
        { id:"madrugada", label:"Madrugada", desde:0,  hasta:6,  camaras:6, patrullas:1 },
        { id:"manana",    label:"Mañana",    desde:6,  hasta:12, camaras:6, patrullas:2 },
        { id:"tarde",     label:"Tarde",     desde:12, hasta:19, camaras:6, patrullas:3 },
        { id:"noche",     label:"Noche",     desde:19, hasta:24, camaras:6, patrullas:2 }
      ],
      notas: [
        { t:"Iluminación 100% LED para uso las 24 h", real:true, fuente:"La Nación, 27/07/2024" },
        { t:"El parque integra el Plan de Parques Seguros de la Ciudad", real:true, fuente:"La Nación, 27/07/2024" },
        { t:"Zona más oscura reportada: borde de vías entre Palpa y Aguilar", real:false }
      ]
    },

    transito: {
      real: false,
      // Personas presentes en el parque por hora (EJEMPLO, reemplazar con conteos/sensores)
      semana: [4,2,1,1,1,3,10,28,45,38,30,34,48,52,40,36,44,62,80,76,58,36,18,8],
      finde:  [8,4,2,1,1,2,5,12,25,40,58,70,82,85,80,78,82,86,80,64,45,30,18,10]
    },

    personas: {
      real: false,
      edad:    { "Niñez 0–12":18, "Jóvenes 13–29":31, "Adultos 30–59":34, "Mayores 60+":17 },
      genero:  { "Mujeres":51, "Varones":46, "No binario / otro":3 },
      mascota: { "Con mascota":22, "Sin mascota":78 },
      compania:{ "Solas":34, "En pareja":22, "En familia":28, "En grupo":16 }
    },

    ruido: {
      real: false,
      fuentes: [
        { nombre:"Paso del tren (FFCC Mitre)", x:420,  y:395, db:82 },
        { nombre:"Av. Federico Lacroze",       x:105,  y:300, db:74 },
        { nombre:"Feria gastronómica",         x:330,  y:300, db:70 },
        { nombre:"Plaza de juegos",            x:660,  y:280, db:68 },
        { nombre:"Skate / BMX",                x:1000, y:260, db:66 },
        { nombre:"Sector Zabala (calmo)",      x:1180, y:255, db:46 }
      ]
    },

    proyectos: [
      { id:"distrito", nombre:"Distrito Colegiales", actor:"privado", estado:"En obra", progreso:60,
        dato:"+USD 25 M", x:700, y:180, w:150, h:46, real:true,
        desc:"Edificios privados sobre Moldes, entre Palpa y Aguilar. Lotes vendidos a Sancor Seguros (~USD 19 M).",
        fuente:"Perfil, 30/01/2021" },
      { id:"etapa3", nombre:"Parque · Etapa 3", actor:"publico", estado:"Terminado", progreso:100,
        dato:"Zabala–Palpa", x:860, y:255, w:120, h:30, real:true,
        desc:"Extensión de Virrey Olaguer y Feliú, tramo Zabala–Palpa, veredas de Moldes y apertura de Palpa y Aguilar.",
        fuente:"La Nación, 27/07/2024" },
      { id:"lacroze", nombre:"Plaza Lacroze", actor:"publico", estado:"Propuesta", progreso:20,
        dato:"3.400 m²", x:190, y:285, w:110, h:40, real:false,
        desc:"Suelo absorbente, arbolado nativo y juegos infantiles sobre Av. Lacroze." },
      { id:"interp", nombre:"Centro de Interpretación Ferroviaria", actor:"publico", estado:"Propuesta", progreso:10,
        dato:"1.100 m²", x:300, y:345, w:80, h:30, real:false,
        desc:"Museo y espacio de memoria del Ferrocarril Mitre de la Comuna 13." },
      { id:"galpon", nombre:"Galpón Cultural Mitre", actor:"ciudadanos", estado:"Propuesta", progreso:35,
        dato:"1.800 m²", x:470, y:315, w:110, h:28, real:false,
        desc:"Recuperación del galpón ferroviario para ferias y talleres." },
      { id:"palpa", nombre:"Plaza de Juegos Palpa", actor:"publico", estado:"Propuesta", progreso:45,
        dato:"2.200 m²", x:620, y:262, w:80, h:34, real:false,
        desc:"Área recreativa familiar con juegos inclusivos y vegetación densa." },
      { id:"puntoverde", nombre:"Punto Verde Reciclaje Aguilar", actor:"ciudadanos", estado:"Propuesta", progreso:15,
        dato:"650 m²", x:900, y:282, w:50, h:24, real:false,
        desc:"Centro de separación de residuos secos y compostera comunitaria." },
      { id:"pabellon", nombre:"Pabellón Comunitario Zabala", actor:"ciudadanos", estado:"Propuesta", progreso:25,
        dato:"1.350 m²", x:1100, y:240, w:90, h:30, real:false,
        desc:"Espacio multipropósito para actividades comunales y talleres de huerta urbana." },
      { id:"transbordo", nombre:"Nodo Transbordo Estación", actor:"privado", estado:"Propuesta", progreso:5,
        dato:"920 p/h", x:150, y:375, w:70, h:24, real:false,
        desc:"Punto de flujo peatonal integrador entre los andenes de la Estación Colegiales y el parque." }
    ],

    eventos: [
      { fecha:"2024-07-27", titulo:"Inauguración del parque: Ferias Especiales, shows, skate y BMX", tipo:"feria", x:250, y:300, real:true, fuente:"La Nación, 27/07/2024" },
      { fecha:"2025-03-15", titulo:"Asamblea vecinal: ¿qué hacemos con el galpón?", tipo:"encuentro", x:520, y:325, real:false },
      { fecha:"2025-06-21", titulo:"Concierto de invierno en Plaza Lacroze", tipo:"concierto", x:240, y:305, real:false },
      { fecha:"2025-09-20", titulo:"Primavera en el parque: feria de diseño", tipo:"feria", x:700, y:285, real:false },
      { fecha:"2025-11-08", titulo:"Ronda vecinal “100% parque”", tipo:"manifestacion", x:770, y:225, real:false },
      { fecha:"2026-04-12", titulo:"Taller de huerta urbana", tipo:"encuentro", x:1140, y:252, real:false },
      { fecha:"2026-08-30", titulo:"Ciclo de cine al aire libre", tipo:"concierto", x:1300, y:235, real:false },
      { fecha:"2026-10-25", titulo:"Feria de pulgas y vinilos", tipo:"feria", x:400, y:310, real:false },
      { fecha:"2026-11-14", titulo:"Recorrido participativo ATLAS", tipo:"encuentro", x:900, y:275, real:false },
      { fecha:"2026-12-05", titulo:"Concierto de fin de año", tipo:"concierto", x:260, y:300, real:false },
      { fecha:"2027-03-20", titulo:"Marcha por más espacio verde en la Comuna 13", tipo:"manifestacion", x:150, y:300, real:false }
    ],

    noticias: [
      { fecha:"27/07/2024", medio:"La Nación", tipo:"innovacion",
        titulo:"De estreno: nuevo parque público en uno de los barrios con menos espacio verde de la ciudad",
        url:"https://www.lanacion.com.ar/sociedad/de-estreno-nuevo-parque-publico-en-uno-de-los-barrios-con-menos-espacio-verde-de-la-ciudad-nid27072024/",
        x:250, y:300, real:true },
      { fecha:"30/01/2021", medio:"Perfil", tipo:"urbanismo",
        titulo:"Colegiales: avanza la urbanización en terreno de ex playón ferroviario",
        url:"https://www.perfil.com/noticias/sociedad/colegiales-avanza-la-urbanizacion-en-terreno-de-ex-playon-ferroviario.phtml",
        x:770, y:205, real:true },
      { fecha:"17/03/2026", medio:"Canal 26", tipo:"urbanismo",
        titulo:"Colegiales vive su gran transformación: del viejo playón ferroviario a un nuevo boom inmobiliario",
        url:"https://www.canal26.com/general/2026/03/17/colegiales-vive-su-gran-transformacion-del-viejo-playon-ferroviario-a-un-nuevo-boom-inmobiliario-en-el-norte-porteno/",
        x:900, y:230, real:true },
      { fecha:"ejemplo", medio:"Vecinos", tipo:"seguridad",
        titulo:"Reportan robos de celulares en el acceso de Av. Lacroze por la noche",
        x:115, y:310, real:false },
      { fecha:"ejemplo", medio:"Vecinos", tipo:"innovacion",
        titulo:"Se suman sensores de ruido y calidad de aire en el parque",
        x:1240, y:270, real:false },
      { fecha:"ejemplo", medio:"Comuna 13", tipo:"seguridad",
        titulo:"Piden más iluminación sobre el borde de las vías entre Palpa y Aguilar",
        x:820, y:330, real:false }
    ],

    voces: {
      real: false,
      // tipo: queja | recomendacion | pedido   n = cantidad de menciones (EJEMPLO)
      palabras: [
        { t:"baños públicos", tipo:"pedido", n:34 },
        { t:"más seguridad", tipo:"queja", n:29 },
        { t:"iluminación", tipo:"queja", n:24 },
        { t:"sombra", tipo:"pedido", n:21 },
        { t:"gastronomía", tipo:"recomendacion", n:19 },
        { t:"actividades culturales", tipo:"recomendacion", n:18 },
        { t:"accesibilidad", tipo:"pedido", n:16 },
        { t:"ruido del tren", tipo:"queja", n:15 },
        { t:"bebederos", tipo:"pedido", n:14 },
        { t:"arbolado nativo", tipo:"recomendacion", n:13 },
        { t:"perros sueltos", tipo:"queja", n:12 },
        { t:"feria los findes", tipo:"recomendacion", n:12 },
        { t:"más bancos", tipo:"pedido", n:11 },
        { t:"bicicleteros", tipo:"pedido", n:9 },
        { t:"canchas", tipo:"pedido", n:9 },
        { t:"no a las torres", tipo:"queja", n:17 },
        { t:"huerta comunitaria", tipo:"recomendacion", n:8 },
        { t:"estacionamiento", tipo:"queja", n:6 },
        { t:"cowork al aire libre", tipo:"recomendacion", n:5 },
        { t:"skate", tipo:"recomendacion", n:7 }
      ]
    },

    restricciones: {
      reglas: [
        { t:"52% del predio debe ser superficie verde y 48% superficie seca.", real:true, fuente:"Perfil, 30/01/2021" },
        { t:"78% de la superficie es para uso de los vecinos y 22% para construcción privada.", real:true, fuente:"Perfil, 30/01/2021" },
        { t:"Lo nuevo no puede superar la altura de los edificios actuales de la zona.", real:true, fuente:"Perfil, 30/01/2021" },
        { t:"Estación Colegiales: edificio ferroviario con valor patrimonial, no se demuele.", real:false },
        { t:"Dentro del parque no se permiten centros comerciales ni grandes superficies.", real:false },
        { t:"No se pueden talar árboles sin autorización (arbolado público).", real:false }
      ],
      // Simulador "intentá construir". Pisos máximos por lugar (EJEMPLO, verificar con Código Urbanístico)
      lugares: [
        { id:"moldes",   nombre:"Lote sobre Moldes (Palpa–Aguilar)", maxPisos:10, usos:["vivienda","oficinas","local"] },
        { id:"parque",   nombre:"Dentro del parque",                 maxPisos:0,  usos:[] },
        { id:"estacion", nombre:"Estación Colegiales",               maxPisos:0,  usos:[], patrimonio:true }
      ],
      usos: [
        { id:"vivienda", nombre:"Vivienda" },
        { id:"oficinas", nombre:"Oficinas" },
        { id:"local",    nombre:"Local de barrio" },
        { id:"shopping", nombre:"Centro comercial" }
      ]
    },

    censo: {
      poblacionComuna: { valor:231331, label:"habitantes en la Comuna 13", real:true, fuente:"Censo 2010 (INDEC / DGEyC)" },
      m2Usado:  { valor:2725, label:"USD por m² · usado (2 amb.)", real:true, fuente:"DGEyC CABA, 1er trim. 2026 (vía servidos.ar)" },
      m2Pozo:   { valor:3200, label:"USD por m² · en pozo", real:true, fuente:"Canal 26, 17/03/2026" },
      // Pirámide aproximada (EJEMPLO) – % por grupo
      piramide: [
        { g:"80+",   m:2.1, v:1.2 }, { g:"70–79", m:3.6, v:2.6 }, { g:"60–69", m:5.4, v:4.4 },
        { g:"50–59", m:6.0, v:5.3 }, { g:"40–49", m:7.4, v:6.8 }, { g:"30–39", m:8.6, v:8.1 },
        { g:"20–29", m:7.8, v:7.4 }, { g:"10–19", m:5.2, v:5.4 }, { g:"0–9",   m:5.0, v:5.3 }
      ],
      nse: { label:"Nivel socioeconómico predominante", valor:"medio-alto", real:false }
    }
  }
};
