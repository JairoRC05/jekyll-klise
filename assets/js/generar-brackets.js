let bracketData = [];
let cantidadEquiposSeleccionada = 0;
let equiposIniciales = [];
let rondaActual = 0; // Para rastrear el progreso del bracket

const crudContainer = document.getElementById('crud-container');
const equiposFormContainer = document.getElementById('equipos-form-container');
const listaEquiposContainer = document.getElementById('lista-equipos');
const editarEquipoFormContainer = document.getElementById('editar-equipo-form');
const resultadoPartidoFormContainer = document.getElementById('resultado-partido-form');

const cantidadEquiposModal = new bootstrap.Modal(document.getElementById('cantidadEquiposModal'));
const agregarEquiposModal = new bootstrap.Modal(document.getElementById('agregarEquiposModal'));
const editarEquipoModal = new bootstrap.Modal(document.getElementById('editarEquipoModal'));
const resultadoPartidoModal = new bootstrap.Modal(document.getElementById('resultadoPartidoModal'));

let equipoAEditarIndex = -1;
let partidoSeleccionado = null;



// Cargar el progreso desde Local Storage al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const storedData = localStorage.getItem('bracketData');
    const storedEquipos = localStorage.getItem('equiposIniciales');
    const storedCantidad = localStorage.getItem('cantidadEquiposSeleccionada');

    if (storedCantidad) {
        cantidadEquiposSeleccionada = parseInt(storedCantidad);
    }

    if (storedEquipos) {
        equiposIniciales = JSON.parse(storedEquipos);
        actualizarListaEquipos();
        let parsedBracketData = [{ "rondas": [] }];
        if (storedData) {
            try {
                parsedBracketData = JSON.parse(storedData);
            } catch (e) {
                console.error("Error al parsear bracketData desde Local Storage:", e);
                // Puedes decidir inicializar o no el bracketData aquí
            }
        }
        generarEstructuraBracket(cantidadEquiposSeleccionada, parsedBracketData);
    } else {
        cantidadEquiposModal.show();
    }
});

function iniciarCreacionBracket() {
    cantidadEquiposSeleccionada = parseInt(document.getElementById('cantidadEquipos').value);
    localStorage.setItem('cantidadEquiposSeleccionada', cantidadEquiposSeleccionada);
    cantidadEquiposModal.hide();

    generarFormularioEquiposIniciales(cantidadEquiposSeleccionada);
    agregarEquiposModal.show();
}

function generarFormularioEquiposIniciales(cantidad) {
    equiposFormContainer.innerHTML = '';
    for (let i = 1; i <= cantidad; i++) {
        const div = document.createElement('div');
        div.classList.add('mb-3', 'row', 'align-items-center');
        div.innerHTML = `
                <div class="col-sm-6">
                <label for="equipo_nombre_${i}">Equipo ${i}</label>
                        <input type="text" class="form-control" id="equipo_nombre_${i}" placeholder="Nombre del equipo">
                    </div>
                    <div class="col-sm-4">
                    <label for="equipo_tag_${i}">Tag (ej: ABC)</label>
                        <input type="text" class="form-control" id="equipo_tag_${i}" placeholder="TAG">
                    </div>
                    <div class="col-sm-2">
                    <label for="equipo_posicion_${i}">Posición Inicial</label>
                        <input type="number" class="form-control" id="equipo_posicion_${i}" value="${i}" disabled>
                    </div>
                `;
        equiposFormContainer.appendChild(div);
    }
}

function guardarEquiposIniciales() {
    console.log('cantidadEquiposSeleccionada:', cantidadEquiposSeleccionada);
    console.log('guardarEquiposIniciales ejecutada');
    const cantidad = parseInt(localStorage.getItem('cantidadEquiposSeleccionada'));
    equiposIniciales = [];
    for (let i = 1; i <= cantidad; i++) {
        const nombre = document.getElementById(`equipo_nombre_${i}`).value.trim();
        const tag = document.getElementById(`equipo_tag_${i}`).value.trim().toUpperCase();
        const posicion = parseInt(document.getElementById(`equipo_posicion_${i}`).value);
        if (nombre) {
            equiposIniciales.push({ nombre, tag, posicion });
        } else {
            alert('Por favor, ingresa el nombre de todos los equipos.');
            return;
        }
    }
    console.log('equiposIniciales:', equiposIniciales)
    localStorage.setItem('equiposIniciales', JSON.stringify(equiposIniciales));
    actualizarListaEquipos();
    generarEstructuraBracket(cantidad);
    // Asegúrate de que el bracket se muestre después de generarlo
    mostrarBracket();
    agregarEquiposModal.hide();
}

function actualizarListaEquipos() {
    listaEquiposContainer.innerHTML = '';
    equiposIniciales.forEach((equipo, index) => {
        const equipoSpan = document.createElement('span');
        equipoSpan.classList.add('equipo-nombre', 'badge', 'bg-secondary', 'me-2', 'mb-2', 'text-white', 'p-2', 'rounded');
        equipoSpan.textContent = equipo.equipo1;
        equipoSpan.addEventListener('click', () => mostrarModalEditarEquipo(index));
        listaEquiposContainer.appendChild(equipoSpan);
    });
}

function mostrarModalEditarEquipo(index) {
    equipoAEditarIndex = index;
    const equipo = equiposIniciales[index];
    editarEquipoFormContainer.innerHTML = `
                <div class="mb-3">
                    <label for="editar_equipo_nombre" class="form-label">Nombre del Equipo</label>
                    <input type="text" class="form-control" id="editar_equipo_nombre" value="${equipo.equipo1}">
                </div>
                <div class="mb-3">
                    <label for="editar_equipo_tag" class="form-label">Tag</label>
                    <input type="text" class="form-control" id="editar_equipo_tag" value="${equipo.tag1}">
                </div>
                <div class="mb-3">
                    <label for="editar_equipo_posicion" class="form-label">Posición Inicial</label>
                    <input type="number" class="form-control" id="editar_equipo_posicion" value="${equipo.posicion}">
                </div>
            `;
    editarEquipoModal.show();
}

function guardarEdicionEquipo() {
    if (equipoAEditarIndex !== -1) {
        equiposIniciales[equipoAEditarIndex].equipo1 = document.getElementById('editar_equipo_nombre').value;
        equiposIniciales[equipoAEditarIndex].tag1 = document.getElementById('editar_equipo_tag').value;
        equiposIniciales[equipoAEditarIndex].posicion = parseInt(document.getElementById('editar_equipo_posicion').value);

        // Validar posiciones únicas nuevamente
        const posiciones = equiposIniciales.map(equipo => equipo.posicion);
        if (new Set(posiciones).size !== posiciones.length || posiciones.some(isNaN) || Math.min(...posiciones) < 1 || Math.max(...posiciones) > cantidadEquiposSeleccionada) {
            alert('Las posiciones deben ser únicas y estar entre 1 y ' + cantidadEquiposSeleccionada);
            return;
        }
        equiposIniciales.sort((a, b) => a.posicion - b.posicion);
        localStorage.setItem('equiposIniciales', JSON.stringify(equiposIniciales));
        actualizarListaEquipos();
        generarEstructuraBracket(cantidadEquiposSeleccionada); // Regenerar el bracket con la información actualizada
        editarEquipoModal.hide();
    }
    equipoAEditarIndex = -1;
}

function generarEstructuraBracket(cantidad, storedData = null) {
    console.log('generarEstructuraBracket llamada con cantidad:', cantidad, 'equiposIniciales:', equiposIniciales);
            console.log('generarEstructuraBracket llamada con cantidad:', cantidad, 'storedData:', storedData);
            crudContainer.innerHTML = '';
            bracketData = [{"rondas": []}];

            if (storedData && storedData.rondas && storedData.rondas.length > 0) {
                bracketData = storedData; // Usar datos cargados si existen
            } else if (equiposIniciales && equiposIniciales.length === cantidad) {
                // Generar la primera ronda usando equiposIniciales
                const primeraRondaPartidos = [];
                for (let i = 0; i < cantidad; i += 2) {
                    primeraRondaPartidos.push({
                        equipo1: equiposIniciales[i].nombre,
                        tag1: equiposIniciales[i].tag,
                        equipo2: equiposIniciales[i + 1].nombre,
                        tag2: equiposIniciales[i + 1].tag,
                        resultado: 'VS',
                        llave: `LLAVE ${i / 2 + 1}`
                        // Puedes agregar fecha y hora inicial aquí si lo deseas
                    });
                }
                bracketData[0].rondas.push({ ronda: 'Ronda 1', partidos: primeraRondaPartidos });
                // Generar las siguientes rondas vacías
                let numPartidos = cantidad / 2;
                let rondaNum = 2;
                while (numPartidos > 1) {
                    const siguienteRondaPartidos = [];
                    for (let i = 0; i < numPartidos / 2; i++) {
                        siguienteRondaPartidos.push({
                            equipo1: 'Por definir',
                            tag1: 'TBD',
                            equipo2: 'Por definir',
                            tag2: 'TBD',
                            resultado: 'VS',
                            llave: `LLAVE ${cantidad / 2 + (rondaNum - 2) * (cantidad / 4) + i + 1}` // Ajuste en la numeración de llaves
                        });
                    }
                    bracketData[0].rondas.push({ ronda: `Ronda ${rondaNum}`, partidos: siguienteRondaPartidos });
                    numPartidos /= 2;
                    rondaNum++;
                }
            }

            mostrarBracket();
            localStorage.setItem('bracketData', JSON.stringify(bracketData));
        }

function generarSiguienteRonda(equiposEnRonda) {
    const partidos = [];
    let llaveCounter = 0;
    bracketData[0].rondas.forEach(ronda => {
        if (ronda.partidos) {
            ronda.partidos.forEach(partido => {
                if (partido.llave && partido.llave.startsWith('LLAVE')) {
                    llaveCounter = Math.max(llaveCounter, parseInt(partido.llave.split(' ')[1]));
                }
            });
        }
    });

    for (let i = 0; i < equiposEnRonda / 2; i++) {
        partidos.push({
            equipo1: "Por definir",
            tag1: "TBD",
            equipo2: "Por definir",
            tag2: "TBD",
            resultado: "VS",
            llave: `LLAVE ${llaveCounter + 1 + i}`
        });
    }
    return partidos;
}

function mostrarBracket() {
    console.log('mostrarBracket ejecutada');
            crudContainer.innerHTML = '';
            const tournamentBracket = document.createElement('div');
            tournamentBracket.classList.add('tournament-bracket');

            bracketData[0].rondas.forEach((ronda, indexRonda) => {
                const roundDiv = document.createElement('div');
                roundDiv.classList.add('tournament-bracket__round');

                const roundTitle = document.createElement('h3');
                roundTitle.classList.add('tournament-bracket__round-title');
                roundTitle.textContent = ronda.ronda;
                roundDiv.appendChild(roundTitle);

                const matchList = document.createElement('ul');
                matchList.classList.add('tournament-bracket__list');

                ronda.partidos.forEach((partido, indexPartido) => {
                    const matchItem = document.createElement('li');
                    matchItem.classList.add('tournament-bracket__item');

                    const matchDiv = document.createElement('div');
                    matchDiv.classList.add('tournament-bracket__match', 'cursor-pointer');
                    matchDiv.dataset.rondaIndex = indexRonda;
                    matchDiv.dataset.partidoIndex = indexPartido;
                    matchDiv.addEventListener('click', function() {
                        const rondaIndex = parseInt(this.dataset.rondaIndex);
                        const partidoIndex = parseInt(this.dataset.partidoIndex);
                        mostrarModalResultadoPartido(rondaIndex, partidoIndex);
                    });
                    matchDiv.setAttribute('tabindex', '0');

                    const fechaFormateada = partido.fecha ? new Date(partido.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }).toUpperCase() : 'DD MMM';
                    const horaFormateada = partido.hora || 'HH:MM';

                    matchDiv.innerHTML = `
                        <div class="bracket-round-final">
                            <img src="/assets/logos/LIGA-INDIGO-ALT.webp" alt="${partido.equipo1}" class="img-fluid">
                            </div>
                            <div class="round-titles">
                                <div class="card-round-equipoLocal"><h6 class="equipoLocal">${partido.equipo1}</h6></div>
                                <div class="card-round-promo mx-1 text-center">
                                    <span class="llave">${partido.llave}</span>
                                    <span>${fechaFormateada}</span>
                                    <h6>${partido.resultado}</h6>
                                    <span>${horaFormateada}</span>
                                    <span class="info">1O-4H</span>
                                </div>
                                <div class="card-round-equipoVisitante"><h6 class="equipoVisitante">${partido.equipo2}</h6></div>
                            </div>
                            <div class="bracket-round-team-right">
                         
                            <img src="/assets/logos/LIGA-INDIGO-ALT.webp" alt="${partido.equipo2}" class="img-fluid">
                           
                            </div>
                            <div class="card-back">
                                <div class="card-color-left bg-cham"></div>
                                <div class="card-color-right bg-cham"></div>
                            </div>
                        </div>
                    `;
                    matchItem.appendChild(matchDiv);
                    matchList.appendChild(matchItem);
                });
                roundDiv.appendChild(matchList);
                tournamentBracket.appendChild(roundDiv);
            });

            crudContainer.appendChild(tournamentBracket);
        }
function mostrarModalResultadoPartido(rondaIndex, partidoIndex) {
            partidoSeleccionado = { rondaIndex, partidoIndex };
            const partido = bracketData[0].rondas[rondaIndex].partidos[partidoIndex];
            resultadoPartidoFormContainer.innerHTML = `
                <div class="container">
                    <h1>LLAVE ${partido.llave.split(' ')[1]}</h1>
                    <div class="mb-3">
                        <label for="fecha_partido" class="form-label">Fecha del Partido</label>
                        <input type="date" class="form-control" id="fecha_partido" value="${partido.fecha || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="hora_partido" class="form-label">Hora del Partido</label>
                        <input type="time" class="form-control" id="hora_partido" value="${partido.hora || ''}">
                    </div>
                    <div class="input-group mb-3">
                        <div class="input-group-text">
                            <input class="form-check-input mt-0" type="radio" name="ganador" value="${partido.equipo1}" aria-label="Radio button for ${partido.equipo1}">
                        </div>
                        <input type="text" class="form-control" aria-label="Text input with radio button" value="${partido.equipo1} (${partido.tag1})" disabled>
                        <input type="number" class="form-control marcador-input" aria-label="Marcador de ${partido.equipo1}" id="marcador_${partido.equipo1}" placeholder="Marcador">
                    </div>
                    <div class="input-group mb-3">
                        <div class="input-group-text">
                            <input class="form-check-input mt-0" type="radio" name="ganador" value="${partido.equipo2}" aria-label="Radio button for ${partido.equipo2}">
                        </div>
                        <input type="text" class="form-control" aria-label="Text input with radio button" value="${partido.equipo2} (${partido.tag2})" disabled>
                        <input type="number" class="form-control marcador-input" aria-label="Marcador de ${partido.equipo2}" id="marcador_${partido.equipo2}" placeholder="Marcador">
                    </div>
                    <div class="input-group mb-3">
                        <div class="input-group-text">
                            <input class="form-check-input mt-0" type="radio" name="ganador" value="DQ" aria-label="Radio button for DQ">
                        </div>
                        <input type="text" class="form-control" aria-label="Text input with radio button" value="DQ" disabled>
                        <select class="form-select" aria-label="Seleccionar ganador por DQ" id="ganador_dq" style="display: none;">
                            <option value="">-- Seleccionar Ganador --</option>
                            <option value="${partido.equipo1}">${partido.equipo1} (${partido.tag1})</option>
                            <option value="${partido.equipo2}">${partido.equipo2} (${partido.tag2})</option>
                        </select>
                    </div>
                    <button type="button" class="btn btn-primary" onclick="guardarPartido()">Guardar Partido</button>
                </div>
            `;
            resultadoPartidoModal.show();
            const radioDQ = document.querySelector('input[name="ganador"][value="DQ"]');
            const ganadorDQSelect = document.getElementById('ganador_dq');
            if (radioDQ) {
                radioDQ.addEventListener('change', function() {
                    ganadorDQSelect.style.display = this.checked ? 'block' : 'none';
                });
            }
        }

function guardarPartido() {
            if (partidoSeleccionado) {
                const rondaIndex = partidoSeleccionado.rondaIndex;
                const partidoIndex = partidoSeleccionado.partidoIndex;
                const partidoActual = bracketData[0].rondas[rondaIndex].partidos[partidoIndex];
                const ganadorRadio = document.querySelector('input[name="ganador"]:checked');
                const marcadorEquipo1 = document.getElementById(`marcador_${partidoActual.equipo1}`).value;
                const marcadorEquipo2 = document.getElementById(`marcador_${partidoActual.equipo2}`).value;
                const ganadorDQSelect = document.getElementById('ganador_dq');
                const fechaPartidoInput = document.getElementById('fecha_partido').value;
                const horaPartidoInput = document.getElementById('hora_partido').value;
                let ganadorInfo = null;

                partidoActual.fecha = fechaPartidoInput;
                partidoActual.hora = horaPartidoInput;

                if (ganadorRadio) {
                    if (ganadorRadio.value === partidoActual.equipo1) {
                        ganadorInfo = { equipo: partidoActual.equipo1, tag: partidoActual.tag1, llave: partidoActual.llave, resultado: `${marcadorEquipo1}-${marcadorEquipo2}` };
                        partidoActual.resultado = `${marcadorEquipo1}-${marcadorEquipo2}`;
                    } else if (ganadorRadio.value === partidoActual.equipo2) {
                        ganadorInfo = { equipo: partidoActual.equipo2, tag: partidoActual.tag2, llave: partidoActual.llave, resultado: `${marcadorEquipo1}-${marcadorEquipo2}` };
                        partidoActual.resultado = `${marcadorEquipo1}-${marcadorEquipo2}`;
                    } else if (ganadorRadio.value === 'DQ') {
                        const ganadorDQ = ganadorDQSelect.value;
                        if (ganadorDQ === partidoActual.equipo1) {
                            ganadorInfo = { equipo: partidoActual.equipo1, tag: partidoActual.tag1, llave: partidoActual.llave, resultado: 'DQ' };
                            partidoActual.resultado = 'DQ';
                        } else if (ganadorDQ === partidoActual.equipo2) {
                            ganadorInfo = { equipo: partidoActual.equipo2, tag: partidoActual.tag2, llave: partidoActual.llave, resultado: 'DQ' };
                            partidoActual.resultado = 'DQ';
                        } else {
                            alert('Por favor, selecciona el ganador por Descalificación.');
                            return;
                        }
                    }

                    if (ganadorInfo) {
                        determinarGanador(rondaIndex, partidoIndex, ganadorInfo);
                        mostrarBracket();
                        localStorage.setItem('bracketData', JSON.stringify(bracketData));
                        resultadoPartidoModal.hide();
                        partidoSeleccionado = null;
                    }
                } else {
                    mostrarBracket(); // Actualizar la visualización aunque no se haya seleccionado ganador (para mostrar fecha/hora editada)
                    localStorage.setItem('bracketData', JSON.stringify(bracketData));
                    resultadoPartidoModal.hide();
                    partidoSeleccionado = null;
                    // alert('Por favor, selecciona el ganador del partido.'); // Comentado para permitir guardar solo fecha/hora
                }
            }
        }

function determinarGanador(rondaIndex, partidoIndex, ganadorInfo) {
    const siguienteRondaIndex = rondaIndex + 1;
    if (siguienteRondaIndex < bracketData[0].rondas.length) {
        const partidoSiguienteIndex = Math.floor(partidoIndex / 2);
        if (bracketData[0].rondas[siguienteRondaIndex].partidos && bracketData[0].rondas[siguienteRondaIndex].partidos[partidoSiguienteIndex]) {
            if (partidoIndex % 2 === 0) {
                bracketData[0].rondas[siguienteRondaIndex].partidos[partidoSiguienteIndex].equipo1 = ganadorInfo.equipo;
                bracketData[0].rondas[siguienteRondaIndex].partidos[partidoSiguienteIndex].tag1 = ganadorInfo.tag;
                bracketData[0].rondas[siguienteRondaIndex].partidos[partidoSiguienteIndex].p1 = ganadorInfo.llave;
            } else {
                bracketData[0].rondas[siguienteRondaIndex].partidos[partidoSiguienteIndex].equipo2 = ganadorInfo.equipo;
                bracketData[0].rondas[siguienteRondaIndex].partidos[partidoSiguienteIndex].tag2 = ganadorInfo.tag;
                bracketData[0].rondas[siguienteRondaIndex].partidos[partidoSiguienteIndex].p2 = ganadorInfo.llave;
            }
        }
    } else if (siguienteRondaIndex === bracketData[0].rondas.length && bracketData[0].rondas[siguienteRondaIndex - 1].partidos[0]) {
        bracketData[0].rondas[siguienteRondaIndex - 1].partidos[0].equipo1 = ganadorInfo.equipo;
        bracketData[0].rondas[siguienteRondaIndex - 1].partidos[0].tag1 = ganadorInfo.tag;
    }
}

function descargarJSON() {
    const jsonStr = JSON.stringify(bracketData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bracket_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetBracket() {
    localStorage.removeItem('cantidadEquiposSeleccionada');
    localStorage.removeItem('equiposIniciales');
    localStorage.removeItem('bracketData');

    // Limpiar el contenido del bracket y la lista de equipos
    crudContainer.innerHTML = '';
    listaEquiposContainer.innerHTML = '';

    // Mostrar el modal principal para seleccionar la cantidad de equipos
    cantidadEquiposModal.show();
}