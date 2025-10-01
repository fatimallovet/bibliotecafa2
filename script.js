const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_lN4MQGP2PigjKJFOV8ZK92MvfpQWj8aH7qqntBJHOKv6XsvLAxriHmjU3WcD7kafNvNbj3pTFqND/pub?gid=0&single=true&output=csv";
let libros = [];
let sortOrder = {};

Papa.parse(sheetUrl, {
  download: true,
  header: true,
  complete: function(results) {
    libros = results.data.filter(row => row.Título && row.Autor);
    libros.sort((a,b) => a.Título.localeCompare(b.Título));
    mostrarTabla(libros);
    prepararOrden();
  }
});

function mostrarTabla(data) {
  const tbody = document.querySelector("#tablaLibros tbody");
  tbody.innerHTML = "";
  data.forEach(libro => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${libro.Título}</td>
      <td>${libro.Autor}</td>
      <td>${libro.Género||''}</td>
      <td>${libro.Tono||''}</td>
      <td>${libro.Ritmo||''}</td>`;
    tr.addEventListener("click", () => mostrarModal(libro));
    tbody.appendChild(tr);
  });
}

function prepararOrden(){
  document.querySelectorAll("#tablaLibros th").forEach(th => {
    const col = th.dataset.col;
    sortOrder[col] = 1;
    th.addEventListener("click", () => {
      libros.sort((a,b)=> sortOrder[col]* ( (a[col]||'').localeCompare(b[col]||'') ));
      sortOrder[col]*=-1;
      mostrarTabla(libros);
    });
  });
}

function mostrarModal(libro){
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modalBody");
  modalBody.innerHTML = `
    <div class="card">
      <h3>${libro.Título}</h3>
      <p><strong>Autor:</strong> ${libro.Autor}</p>
      <p><strong>Género:</strong> ${libro.Género||''}</p>
      <p><strong>Tono:</strong> ${libro.Tono||''}</p>
      <p><strong>Ritmo:</strong> ${libro.Ritmo||''}</p>
      <p><strong>Público:</strong> ${libro.Público||''}</p>
      <p><strong>Etiquetas:</strong> ${libro.Etiquetas||''}</p>
      <p><strong>Flags:</strong> ${libro.Flags||''}</p>
      <p><strong>Reseña:</strong> ${libro.Reseña||''}</p>
    </div>`;
  modal.style.display = "block";
}

document.getElementById("cerrarModal").onclick = function() {
  document.getElementById("modal").style.display = "none";
}
window.onclick = function(event) {
  const modal = document.getElementById("modal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

document.getElementById("btnRandom").addEventListener("click", () => {
  const random = libros[Math.floor(Math.random() * libros.length)];
  document.getElementById("randomLibro").innerHTML = `
    <div class="card">
      <h3>${random.Título}</h3>
      <p><strong>Autor:</strong> ${random.Autor}</p>
      <p><strong>Género:</strong> ${random.Género||''}</p>
      <p><strong>Tono:</strong> ${random.Tono||''}</p>
      <p><strong>Ritmo:</strong> ${random.Ritmo||''}</p>
      <p><strong>Público:</strong> ${random.Público||''}</p>
      <p><strong>Etiquetas:</strong> ${random.Etiquetas||''}</p>
      <p><strong>Flags:</strong> ${random.Flags||''}</p>
      <p><strong>Reseña:</strong> ${random.Reseña||''}</p>
    </div>`;
});