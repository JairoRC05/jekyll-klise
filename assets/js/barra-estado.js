// Importa los datos que necesitas desde otros módulos (como tabs-mvps.js)
import { resultadosPorRonda } from '/assets/js/tabs-mvps.js';

const barraEstadoDiv = document.getElementById('barraEstado');
const estadoRondasDiv = document.getElementById('estadoRondas');
const estadoPartidosDiv = document.getElementById('estadoPartidos');
const estadoTotalMvpDiv = document.getElementById('estadoTotalMvp');
const estadoTotalJugadoresMvpDiv = document.getElementById('estadoTotalJugadoresMvp');

console.log('barra-estado.js cargado');

function actualizarBarraEstado() {
  const numRondasCompletadas = Object.keys(resultadosPorRonda).length;
  const totalPartidosJugados = numRondasCompletadas * 12; // 12 partidos por ronda
  const totalMVPsOtorgados = calcularTotalMVPs();
  const totalJugadoresConMVP = calcularTotalJugadoresConMVP();

  if (estadoRondasDiv) {
    estadoRondasDiv.textContent = `Rondas: ${numRondasCompletadas} / 11`;
  }

  if (estadoPartidosDiv) {
    estadoPartidosDiv.textContent = `Partidos Jugados: ${totalPartidosJugados}`;
  }

  if (estadoTotalMvpDiv) {
    estadoTotalMvpDiv.textContent = `Total MVPs: ${totalMVPsOtorgados}`;
  }

  if (estadoTotalJugadoresMvpDiv) {
    estadoTotalJugadoresMvpDiv.textContent = `Jugadores con MVP: ${totalJugadoresConMVP}`;
  }
}

function calcularTotalMVPs() {
  let total = 0;
  for (const ronda in resultadosPorRonda) {
    if (resultadosPorRonda.hasOwnProperty(ronda) && resultadosPorRonda[ronda].length > 0) {
      resultadosPorRonda[ronda].forEach(encuentro => {
        total += encuentro.mvpsLocal.length + encuentro.mvpsVisitante.length;
      });
    }
  }
  return total;
}

function calcularTotalJugadoresConMVP() {
  const jugadoresConMVP = new Set();
  for (const ronda in resultadosPorRonda) {
    if (resultadosPorRonda.hasOwnProperty(ronda) && resultadosPorRonda[ronda].length > 0) {
      resultadosPorRonda[ronda].forEach(encuentro => {
        encuentro.mvpsLocal.forEach(mvp => jugadoresConMVP.add(mvp.nombre));
        encuentro.mvpsVisitante.forEach(mvp => jugadoresConMVP.add(mvp.nombre));
      });
    }
  }
  return jugadoresConMVP.size;
}

// Llama a la función para actualizar la barra de estado cuando los datos estén disponibles
// Esto se hará después de que el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', actualizarBarraEstado);

// También es importante actualizar la barra de estado si los datos en resultadosPorRonda
// se modifican después de la carga inicial. Puedes llamar a actualizarBarraEstado()
// desde tabs-mvps.js después de que se procesen los datos.
export { actualizarBarraEstado };