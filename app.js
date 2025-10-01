// app.js
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });


function createCardHtml(book, large=false){
return `
<div class="card ${large? 'card-large':''}">
<div class="title">${escapeHtml(book.title)}</div>
<div class="meta">${escapeHtml(book.author)}</div>
<div class="detail"><strong>Género:</strong> ${escapeHtml(book.genre)}</div>
<div class="detail"><strong>Tono:</strong> ${escapeHtml(book.tone)}</div>
<div class="detail"><strong>Ritmo:</strong> ${escapeHtml(book.pace)}</div>
</div>
`;
}


// Genres population
function populateGenres(){
const set = new Set();
books.forEach(b=>{
const graw = b.genre || '';
graw.split(/[,;\/]+/).map(x=>x.trim()).filter(Boolean).forEach(x=>set.add(x));
});
const arr = Array.from(set).sort((a,b)=>a.localeCompare(b));
genresList.innerHTML = '';
arr.forEach(g=>{
const chip = document.createElement('button');
chip.className = 'genre-chip';
chip.type = 'button';
chip.textContent = g;
chip.dataset.genre = g;
chip.addEventListener('click', ()=> chip.classList.toggle('active'));
genresList.appendChild(chip);
});
}


function getActiveGenres(){
return Array.from(genresList.querySelectorAll('.genre-chip.active')).map(n=>n.dataset.genre);
}


applyFilterBtn.addEventListener('click', ()=>{
const selected = getActiveGenres();
if(selected.length === 0){ filterResults.innerHTML = '<p class="muted">Seleccione al menos un género.</p>'; return; }
const filtered = books.filter(b=>{
const list = (b.genre||'').split(/[,;\/]+/).map(x=>x.trim().toLowerCase());
return selected.some(s=> list.includes(s.toLowerCase()) );
});
if(filtered.length === 0) filterResults.innerHTML = '<p class="muted">No se encontraron libros con esos géneros.</p>';
else renderCardsGrid(filtered, filterResults);
});


clearFilterBtn.addEventListener('click', ()=>{
genresList.querySelectorAll('.genre-chip.active').forEach(n=>n.classList.remove('active'));
filterResults.innerHTML = '';
});


function renderCardsGrid(list, container){
container.innerHTML = '';
list.forEach(b=>{
const div = document.createElement('div');
div.className = 'card';
div.innerHTML = `
<div class="title">${escapeHtml(b.title)}</div>
<div class="meta">${escapeHtml(b.author)}</div>
<div class="detail"><strong>Género:</strong> ${escapeHtml(b.genre)}</div>
<div class="detail"><strong>Tono:</strong> ${escapeHtml(b.tone)}</div>
<div class="detail"><strong>Ritmo:</strong> ${escapeHtml(b.pace)}</div>
`;
div.addEventListener('click', ()=> openCard(b));
container.appendChild(div);
});
}


// Random
randomBtn.addEventListener('click', ()=>{
if(books.length === 0) return;
const b = books[Math.floor(Math.random()*books.length)];
renderCardsGrid([b], randomResult);
});
randomFromFilterBtn.addEventListener('click', ()=>{
const selected = getActiveGenres();
let pool = books;
if(selected.length>0){ pool = books.filter(b=>{
const list = (b.genre||'').split(/[,;\/]+/).map(x=>x.trim().toLowerCase());
return selected.some(s=> list.includes(s.toLowerCase()) );
});
}
if(pool.length === 0){ randomResult.innerHTML = '<p class="muted">No hay libros en el filtro.</p>'; return; }
const b = pool[Math.floor(Math.random()*pool.length)];
renderCardsGrid([b], randomResult);
});


})();