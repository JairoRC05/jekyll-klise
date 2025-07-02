
const rutaTemporada = "/assets/temporadas/julio2025";

const truncateString = (str, num) => {
    return str.length > num ? str.slice(0, num) + "..." : str;
};

const cargarEquipos = async () => {
  const contenedor = document.getElementById("contenedor-cards");

  try {
    const indexResp = await fetch(`${rutaTemporada}/equipos-index.json`);
    const archivos = await indexResp.json();

    for (const archivo of archivos) {
      const res = await fetch(`${rutaTemporada}/${archivo}`);
      const equipo = await res.json();

      if (!Array.isArray(equipo.jugadores) || equipo.jugadores.length === 0) continue;
  
        const cardHTML = `
            <div class="card-team me-3" style="min-width: 180px;">
              <div class="card-round-roster">
                <div class="card-round-team">
                  <a href="${equipo.link}">
                    <img src="/assets/logos/${equipo.tag}.webp" alt="${equipo.team}" class="img-fluid">
                  </a>
                </div>
                <div class="card-round-title">
                  <h2>${truncateString(equipo.team, 15)}</h2>
                  <span>${equipo.tag}</span>
                </div>
                <div class="card-back">
                  <div class="card-color-left ${equipo.tag === '7Z' ? 'S7Z' : equipo.tag}"></div>
                  <div class="card-color-right bg-cham"></div>
                  <div class="card-color-logo">
                    <img src="/assets/logos/LIGA-INDIGO.webp" alt="LIGA INDIGO">
                  </div>
                </div>
              </div>
            </div>
          `;
        contenedor.insertAdjacentHTML("beforeend", cardHTML);
    
    }
  } catch (error) {
    console.error("Error al cargar equipos:", error);
  }
};

document.addEventListener("DOMContentLoaded", cargarEquipos);

