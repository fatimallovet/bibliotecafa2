// BiblioFa script.js · Actualizado: 2026-08-03
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
async function guardarPuntaje(apodo, puntaje, totalPreguntas) {
  if (!supabaseClient) return false;
  const { error } = await supabaseClient.from('puntajes').insert({
    apodo: (apodo || 'Anónimo').slice(0, 30),
    puntaje,
    total_preguntas: totalPreguntas
  });
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
  { grupo: 'No ficción',      palabras: ['no ficción', 'no ficcion', 'ensayo', 'divulgación', 'divulgacion', 'autobiografía', 'autobiografia', 'memorias', 'crónica', 'cronica'] },
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
  const aniosOtros = [...new Set(candidatos.filter(l => l !== libro).map(_rlValorAnio))].filter(a => a !== correctaNum);
  let distractores = _rlMuestra(aniosOtros, 3);
  while (distractores.length < 3) {
    const offset = (Math.floor(Math.random() * 15) + 3) * (Math.random() < 0.5 ? -1 : 1);
    const candidato = correctaNum + offset;
    if (candidato > 0 && candidato !== correctaNum && !distractores.includes(candidato)) distractores.push(candidato);
  }
  const correcta = String(correctaNum);
  return {
    id: `anio:${_rlValorTitulo(libro)}`,
    pregunta: `¿En qué año se publicó «${_rlValorTitulo(libro)}»?`,
    opciones: _rlMezclar([correcta, ...distractores.map(String)]),
    correcta
  };
}

function _rlPreguntaGenero() {
  const candidatos = libros.filter(l => _rlValorGenero(l) && _rlValorTitulo(l));
  const generosUnicos = [...new Set(candidatos.map(_rlValorGenero))];
  if (candidatos.length < 4 || generosUnicos.length < 4) return null;
  const libro = candidatos[Math.floor(Math.random() * candidatos.length)];
  const correcta = _rlValorGenero(libro);
  const distractores = _rlMuestra(generosUnicos.filter(g => g !== correcta), 3);
  if (distractores.length < 3) return null;
  return {
    id: `genero:${_rlValorTitulo(libro)}`,
    pregunta: `¿De qué género es «${_rlValorTitulo(libro)}»?`,
    opciones: _rlMezclar([correcta, ...distractores]),
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
  const correcta = _rlValorTitulo(elegidos[idxMin]);
  const titulos = elegidos.map(_rlValorTitulo);
  return {
    id: `orden:${titulos.slice().sort().join('|')}`,
    pregunta: '¿Cuál de estos libros se publicó primero?',
    opciones: _rlMezclar(titulos),
    correcta
  };
}

const _RL_GENERADORES = [_rlPreguntaAutor, _rlPreguntaAnio, _rlPreguntaGenero, _rlPreguntaOrden, _rlPreguntaDelBanco];

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
const RETO_NOMBRES_SUGERIDOS = [
  'Gatsby', 'Bennet', 'Finch', 'Granger', 'Ishmael', 'DorianGray',
  'Caulfield', 'JaneEyre', 'Holmes', 'DonQuijote', 'Darcy', 'Winston',
  'Santiago', 'Offred', 'Meursault', 'Raskolnikov', 'Bilbo', 'Aureliano',
  'Salander', 'Huck', 'Scout', 'Karenina', 'Heathcliff', 'Valjean',
  'Dulcinea', 'Dantes', 'Cathy', 'Frankenstein', 'Bovary', 'Nemo'
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
function _rlOlvidarApodo() { localStorage.removeItem(RETO_APODO_KEY); }

let _rlApodo = '';
let _rlAciertos = 0;
let _rlTotal = 0;
let _rlPreguntaActual = null;
let _rlBloqueado = false;

function _rlMostrarPantalla(pantalla) {
  document.getElementById('retoEntrada').style.display = pantalla === 'entrada' ? '' : 'none';
  document.getElementById('retoJuego').style.display = pantalla === 'juego' ? '' : 'none';
  document.getElementById('retoFin').style.display = pantalla === 'fin' ? '' : 'none';
}

// Pinta la pantalla de entrada: si ya hay un apodo guardado en este
// navegador, salta directo a "seguir jugando" en vez de pedirlo de nuevo.
function _rlPintarEntrada() {
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

// Toggle para mostrar/ocultar la tabla de posiciones desde la pantalla de entrada
function _rlMostrarTabla(contId) {
  const cont = document.getElementById(contId);
  if (!cont) return;
  const yaVisible = cont.style.display !== 'none' && cont.innerHTML.trim() !== '';
  if (yaVisible) {
    cont.style.display = 'none';
    cont.innerHTML = '';
  } else {
    cont.style.display = '';
    _rlRenderLeaderboard(contId);
  }
}

async function _rlTerminar() {
  document.getElementById('retoTerminar').disabled = true;
  await guardarPuntaje(_rlApodo, _rlAciertos, _rlTotal || 1);

  document.getElementById('retoResumen').textContent =
    `${_rlApodo}, respondiste ${_rlTotal} pregunta${_rlTotal !== 1 ? 's' : ''} y acertaste ${_rlAciertos}.`;

  await _rlRenderLeaderboard('retoLeaderboard');

  document.getElementById('retoTerminar').disabled = false;
  _rlMostrarPantalla('fin');
}

document.getElementById('retoEmpezar')?.addEventListener('click', () => {
  const input = document.getElementById('retoNombre');
  const nombre = (input.value || '').trim().slice(0, 30) || 'Anónimo';
  _rlGuardarApodo(nombre);
  _rlApodo = nombre;
  _rlIniciarPartida();
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
  _rlOlvidarApodo();
  _rlPintarEntrada();
});
document.getElementById('retoVerTabla')?.addEventListener('click', () => _rlMostrarTabla('retoTablaEntrada'));
document.getElementById('retoTerminar')?.addEventListener('click', _rlTerminar);
document.getElementById('retoJugarOtra')?.addEventListener('click', () => {
  _rlPintarEntrada();
  _rlMostrarPantalla('entrada');
});

_rlPintarEntrada();
_rlCargarBancoPreguntas();

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
