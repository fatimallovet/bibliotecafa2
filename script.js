// BiblioFa script.js · Actualizado: 2026-08-14
// - v1.32.1: ajustes al Duelo de Personajes a partir de feedback sobre v1.32.0.
//   (1) Se quitaron los tiers "2" de todas las categorías — ya no se mezclan
//   niveles dentro de una categoría, cada una es un solo grupo parejo (esto
//   deja fuera definitivamente a los personajes más jóvenes/menores: Lucy
//   Pevensie, Sophie Hatter, Harry Potter joven, Percy Jackson, Jim Hawkins,
//   Artemis Fowl, etc. — ver duelo_personajes_reset_v5.sql). (2) Se eliminó
//   la categoría "Villanos" (DUELO_CATEGORIAS bajó de 5 a 4): era la más
//   chica y varios de sus personajes no eran villanos en sentido estricto.
//   Los que sí encajaban por astucia/estrategia se reubicaron en Mentes
//   Maestras (Moriarty, Milady de Winter, Richelieu, Danglars, Snow,
//   Claudio, Wargrave); el resto se eliminó del roster. (3) Las 4 categorías
//   restantes quedaron parejas en 25 personajes cada una, con personajes
//   nuevos sacados del catálogo real de Fátima (El Señor de los Anillos:
//   Aragorn y Boromir en Capa y Espada, Éowyn en Mujeres de Carácter — como
//   pidió; más El archivo de las tormentas, Nacidos de la Bruma, Sherlock
//   Holmes, Oliver Twist, Quo Vadis, El manto sagrado, El prisionero de
//   Zenda, La Pimpinela Escarlata, Las cuatro plumas, Las ruinas de Gorlan,
//   Guerra y paz, Cumbres Borrascosas, El idiota).
// - v1.32.0: rehecho el Duelo de Personajes de raíz. (1) Rating tipo Elo
//   (como en ajedrez): cada personaje arranca en 1500 y su rating sube o
//   baja según qué tan "sorprendente" fue el resultado de cada voto, en
//   vez de usar el % crudo — ver duelo_personajes_migracion_v6_elo.sql
//   (función duelo_votar_elo, RPC que guarda el voto Y mueve el Elo en
//   una sola operación). El ranking de categoría y el top 3 ahora ordenan
//   por Elo. (2) Tablas de personajes rehechas (duelo_personajes_reset_v4.sql):
//   se agregó una columna "tier" (1 = poder mayor, 2 = poder emergente) y
//   los duelos solo se generan entre personajes del mismo tier dentro de
//   su categoría, así ya no salen enfrentamientos disparejos (ej. Lucy
//   Pevensie contra Kaladin). Se agregaron personajes nuevos —sacados del
//   catálogo real— para emparejar el tamaño de las 5 categorías (13 a 24
//   personajes, antes 11 a 19). Villanos quedó solo con villanos NO
//   mágicos (los villanos con magia — Voldemort, Sauron, Saruman, la
//   Bruja Blanca, Smaug, el Lord Legislador— se quedaron únicamente en
//   Magia y Poder). (3) El texto de "X votos en este duelo" ahora aclara
//   que es la suma acumulada de TODOS los votos de ese par específico de
//   personajes (no solo los tuyos) — con muchos duelos posibles por
//   categoría es normal tardar en repetir el mismo par. (4) "Lo más
//   votado por categoría" pasó de grid a carrusel horizontal (mismo
//   patrón que quiz-chips-scroll), para que se vea compacto sin importar
//   cuántas categorías haya.
// - v1.31.3: DUELO_MIN_VOTOS bajó de 5 a 1 — cualquier personaje con al menos un voto
//   real puede aparecer en el ranking, sin mínimo artificial. El ranking sigue
//   ordenando por % real de mayor a menor; con muestras chicas es normal y esperado
//   ver varios empatados en 100% (ya no se "arregla" ocultando a esos personajes). El
//   desempate entre empatados usa votos_totales (más votos primero) solo para que el
//   orden dentro del empate tenga sentido — el % mostrado no cambia con eso.
// - v1.31.2: se revirtió el orden por ranking_score (Wilson) en los rankings del Duelo
//   de Personajes — volvió a ordenar por % real, de mayor a menor (más predecible: el
//   número que se ve es el mismo que decide el orden). La columna ranking_score se
//   queda en la vista de Supabase por si se vuelve a necesitar, pero ya no se usa en
//   el front.
// - v1.31.1: (1) Encabezado de Brújula Lectora rediseñado (quiz-hero: ícono grande +
//   título serif itálica + subtítulo con más cuerpo) — se veía plano comparado con el
//   resto del quiz. (2) Resultado del quiz: la lista vertical de arquetipos se
//   reemplazó por un carrusel horizontal de chips compactos (quiz-chips-scroll), con
//   la frase del arquetipo activo mostrada aparte, debajo del carrusel. La tarjeta
//   "Tu mezcla lectora de hoy" ya no depende de cuántos arquetipos traiga el
//   desglose para su altura, así que las recomendaciones quedan visibles sin tanto
//   scroll.
// - v1.31.0: (1) Reto Literario — la tabla de posiciones ya no está detrás de un
//   toggle: se pinta siempre, en su propia tarjeta (retoTablaBloque) debajo de la de
//   apodo. Contenedor un poco más ancho (560px → 640px). (2) Duelo de Personajes —
//   contenedor más ancho (860px), pantallas reorganizadas en bloques con separadores
//   (categorías / top 3 / duelistas, y VS-card / ranking), elementos centrados, tarjeta
//   VS con más aire. (3) Ranking de personajes: el orden ahora usa un Wilson score en
//   vez del % crudo, para que un personaje con 1 voto (100%) no le gane a otro con
//   muchos más votos y un % real más confiable — ver duelo_personajes_migracion_v5_wilson.sql.
//   El % que se muestra en pantalla no cambió, solo el criterio de orden.
// - v1.30.2: se revirtió el intento de ponderar 3 preguntas del quiz (volvió a que las
//   12 valgan 1 punto parejo). En su lugar, el resultado ya no muestra un encabezado
//   grande de "Eres un X" separado — ahora es solo el cuadrito "Tu mezcla lectora de
//   hoy", con las filas de cada arquetipo mostrando emoji, título, frase y %, tocables
//   para ver sus recomendaciones (mismo comportamiento de antes, solo que ahora es lo
//   único que se ve arriba). CSS de header/quiz-tagline que quedó sin uso, eliminado.
// - v1.30.0: (1) Duelo de Personajes — cuadritos de "top 3" por categoría en la
//   pantalla de selección, tocables para saltar directo a esa categoría. (2) Brújula
//   Lectora — "Explorador Intrépido" pasó a llamarse "Corazón Aventurero" y "Buscador
//   de Raíces" a "Viajero en el Tiempo" (se parecían demasiado a "Explorador de
//   Mundos" y "Buscador de Sentido"). (3) Layout del resultado del quiz reescrito con
//   CSS grid en vez de flexbox+wrap — el wrap causaba una ruptura visual en anchos de
//   pantalla intermedios. (4) Texto de la pestaña del quiz actualizado.
// - v1.29.2: corregido el ranking por categoría del Duelo de Personajes. Antes salían
//   primero los personajes con 0 votos (NULL ordena antes que los números en DESC),
//   mostrando "0%" en 1er lugar. Ahora esos personajes se excluyen del ranking hasta
//   que tengan al menos un voto, y la etiqueta ya no dice "(N duelos)" —que solo
//   contaba cuántos rivales tiene en el roster, sin relación con los votos— sino
//   "(X/Y votos)": cuántas veces lo eligieron de los votos totales que ha recibido.
// - v1.29.1: categorías reales del Duelo de Personajes (reemplazan las 7 de prueba):
//   Magia y Poder, Mentes Maestras, Capa y Espada, Mujeres de Carácter, Villanos.
// - v1.29.0: nueva pestaña "Duelo de Personajes" (Curiosidades) — votación de "quién
//   ganaría" entre dos personajes de libros, por categoría. Sin respuesta correcta: los
//   votos de todos se acumulan y arman un ranking por personaje (win rate) dentro de
//   cada categoría, más un leaderboard de duelistas más activos. Reutiliza la misma
//   identidad de jugador (jugador_id + apodo) del Reto Literario — mismo nombre en
//   todo el sitio, puntaje de duelos aparte. Backend: tablas duelo_personajes/duelos/
//   duelo_votos + vistas duelo_resultados/personaje_ranking/duelista_ranking en
//   Supabase (ver duelo_personajes_migracion.sql).
// - Barra inferior móvil: solo 4 tabs; Random/Wishlist son botones flotantes también en móvil
// - Acento dorado "favorita" para libros de 5 estrellas
// - Botón Atrás del navegador: navega entre tabs, resultados de Mood y cierra modales/paneles (historial)
// - Ficha de detalle rediseñada: header con subtítulo de autor, chips de género, ficha técnica
//   (tono/ritmo/público) en grid, etiquetas, banner de flags y reseña como cita destacada
// - Ficha de detalle v2: hero navy tipo solapa de libro (título+autor+estrellas en blanco/dorado),
//   specs en línea con divisores en vez de cajas, reseña como pull-quote sin fondo
// - Ficha de detalle v3: layout de 2 columnas en desktop (specs | reseña) para reducir scroll,
//   reseña en fuente normal del sitio (DM Sans, no cursiva) para mejor legibilidad
// - Filtro de géneros: al seleccionar uno, los géneros sin coincidencias se ocultan por completo
//   (antes solo se atenuaban). Botón activo con checkmark para que siempre se note seleccionado.
// - Modal random (renderRandomModal) reescrito para usar el mismo layout que la ficha completa
//   (hero navy + specs + reseña en 2 columnas), con "Otro →" integrado en el hero
// - Rediseño v2 de la ficha (detalle + random): ambos modales ahora se arman con la misma función
//   construirFichaHTML() — una sola columna, encabezado compacto de 2 líneas, tono/ritmo/público/
//   flags como texto plano, "Otro →" movido a la fila de acciones (ya no compite con el título).
//   Acciones ya no son sticky (evita que se encimen con la barra inferior en móvil).
// - Calificaciones con medio punto (ej. 3.5): nuevo helper desglosarEstrellas() usado en todas
//   las estrellas del sitio (tarjetas, ficha, antojos, texto para compartir).
// - Campo "Publicado" (año de publicación) agregado a la ficha completa y al texto para compartir.
// - Orden de la lista: nuevo criterio "Año de publicación" + botón de dirección (↑ ascendente /
//   ↓ descendente) que aplica a cualquier criterio seleccionado.
// - Campo "Lo mejor" agregado a la ficha (después de la reseña, en bloque destacado) y al texto
//   para compartir. Modal más ancho en escritorio (hasta 780px).
// - Sección Mood reestructurada: 10 categorías nuevas (feliz, emocion, atrapar, aventura, pasado,
//   reflexion, inspiracion, reir, clasico, humanidad). Reglas de género+tono+etiquetas ajustadas
//   contra la BD real (Biblioteca_Fatima_BD_COMPLETA_revisado.xlsx). El match ahora es OR entre
//   género/tono/etiquetas (antes era género Y tono, más restrictivo) y compara sin acentos.
// - Mood v2 (rediseño de fondo, reglas + diseño): categorías reescritas con reglas editoriales
//   específicas por mood (algunas con función match propia, "atrapar" exige género Y ritmo rápido
//   a la vez). "emocion"->"drama" (dramas serios, no romance ligero), "reir" se fusionó dentro de
//   "feliz"/"buenrato", "humanidad" reemplazado por "escapar" (fantasía/ciencia ficción/otros
//   mundos). Cada mood ahora trae su propio título+frase+ícono+número, mostrados en la tarjeta.
// - Mood v3: se abandonaron las reglas automáticas de género/tono/ritmo. Ahora cada libro trae su
//   propia columna "Mood" en la hoja (separada por comas, con las claves feliz/drama/atrapar/
//   aventura/pasado/reflexion/inspiracion/buenrato/clasico/escapar) y Fátima decide/ajusta a mano
//   en la hoja de cálculo, sin tocar código. MOODS ahora solo guarda metadata (icono/título/frase).
// - Menú rediseñado: header+tabs+barra inferior reemplazados por un sidebar único (.sidebar) que
//   en escritorio va fijo a la izquierda, y en móvil se convierte en drawer (oculto por defecto,
//   se abre con #menuToggle, se cierra con #sidebarClose/overlay/al navegar). _aplicarTabDOM ahora
//   solo maneja un set de enlaces (.sidebar-link) en vez de duplicar lógica desktop/móvil.
// - Random y Antojos se movieron al sidebar (#randomFab y #antojosBtn ya no son FABs flotantes,
//   mismos IDs así que el resto del JS no cambió). El panel de antojos ahora es un overlay
//   centrado con fondo, se cierra igual que el modal random al hacer clic afuera.
// - v1.21.0: se quitó la pregunta de género del Reto Literario (podía tener más de una
//   respuesta válida). Las preguntas de año y de orden de publicación ahora incluyen el
//   autor junto al título, para que se puedan responder aunque no conozcas el libro por
//   nombre. "Cambiar de nombre" ya no crea un jugador nuevo (duplicaba filas en la tabla
//   de posiciones): ahora renombra el mismo registro (mismo jugador_id) y sincroniza el
//   apodo directo en Supabase.
// - v1.28.0: pulido grande del quiz. (1) Redacción de las 12 preguntas revisada para que sea
//   más concisa y concreta (misma lógica y mismos puntajes, cero cambios de arquetipo/mood).
//   (2) Botón "← Atrás" en cada pregunta (excepto la primera): las respuestas ahora se guardan
//   en _quizRespuestas por índice, y los puntajes (_quizPuntajes y _quizPesoDesempate) se
//   recalculan desde cero con _quizRecalcularPuntajes() cada vez que se responde o se cambia
//   una respuesta anterior — más robusto que sumar/restar a mano. (3) Las filas de "Tu mezcla
//   lectora de hoy" ahora son clicables: al tocar una, cambian los libros recomendados debajo
//   (_quizSeleccionarFilaMezcla/_quizMostrarRecomendacionesDe) y el título pasa a "Libros para
//   tu lado [X]". El encabezado principal ("Eres un...") no cambia con el clic — sigue
//   reflejando siempre el resultado real del quiz. (4) Layout de resultado rediseñado:
//   encabezado y tarjeta de mezcla ahora van lado a lado (mezcla arriba a la derecha en
//   desktop, apilada debajo en móvil), con hover/estado activo en las filas.
// - v1.27.0: rediseño grande del quiz, basado en el mapeo que armó Fátima. (1) Se quitó el
//   desempate manual (random y luego el de pregunta extra) por una fórmula determinista:
//   _quizPesoDesempate suma una potencia de 2 distinta por pregunta (2^0..2^11), y como dos
//   arquetipos siempre terminan con conjuntos de preguntas disjuntos, sus sumas binarias NUNCA
//   pueden coincidir — empate resuelto matemáticamente, sin preguntarle nada al visitante y sin
//   tocar el conteo real que alimenta "Tu mezcla lectora". (2) Banco de preguntas ampliado de 8
//   a 12 (aportadas por Fátima, con ajustes mínimos de redacción/gramática), quedando los 8
//   arquetipos perfectamente parejos: 6 apariciones cada uno (48÷8=6). (3) Tonos ampliados por
//   arquetipo (ej. Explorador de Mundos ahora también acepta épico/heroico/intrigante; Alma
//   Sensible suma dramático/sensible/trágico; Sentido suma crítico/humano), siempre en AND con
//   Mood — el traslape de tonos entre arquetipos ya no es un problema porque el Mood sigue
//   siendo el filtro que desambigua. (4) GRUPOS_GENERO → "No ficción" ahora también agrupa
//   biografía y testimonial (17 libros que antes quedaban sin grupo); esto mejora también la
//   pestaña Géneros, no solo el quiz. Validado contra el CSV real: los 8 arquetipos quedan entre
//   20 y 54 libros en nivel 1 (Mood+Género/Tono).
// - v1.26.0: se quitó el desempate manual de v1.25.0 — no tenía sentido pedirle al visitante
//   que elija entre arquetipos empatados sin conocer sus condiciones internas. En su lugar se
//   agregó una 8va pregunta del mismo estilo que las otras 7 ("¿Qué tipo de portada te llama
//   más en un estante?"), diseñada para que los 4 arquetipos que se quedaban en 3 apariciones
//   (Explorador Intrépido, Espíritu Ligero, Buscador de Raíces, Guardián de los Clásicos)
//   lleguen a 4 — dejando los 8 arquetipos perfectamente parejos (32 opciones ÷ 8 = 4 c/u,
//   antes 28÷8 con 4 en algunos y 3 en otros). Si aun así hay empate, se resuelve al azar
//   (_quizRankingArquetipos), como antes de v1.25.0 — con 8 preguntas balanceadas es bastante
//   menos frecuente.
// - v1.25.0: 3 ajustes al quiz. (1) Desempate: si al terminar las 7 preguntas hay empate en
//   el primer lugar, ya no se resuelve al azar — se lanza una pregunta extra mostrando solo a
//   los arquetipos empatados (_quizArquetiposEmpatados/_renderQuizDesempate), y elegir ahí
//   suma el punto decisivo. (2) La tarjeta "Tu mezcla lectora de hoy" se movió de en medio
//   (quedaba raro entre el título y los libros) a debajo de las recomendaciones. (3) Títulos
//   visibles renombrados sin tocar nada interno: pestaña Mood → "Colecciones" (implica algo
//   fijo/curado) y pestaña del quiz → "Brújula Lectora" (ya no reclama una identidad
//   permanente, apunta a lo que te late leer ahora). IDs, funciones y nombres de variables
//   internos (tabSentimiento, MOODS, QUIZ_ARQUETIPOS, etc.) quedaron intactos.
// - v1.24.0: quiz de lector ampliado — se separaron 2 arquetipos combinados en 4 propios
//   (Explorador de Mundos ahora es solo "escapar", + nuevo Explorador Intrépido para
//   "aventura" con género Aventura; Buscador de Raíces ahora es solo "pasado", + nuevo
//   Guardián de los Clásicos para "clasico" con género Clásicos), llegando a 8 arquetipos
//   totales. El orden de las 7 preguntas ahora se mezcla al azar en cada partida
//   (_quizMezclar / _quizOrdenPreguntas) para que no se sienta repetitivo. Se agregó un
//   desglose por porcentajes en el resultado (_quizDesglosePorcentajes) mostrando hasta los
//   6 arquetipos con más puntos, ordenados de mayor a menor. Todo validado contra el CSV real
//   de Fátima (BD_pa_gina_Biblioteca_-_esp.csv, 172 libros): los 8 arquetipos quedan con
//   mínimo 18 libros en nivel 1 (Mood+Género/Tono).
// - v1.23.2: raíces de Tono del quiz validadas contra tu CSV real (BD_pa_gina_Biblioteca_-_esp.csv,
//   172 libros) — se quitaron las que no matcheaban nada (magic, fascinant, aventurer, vertigin,
//   inquietant, oscur, evocador, divertid) y se agregaron las que sí existen en tu columna Tono
//   (heroico, audaz, poético, sobrio, ameno, absurdo, contemplativo, inspirador, optimista). Con
//   datos reales, los 6 arquetipos quedan MUY por encima del mínimo de 4 libros en nivel 1
//   (Mood+Género/Tono): raíces 77, alma 49, sentido 27, explorador 27, detective 23, ligero 17 —
//   el fallback casi nunca se activa.
// - v1.23.1: nivel 1 de recomendaciones del quiz afloja de "Mood Y Género" a "Mood Y (Género
//   O Tono)" — se agregó _quizLibroTieneTono(), coincidencia por subcadena normalizada contra
//   la columna Tono (mismo patrón que agruparGenero, tolerante a variaciones de redacción)
//   para cada uno de los 6 arquetipos. Pensado sobre todo para Alma Sensible, que con solo
//   Género "Drama" como condición se quedaba corta seguido.
// - v1.23.0: quiz "¿Qué tipo de lector eres?" rediseñado de nuevo — se vuelve a los 6
//   arquetipos (Explorador de Mundos, Detective de Sofá, Alma Sensible, Buscador de Raíces,
//   Espíritu Ligero, Buscador de Sentido) en vez de puntuar directo contra los 10 Moods
//   (se sentía como una copia de la pestaña Mood). Pero ahora las recomendaciones de cada
//   arquetipo cruzan Mood Y Género (reutilizando GRUPOS_GENERO/libroTieneGrupo), con
//   fallback en 3 niveles si el cruce da pocos resultados. Ej: Detective de Sofá = Mood
//   "atrapar" + Género Misterio/Thriller. También se corrigió que antes algunas opciones
//   repartían puntos a 2 arquetipos a la vez (diluía la señal); ahora cada opción apunta
//   a uno solo, y los 6 arquetipos tienen entre 4-5 oportunidades de ganar en las 7 preguntas.
// - v1.22.1: (superada por v1.23.0, ver arriba) — primer intento de corregir la lógica del
//   quiz puntuando directo contra los 10 Moods reales, sin arquetipos intermedios.
// - v1.22.0: nueva pestaña "¿Qué tipo de lector eres?" — quiz de 7 preguntas con recomendaciones
//   de libros REALES (lógica de puntuación corregida en v1.22.1, ver arriba). Reutiliza
//   mostrarTarjetasLista() para las tarjetas de resultado, así que likes/antojos/click-a-detalle
//   funcionan igual que en el resto del sitio. El quiz se reinicia solo cada vez que se entra a
//   la pestaña (ver _aplicarTabDOM).
// - v1.20.0: banco de apodos sugeridos para el Reto Literario ampliado (de 30 a ~60 nombres,
//   con más variedad: literatura en español/Latinoamérica, fantasía/sci-fi y mitología) para
//   que las 4 sugerencias mostradas se sientan menos repetidas.
// - Supabase conectado: nuevo backend compartido para el leaderboard de la futura trivia
//   y el formulario de sugerencias/comentarios. Cliente inicializado con supabaseClient
//   (ver bloque "SUPABASE" abajo). Tablas: puntajes (lectura+escritura pública, para el
//   leaderboard) y sugerencias (solo escritura pública; Fátima las revisa desde el
//   dashboard, nunca se leen desde el sitio). Funciones helper: guardarPuntaje(),
//   obtenerLeaderboard(), enviarSugerencia(). Aún no hay UI que las use — se conectan
//   cuando armemos la trivia y el formulario de sugerencias.
// Busca un campo en el objeto ignorando diferencias de acentos
function getCampo(obj, ...nombres) {
  for (const nombre of nombres) {
    if (obj[nombre] !== undefined && obj[nombre] !== '') return obj[nombre];
  }
  // Fallback: buscar normalizando claves
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const nombre of nombres) {
    const key = Object.keys(obj).find(k => norm(k) === norm(nombre));
    if (key && obj[key] !== '') return obj[key];
  }
  return '';
}

// Convierte una calificación (puede tener medios puntos, ej. 3.5) en estrellas.
// .25–.74 cuenta como media estrella (½); .75+ redondea hacia la estrella completa siguiente.
function desglosarEstrellas(valorCrudo) {
  const num = parseFloat(valorCrudo) || 0;
  if (num <= 0) return { llenas: 0, media: false, vacias: 0, valor: 0, texto: '' };
  let llenas = Math.floor(num);
  const frac = num - llenas;
  let media = false;
  if (frac >= 0.75) llenas += 1;
  else if (frac >= 0.25) media = true;
  llenas = Math.min(5, llenas);
  const vacias = Math.max(0, 5 - llenas - (media ? 1 : 0));
  return { llenas, media, vacias, valor: num, texto: '★'.repeat(llenas) + (media ? '½' : '') };
}

const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_lN4MQGP2PigjKJFOV8ZK92MvfpQWj8aH7qqntBJHOKv6XsvLAxriHmjU3WcD7kafNvNbj3pTFqND/pub?gid=0&single=true&output=csv";

// =====================================================
// SUPABASE — backend compartido: leaderboard de trivia + sugerencias
// =====================================================
// La "anon key" está pensada para ser pública: la seguridad real la dan las
// políticas de RLS configuradas en Supabase (ver bibliofa_supabase_schema.sql),
// no el que esta key esté a la vista en el código.
const SUPABASE_URL = "https://kvqekcywucmdulmyiluj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cWVrY3l3dWNtZHVsbXlpbHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMTA5MTAsImV4cCI6MjEwMTc4NjkxMH0.ydNPXP15O8KQktB25OHvMaKMofWBe_otHC6w9YIcYk8";

const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Guarda el puntaje de una partida de trivia. Devuelve true/false según éxito.
// Identidad estable por navegador (NO es una cuenta de usuario, solo un id
// al azar guardado en localStorage) para poder acumular el puntaje de un
// mismo jugador entre partidas, sin depender de que el apodo sea único
// (dos personas distintas podrían elegir el mismo nombre).
const RETO_JUGADOR_ID_KEY = 'bibliof_reto_jugador_id';
function _rlJugadorId() {
  let id = localStorage.getItem(RETO_JUGADOR_ID_KEY);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(RETO_JUGADOR_ID_KEY, id);
  }
  return id;
}

// Guarda el puntaje de una partida SUMÁNDOLO al acumulado del jugador
// (identificado por el navegador), en vez de crear una fila nueva cada vez.
async function guardarPuntaje(apodo, aciertosSesion, totalSesion) {
  if (!supabaseClient) return false;
  const jugadorId = _rlJugadorId();

  const { data: existente, error: errSel } = await supabaseClient
    .from('puntajes')
    .select('puntaje, total_preguntas')
    .eq('jugador_id', jugadorId)
    .maybeSingle();
  if (errSel) console.error('Error consultando puntaje previo:', errSel);

  const puntajeNuevo = (existente?.puntaje || 0) + aciertosSesion;
  const totalNuevo = (existente?.total_preguntas || 0) + totalSesion;

  const { error } = await supabaseClient
    .from('puntajes')
    .upsert(
      {
        jugador_id: jugadorId,
        apodo: (apodo || 'Anónimo').slice(0, 30),
        puntaje: puntajeNuevo,
        total_preguntas: totalNuevo
      },
      { onConflict: 'jugador_id' }
    );
  if (error) { console.error('Error guardando puntaje:', error); return false; }
  return true;
}

// Trae el top N del leaderboard (por defecto los 10 mejores puntajes).
async function obtenerLeaderboard(limite = 10) {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from('puntajes')
    .select('apodo, puntaje, total_preguntas, creado_en')
    .order('puntaje', { ascending: false })
    .order('creado_en', { ascending: true })
    .limit(limite);
  if (error) { console.error('Error obteniendo leaderboard:', error); return []; }
  return data || [];
}

// Envía una sugerencia de libro o un comentario general. No se puede leer de
// vuelta desde el sitio (a propósito, ver políticas de RLS) — solo Fátima las
// revisa desde el dashboard de Supabase.
async function enviarSugerencia({ tipo, mensaje, libroRelacionado = null, nombre = null }) {
  if (!supabaseClient) return false;
  const { error } = await supabaseClient.from('sugerencias').insert({
    tipo,
    mensaje: (mensaje || '').slice(0, 1000),
    libro_relacionado: libroRelacionado,
    nombre
  });
  if (error) { console.error('Error enviando sugerencia:', error); return false; }
  return true;
}

// Registra un like para un libro (identificado por título, igual que antojos).
// Devuelve el id de la fila creada (lo necesitamos para poder quitarlo después).
async function darLike(tituloLibro) {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from('reacciones')
    .insert({ libro_titulo: tituloLibro })
    .select('id')
    .single();
  if (error) { console.error('Error dando like:', error); return null; }
  return data ? data.id : null;
}

// Quita un like ya dado, por id de la fila.
async function quitarLike(idReaccion) {
  if (!supabaseClient || !idReaccion) return false;
  const { error } = await supabaseClient.from('reacciones').delete().eq('id', idReaccion);
  if (error) { console.error('Error quitando like:', error); return false; }
  return true;
}

// Trae el total de likes de un libro específico.
async function obtenerLikes(tituloLibro) {
  if (!supabaseClient) return 0;
  const { count, error } = await supabaseClient
    .from('reacciones')
    .select('*', { count: 'exact', head: true })
    .eq('libro_titulo', tituloLibro);
  if (error) { console.error('Error obteniendo likes:', error); return 0; }
  return count || 0;
}

// Trae de un jalón el conteo de likes de TODOS los libros (para pintar el
// numerito en cada tarjeta sin hacer una llamada por libro, y para poder
// ordenar por "Más populares").
let likesCache = {}; // título -> conteo
async function cargarLikesCache() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient.from('reacciones').select('libro_titulo');
  if (error) { console.error('Error cargando likes:', error); return; }
  const conteo = {};
  (data || []).forEach(row => {
    conteo[row.libro_titulo] = (conteo[row.libro_titulo] || 0) + 1;
  });
  likesCache = conteo;
}

// Arma el ranking de "Populares": solo libros con al menos un like, de más a menos.
function mostrarPopulares() {
  const cont = document.getElementById('popularesCards');
  if (!cont) return;

  const conLikes = libros.filter(l => {
    const t = l['Título'] || l['Titulo'] || l['Title'] || '';
    return (likesCache[t] || 0) > 0;
  });

  conLikes.sort((a, b) => {
    const ta = a['Título'] || a['Titulo'] || a['Title'] || '';
    const tb = b['Título'] || b['Titulo'] || b['Title'] || '';
    return (likesCache[tb] || 0) - (likesCache[ta] || 0);
  });

  if (conLikes.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted)">Todavía no hay likes — ¡sé la primera persona en darle uno a un libro! 👍</p>';
    return;
  }

  mostrarTarjetasLista(conLikes, 'popularesCards');
}

let libros = [];
let ordenActual = {col: null, asc: true};

function showError(msg){
  console.error(msg);
  const cont = document.getElementById('listaCards');
  if (cont) cont.innerHTML = `<p style="color:#b00020">${msg}</p>`;
}

Papa.parse(sheetUrl, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    if(!results || !results.data || results.data.length === 0){
      showError('No se pudieron cargar los datos desde Google Sheets.');
      return;
    }
    libros = results.data.map(r => {
      const clean = {};
      for(const k in r){ clean[k.trim()] = r[k] ? r[k].trim() : ''; }
      return clean;
    }).filter(r => (r['Título'] || r['Titulo'] || r['Title']));

    if(libros.length === 0){
      showError('No se encontraron filas con columna Título.');
      return;
    }

    libros.sort((a, b) => comparar(b, a, 'No.'));
    ordenActual = { col: 'no', asc: false };
    mostrarTabla(libros);

    llenarSelectGeneros(libros);
    actualizarContador(libros.length);

    // Trae los likes en paralelo y refresca la vista cuando lleguen
    cargarLikesCache().then(() => {
      mostrarTabla(ultimaData);
      if (_tabActual === 'tabPopulares') mostrarPopulares();
    });
  },
  error: err => showError('Error leyendo CSV: ' + err)
});

function comparar(a, b, col) {
  const getVal = (obj, campo) => {
    if (campo === 'Calificación' || campo === 'Estrellas' || campo === 'Stars') {
      return Number(obj[campo] || 0);
    }
    if (campo === 'No.') {
      return Number(obj['No.'] || obj['No'] || 0);
    }
    return (obj[campo] || '').toLowerCase();
  };

  const x = getVal(a, col);
  const y = getVal(b, col);

  return typeof x === 'number' && typeof y === 'number'
    ? x - y
    : x.localeCompare(y, 'es', { sensitivity: 'base' });
}

let ultimaData = [];
let ordenSeleccionado = 'recientes';
let ordenAscendente = false;

function ordenarLibros(data, criterio, ascendente) {
  const copia = [...data];
  const dir = ascendente ? 1 : -1;
  if (criterio === 'recientes') {
    copia.sort((a, b) => dir * (Number(a['No.'] || a['No'] || 0) - Number(b['No.'] || b['No'] || 0)));
  } else if (criterio === 'calificacion') {
    copia.sort((a, b) => {
      const ca = parseFloat(getCampo(a, 'Calificación', 'Estrellas', 'Stars')) || 0;
      const cb = parseFloat(getCampo(b, 'Calificación', 'Estrellas', 'Stars')) || 0;
      return dir * (ca - cb);
    });
  } else if (criterio === 'publicacion') {
    copia.sort((a, b) => {
      const pa = parseInt(getCampo(a, 'Publicado', 'Publicación', 'Publicacion', 'Año', 'Ano', 'Year')) || 0;
      const pb = parseInt(getCampo(b, 'Publicado', 'Publicación', 'Publicacion', 'Año', 'Ano', 'Year')) || 0;
      return dir * (pa - pb);
    });
  }
  return copia;
}

function mostrarTabla(data) {
  ultimaData = data;
  const ordenados = ordenarLibros(data, ordenSeleccionado, ordenAscendente);
  mostrarTarjetasLista(ordenados);
  actualizarContador(data.length);
}

function mostrarTarjetasLista(data, containerId) {
  const cont = document.getElementById(containerId || 'listaCards');
  cont.innerHTML = '';
  if (data.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted)">No se encontraron libros.</p>';
    return;
  }
  data.forEach(libro => {
    const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
    const autor = libro['Autor'] || libro['Author'] || '';
    const genero = libro['Género'] || libro['Genero'] || libro['Genre'] || '';
    const calificacion = getCampo(libro, 'Calificación', 'Estrellas', 'Stars');
    const { texto: textoEstrellas, valor: numEstrellas } = desglosarEstrellas(calificacion);
    const resena = libro['Reseña'] || libro['Resena'] || libro['Review'] || '';
    const flags = libro['Flags'] || '';
    const generoChips = genero
      ? genero.split(',').map(g => `<span class="genre-chip">${escapeHtml(g.trim())}</span>`).join(' ')
      : '';
    const starsHtml = textoEstrellas
      ? `<span class="lista-stars">${textoEstrellas}</span>`
      : '';
    const esFavorita = numEstrellas >= 5;
    const div = document.createElement('div');
    div.className = 'lista-card' + (esFavorita ? ' top-pick' : '');
    div.innerHTML = `
      <div class="lista-card-body">
        <div class="lista-card-top">
          <div class="lista-card-titulo">${escapeHtml(titulo)}${esFavorita ? ' <span class="top-pick-badge">★ favorita</span>' : ''}</div>
          ${starsHtml}
        </div>
        <div class="lista-card-autor">${escapeHtml(autor)}</div>
        <div class="lista-card-meta">
          ${generoChips}
          ${flags && flags.toLowerCase() !== 'ninguno' ? `<span class="flag-tag">${escapeHtml(flags)}</span>` : ''}
        </div>
        ${resena ? `<p class="card-resena">${escapeHtml(resena)}</p>` : ''}
      </div>
      <button class="btn-antojo ${antojosContiene(libro) ? 'guardado' : ''}" title="Guardar en antojos">✓</button>
      <button class="btn-like-card" title="Dar like">👍 <span class="like-count">…</span></button>
    `;
    div.querySelector('.btn-antojo').addEventListener('click', e => {
      e.stopPropagation();
      toggleAntojos(libro);
      div.querySelector('.btn-antojo').classList.toggle('guardado', antojosContiene(libro));
    });
    inicializarBotonLike(div.querySelector('.btn-like-card'), titulo);
    div.addEventListener('click', () => showDetalle(libro));
    cont.appendChild(div);
  });
}

// Selector de orden (criterio) + botón de dirección
const ordenSelectEl = document.getElementById('ordenSelect');
if (ordenSelectEl) {
  ordenSelectEl.addEventListener('change', (e) => {
    ordenSeleccionado = e.target.value;
    mostrarTabla(ultimaData);
  });
}

const ordenDireccionEl = document.getElementById('ordenDireccion');
function actualizarIconoOrdenDireccion() {
  if (!ordenDireccionEl) return;
  ordenDireccionEl.textContent = ordenAscendente ? '↑' : '↓';
  ordenDireccionEl.setAttribute('aria-label', ordenAscendente ? 'Orden ascendente, tocar para invertir' : 'Orden descendente, tocar para invertir');
  ordenDireccionEl.title = ordenAscendente ? 'Ascendente' : 'Descendente';
}
if (ordenDireccionEl) {
  actualizarIconoOrdenDireccion();
  ordenDireccionEl.addEventListener('click', () => {
    ordenAscendente = !ordenAscendente;
    actualizarIconoOrdenDireccion();
    mostrarTabla(ultimaData);
  });
}

// --- Mapa de agrupación de géneros ---
// Cualquier género que contenga alguna de estas palabras clave se agrupa bajo el nombre del grupo.
const GRUPOS_GENERO = [
  { grupo: 'Fantasía',        palabras: ['fantasía', 'fantasia'] },
  { grupo: 'Romance',         palabras: ['romance'] },
  { grupo: 'Ciencia ficción', palabras: ['ciencia ficción', 'ciencia ficcion', 'sci-fi', 'scifi'] },
  { grupo: 'Terror',          palabras: ['terror', 'horror'] },
  { grupo: 'Thriller',        palabras: ['thriller', 'suspense'] },
  { grupo: 'Drama',           palabras: ['drama'] },
  { grupo: 'Comedia',         palabras: ['comedia', 'humor'] },
  { grupo: 'Histórico',       palabras: ['históric', 'historic'] },
  { grupo: 'Misterio',        palabras: ['misterio', 'policial', 'detectives', 'noir'] },
  { grupo: 'Aventura',        palabras: ['aventura'] },
  { grupo: 'Distopía',        palabras: ['distopía', 'distopia'] },
  { grupo: 'No ficción',      palabras: ['no ficción', 'no ficcion', 'ensayo', 'divulgación', 'divulgacion', 'autobiografía', 'autobiografia', 'memorias', 'crónica', 'cronica', 'biografía', 'biografia', 'testimonial'] },
  { grupo: 'Clásicos',        palabras: ['clásico', 'clasico'] },
];

function agruparGenero(genero) {
  const norm = genero.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const { grupo, palabras } of GRUPOS_GENERO) {
    if (palabras.some(p => norm.includes(p.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))) {
      return grupo;
    }
  }
  return genero; // sin grupo → se muestra tal cual
}

// --- Filtro de géneros con agrupación ---
const generosActivos = new Set(); // guarda GRUPOS, no géneros exactos

function getGenerosLibro(libro) {
  return (libro['Género'] || libro['Genero'] || libro['Genre'] || '')
    .split(',').map(s => s.trim()).filter(Boolean);
}

function libroTieneGrupo(libro, grupo) {
  return getGenerosLibro(libro).some(g => agruparGenero(g) === grupo);
}

function librosFiltradosPorGenero() {
  if (generosActivos.size === 0) return libros;
  return libros.filter(l =>
    [...generosActivos].every(g => libroTieneGrupo(l, g))
  );
}

function renderGeneroBtns() {
  const cont = document.getElementById('generoBtns'); if(!cont) return;
  const resultado = librosFiltradosPorGenero();

  // Grupos disponibles dado el filtro actual
  const gruposDisponibles = new Set();
  resultado.forEach(l => getGenerosLibro(l).forEach(g => gruposDisponibles.add(agruparGenero(g))));

  // Todos los grupos existentes en la biblioteca
  const todosGrupos = Array.from(
    new Set(libros.flatMap(l => getGenerosLibro(l).map(g => agruparGenero(g))))
  ).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  cont.innerHTML = '';

  const btnTodos = document.createElement('button');
  btnTodos.className = 'genero-btn' + (generosActivos.size === 0 ? ' active' : '');
  btnTodos.textContent = 'Todos';
  btnTodos.addEventListener('click', () => {
    generosActivos.clear();
    renderGeneroBtns();
    mostrarTarjetasLista(libros, 'tarjetasLibros');
  });
  cont.appendChild(btnTodos);

  todosGrupos.forEach(g => {
    const activo = generosActivos.has(g);
    const disponible = activo || gruposDisponibles.has(g);

    // Si no hay coincidencias con el filtro actual, ni lo mostramos
    if (!disponible) return;

    const btn = document.createElement('button');
    btn.className = 'genero-btn' + (activo ? ' active' : '');
    btn.textContent = g;

    btn.addEventListener('click', () => {
      if (generosActivos.has(g)) {
        generosActivos.delete(g);
      } else {
        generosActivos.add(g);
      }
      renderGeneroBtns();
      mostrarTarjetasLista(librosFiltradosPorGenero(), 'tarjetasLibros');
    });
    cont.appendChild(btn);
  });
}

function llenarSelectGeneros(data) {
  renderGeneroBtns();
  mostrarTarjetasLista(libros, 'tarjetasLibros');
}

function mostrarTarjetas(data){
  const cont = document.getElementById('tarjetasLibros');
  cont.innerHTML = '';
  if(data.length === 0){
    cont.innerHTML = '<p style="color:var(--muted)">No se encontraron libros en este género.</p>';
    return;
  }
  data.forEach(libro => {
    const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
    const autor = libro['Autor'] || libro['Author'] || '';
    const genero = libro['Género'] || libro['Genero'] || libro['Genre'] || '';
    const flags = libro['Flags'] || '';
    const estrellasRaw = getCampo(libro, 'Calificación', 'Estrellas', 'Stars');
    const numEstrellas = parseInt(estrellasRaw, 10);
    const estrellasHtml = numEstrellas > 0 ? `<span class="card-stars">${'★'.repeat(numEstrellas)}</span>` : '';

    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="card-top">
        <strong>${escapeHtml(titulo)}</strong>
        ${estrellasHtml}
      </div>
      <small>${escapeHtml(autor)}</small><br>
      <em>${escapeHtml(genero)}</em><br>
      ${flags ? `<span class="flag-tag">${escapeHtml(flags)}</span>` : ''}
    `;
    const ab = document.createElement('button');
    ab.className = 'btn-antojo' + (antojosContiene(libro) ? ' guardado' : '');
    ab.title = 'Guardar en antojos'; ab.textContent = '✓';
    ab.addEventListener('click', e => { e.stopPropagation(); toggleAntojos(libro); ab.classList.toggle('guardado', antojosContiene(libro)); });
    div.appendChild(ab);
    div.addEventListener('click', () => showDetalle(libro));
    cont.appendChild(div);
  });
}


// =====================================================
// RANDOM FAB + MODAL
// =====================================================
let _libroRandom = null;

function mostrarLibroRandomEnModal() {
  if (libros.length === 0) return;
  document.getElementById('antojosPanel').classList.add('hidden');
  _libroRandom = libros[Math.floor(Math.random() * libros.length)];
  renderRandomModal(_libroRandom);
  document.getElementById('randomModal').classList.remove('hidden');
  history.pushState({ tab: _tabActual, overlay: 'random' }, '', '#random');
}

// Reabre el modal random con el último libro mostrado (usado al navegar con Adelante)
function reabrirRandomModal() {
  if (!_libroRandom) return;
  renderRandomModal(_libroRandom);
  document.getElementById('randomModal').classList.remove('hidden');
}

function cerrarRandomModal() {
  document.getElementById('randomModal').classList.add('hidden');
  if (history.state && history.state.overlay === 'random') history.back();
}

function renderRandomModal(r) {
  document.getElementById('randomModalCuerpo').innerHTML =
    construirFichaHTML(r, '', 'cerrarRandomModal');

  // El botón de cerrar se recrea en cada render; hay que re-enganchar el listener
  document.getElementById('cerrarRandomModal').addEventListener('click', cerrarRandomModal);

  // Botón antojos
  const btnA = document.getElementById('randomModalBtnAntojo');
  const actualizarBtnA = () => {
    const g = antojosContiene(r);
    btnA.className = 'btn-modal-antojo' + (g ? ' guardado' : '');
    btnA.textContent = g ? '✓ En mis antojos' : '✓ Guardar en antojos';
  };
  actualizarBtnA();
  btnA.onclick = () => { toggleAntojos(r); actualizarBtnA(); };

  // Botón compartir
  document.getElementById('randomModalBtnCompartir').onclick = () => compartirLibro(r);

  // Botón like
  const tituloRandom = r['Título'] || r['Titulo'] || r['Title'] || '';
  inicializarBotonLike(document.getElementById('randomModalBtnLike'), tituloRandom);
}

document.getElementById('randomFab').addEventListener('click', mostrarLibroRandomEnModal);
document.getElementById('btnOtroRandom').addEventListener('click', () => {
  if (libros.length === 0) return;
  _libroRandom = libros[Math.floor(Math.random() * libros.length)];
  renderRandomModal(_libroRandom);
});
document.getElementById('randomModal').addEventListener('click', e => {
  if (e.target === document.getElementById('randomModal')) cerrarRandomModal();
});

// --- Buscador (ahora ignora acentos) ---
const inputBusqueda = document.getElementById('busqueda');
inputBusqueda.addEventListener('input', () => {
  const term = normalizar(inputBusqueda.value);

  const filtrados = libros.filter(l => {
    const t = normalizar(l['Título'] || l['Titulo'] || '');
    const a = normalizar(l['Autor'] || '');
    const g = normalizar(l['Género'] || l['Genero'] || l['Genre'] || '');
    const tags = normalizar(l['Etiquetas'] || l['Tags'] || '');

    return (
      t.includes(term) ||
      a.includes(term) ||
      g.includes(term) ||
      tags.includes(term)
    );
  });

  mostrarTabla(filtrados);
});


// --- Botón limpiar búsqueda ---
const clearBtn = document.createElement('span');
clearBtn.textContent = '✕';
clearBtn.className = 'clear-search';

const buscador = document.getElementById('busqueda');
buscador.parentElement.appendChild(clearBtn);

// Mostrar / ocultar el botón
buscador.addEventListener('input', () => {
  clearBtn.style.display = buscador.value ? 'block' : 'none';
});

// Al hacer clic, limpiar búsqueda
clearBtn.addEventListener('click', () => {
  buscador.value = '';
  clearBtn.style.display = 'none';
  mostrarTabla(libros);   // vuelve a mostrar todo
  buscador.focus();
});


// --- Limpiar búsqueda con tecla ESC ---
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && buscador.value) {
    buscador.value = '';
    clearBtn.style.display = 'none';
    mostrarTabla(libros);   // restaura tabla completa
    buscador.blur();        // opcional: quita foco
  }
});




// --- Función auxiliar para eliminar acentos y poner en minúsculas ---
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD") // separa los acentos de las letras
    .replace(/[\u0300-\u036f]/g, ""); // elimina los acentos
}


// --- Modal ---
const modal = document.getElementById('detalleModal');

const detalleContenido = document.getElementById('detalleContenido');


window.addEventListener('click', e=>{ if(e.target===modal) cerrarDetalleModal(); });

let _ultimoLibroDetalle = null;

function cerrarDetalleModal() {
  modal.classList.add('hidden');
  if (history.state && history.state.overlay === 'detalle') history.back();
}

function showDetalle(libro){
  _ultimoLibroDetalle = libro;
  renderDetalleModal(libro);
  modal.classList.remove('hidden');
  history.pushState({ tab: _tabActual, overlay: 'detalle' }, '', '#detalle');
}

// Construye el contenido del modal de detalle (sin tocar el historial); la usan
// showDetalle() y el manejador de popstate al reabrir con Adelante.
function renderDetalleModal(libro){
  detalleContenido.innerHTML = construirFichaHTML(libro, '');

  document.getElementById('cerrarModalInterno')
    .addEventListener('click', cerrarDetalleModal);

  // Acciones del modal
  const modalActions = document.createElement('div');
  modalActions.className = 'modal-actions';

  const btnAntojo = document.createElement('button');
  btnAntojo.className = 'btn-modal-antojo' + (antojosContiene(libro) ? ' guardado' : '');
  btnAntojo.innerHTML = antojosContiene(libro)
    ? '✓ En mis antojos' : '✓ Guardar en antojos';
  btnAntojo.addEventListener('click', () => {
    toggleAntojos(libro);
    const g = antojosContiene(libro);
    btnAntojo.className = 'btn-modal-antojo' + (g ? ' guardado' : '');
    btnAntojo.innerHTML = g ? '✓ En mis antojos' : '✓ Guardar en antojos';
  });

  const btnCompartir = document.createElement('button');
  btnCompartir.className = 'btn-modal-compartir';
  btnCompartir.innerHTML = '↗ Compartir';
  btnCompartir.addEventListener('click', () => compartirLibro(libro));

  const btnLike = document.createElement('button');
  btnLike.className = 'btn-modal-like';
  const tituloParaLike = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
  inicializarBotonLike(btnLike, tituloParaLike);

  modalActions.appendChild(btnAntojo);
  modalActions.appendChild(btnCompartir);
  modalActions.appendChild(btnLike);
  detalleContenido.appendChild(modalActions);
}

// Construye el hero + cuerpo de una ficha de libro (compartido entre el detalle
// normal y el modal random, para que ambos se vean siempre igual).
// `idCerrar` es el id que debe llevar el botón de cerrar (varía entre modales).
// `extraHeroBtnHtml` permite inyectar un botón extra en la esquina del hero (p. ej. "Otro →").
function construirFichaHTML(libro, extraHeroBtnHtml, idCerrar) {
  idCerrar = idCerrar || 'cerrarModalInterno';
  const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
  const autor = libro['Autor'] || libro['Author'] || '';
  const genero = libro['Género'] || libro['Genero'] || libro['Genre'] || '';
  const tono = libro['Tono'] || libro['Tone'] || '';
  const ritmo = libro['Ritmo'] || '';
  const publico = libro['Público'] || libro['Publico'] || '';
  const publicado = getCampo(libro, 'Publicado', 'Publicación', 'Publicacion', 'Año', 'Ano', 'Year');
  const etiquetas = libro['Etiquetas'] || libro['Tags'] || '';
  const resena = libro['Reseña'] || libro['Resena'] || libro['Review'] || '';
  const loMejor = getCampo(libro, 'Lo mejor', 'Lo Mejor', 'LoMejor', 'Best');
  const flags = libro['Flags'] || '';
  const calificacion = getCampo(libro, 'Calificación', 'Estrellas', 'Stars');
  const { texto: textoEstrellas, vacias: estrellasVacias, valor: numEstrellas } = desglosarEstrellas(calificacion);
  const esFavorita = numEstrellas >= 5;

  const estrellasHtml = textoEstrellas
    ? `<span class="modal-hero-stars">${textoEstrellas}<span class="modal-hero-stars-off">${'★'.repeat(estrellasVacias)}</span></span>`
    : '';

  const subPartes = [];
  if (autor) subPartes.push('✍️ ' + escapeHtml(autor));
  if (genero) subPartes.push(escapeHtml(genero));
  if (esFavorita) subPartes.push('★ favorita');
  const subLinea = subPartes.join(' &nbsp;·&nbsp; ');

  const etiquetasHtml = etiquetas
    ? etiquetas.split(',').map(e => `<span class="etiqueta-tag">${escapeHtml(e.trim())}</span>`).join('')
    : '';

  const factsPartes = [];
  if (publicado) factsPartes.push(`Publicado: <b>${escapeHtml(publicado)}</b>`);
  if (tono) factsPartes.push(`Tono: <b>${escapeHtml(tono)}</b>`);
  if (ritmo) factsPartes.push(`Ritmo: <b>${escapeHtml(ritmo)}</b>`);
  if (publico) factsPartes.push(`Público: <b>${escapeHtml(publico)}</b>`);
  const factsHtml = factsPartes.length
    ? `<p class="modal-facts">${factsPartes.join(' &nbsp;·&nbsp; ')}</p>` : '';

  return `
    <div class="modal-hero">
      <div class="modal-hero-top">
        ${extraHeroBtnHtml || ''}
        <span id="${idCerrar}" class="modal-close" aria-label="Cerrar">&times;</span>
      </div>
      <h3 class="modal-hero-title">${escapeHtml(titulo)}</h3>
      <p class="modal-hero-sub">${estrellasHtml}${(estrellasHtml && subLinea) ? ' &nbsp;·&nbsp; ' : ''}${subLinea}</p>
    </div>
    <div class="modal-body">
      ${factsHtml}
      ${etiquetasHtml ? `<div class="modal-etiquetas">${etiquetasHtml}</div>` : ''}
      ${flags && flags.toLowerCase() !== 'ninguno' ? `<p class="modal-flags">⚠️ ${escapeHtml(flags)}</p>` : ''}
      ${resena ? `<p class="modal-resena">${escapeHtml(resena)}</p>` : ''}
      ${loMejor ? `<div class="modal-lomejor"><span class="modal-lomejor-label">✨ Lo mejor</span><p class="modal-lomejor-texto">${escapeHtml(loMejor)}</p></div>` : ''}
    </div>
  `;
}

// Reabre el modal de detalle con el último libro visto (usado al navegar con Adelante)
function reabrirDetalleModal() {
  if (!_ultimoLibroDetalle) return;
  renderDetalleModal(_ultimoLibroDetalle);
  modal.classList.remove('hidden');
}



function actualizarContador(num){
  document.getElementById('contadorLibros').textContent = `${num} libro${num!==1?'s':''} encontrados`;
}

// simple escape
function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[c]));
}


// --- Tabs ---
// Tab actualmente visible (para reconstruir el estado al usar el botón Atrás)
let _tabActual = 'tabLibros';

// Oculta todo lo flotante (modales/paneles) sin tocar el historial
function cerrarFlotantesUI() {
  document.getElementById('randomModal').classList.add('hidden');
  document.getElementById('antojosPanel').classList.add('hidden');
  document.getElementById('detalleModal').classList.add('hidden');
  document.getElementById('shareModal').classList.add('hidden');
  cerrarSidebar();
}

// Aplica visualmente un tab, sin tocar el historial (la usan activarTab() y el manejador de popstate)
function _aplicarTabDOM(target) {
  cerrarFlotantesUI();
  // Enlaces del menú (el mismo sidebar sirve para escritorio y móvil)
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(b => b.classList.remove('active'));
  const link = document.querySelector(`.sidebar-link[data-tab="${target}"]`);
  if (link) link.classList.add('active');
  // Contenido
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const section = document.getElementById(target);
  if (section) section.classList.add('active');

  // Limpia el mensaje de estado del form de sugerencias al cambiar de pestaña
  const estadoSug = document.getElementById('sugerenciasEstado');
  if (estadoSug) { estadoSug.textContent = ''; estadoSug.className = 'sugerencias-estado'; }

  _tabActual = target;
  if (target === 'tabAbout') cargarInfo();
  if (target === 'tabPopulares') mostrarPopulares();
  if (target === 'tabReto') _rlPintarEntrada();
  if (target === 'tabDuelo') _duPintarEntrada();
  if (target === 'tabQuiz') iniciarQuiz();
}

// Función central de navegación — usada por desktop y barra móvil.
// Registra el cambio en el historial para que el botón Atrás funcione.
function activarTab(target) {
  _aplicarTabDOM(target);
  history.pushState({ tab: target }, '', '#' + target);
}

// Estado inicial del historial (así el primer "Atrás" tiene a dónde volver)
history.replaceState({ tab: _tabActual }, '', location.pathname + '#' + _tabActual);

// Enlaces del menú (sidebar en escritorio, drawer en móvil)
document.querySelectorAll('.sidebar-link[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => activarTab(btn.dataset.tab));
});

// =====================================================
// RETO LITERARIO — trivia de literatura en general (autor, año, género),
// generada a partir de tu propio Sheet pero SOLO con campos objetivos.
// Nunca usa Calificación, Mood, Tono, Ritmo, Público, Etiquetas ni Reseña.
// =====================================================

function _rlValorAnio(libro) {
  const raw = getCampo(libro, 'Publicado', 'Publicación', 'Publicacion', 'Año', 'Ano', 'Year');
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}
function _rlValorAutor(libro) { return (getCampo(libro, 'Autor', 'Author') || '').trim(); }
function _rlValorGenero(libro) { return (getCampo(libro, 'Género', 'Genero', 'Genre') || '').trim(); }
function _rlValorTitulo(libro) { return (libro['Título'] || libro['Titulo'] || libro['Title'] || '').trim(); }

function _rlMezclar(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function _rlMuestra(arr, n) {
  const pool = arr.slice();
  const out = [];
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

// --- Generadores de pregunta: cada uno devuelve {id, pregunta, opciones, correcta} o null ---

function _rlPreguntaAutor() {
  const candidatos = libros.filter(l => _rlValorAutor(l) && _rlValorTitulo(l));
  const autoresUnicos = [...new Set(candidatos.map(_rlValorAutor))];
  if (candidatos.length < 4 || autoresUnicos.length < 4) return null;
  const libro = candidatos[Math.floor(Math.random() * candidatos.length)];
  const correcta = _rlValorAutor(libro);
  const distractores = _rlMuestra(autoresUnicos.filter(a => a !== correcta), 3);
  if (distractores.length < 3) return null;
  return {
    id: `autor:${_rlValorTitulo(libro)}`,
    pregunta: `¿Quién escribió «${_rlValorTitulo(libro)}»?`,
    opciones: _rlMezclar([correcta, ...distractores]),
    correcta
  };
}

function _rlPreguntaAnio() {
  const candidatos = libros.filter(l => _rlValorAnio(l) !== null && _rlValorTitulo(l));
  if (candidatos.length < 4) return null;
  const libro = candidatos[Math.floor(Math.random() * candidatos.length)];
  const correctaNum = _rlValorAnio(libro);
  const autor = _rlValorAutor(libro);
  const aniosOtros = [...new Set(candidatos.filter(l => l !== libro).map(_rlValorAnio))].filter(a => a !== correctaNum);
  let distractores = _rlMuestra(aniosOtros, 3);
  while (distractores.length < 3) {
    const offset = (Math.floor(Math.random() * 15) + 3) * (Math.random() < 0.5 ? -1 : 1);
    const candidato = correctaNum + offset;
    if (candidato > 0 && candidato !== correctaNum && !distractores.includes(candidato)) distractores.push(candidato);
  }
  const correcta = String(correctaNum);
  const referencia = autor ? `«${_rlValorTitulo(libro)}», de ${autor}` : `«${_rlValorTitulo(libro)}»`;
  return {
    id: `anio:${_rlValorTitulo(libro)}`,
    pregunta: `¿En qué año se publicó ${referencia}?`,
    opciones: _rlMezclar([correcta, ...distractores.map(String)]),
    correcta
  };
}

function _rlPreguntaOrden() {
  const candidatos = libros.filter(l => _rlValorAnio(l) !== null && _rlValorTitulo(l));
  if (candidatos.length < 4) return null;
  const elegidos = _rlMuestra(candidatos, 4);
  if (elegidos.length < 4) return null;
  const anios = elegidos.map(_rlValorAnio);
  if (new Set(anios).size < 4) return null; // evita empates de año entre las opciones
  let idxMin = 0;
  anios.forEach((a, i) => { if (a < anios[idxMin]) idxMin = i; });
  const etiqueta = (l) => {
    const autor = _rlValorAutor(l);
    return autor ? `${_rlValorTitulo(l)} (${autor})` : _rlValorTitulo(l);
  };
  const correcta = etiqueta(elegidos[idxMin]);
  const opciones = elegidos.map(etiqueta);
  return {
    id: `orden:${elegidos.map(_rlValorTitulo).slice().sort().join('|')}`,
    pregunta: '¿Cuál de estos libros se publicó primero?',
    opciones: _rlMezclar(opciones),
    correcta
  };
}

const _RL_GENERADORES = [_rlPreguntaAutor, _rlPreguntaAnio, _rlPreguntaOrden, _rlPreguntaDelBanco];

// --- Banco de preguntas escritas a mano (tabla preguntas_trivia en Supabase) ---
// Se mezclan con las generadas automáticamente del Sheet. Aquí sí puede haber
// contenido de literatura en general que no dependa de tus libros catalogados.
let _rlBancoPreguntas = [];
async function _rlCargarBancoPreguntas() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from('preguntas_trivia')
    .select('id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, correcta');
  if (error) { console.error('Error cargando banco de preguntas:', error); return; }
  const mapaLetra = { a: 'opcion_a', b: 'opcion_b', c: 'opcion_c', d: 'opcion_d' };
  _rlBancoPreguntas = (data || []).map(row => {
    const correctaTexto = row[mapaLetra[row.correcta]];
    return {
      id: `banco:${row.id}`,
      pregunta: row.pregunta,
      opciones: _rlMezclar([row.opcion_a, row.opcion_b, row.opcion_c, row.opcion_d]),
      correcta: correctaTexto
    };
  });
}

function _rlPreguntaDelBanco() {
  if (!_rlBancoPreguntas.length) return null;
  const disponibles = _rlBancoPreguntas.filter(q => !_rlVistas.has(q.id));
  if (!disponibles.length) return null;
  return disponibles[Math.floor(Math.random() * disponibles.length)];
}

// --- Control de preguntas ya vistas (para no repetir al mismo visitante) ---
const RETO_VISTAS_KEY = 'bibliof_reto_vistas';
function _rlVistasCargar() {
  try { return new Set(JSON.parse(localStorage.getItem(RETO_VISTAS_KEY) || '[]')); }
  catch { return new Set(); }
}
function _rlVistasGuardar(set) { localStorage.setItem(RETO_VISTAS_KEY, JSON.stringify([...set])); }
let _rlVistas = _rlVistasCargar();

function _rlSiguientePregunta() {
  const intentos = 40;
  for (let i = 0; i < intentos; i++) {
    const gen = _RL_GENERADORES[Math.floor(Math.random() * _RL_GENERADORES.length)];
    const q = gen();
    if (q && !_rlVistas.has(q.id)) return q;
  }
  // Se agotó el pool razonable de preguntas nuevas: reinicia el registro y avisa
  _rlVistas = new Set();
  _rlVistasGuardar(_rlVistas);
  for (let i = 0; i < intentos; i++) {
    const gen = _RL_GENERADORES[Math.floor(Math.random() * _RL_GENERADORES.length)];
    const q = gen();
    if (q) { q._reinicio = true; return q; }
  }
  return null; // no hay suficientes datos en el Sheet todavía
}

// --- Nombres sugeridos para quien no quiera pensar un apodo ---
// Banco grande y variado (clásicos anglo, literatura en español, fantasía,
// mitología, etc.) para que las 4 sugerencias no se sientan repetidas.
const RETO_NOMBRES_SUGERIDOS = [
  // Clásicos anglosajones
  'Gatsby', 'Bennet', 'Finch', 'Granger', 'Ishmael', 'DorianGray',
  'Caulfield', 'JaneEyre', 'Holmes', 'Darcy', 'Winston', 'Offred',
  'Salander', 'Huck', 'Scout', 'Karenina', 'Heathcliff', 'Valjean',
  'Dantes', 'Cathy', 'Frankenstein', 'Bovary', 'Nemo', 'Ripley',
  'Elizabeth', 'Rochester', 'Fagin', 'Copperfield', 'Havisham', 'Dorothea',
  // Literatura en español / Latinoamérica
  'DonQuijote', 'Dulcinea', 'Aureliano', 'Ursula', 'Melquiades', 'RemediosBella',
  'PedroParamo', 'Artemio', 'Oliveira', 'LaMaga', 'Rayuela', 'Eréndira',
  'Florentino', 'FermIna', 'Santiago', 'Meursault', 'Raskolnikov', 'Cortazar',
  'DonaBarbara', 'Zorro', 'Facundo', 'Martin Fierro', 'Sandokan', 'Platero',
  // Fantasía y ciencia ficción
  'Bilbo', 'Frodo', 'Arwen', 'Hermione', 'Atreyu', 'Bastian',
  'Ged', 'Lyra', 'Paul Atreides', 'Chani', 'Ripley', 'Murderbot',
  'Katniss', 'Alina', 'Kvothe', 'Vin', 'Yennefer', 'Geralt',
  // Mitología y clásicos antiguos
  'Ulises', 'Penelope', 'Antígona', 'Medea', 'Ariadna', 'Ícaro',
  'Sherezada', 'Aladino', 'Simbad', 'Circe', 'Perséfone', 'Orfeo'
];
function _rlSugerenciaConNumero(base) {
  const numero = Math.floor(Math.random() * 90) + 10; // 10–99
  return `${base}${numero}`;
}
function _rlPintarSugerenciasNombre() {
  const cont = document.getElementById('retoSugerencias');
  if (!cont) return;
  cont.innerHTML = '';
  _rlMuestra(RETO_NOMBRES_SUGERIDOS, 4).forEach(base => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'reto-chip';
    const sugerido = _rlSugerenciaConNumero(base);
    chip.textContent = sugerido;
    chip.addEventListener('click', () => { document.getElementById('retoNombre').value = sugerido; });
    cont.appendChild(chip);
  });
}

// --- Estado y flujo del juego ---
const RETO_APODO_KEY = 'bibliof_reto_apodo';
function _rlApodoGuardado() { return localStorage.getItem(RETO_APODO_KEY) || ''; }
function _rlGuardarApodo(nombre) { localStorage.setItem(RETO_APODO_KEY, nombre); }

// Actualiza el apodo del jugador ya existente en Supabase (mismo jugador_id,
// mismo puntaje acumulado — solo cambia cómo se muestra en la tabla). Si
// todavía no tiene fila en la tabla (nunca ha terminado una partida), no hay
// nada que actualizar ahí: el nombre nuevo se usará la próxima vez que se
// guarde un puntaje.
async function _rlActualizarApodoEnDB(nuevoApodo) {
  if (!supabaseClient) return true;
  const id = localStorage.getItem(RETO_JUGADOR_ID_KEY);
  if (!id) return true;
  const { error } = await supabaseClient
    .from('puntajes')
    .update({ apodo: nuevoApodo })
    .eq('jugador_id', id);
  if (error) { console.error('Error actualizando apodo en DB:', error); return false; }
  return true;
}

let _rlApodo = '';
let _rlRenombrando = false;
let _rlAciertos = 0;
let _rlTotal = 0;
let _rlPreguntaActual = null;
let _rlBloqueado = false;

function _rlMostrarPantalla(pantalla) {
  document.getElementById('retoEntrada').style.display = pantalla === 'entrada' ? '' : 'none';
  document.getElementById('retoTablaBloque').style.display = pantalla === 'entrada' ? '' : 'none';
  document.getElementById('retoJuego').style.display = pantalla === 'juego' ? '' : 'none';
  document.getElementById('retoFin').style.display = pantalla === 'fin' ? '' : 'none';
}

// Pinta la pantalla de entrada: si ya hay un apodo guardado en este
// navegador, salta directo a "seguir jugando" en vez de pedirlo de nuevo.
// Antes de pintar, sincroniza con la base de datos por si el apodo se
// editó directamente ahí (para que Supabase sea la fuente de verdad real).
// La tabla de posiciones ya no está detrás de un toggle: se pinta siempre,
// en su propia tarjeta debajo de la de apodo (ver retoTablaBloque en el HTML).
async function _rlPintarEntrada() {
  await _rlSincronizarApodoDesdeDB();

  _rlRenombrando = false;
  document.getElementById('retoCancelarRenombrar').style.display = 'none';
  document.getElementById('retoEmpezar').textContent = 'Empezar';

  const guardado = _rlApodoGuardado();
  const recurrente = document.getElementById('retoEntradaRecurrente');
  const nueva = document.getElementById('retoEntradaNueva');
  if (guardado) {
    document.getElementById('retoApodoGuardado').textContent = guardado;
    recurrente.style.display = '';
    nueva.style.display = 'none';
  } else {
    recurrente.style.display = 'none';
    nueva.style.display = '';
    document.getElementById('retoNombre').value = '';
    _rlPintarSugerenciasNombre();
  }

  _rlRenderLeaderboard('retoTablaEntrada');
}

// Pantalla para cambiar el apodo sin perder el puntaje acumulado: reutiliza
// el mismo formulario de "nombre nuevo", pero al guardar actualiza el
// registro existente (mismo jugador_id) en vez de crear uno distinto.
function _rlIniciarRenombrar() {
  _rlRenombrando = true;
  document.getElementById('retoEntradaRecurrente').style.display = 'none';
  const nueva = document.getElementById('retoEntradaNueva');
  nueva.style.display = '';
  const input = document.getElementById('retoNombre');
  input.value = _rlApodoGuardado();
  document.getElementById('retoAvisoNombre').style.display = 'none';
  document.getElementById('retoEmpezar').textContent = 'Guardar nombre';
  document.getElementById('retoCancelarRenombrar').style.display = '';
  _rlPintarSugerenciasNombre();
  input.focus();
  input.select();
}

// Si este navegador ya tiene una partida guardada en Supabase, trae el
// apodo tal como está AHORA en la base de datos y actualiza localStorage
// para que coincida — así, si lo editas manualmente en Supabase, la
// próxima vez que entres a la pestaña se refleja en vez de seguir
// mostrando (y luego sobrescribiendo) el nombre viejo del navegador.
async function _rlSincronizarApodoDesdeDB() {
  if (!supabaseClient) return;
  const id = localStorage.getItem(RETO_JUGADOR_ID_KEY);
  if (!id) return; // nunca ha jugado desde este navegador, nada que sincronizar
  const { data, error } = await supabaseClient
    .from('puntajes')
    .select('apodo')
    .eq('jugador_id', id)
    .maybeSingle();
  if (error) { console.error('Error sincronizando apodo:', error); return; }
  if (data && data.apodo) _rlGuardarApodo(data.apodo);
}

function _rlActualizarMarcador() {
  document.getElementById('retoMarcador').textContent = `${_rlAciertos} / ${_rlTotal}`;
}

// Arranca la partida (ya con _rlApodo definido, venga de donde venga)
function _rlIniciarPartida() {
  _rlAciertos = 0;
  _rlTotal = 0;
  document.getElementById('retoJugador').textContent = _rlApodo;
  _rlActualizarMarcador();
  _rlMostrarPantalla('juego');
  _rlSiguienteRonda();
}

function _rlSiguienteRonda() {
  const feedback = document.getElementById('retoFeedback');
  feedback.textContent = '';
  feedback.className = 'reto-feedback';

  const q = _rlSiguientePregunta();
  const contOpciones = document.getElementById('retoOpciones');
  const pPregunta = document.getElementById('retoPregunta');

  if (!q) {
    pPregunta.textContent = 'Todavía no hay suficientes libros con año, autor o género para armar preguntas nuevas. ¡Vuelve cuando la biblioteca crezca un poco más! 📚';
    contOpciones.innerHTML = '';
    return;
  }

  if (q._reinicio) {
    feedback.textContent = '¡Ya viste todas las preguntas que hay por ahora! Reiniciamos 🔄';
    feedback.className = 'reto-feedback exito';
  }

  _rlPreguntaActual = q;
  pPregunta.textContent = q.pregunta;
  contOpciones.innerHTML = '';
  q.opciones.forEach(op => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'reto-opcion';
    btn.textContent = op;
    btn.addEventListener('click', () => _rlResponder(op, btn));
    contOpciones.appendChild(btn);
  });
}

function _rlResponder(opcionElegida, btnElegido) {
  if (_rlBloqueado || !_rlPreguntaActual) return;
  _rlBloqueado = true;

  const q = _rlPreguntaActual;
  _rlVistas.add(q.id);
  _rlVistasGuardar(_rlVistas);

  const correcta = opcionElegida === q.correcta;
  _rlTotal++;
  if (correcta) _rlAciertos++;
  _rlActualizarMarcador();

  document.querySelectorAll('#retoOpciones .reto-opcion').forEach(b => {
    b.disabled = true;
    if (b.textContent === q.correcta) b.classList.add('correcta');
    else if (b === btnElegido) b.classList.add('incorrecta');
  });

  const feedback = document.getElementById('retoFeedback');
  feedback.textContent = correcta ? '¡Correcto! 🎉' : `Casi — la respuesta correcta era "${q.correcta}"`;
  feedback.className = 'reto-feedback ' + (correcta ? 'exito' : 'error');

  setTimeout(() => { _rlBloqueado = false; _rlSiguienteRonda(); }, 1400);
}

async function _rlRenderLeaderboard(contId) {
  const cont = document.getElementById(contId);
  if (!cont) return;
  cont.innerHTML = '<p style="color:var(--muted)">Cargando...</p>';
  const top = await obtenerLeaderboard(10);
  if (top.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted)">Todavía no hay nadie en la tabla — ¡sé la primera persona! 🏅</p>';
    return;
  }
  cont.innerHTML = '<h3 class="reto-leaderboard-titulo">🏅 Mejores puntajes</h3><ol class="reto-leaderboard-lista">' +
    top.map(row => `<li><span>${escapeHtml(row.apodo)}</span><span>${row.puntaje}/${row.total_preguntas}</span></li>`).join('') +
    '</ol>';
}


async function _rlTerminar() {
  document.getElementById('retoTerminar').disabled = true;
  const guardado = await guardarPuntaje(_rlApodo, _rlAciertos, _rlTotal || 1);

  document.getElementById('retoResumen').textContent =
    `${_rlApodo}, respondiste ${_rlTotal} pregunta${_rlTotal !== 1 ? 's' : ''} y acertaste ${_rlAciertos}.`;

  const notaAcumulado = document.getElementById('retoNotaAcumulado');
  if (!guardado) {
    notaAcumulado.textContent = '⚠️ No se pudo guardar tu puntaje esta vez (revisa tu conexión e inténtalo de nuevo más tarde).';
    notaAcumulado.classList.add('reto-nota-error');
  } else {
    notaAcumulado.textContent = 'Tu puntaje en la tabla se va sumando cada vez que juegas 📈';
    notaAcumulado.classList.remove('reto-nota-error');
  }

  await _rlRenderLeaderboard('retoLeaderboard');

  document.getElementById('retoTerminar').disabled = false;
  _rlMostrarPantalla('fin');
}

// Comprueba si un apodo ya lo está usando OTRO jugador (otro id de navegador).
// Si Supabase no está disponible, dejamos pasar (no podemos validar, pero
// tampoco queremos bloquear el juego por eso).
async function _rlApodoDisponible(nombre) {
  if (!supabaseClient) return true;
  const { data, error } = await supabaseClient
    .from('puntajes')
    .select('jugador_id')
    .eq('apodo', nombre);
  if (error) { console.error('Error validando apodo:', error); return true; }
  if (!data || data.length === 0) return true;
  const idPropio = localStorage.getItem(RETO_JUGADOR_ID_KEY);
  return data.every(row => row.jugador_id === idPropio);
}

document.getElementById('retoEmpezar')?.addEventListener('click', async () => {
  const input = document.getElementById('retoNombre');
  const nombre = (input.value || '').trim().slice(0, 30) || 'Anónimo';
  const btnEmpezar = document.getElementById('retoEmpezar');
  const aviso = document.getElementById('retoAvisoNombre');
  aviso.style.display = 'none';

  const textoOriginal = _rlRenombrando ? 'Guardar nombre' : 'Empezar';
  btnEmpezar.disabled = true;
  btnEmpezar.textContent = 'Comprobando...';
  const disponible = await _rlApodoDisponible(nombre);
  btnEmpezar.disabled = false;
  btnEmpezar.textContent = textoOriginal;

  if (!disponible) {
    aviso.textContent = `"${nombre}" ya lo está usando alguien más — prueba otro nombre o agrégale un número.`;
    aviso.style.display = '';
    return;
  }

  if (_rlRenombrando) {
    btnEmpezar.disabled = true;
    btnEmpezar.textContent = 'Guardando...';
    await _rlActualizarApodoEnDB(nombre);
    _rlGuardarApodo(nombre);
    btnEmpezar.disabled = false;
    await _rlPintarEntrada();
    return;
  }

  _rlGuardarApodo(nombre);
  _rlApodo = nombre;
  _rlIniciarPartida();
});
document.getElementById('retoNombre')?.addEventListener('input', () => {
  document.getElementById('retoAvisoNombre').style.display = 'none';
});
document.getElementById('retoNombre')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('retoEmpezar').click(); }
});
document.getElementById('retoOtrasSugerencias')?.addEventListener('click', _rlPintarSugerenciasNombre);
document.getElementById('retoContinuar')?.addEventListener('click', () => {
  _rlApodo = _rlApodoGuardado();
  _rlIniciarPartida();
});
document.getElementById('retoCambiarNombre')?.addEventListener('click', () => {
  _rlIniciarRenombrar();
});
document.getElementById('retoCancelarRenombrar')?.addEventListener('click', () => {
  _rlPintarEntrada();
});
document.getElementById('retoTerminar')?.addEventListener('click', _rlTerminar);
document.getElementById('retoJugarOtra')?.addEventListener('click', () => {
  _rlPintarEntrada();
  _rlMostrarPantalla('entrada');
});

_rlPintarEntrada();
_rlCargarBancoPreguntas();

// =====================================================
// DUELO DE PERSONAJES — votación de "quién ganaría" entre dos
// personajes de libros, por categoría. Reutiliza la misma identidad
// de jugador (jugador_id + apodo) que el Reto Literario, así que el
// nombre es uno solo en todo el sitio, pero el puntaje se lleva aparte.
// Tablas en Supabase: duelo_personajes, duelos, duelo_votos.
// Vistas: duelo_resultados, personaje_ranking, duelista_ranking.
// =====================================================

// Los valores de "id" deben coincidir EXACTO con lo que se escriba en la
// columna categoria de duelo_personajes/duelos (mayúsculas y acentos
// incluidos), o el filtro no encuentra los duelos de esa categoría.
const DUELO_CATEGORIAS = [
  { id: 'Magia y Poder',        icon: '🔮', label: 'Magia y Poder' },
  { id: 'Mentes Maestras',      icon: '🕵️', label: 'Mentes Maestras' },
  { id: 'Capa y Espada',        icon: '⚔️', label: 'Capa y Espada' },
  { id: 'Mujeres de Carácter',  icon: '👑', label: 'Mujeres de Carácter' }
];

// Los rankings (top 3 por categoría y "Ranking de esta categoría") ya no
// usan un mínimo de votos artificial: ordenan por rating Elo, que siempre
// carga información real (incluso con 1 solo duelo jugado) porque cada
// ajuste ya compara contra el rival, no solo cuenta victorias sueltas.
// Solo se excluyen los personajes con 0 duelos jugados (nunca han sido
// votados) — ver duelo_personajes_migracion_v6_elo.sql.

// --- Duelos ya votados en este navegador (para no repetirlos) ---
const DUELO_VISTOS_KEY = 'bibliof_duelo_vistos';
function _duVistosCargar() {
  try { return new Set(JSON.parse(localStorage.getItem(DUELO_VISTOS_KEY) || '[]')); }
  catch { return new Set(); }
}
function _duVistosGuardar(set) { localStorage.setItem(DUELO_VISTOS_KEY, JSON.stringify([...set])); }
let _duVistos = _duVistosCargar();

let _duCategoriaActual = null;
let _duDuelosCategoria = [];
let _duDueloActual = null;
let _duBloqueado = false;

// Pantalla de entrada: pide apodo si este navegador todavía no tiene uno
// (comparte identidad con el Reto Literario), luego muestra categorías.
async function _duPintarEntrada() {
  document.getElementById('duJuego').style.display = 'none';
  document.getElementById('duEntrada').style.display = '';

  await _rlSincronizarApodoDesdeDB();
  const apodo = _rlApodoGuardado();

  const bloqueApodo = document.getElementById('duEntradaApodo');
  const bloqueCategorias = document.getElementById('duEntradaCategorias');

  if (!apodo) {
    bloqueApodo.style.display = '';
    bloqueCategorias.style.display = 'none';
    document.getElementById('duNombre').value = '';
    document.getElementById('duAvisoNombre').style.display = 'none';
    _duPintarSugerenciasNombre();
    return;
  }

  bloqueApodo.style.display = 'none';
  bloqueCategorias.style.display = '';
  await _duPintarCategorias();
}

function _duPintarSugerenciasNombre() {
  const cont = document.getElementById('duSugerencias');
  if (!cont) return;
  cont.innerHTML = '';
  _rlMuestra(RETO_NOMBRES_SUGERIDOS, 4).forEach(base => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'reto-chip';
    const sugerido = _rlSugerenciaConNumero(base);
    chip.textContent = sugerido;
    chip.addEventListener('click', () => { document.getElementById('duNombre').value = sugerido; });
    cont.appendChild(chip);
  });
}

// Categorías que tienen al menos un duelo activo cargado en Supabase
async function _duCategoriasConDuelos() {
  if (!supabaseClient) return new Set();
  const { data, error } = await supabaseClient
    .from('duelos')
    .select('categoria')
    .eq('activo', true);
  if (error) { console.error('Error cargando categorías de duelo:', error); return new Set(); }
  return new Set((data || []).map(r => r.categoria));
}

async function _duPintarCategorias() {
  const cont = document.getElementById('duCategoriaBtns');
  const sinCategorias = document.getElementById('duSinCategorias');
  cont.innerHTML = '<p style="color:var(--muted); font-size:0.85rem;">Cargando...</p>';

  const disponibles = await _duCategoriasConDuelos();
  cont.innerHTML = '';

  const categoriasAMostrar = DUELO_CATEGORIAS.filter(c => disponibles.has(c.id));
  if (categoriasAMostrar.length === 0) {
    sinCategorias.style.display = '';
    return;
  }
  sinCategorias.style.display = 'none';

  categoriasAMostrar.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'genero-btn';
    btn.textContent = `${cat.icon} ${cat.label}`;
    btn.addEventListener('click', () => _duElegirCategoria(cat));
    cont.appendChild(btn);
  });

  _duPintarTopCategorias(categoriasAMostrar);
}

// Cuadritos con el top 3 de cada categoría visible, en un carrusel
// horizontal (mismo patrón que quiz-chips-scroll), para que se pueda ver
// un vistazo general sin tener que entrar una por una. Se puede tocar el
// cuadrito para saltar directo a esa categoría.
// El orden es por rating Elo, de mayor a menor — ver _duMostrarRankingCategoria.
const DUELO_MEDALLAS = ['🥇', '🥈', '🥉'];
async function _duPintarTopCategorias(categorias) {
  const cont = document.getElementById('duTopCategorias');
  if (!cont) return;
  cont.innerHTML = '';
  if (!supabaseClient || categorias.length === 0) return;

  const { data, error } = await supabaseClient
    .from('duelo_personajes')
    .select('categoria, nombre, elo, duelos_jugados')
    .in('categoria', categorias.map(c => c.id))
    .gt('duelos_jugados', 0)
    .order('elo', { ascending: false });
  if (error) { console.error('Error cargando top de categorías:', error); return; }

  const porCategoria = {};
  (data || []).forEach(row => {
    if (!porCategoria[row.categoria]) porCategoria[row.categoria] = [];
    if (porCategoria[row.categoria].length < 3) porCategoria[row.categoria].push(row);
  });

  const track = document.createElement('div');
  track.className = 'du-top-carousel';

  categorias.forEach(cat => {
    const top3 = porCategoria[cat.id] || [];
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'du-top-card';

    const filas = top3.length
      ? top3.map((row, i) => `
          <span class="du-top-card-fila">
            <span class="du-top-card-medalla">${DUELO_MEDALLAS[i]}</span>
            <span class="du-top-card-nombre">${escapeHtml(row.nombre)}</span>
            <span class="du-top-card-pct">${Math.round(row.elo)} Elo</span>
          </span>`).join('')
      : '<span class="du-top-card-vacio">Todavía sin votos</span>';

    card.innerHTML = `<span class="du-top-card-titulo">${cat.icon} ${escapeHtml(cat.label)}</span>${filas}`;
    card.addEventListener('click', () => _duElegirCategoria(cat));
    track.appendChild(card);
  });

  cont.appendChild(track);
}

// Elige categoría y trae sus duelos activos (con datos de ambos personajes ya incluidos)
async function _duElegirCategoria(cat) {
  _duCategoriaActual = cat;
  document.getElementById('duEntrada').style.display = 'none';
  document.getElementById('duJuego').style.display = '';
  document.getElementById('duCategoriaActual').textContent = `${cat.icon} ${cat.label}`;
  document.getElementById('duRankingCategoria').style.display = 'none';
  document.getElementById('duRankingCategoria').innerHTML = '';
  document.getElementById('duVsCard').innerHTML = '<p style="color:var(--muted)">Cargando duelo...</p>';
  document.getElementById('duResultado').style.display = 'none';
  document.getElementById('duOtroDuelo').style.display = 'none';

  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from('duelos')
    .select(`
      id, categoria,
      personaje_a:personaje_a_id ( id, nombre, obra ),
      personaje_b:personaje_b_id ( id, nombre, obra )
    `)
    .eq('categoria', cat.id)
    .eq('activo', true);
  if (error) { console.error('Error cargando duelos:', error); return; }
  _duDuelosCategoria = data || [];
  _duSiguienteDuelo();
}

function _duSiguienteDuelo() {
  let disponibles = _duDuelosCategoria.filter(d => !_duVistos.has(d.id));
  let reinicio = false;
  if (disponibles.length === 0 && _duDuelosCategoria.length > 0) {
    _duDuelosCategoria.forEach(d => _duVistos.delete(d.id));
    _duVistosGuardar(_duVistos);
    disponibles = _duDuelosCategoria;
    reinicio = true;
  }
  if (disponibles.length === 0) {
    document.getElementById('duVsCard').innerHTML = '<p style="color:var(--muted)">Todavía no hay duelos en esta categoría — ¡vuelve pronto! 📚</p>';
    return;
  }
  const duelo = disponibles[Math.floor(Math.random() * disponibles.length)];
  _duMostrarDuelo(duelo, reinicio);
}

function _duMostrarDuelo(duelo, reinicio) {
  _duDueloActual = duelo;
  _duBloqueado = false;
  document.getElementById('duResultado').style.display = 'none';
  document.getElementById('duOtroDuelo').style.display = 'none';

  const cont = document.getElementById('duVsCard');
  cont.innerHTML = '';
  if (reinicio) {
    const aviso = document.createElement('p');
    aviso.className = 'reto-feedback exito';
    aviso.textContent = '¡Ya votaste todos los duelos de esta categoría! Reiniciamos 🔄';
    cont.appendChild(aviso);
  }

  const fila = document.createElement('div');
  fila.className = 'du-vs-card';

  const btnA = document.createElement('button');
  btnA.type = 'button';
  btnA.className = 'du-personaje';
  btnA.innerHTML = `<span class="du-personaje-nombre">${escapeHtml(duelo.personaje_a.nombre)}</span><span class="du-personaje-obra">${escapeHtml(duelo.personaje_a.obra)}</span>`;
  btnA.addEventListener('click', () => _duVotar(duelo, duelo.personaje_a.id));

  const vs = document.createElement('span');
  vs.className = 'du-vs';
  vs.textContent = 'VS';

  const btnB = document.createElement('button');
  btnB.type = 'button';
  btnB.className = 'du-personaje';
  btnB.innerHTML = `<span class="du-personaje-nombre">${escapeHtml(duelo.personaje_b.nombre)}</span><span class="du-personaje-obra">${escapeHtml(duelo.personaje_b.obra)}</span>`;
  btnB.addEventListener('click', () => _duVotar(duelo, duelo.personaje_b.id));

  fila.appendChild(btnA);
  fila.appendChild(vs);
  fila.appendChild(btnB);
  cont.appendChild(fila);
}

async function _duVotar(duelo, personajeElegidoId) {
  if (_duBloqueado) return;
  _duBloqueado = true;
  document.querySelectorAll('.du-personaje').forEach(b => b.disabled = true);

  if (supabaseClient) {
    // duelo_votar_elo guarda el voto Y actualiza el rating Elo de los dos
    // personajes en una sola operación (ver duelo_personajes_migracion_v6_elo.sql).
    // Si este jugador ya había votado este mismo duelo, la función no hace
    // nada (ni guarda un voto repetido ni mueve el Elo dos veces).
    const { error } = await supabaseClient.rpc('duelo_votar_elo', {
      p_duelo_id: duelo.id,
      p_personaje_elegido_id: personajeElegidoId,
      p_jugador_id: _rlJugadorId()
    });
    if (error) console.error('Error guardando voto:', error);
  }

  _duVistos.add(duelo.id);
  _duVistosGuardar(_duVistos);

  await _duMostrarResultado(duelo, personajeElegidoId);
  document.getElementById('duOtroDuelo').style.display = '';
}

async function _duMostrarResultado(duelo, personajeElegidoId) {
  const cont = document.getElementById('duResultado');
  cont.style.display = '';
  cont.innerHTML = '<p style="color:var(--muted)">Cargando resultado...</p>';

  if (!supabaseClient) { cont.innerHTML = ''; return; }
  const { data, error } = await supabaseClient
    .from('duelo_resultados')
    .select('votos_a, votos_b, votos_totales')
    .eq('duelo_id', duelo.id)
    .maybeSingle();
  if (error || !data) { console.error('Error cargando resultado:', error); cont.innerHTML = ''; return; }

  const total = data.votos_totales || 0;
  const pctA = total > 0 ? Math.round((data.votos_a / total) * 100) : 0;
  const pctB = total > 0 ? Math.round((data.votos_b / total) * 100) : 0;

  const fila = (nombre, pct, esMiVoto) => `
    <div class="du-resultado-fila ${esMiVoto ? 'du-mi-voto' : ''}">
      <div class="du-resultado-nombre">
        <span>${escapeHtml(nombre)}</span>
        ${esMiVoto ? '<span class="du-resultado-check">✓ tu voto</span>' : ''}
      </div>
      <div class="du-barra-row">
        <div class="du-barra"><div class="du-barra-fill" style="width:${pct}%"></div></div>
        <span class="du-resultado-pct">${pct}%</span>
      </div>
    </div>`;

  // Este total es la suma de TODOS los votos que ha recibido este par de
  // personajes específico, de cualquier jugador, desde siempre — no solo
  // el tuyo. Si casi siempre marca 1, es porque cada categoría tiene
  // muchos duelos posibles (ver tabla duelos) y el sitio elige uno al
  // azar cada vez, así que es normal tardar en repetir el mismo par.
  cont.innerHTML =
    fila(duelo.personaje_a.nombre, pctA, personajeElegidoId === duelo.personaje_a.id) +
    fila(duelo.personaje_b.nombre, pctB, personajeElegidoId === duelo.personaje_b.id) +
    `<p class="du-resultado-total">${total} voto${total !== 1 ? 's' : ''} acumulado${total !== 1 ? 's' : ''} entre estos dos personajes</p>`;
}

// Ranking acumulado de personajes dentro de la categoría elegida (win rate)
async function _duMostrarRankingCategoria() {
  const cont = document.getElementById('duRankingCategoria');
  const yaVisible = cont.style.display !== 'none' && cont.innerHTML.trim() !== '';
  if (yaVisible) { cont.style.display = 'none'; cont.innerHTML = ''; return; }

  cont.style.display = '';
  cont.innerHTML = '<p style="color:var(--muted)">Cargando...</p>';
  if (!supabaseClient || !_duCategoriaActual) return;

  // El ranking ahora ordena por rating Elo (como el ajedrez) en vez de por
  // % crudo — ver duelo_personajes_migracion_v6_elo.sql. Cada vez que
  // alguien vota, el Elo de los dos personajes del duelo se ajusta según
  // qué tan "sorprendente" fue el resultado, así que ya no hace falta un
  // mínimo de votos para que el número signifique algo: con 1500 de
  // arranque para todos, solo se listan los que ya jugaron al menos un
  // duelo (duelos_jugados > 0).
  const { data, error } = await supabaseClient
    .from('duelo_personajes')
    .select('nombre, elo, duelos_jugados')
    .eq('categoria', _duCategoriaActual.id)
    .gt('duelos_jugados', 0)
    .order('elo', { ascending: false });
  if (error) { console.error('Error cargando ranking:', error); cont.innerHTML = ''; return; }
  if (!data || data.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted)">Todavía no hay votos en esta categoría.</p>';
    return;
  }

  cont.innerHTML = `<h3 class="reto-leaderboard-titulo">📊 Ranking de ${escapeHtml(_duCategoriaActual.label)}</h3><ol class="reto-leaderboard-lista">` +
    data.map(row => `<li><span>${escapeHtml(row.nombre)} <span class="du-ranking-item-extra">(${row.duelos_jugados} duelo${row.duelos_jugados !== 1 ? 's' : ''})</span></span><span>${Math.round(row.elo)} Elo</span></li>`).join('') +
    '</ol>';
}

// Leaderboard de duelistas más activos (participación, no acierto)
async function _duMostrarDuelistas() {
  const cont = document.getElementById('duDuelistasEntrada');
  const yaVisible = cont.style.display !== 'none' && cont.innerHTML.trim() !== '';
  if (yaVisible) { cont.style.display = 'none'; cont.innerHTML = ''; return; }

  cont.style.display = '';
  cont.innerHTML = '<p style="color:var(--muted)">Cargando...</p>';
  if (!supabaseClient) return;

  const { data, error } = await supabaseClient
    .from('duelista_ranking')
    .select('apodo, puntaje_duelos')
    .order('puntaje_duelos', { ascending: false })
    .limit(10);
  if (error) { console.error('Error cargando duelistas:', error); cont.innerHTML = ''; return; }
  if (!data || data.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted)">Todavía no hay nadie en la tabla — ¡sé la primera persona! ⚔️</p>';
    return;
  }

  cont.innerHTML = '<h3 class="reto-leaderboard-titulo">🏅 Duelistas más activos</h3><ol class="reto-leaderboard-lista">' +
    data.map(row => `<li><span>${escapeHtml(row.apodo || 'Anónimo')}</span><span>${row.puntaje_duelos}</span></li>`).join('') +
    '</ol>';
}

document.getElementById('duGuardarNombre')?.addEventListener('click', async () => {
  const input = document.getElementById('duNombre');
  const nombre = (input.value || '').trim().slice(0, 30) || 'Anónimo';
  const btn = document.getElementById('duGuardarNombre');
  const aviso = document.getElementById('duAvisoNombre');
  aviso.style.display = 'none';

  btn.disabled = true;
  btn.textContent = 'Comprobando...';
  const disponible = await _rlApodoDisponible(nombre);
  btn.disabled = false;
  btn.textContent = 'Continuar';

  if (!disponible) {
    aviso.textContent = `"${nombre}" ya lo está usando alguien más — prueba otro nombre o agrégale un número.`;
    aviso.style.display = '';
    return;
  }

  _rlGuardarApodo(nombre);
  await _duPintarEntrada();
});
document.getElementById('duNombre')?.addEventListener('input', () => {
  document.getElementById('duAvisoNombre').style.display = 'none';
});
document.getElementById('duNombre')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('duGuardarNombre').click(); }
});
document.getElementById('duOtrasSugerencias')?.addEventListener('click', _duPintarSugerenciasNombre);
document.getElementById('duVerDuelistas')?.addEventListener('click', _duMostrarDuelistas);
document.getElementById('duCambiarCategoria')?.addEventListener('click', _duPintarEntrada);
document.getElementById('duOtroDuelo')?.addEventListener('click', _duSiguienteDuelo);
document.getElementById('duVerRanking')?.addEventListener('click', _duMostrarRankingCategoria);

// --- Sección Sugerencias ---
(function() {
  const form = document.getElementById('formSugerencias');
  if (!form) return;

  const tipoBtns = document.querySelectorAll('.sugerencias-tipo-btn');
  const campoLibro = document.getElementById('campoLibroRelacionado');
  const inputLibro = document.getElementById('sugLibro');
  const inputMensaje = document.getElementById('sugMensaje');
  const inputNombre = document.getElementById('sugNombre');
  const estadoEl = document.getElementById('sugerenciasEstado');
  const btnEnviar = document.getElementById('btnEnviarSugerencia');
  let tipoActual = 'sugerencia_libro';

  const placeholdersPorTipo = {
    sugerencia_libro: 'Cuéntame por qué te gustó, o lo que quieras compartir...',
    comentario_general: '¿Qué quieres decirme? Ideas, sugerencias para la página, lo que sea...'
  };

  function actualizarVistaTipo() {
    campoLibro.style.display = tipoActual === 'sugerencia_libro' ? '' : 'none';
    inputMensaje.placeholder = placeholdersPorTipo[tipoActual];
  }

  tipoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tipoBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tipoActual = btn.dataset.tipo;
      actualizarVistaTipo();
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = inputMensaje.value.trim();
    if (!mensaje) {
      estadoEl.textContent = 'Escribe algo antes de enviar 🙂';
      estadoEl.className = 'sugerencias-estado error';
      return;
    }

    const libro = inputLibro.value.trim();
    const nombre = inputNombre.value.trim();

    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando...';
    estadoEl.textContent = '';
    estadoEl.className = 'sugerencias-estado';

    const ok = await enviarSugerencia({
      tipo: tipoActual,
      mensaje,
      libroRelacionado: (tipoActual === 'sugerencia_libro' && libro) ? libro : null,
      nombre: nombre || null
    });

    btnEnviar.disabled = false;
    btnEnviar.textContent = 'Enviar';

    if (ok) {
      form.reset();
      actualizarVistaTipo();
      estadoEl.textContent = '¡Gracias! Ya me llegó tu mensaje 💌';
      estadoEl.className = 'sugerencias-estado exito';
    } else {
      estadoEl.textContent = 'Ups, algo falló. ¿Puedes intentar de nuevo en un momento?';
      estadoEl.className = 'sugerencias-estado error';
    }
  });
})();

// --- Drawer del menú (solo tiene efecto visual en móvil; en escritorio el sidebar va fijo) ---
const sidebarEl = document.getElementById('sidebar');
const sidebarOverlayEl = document.getElementById('sidebarOverlay');
const menuToggleEl = document.getElementById('menuToggle');
const sidebarCloseEl = document.getElementById('sidebarClose');

function abrirSidebar() {
  sidebarEl.classList.add('open');
  sidebarOverlayEl.classList.remove('hidden');
  if (menuToggleEl) menuToggleEl.setAttribute('aria-expanded', 'true');
}
function cerrarSidebar() {
  sidebarEl.classList.remove('open');
  sidebarOverlayEl.classList.add('hidden');
  if (menuToggleEl) menuToggleEl.setAttribute('aria-expanded', 'false');
}
if (menuToggleEl) menuToggleEl.addEventListener('click', abrirSidebar);
if (sidebarCloseEl) sidebarCloseEl.addEventListener('click', cerrarSidebar);
if (sidebarOverlayEl) sidebarOverlayEl.addEventListener('click', cerrarSidebar);

// Cargar contenido de info.html dinámicamente
let _infoLoaded = false;
function cargarInfo() {
  if (_infoLoaded) return;
  fetch('info.html')
    .then(r => r.text())
    .then(html => {
      document.getElementById('infoContenido').innerHTML = html;
      _infoLoaded = true;
    })
    .catch(() => {
      document.getElementById('infoContenido').innerHTML = '<p>No se pudo cargar la información.</p>';
    });
}







// --- Recomendador: ¿Cómo me siento? ---
// La clasificación YA NO se calcula con reglas de género/tono/ritmo: cada libro
// trae su propia columna "Mood" en la hoja de Google Sheets (separada por comas,
// usando estas mismas claves: feliz, drama, atrapar, aventura, pasado, reflexion,
// inspiracion, buenrato, clasico, escapar). Así Fátima decide y ajusta a mano
// dónde va cada libro, sin tener que tocar el código.
const MOODS = {
  feliz:       { icono: '😂', numero: '01', titulo: 'Algo que me haga feliz',   frase: 'Comedias y finales que sacan una sonrisa' },
  drama:       { icono: '💔', numero: '02', titulo: 'Puro drama',                frase: 'Historias profundas, de las que remueven algo' },
  atrapar:     { icono: '🕵️', numero: '03', titulo: 'No lo puedes soltar',       frase: 'Ritmo ágil, tensión, páginas que se devoran' },
  aventura:    { icono: '⚔️', numero: '04', titulo: 'Vivir una aventura',        frase: 'Misión, riesgo y camino por recorrer' },
  pasado:      { icono: '🏰', numero: '05', titulo: 'Viajar al pasado',          frase: 'Otras épocas, reales o noveladas' },
  reflexion:   { icono: '🌿', numero: '06', titulo: 'Para reflexionar',          frase: 'Libros que te hacen pensar distinto' },
  inspiracion: { icono: '💪', numero: '07', titulo: 'Necesito inspiración',      frase: 'Historias reales de superación' },
  buenrato:    { icono: '☁️', numero: '08', titulo: 'Para pasar un buen rato',   frase: 'Ligero, ameno, sin complicarse' },
  clasico:     { icono: '👑', numero: '09', titulo: 'Volver a los clásicos',     frase: 'Los que nunca pasan de moda' },
  escapar:     { icono: '🌌', numero: '10', titulo: 'Escapar de la realidad',    frase: 'Fantasía, ciencia ficción, otros mundos' }
};

// Un libro puede estar en varios moods a la vez: basta con que su columna "Mood"
// (separada por comas) contenga la clave del mood buscado.
function librosParaMood(mood) {
  return libros.filter(l => {
    const raw = getCampo(l, 'Mood', 'Moods', 'Estado de ánimo', 'Estados de ánimo');
    if (!raw) return false;
    return raw.split(',')
      .map(v => normalizar(v.trim()))
      .includes(mood);
  });
}

function mostrarTarjetasMood(data) {
  const cont = document.getElementById('sentimientoTarjetas');
  cont.innerHTML = '';
  data.forEach(libro => {
    const titulo  = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
    const autor   = libro['Autor'] || libro['Author'] || '';
    const genero  = libro['Género'] || libro['Genero'] || libro['Genre'] || '';
    const flags   = libro['Flags'] || '';
    const resena  = libro['Reseña'] || libro['Resena'] || libro['Review'] || '';
    const estrellasRaw = getCampo(libro, 'Calificación', 'Estrellas', 'Stars');
    const numEstrellas = parseInt(estrellasRaw, 10);
    const estrellasHtml = numEstrellas > 0 ? `<span class="card-stars">${'★'.repeat(numEstrellas)}</span>` : '';

    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="card-top">
        <strong>${escapeHtml(titulo)}</strong>
        ${estrellasHtml}
      </div>
      <small class="card-autor">${escapeHtml(autor)}</small>
      <em class="card-genero">${escapeHtml(genero)}</em>
      ${resena ? `<p class="card-resena">${escapeHtml(resena)}</p>` : ''}
      ${flags && flags.toLowerCase() !== 'ninguno' ? `<span class="flag-tag">${escapeHtml(flags)}</span>` : ''}
    `;
    const am = document.createElement('button');
    am.className = 'btn-antojo' + (antojosContiene(libro) ? ' guardado' : '');
    am.title = 'Guardar en antojos'; am.textContent = '✓';
    am.addEventListener('click', e => { e.stopPropagation(); toggleAntojos(libro); am.classList.toggle('guardado', antojosContiene(libro)); });
    div.appendChild(am);
    div.addEventListener('click', () => showDetalle(libro));
    cont.appendChild(div);
  });
  document.getElementById('sentimientoContador').textContent =
    `${data.length} libro${data.length !== 1 ? 's' : ''} para este momento`;
}

// Muestra los resultados de un mood. push=false se usa al restaurar desde el historial.
function mostrarResultadoMood(mood, push) {
  if (push === undefined) push = true;
  const regla = MOODS[mood];
  const resultado = librosParaMood(mood);
  if (resultado.length === 0) {
    if (push) alert('No encontré libros para ese estado de ánimo 😔');
    return false;
  }
  mostrarTarjetasLista(resultado, 'sentimientoTarjetas');
  document.getElementById('sentimientoTitulo').innerHTML =
    `<span class="sentimiento-titulo-icono">${regla.icono}</span> ${escapeHtml(regla.titulo)}`;
  document.getElementById('sentimientoContador').textContent =
    `${resultado.length} libro${resultado.length !== 1 ? 's' : ''} para este momento`;
  document.getElementById('sentimientoGrid').style.display = 'none';
  document.getElementById('sentimientoResultado').style.display = '';
  if (push) history.pushState({ tab: 'tabSentimiento', mood }, '', '#mood-' + mood);
  return true;
}

// Muestra la cuadrícula de moods. push=false se usa al restaurar desde el historial.
function mostrarGridMood(push) {
  if (push === undefined) push = true;
  document.getElementById('sentimientoResultado').style.display = 'none';
  document.getElementById('sentimientoGrid').style.display = '';
  if (push) history.pushState({ tab: 'tabSentimiento' }, '', '#tabSentimiento');
}

document.querySelectorAll('.mood-card').forEach(btn => {
  btn.addEventListener('click', () => mostrarResultadoMood(btn.dataset.mood));
});

document.getElementById('btnVolver').addEventListener('click', () => {
  // Si venimos de un estado con mood en el historial, usar Atrás mantiene todo sincronizado
  if (history.state && history.state.tab === 'tabSentimiento' && history.state.mood) {
    history.back();
  } else {
    mostrarGridMood(false);
  }
});

// =====================================================
// QUIZ: BRÚJULA LECTORA
// 12 preguntas rápidas (en orden aleatorio cada vez) → 8 arquetipos de
// lector → recomendaciones reales + desglose por porcentajes.
// Cada opción de cada pregunta suma 1 punto a UN solo arquetipo (nunca a dos
// combinados, para que la señal de cada respuesta sea limpia). Las 48
// opciones están repartidas EXACTO parejo: cada uno de los 8 arquetipos
// aparece 6 veces. Si al final hay empate en el primer lugar, lo resuelve
// _quizPesoDesempate — un marcador binario invisible (ver su comentario más
// abajo) que SIEMPRE tiene un valor distinto entre dos arquetipos, sin
// excepción. Nunca se le pregunta nada al visitante para desempatar: no
// tendría forma de conocer los intríngulis de cada arquetipo para decidir
// con criterio.
//
// Las recomendaciones NO son solo un filtro de Mood (para no repetir la
// pestaña Mood): cada arquetipo cruza Mood + (Género O Tono), reutilizando
// GRUPOS_GENERO/libroTieneGrupo (mismas reglas que la pestaña Géneros) y
// coincidencia por subcadena normalizada contra la columna Tono (mismo
// patrón que agruparGenero, tolerante a variaciones de redacción). Ej:
// Detective de Sofá = Mood "atrapar" Y (Género Misterio/Thriller O Tono
// intrigante/tenso). Si ese cruce da muy pocos libros, se afloja en 2
// niveles: primero solo Mood, y si aun así faltan, se suma el segundo
// arquetipo mejor puntuado — nunca se inventa nada.
// =====================================================

const QUIZ_ARQUETIPOS = {
  explorador: {
    emoji: '🌌',
    titulo: 'Explorador de Mundos',
    tagline: 'Buscas historias que te saquen de la realidad, pero necesitas personajes a los que valga la pena acompañar.',
    moods: ['escapar'],
    generos: ['Fantasía', 'Ciencia ficción'],
    tonos: ['imaginativ', 'epic', 'heroic', 'intrigant']
  },
  intrepido: {
    emoji: '🗺️',
    titulo: 'Corazón Aventurero',
    tagline: 'Necesitas una misión, un riesgo, un camino por recorrer — la aventura te llama.',
    moods: ['aventura'],
    generos: ['Aventura'],
    tonos: ['epic', 'heroic', 'audaz', 'intens']
  },
  detective: {
    emoji: '🕵️',
    titulo: 'Detective de Sofá',
    tagline: 'Te enganchan los misterios, los giros inesperados y esa sensación de no poder soltar el libro hasta descubrir la verdad.',
    moods: ['atrapar'],
    generos: ['Misterio', 'Thriller'],
    tonos: ['intrigant', 'tens', 'ironic']
  },
  alma: {
    emoji: '❤️',
    titulo: 'Alma Sensible',
    tagline: 'Lees para sentir. Te importan más las personas y sus emociones que cualquier trama grandiosa.',
    moods: ['drama'],
    generos: ['Drama'],
    tonos: ['emotiv', 'conmov', 'desgarr', 'melancol', 'tiern', 'dramatic', 'sensible', 'tragic']
  },
  raices: {
    emoji: '🏛️',
    titulo: 'Viajero en el Tiempo',
    tagline: 'Te atrae lo que ya pasó: otras épocas, otras vidas, historias que resistieron el paso del tiempo.',
    moods: ['pasado'],
    generos: ['Histórico'],
    tonos: ['nostalg', 'solemn', 'epic', 'dramatic', 'melancol', 'tragic']
  },
  clasicos: {
    emoji: '👑',
    titulo: 'Guardián de los Clásicos',
    tagline: 'Confías en lo que ya resistió el tiempo — los que nunca pasan de moda.',
    moods: ['clasico'],
    generos: ['Clásicos'],
    tonos: ['poetic', 'sobri', 'epic', 'dramatic', 'profund', 'solemn']
  },
  ligero: {
    emoji: '🎈',
    titulo: 'Espíritu Ligero',
    tagline: 'Lees para disfrutar, reír y pasar un buen rato. La vida ya es bastante intensa como para que tus libros también lo sean.',
    moods: ['feliz', 'buenrato'],
    generos: ['Comedia'],
    tonos: ['humor', 'ligero', 'disparat', 'amen', 'absurd', 'ingenios', 'ironic']
  },
  sentido: {
    emoji: '🕯️',
    titulo: 'Buscador de Sentido',
    tagline: 'No solo quieres una historia: quieres que te deje pensando, que te acompañe incluso después de cerrar el libro.',
    moods: ['inspiracion', 'reflexion'],
    generos: ['No ficción'],
    tonos: ['reflexiv', 'profund', 'esperanzador', 'introspectiv', 'contemplativ', 'inspirador', 'optimist', 'critic', 'human']
  }
};

// Cada opción apunta a UN solo arquetipo. Distribución perfectamente pareja
// sobre 48 opciones (12 preguntas x 4): los 8 arquetipos aparecen exactamente
// 6 veces cada uno. El orden de las preguntas se mezcla al azar en cada
// partida (ver iniciarQuiz), así que esta lista es solo el banco de preguntas.
const QUIZ_PREGUNTAS = [
  {
    texto: 'Entras a una librería. ¿Qué te atrae primero?',
    opciones: [
      { emoji: '🌌', texto: 'Algo raro, original, fuera de lo conocido', arquetipo: 'explorador' },
      { emoji: '🗺️', texto: 'Una historia llena de emociones y aventuras', arquetipo: 'intrepido' },
      { emoji: '🕵️', texto: 'Un enigma o misterio por resolver', arquetipo: 'detective' },
      { emoji: '🪞', texto: 'Algo que se sienta muy real y te haga pensar', arquetipo: 'sentido' }
    ]
  },
  {
    texto: 'Tienes una tarde entera para leer. ¿Qué te apetece?',
    opciones: [
      { emoji: '☕', texto: 'Algo rápido y fácil de leer', arquetipo: 'ligero' },
      { emoji: '🏰', texto: 'Viajar a otra época y sentir que estás ahí', arquetipo: 'raices' },
      { emoji: '❤️', texto: 'Encariñarme de verdad con los personajes', arquetipo: 'alma' },
      { emoji: '👑', texto: 'Uno de esos libros que todo mundo debería leer', arquetipo: 'clasicos' }
    ]
  },
  {
    texto: '¿Qué tipo de final te gusta más?',
    opciones: [
      { emoji: '😢', texto: 'Uno agridulce, pero que se sienta verdadero', arquetipo: 'alma' },
      { emoji: '🤯', texto: 'Uno que te sorprenda', arquetipo: 'detective' },
      { emoji: '😊', texto: 'Uno que te deje con una sonrisa', arquetipo: 'ligero' },
      { emoji: '🏆', texto: 'Uno que te deje con ganas de más aventura', arquetipo: 'intrepido' }
    ]
  },
  {
    texto: '¿Qué tipo de personaje suele conquistarte?',
    opciones: [
      { emoji: '💭', texto: 'Alguien que te cambia la forma de ver el mundo', arquetipo: 'sentido' },
      { emoji: '⚔️', texto: 'Alguien que tenga que demostrar de qué está hecho', arquetipo: 'intrepido' },
      { emoji: '🧝', texto: 'Alguien imposible de encontrar en nuestra realidad', arquetipo: 'explorador' },
      { emoji: '📜', texto: 'Alguien marcado por la época que le tocó vivir', arquetipo: 'raices' }
    ]
  },
  {
    texto: 'En el fondo, ¿qué buscas cuando abres un libro?',
    opciones: [
      { emoji: '🚪', texto: 'Desaparecer un rato de este mundo', arquetipo: 'explorador' },
      { emoji: '💔', texto: 'Sentir algo de verdad', arquetipo: 'alma' },
      { emoji: '🌱', texto: 'Descubrir una idea que se quede conmigo', arquetipo: 'sentido' },
      { emoji: '📚', texto: 'Conocer las grandes historias de siempre', arquetipo: 'clasicos' }
    ]
  },
  {
    texto: '¿En qué escenario pasarías 300 páginas a gusto?',
    opciones: [
      { emoji: '🏘️', texto: 'Un lugar donde se sienta el paso del tiempo', arquetipo: 'raices' },
      { emoji: '🏛️', texto: 'Un escenario que podría seguir funcionando dentro de cien años', arquetipo: 'clasicos' },
      { emoji: '🏠', texto: 'Cualquiera, mientras sea agradable pasar tiempo ahí', arquetipo: 'ligero' },
      { emoji: '🌆', texto: 'Un lugar cotidiano en el que algo no termina de cuadrar', arquetipo: 'detective' }
    ]
  },
  {
    texto: 'Cierras el libro. ¿Cuál de estas sensaciones te parece la mejor señal?',
    opciones: [
      { emoji: '❤️', texto: '"Voy a extrañar a esta gente"', arquetipo: 'alma' },
      { emoji: '💡', texto: '"Nunca lo había pensado así"', arquetipo: 'sentido' },
      { emoji: '☁️', texto: '"Quiero volver a perderme en un mundo así"', arquetipo: 'explorador' },
      { emoji: '👑', texto: '"Entiendo por qué este libro ha durado tanto"', arquetipo: 'clasicos' }
    ]
  },
  {
    texto: '¿Qué podría hacerte releer un libro años después?',
    opciones: [
      { emoji: '🗺️', texto: 'Volver a vivir aquella aventura', arquetipo: 'intrepido' },
      { emoji: '🕰️', texto: 'Regresar a esa época y forma de vivir', arquetipo: 'raices' },
      { emoji: '🔍', texto: 'Descubrir detalles que seguramente se me escaparon', arquetipo: 'detective' },
      { emoji: '😌', texto: 'Saber que lo voy a disfrutar sin pensarlo tanto', arquetipo: 'ligero' }
    ]
  },
  {
    texto: 'Vas por la mitad del libro. ¿Qué te mantiene leyendo hasta tarde?',
    opciones: [
      { emoji: '⚔️', texto: 'Los protagonistas están en peligro y necesitas saber cómo salen', arquetipo: 'intrepido' },
      { emoji: '🧩', texto: 'Aparece una pieza que no encaja con nada de lo anterior', arquetipo: 'detective' },
      { emoji: '🏺', texto: 'Descubres algo fascinante sobre la época o el lugar', arquetipo: 'raices' },
      { emoji: '✍️', texto: 'Está tan bien escrito que disfrutas hasta cómo se cuenta', arquetipo: 'clasicos' }
    ]
  },
  {
    texto: '¿Cuál de estos pequeños placeres lectores disfrutas más?',
    opciones: [
      { emoji: '😂', texto: 'Encontrar personajes y diálogos que te hagan reír', arquetipo: 'ligero' },
      { emoji: '🌍', texto: 'Descubrir poco a poco las reglas y secretos de un mundo', arquetipo: 'explorador' },
      { emoji: '❤️', texto: 'Admirar cómo un personaje cambia casi sin darte cuenta', arquetipo: 'alma' },
      { emoji: '💭', texto: 'Encontrarte una idea que quieras subrayar', arquetipo: 'sentido' }
    ]
  },
  {
    texto: 'Si pudieras entrar durante un día en una historia, ¿qué harías?',
    opciones: [
      { emoji: '🗡️', texto: 'Me uniría a la misión sin pensarlo dos veces', arquetipo: 'intrepido' },
      { emoji: '🔎', texto: 'Investigaría eso que nadie parece capaz de explicar', arquetipo: 'detective' },
      { emoji: '🕯️', texto: 'Recorrería el lugar observando cómo vivía realmente la gente', arquetipo: 'raices' },
      { emoji: '🎭', texto: 'Conocería a un personaje que todos reconocen, aunque hayan pasado siglos', arquetipo: 'clasicos' }
    ]
  },
  {
    texto: 'Un amigo quiere convencerte de leer un libro. ¿Qué frase te convencería más?',
    opciones: [
      { emoji: '😄', texto: '"Empiezas y, sin darte cuenta, la estás pasando increíble"', arquetipo: 'ligero' },
      { emoji: '✨', texto: '"No se parece a ningún mundo en el que hayas estado antes"', arquetipo: 'explorador' },
      { emoji: '🫶', texto: '"Los personajes se sienten tan reales que terminas queriéndolos"', arquetipo: 'alma' },
      { emoji: '🌱', texto: '"Te deja pensando en algo que nunca te habías planteado"', arquetipo: 'sentido' }
    ]
  }
];

let _quizOrdenPreguntas = [];
let _quizIndice = 0;
let _quizPuntajes = {};
// Marcador de desempate (invisible, no se muestra en pantalla): cada
// pregunta suma una potencia de 2 distinta (2^0, 2^1, 2^2...) al arquetipo
// elegido. Como cada pregunta solo puede darle su punto a UN arquetipo, dos
// arquetipos distintos siempre terminan con conjuntos de preguntas
// disjuntos — y la suma de dos subconjuntos disjuntos de potencias de 2
// nunca puede coincidir (es la lógica del sistema binario: cada suma
// identifica un único subconjunto). Esto garantiza que _quizPesoDesempate
// SIEMPRE tiene un valor distinto entre dos arquetipos con puntaje real
// empatado, así que el empate se resuelve solo, sin preguntarle nada al
// visitante ni tocar el conteo real que alimenta "Tu mezcla lectora".
let _quizPesoDesempate = {};
// Respuesta elegida en cada pregunta (arquetipo o null si no se ha
// respondido). Guardarlas por índice permite el botón "Atrás": al volver y
// cambiar una respuesta, los puntajes se recalculan desde cero a partir de
// este arreglo en vez de sumar/restar a mano (mucho menos propenso a bugs).
let _quizRespuestas = [];

// Baraja un arreglo sin mutar el original (Fisher-Yates)
function _quizMezclar(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function iniciarQuiz() {
  _quizIndice = 0;
  _quizOrdenPreguntas = _quizMezclar(QUIZ_PREGUNTAS);
  _quizRespuestas = new Array(_quizOrdenPreguntas.length).fill(null);
  _quizRecalcularPuntajes();
  _renderQuizPregunta();
}

// Reconstruye _quizPuntajes y _quizPesoDesempate desde cero a partir de
// _quizRespuestas. Se llama cada vez que se responde o se cambia una
// respuesta anterior.
function _quizRecalcularPuntajes() {
  _quizPuntajes = {};
  _quizPesoDesempate = {};
  Object.keys(QUIZ_ARQUETIPOS).forEach(k => { _quizPuntajes[k] = 0; _quizPesoDesempate[k] = 0; });
  _quizRespuestas.forEach((arquetipo, idx) => {
    if (!arquetipo) return;
    _quizPuntajes[arquetipo] += 1;
    _quizPesoDesempate[arquetipo] += Math.pow(2, idx);
  });
}

function _renderQuizPregunta() {
  const cont = document.getElementById('quizContainer');
  if (!cont) return;

  const pregunta = _quizOrdenPreguntas[_quizIndice];
  const total = _quizOrdenPreguntas.length;
  const pct = Math.round((_quizIndice / total) * 100);
  const respuestaActual = _quizRespuestas[_quizIndice];

  cont.innerHTML = `
    <div class="quiz-progreso">
      ${_quizIndice > 0 ? '<button id="btnQuizAtras" class="btn-volver quiz-btn-atras">← Atrás</button>' : ''}
      <div class="quiz-progreso-track"><div class="quiz-progreso-fill" style="width:${pct}%"></div></div>
      <span class="quiz-progreso-label">${_quizIndice + 1} / ${total}</span>
    </div>
    <div class="quiz-card">
      <p class="quiz-pregunta">${escapeHtml(pregunta.texto)}</p>
      <div class="quiz-opciones"></div>
    </div>
  `;

  const wrap = cont.querySelector('.quiz-opciones');
  pregunta.opciones.forEach(op => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opcion' + (op.arquetipo === respuestaActual ? ' quiz-opcion-activa' : '');
    btn.innerHTML = `<span class="quiz-opcion-emoji">${op.emoji}</span><span>${escapeHtml(op.texto)}</span>`;
    btn.addEventListener('click', () => _responderQuiz(op.arquetipo));
    wrap.appendChild(btn);
  });

  const btnAtras = document.getElementById('btnQuizAtras');
  if (btnAtras) btnAtras.addEventListener('click', _quizRetroceder);
}

function _responderQuiz(arquetipo) {
  _quizRespuestas[_quizIndice] = arquetipo;
  _quizRecalcularPuntajes();
  _quizIndice++;
  if (_quizIndice < _quizOrdenPreguntas.length) _renderQuizPregunta();
  else _mostrarResultadoQuiz();
}

function _quizRetroceder() {
  if (_quizIndice > 0) {
    _quizIndice--;
    _renderQuizPregunta();
  }
}

// Ranking de arquetipos: primero por puntaje real (el que se ve en "Tu
// mezcla lectora"); si hay empate, decide _quizPesoDesempate, que nunca
// puede empatar entre dos arquetipos distintos (ver comentario arriba).
function _quizRankingArquetipos() {
  return Object.keys(_quizPuntajes).sort((a, b) => {
    if (_quizPuntajes[b] !== _quizPuntajes[a]) return _quizPuntajes[b] - _quizPuntajes[a];
    return _quizPesoDesempate[b] - _quizPesoDesempate[a];
  });
}


// ¿El libro tiene alguno de estos moods? (mismo campo que usa librosParaMood)
function _quizLibroTieneMood(libro, moods) {
  const raw = getCampo(libro, 'Mood', 'Moods', 'Estado de ánimo', 'Estados de ánimo');
  if (!raw) return false;
  const moodsLibro = raw.split(',').map(v => normalizar(v.trim()));
  return moods.some(m => moodsLibro.includes(m));
}

// ¿El libro cae en alguno de estos grupos de género? Reutiliza
// libroTieneGrupo()/GRUPOS_GENERO, las mismas reglas de la pestaña Géneros.
function _quizLibroTieneGenero(libro, grupos) {
  return grupos.some(g => libroTieneGrupo(libro, g));
}

// ¿El Tono del libro contiene alguna de estas raíces de palabra? Coincidencia
// por subcadena normalizada (sin acentos), igual que agruparGenero() — así no
// depende de que el valor exacto en la hoja coincida palabra por palabra.
function _quizLibroTieneTono(libro, raices) {
  const tono = normalizar(getCampo(libro, 'Tono', 'Tone') || '');
  if (!tono) return false;
  return raices.some(r => tono.includes(r));
}

function _quizElegirRecomendaciones(arquetipoId) {
  const arq = QUIZ_ARQUETIPOS[arquetipoId];

  // Nivel 1 (el más específico): Mood Y (Género O Tono)
  let candidatos = libros.filter(l =>
    _quizLibroTieneMood(l, arq.moods) &&
    (_quizLibroTieneGenero(l, arq.generos) || _quizLibroTieneTono(l, arq.tonos))
  );

  // Nivel 2: si el cruce fue muy angosto, se afloja a solo Mood
  if (candidatos.length < 4) {
    candidatos = libros.filter(l => _quizLibroTieneMood(l, arq.moods));
  }

  // Nivel 3: si aún faltan, se suma (solo Mood) el segundo arquetipo mejor puntuado
  if (candidatos.length < 4) {
    const segundo = _quizRankingArquetipos().find(id => id !== arquetipoId);
    if (segundo) {
      const arq2 = QUIZ_ARQUETIPOS[segundo];
      const idsExistentes = new Set(candidatos.map(l => l['No.'] || l['No']));
      libros.filter(l => _quizLibroTieneMood(l, arq2.moods)).forEach(l => {
        if (!idsExistentes.has(l['No.'] || l['No'])) candidatos.push(l);
      });
    }
  }

  // Mejor calificados primero, con un poco de mezcla para variar entre partidas
  candidatos.sort((a, b) => {
    const califA = parseFloat(getCampo(a, 'Calificación', 'Estrellas', 'Stars')) || 0;
    const califB = parseFloat(getCampo(b, 'Calificación', 'Estrellas', 'Stars')) || 0;
    return califB - califA;
  });
  const top = candidatos.slice(0, 12);
  for (let i = top.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [top[i], top[j]] = [top[j], top[i]];
  }
  return top.slice(0, 6);
}

// Desglose por porcentajes: todos los arquetipos con puntaje > 0, ordenados
// de mayor a menor, mostrando como máximo los 6 más altos (de los 8
// posibles) para no saturar la tarjeta con porcentajes casi en cero.
function _quizDesglosePorcentajes() {
  const totalPuntos = Object.values(_quizPuntajes).reduce((a, b) => a + b, 0) || 1;
  return _quizRankingArquetipos()
    .filter(id => _quizPuntajes[id] > 0)
    .slice(0, 6)
    .map(id => ({
      id,
      arq: QUIZ_ARQUETIPOS[id],
      puntos: _quizPuntajes[id],
      pct: Math.round((_quizPuntajes[id] / totalPuntos) * 100)
    }));
}

// Arquetipo cuyas recomendaciones se están mostrando actualmente en el
// resultado (arranca en el ganador, pero cambia si el visitante hace clic
// en otra fila de "Tu mezcla lectora de hoy" — ver _quizSeleccionarFilaMezcla)
let _quizArquetipoGanador = null;

function _mostrarResultadoQuiz() {
  const cont = document.getElementById('quizContainer');
  if (!cont) return;

  _quizArquetipoGanador = _quizRankingArquetipos()[0];
  const desglose = _quizDesglosePorcentajes();

  // Chips horizontales en vez de una lista vertical: la tarjeta se queda
  // compacta (una sola fila que se desliza) para que "De mi biblioteca te
  // recomendaría" aparezca justo debajo, sin tener que bajar tanto. La frase
  // de cada arquetipo se muestra aparte, debajo del carrusel, y cambia según
  // cuál chip esté activo.
  const chipsHtml = desglose.map(d => `
    <button type="button" class="quiz-chip${d.id === _quizArquetipoGanador ? ' quiz-chip-activo' : ''}" data-arquetipo="${d.id}">
      <span class="quiz-chip-emoji">${d.arq.emoji}</span>
      <span class="quiz-chip-titulo">${escapeHtml(d.arq.titulo)}</span>
      <span class="quiz-chip-pct">${d.pct}%</span>
    </button>
  `).join('');

  cont.innerHTML = `
    <div class="quiz-pct-card quiz-pct-card-solo">
      <p class="quiz-pct-titulo-card">Tu mezcla lectora de hoy</p>
      <div class="quiz-chips-scroll">${chipsHtml}</div>
      <p class="quiz-chip-tagline" id="quizChipTagline">${escapeHtml(QUIZ_ARQUETIPOS[_quizArquetipoGanador].tagline)}</p>
      <p class="quiz-pct-hint">Desliza y toca otro perfil para ver sus recomendaciones</p>
    </div>
    <p class="quiz-resultado-libros-titulo" id="quizLibrosTitulo">De mi biblioteca te recomendaría</p>
    <div id="quizResultCards" class="lista-cards"></div>
    <button id="btnQuizReiniciar" class="quiz-btn-reiniciar">🔄 Volver a hacer el quiz</button>
  `;

  cont.querySelectorAll('.quiz-chip').forEach(chip => {
    chip.addEventListener('click', () => _quizSeleccionarFilaMezcla(chip.dataset.arquetipo));
  });

  _quizMostrarRecomendacionesDe(_quizArquetipoGanador);

  document.getElementById('btnQuizReiniciar').addEventListener('click', iniciarQuiz);
}

// Cambia qué recomendaciones se muestran cuando el visitante toca otro chip
// en "Tu mezcla lectora de hoy". El chip activo y la frase debajo del
// carrusel cambian, pero _quizArquetipoGanador (el resultado real del quiz)
// no se toca — solo cambian los libros y el título de esa sección.
function _quizSeleccionarFilaMezcla(arquetipoId) {
  document.querySelectorAll('.quiz-chip').forEach(chip => {
    const activo = chip.dataset.arquetipo === arquetipoId;
    chip.classList.toggle('quiz-chip-activo', activo);
    if (activo) chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });
  const tagline = document.getElementById('quizChipTagline');
  if (tagline) tagline.textContent = QUIZ_ARQUETIPOS[arquetipoId].tagline;
  _quizMostrarRecomendacionesDe(arquetipoId);
}

function _quizMostrarRecomendacionesDe(arquetipoId) {
  const arq = QUIZ_ARQUETIPOS[arquetipoId];
  const recomendados = _quizElegirRecomendaciones(arquetipoId);

  const titulo = document.getElementById('quizLibrosTitulo');
  titulo.textContent = arquetipoId === _quizArquetipoGanador
    ? 'De mi biblioteca te recomendaría'
    : `Libros para tu lado ${arq.emoji} ${arq.titulo}`;

  if (recomendados.length === 0) {
    document.getElementById('quizResultCards').innerHTML =
      '<p style="color:var(--muted)">Todavía no tengo suficientes libros clasificados para este perfil, ¡pero pronto los tendré!</p>';
  } else {
    mostrarTarjetasLista(recomendados, 'quizResultCards');
  }
}

// =====================================================
// ANTOJOS
// =====================================================
const ANTOJOS_KEY = 'bibliof_antojos';

function antojosCargar() {
  try { return JSON.parse(localStorage.getItem(ANTOJOS_KEY) || '[]'); }
  catch { return []; }
}
function antojosGuardar(items) {
  localStorage.setItem(ANTOJOS_KEY, JSON.stringify(items));
}
function antojosContiene(libro) {
  const t = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
  return antojosCargar().some(l => (l['Título'] || l['Titulo'] || l['Title'] || '') === t);
}
function toggleAntojos(libro) {
  let items = antojosCargar();
  const t = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
  const idx = items.findIndex(l => (l['Título'] || l['Titulo'] || l['Title'] || '') === t);
  if (idx >= 0) items.splice(idx, 1); else items.push(libro);
  antojosGuardar(items);
  actualizarAntojosUI();
}

// =====================================================
// LIKES — control local de "qué likes diste, y con qué id"
// (el conteo real vive en Supabase; localStorage guarda el id de cada
// like que diste desde este navegador, para poder quitarlo si te equivocas)
// =====================================================
const LIKES_KEY = 'bibliof_likes_dados';

function likesDadosCargar() {
  try {
    const raw = JSON.parse(localStorage.getItem(LIKES_KEY) || '{}');
    return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
  } catch { return {}; }
}
function likesDadosGuardar(mapa) {
  localStorage.setItem(LIKES_KEY, JSON.stringify(mapa));
}
function idLikeLocal(tituloLibro) {
  return likesDadosCargar()[tituloLibro] || null;
}
function guardarLikeLocal(tituloLibro, id) {
  const mapa = likesDadosCargar();
  mapa[tituloLibro] = id;
  likesDadosGuardar(mapa);
}
function borrarLikeLocal(tituloLibro) {
  const mapa = likesDadosCargar();
  delete mapa[tituloLibro];
  likesDadosGuardar(mapa);
}

// Pinta el estado visual (dado/no dado + conteo) de un botón de like.
function _pintarBotonLike(btn, tituloLibro) {
  const dado = !!idLikeLocal(tituloLibro);
  btn.classList.toggle('dado', dado);
  btn.title = dado ? 'Quitar like' : 'Dar like';
  const n = likesCache[tituloLibro];
  btn.innerHTML = `👍 <span class="like-count">${n == null ? '…' : n}</span>`;
}

// Registro de qué botones de like están montados en el DOM para cada título
// (puede haber varios a la vez: la tarjeta en Lista, en Géneros, en Populares,
// y/o la ficha abierta). Así, cuando cambia el like de UNO, se refrescan TODOS
// sin necesidad de recargar la página.
const _likeBotones = {}; // título -> Set<HTMLElement>

function _registrarBotonLike(btn, tituloLibro) {
  if (!_likeBotones[tituloLibro]) _likeBotones[tituloLibro] = new Set();
  _likeBotones[tituloLibro].add(btn);
}

function _actualizarTodosLosBotonesLike(tituloLibro) {
  const set = _likeBotones[tituloLibro];
  if (!set) return;
  set.forEach(btn => {
    if (!btn.isConnected) { set.delete(btn); return; } // ya no existe en el DOM, se limpia
    _pintarBotonLike(btn, tituloLibro);
  });
}

// Prepara un botón de like (ficha, modal random, o tarjeta de lista): pinta
// el estado inicial, refresca el conteo real de Supabase, y engancha el
// click para dar/quitar el like (toggle). Se registra para poder actualizarse
// en conjunto con cualquier otro botón del mismo libro montado en la página.
function inicializarBotonLike(btn, tituloLibro) {
  _registrarBotonLike(btn, tituloLibro);
  _pintarBotonLike(btn, tituloLibro);

  if (likesCache[tituloLibro] == null) {
    obtenerLikes(tituloLibro).then(n => {
      likesCache[tituloLibro] = n;
      _actualizarTodosLosBotonesLike(tituloLibro);
    });
  }

  btn.onclick = async (e) => {
    if (e) e.stopPropagation();
    if (btn.disabled) return;
    btn.disabled = true;

    const idActual = idLikeLocal(tituloLibro);
    if (idActual) {
      const ok = await quitarLike(idActual);
      if (ok) {
        borrarLikeLocal(tituloLibro);
        likesCache[tituloLibro] = Math.max(0, (likesCache[tituloLibro] || 1) - 1);
      }
    } else {
      const nuevoId = await darLike(tituloLibro);
      if (nuevoId) {
        guardarLikeLocal(tituloLibro, nuevoId);
        likesCache[tituloLibro] = (likesCache[tituloLibro] || 0) + 1;
      }
    }
    _actualizarTodosLosBotonesLike(tituloLibro);
    btn.disabled = false;
  };
}

function actualizarAntojosUI() {
  const items = antojosCargar();
  const fab = document.getElementById('antojosBtn');
  fab.style.display = items.length > 0 ? 'flex' : 'none';
  document.getElementById('antojosCount').textContent = items.length;

  const lista = document.getElementById('antojosLista');
  lista.innerHTML = '';
  items.forEach(libro => {
    const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
    const autor  = libro['Autor'] || libro['Author'] || '';
    const estrellasRaw = getCampo(libro, 'Calificación', 'Estrellas', 'Stars');
    const { texto: textoEstrellas } = desglosarEstrellas(estrellasRaw);

    const li = document.createElement('li');
    li.className = 'antojos-item';
    li.innerHTML = `
      <div class="antojos-item-info">
        <span class="antojos-item-titulo">${escapeHtml(titulo)}</span>
        <span class="antojos-item-autor">${escapeHtml(autor)}</span>
        ${textoEstrellas ? `<span class="antojos-item-stars">${textoEstrellas}</span>` : ''}
      </div>
      <div class="antojos-item-actions">
        <button class="antojos-item-share" title="Compartir">↗</button>
        <button class="antojos-item-remove" title="Quitar">✕</button>
      </div>
    `;
    li.querySelector('.antojos-item-share').addEventListener('click', () => compartirLibro(libro));
    li.querySelector('.antojos-item-remove').addEventListener('click', () => {
      toggleAntojos(libro);
      document.querySelectorAll('.btn-antojo').forEach(btn => {
        const c = btn.closest('tr, .card, .lista-card');
        if (c && c.textContent.includes(titulo)) btn.classList.remove('guardado');
      });
    });
    lista.appendChild(li);
  });
}

function abrirAntojosPanel() {
  document.getElementById('randomModal').classList.add('hidden');
  document.getElementById('antojosPanel').classList.remove('hidden');
  history.pushState({ tab: _tabActual, overlay: 'antojos' }, '', '#antojos');
}
function cerrarAntojosPanel() {
  document.getElementById('antojosPanel').classList.add('hidden');
  if (history.state && history.state.overlay === 'antojos') history.back();
}
function toggleAntojosPanel() {
  const panel = document.getElementById('antojosPanel');
  if (panel.classList.contains('hidden')) abrirAntojosPanel();
  else cerrarAntojosPanel();
}

document.getElementById('antojosBtn').addEventListener('click', toggleAntojosPanel);
document.getElementById('antojosPanel').addEventListener('click', e => {
  if (e.target === document.getElementById('antojosPanel')) cerrarAntojosPanel();
});
document.getElementById('antojosCerrar').addEventListener('click', cerrarAntojosPanel);
document.getElementById('btnVaciarAntojos').addEventListener('click', () => {
  if (!confirm('¿Vaciar los antojos?')) return;
  localStorage.removeItem(ANTOJOS_KEY);
  actualizarAntojosUI();
  document.querySelectorAll('.btn-antojo.guardado').forEach(b => b.classList.remove('guardado'));
});

// =====================================================
// COMPARTIR
// =====================================================
const PAGINA_URL = 'https://fatimallovet.github.io/bibliotecafa2/';

function textoLibro(libro) {
  const titulo    = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
  const autor     = libro['Autor'] || libro['Author'] || '';
  const genero    = libro['Género'] || libro['Genero'] || libro['Genre'] || '';
  const tono      = libro['Tono'] || '';
  const ritmo     = libro['Ritmo'] || '';
  const publico   = libro['Público'] || libro['Publico'] || '';
  const publicado = getCampo(libro, 'Publicado', 'Publicación', 'Publicacion', 'Año', 'Ano', 'Year');
  const resena    = libro['Reseña'] || libro['Resena'] || libro['Review'] || '';
  const loMejor   = getCampo(libro, 'Lo mejor', 'Lo Mejor', 'LoMejor', 'Best');
  const flags     = libro['Flags'] || '';
  const estrellasRaw = getCampo(libro, 'Calificación', 'Estrellas', 'Stars');
  const { texto: textoEstrellas } = desglosarEstrellas(estrellasRaw);

  let t = `📚 *${titulo}*\n✍️ ${autor}\n`;
  if (textoEstrellas) t += `${textoEstrellas}\n`;
  t += `\n`;
  if (genero)    t += `🎭 ${genero}\n`;
  if (publicado) t += `📅 Publicado: ${publicado}\n`;
  if (tono)    t += `🎨 Tono: ${tono}\n`;
  if (ritmo)   t += `⏱ Ritmo: ${ritmo}\n`;
  if (publico) t += `👤 Público: ${publico}\n`;
  if (flags && flags.toLowerCase() !== 'ninguno') t += `⚠️ ${flags}\n`;
  if (resena)  t += `\n${resena}\n`;
  if (loMejor) t += `\n✨ Lo mejor: ${loMejor}\n`;
  t += `\n— Recomendado por Fátima Ll\n🔗 ${PAGINA_URL}`;
  return t;
}

function textoLista(items) {
  let t = `📚 *Mi lista de lectura*\n${items.length} libro${items.length !== 1 ? 's' : ''}\n\n`;
  items.forEach((libro, i) => {
    const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
    const autor  = libro['Autor'] || libro['Author'] || '';
    const genero = libro['Género'] || libro['Genero'] || libro['Genre'] || '';
    t += `${i + 1}. *${titulo}*\n   ${autor}`;
    if (genero) t += ` · ${genero}`;
    t += '\n';
  });
  t += `\n— Recomendado por Fátima Ll\n🔗 ${PAGINA_URL}`;
  return t;
}

function esMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

let _textoCompartir = '';

function compartirTexto(titulo, texto) {
  _textoCompartir = texto;
  if (esMobile() && navigator.share) {
    navigator.share({ title: titulo, text: texto }).catch(e => {
      if (e.name !== 'AbortError') mostrarShareModal();
    });
  } else {
    mostrarShareModal();
  }
}

function compartirLibro(libro) {
  const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
  compartirTexto(titulo, textoLibro(libro));
}

function mostrarShareModal() {
  document.getElementById('shareModal').classList.remove('hidden');
  history.pushState({ tab: _tabActual, overlay: 'share' }, '', '#share');
}
function cerrarShareModal() {
  document.getElementById('shareModal').classList.add('hidden');
  if (history.state && history.state.overlay === 'share') history.back();
}

document.getElementById('shareModalCerrar').addEventListener('click', cerrarShareModal);
document.getElementById('shareModal').addEventListener('click', e => {
  if (e.target === document.getElementById('shareModal')) cerrarShareModal();
});
document.getElementById('shareWhatsapp').addEventListener('click', () => {
  window.open('https://wa.me/?text=' + encodeURIComponent(_textoCompartir), '_blank');
  cerrarShareModal();
});
document.getElementById('shareCopiar').addEventListener('click', () => {
  navigator.clipboard.writeText(_textoCompartir).then(() => {
    mostrarToast('📋 Copiado al portapapeles');
    cerrarShareModal();
  }).catch(() => mostrarToast('No se pudo copiar'));
});

// Compartir todos los antojos
document.getElementById('btnCompartirTodos').addEventListener('click', () => {
  const items = antojosCargar();
  if (items.length === 0) return;
  compartirTexto('Mi lista de lectura', textoLista(items));
});

function mostrarToast(msg) {
  let t = document.getElementById('shareToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'shareToast';
    t.className = 'share-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('visible');
  setTimeout(() => t.classList.remove('visible'), 2800);
}

// Inicializar
actualizarAntojosUI();


// =====================================================
// NAVEGACIÓN CON EL BOTÓN ATRÁS / ADELANTE DEL NAVEGADOR
// =====================================================
window.addEventListener('popstate', (e) => {
  const state = e.state || { tab: 'tabLibros' };

  // Siempre partimos de "todo cerrado" y reconstruimos según el estado
  cerrarFlotantesUI();
  _aplicarTabDOM(state.tab || 'tabLibros');

  if (state.tab === 'tabSentimiento') {
    if (state.mood) mostrarResultadoMood(state.mood, false);
    else mostrarGridMood(false);
  }

  if (state.overlay === 'detalle') reabrirDetalleModal();
  else if (state.overlay === 'random') reabrirRandomModal();
  else if (state.overlay === 'antojos') document.getElementById('antojosPanel').classList.remove('hidden');
  else if (state.overlay === 'share') document.getElementById('shareModal').classList.remove('hidden');
});
