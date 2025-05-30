// ranking_norte.js

document.addEventListener('DOMContentLoaded', function() {
  const grupoNorteDiv = document.getElementById('grupoNorte');
  const equiposDataNorte = [];
  const teamFilesNorte = [
    'assets/temporadas/junio2025/orion/aep.json',
    'assets/temporadas/junio2025/orion/amt.json',
    'assets/temporadas/junio2025/orion/lb.json',
    'assets/temporadas/junio2025/orion/magma.json',
    'assets/temporadas/junio2025/orion/obs.json',
    'assets/temporadas/junio2025/orion/pkr.json',
    'assets/temporadas/junio2025/orion/pl.json',
    'assets/temporadas/junio2025/orion/quartz.json',
    'assets/temporadas/junio2025/orion/sapphire.json',
    'assets/temporadas/junio2025/orion/stmn.json',
    'assets/temporadas/junio2025/orion/tae.json',
    'assets/temporadas/junio2025/orion/tut.json',
    'assets/temporadas/junio2025/orion/tutw.json'

  ];

  const fetchPromisesNorte = teamFilesNorte.map(file =>
    fetch('/' + file)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0 && data[0].grupo === 'NORTE') {
          const equipo = data[0];
          let suma = 0;
          if (equipo.partidos) {
            for (const partido in equipo.partidos) {
              suma += parseInt(equipo.partidos[partido]) || 0;
            }
          }
          equiposDataNorte.push({ ...equipo, suma: suma });
        }
      })
      .catch(error => console.error(`Error fetching ${file}:`, error))
  );

  Promise.all(fetchPromisesNorte)
    .then(() => {
      equiposDataNorte.sort((a, b) => b.suma - a.suma);
      console.log("equiposDataNorte:", equiposDataNorte);
      if (grupoNorteDiv) {
        mostrarEquipos(equiposDataNorte, grupoNorteDiv, 'NORTE');
      }
      cargarRankingAnteriorNorte();
    })
    .catch(error => console.error("Error al obtener los datos de los equipos del norte:", error));

  function cargarRankingAnteriorNorte() {
    fetch('/assets/ranking/ranking.json')
      .then(response => response.json())
      .then(rankingAnterior => {
        compararRankings(rankingAnterior.norte, equiposDataNorte, grupoNorteDiv);
      })
      .catch(error => console.error("Error al cargar el ranking anterior del norte:", error));
  }
});