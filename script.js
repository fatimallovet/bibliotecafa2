const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_lN4MQGP2PigjKJFOV8ZK92MvfpQWj8aH7qqntBJHOKv6XsvLAxriHmjU3WcD7kafNvNbj3pTFqND/pub?gid=0&single=true&output=csv";
let libros = [];

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
      showError('No se pudieron cargar los datos desde Google Sheets. Verifica que la hoja esté publicada.');
      return;
    }
    // Normalizar headers: intentar aceptar 'Título' o 'Titulo'
    libros = results.data.map(r => {
      // algunos sheets pueden tener fields with BOM or weird spaces; normalize keys
      const clean = {};
      for(const k in r){
        const kk = k.trim();
        clean[kk] = r[k] ? r[k].trim() : '';
      }
      return clean;
    }).filter(r => (r['Título'] || r['Titulo'] || r['Title']));
    if(libros.length === 0){
      showError('No se encontraron filas con columna Título. Revisa los nombres de las columnas.');
      return;
    }
    // ordenar alfabéticamente por título (intentando ambas cabeceras)
    libros.sort((a,b) => {
      const ta = (a['Título'] || a['Titulo'] || a['Title'] || '').toString();
      const tb = (b['Título'] || b['Titulo'] || b['Title'] || '').toString();
      return ta.localeCompare(tb, 'es', {sensitivity:'base'});
    });
    mostrarTabla(libros);
    llenarSelectGeneros(libros);
  },
  error: function(err){
    showError('Error leyendo CSV: ' + err);
  }
});

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
}

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
  const filtrados = genero ? libros.filter(l => ((l['Género']||l['Genero']||'').toString().includes(genero))) : libros;
  mostrarTarjetas(filtrados);
});

function mostrarTarjetas(data){
  const cont = document.getElementById('tarjetasLibros');
  cont.innerHTML = '';
  data.forEach(libro=>{
    const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
    const autor = libro['Autor'] || libro['Author'] || '';
    const genero = libro['Género'] || libro['Genero'] || '';
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<strong>${escapeHtml(titulo)}</strong><br><small>${escapeHtml(autor)}</small><br><em>${escapeHtml(genero)}</em>`;
    div.addEventListener('click', ()=> showDetalle(libro));
    cont.appendChild(div);
  });
}

document.getElementById('btnRandom').addEventListener('click', ()=>{
  if(libros.length === 0) return;
  const r = libros[Math.floor(Math.random()*libros.length)];
  const titulo = r['Título'] || r['Titulo'] || r['Title'] || '';
  const autor = r['Autor'] || r['Author'] || '';
  const genero = r['Género'] || r['Genero'] || '';
  document.getElementById('randomLibro').innerHTML = `<strong>${escapeHtml(titulo)}</strong> — ${escapeHtml(autor)} (${escapeHtml(genero)})`;
});

function showDetalle(libro){
  const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
  const autor = libro['Autor'] || libro['Author'] || '';
  const genero = libro['Género'] || libro['Genero'] || '';
  const tono = libro['Tono'] || libro['Tone'] || '';
  const ritmo = libro['Ritmo'] || '';
  const publico = libro['Público'] || libro['Publico'] || '';
  const etiquetas = libro['Etiquetas'] || libro['Tags'] || '';
  const flags = libro['Flags'] || '';
  const resena = libro['Reseña'] || libro['Resena'] || libro['Review'] || '';
  const text = `Título: ${titulo}\nAutor: ${autor}\nGénero: ${genero}\nTono: ${tono}\nRitmo: ${ritmo}\nPúblico: ${publico}\nEtiquetas: ${etiquetas}\nFlags: ${flags}\nReseña: ${resena}`;
  alert(text);
}

// simple escape
function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}
