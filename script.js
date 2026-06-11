// BiblioFa script.js · Actualizado: 2026-06-09
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

const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_lN4MQGP2PigjKJFOV8ZK92MvfpQWj8aH7qqntBJHOKv6XsvLAxriHmjU3WcD7kafNvNbj3pTFqND/pub?gid=0&single=true&output=csv";
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

function ordenarLibros(data, criterio) {
  const copia = [...data];
  if (criterio === 'recientes') {
    copia.sort((a, b) => {
      const na = Number(a['No.'] || a['No'] || 0);
      const nb = Number(b['No.'] || b['No'] || 0);
      return nb - na;
    });
  } else if (criterio === 'calificacion') {
    copia.sort((a, b) => {
      const ca = parseInt(getCampo(a, 'Calificación', 'Estrellas', 'Stars') || '0');
      const cb = parseInt(getCampo(b, 'Calificación', 'Estrellas', 'Stars') || '0');
      return cb - ca;
    });
  }
  return copia;
}

function mostrarTabla(data) {
  ultimaData = data;
  const ordenados = ordenarLibros(data, ordenSeleccionado);
  mostrarTarjetasLista(ordenados);
  actualizarContador(data.length);
}

function mostrarTarjetasLista(data) {
  const cont = document.getElementById('listaCards');
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
    const numEstrellas = parseInt(calificacion, 10);
    const resena = libro['Reseña'] || libro['Resena'] || libro['Review'] || '';
    const flags = libro['Flags'] || '';
    const generoChips = genero
      ? genero.split(',').map(g => `<span class="genre-chip">${escapeHtml(g.trim())}</span>`).join(' ')
      : '';
    const starsHtml = numEstrellas > 0
      ? `<span class="lista-stars">${'★'.repeat(numEstrellas)}</span>`
      : '';
    const div = document.createElement('div');
    div.className = 'lista-card';
    div.innerHTML = `
      <div class="lista-card-body">
        <div class="lista-card-top">
          <div class="lista-card-titulo">${escapeHtml(titulo)}</div>
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
    `;
    div.querySelector('.btn-antojo').addEventListener('click', e => {
      e.stopPropagation();
      toggleAntojos(libro);
      div.querySelector('.btn-antojo').classList.toggle('guardado', antojosContiene(libro));
    });
    div.addEventListener('click', () => showDetalle(libro));
    cont.appendChild(div);
  });
}

// Selector de orden
const ordenSelectEl = document.getElementById('ordenSelect');
if (ordenSelectEl) {
  ordenSelectEl.addEventListener('change', (e) => {
    ordenSeleccionado = e.target.value;
    mostrarTabla(ultimaData);
  });
}

// --- Filtro de géneros con intersección ---
const generosActivos = new Set();

function getGenerosLibro(libro) {
  return (libro['Género'] || libro['Genero'] || libro['Genre'] || '')
    .split(',').map(s => s.trim()).filter(Boolean);
}

function librosFiltradosPorGenero() {
  if (generosActivos.size === 0) return libros;
  // Intersección: el libro debe tener TODOS los géneros activos
  return libros.filter(l =>
    [...generosActivos].every(g => getGenerosLibro(l).includes(g))
  );
}

function renderGeneroBtns() {
  const cont = document.getElementById('generoBtns'); if(!cont) return;
  const resultado = librosFiltradosPorGenero();

  // Géneros disponibles dado el filtro actual (para desactivar los que no aplican)
  const disponibles = new Set();
  resultado.forEach(l => getGenerosLibro(l).forEach(g => disponibles.add(g)));

  // Todos los géneros existentes en la biblioteca
  const todosGeneros = Array.from(
    new Set(libros.flatMap(l => getGenerosLibro(l)))
  ).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  cont.innerHTML = '';

  // Botón "Todos"
  const btnTodos = document.createElement('button');
  btnTodos.className = 'genero-btn' + (generosActivos.size === 0 ? ' active' : '');
  btnTodos.textContent = 'Todos';
  btnTodos.addEventListener('click', () => {
    generosActivos.clear();
    renderGeneroBtns();
    mostrarTarjetas(libros);
  });
  cont.appendChild(btnTodos);

  // Un botón por género
  todosGeneros.forEach(g => {
    const btn = document.createElement('button');
    const activo = generosActivos.has(g);
    const disponible = activo || disponibles.has(g);

    btn.className = 'genero-btn' + (activo ? ' active' : '') + (!disponible ? ' desactivado' : '');
    btn.textContent = g;
    btn.disabled = !disponible;

    btn.addEventListener('click', () => {
      if (generosActivos.has(g)) {
        generosActivos.delete(g);
      } else {
        generosActivos.add(g);
      }
      renderGeneroBtns();
      mostrarTarjetas(librosFiltradosPorGenero());
    });
    cont.appendChild(btn);
  });
}

function llenarSelectGeneros(data) {
  renderGeneroBtns();
  mostrarTarjetas(libros);
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
}

function renderRandomModal(r) {
  const titulo    = r['Título'] || r['Titulo'] || r['Title'] || '';
  const autor     = r['Autor'] || r['Author'] || '';
  const genero    = r['Género'] || r['Genero'] || r['Genre'] || '';
  const tono      = r['Tono'] || r['Tone'] || '';
  const ritmo     = r['Ritmo'] || '';
  const publico   = r['Público'] || r['Publico'] || '';
  const resena    = r['Reseña'] || r['Resena'] || r['Review'] || '';
  const flags     = r['Flags'] || '';
  const etiquetas = r['Etiquetas'] || r['Tags'] || '';
  const estrellasRaw = getCampo(r, 'Calificación', 'Estrellas', 'Stars');
  const numEstrellas = parseInt(estrellasRaw, 10);

  const etiquetasHtml = etiquetas
    ? etiquetas.split(',').map(e => `<span class="etiqueta-tag">${escapeHtml(e.trim())}</span>`).join('')
    : '';

  document.getElementById('randomModalTitulo').textContent = titulo;
  document.getElementById('randomModalCuerpo').innerHTML = `
    <p class="random-autor"><strong>${escapeHtml(autor)}</strong></p>
    <p class="random-genero">${escapeHtml(genero)}</p>
    ${numEstrellas > 0 ? `<p class="random-stars">${'★'.repeat(numEstrellas)}</p>` : ''}
    ${tono    ? `<p class="random-meta"><span>Tono</span> ${escapeHtml(tono)}</p>` : ''}
    ${ritmo   ? `<p class="random-meta"><span>Ritmo</span> ${escapeHtml(ritmo)}</p>` : ''}
    ${publico ? `<p class="random-meta"><span>Público</span> ${escapeHtml(publico)}</p>` : ''}
    ${etiquetasHtml ? `<div class="random-etiquetas">${etiquetasHtml}</div>` : ''}
    ${flags && flags.toLowerCase() !== 'ninguno' ? `<p><span class="flag-tag">${escapeHtml(flags)}</span></p>` : ''}
    ${resena  ? `<p class="random-resena">${escapeHtml(resena)}</p>` : ''}
  `;

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
}

document.getElementById('randomFab').addEventListener('click', mostrarLibroRandomEnModal);
document.getElementById('btnOtroRandom').addEventListener('click', () => {
  if (libros.length === 0) return;
  _libroRandom = libros[Math.floor(Math.random() * libros.length)];
  renderRandomModal(_libroRandom);
});
document.getElementById('cerrarRandomModal').addEventListener('click', () => {
  document.getElementById('randomModal').classList.add('hidden');
});
document.getElementById('randomModal').addEventListener('click', e => {
  if (e.target === document.getElementById('randomModal'))
    document.getElementById('randomModal').classList.add('hidden');
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


window.addEventListener('click', e=>{ if(e.target===modal) modal.classList.add('hidden'); });

function showDetalle(libro){
  const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
  const autor = libro['Autor'] || libro['Author'] || '';
  const genero = libro['Género'] || libro['Genero'] || '';
  const tono = libro['Tono'] || libro['Tone'] || '';
  const ritmo = libro['Ritmo'] || '';
  const publico = libro['Público'] || libro['Publico'] || '';
  const etiquetas = libro['Etiquetas'] || libro['Tags'] || '';
  const resena = libro['Reseña'] || libro['Resena'] || libro['Review'] || '';
  const flags = libro['Flags'] || '';
  const estrellas = libro['Estrellas'] || libro['Calificación'] || '';

detalleContenido.innerHTML = `
  <div class="modal-header">
    <h3>${escapeHtml(titulo)}</h3>
    <span id="cerrarModalInterno" class="close">&times;</span>
  </div>

  <div class="modal-body">
    <p><strong>Autor:</strong> ${escapeHtml(autor)}</p>
    <p><strong>Género:</strong> ${escapeHtml(genero)}</p>
    ${tono ? `<p><strong>Tono:</strong> ${escapeHtml(tono)}</p>` : ''}
    ${ritmo ? `<p><strong>Ritmo:</strong> ${escapeHtml(ritmo)}</p>` : ''}
    ${publico ? `<p><strong>Público:</strong> ${escapeHtml(publico)}</p>` : ''}
    ${etiquetas ? `<p><strong>Etiquetas:</strong> ${escapeHtml(etiquetas)}</p>` : ''}
    ${flags ? `<p><strong>Flags:</strong> ${escapeHtml(flags)}</p>` : ''}
    ${estrellas ? `<p><strong>Calificación:</strong> ${"⭐".repeat(Number(estrellas))} (${estrellas})</p>` : ''}
    <p class="resena">${escapeHtml(resena)}</p>
  </div>
`;

document.getElementById('cerrarModalInterno')
  .addEventListener('click', ()=> modal.classList.add('hidden'));

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

  modalActions.appendChild(btnAntojo);
  modalActions.appendChild(btnCompartir);
  document.querySelector('#detalleContenido .modal-body').appendChild(modalActions);

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
// Función central de navegación — usada por desktop y barra móvil
function activarTab(target) {
  // Tabs desktop
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const desktopBtn = document.querySelector(`.tab-btn[data-tab="${target}"]`);
  if (desktopBtn) desktopBtn.classList.add('active');
  // Contenido
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const section = document.getElementById(target);
  if (section) section.classList.add('active');
  // Barra inferior
  document.querySelectorAll('.bn-item[data-tab]').forEach(b => b.classList.remove('active'));
  const bnBtn = document.querySelector(`.bn-item[data-tab="${target}"]`);
  if (bnBtn) bnBtn.classList.add('active');

  if (target === 'tabAbout') cargarInfo();
}

// Tabs desktop
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => activarTab(btn.dataset.tab));
});

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
const MOODS = {
  evadir:  { generos: ['fantasía','aventura','ciencia ficción','distópico','realismo mágico','fantasía épica','fantasía gótica'], tonos: [] },
  reir:    { generos: ['humor','comedia','sátira','comedia social','comedia negra'], tonos: ['humorístico','ingenioso','disparatado','irónico'] },
  llorar:  { generos: [], tonos: ['conmovedor','melancólico','desgarrador','emotivo','nostálgico','dramático'] },
  aprender:{ generos: ['biográfico','testimonial','memorias','biografía novelada'], tonos: [] },
  crecer:  { generos: ['espiritualidad','cristianismo','religión','desarrollo personal','conversos'], tonos: ['reflexivo','inspirador','esperanzador'] },
  tension: { generos: ['thriller','misterio','suspenso','intriga','crimen','policíaca','espionaje','thriller psicológico'], tonos: ['intrigante','tenso'] },
  clasico: { generos: ['clásico'], tonos: [] },
  ligero:  { generos: ['juvenil','contemporáneo','ficción contemporánea','comedia','humor','infantil','aventura'], tonos: ['ligero','tierno','cálido','humorístico','optimista'] },
};

function librosParaMood(mood) {
  const { generos, tonos } = MOODS[mood];
  return libros.filter(l => {
    const g = (l['Género'] || '').toLowerCase();
    const t = (l['Tono'] || '').toLowerCase();
    const genOk = generos.length === 0 || generos.some(x => g.includes(x));
    const tonOk = tonos.length === 0 || tonos.some(x => t.includes(x));
    return genOk && tonOk;
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

document.querySelectorAll('.sentimiento-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const mood = btn.dataset.mood;
    const resultado = librosParaMood(mood);
    if (resultado.length === 0) {
      alert('No encontré libros para ese estado de ánimo 😔');
      return;
    }
    mostrarTarjetasMood(resultado);
    document.getElementById('sentimientoGrid').style.display = 'none';
    document.getElementById('sentimientoResultado').style.display = '';
  });
});

document.getElementById('btnVolver').addEventListener('click', () => {
  document.getElementById('sentimientoResultado').style.display = 'none';
  document.getElementById('sentimientoGrid').style.display = '';
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

function actualizarAntojosUI() {
  const items = antojosCargar();
  const fab = document.getElementById('antojosBtn');
  fab.style.display = items.length > 0 ? 'flex' : 'none';
  document.getElementById('antojosCount').textContent = items.length;
  // Actualizar badge en barra inferior
  const bnBadge = document.getElementById('bnAntojosCount');
  if (bnBadge) {
    bnBadge.textContent = items.length;
    bnBadge.style.display = items.length > 0 ? 'flex' : 'none';
  }

  const lista = document.getElementById('antojosLista');
  lista.innerHTML = '';
  items.forEach(libro => {
    const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
    const autor  = libro['Autor'] || libro['Author'] || '';
    const estrellasRaw = getCampo(libro, 'Calificación', 'Estrellas', 'Stars');
    const numEstrellas = parseInt(estrellasRaw, 10);

    const li = document.createElement('li');
    li.className = 'antojos-item';
    li.innerHTML = `
      <div class="antojos-item-info">
        <span class="antojos-item-titulo">${escapeHtml(titulo)}</span>
        <span class="antojos-item-autor">${escapeHtml(autor)}</span>
        ${numEstrellas > 0 ? `<span class="antojos-item-stars">${'★'.repeat(numEstrellas)}</span>` : ''}
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

document.getElementById('antojosBtn').addEventListener('click', () => {
  document.getElementById('randomModal').classList.add('hidden');
  document.getElementById('antojosPanel').classList.toggle('hidden');
});
document.getElementById('antojosCerrar').addEventListener('click', () => {
  document.getElementById('antojosPanel').classList.add('hidden');
});
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
  const resena    = libro['Reseña'] || libro['Resena'] || libro['Review'] || '';
  const flags     = libro['Flags'] || '';
  const estrellasRaw = getCampo(libro, 'Calificación', 'Estrellas', 'Stars');
  const numEstrellas = parseInt(estrellasRaw, 10);

  let t = `📚 *${titulo}*\n✍️ ${autor}\n`;
  if (numEstrellas > 0) t += `${'★'.repeat(numEstrellas)}\n`;
  t += `\n`;
  if (genero)  t += `🎭 ${genero}\n`;
  if (tono)    t += `🎨 Tono: ${tono}\n`;
  if (ritmo)   t += `⏱ Ritmo: ${ritmo}\n`;
  if (publico) t += `👤 Público: ${publico}\n`;
  if (flags && flags.toLowerCase() !== 'ninguno') t += `⚠️ ${flags}\n`;
  if (resena)  t += `\n${resena}\n`;
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
}

document.getElementById('shareModalCerrar').addEventListener('click', () => {
  document.getElementById('shareModal').classList.add('hidden');
});
document.getElementById('shareModal').addEventListener('click', e => {
  if (e.target === document.getElementById('shareModal'))
    document.getElementById('shareModal').classList.add('hidden');
});
document.getElementById('shareWhatsapp').addEventListener('click', () => {
  window.open('https://wa.me/?text=' + encodeURIComponent(_textoCompartir), '_blank');
  document.getElementById('shareModal').classList.add('hidden');
});
document.getElementById('shareCopiar').addEventListener('click', () => {
  navigator.clipboard.writeText(_textoCompartir).then(() => {
    mostrarToast('📋 Copiado al portapapeles');
    document.getElementById('shareModal').classList.add('hidden');
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
// BARRA DE NAVEGACIÓN INFERIOR (solo móvil)
// =====================================================

// Tabs en barra inferior — reutiliza activarTab global
document.querySelectorAll('.bn-item[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => activarTab(btn.dataset.tab));
});

// Wishlist
document.getElementById('bnWishlist').addEventListener('click', () => {
  document.getElementById('randomModal').classList.add('hidden');
  document.getElementById('antojosPanel').classList.toggle('hidden');
});

// Random
document.getElementById('bnRandom').addEventListener('click', mostrarLibroRandomEnModal);
