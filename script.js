// ---- TABS ----
const tabs = document.querySelectorAll('.menu li');
const sections = document.querySelectorAll('.tab-section');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ---- MODO OSCURO ----
const btnLightDark = document.getElementById('btnLightDark');
btnLightDark.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// ---- CARGA CSV ----
let libros = [];
Papa.parse('libros.csv', {
  download: true,
  header: true,
  complete: (res) => {
    libros = res.data.filter(x => x.Título);
    renderTabla(libros);
    renderTarjetas(libros);
    llenarGeneros(libros);
  }
});

// ---- TABLA ----
function renderTabla(data){
  const tbody = document.querySelector('#tablaLibros tbody');
  if(!tbody) return;
  tbody.innerHTML = '';

  data.forEach(lib => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${lib.Calificación}</td>
      <td>${lib.Título}</td>
      <td>${lib.Autor}</td>
      <td>${lib.Género}</td>`;

    tr.addEventListener('click', () => mostrarDetalle(lib));
    tbody.appendChild(tr);
  });

  document.getElementById('contadorLibros').textContent = `${data.length} libros encontrados`;
}

// ---- BUSCADOR SOLO EN TABLA ----
const busqueda = document.getElementById('busqueda');
if(busqueda){
  busqueda.addEventListener('input', () => {
    const t = busqueda.value.toLowerCase();
    const filtrados = libros.filter(l =>
      l.Título.toLowerCase().includes(t) ||
      l.Autor.toLowerCase().includes(t) ||
      l.Género.toLowerCase().includes(t)
    );
    renderTabla(filtrados);
  });
}

// ---- TARJETAS ----
function renderTarjetas(data){
  const cont = document.getElementById('tarjetasLibros');
  if(!cont) return;
  cont.innerHTML = '';

  data.forEach(lib => {
    const card = document.createElement('div');
    card.className = 'tarjeta';
    card.innerHTML = `<h3>${lib.Título}</h3><p>${lib.Autor}</p>`;
    card.addEventListener('click', () => mostrarDetalle(lib));
    cont.appendChild(card);
  });
}

// ---- GÉNEROS ----
function llenarGeneros(data){
  const select = document.getElementById('generoSelect');
  if(!select) return;

  const generos = [...new Set(data.map(l => l.Género))].sort();

  generos.forEach(g => {
    const op = document.createElement('option');
    op.value = g;
    op.textContent = g;
    select.appendChild(op);
  });
}

const generoSelect = document.getElementById('generoSelect');
if(generoSelect){
  generoSelect.addEventListener('change', () => {
    const g = generoSelect.value;
    const filtrados = g ? libros.filter(l => l.Género === g) : libros;

    const cont = document.getElementById('generoResultados');
    cont.innerHTML = '';

    filtrados.forEach(lib => {
      const card = document.createElement('div');
      card.className = 'tarjeta';
      card.innerHTML = `<h3>${lib.Título}</h3><p>${lib.Autor}</p>`;
      card.addEventListener('click', () => mostrarDetalle(lib));
      cont.appendChild(card);
    });
  });
}

// ---- RANDOM ----
const btnRandom = document.getElementById('btnRandom');
if(btnRandom){
  btnRandom.addEventListener('click', () => {
    const r = libros[Math.floor(Math.random() * libros.length)];
    const cont = document.getElementById('randomLibro');
    cont.innerHTML = `<h3>${r.Título}</h3><p>${r.Autor}</p>`;
    cont.addEventListener('click', () => mostrarDetalle(r));
  });
}

// ---- MODAL ----
const modal = document.getElementById('detalleModal');
const cerrarModal = document.getElementById('cerrarModal');

function mostrarDetalle(lib){
  document.getElementById('detalleContenido').innerHTML = `
    <h2>${lib.Título}</h2>
    <p><strong>Autor:</strong> ${lib.Autor}</p>
    <p><strong>Género:</strong> ${lib.Género}</p>
    <p><strong>Calificación:</strong> ${lib.Calificación}</p>`;

  modal.classList.remove('hidden');
}

cerrarModal.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', e => { if(e.target === modal) modal.classList.add('hidden'); });
