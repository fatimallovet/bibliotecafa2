const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_lN4MQGP2PigjKJFOV8ZK92MvfpQWj8aH7qqntBJHOKv6XsvLAxriHmjU3WcD7kafNvNbj3pTFqND/pub?gid=0&single=true&output=csv";
let libros = [];
let ordenActual = { col: null, asc: true };

function showError(msg) {
  console.error(msg);
  const tbody = document.querySelector("#tablaLibros tbody");
  tbody.innerHTML = `<tr><td colspan="5" style="color:#b00020">${msg}</td></tr>`;
}

// --- Carga desde Google Sheets ---
Papa.parse(sheetUrl, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    if (!results || !results.data || results.data.length === 0) {
      showError('No se pudieron cargar los datos desde Google Sheets.');
      return;
    }
    libros = results.data.map(r => {
      const clean = {};
      for (const k in r) clean[k.trim()] = r[k] ? r[k].trim() : '';
      return clean;
    }).filter(r => (r['Título'] || r['Titulo'] || r['Title']));

    if (libros.length === 0) {
      showError('No se encontraron filas con columna Título.');
      return;
    }

    libros.sort((a, b) => comparar(a, b, 'Título'));
    mostrarTabla(libros);
    llenarSelectGeneros(libros);
    actualizarContador(libros.length);
  },
  error: err => showError('Error leyendo CSV: ' + err)
});

// --- Utilidades ---
function comparar(a, b, col) {
  const x = (a[col] || '').toLowerCase();
  const y = (b[col] || '').toLowerCase();
  return x.localeCompare(y, 'es', { sensitivity: 'base' });
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function actualizarContador(num) {
  document.getElementById('contadorLibros').textContent = `${num} libro${num !== 1 ? 's' : ''} encontrados`;
}

// --- Mostrar tabla ---
function mostrarTabla(data) {
  const tbody = document.querySelector("#tablaLibros tbody");
  tbody.innerHTML = "";
  data.forEach(libro => {
    const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
    const autor = libro['Autor'] || libro['Author'] || '';
    const genero = libro['Género'] || libro['Genero'] || libro['Genre'] || '';
    const flags = libro['Flags'] || '';
    const estrellas = libro['Estrellas'] || libro['Stars'] || '';

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(titulo)}</td>
      <td>${escapeHtml(autor)}</td>
      <td>${escapeHtml(genero)}</td>
      <td>${escapeHtml(flags)}</td>
      <td>${"⭐".repeat(Number(estrellas) || 0)}</td>
    `;
    tr.addEventListener('click', () => showDetalle(libro));
    tbody.appendChild(tr);
  });
  actualizarContador(data.length);
}

// --- Llenar select de géneros ---
function llenarSelectGeneros(data) {
  const select = document.getElementById('generoSelect');
  const set = new Set();
  data.forEach(l => {
    const raw = (l['Género'] || l['Genero'] || l['Genre'] || '') + '';
    raw.split(',').map(s => s.trim()).filter(Boolean).forEach(g => set.add(g));
  });
  const generos = Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  generos.forEach(g => {
    const option = document.createElement('option');
    option.value = g;
    option.textContent = g;
    select.appendChild(option);
  });
}

// --- Filtro de género + búsqueda ---
const inputBusqueda = document.getElementById('busqueda');
const generoSelect = document.getElementById('generoSelect');

function aplicarFiltros() {
  const term = inputBusqueda.value.toLowerCase();
  const genero = generoSelect.value;
  const filtrados = libros.filter(l => {
    const t = (l['Título'] || l['Titulo'] || '').toLowerCase();
    const a = (l['Autor'] || '').toLowerCase();
    const g = (l['Género'] || l['Genero'] || '').toLowerCase();
    const matchBusqueda = t.includes(term) || a.includes(term);
    const matchGenero = !genero || g.includes(genero.toLowerCase());
    return matchBusqueda && matchGenero;
  });
  mostrarTabla(filtrados);
}

inputBusqueda.addEventListener('input', aplicarFiltros);
generoSelect.addEventListener('change', aplicarFiltros);

// --- Ordenar columnas ---
document.querySelectorAll('#tablaLibros th').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.sort;
    const campo = {
      titulo: 'Título',
      autor: 'Autor',
      genero: 'Género',
      flags: 'Flags',
      estrellas: 'Estrellas'
    }[col];

    if (ordenActual.col === col) ordenActual.asc = !ordenActual.asc;
    else ordenActual = { col, asc: true };

    libros.sort((a, b) => {
      const comp = comparar(a, b, campo);
      return ordenActual.asc ? comp : -comp;
    });
    mostrarTabla(libros);

    document.querySelectorAll('#tablaLibros th').forEach(h => h.classList.remove('sorted-asc', 'sorted-desc'));
    th.classList.add(ordenActual.asc ? 'sorted-asc' : 'sorted-desc');
  });
});

// --- Modal detalle ---
const modal = document.getElementById('detalleModal');
const cerrarModal = document.getElementById('cerrarModal');
const detalleContenido = document.getElementById('detalleContenido');

cerrarModal.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

function showDetalle(libro) {
  const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
  const autor = libro['Autor'] || libro['Author'] || '';
  const genero = libro['Género'] || libro['Genero'] || '';
  const tono = libro['Tono'] || '';
  const ritmo = libro['Ritmo'] || '';
  const publico = libro['Público'] || libro['Publico'] || '';
  const etiquetas = libro['Etiquetas'] || libro['Tags'] || '';
  const resena = libro['Reseña'] || libro['Resena'] || libro['Review'] || '';
  const flags = libro['Flags'] || '';
  const estrellas = libro['Estrellas'] || '';

  detalleContenido.innerHTML = `
    <h3>${escapeHtml(titulo)}</h3>
    <p><strong>Autor:</strong> ${escapeHtml(autor)}</p>
    <p><strong>Género:</strong> ${escapeHtml(genero)}</p>
    ${tono ? `<p><strong>Tono:</strong> ${escapeHtml(tono)}</p>` : ''}
    ${ritmo ? `<p><strong>Ritmo:</strong> ${escapeHtml(ritmo)}</p>` : ''}
    ${publico ? `<p><strong>Público:</strong> ${escapeHtml(publico)}</p>` : ''}
    ${etiquetas ? `<p><strong>Etiquetas:</strong> ${escapeHtml(etiquetas)}</p>` : ''}
    ${flags ? `<p><strong>Flags:</strong> ${escapeHtml(flags)}</p>` : ''}
    ${estrellas ? `<p><strong>Calificación:</strong> ${"⭐".repeat(Number(estrellas))} (${estrellas})</p>` : ''}
    <p style="margin-top:12px">${escapeHtml(resena)}</p>
  `;
  modal.classList.remove('hidden');
}

// --- Modo claro/oscuro ---
const btnLightDark = document.getElementById('btnLightDark');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (localStorage.getItem('tema') === 'oscuro' || (!localStorage.getItem('tema') && prefersDark)) {
  document.body.classList.add('dark');
}

btnLightDark.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const tema = document.body.classList.contains('dark') ? 'oscuro' : 'claro';
  localStorage.setItem('tema', tema);
});
