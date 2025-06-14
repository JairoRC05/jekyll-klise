// utils.js

function generarPartidoHTML(partido) {
    if (partido.equipo2 === "DES") {
        return `
      <div class="bracket-round-list-zzz">
        <div class="card-round-promo">
          <h3>DESCANSO</h3>
        </div>
        <div class="bracket-round-team">
          <a href="/teams/${partido.equipo1}">
            <img src="/assets/logos/${partido.equipo1}.webp" alt="" class="img-fluid">
          </a>
        </div>
        <div class="card-back">
          <div class="card-color-left ${partido.equipo1 === '7Z' ? 'S7Z' : partido.equipo1}"> </div>
          <div class="card-color-right ${partido.equipo2 === '7Z' ? 'S7Z' : partido.equipo2}"> </div>
        </div>
      </div>
    `;
    } else {
        return `
      <div class="bracket-round-list">
        <div class="bracket-round-team">
          <a href="/teams/${partido.equipo1}">
            <img src="/assets/logos/${partido.tag1}.webp" alt="" class="img-fluid">
          </a>
        </div>
        <div class="round-titles">
          <div class="card-round-promo left">
            <h6>${partido.equipo1.substring(0, 15)}</h6>
          </div>
          <div class="card-round-promo mx-2">
            ${partido.stream ? `
              <span>TWITCH</span>
              <h6>${partido.resultado}</h6>
              <span>${partido.fecha}</span>
              <span>${partido.hora}</span>
            ` : partido.special ? `
              <span>TWITCH</span>
              <h6>${partido.resultado}</h6>
              <span>${partido.hora}</span>
            ` : `
              <h6>${partido.resultado}</h6>
            `}
          </div>
          <div class="card-round-promo right">
            <h6>${partido.equipo2.substring(0, 15)}</h6>
          </div>
        </div>
        <div class="bracket-round-team-right">
          <a href="/teams/${partido.equipo2}">
            <img src="/assets/logos/${partido.tag2}.webp" alt="" class="img-fluid">
          </a>
        </div>
        <div class="card-back">
          <div class="card-color-left ${partido.equipo1 === '7Z' ? 'S7Z' : partido.tag1}"> </div>
          <div class="card-color-right ${partido.equipo2 === '7Z' ? 'S7Z' : partido.tag2}"> </div>
        </div>
      </div>
    `;
    }
}

function obtenerNombreImagen(nombreRonda) {
    if (nombreRonda.includes("RONDA 1")) {
        return "scizor";
    } else if (nombreRonda.includes("RONDA 2")) {
        return "raichu";
    } else if (nombreRonda.includes("RONDA 3")) {
        return "goodra";
    } else if (nombreRonda.includes("RONDA 4")) {
        return "mimikyu";
    } else if (nombreRonda.includes("RONDA 5")) {
        return "urshifu";
    } else if (nombreRonda.includes("RONDA 6")) {
        return "gengar";
    } else if (nombreRonda.includes("RONDA 7")) {
        return "lapras";
    } else if (nombreRonda.includes("RONDA 8")) {
        return "psyduck";
    } else if (nombreRonda.includes("RONDA 9")) {
        return "cleafable";
    } else if (nombreRonda.includes("RONDA 10")) {
        return "espeonEstrella";
    } else if (nombreRonda.includes("RONDA 11")) {
        return "gyarados";
    } else if (nombreRonda.includes("RONDA 12")) {
        return "chandelure";
    } else if (nombreRonda.includes("RONDA 13")) {
        return "blastoise";
    } else if (nombreRonda.includes("HOOPA")) {
        return "PORTAL"; // Asumiendo que "PORTAL" es el nombre para Hoopa
    }
    // Agrega más condiciones según tus rondas e imágenes
    const numeroRonda = nombreRonda.replace("RONDA ", "");
    return `skin_ronda_${numeroRonda}`; // Nombre de imagen por defecto basado en el número de ronda
}

function generarContenidoRonda(rondaData) {

    function formatearFecha(fechaString) {
        if (!fechaString) return '';
        const [year, month, day] = fechaString.split('-');
        const fechaLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)); // Mes es 0-indexado
        const dia = fechaLocal.getDate();
        const mes = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(fechaLocal);
        return `${dia} ${mes}`;
    }

    let fechaMostrar = '';

    if (rondaData.fecha_inicio && rondaData.fecha_fin) {
        const inicio = formatearFecha(rondaData.fecha_inicio);
        const fin = formatearFecha(rondaData.fecha_fin);

        if (inicio === fin) {
            fechaMostrar = inicio;
        } else {
            const inicioDia = inicio.split(' ')[0];
            const inicioMes = inicio.split(' ')[1];
            const finDia = fin.split(' ')[0];
            const finMes = fin.split(' ')[1];

            if (inicioMes === finMes) {
                fechaMostrar = `${inicioDia} - ${finDia} ${inicioMes}`;
            } else {
                fechaMostrar = `${inicioDia} ${inicioMes} - ${finDia} ${finMes}`;
            }
        }
    } else if (rondaData.fecha) {
        fechaMostrar = formatearFecha(rondaData.fecha);
    }

      const nombreImagenFinal = rondaData.nombreImagen || obtenerNombreImagen(rondaData.ronda);

    let html = `
    <div class="container mt-2">
      <div class="row">
        <div class="col-8 col-md-6 col-lg-8 d-none d-lg-block">
          <div class="d-flex justify-content-center align-items-center"
            style="position: relative">
            <div class="bg-cham" style="clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
              z-index: -1000;
              position: absolute;
              width: 400px;
              height: 100%;">
            </div>
            <img
              class="animate__animated animate__pulse animate__slow 2s animate__infinite infinite"
              src="/assets/rounds/ROUND${rondaData.ronda.split(' ')[1] || 'H'}.webp"
              alt=""
              style="position: absolute; width: 100%; z-index: -999"
            />
            <img
              src="/assets/skins/${nombreImagenFinal}.webp" alt=""
              style="width: 550px"
            />
            <img src="/assets/gifts/shine.gif" alt="" style="position:
              absolute; width: 150px; height: 150px"">
          </div>
        </div>
        <div class="col-12 col-md-12 col-lg-4 p-0 ">
          <div class="">
            <div class="d-flex justify-content-center align-items-center bg-cham bracket-round-list" style="border-radius: 10px;">
              <h1 class="exo-style">${fechaMostrar}</h1>
            </div>
          </div>
          <div class="row team--round mt-2">
            ${rondaData.partidos.map(partido => {
                const numeroRonda = parseInt(rondaData.ronda.split(' ')[1]);
                let partidoModificado = { ...partido };
                if (numeroRonda % 2 === 0 && partido.equipo2 !== "DES") {
                    [partidoModificado.equipo1, partidoModificado.equipo2] = [partidoModificado.equipo2, partidoModificado.equipo1];
                    [partidoModificado.tag1, partidoModificado.tag2] = [partidoModificado.tag2, partidoModificado.tag1];

                    // Aquí se invierte el resultado
                    if (partidoModificado.resultado && partidoModificado.resultado.includes('-')) {
                        const [score1, score2] = partidoModificado.resultado.split('-');
                        partidoModificado.resultado = `${score2}-${score1}`;
                    }
                }
                return `
                  <div class="col-12 col-md-6 col-lg-12">
                    ${generarPartidoHTML(partidoModificado)}
                  </div>
                `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
    return html;
}


function cargarRondaHoopa(contenedorHoopa) {
    fetch('/assets/partidos/cruces.json')
        .then(response => response.json())
        .then(hoopaData => {
            contenedorHoopa.innerHTML = generarRondaEspecialHTML(hoopaData);
        })
        .catch(error => {
            console.error('Error al cargar cruces.json para la Ronda Hoopa:', error);
            contenedorHoopa.innerHTML = '<p>Error al cargar la Ronda Hoopa.</p>';
        });
}


function generarRondaEspecialHTML(rondaEspecialData) {
    if (!rondaEspecialData || !rondaEspecialData[0] || !rondaEspecialData[0].rondas || !rondaEspecialData[0].rondas[0]) {
        return '<p>No se encontraron datos para la Ronda Especial.</p>';
    }

    const rondaHoopa = rondaEspecialData[0].rondas[0];

    let html = `
      <div class="container mt-2">
  
            <div class="section-title">
              <h1 class="exo-style-black">${rondaHoopa.ronda}</h1>
        <span class="exo-style-black">${rondaHoopa.fecha}</span>
            </div>
       
        
        <div class="row">

          <div class="col-12 col-md-6 col-lg-3">
            ${rondaHoopa.partidos.slice(0, Math.ceil(rondaHoopa.partidos.length / 2)).map(partido => `
              <div class="col-12">
                ${generarPartidoHTML(partido)}
              </div>
            `).join('')}
          </div>

       

          <div class="col-12 col-md-6 col-lg-3">
            ${rondaHoopa.partidos.slice(Math.ceil(rondaHoopa.partidos.length / 2)).map(partido => `
              <div class="col-12">
                ${generarPartidoHTML(partido)}
              </div>
            `).join('')}
          </div>


               <div class="col-12 col-md-6 col-lg-6">
            <div
              class="d-flex justify-content-center align-items-center"
              style="position: relative">
              <div
                class="bg-cham"
                style="
                  clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
                  z-index: -1000;
                  position: absolute;
                  width: 100%;
                  height: 100%;
                "
              ></div>
              <img
                class="img-fluid"
                src="/assets/skins/PORTAL.webp"
                alt=""
                style="width: 550px"
              />
              <img src="/assets/gifts/shine.gif" alt=""
                style="position: absolute; width: 150px;
                height: 150px">
            </div>
          </div>
        
        </div>
      </div>
    `;

    return html;
}

