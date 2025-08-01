// Variables globales
let encuentros = [];
let teamsData = {};
let mvpContador = {};
let indexEditando = null;

const selectEquipoLocal = document.getElementById('equipo-local');
const selectEquipoVisitante = document.getElementById('equipo-visitante');

function loadEquiposDesdeAllTeamData() {
  teamsData = {};
  allTeamData.forEach(team => {
    if (team.activo && team.tag !== 'SIN_EQUIPO') {
      teamsData[team.tag] = team;
    }
  });
  populateTeamSelects();
}

function populateTeamSelects() {
  selectEquipoLocal.innerHTML = '<option value="">Seleccionar...</option>';
  selectEquipoVisitante.innerHTML = '<option value="">Seleccionar...</option>';
  for (const tag in teamsData) {
    const equipo = teamsData[tag];
    [selectEquipoLocal, selectEquipoVisitante].forEach(select => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = equipo.team;
      select.appendChild(option);
    });
  }
}

function resetearFormularioEncuentro() {
  indexEditando = null;
  document.getElementById('ronda').value = '';
  selectEquipoLocal.selectedIndex = 0;
  selectEquipoVisitante.selectedIndex = 0;
  document.getElementById('jugadores-local').innerHTML = '<div class="bloqueado-label">Máximo 3 MVPs</div>';
  document.getElementById('jugadores-visitante').innerHTML = '<div class="bloqueado-label">Máximo 3 MVPs</div>';
  document.getElementById('mvp-local').innerHTML = '';
  document.getElementById('mvp-visitante').innerHTML = '';
  mvpContador = {};
  document.getElementById('btn-guardar').textContent = 'Guardar Encuentro';
  document.getElementById('btn-guardar').onclick = guardarEncuentro;
  document.getElementById('cancelar-edicion').style.display = 'none';
  actualizarTodosLosContadores();
}

function guardarEnLocalStorage() {
  localStorage.setItem('encuentros', JSON.stringify(encuentros));
}

function populatePlayerDraggables(tag, local) {
  const container = document.getElementById(local ? 'jugadores-local' : 'jugadores-visitante');
  container.innerHTML = '<div class="bloqueado-label">Máximo 3 MVPs</div>';
  const team = teamsData[tag];
  team.jugadores.forEach(j => {
    const nombres = [j.nickname, ...(j.alias || [])];
    nombres.forEach(alias => {
      const div = document.createElement('div');
      div.className = 'jugador';
      div.textContent = alias;
      div.dataset.nombre = j.nickname;
      div.dataset.equipo = tag;
      div.dataset.genero = j.avatar || 'unknown';
      container.appendChild(div);
    });
  });
}

function inicializarDragDrop() {
['jugadores-local', 'jugadores-visitante'].forEach(id => {
  new Sortable(document.getElementById(id), {
    group: {
      name: 'mvps',
      pull: 'clone',
      put: false
    },
    animation: 150,
    sort: false
  });
});


  ['mvp-local', 'mvp-visitante'].forEach(id => {
    new Sortable(document.getElementById(id), {
      group: 'mvps',
      animation: 150,
      onAdd: function (evt) {
        const item = evt.item;
        const nombre = item.dataset.nombre;
        if (!item.querySelector('.remove-btn')) {
          const btn = document.createElement('span');
          btn.textContent = '✖';
          btn.className = 'remove-btn';
          btn.onclick = () => {
            item.remove();
            actualizarTodosLosContadores();
          };
          item.appendChild(btn);
        }
        actualizarTodosLosContadores();
      },
      onRemove: actualizarTodosLosContadores,
      onMove: function (evt) {
        const nombre = evt.dragged.dataset.nombre;
        const total = contarMvp(nombre);
        const contenedor = evt.to;
        if (total >= 3 && evt.from !== evt.to) {
          alert(`⚠️ ${nombre} ya fue MVP 3 veces.`);
          return false;
        }
        if (contenedor.children.length >= 3 && evt.from !== evt.to) {
          alert(`⚠️ Solo se permiten 3 MVPs por equipo.`);
          return false;
        }
        return true;
      }
    });
  });
}

selectEquipoLocal.addEventListener('change', () => populatePlayerDraggables(selectEquipoLocal.value, true));
selectEquipoVisitante.addEventListener('change', () => populatePlayerDraggables(selectEquipoVisitante.value, false));

document.getElementById('btn-guardar').onclick = guardarEncuentro;
document.getElementById('cancelar-edicion').onclick = resetearFormularioEncuentro;
document.getElementById('buscador-jugador').addEventListener('input', actualizarTablaPorRonda);

function actualizarTodosLosContadores() {
  mvpContador = {};
  document.querySelectorAll('.jugador').forEach(el => {
    const nombre = el.dataset.nombre;
    mvpContador[nombre] = (mvpContador[nombre] || 0) + (el.parentElement.id.includes('mvp') ? 1 : 0);
  });
  document.querySelectorAll('.jugador').forEach(el => {
    const n = el.dataset.nombre;
    el.classList.toggle('excedido', contarMvp(n) >= 3);
  });
  document.getElementById('jugadores-local').classList.toggle('bloqueado', document.getElementById('mvp-local').children.length >= 3);
  document.getElementById('jugadores-visitante').classList.toggle('bloqueado', document.getElementById('mvp-visitante').children.length >= 3);
}

function contarMvp(nombre) {
  const total = [
    ...document.getElementById('mvp-local').children,
    ...document.getElementById('mvp-visitante').children
  ];
  return total.filter(el => el.dataset.nombre === nombre).length;
}

function getMVPsDesdeContenedor(id, equipo) {
  return Array.from(document.getElementById(id).children).map(el => ({
    nombre: el.dataset.nombre,
    equipo: equipo,
    genero: el.dataset.genero || 'unknown'
  }));
}

function editarEncuentro(index) {
  const encuentro = encuentros[index];
  indexEditando = index;

  document.getElementById('ronda').value = encuentro.ronda;
  selectEquipoLocal.value = encuentro.equipoLocal;
  selectEquipoVisitante.value = encuentro.equipoVisitante;

  populatePlayerDraggables(encuentro.equipoLocal, true);
  populatePlayerDraggables(encuentro.equipoVisitante, false);

  document.getElementById('mvp-local').innerHTML = '';
  document.getElementById('mvp-visitante').innerHTML = '';

  [...encuentro.mvpsLocal, ...encuentro.mvpsVisitante].forEach(mvp => {
    const div = document.createElement('div');
    div.className = 'jugador';
    div.textContent = mvp.nombre;
    div.dataset.nombre = mvp.nombre;
    div.dataset.equipo = mvp.equipo;
    div.dataset.genero = mvp.genero;

    const btn = document.createElement('span');
    btn.textContent = '✖';
    btn.className = 'remove-btn';
    btn.onclick = () => {
      div.remove();
      actualizarTodosLosContadores();
    };
    div.appendChild(btn);

    const containerId = mvp.equipo === encuentro.equipoLocal ? 'mvp-local' : 'mvp-visitante';
    document.getElementById(containerId).appendChild(div);
  });

  document.getElementById('btn-guardar').textContent = 'Actualizar Encuentro';
  document.getElementById('btn-guardar').onclick = actualizarEncuentro;
  document.getElementById('cancelar-edicion').style.display = 'inline-block';
  actualizarTodosLosContadores();
}

    
function actualizarTablaPorRonda() {
  const contenedor = document.getElementById('contenedor-tablas-por-ronda');
  const tabs = document.getElementById('tabs-rondas');
  const filtroJugador = document.getElementById('buscador-jugador').value.toLowerCase();

  // Agrupar por ronda
  const porRonda = {};
  encuentros.forEach((e, i) => {
    const ronda = e.ronda || 'Sin Ronda';
    if (!porRonda[ronda]) porRonda[ronda] = [];
    porRonda[ronda].push({ ...e, index: i });
  });

  // Generar tabs
  tabs.innerHTML = '';
  contenedor.innerHTML = '';
  let activa = true;
  Object.entries(porRonda).forEach(([ronda, encuentros]) => {
    const tabId = `ronda-${ronda}`.replace(/\s+/g, '-');

    // Tab
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML = `<button class="nav-link${activa ? ' active' : ''}" data-bs-toggle="tab" data-bs-target="#${tabId}" type="button">${ronda}</button>`;
    tabs.appendChild(li);

    // Tabla
    const tablaDiv = document.createElement('div');
    tablaDiv.className = `tab-pane fade${activa ? ' show active' : ''}`;
    tablaDiv.id = tabId;
    tablaDiv.classList.add('pt-2'); 

    const table = document.createElement('table');
    table.className = 'table table-bordered table-sm';
    table.innerHTML = `
      <thead><tr>
        <th>Local</th><th>MVPs Local</th>
        <th>Visitante</th><th>MVPs Visitante</th>
        <th>Acciones</th>
      </tr></thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    encuentros.forEach(e => {
      const row = document.createElement('tr');
      const mvpsLocal = e.mvpsLocal.map(m => m.nombre).join(', ');
      const mvpsVisit = e.mvpsVisitante.map(m => m.nombre).join(', ');

      if (
        filtroJugador &&
        !mvpsLocal.toLowerCase().includes(filtroJugador) &&
        !mvpsVisit.toLowerCase().includes(filtroJugador)
      ) return;

      row.innerHTML = `
        <td>${e.equipoLocal}</td>
        <td>${mvpsLocal}</td>
        <td>${e.equipoVisitante}</td>
        <td>${mvpsVisit}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editarEncuentro(${e.index})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarEncuentro(${e.index})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    tablaDiv.appendChild(table);
    contenedor.appendChild(tablaDiv);
    activa = false;
  });
}

function guardarEncuentro() {
  const equipoLocal = selectEquipoLocal.value;
  const equipoVisitante = selectEquipoVisitante.value;
  const ronda = document.getElementById('ronda').value.trim();
  if (!equipoLocal || !equipoVisitante || equipoLocal === equipoVisitante) return alert('Equipos inválidos');

  const mvpsLocal = getMVPsDesdeContenedor('mvp-local', equipoLocal);
  const mvpsVisitante = getMVPsDesdeContenedor('mvp-visitante', equipoVisitante);
  encuentros.push({ ronda, equipoLocal, equipoVisitante, mvpsLocal, mvpsVisitante });
  guardarEnLocalStorage();
  resetearFormularioEncuentro();
  actualizarTablaPorRonda();
}

function actualizarEncuentro() {
  if (indexEditando === null) return;
  const ronda = document.getElementById('ronda').value.trim();
  const equipoLocal = selectEquipoLocal.value;
  const equipoVisitante = selectEquipoVisitante.value;
  const mvpsLocal = getMVPsDesdeContenedor('mvp-local', equipoLocal);
  const mvpsVisitante = getMVPsDesdeContenedor('mvp-visitante', equipoVisitante);
  encuentros[indexEditando] = { ronda, equipoLocal, equipoVisitante, mvpsLocal, mvpsVisitante };
  guardarEnLocalStorage();
  resetearFormularioEncuentro();
  actualizarTablaPorRonda();
}

function eliminarEncuentro(index) {
  if (!confirm('¿Eliminar este encuentro?')) return;
  const fila = document.querySelectorAll('#contenedor-tablas-por-ronda table tbody tr')[index];
  if (fila) fila.classList.add('fila-eliminada');
  setTimeout(() => {
    encuentros.splice(index, 1);
    guardarEnLocalStorage();
    actualizarTablaPorRonda();
  }, 400);
}

function cargarDesdeLocalStorage() {
  const data = localStorage.getItem('encuentros');
  if (data) {
    encuentros = JSON.parse(data);
    actualizarTablaPorRonda();
  }
}

function descargarJson() {
  const rondasAgrupadas = {};
  encuentros.forEach(encuentro => {
    const ronda = encuentro.ronda || "sin_ronda";
    if (!rondasAgrupadas[ronda]) {
      rondasAgrupadas[ronda] = [];
    }
    rondasAgrupadas[ronda].push(encuentro);
  });
  const data = { rondas: rondasAgrupadas };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'mvp-torneo.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

window.addEventListener('DOMContentLoaded', () => {
  loadEquiposDesdeAllTeamData();
  cargarDesdeLocalStorage();
  inicializarDragDrop();
});
 