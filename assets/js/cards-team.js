const rutaTemporada = "/assets/temporadas/sep2025";

const truncateString = (str, num) =>
  str.length > num ? str.slice(0, num) + "..." : str;

let tarjetas = []; // Reutilizamos las tarjetas cargadas
let yaCargado = false;

const obtenerGrupoPorAncho = (ancho) => {
  if (ancho < 576) return 1;    // Móvil
  if (ancho < 992) return 4;    // Tablet
  return 6;                     // Desktop
};

const renderizarCarrusel = () => {
  const contenedor = document.getElementById("contenedor-cards");
  contenedor.innerHTML = ""; // Limpia slides previos

  const porSlide = obtenerGrupoPorAncho(window.innerWidth);

  for (let i = 0; i < tarjetas.length; i += porSlide) {
    const grupo = tarjetas.slice(i, i + porSlide).join("");
    const slide = `
      <div class="carousel-item ${i === 0 ? "active" : ""}">
        <div class="row justify-content-center">
          ${grupo}
        </div>
      </div>
    `;
    contenedor.insertAdjacentHTML("beforeend", slide);
  }
};

const cargarEquipos = async () => {
  if (yaCargado) return; // Evita recargar desde red
  yaCargado = true;

  try {
    const indexResp = await fetch(`${rutaTemporada}/equipos-index.json`);
    const archivos = await indexResp.json();

    for (const archivo of archivos) {
      const res = await fetch(`${rutaTemporada}/${archivo}`);
      const equipo = await res.json();

      // if (!Array.isArray(equipo.jugadores) || equipo.jugadores.length === 0)
      //   continue;

      const card = `
        <div class="col-12 col-md-3 col-lg-2 d-flex justify-content-center">
          <a href="${equipo.link}">  
        <div class="card-team">
            <div class="card-round-team">
                <img src="/assets/logos/${equipo.tag}.webp" alt="${equipo.team}" class="img-fluid">
            </div>
            <div class="card-round-title">
              <h2>${truncateString(equipo.team, 12)}</h2>
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
         </a>
        </div>
      `;

      tarjetas.push(card);
    }

    renderizarCarrusel();

  } catch (error) {
    console.error("Error al cargar equipos:", error);
  }
};

// Evento inicial
document.addEventListener("DOMContentLoaded", async () => {
  await cargarEquipos();
});

// Reorganiza las tarjetas al redimensionar
window.addEventListener("resize", () => {
  renderizarCarrusel();
});
