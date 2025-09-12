document.addEventListener('DOMContentLoaded', () => {
  const temporada = document.body.dataset.temporada;
  const grupo = document.body.dataset.grupo;
  const divId = document.body.dataset.divId;
  const incluirCopaXForze = document.body.dataset.copaxforze === "true"; 

  console.log("Temporada:", temporada, "Grupo:", grupo, "Div:", divId);

  if (temporada && grupo && divId) {
    const rutaTemporada = `/assets/temporadas/${temporada}`;
    console.log("Cargando equipos desde:", rutaTemporada);
    cargarEquiposDesdeIndice(rutaTemporada, grupo, divId, incluirCopaXForze);
  } else {
    console.warn("Faltan datos en el <body> para cargar el ranking.");
  }
});
  