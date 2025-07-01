import { compararJugadores } from '/assets/js/comparacion.js';
import { actualizarBarraEstado } from '/assets/js/barra-estado.js';

let resultadosPorRonda = {};

document.addEventListener('DOMContentLoaded', async function () {
  const roundTabs = document.getElementById('roundTabs');
  const roundTabsContent = document.getElementById('roundTabsContent');
  const assetsFolder = 'assets/rondas/';
  const numRondas = 13;

  async function leerJSON(nombreArchivo) {
    try {
      const response = await fetch(assetsFolder + nombreArchivo);
      if (!response.ok) {
        throw new Error(`Error al cargar ${nombreArchivo}: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al leer el archivo JSON:', error);
      return null;
    }
  }

  async function procesarDatos() {
    const allMvpCounts = {};
    const allMvpPlayers = new Set();
    const equiposSet = new Set(); // Para almacenar todos los equipos

    const jsonData = await leerJSON('mvp-torneo.json');
    const rondas = jsonData?.rondas || {};
    
    for (const ronda in rondas) {
      const encuentros = rondas[ronda];
      resultadosPorRonda[ronda] = encuentros;

      encuentros.forEach(encuentro => {
        encuentro.mvpsLocal.forEach(mvp => {
          allMvpPlayers.add(mvp.nombre);
          equiposSet.add(encuentro.equipoLocal);
        });
        encuentro.mvpsVisitante.forEach(mvp => {
          allMvpPlayers.add(mvp.nombre);
          equiposSet.add(encuentro.equipoVisitante);
        });
        encuentro.mvpsLocal.forEach(mvp => allMvpCounts[mvp.nombre] = (allMvpCounts[mvp.nombre] || 0) + 1);
        encuentro.mvpsVisitante.forEach(mvp => allMvpCounts[mvp.nombre] = (allMvpCounts[mvp.nombre] || 0) + 1);
      });
    }

    mostrarResultados(resultadosPorRonda, allMvpCounts, Array.from(equiposSet)); // Pasar la lista de equipos
    compararJugadores(resultadosPorRonda, [...allMvpPlayers].sort());
    actualizarBarraEstado();
  }

  function mostrarResultados(resultadosPorRonda, allMvpCounts, equipos, equipoSeleccionado = null) { // Recibir la lista de equipos
    const roundTabs = document.getElementById('roundTabs');
    const roundTabsContent = document.getElementById('roundTabsContent');
    if (!roundTabs) {
      console.error('No se encontró el elemento con ID "roundTabs"');
      return;
    }
    if (!roundTabsContent) {
      console.error('No se encontró el elemento con ID "roundTabsContent"');
      return;
    }
    roundTabs.classList.add('nav', 'nav-pills', 'nav-justified');
    roundTabs.innerHTML = '';
    roundTabsContent.innerHTML = '';

    // Crear la pestaña de Sumatoria de MVPs de TODAS las Rondas (PRIMERO)
    let mvpTabItem = document.getElementById(`mvps-total-tab`);
    if (!mvpTabItem) {
      mvpTabItem = document.createElement('li');
      mvpTabItem.classList.add('nav-item');
      mvpTabItem.setAttribute('role', 'presentation');

      const mvpTabLink = document.createElement('button');
      mvpTabLink.classList.add('nav-link', 'active');
      mvpTabLink.setAttribute('id', `mvps-total-tab`);
      mvpTabLink.setAttribute('data-bs-toggle', 'tab');
      mvpTabLink.setAttribute('data-bs-target', `#mvps-total`);
      mvpTabLink.setAttribute('type', 'button');
      mvpTabLink.setAttribute('role', 'tab');
      mvpTabLink.setAttribute('aria-controls', `mvps-total`);
      mvpTabLink.setAttribute('aria-selected', 'true');
      mvpTabLink.textContent = 'MVP';
      mvpTabItem.appendChild(mvpTabLink);
      roundTabs.appendChild(mvpTabItem);
    }

    let mvpTabContent = document.getElementById(`mvps-total`);
    if (!mvpTabContent) {
      mvpTabContent = document.createElement('div');
      mvpTabContent.classList.add('tab-pane', 'fade', 'show', 'active');
      mvpTabContent.setAttribute('id', `mvps-total`);
      mvpTabContent.setAttribute('role', 'tabpanel');
      mvpTabContent.setAttribute('aria-labelledby', `mvps-total-tab`);
      roundTabsContent.appendChild(mvpTabContent);
    } else {
      mvpTabContent.innerHTML = '';
    }

    // Crear el selector de equipos
    let filtroEquipoSelect = document.getElementById('filtroEquipoSelect');
    let filtroEquiposDiv = document.getElementById('filtroEquiposDiv');
    if (!filtroEquipoSelect) {
      filtroEquiposDiv = document.createElement('div');
      filtroEquiposDiv.id = 'filtroEquiposDiv';
      filtroEquiposDiv.classList.add('mb-3', 'text-center', 'd-flex', 'justify-content-end');

      filtroEquipoSelect = document.createElement('select');
      filtroEquipoSelect.id = 'filtroEquipoSelect';
      filtroEquipoSelect.classList.add('form-select', 'd-inline-block', 'w-auto');

      const opcionTodos = document.createElement('option');
      opcionTodos.value = '';
      opcionTodos.textContent = 'Todos los Equipos';
      filtroEquipoSelect.appendChild(opcionTodos);

      const opcionReset = document.createElement('option');
      opcionReset.value = 'reset';
      opcionReset.textContent = 'Reset';
      filtroEquipoSelect.appendChild(opcionReset);

      equipos.forEach(equipo => { // Usar la lista de equipos pasada como argumento
        const opcion = document.createElement('option');
        opcion.value = equipo;
        opcion.textContent = equipo;
        filtroEquipoSelect.appendChild(opcion);
      });

      filtroEquipoSelect.addEventListener('change', () => {
        const equipoSeleccionado = filtroEquipoSelect.value;
        mostrarResultados(resultadosPorRonda, allMvpCounts, equipos, equipoSeleccionado); // Pasar la lista de equipos
      });

      filtroEquiposDiv.appendChild(filtroEquipoSelect);
      mvpTabContent.appendChild(filtroEquiposDiv);
    } else {
      filtroEquiposDiv = document.getElementById('filtroEquiposDiv');
      if (!filtroEquiposDiv) {
        filtroEquiposDiv = document.createElement('div');
        filtroEquiposDiv.id = 'filtroEquiposDiv';
        filtroEquiposDiv.classList.add('mb-3', 'text-center', 'd-flex', 'justify-content-end');
        mvpTabContent.appendChild(filtroEquiposDiv);
      } else {
        filtroEquiposDiv.classList.add('d-flex', 'justify-content-end');
      }
      if (!mvpTabContent.contains(filtroEquiposDiv)) {
        mvpTabContent.appendChild(filtroEquiposDiv);
      }
    }

    const mvpCountsConEquipo = {};
    for (const ronda in resultadosPorRonda) {
      if (resultadosPorRonda[ronda]) {
        resultadosPorRonda[ronda].forEach(encuentro => {
          encuentro.mvpsLocal.forEach(mvp => {
            mvpCountsConEquipo[mvp.nombre] = {
              equipo: mvp.equipo,
              conteo: (mvpCountsConEquipo[mvp.nombre]?.conteo || 0) + 1,
              genero: mvp.genero
            };
          });
          encuentro.mvpsVisitante.forEach(mvp => {
            mvpCountsConEquipo[mvp.nombre] = {
              equipo: mvp.equipo,
              conteo: (mvpCountsConEquipo[mvp.nombre]?.conteo || 0) + 1,
              genero: mvp.genero
            };
          });
        });
      }
    }

    let mvpCountsFiltrados = {};
    if (equipoSeleccionado === 'reset') {
      equipoSeleccionado = null;
    }
    if (equipoSeleccionado) {
      mvpCountsFiltrados = Object.fromEntries(
        Object.entries(mvpCountsConEquipo).filter(([, datos]) => datos.equipo === equipoSeleccionado)
      );
    } else {
      mvpCountsFiltrados = mvpCountsConEquipo;
    }

    const mvpsListaOrdenadaConEquipo = Object.entries(mvpCountsFiltrados)
      .sort(([, a], [, b]) => b.conteo - a.conteo);

    const mvpRow = document.createElement('div');
    mvpRow.classList.add('row');
    mvpRow.innerHTML = '';

    mvpsListaOrdenadaConEquipo.forEach(([jugador, datos]) => {
      const mvpCol = document.createElement('div');
      mvpCol.classList.add('col-12', 'col-lg-3', 'mb-3');

      const mvpCard = document.createElement('div');
      mvpCard.classList.add('fifa-card');
      const mvpCardHeader = document.createElement('div');
      mvpCardHeader.classList.add('fifa-card-header', datos.equipo ? datos.equipo.toUpperCase() : '');
      const avatar = datos.genero;
      mvpCardHeader.innerHTML = `
        <img src="/assets/avatars/${avatar}.webp" alt="${jugador}" class="fifa-card-avatar">
        <div class="fifa-card-info">
          <h5 class="fifa-card-name">${jugador}</h5>
          <p class="fifa-card-team">${datos.equipo || 'N/A'}</p>
        </div>
        ${datos.equipo ? `<img src="/assets/logos/${datos.equipo}.webp" alt="${datos.equipo}" class="fifa-card-logo">` : ''}
      `;
      mvpCard.appendChild(mvpCardHeader);

      const mvpCardStats = document.createElement('div');
      mvpCardStats.classList.add('fifa-card-stats');
      mvpCardStats.innerHTML = `
        <div class="fifa-stat"><span>Total MVPs:</span> <span>${datos.conteo}</span></div>
      `;
      mvpCard.appendChild(mvpCardStats);

      mvpCol.appendChild(mvpCard);
      mvpRow.appendChild(mvpCol);
    });

    mvpTabContent.innerHTML = '';
    if (filtroEquiposDiv) {
      mvpTabContent.appendChild(filtroEquiposDiv);
    }
    mvpTabContent.appendChild(mvpRow);
    roundTabsContent.appendChild(mvpTabContent);

    for (let ronda = 1; ronda <= numRondas; ronda++) {
      let tabItem = document.getElementById(`round-${ronda}-tab`);
      if (!tabItem) {
        tabItem = document.createElement('li');
        tabItem.classList.add('nav-item');
        tabItem.setAttribute('role', 'presentation');
        const tabLink = document.createElement('button');
        tabLink.classList.add('nav-link');
        tabLink.setAttribute('id', `round-${ronda}-tab`);
        tabLink.setAttribute('data-bs-toggle', 'tab');
        tabLink.setAttribute('data-bs-target', `#round-${ronda}`);
        tabLink.setAttribute('type', 'button');
        tabLink.setAttribute('role', 'tab');
        tabLink.setAttribute('aria-controls', `round-${ronda}`);
        tabLink.setAttribute('aria-selected', false);
        tabLink.textContent = `${ronda}`;
        tabItem.appendChild(tabLink);
        roundTabs.appendChild(tabItem);
      }

      let tabContent = document.getElementById(`round-${ronda}`);
      if (!tabContent) {
        tabContent = document.createElement('div');
        tabContent.classList.add('tab-pane', 'fade');
        tabContent.setAttribute('id', `round-${ronda}`);
        tabContent.setAttribute('role', 'tabpanel');
        tabContent.setAttribute('aria-labelledby', `round-${ronda}-tab`);
        roundTabsContent.appendChild(tabContent);
      } else {
        tabContent.innerHTML = '';
      }

      const rowDiv = document.createElement('div');
      rowDiv.classList.add('row');

      if (resultadosPorRonda[ronda]) {
        resultadosPorRonda[ronda].forEach(encuentro => {
          const colDiv = document.createElement('div');
          colDiv.classList.add('col-lg-4', 'mb-3');

          const card = document.createElement('div');
          card.classList.add('fifa-card');

          const cardHeader = document.createElement('div');
          cardHeader.classList.add('fifa-card-header', 'bg-cham');
          const logoLocal = document.createElement('img');
          logoLocal.src = `/assets/logos/${encuentro.equipoLocal}.webp`;
          logoLocal.alt = encuentro.equipoLocal;
          logoLocal.classList.add('fifa-card-avatar-small-logo');
          cardHeader.appendChild(logoLocal);

          const versusContainer = document.createElement('div');
          versusContainer.classList.add('fifa-card-info-small');
          versusContainer.innerHTML = `<h5 class="fifa-card-name-small text-center">${encuentro.equipoLocal} VS ${encuentro.equipoVisitante}</h5>`;
          cardHeader.appendChild(versusContainer);

          const logoVisitante = document.createElement('img');
          logoVisitante.src = `/assets/logos/${encuentro.equipoVisitante}.webp`;
          logoVisitante.alt = encuentro.equipoVisitante;
          logoVisitante.classList.add('fifa-card-avatar-small-logo');
          cardHeader.appendChild(logoVisitante);

          card.appendChild(cardHeader);

          // Contenedor para desplegar los MVPs
          const mvpsContainer = document.createElement('div');
          mvpsContainer.classList.add('collapse', 'fifa-card-stats-grid');

          const mostrarMvpsNombres = (mvps, equipo, esLocal) => {
            const mvpList = document.createElement('div');
            mvpList.classList.add(esLocal ? 'local-mvps' : 'visitante-mvps');
            mvps.forEach(mvp => {
              const mvpDiv = document.createElement('div');
              mvpDiv.classList.add('fifa-stat-small');
              mvpDiv.innerHTML = `<span>${mvp.nombre}</span>`;
              mvpList.appendChild(mvpDiv);
            });
            return mvpList;
          };

          const mvpsLocalDiv = mostrarMvpsNombres(encuentro.mvpsLocal, encuentro.equipoLocal, true);
          mvpsContainer.appendChild(mvpsLocalDiv);

          const mvpsVisitanteDiv = mostrarMvpsNombres(encuentro.mvpsVisitante, encuentro.equipoVisitante, false);
          mvpsContainer.appendChild(mvpsVisitanteDiv);

          card.appendChild(mvpsContainer);

          // Icono para desplegar los MVPs
          const toggleButton = document.createElement('div');
          toggleButton.classList.add('fifa-card-toggle');
          toggleButton.setAttribute('data-bs-toggle', 'collapse');
          toggleButton.setAttribute('data-bs-target', `.${card.classList[0]}-mvps-${ronda}-${encuentro.equipoLocal}-${encuentro.equipoVisitante}`);
          toggleButton.setAttribute('aria-expanded', 'false');
          toggleButton.setAttribute('aria-controls', `mvps-${ronda}-${encuentro.equipoLocal}-${encuentro.equipoVisitante}`);
          toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';

          card.appendChild(toggleButton);
          mvpsContainer.classList.add(`${card.classList[0]}-mvps-${ronda}-${encuentro.equipoLocal}-${encuentro.equipoVisitante}`);

          colDiv.appendChild(card);
          rowDiv.appendChild(colDiv);
        });
        tabContent.appendChild(rowDiv);
      }
      roundTabsContent.appendChild(tabContent);
    }
  }

  procesarDatos();
});

export { resultadosPorRonda };
