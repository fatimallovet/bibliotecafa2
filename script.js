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
  const tbody = document.querySelector("#tablaLibros tbody");
  tbody.innerHTML = `<tr><td colspan="3" style="color:#b00020">${msg}</td></tr>`;
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
function esMobil() { return window.innerWidth <= 600; }

function mostrarTabla(data) {
  ultimaData = data;
  esMobil() ? mostrarTarjetasLista(data) : mostrarFilasTabla(data);
  actualizarContador(data.length);
}

function mostrarFilasTabla(data) {
  const listaCardsEl = document.getElementById('listaCards'); if(listaCardsEl) listaCardsEl.style.display = 'none';
  document.querySelector('.tabla-wrapper').style.display = '';
  const tbody = document.querySelector("#tablaLibros tbody");
  tbody.innerHTML = "";
  data.forEach(libro => {
    const no = libro['No.'] || libro['No'] || '';
    const calificacion = libro['Calificación'] || libro['Estrellas'] || libro['Stars'] || '';
    const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
    const autor = libro['Autor'] || libro['Author'] || '';
    const genero = libro['Género'] || libro['Genero'] || libro['Genre'] || '';
    const generoChips = genero
      ? genero.split(',').map(g => `<span class="genre-chip">${escapeHtml(g.trim())}</span>`).join(' ')
      : '';
    const starsHtml = calificacion
      ? `<span class="stars-cell">${'★'.repeat(Number(calificacion))}</span>`
      : '';
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-no">${escapeHtml(no)}</td>
      <td>${starsHtml}</td>
      <td>${escapeHtml(titulo)}</td>
      <td>${escapeHtml(autor)}</td>
      <td>${generoChips}</td>
    `;
    tr.addEventListener('click', () => showDetalle(libro));
    tbody.appendChild(tr);
  });
}

function mostrarTarjetasLista(data) {
  const tablaWrapperEl = document.querySelector('.tabla-wrapper'); if(tablaWrapperEl) tablaWrapperEl.style.display = 'none';
  const cont = document.getElementById('listaCards');
  cont.style.display = '';
  cont.innerHTML = '';
  if (data.length === 0) {
    cont.innerHTML = '<p style="color:var(--muted)">No se encontraron libros.</p>';
    return;
  }
  data.forEach(libro => {
    const no = libro['No.'] || libro['No'] || '';
    const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
    const autor = libro['Autor'] || libro['Author'] || '';
    const genero = libro['Género'] || libro['Genero'] || libro['Genre'] || '';
    const calificacion = libro['Calificación'] || libro['Estrellas'] || libro['Stars'] || '';
    const generoChips = genero
      ? genero.split(',').map(g => `<span class="genre-chip">${escapeHtml(g.trim())}</span>`).join(' ')
      : '';
    const starsHtml = calificacion
      ? `<span class="lista-stars">${'★'.repeat(Number(calificacion))}</span>`
      : '';
    const div = document.createElement('div');
    div.className = 'lista-card';
    div.innerHTML = `
      <div class="lista-card-no">${escapeHtml(no)}</div>
      <div class="lista-card-body">
        <div class="lista-card-titulo">${escapeHtml(titulo)}</div>
        <div class="lista-card-autor">${escapeHtml(autor)}</div>
        <div class="lista-card-meta">${generoChips} ${starsHtml}</div>
      </div>
    `;
    div.addEventListener('click', () => showDetalle(libro));
    cont.appendChild(div);
  });
}

window.addEventListener('resize', () => {
  if (ultimaData.length > 0) mostrarTabla(ultimaData);
});

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
    div.addEventListener('click', () => showDetalle(libro));
    cont.appendChild(div);
  });
}


// Botón libro random
function mostrarLibroRandom() {
  if (libros.length === 0) return;
  const r = libros[Math.floor(Math.random() * libros.length)];
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

  document.getElementById('randomLibro').innerHTML = `
    <div class="random-card-full">
      <div class="random-header">
        <h3>${escapeHtml(titulo)}</h3>
        ${numEstrellas > 0 ? `<span class="random-stars">${'★'.repeat(numEstrellas)}</span>` : ''}
      </div>
      <p class="random-autor">${escapeHtml(autor)}</p>
      <p class="random-genero">${escapeHtml(genero)}</p>
      ${tono    ? `<p class="random-meta"><span>Tono</span> ${escapeHtml(tono)}</p>` : ''}
      ${ritmo   ? `<p class="random-meta"><span>Ritmo</span> ${escapeHtml(ritmo)}</p>` : ''}
      ${publico ? `<p class="random-meta"><span>Público</span> ${escapeHtml(publico)}</p>` : ''}
      ${etiquetasHtml ? `<div class="random-etiquetas">${etiquetasHtml}</div>` : ''}
      ${flags && flags.toLowerCase() !== 'ninguno' ? `<p><span class="flag-tag">${escapeHtml(flags)}</span></p>` : ''}
      ${resena  ? `<p class="random-resena">${escapeHtml(resena)}</p>` : ''}
    </div>
  `;
}

document.getElementById('btnRandom').addEventListener('click', mostrarLibroRandom);

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

// --- Ordenar por columnas ---
document.querySelectorAll('#tablaLibros th').forEach(th =>{
  th.addEventListener('click', ()=>{
    const col = th.dataset.sort;
    const campo = 
  col === 'no' ? 'No.' :
  col === 'autor' ? 'Autor' :
  col === 'genero' ? 'Género' :
  col === 'calificacion' ? 'Calificación' :
  'Título';
    if(ordenActual.col===col) ordenActual.asc=!ordenActual.asc; else ordenActual={col,asc:true};
    libros.sort((a,b)=>{
      const comp = comparar(a,b,campo);
      return ordenActual.asc ? comp : -comp;
    });
    mostrarTabla(libros);
  });
});

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
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const target = btn.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(target).classList.add('active');

    if (target === 'tabRandom') mostrarLibroRandom();
  });
});







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
