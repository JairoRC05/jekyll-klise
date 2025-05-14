// ranking_sur.js

document.addEventListener('DOMContentLoaded', function() {
  const grupoSurDiv = document.getElementById('grupoSur');
  const equiposDataSur = [];
  const teamFilesSur = [
    'assets/equipos/amt.json',
    'assets/equipos/aogiri.json',
    'assets/equipos/cl.json',
    'assets/equipos/enigma.json',
    'assets/equipos/gx.json',
    'assets/equipos/ns.json',
    'assets/equipos/obs.json',
    'assets/equipos/space.json',
    'assets/equipos/tad.json',
    'assets/equipos/rntx.json',
    'assets/equipos/tut.json',
    'assets/equipos/tutw.json'
  ];

  const fetchPromisesSur = teamFilesSur.map(file =>
    fetch('/' + file)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0 && data[0].grupo === 'SUR') {
          const equipo = data[0];
          let suma = 0;
          if (equipo.partidos) {
            for (const partido in equipo.partidos) {
              suma += parseInt(equipo.partidos[partido]) || 0;
            }
          }
          equiposDataSur.push({ ...equipo, suma: suma });
        }
      })
      .catch(error => console.error(`Error fetching ${file}:`, error))
  );

  Promise.all(fetchPromisesSur)
    .then(() => {
      equiposDataSur.sort((a, b) => b.suma - a.suma);
      console.log("equiposDataSur:", equiposDataSur);
      if (grupoSurDiv) {
        mostrarEquipos(equiposDataSur, grupoSurDiv, 'SUR');
      }
      cargarRankingAnteriorSur();
    })
    .catch(error => console.error("Error al obtener los datos de los equipos del sur:", error));

  function cargarRankingAnteriorSur() {
    fetch('/assets/ranking/ranking.json')
      .then(response => response.json())
      .then(rankingAnterior => {
        compararRankings(rankingAnterior.sur, equiposDataSur, grupoSurDiv);
      })
      .catch(error => console.error("Error al cargar el ranking anterior del sur:", error));
  }
});