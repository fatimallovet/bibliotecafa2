const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_lN4MQGP2PigjKJFOV8ZK92MvfpQWj8aH7qqntBJHOKv6XsvLAxriHmjU3WcD7kafNvNbj3pTFqND/pub?gid=0&single=true&output=csv";
let libros = [];
let librosFiltrados = [];

// Utilidades
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }
function getField(libro, keys){ return keys.map(k=>libro[k]).find(v=>v)?libro[keys.find(k=>libro[k])]:""; }

function showError(msg){
  console.error(msg);
  const tbody = document.querySelector("#tablaLibros tbody");
  tbody.innerHTML = `<tr><td colspan="4" style="color:#b00020">${msg}</td></tr>`;
  document.getElementById('tarjetasLibros').innerHTML = `<p style="color:#b00020">${msg}</p>`;
}

// Parse CSV
Papa.parse(sheetUrl,{
  download:true,
  header:true,
  skipEmptyLines:true,
  complete: function(results){
    if(!results || !results.data || results.data.length === 0){ showError('No se pudieron cargar los datos'); return; }
    libros = results.data.map(r=>{
      const clean = {};
      for(const k in r){ clean[k.trim()] = r[k]? r[k].trim():''; }
      return clean;
    }).filter(r => getField(r,['Título','Titulo','Title']));
    if(libros.length===0){ showError('No se encontraron filas con columna Título'); return; }
    libros.sort((a,b)=>getField(a,['Título','Titulo','Title']).localeCompare(getField(b,['Título','Titulo','Title']),'es',{sensitivity:'base'}));
    librosFiltrados = [...libros];
    mostrarTabla(librosFiltrados);
    llenarSelectGeneros(libros);
    actualizarContadores();
  },
  error: function(err){ showError('Error leyendo CSV: '+err); }
});

// Mostrar tabla
function mostrarTabla(data){
  const tbody = document.querySelector("#tablaLibros tbody");
  tbody.innerHTML="";
  data.forEach(libro=>{
    const tr = document.createElement("tr");
    const titulo = escapeHtml(getField(libro,['Título','Titulo','Title']));
    const autor = escapeHtml(getField(libro,['Autor','Author']));
    const genero = escapeHtml(getField(libro,['Género','Genero','Genre']));
    tr.innerHTML = `<td>${titulo}</td><td>${autor}</td><td>${genero}</td><td><button class="btnCopy">🔗</button></td>`;
    tr.querySelector('.btnCopy').addEventListener('click', e=>{
      e.stopPropagation();
      navigator.clipboard.writeText(window.location.href + '#' + encodeURIComponent(titulo));
      alert('Enlace copiado al portapapeles!');
    });
    tr.addEventListener('click', ()=> showDetalle(libro));
    tbody.appendChild(tr);
  });
}

// Select de géneros
function llenarSelectGeneros(data){
  const select = document.getElementById('generoSelect');
  const set = new Set();
  data.forEach(l=>{
    (getField(l,['Género','Genero','Genre']).split(',').map(s=>s.trim()).filter(Boolean)).forEach(g=>set.add(g));
  });
  Array.from(set).sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'})).forEach(g=>{
    const option = document.createElement('option');
    option.value=g;
    option.textContent=g;
    select.appendChild(option);
  });
}

// Mostrar tarjetas
function mostrarTarjetas(data){
  const cont = document.getElementById('tarjetasLibros');
  const mensaje = document.getElementById('mensajeNoLibros');
  cont.innerHTML='';
  if(data.length===0){ mensaje.textContent='No se encontraron libros en este género o búsqueda.'; return; }
  mensaje.textContent='';
  data.forEach(libro=>{
    const div = document.createElement('div');
    div.className='card';
    div.innerHTML = `<strong>${escapeHtml(getField(libro,['Título','Titulo','Title']))}</strong><br>
                     <small>${escapeHtml(getField(libro,['Autor','Author']))}</small><br>
                     <em>${escapeHtml(getField(libro,['Género','Genero','Genre']))}</em>`;
    div.addEventListener('click', ()=> showDetalle(libro));
    cont.appendChild(div);
  });
}

// Detalle en modal
function showDetalle(libro){
  const detalle = `
Título: ${getField(libro,['Título','Titulo','Title'])}
Autor: ${getField(libro,['Autor','Author'])}
Género: ${getField(libro,['Género','Genero','Genre'])}
Tono: ${getField(libro,['Tono','Tone'])}
Ritmo: ${getField(libro,['Ritmo'])}
Público: ${getField(libro,['Público','Publico'])}
Etiquetas: ${getField(libro,['Etiquetas','Tags'])}
Reseña: ${getField(libro,['Reseña','Resena','Review'])}`;
  document.getElementById('detalleTexto').textContent = detalle;
  document.getElementById('modalDetalle').style.display='flex';
}

document.querySelector('.modal .close').onclick = ()=>{document.getElementById('modalDetalle').style.display='none';}

// Random
document.getElementById('btnRandom').addEventListener('click', ()=>{
  if(libros.length===0) return;
  const r = libros[Math.floor(Math.random()*libros.length)];
  document.getElementById('randomLibro').innerHTML=`<strong>${escapeHtml(getField(r,['Título','Titulo','Title']))}</strong> — ${escapeHtml(getField(r,['Autor','Author']))} (${escapeHtml(getField(r,['Género','Genero','Genre']))})`;
});

// Filtrado por género y búsqueda
document.getElementById('generoSelect').addEventListener('change', e=> filtrarLibros());
document.getElementById('busquedaInput').addEventListener('input', e=> filtrarLibros());
document.getElementById('busquedaTarjetas').addEventListener('input', e=> filtrarLibros());

function filtrarLibros(){
  const genero = document.getElementById('generoSelect').value;
  const textoTabla = document.getElementById('busquedaInput').value.toLowerCase();
  const textoTarjetas = document.getElementById('busquedaTarjetas').value.toLowerCase();
  librosFiltrados = libros.filter(l=>{
    let matchGenero = genero ? getField(l,['Género','Genero','Genre']).split(',').map(s=>s.trim()).includes(genero) : true;
    let matchTexto = getField(l,['Título','Titulo','Title','Autor','Author','Etiquetas','Tags']).toLowerCase().includes(textoTabla) ||
                     getField(l,['Título','Titulo','Title','Autor','Author','Etiquetas','Tags']).toLowerCase().includes(textoTarjetas);
    return matchGenero && matchTexto;
  });
  mostrarTabla(librosFiltrados);
  mostrarTarjetas(librosFiltrados);
  actualizarContadores();
}

// Contadores
function actualizarContadores(){
  document.getElementById('contadorLibros').textContent = `Total: ${librosFiltrados.length} libros`;
  document.getElementById('contadorTarjetas').textContent = `Total: ${librosFiltrados.length} libros`;
}

// Ordenar por columna
document.querySelectorAll('#tablaLibros th[data-key]').forEach(th=>{
  th.addEventListener('click', ()=>{
    const key = th.getAttribute('data-key');
    const asc = !th.classList.contains('asc');
    librosFiltrados.sort((a,b)=>{
      const va = getField(a,[key]).toLowerCase();
      const vb = getField(b,[key]).toLowerCase();
      return asc ? va.localeCompare(vb,'es',{sensitivity:'base'}) : vb.localeCompare(va,'es',{sensitivity:'base'});
    });
    document.querySelectorAll('#tablaLibros th').forEach(h=>h.classList.remove('asc','desc'));
    th.classList.add(asc?'asc':'desc');
    mostrarTabla(librosFiltrados);
  });
});

// Pestañas
document.querySelectorAll('.tabBtn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tabBtn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tabContent').forEach(tc=>tc.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});
