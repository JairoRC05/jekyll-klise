let cantidadEquiposSeleccionada = 0;
let equiposIniciales = [];
let equiposInicialesCreados = false;
let bracketData = [];

let configuracionTorneoDiv;
let infoTorneoDiv;
let tituloTorneoInput;
let organizadorTorneoInput;
let tituloTorneoMostradoSpan;
let organizadorMostradoSpan;
const cantidadEquiposSelect = document.getElementById('cantidadEquipos');
const agregarEquiposModalElement = document.getElementById('agregarEquiposModal');
const equiposFormContainer = document.getElementById('equipos-form-container');
const listaEquiposContainer = document.getElementById('lista-equipos');

const agregarEquiposModal = new bootstrap.Modal(agregarEquiposModalElement);

const editarEquipoModalElement = document.getElementById('editarEquipoModal');
const editarEquipoModal = new bootstrap.Modal(editarEquipoModalElement);
const editNombreModalInput = document.getElementById('edit-nombre-modal');
const editTagModalInput = document.getElementById('edit-tag-modal');
const equipoIdEditandoInput = document.getElementById('equipo-id-editando');
const equiposCreadosContainer = document.getElementById('equipos-creados-container');


const editarPartidoModalElement = document.getElementById('editarPartidoModal');
const editarPartidoModal = new bootstrap.Modal(editarPartidoModalElement);
const equipo1Btn = document.getElementById('equipo1-btn');
const equipo2Btn = document.getElementById('equipo2-btn');
const partidoRondaIndexInput = document.getElementById('partido-ronda-index');
const partidoIndexInput = document.getElementById('partido-index');
// const ganadorIdSeleccionadoInput = document.getElementById('ganador-id-seleccionado');

// Opcional: Para marcadores
const score1Input = document.getElementById('score1');
const score2Input = document.getElementById('score2');
const labelScore1Equipo = document.getElementById('label-score1-equipo');
const labelScore2Equipo = document.getElementById('label-score2-equipo');
const dqBtn = document.getElementById('dq-btn');
const dqEquipoIdInput = document.getElementById('dq-equipo-id');
const partidoEquipo1IdInput = document.getElementById('partido-equipo1-id');
const partidoEquipo2IdInput = document.getElementById('partido-equipo2-id');

// Mostrar el modal de cantidad de equipos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    configuracionTorneoDiv = document.getElementById('configuracion-torneo');
    infoTorneoDiv = document.getElementById('info-torneo');
    tituloTorneoInput = document.getElementById('tituloTorneo');
    organizadorTorneoInput = document.getElementById('organizadorTorneo');
    tituloTorneoMostradoSpan = document.getElementById('titulo-torneo-mostrado');
    organizadorMostradoSpan = document.getElementById('organizador-mostrado');
});

function mostrarFormularioEditarEquipo(equipoId) {
    const equipo = equiposIniciales.find(eq => eq.id === equipoId);
    if (equipo) {
        editNombreModalInput.value = equipo.nombre;
        editTagModalInput.value = equipo.tag;
        equipoIdEditandoInput.value = equipoId;
        editarEquipoModal.show();
    }
}

function iniciarCreacionBracket() {
    console.log('iniciarCreacionBracket ejecutada');
    const titulo = tituloTorneoInput.value.trim();
    const organizador = organizadorTorneoInput.value.trim();
    cantidadEquiposSeleccionada = parseInt(cantidadEquiposSelect.value);

    if (titulo) {
        tituloTorneoMostradoSpan.textContent = titulo;
        infoTorneoDiv.style.display = 'block';
    }
    if (organizador) {
        organizadorMostradoSpan.textContent = organizador;
        infoTorneoDiv.style.display = 'block';
    }

    configuracionTorneoDiv.style.display = 'none';
    equiposCreadosContainer.style.display = 'grid';

    // Crear equipos genéricos con sus IDs originales
    equiposIniciales = []; // Reiniciar la lista de equipos iniciales
    for (let i = 1; i <= cantidadEquiposSeleccionada; i++) {
        equiposIniciales.push({ id: i, nombre: `Equipo ${i}`, tag: `E${i}` });
    }
    console.log('equiposIniciales genéricos:', equiposIniciales);

    actualizarListaEquipos();

    // === CAMBIO CLAVE AQUÍ ===
    // Llamar a generarBracketConOrden y capturar el bracketData generado
    bracketData = generarBracketConOrden(equiposIniciales); // Asigna a la variable global 'bracketData'

    // Ahora, llama a mostrarBracket pasando el 'bracketData'
    mostrarBracket(bracketData);
    // ========================
}

// NUEVA FUNCIÓN: genera la estructura del bracket basada en un array de equipos ya ordenado para la primera ronda
// La variable global 'bracketData' ya no se usa aquí directamente,
// se devolverá el objeto y se asignará en 'iniciarCreacionBracket'.

function generarBracketConOrden(equiposOrdenadosParaRonda1) {
    console.log('generarBracketConOrden llamada con equipos:', equiposOrdenadosParaRonda1.map(e => e.nombre));
    const cantidad = equiposOrdenadosParaRonda1.length;
    const numRondas = Math.ceil(Math.log2(cantidad));

    let localBracketData = []; // Usamos una variable local para construirlo

    // Nombres de las rondas dinámicos (ajusta según tu preferencia)
    const getRoundName = (roundNumber, totalRounds, numMatchesInRound) => {
        if (totalRounds === 1) return "Final"; // Para torneos de 2 equipos
        if (roundNumber === 0) { // Primera ronda
            if (cantidad === 4) return "Semifinales";
            if (cantidad === 8) return "Cuartos de Final";
            if (cantidad === 16) return "Octavos de Final";
            if (cantidad === 32) return "Dieciseisavos de Final";
            return `Ronda de ${cantidad}`; // Fallback genérico
        }
        if (roundNumber === totalRounds - 1) return "Final";
        if (roundNumber === totalRounds - 2 && totalRounds > 2) return "Semifinales";
        if (roundNumber === totalRounds - 3 && totalRounds > 3) return "Cuartos de Final";
        // Puedes agregar más lógica aquí si necesitas nombres específicos para otras rondas intermedias
        return `Ronda ${roundNumber + 1}`;
    };


    // Crear la PRIMERA RONDA con los equipos ya ordenados
    const primeraRonda = {
        nombre: getRoundName(0, numRondas, Math.floor(cantidad / 2)), // Asignar nombre a la primera ronda
        partidos: []
    };
    for (let j = 0; j < Math.floor(cantidad / 2); j++) {
        const equipo1 = equiposOrdenadosParaRonda1[j * 2];
        const equipo2 = equiposOrdenadosParaRonda1[j * 2 + 1];

        primeraRonda.partidos.push({
            equipo1Ref: equipo1 ? { id: equipo1.id } : null,
            equipo2Ref: equipo2 ? { id: equipo2.id } : null,
            ganadorRef: null,
            score1: null,
            score2: null,
            dqEquipoRef: null
        });
    }
    localBracketData.push(primeraRonda);

    // Generar las RONDAS RESTANTES con TBDs
    let partidosRondaAnterior = primeraRonda.partidos.length;
    for (let i = 1; i < numRondas; i++) {
        const numPartidosEnEstaRonda = Math.ceil(partidosRondaAnterior / 2);
        const ronda = {
            nombre: getRoundName(i, numRondas, numPartidosEnEstaRonda), // Asignar nombre a cada ronda
            partidos: []
        };

        for (let j = 0; j < numPartidosEnEstaRonda; j++) {
            ronda.partidos.push({
                equipo1Ref: null, // Inicialmente TBD
                equipo2Ref: null, // Inicialmente TBD
                ganadorRef: null,
                score1: null,
                score2: null,
                dqEquipoRef: null
            });
        }
        localBracketData.push(ronda);
        partidosRondaAnterior = numPartidosEnEstaRonda;
    }

    console.log('bracketData completa:', localBracketData);
    // IMPORTANTE: Devolver el bracketData
    return localBracketData;
}

function guardarEquiposIniciales() {
    console.log('guardarEquiposIniciales ejecutada');
    equiposIniciales = [];
    for (let i = 1; i <= cantidadEquiposSeleccionada; i++) {
        const nombre = document.getElementById(`equipo_nombre_${i}`).value.trim();
        const tag = document.getElementById(`equipo_tag_${i}`).value.trim().toUpperCase();
        if (nombre) {
            equiposIniciales.push({ nombre, tag });
        } else {
            alert('Por favor, ingresa el nombre de todos los equipos.');
            return;
        }
    }
    console.log('equiposIniciales:', equiposIniciales);
    actualizarListaEquipos();
    agregarEquiposModal.hide();
    const backdrop = document.querySelector('.modal-backdrop.fade.show');
    if (backdrop) {
        backdrop.remove();
    }
    equiposInicialesCreados = true;
}


function generarFormularioEquiposIniciales(cantidad) {
    console.log('generarFormularioEquiposIniciales llamada con cantidad:', cantidad);
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

function actualizarListaEquipos() {
    console.log('actualizarListaEquipos ejecutada');
    listaEquiposContainer.innerHTML = '';
    equiposIniciales.forEach(equipo => {
        const listItem = document.createElement('div');
        listItem.classList.add('equipo-item', 'd-flex', 'align-items-center', 'mb-2');

        const equipoSpan = document.createElement('span');
        equipoSpan.classList.add('equipo-nombre', 'badge', 'bg-secondary', 'me-2', 'mb-0', 'text-white', 'p-2', 'rounded', 'cursor-pointer'); // Añadimos cursor-pointer para indicar que es clickable
        equipoSpan.textContent = equipo.nombre;
        equipoSpan.addEventListener('click', () => mostrarFormularioEditarEquipo(equipo.id)); // Mostrar modal al hacer clic en el nombre

        // Ya no necesitamos el botón "Editar"
        // const editButton = document.createElement('button');
        // editButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'ms-2');
        // editButton.textContent = 'Editar';
        // editButton.addEventListener('click', () => mostrarFormularioEditarEquipo(equipo.id));

        listItem.appendChild(equipoSpan);
        // listItem.appendChild(editButton); // Removemos el botón
        listaEquiposContainer.appendChild(listItem);
    });
}

function iniciarEdicionEnLinea(event, equipoId, campo) {
    const elemento = event.target;
    const originalTexto = elemento.textContent;
    elemento.contentEditable = true;
    elemento.classList.add('editing');
    elemento.focus();

    elemento.addEventListener('blur', (event) => guardarEdicionEnLinea(event, equipoId, campo, originalTexto));
    elemento.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            elemento.blur();
        } else if (event.key === 'Escape') {
            elemento.textContent = originalTexto;
            elemento.blur();
        }
    });
}

function guardarEdicionEquipoDesdeModal() {
    const equipoId = parseInt(equipoIdEditandoInput.value);
    const nuevoNombre = editNombreModalInput.value.trim();
    const nuevoTag = editTagModalInput.value.trim().toUpperCase();

    if (nuevoNombre.length > 20) {
        alert('El nombre del equipo no puede tener más de 20 caracteres.');
        return;
    }

    if (nuevoTag.length > 5) {
        alert('El tag del equipo no puede tener más de 5 caracteres.');
        return;
    }

    const resultadoGuardado = guardarEdicionEquipo(equipoId, nuevoNombre, nuevoTag);
    if (resultadoGuardado) {
        editarEquipoModal.hide();
    }
}

function guardarEdicionEquipo(equipoId, nuevoNombre, nuevoTag) {
    const equipoIndex = equiposIniciales.findIndex(eq => eq.id === equipoId);
    if (equipoIndex !== -1) {
        equiposIniciales[equipoIndex].nombre = nuevoNombre;
        equiposIniciales[equipoIndex].tag = nuevoTag;
        console.log('equiposIniciales actualizado:', equiposIniciales);
        actualizarListaEquipos();
        // Llamar a mostrarBracket con el bracketData actual
        mostrarBracket(bracketData); // Asegúrate de pasar bracketData
        return true;
    }
    return false;
}


function mostrarBracket(currentBracketData) { // Renombrado a currentBracketData para claridad
    // Crear un mapa de equipos para resolver los IDs a nombres
    const equipoMap = new Map(equiposIniciales.map(equipo => [equipo.id, equipo]));

    // === PASO CLAVE 1: Calcular initialTeamsCount ===
    if (!currentBracketData || currentBracketData.length === 0 || !currentBracketData[0].partidos) {
        console.error("mostrarBracket: currentBracketData no es válido o está vacío. No se puede determinar initialTeamsCount.");
        return;
    }
    const initialTeamsCount = currentBracketData[0].partidos.length * 2;
    // ==================================================

    const tournamentBracketDiv = document.querySelector('.tournament-bracket');
    if (!tournamentBracketDiv) {
        console.error("mostrarBracket: Elemento .tournament-bracket no encontrado.");
        return;
    }
    tournamentBracketDiv.innerHTML = '';

    currentBracketData.forEach((ronda, indexRonda) => {
        const roundDiv = document.createElement('div');
        roundDiv.classList.add('tournament-bracket__round');

        const roundTitle = document.createElement('h3');
        roundTitle.classList.add('tournament-bracket__round-title');
        // Asegúrate de que ronda.nombre exista
        roundTitle.textContent = ronda.nombre || `Ronda ${indexRonda + 1}`;
        roundDiv.appendChild(roundTitle);

        const matchesList = document.createElement('ul');
        matchesList.classList.add('tournament-bracket__list');

        ronda.partidos.forEach((partido, indexPartido) => {
            const matchItem = document.createElement('li');
            matchItem.classList.add('tournament-bracket__item');

            const matchDiv = document.createElement('div');
            matchDiv.classList.add('tournament-bracket__match');

            // === PASO CLAVE 2: Crear y añadir el span.bracket-key-number ===
            const keyNumberSpan = document.createElement('span');
            keyNumberSpan.classList.add('bracket-key-number');
            keyNumberSpan.textContent = getBracketKeyText(indexRonda, indexPartido, initialTeamsCount);
            matchDiv.appendChild(keyNumberSpan);
            // ===============================================================

            const matchCardDiv = document.createElement('div');
            matchCardDiv.classList.add('tournament-bracket__match__card');
            matchCardDiv.classList.add('cursor-pointer');

            // Añadir listener para abrir modal de partido
            matchCardDiv.addEventListener('click', () => abrirModalPartido(indexRonda, indexPartido));

            // === CAMBIO CLAVE AQUÍ: RESOLVER EQUIPOS POR ID ===
            // Obtener el objeto completo del equipo usando el ID de la referencia
            const equipo1Actual = partido.equipo1Ref ? equipoMap.get(partido.equipo1Ref.id) : null;
            const equipo2Actual = partido.equipo2Ref ? equipoMap.get(partido.equipo2Ref.id) : null;

            // Mostrar el nombre del equipo o "TBD" si no está definido
            const equipo1NombreMostrar = equipo1Actual ? equipo1Actual.nombre : 'TBD';
            const equipo2NombreMostrar = equipo2Actual ? equipo2Actual.nombre : 'TBD';

            const equipo1Div = document.createElement('div');
            equipo1Div.classList.add('card-round-equipo');
            const equipo1NombreElem = document.createElement('h6');
            equipo1NombreElem.classList.add('equipo-nombre');
            equipo1NombreElem.textContent = equipo1NombreMostrar;

            // Lógica para resaltar ganador y DQ usando los IDs de las referencias
            if (partido.ganadorRef && equipo1Actual && partido.ganadorRef === equipo1Actual.id) {
                equipo1NombreElem.classList.add('ganador');
            }
            if (partido.dqEquipoRef && equipo1Actual && partido.dqEquipoRef === equipo1Actual.id) {
                equipo1Div.classList.add('dq-equipo');
                equipo1NombreElem.classList.add('dq-text');
            }
            equipo1Div.appendChild(equipo1NombreElem);
            matchCardDiv.appendChild(equipo1Div);

            const promoDiv = document.createElement('div');
            promoDiv.classList.add('card-round-promo');
            promoDiv.textContent = 'VS';
            matchCardDiv.appendChild(promoDiv);

            const equipo2Div = document.createElement('div');
            equipo2Div.classList.add('card-round-equipo');
            const equipo2NombreElem = document.createElement('h6');
            equipo2NombreElem.classList.add('equipo-nombre');
            equipo2NombreElem.textContent = equipo2NombreMostrar;

            if (partido.ganadorRef && equipo2Actual && partido.ganadorRef === equipo2Actual.id) {
                equipo2NombreElem.classList.add('ganador');
            }
            if (partido.dqEquipoRef && equipo2Actual && partido.dqEquipoRef === equipo2Actual.id) {
                equipo2Div.classList.add('dq-equipo');
                equipo2NombreElem.classList.add('dq-text');
            }
            equipo2Div.appendChild(equipo2NombreElem);
            matchCardDiv.appendChild(equipo2Div);

            // Mostrar marcador si está disponible
            if (partido.score1 !== null && partido.score2 !== null) {
                promoDiv.innerHTML = `<span class="match-score-inline">${partido.score1}</span>-<span class="match-score-inline">${partido.score2}</span>`;
                matchCardDiv.classList.add('partido-resuelto');
            }
            // =======================================================================

            matchDiv.appendChild(matchCardDiv);
            matchItem.appendChild(matchDiv);
            matchesList.appendChild(matchItem);
        });

        roundDiv.appendChild(matchesList);
        tournamentBracketDiv.appendChild(roundDiv);
    });
}


const patronesLlavesPorCantidadEquipos = {
    8: { // Para 8 equipos (3 rondas)
        0: (indexPartido) => `LLAVE ${indexPartido + 1}`, // Ronda 0 (Cuartos)
        1: (indexPartido) => { // Ronda 1 (Semifinales)
            if (indexPartido === 0) return 'LLAVE 5 (Gana 1-2)'; // O 'LLAVE 5 (Ganador LLAVE 1-2)'
            if (indexPartido === 1) return 'LLAVE 6 (Gana 3-4)'; // O 'LLAVE 6 (Ganador LLAVE 3-4)'
            return `LLAVE ${5 + indexPartido}`; // Fallback si hay más partidos
        },
        2: (indexPartido) => { // Ronda 2 (Final)
            return 'LLAVE 7 (Gana 5-6)'; // O 'FINAL (Ganador LLAVE 5-6)'
        }
    },
    // Añade más configuraciones si tienes otros tamaños de bracket
    4: { // Para 4 equipos (2 rondas)
        0: (indexPartido) => `LLAVE ${indexPartido + 1}`, // Ronda 0 (Semifinales)
        1: (indexPartido) => 'LLAVE 3 (Gana 1-2)' // Ronda 1 (Final)
    },
    16: { // Para 16 equipos (4 rondas)
        0: (indexPartido) => `LLAVE ${indexPartido + 1}`, // Ronda 0 (Octavos)
        1: (indexPartido) => { // Ronda 1 (Cuartos)
             const startKey = (indexPartido * 4) + 1;
             const endKey = startKey + 3;
             return `LLAVE ${9 + indexPartido} (Gana ${startKey}-${endKey})`;
        },
        2: (indexPartido) => { // Ronda 2 (Semifinales)
            const baseLlave = 9 + 4; // Total de llaves en Octavos + Cuartos (8+4)
            const startKey = (indexPartido * 8) + 1;
            const endKey = startKey + 7;
            return `LLAVE ${baseLlave + 1 + indexPartido} (Gana ${startKey}-${endKey})`;
        },
        3: (indexPartido) => 'LLAVE 15 (Gana 1-8)' // Ronda 3 (Final)
    }
};


function getBracketKeyText(indexRonda, indexPartido, initialTeamsCount) {
    // Busca los patrones de llaves para la cantidad de equipos actual
    const patronesParaCantidad = patronesLlavesPorCantidadEquipos[initialTeamsCount];

    if (patronesParaCantidad && patronesParaCantidad[indexRonda]) {
        // Si hay un patrón definido para esta ronda y cantidad de equipos, úsalo
        return patronesParaCantidad[indexRonda](indexPartido);
    } else {
        // Fallback genérico si no hay un patrón específico para esta configuración
        // Esto es útil para cantidades de equipos no definidas en el objeto
        const totalPlayableRounds = Math.log2(initialTeamsCount);
        let keyText = '';
        let partidosAcumuladosAnteriores = 0;
        // Calcular el número total de partidos hasta el inicio de esta ronda
        for (let i = 0; i < indexRonda; i++) {
            partidosAcumuladosAnteriores += Math.pow(2, totalPlayableRounds - (i + 1));
        }

        if (indexRonda === totalPlayableRounds - 1) { // Última ronda
            keyText = `FINAL (LLAVES 1-${initialTeamsCount})`;
        } else {
            keyText = `LLAVE ${partidosAcumuladosAnteriores + indexPartido + 1}`;
        }
        return keyText;
    }
}   


function abrirModalPartido(rondaIndex, partidoIndex) {
    const partido = bracketData[rondaIndex].partidos[partidoIndex];

    // Si los equipos aún no están definidos (es un TBD), no se puede abrir el modal
    if (!partido.equipo1Ref || !partido.equipo2Ref) {
        alert('Este partido aún no tiene equipos definidos para jugar.');
        return;
    }

    // Buscar los equipos completos en la lista global 'equiposIniciales'
    const equipo1Info = equiposIniciales.find(equipo => equipo.id === partido.equipo1Ref.id);
    const equipo2Info = equiposIniciales.find(equipo => equipo.id === partido.equipo2Ref.id);

    if (!equipo1Info || !equipo2Info) {
        alert('Error: No se encontró información completa de los equipos para este partido.');
        return;
    }

    labelScore1Equipo.textContent = equipo1Info.nombre;
    labelScore2Equipo.textContent = equipo2Info.nombre;

    partidoEquipo1IdInput.value = equipo1Info.id;
    partidoEquipo2IdInput.value = equipo2Info.id;

    dqEquipoIdInput.value = partido.dqEquipoRef || ''; // Cargar DQ existente

    score1Input.value = partido.score1 !== null ? partido.score1 : 0;
    score2Input.value = partido.score2 !== null ? partido.score2 : 0;

    // Configurar listener para el botón DQ (alternar DQ)
    dqBtn.onclick = () => {
        let currentDqId = parseInt(dqEquipoIdInput.value);
        let newDqId = null;

        if (isNaN(currentDqId)) { // Si no hay DQ, descalifica al equipo 1
            newDqId = equipo1Info.id;
        } else if (currentDqId === equipo1Info.id) { // Si Equipo 1 está DQ, cambia a Equipo 2
            newDqId = equipo2Info.id;
        } else if (currentDqId === equipo2Info.id) { // Si Equipo 2 está DQ, quita el DQ
            newDqId = ''; // O null
        }
        dqEquipoIdInput.value = newDqId; // Actualiza el campo oculto
        actualizarBotonDQVisual(equipo1Info, equipo2Info); // Actualiza el texto/estilo del botón
    };

    // Actualizar el estilo del botón DQ al abrir el modal
    actualizarBotonDQVisual(equipo1Info, equipo2Info);


    partidoRondaIndexInput.value = rondaIndex;
    partidoIndexInput.value = partidoIndex;

    editarPartidoModal.show();
}


function actualizarBotonDQVisual(equipo1Info, equipo2Info) {
    const currentDqId = parseInt(dqEquipoIdInput.value);
    dqBtn.classList.remove('btn-danger', 'btn-warning');

    if (currentDqId === equipo1Info.id) {
        dqBtn.textContent = `Descalificar ${equipo2Info.nombre} (Cambiar a Ganador)`;
        dqBtn.classList.add('btn-danger'); // Equipo 1 descalificado
    } else if (currentDqId === equipo2Info.id) {
        dqBtn.textContent = `Descalificar ${equipo1Info.nombre} (Cambiar a Ganador)`;
        dqBtn.classList.add('btn-danger'); // Equipo 2 descalificado
    } else {
        dqBtn.textContent = 'Descalificar Equipo';
        dqBtn.classList.add('btn-warning'); // Sin DQ
    }
}



function seleccionarDQModal(dqId) {
    dqEquipoIdInput.value = dqId;
    // La lógica de resaltado de botones ahora se maneja en actualizarBotonDQVisual
}

function confirmarGanadorPartido() {
    const rondaIndex = parseInt(partidoRondaIndexInput.value);
    const partidoIndex = parseInt(partidoIndexInput.value);
    const partido = bracketData[rondaIndex].partidos[partidoIndex];

    const equipo1Id = parseInt(partidoEquipo1IdInput.value);
    const equipo2Id = parseInt(partidoEquipo2IdInput.value);

    let ganadorId = null;
    let dqEquipoId = parseInt(dqEquipoIdInput.value);

    const score1 = parseInt(score1Input.value);
    const score2 = parseInt(score2Input.value);

    if (isNaN(score1) || isNaN(score2)) {
        alert('Por favor, ingresa marcadores válidos (números).');
        return;
    }

    if (dqEquipoId) {
        if (dqEquipoId === equipo1Id) {
            ganadorId = equipo2Id;
        } else if (dqEquipoId === equipo2Id) {
            ganadorId = equipo1Id;
        }
    } else {
        if (score1 > score2) {
            ganadorId = equipo1Id;
        } else if (score2 > score1) {
            ganadorId = equipo2Id;
        } else {
            alert('El marcador es un empate. Por favor, descalifica a un equipo para resolver el partido.');
            return;
        }
    }

    if (!ganadorId && !dqEquipoId) {
        alert('No se pudo determinar el ganador del partido. Verifica los marcadores o descalifica un equipo.');
        return;
    }

    partido.ganadorRef = ganadorId;
    partido.score1 = score1;
    partido.score2 = score2;
    partido.dqEquipoRef = dqEquipoId || null;

    console.log(`Partido [${rondaIndex}][${partidoIndex}] actualizado. Ganador: ${ganadorId}, Marcador: ${score1}-${score2}, DQ: ${dqEquipoId}`);

    if (ganadorId) {
        propagarGanador(rondaIndex, partidoIndex, ganadorId);
    } else {
        propagarGanador(rondaIndex, partidoIndex, null);
    }

    editarPartidoModal.hide();
    mostrarBracket(bracketData); // Asegúrate de pasar bracketData
}

function propagarGanador(rondaIndex, partidoIndex, ganadorId) {
    // Si no es la última ronda
    if (rondaIndex < bracketData.length - 1) {
        const siguienteRondaIndex = rondaIndex + 1;
        const siguienteRonda = bracketData[siguienteRondaIndex];

        // Calcular el índice del partido en la siguiente ronda
        const siguientePartidoIndex = Math.floor(partidoIndex / 2);

        // Determinar si el ganador va a la posición 1 (equipo1Ref) o 2 (equipo2Ref) en el siguiente partido
        const posicionEnSiguientePartido = partidoIndex % 2 === 0 ? 'equipo1Ref' : 'equipo2Ref';

        // Asegurarse de que la siguiente ronda y partido existan
        if (siguienteRonda && siguienteRonda.partidos[siguientePartidoIndex]) {
            // Actualizar la referencia del equipo en el siguiente partido
            siguienteRonda.partidos[siguientePartidoIndex][posicionEnSiguientePartido] = { id: ganadorId };
            console.log(`Propagado: Equipo ID ${ganadorId} avanza al partido ${siguientePartidoIndex} de la Ronda ${siguienteRondaIndex}.`);
        } else {
            console.warn(`No se pudo propagar: Siguiente ronda o partido no encontrado. Ronda: ${siguienteRondaIndex}, Partido: ${siguientePartidoIndex}`);
        }
    } else {
        console.log(`Torneo finalizado. Ganador absoluto: ${ganadorId}`);
        // Aquí podrías mostrar un mensaje de campeón
    }
}



// La función que se llama desde el botón "Bracket Original"
function generarBracket(cantidad) {
    console.log('generarBracket (original) llamada');
    // Los equipos iniciales ya están en el orden original por defecto
    generarBracketConOrden(equiposIniciales);
}

function generarBracketCruzado() {
    console.log('generarBracketCruzado ejecutada');
    if (equiposIniciales.length < 2) {
        alert('Se necesitan al menos 2 equipos para generar un bracket.');
        return;
    }

    const cantidad = equiposIniciales.length;
    const equiposOrdenadosCruzado = [];

    // Emparejamiento cruzado: 1 vs último, 2 vs penúltimo, etc.
    for (let i = 0; i < Math.floor(cantidad / 2); i++) {
        equiposOrdenadosCruzado.push(equiposIniciales[i]); // Equipo de la izquierda
        equiposOrdenadosCruzado.push(equiposIniciales[cantidad - 1 - i]); // Equipo de la derecha
    }

    // Si hay un número impar de equipos (y un bye), el del medio va solo en la primera ronda.
    // Esto es un poco más complejo y podría necesitar una ronda preliminar o un bye explícito.
    // Por ahora, asumimos potencias de 2 para simplificar la primera ronda.
    // Si la cantidad es impar, el último equipo podría quedar sin emparejar.
    if (cantidad % 2 !== 0) {
        // Manejo de byes o equipo impar
        // Por ahora, lo dejamos simple, pero si necesitas byes explícitos, avísame.
        console.warn("Manejo de número impar de equipos en bracket cruzado no implementado completamente.");
        // equiposOrdenadosCruzado.push(equiposIniciales[Math.floor(cantidad / 2)]); // El equipo del medio
    }

    generarBracketConOrden(equiposOrdenadosCruzado);
}

function generarBracketAleatorio() {
    console.log('generarBracketAleatorio ejecutada');
    if (equiposIniciales.length < 2) {
        alert('Se necesitan al menos 2 equipos para generar un bracket.');
        return;
    }

    const equiposMezclados = shuffleArray([...equiposIniciales]); // Mezclar una COPIA

    // Si hay un número impar de equipos, asegúrate de manejarlo aquí también si es necesario
    // Por ahora, asumimos potencias de 2 para simplificar.

    generarBracketConOrden(equiposMezclados);
}

// Mantener la función shuffleArray
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
