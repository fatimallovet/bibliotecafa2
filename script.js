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
      for(const k in r) clean[k.trim()] = r[k] ? r[k].trim() : '';
      return clean;
    }).filter(r => (r['Título'] || r['Titulo'] || r['Title']));
    libros.sort((a,b)=>comparar(a,b,'Título'));
    mostrarTabla(libros);
    llenarSelectGeneros(libros);
    actualizarContador(libros.length);
  },
  error: err => showError('Error leyendo CSV: ' + err)
});

function comparar(a,b,col){
  const x = (a[col] || a['Titulo'] || a['Title'] || '').toLowerCase();
  const y = (b[col] || b['Titulo'] || b['Title'] || '').toLowerCase();
  return x.localeCompare(y,'es',{sensitivity:'base'});
}

function mostrarTabla(data) {
  const tbody = document.querySelector("#tablaLibros tbody");
  tbody.innerHTML = "";
  data.forEach(libro => {
    const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
    const autor = libro['Autor'] || libro['Author'] || '';
    const genero = libro['Género'] || libro['Genero'] || libro['Genre'] || '';
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(titulo)}</td><td>${escapeHtml(autor)}</td><td>${escapeHtml(genero)}</td>`;
    tr.addEventListener('click', () => showDetalle(libro));
    tbody.appendChild(tr);
  });
  actualizarContador(data.length);
}

// --- Buscador funcional ---
const inputBusqueda = document.getElementById('busqueda');
inputBusqueda.addEventListener('input', ()=>{
  const term = inputBusqueda.value.toLowerCase();
  const filtrados = libros.filter(l=>{
    const t = (l['Título']||l['Titulo']||'').toLowerCase();
    const a = (l['Autor']||'').toLowerCase();
    return t.includes(term) || a.includes(term);
  });
  mostrarTabla(filtrados);
});

// --- Ordenar columnas ---
document.querySelectorAll('#tablaLibros th').forEach(th =>{
  th.addEventListener('click', ()=>{
    const col = th.dataset.sort;
    const campo = col === 'autor' ? 'Autor' : col === 'genero' ? 'Género' : 'Título';
    if(ordenActual.col===col) ordenActual.asc=!ordenActual.asc; else ordenActual={col,asc:true};
    libros.sort((a,b)=>{
      const comp = comparar(a,b,campo);
      return ordenActual.asc ? comp : -comp;
    });
    mostrarTabla(libros);
  });
});

function llenarSelectGeneros(data){
  const select = document.getElementById('generoSelect');
  const set = new Set();
  data.forEach(l => {
    const raw = (l['Género'] || l['Genero'] || l['Genre'] || '') + '';
    raw.split(',').map(s => s.trim()).filter(Boolean).forEach(g => set.add(g));
  });
  const generos = Array.from(set).sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'}));
  generos.forEach(g => {
    const option = document.createElement('option');
    option.value = g;
    option.textContent = g;
    select.appendChild(option);
  });
}

document.getElementById('generoSelect').addEventListener('change', (e)=>{
  const genero = e.target.value;
  const filtrados = genero ? libros.filter(l => ((l['Género']||l['Genero']||'').includes(genero))) : libros;
  mostrarTarjetas(filtrados);
});

function mostrarTarjetas(data){
  const cont = document.getElementById('tarjetasLibros');
  cont.innerHTML = '';
  if(data.length===0){
    cont.innerHTML = '<p style="color:var(--muted)">No se encontraron libros en este género.</p>';
    return;
  }
  data.forEach(libro=>{
    cont.appendChild(crearCard(libro));
  });
}

function crearCard(libro){
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <strong>${escapeHtml(libro['Título'] || libro['Titulo'] || libro['Title'] || '')}</strong><br>
    <small>${escapeHtml(libro['Autor'] || libro['Author'] || '')}</small><br>
    <em>${escapeHtml(libro['Género'] || libro['Genero'] || '')}</em>`;
  div.addEventListener('click', ()=> showDetalle(libro));
  return div;
}

// --- Libro al azar ---
document.getElementById('btnRandom').addEventListener('click', ()=>{
  if(libros.length === 0) return;
  const r = libros[Math.floor(Math.random()*libros.length)];
  const cont = document.getElementById('randomLibro');
  cont.innerHTML = '';
  cont.appendChild(crearCard(r));
});

// --- Modal Detalle ---
const modal = document.getElementById('detalleModal');
const cerrarModal = document.getElementById('cerrarModal');
const detalleContenido = document.getElementById('detalleContenido');

cerrarModal.addEventListener('click', ()=> modal.classList.add('hidden'));
window.addEventListener('click', e=>{ if(e.target===modal) modal.classList.add('hidden'); });

function showDetalle(libro){
  const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
  const autor = libro['Autor'] || libro['Author'] || '';
  const genero = libro['Género'] || libro['Genero'] || '';
  const resena = libro['Reseña'] || libro['Resena'] || libro['Review'] || '';
  detalleContenido.innerHTML = `
    <h3>${escapeHtml(titulo)}</h3>
    <p><strong>Autor:</strong> ${escapeHtml(autor)}</p>
    <p><strong>Género:</strong> ${escapeHtml(genero)}</p>
    <p style="margin-top:12px">${escapeHtml(resena)}</p>`;
  modal.classList.remove('hidden');
}

function actualizarContador(num){
  document.getElementById('contadorLibros').textContent = `${num} libro${num!==1?'s':''} encontrados`;
}

function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/[&<>\"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\\'':'&#39;'}[c]));
}
