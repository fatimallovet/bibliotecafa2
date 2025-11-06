// ----- VARIABLES GLOBALES -----
let librosData = [];
let temaOscuro = false;

// ----- CARGAR CSV -----
document.addEventListener("DOMContentLoaded", () => {
  Papa.parse("libros.csv", {
    download: true,
    header: true,
    complete: (results) => {
      librosData = results.data;
      mostrarTabla(librosData);
      llenarGeneros(librosData);
    },
  });

  document.getElementById("busqueda").addEventListener("input", filtrarBusqueda);
  document.getElementById("generoSelect").addEventListener("change", filtrarPorGenero);
  document.getElementById("btnRandom").addEventListener("click", mostrarLibroRandom);
  document.getElementById("btnLightDark").addEventListener("click", toggleTema);
  document.getElementById("cerrarModal").addEventListener("click", cerrarModal);

  // pestañas
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const secciones = document.querySelectorAll("main section");
      secciones.forEach(s => s.classList.add("hidden"));
      document.getElementById(btn.dataset.target).classList.remove("hidden");
    });
  });
});

// ----- MOSTRAR TABLA -----
function mostrarTabla(data) {
  const tbody = document.querySelector("#tablaLibros tbody");
  tbody.innerHTML = "";

  data.forEach(libro => {
    const calificacion = libro['Calificación'] || libro['Calificacion'] || '';
    const titulo = libro['Título'] || libro['Titulo'] || libro['Title'] || '';
    const autor = libro['Autor'] || libro['Author'] || '';
    const genero = libro['Género'] || libro['Genero'] || libro['Genre'] || '';

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${mostrarEstrellas(calificacion)}</td>
      <td>${escapeHtml(titulo)}</td>
      <td>${escapeHtml(autor)}</td>
      <td>${escapeHtml(genero)}</td>
    `;
    tr.addEventListener("click", () => showDetalle(libro));
    tbody.appendChild(tr);
  });

  actualizarContador(data.length);
}

// ----- FUNCIONES AUXILIARES -----
function mostrarEstrellas(valor) {
  const rating = parseFloat(valor) || 0;
  return "⭐".repeat(Math.round(rating));
}

function escapeHtml(text) {
  return text ? text.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m])) : "";
}

function actualizarContador(total) {
  document.getElementById("contadorLibros").textContent = `${total} libros encontrados`;
}

// ----- FILTROS -----
function filtrarBusqueda() {
  const texto = this.value.toLowerCase();
  const filtrados = librosData.filter(l =>
    (l['Título'] || '').toLowerCase().includes(texto) ||
    (l['Autor'] || '').toLowerCase().includes(texto)
  );
  mostrarTabla(filtrados);
}

function llenarGeneros(data) {
  const select = document.getElementById("generoSelect");
  const generos = [...new Set(data.map(l => l['Género'] || l['Genero']).filter(Boolean))].sort();
  generos.forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    select.appendChild(option);
  });
}

function filtrarPorGenero() {
  const genero = this.value;
  const filtrados = genero ? librosData.filter(l => (l['Género'] || l['Genero']) === genero) : librosData;
  mostrarTarjetas(filtrados);
}

// ----- TARJETAS -----
function mostrarTarjetas(data) {
  const contenedor = document.getElementById("tarjetasLibros");
  contenedor.innerHTML = "";
  data.forEach(libro => {
    const div = document.createElement("div");
    div.className = "tarjeta";
    div.innerHTML = `
      <h3>${escapeHtml(libro['Título'] || '')}</h3>
      <p><strong>Autor:</strong> ${escapeHtml(libro['Autor'] || '')}</p>
      <p><strong>Género:</strong> ${escapeHtml(libro['Género'] || '')}</p>
      <p><strong>Calificación:</strong> ${mostrarEstrellas(libro['Calificación'])}</p>
    `;
    div.addEventListener("click", () => showDetalle(libro));
    contenedor.appendChild(div);
  });
}

// ----- LIBRO RANDOM -----
function mostrarLibroRandom() {
  if (!librosData.length) return;
  const randomLibro = librosData[Math.floor(Math.random() * librosData.length)];
  const div = document.getElementById("randomLibro");
  div.innerHTML = `
    <div class="tarjeta">
      <h3>${escapeHtml(randomLibro['Título'] || '')}</h3>
      <p><strong>Autor:</strong> ${escapeHtml(randomLibro['Autor'] || '')}</p>
      <p><strong>Género:</strong> ${escapeHtml(randomLibro['Género'] || '')}</p>
      <p><strong>Calificación:</strong> ${mostrarEstrellas(randomLibro['Calificación'])}</p>
    </div>
  `;
}

// ----- MODAL -----
function showDetalle(libro) {
  const modal = document.getElementById("detalleModal");
  const contenido = document.getElementById("detalleContenido");
  contenido.innerHTML = `
    <h2>${escapeHtml(libro['Título'] || '')}</h2>
    <p><strong>Autor:</strong> ${escapeHtml(libro['Autor'] || '')}</p>
    <p><strong>Género:</strong> ${escapeHtml(libro['Género'] || '')}</p>
    <p><strong>Calificación:</strong> ${mostrarEstrellas(libro['Calificación'])}</p>
    <p><em>${escapeHtml(libro['Resumen'] || 'Sin resumen disponible')}</em></p>
  `;
  modal.classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("detalleModal").classList.add("hidden");
}

// ----- TEMA -----
function toggleTema() {
  temaOscuro = !temaOscuro;
  document.body.classList.toggle("dark-theme", temaOscuro);
  this.textContent = temaOscuro ? "☀️" : "🌙";
}
