const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_lN4MQGP2PigjKJFOV8ZK92MvfpQWj8aH7qqntBJHOKv6XsvLAxriHmjU3WcD7kafNvNbj3pTFqND/pub?gid=0&single=true&output=csv";

let libros = [];
let ordenActual = { col: 'no', asc: true };

/* =========================
   CARGA DE DATOS
========================= */
Papa.parse(sheetUrl, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete(results) {
    if (!results.data || results.data.length === 0) {
      mostrarError("No se pudieron cargar los datos.");
      return;
    }

    libros = results.data
      .map(r => {
        const clean = {};
        for (const k in r) clean[k.trim()] = r[k]?.trim() || '';
        return clean;
      })
      .filter(r => r['Título'] || r['Titulo'] || r['Title']);

    libros.sort((a, b) => comparar(a, b, 'No.'));
    mostrarTabla(libros);
    llenarSelectGeneros(libros);
  },
  error(err) {
    mostrarError("Error leyendo CSV: " + err);
  }
});

/* =========================
   TABLA
========================= */
function mostrarTabla(data) {
  const tbody = document.querySelector("#tablaLibros tbody");
  tbody.innerHTML = "";

  data.forEach(libro => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-no">${escapeHtml(libro['No.'] || libro['No'] || '')}</td>
      <td>${"⭐".repeat(Number(libro['Calificación'] || libro['Estrellas'] || 0))}</td>
      <td>${escapeHtml(libro['Título'] || libro['Titulo'] || '')}</td>
      <td>${escapeHtml(libro['Autor'] || '')}</td>
      <td>${escapeHtml(libro['Género'] || libro['Genero'] || '')}</td>
    `;
    tr.addEventListener("click", () => mostrarDetalle(libro));
    tbody.appendChild(tr);
  });

  actualizarContador(data.length);
}

/* =========================
   FILTROS
========================= */
document.getElementById("busqueda").addEventListener("input", e => {
  const term = normalizar(e.target.value);
  mostrarTabla(libros.filter(l =>
    normalizar(l['Título'] || '').includes(term) ||
    normalizar(l['Autor'] || '').includes(term) ||
    normalizar(l['Género'] || '').includes(term) ||
    normalizar(l['Etiquetas'] || '').includes(term)
  ));
});

function llenarSelectGeneros(data) {
  const select = document.getElementById("generoSelect");
  const generos = new Set();

  data.forEach(l => {
    (l['Género'] || '').split(',').map(g => g.trim()).forEach(g => g && generos.add(g));
  });

  [...generos].sort().forEach(g => {
    const o = document.createElement("option");
    o.value = g;
    o.textContent = g;
    select.appendChild(o);
  });
}

document.getElementById("generoSelect").addEventListener("change", e => {
  const g = e.target.value;
  mostrarTarjetas(g ? libros.filter(l => (l['Género'] || '').includes(g)) : libros);
});

/* =========================
   RANDOM
========================= */
document.getElementById("btnRandom").addEventListener("click", () => {
  const r = libros[Math.floor(Math.random() * libros.length)];
  document.getElementById("randomLibro").innerHTML = `
    <div class="random-card">
      <h3>${escapeHtml(r['Título'] || '')}</h3>
      <p><strong>${escapeHtml(r['Autor'] || '')}</strong></p>
      <p><em>${escapeHtml(r['Género'] || '')}</em></p>
    </div>
  `;
});

/* =========================
   MODAL
========================= */
const modal = document.getElementById("detalleModal");
window.addEventListener("click", e => e.target === modal && modal.classList.add("hidden"));

function mostrarDetalle(libro) {
  document.getElementById("detalleContenido").innerHTML = `
    <div class="modal-header">
      <h3>${escapeHtml(libro['Título'] || '')}</h3>
      <span class="close">&times;</span>
    </div>
    <div class="modal-body">
      <p><strong>Autor:</strong> ${escapeHtml(libro['Autor'] || '')}</p>
      <p><strong>Género:</strong> ${escapeHtml(libro['Género'] || '')}</p>
      <p class="resena">${escapeHtml(libro['Reseña'] || '')}</p>
    </div>
  `;
  modal.classList.remove("hidden");
  document.querySelector(".close").onclick = () => modal.classList.add("hidden");
}

/* =========================
   UTILIDADES
========================= */
function comparar(a, b, campo) {
  return (a[campo] || '').localeCompare(b[campo] || '', 'es', { sensitivity: 'base' });
}

function normalizar(t) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );
}

function actualizarContador(n) {
  document.getElementById("contadorLibros").textContent = `${n} libro${n !== 1 ? "s" : ""} encontrados`;
}

function mostrarError(msg) {
  document.querySelector("#tablaLibros tbody").innerHTML =
    `<tr><td colspan="5" style="color:#b00020">${msg}</td></tr>`;
}

/* =========================
   TABS
========================= */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});
