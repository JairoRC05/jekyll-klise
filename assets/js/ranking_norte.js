// ranking_norte.js

document.addEventListener('DOMContentLoaded', function() {
  const grupoNorteDiv = document.getElementById('grupoNorte');
  const equiposDataNorte = [];
  const teamFilesNorte = [
    'assets/equipos/ad.json',
    'assets/equipos/dbo.json',
    'assets/equipos/dty.json',
    'assets/equipos/neo.json',
    'assets/equipos/ovg.json',
    'assets/equipos/pe.json',
    'assets/equipos/plaga.json',
    'assets/equipos/rk.json',
    'assets/equipos/sm.json',
    'assets/equipos/stmn.json',
    'assets/equipos/tm.json',
    'assets/equipos/zafiro.json'
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