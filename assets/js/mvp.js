const RUTA_MVPS = '/assets/temporadas/actual/mvps.json';
const JUGADORES_POR_PAGINA = 7;



let todosLosJugadores = [];
let jugadoresFiltrados = [];
let paginaActual = 1;

function calcularTotalMVPs(mvps) {
  return Object.values(mvps).reduce((sum, val) => sum + val, 0);
}


function filtrarJugadores(texto) {
  texto = texto.trim().toLowerCase();

  if (texto === "") {
    jugadoresFiltrados = [...todosLosJugadores];
  } else {
    jugadoresFiltrados = todosLosJugadores.filter(jug => {
      const coincideNickname = jug.nickname.toLowerCase().includes(texto);
      const coincideID = jug.ID.toLowerCase().includes(texto);
      const coincideTeam = jug.teamTag.toLowerCase().includes(texto);

      // Buscar match: "m3", "m6", etc.
      const coincideMatch = Object.keys(jug.mvps).some(key => 
        key.toLowerCase() === texto && jug.mvps[key] > 0
      );

      return coincideNickname || coincideID || coincideTeam || coincideMatch;
    });
  }

  paginaActual = 1;
  renderPagina(paginaActual);
}


function renderPagina(pagina) {
  const inicio = (pagina - 1) * JUGADORES_POR_PAGINA;
  const fin = inicio + JUGADORES_POR_PAGINA;
  const jugadoresPagina = jugadoresFiltrados.slice(inicio, fin);

  const container = document.getElementById('mvpRanking');
  container.innerHTML = jugadoresPagina.map((jug, idxGlobal) => {
    const posicionGlobal = inicio + idxGlobal + 1;
    const posicion = String(posicionGlobal).padStart(2, '0');
    const avatarUrl = `/assets/avatars/${jug.avatar}.webp`;

    return `
      <div class="card-round-list">
        <div class="card-round-team">
        <a>   <img src="${avatarUrl}" alt="${jug.nickname}" class="img-fluid"></a>
          <div class="card-round-title">
            <h2>${jug.nickname}</h2>
            <div class="card-round-record">${jug.teamTag}</div>
          </div>
        </div>
        <div class="card-round-pts">
          <h6>${jug.totalMVPs} MVP´s</h6>
        </div>
        <div class="card-round-place"><span>${posicion}</span></div>
        <div class="card-back">
          <div class="card-color-left ${jug.teamTag}"></div>
        </div>
      </div>
    `;
  }).join('');

  renderPaginacion();
  document.getElementById('totalCount').textContent = 
    `Total: ${jugadoresFiltrados.length} jugadores con MVPs`;
}

function renderPaginacion() {
  const totalPaginas = Math.ceil(jugadoresFiltrados.length / JUGADORES_POR_PAGINA);
  const ul = document.getElementById('pagination');
  ul.innerHTML = '';

  if (totalPaginas <= 1) return;

  // Botón Anterior
  const liPrev = document.createElement('li');
  liPrev.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
  liPrev.innerHTML = `<a class="page-link" href="#" aria-label="Anterior">&laquo;</a>`;
  if (paginaActual > 1) {
    liPrev.querySelector('a').addEventListener('click', e => {
      e.preventDefault();
      paginaActual--;
      renderPagina(paginaActual);
    });
  }
  ul.appendChild(liPrev);

  // Páginas (máx 5 visibles)
  let start = Math.max(1, paginaActual - 2);
  let end = Math.min(totalPaginas, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);

  for (let i = start; i <= end; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    if (i !== paginaActual) {
      li.querySelector('a').addEventListener('click', e => {
        e.preventDefault();
        paginaActual = i;
        renderPagina(paginaActual);
      });
    }
    ul.appendChild(li);
  }

  // Botón Siguiente
  const liNext = document.createElement('li');
  liNext.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
  liNext.innerHTML = `<a class="page-link" href="#" aria-label="Siguiente">&raquo;</a>`;
  if (paginaActual < totalPaginas) {
    liNext.querySelector('a').addEventListener('click', e => {
      e.preventDefault();
      paginaActual++;
      renderPagina(paginaActual);
    });
  }
  ul.appendChild(liNext);
}

async function cargarYMostrarMVPs() {
  try {
    const response = await fetch(RUTA_MVPS);
    if (!response.ok) throw new Error(`No se encontró el archivo de MVPs (${response.status})`);
    
    const data = await response.json();
    
    // Convertir y ordenar
    todosLosJugadores = Object.values(data)
      .map(jug => ({
        ...jug,
        totalMVPs: calcularTotalMVPs(jug.mvps)
      }))
      .sort((a, b) => b.totalMVPs - a.totalMVPs);

      jugadoresFiltrados = [...todosLosJugadores];

    if (todosLosJugadores.length === 0) {
      document.getElementById('mvpRanking').innerHTML = 
        '<div class="alert alert-warning text-center">No hay MVPs registrados.</div>';
      document.getElementById('totalCount').textContent = 'Total: 0 jugadores';
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    paginaActual = 1;
    renderPagina(paginaActual);
  } catch (err) {
    console.error('Error:', err);
    document.getElementById('mvpRanking').innerHTML = 
      `<div class="alert alert-danger text-center">⚠️ ${err.message}</div>`;
    document.getElementById('totalCount').textContent = 'Error al cargar';
  }
}

document.addEventListener('DOMContentLoaded', cargarYMostrarMVPs);
document.getElementById('searchInput').addEventListener('input', (e) => {
  filtrarJugadores(e.target.value);
});

