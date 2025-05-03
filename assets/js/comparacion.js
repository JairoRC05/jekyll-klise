import { resultadosPorRonda } from '/assets/js/tabs-mvps.js';

const jugador1Select = document.getElementById('jugador1');
const jugador2Select = document.getElementById('jugador2');
const comparacionResultadosDiv = document.getElementById('comparacionResultados');

console.log('comparacion.js cargado');

function compararJugadores(dataRondas, uniquePlayers) {
  console.log('compararJugadores llamada con:', dataRondas, uniquePlayers);

  if (!jugador1Select || !jugador2Select || !comparacionResultadosDiv) {
    console.error("Elementos de comparación no encontrados en el DOM.");
    return;
  }

  // Limpiar selectores
  jugador1Select.innerHTML = '';
  jugador2Select.innerHTML = '';

  // Agregar una opción por defecto
  const defaultOption1 = document.createElement('option');
  defaultOption1.value = '';
  defaultOption1.textContent = 'Seleccione un jugador';
  jugador1Select.appendChild(defaultOption1);

  const defaultOption2 = document.createElement('option');
  defaultOption2.value = '';
  defaultOption2.textContent = 'Seleccione un jugador';
  jugador2Select.appendChild(defaultOption2);

  // Popular los selectores de jugadores
  uniquePlayers.forEach(player => {
    const option1 = document.createElement('option');
    option1.value = player;
    option1.textContent = player;
    jugador1Select.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = player;
    option2.textContent = player;
    jugador2Select.appendChild(option2);
  });

  jugador1Select.addEventListener('change', realizarComparacion);
  jugador2Select.addEventListener('change', realizarComparacion);

  // Llamar a realizarComparacion si ambos selectores tienen un valor seleccionado al cargar la página
  if (jugador1Select.value && jugador2Select.value) {
    realizarComparacion();
  }
}

function realizarComparacion() {
  const jugador1Nombre = jugador1Select.value;
  const jugador2Nombre = jugador2Select.value;
  console.log('realizarComparacion llamada. Jugador 1:', jugador1Nombre, 'Jugador 2:', jugador2Nombre);

  if (jugador1Nombre && jugador2Nombre && jugador1Nombre !== jugador2Nombre) {
    const estadisticasJugador1 = obtenerEstadisticasJugador(jugador1Nombre);
    const estadisticasJugador2 = obtenerEstadisticasJugador(jugador2Nombre);
    mostrarResultadosComparacion(estadisticasJugador1, estadisticasJugador2, jugador1Nombre, jugador2Nombre);
  } else {
    comparacionResultadosDiv.innerHTML = ''; // Limpiar el div de resultados si no hay selección válida
  }
}

function obtenerEstadisticasJugador(nombreJugador) {
  const estadisticas = {
    totalMvps: 0,
    equiposComoMvp: new Set(),
    mvpsPorEquipo: {},
    mvpsPorRonda: {},
    primeraRondaMvp: null,
    ultimaRondaMvp: null,
    rachaMaximaConsecutiva: 0,
    equipoActual: null,
    genero: null // <- Añadido para almacenar el género
  };

  let ultimaRonda = 0;
  let rachaActual = 0;
  let rondasMvp = Object.keys(resultadosPorRonda).reduce((acc, ronda) => {
    const rondaNumero = parseInt(ronda);
    let esMvpEnRonda = false;
    resultadosPorRonda[ronda].forEach(encuentro => {
      encuentro.mvpsLocal.forEach(mvp => {
        if (mvp.nombre === nombreJugador) {
          esMvpEnRonda = true;
          estadisticas.totalMvps++;
          estadisticas.equiposComoMvp.add(mvp.equipo);
          estadisticas.mvpsPorEquipo[mvp.equipo] = (estadisticas.mvpsPorEquipo[mvp.equipo] || 0) + 1;
          estadisticas.mvpsPorRonda[rondaNumero] = (estadisticas.mvpsPorRonda[rondaNumero] || 0) + 1;
          estadisticas.equipoActual = mvp.equipo;
          ultimaRonda = Math.max(ultimaRonda, rondaNumero);
          estadisticas.genero = mvp.genero; // <-- Obtener el género
        }
      });
      encuentro.mvpsVisitante.forEach(mvp => {
        if (mvp.nombre === nombreJugador) {
          esMvpEnRonda = true;
          estadisticas.totalMvps++;
          estadisticas.equiposComoMvp.add(mvp.equipo);
          estadisticas.mvpsPorEquipo[mvp.equipo] = (estadisticas.mvpsPorEquipo[mvp.equipo] || 0) + 1;
          estadisticas.mvpsPorRonda[rondaNumero] = (estadisticas.mvpsPorRonda[rondaNumero] || 0) + 1;
          estadisticas.equipoActual = mvp.equipo;
          ultimaRonda = Math.max(ultimaRonda, rondaNumero);
          estadisticas.genero = mvp.genero; // <-- Obtener el género
        }
      });
    });
    if (esMvpEnRonda) {
      acc.push(rondaNumero);
    }
    return acc;
  }, []).sort((a, b) => a - b);

  if (rondasMvp.length > 0) {
    estadisticas.primeraRondaMvp = rondasMvp[0];
    estadisticas.ultimaRondaMvp = rondasMvp[rondasMvp.length - 1];

    for (let i = 0; i < rondasMvp.length; i++) {
      if (i > 0 && rondasMvp[i] === rondasMvp[i - 1] + 1) {
        rachaActual++;
      } else {
        estadisticas.rachaMaximaConsecutiva = Math.max(estadisticas.rachaMaximaConsecutiva, rachaActual + 1);
        rachaActual = 0;
      }
    }
    estadisticas.rachaMaximaConsecutiva = Math.max(estadisticas.rachaMaximaConsecutiva, rachaActual + 1);
  }

  return estadisticas;
}

function mostrarResultadosComparacion(estadisticas1, estadisticas2, jugador1Nombre, jugador2Nombre) {
  comparacionResultadosDiv.innerHTML = `
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="fifa-card">
          <div class="fifa-card-header ${estadisticas1.equipoActual ? estadisticas1.equipoActual.toUpperCase() : ''}">
            ${estadisticas1.genero ? `<img src="/assets/avatars/${estadisticas1.genero}.webp" alt="${jugador1Nombre}" class="fifa-card-avatar">` : ''}
            <div class="fifa-card-info">
              <h5 class="fifa-card-name">${jugador1Nombre}</h5>
              <p class="fifa-card-team">${estadisticas1.equipoActual || 'N/A'}</p>
            </div>
            ${estadisticas1.equipoActual ? `<img src="/assets/logos/${estadisticas1.equipoActual}.webp" alt="${estadisticas1.equipoActual}" class="fifa-card-logo">` : ''}
          </div>
          <div class="fifa-card-stats">
            <div class="fifa-stat"><span>MVP:</span> <span>${estadisticas1.totalMvps}</span></div>
            <div class="fifa-stat"><span>Equipos MVP:</span> <span>${[...estadisticas1.equiposComoMvp].join(', ')}</span></div>
            <div class="fifa-stat"><span>Primer MVP:</span> <span>${estadisticas1.primeraRondaMvp ? estadisticas1.primeraRondaMvp : 'N/A'}</span></div>
            <div class="fifa-stat"><span>Último MVP:</span> <span>${estadisticas1.ultimaRondaMvp ? estadisticas1.ultimaRondaMvp : 'N/A'}</span></div>
            <div class="fifa-stat"><span>Racha:</span> <span>${estadisticas1.rachaMaximaConsecutiva}</span></div>
          </div>
        </div>
      </div>
      <div class="col-md-6 mb-4">
        <div class="fifa-card">
          <div class="fifa-card-header ${estadisticas2.equipoActual ? estadisticas2.equipoActual.toUpperCase() : ''}">
            ${estadisticas2.genero ? `<img src="/assets/avatars/${estadisticas2.genero}.webp" alt="${jugador2Nombre}" class="fifa-card-avatar">` : ''}
            <div class="fifa-card-info">
              <h5 class="fifa-card-name">${jugador2Nombre}</h5>
              <p class="fifa-card-team">${estadisticas2.equipoActual || 'N/A'}</p>
            </div>
            ${estadisticas2.equipoActual ? `<img src="/assets/logos/${estadisticas2.equipoActual}.webp" alt="${jugador2Nombre}" class="fifa-card-logo">` : ''}
          </div>
          <div class="fifa-card-stats">
            <div class="fifa-stat"><span>MVP:</span> <span>${estadisticas2.totalMvps}</span></div>
            <div class="fifa-stat"><span>Equipos MVP:</span> <span>${[...estadisticas2.equiposComoMvp].join(', ')}</span></div>
            <div class="fifa-stat"><span>Primer MVP:</span> <span>${estadisticas2.primeraRondaMvp ? estadisticas2.primeraRondaMvp : 'N/A'}</span></div>
            <div class="fifa-stat"><span>Último MVP:</span> <span>${estadisticas2.ultimaRondaMvp ? estadisticas2.ultimaRondaMvp : 'N/A'}</span></div>
            <div class="fifa-stat"><span>Racha:</span> <span>${estadisticas2.rachaMaximaConsecutiva}</span></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export { compararJugadores };
