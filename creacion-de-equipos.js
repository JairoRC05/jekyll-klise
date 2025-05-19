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
    console.log('cantidadEquiposSeleccionada:', cantidadEquiposSeleccionada);

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

    // Crear equipos genéricos (esto sigue siendo necesario para la lista editable)
    equiposIniciales = [];
    for (let i = 1; i <= cantidadEquiposSeleccionada; i++) {
        equiposIniciales.push({ id: i, nombre: `Equipo ${i}`, tag: `E${i}` });
    }
    console.log('equiposIniciales genéricos:', equiposIniciales);

    actualizarListaEquipos();
    generarEstructuraBracket(cantidadEquiposSeleccionada); // Llama a generarBracket con la cantidad
    // mostrarBracket(); // Ya se llama dentro de generarBracket
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
        mostrarBracket(); // Asegúrate de que esta función esté definida
        return true;
    }
    return false;
}

function mostrarBracket() {
    const bracketContainer = document.getElementById('bracket-container');
    bracketContainer.innerHTML = '';

    if (!bracketData || bracketData.length === 0) {
        bracketContainer.textContent = 'El bracket aún no se ha generado.';
        return;
    }

    const tournamentBracket = document.createElement('div');
    tournamentBracket.classList.add('tournament-bracket');

    bracketData.forEach((ronda, indexRonda) => {
        const roundDiv = document.createElement('div');
        roundDiv.classList.add('tournament-bracket__round');

        const roundTitle = document.createElement('h3');
        roundTitle.classList.add('tournament-bracket__round-title');
        roundTitle.textContent = `Ronda ${indexRonda + 1}`;
        roundDiv.appendChild(roundTitle);

        const matchesList = document.createElement('ul');
        matchesList.classList.add('tournament-bracket__list');

        ronda.partidos.forEach(partido => {
            const matchItem = document.createElement('li');
            matchItem.classList.add('tournament-bracket__item');

            const matchDiv = document.createElement('div');
            matchDiv.classList.add('tournament-bracket__match');

            const equipo1Info = equiposIniciales.find(equipo => equipo.id === partido.equipo1Ref?.id);
            const equipo2Info = equiposIniciales.find(equipo => equipo.id === partido.equipo2Ref?.id);

            const equipo1Div = document.createElement('div');
            equipo1Div.classList.add('card-round-equipoLocal');
            equipo1Div.innerHTML = `<h6 class="equipoLocal">${equipo1Info ? equipo1Info.nombre : 'TBD'}</h6>`;

            const vsDiv = document.createElement('div');
            vsDiv.classList.add('card-round-promo', 'mx-1', 'text-center');
            vsDiv.textContent = 'VS';

            const equipo2Div = document.createElement('div');
            equipo2Div.classList.add('card-round-equipoVisitante');
            equipo2Div.innerHTML = `<h6 class="equipoVisitante">${equipo2Info ? equipo2Info.nombre : 'TBD'}</h6>`;

            matchDiv.appendChild(equipo1Div);
            matchDiv.appendChild(vsDiv);
            matchDiv.appendChild(equipo2Div);
            matchItem.appendChild(matchDiv);
            matchesList.appendChild(matchItem);
        });

        roundDiv.appendChild(matchesList);
        tournamentBracket.appendChild(roundDiv);
    });

    bracketContainer.appendChild(tournamentBracket);
}


function generarBracket(cantidad) {
    console.log('generarBracket (original) llamada con cantidad:', cantidad);
    bracketData = [];
    const numRondas = Math.ceil(Math.log2(cantidad));
    let numPartidosEnRonda = cantidad / 2;
    let equiposParaRonda = equiposIniciales.map(equipo => ({ id: equipo.id }));

    for (let i = 0; i < numRondas; i++) {
        const ronda = { partidos: [] };
        for (let j = 0; j < numPartidosEnRonda; j++) {
            const equipo1Ref = equiposParaRonda[j * 2] || null;
            const equipo2Ref = equiposParaRonda[j * 2 + 1] || null;
            ronda.partidos.push({
                equipo1Ref: equipo1Ref,
                equipo2Ref: equipo2Ref,
                ganadorRef: null
            });
        }
        bracketData.push(ronda);
        equiposParaRonda = ronda.partidos.map(partido => partido.ganadorRef);
        numPartidosEnRonda /= 2;
    }

    console.log('bracketData después de generar original:', bracketData);
    mostrarBracket();
}


function generarBracketCruzado() {
    console.log('generarBracketCruzado ejecutada');
    if (equiposIniciales.length < 2) {
        alert('Se necesitan al menos 2 equipos para generar un bracket.');
        return;
    }

    const cantidad = equiposIniciales.length;
    bracketData = [];
    const numRondas = Math.ceil(Math.log2(cantidad));
    let numPartidosEnRonda = cantidad / 2;
    const equiposCruzados = [];

    // Lógica para emparejar cruzado en la primera ronda
    for (let i = 0; i < Math.floor(cantidad / 2); i++) {
        equiposCruzados.push({ equipo1Ref: { id: equiposIniciales[i].id }, equipo2Ref: { id: equiposIniciales[cantidad - 1 - i].id } });
    }

    let partidosRondaActual = equiposCruzados;

    for (let i = 0; i < numRondas; i++) {
        const ronda = { partidos: [] };
        partidosRondaActual.forEach(partido => {
            ronda.partidos.push({ ...partido, ganadorRef: null }); // Clona el partido de la ronda anterior
        });
        bracketData.push(ronda);
        partidosRondaActual = ronda.partidos.map(partido => ({ equipo1Ref: partido.ganadorRef, equipo2Ref: null })); // Preparar para la siguiente ronda
        numPartidosEnRonda /= 2;
    }

    console.log('bracketData después de generar cruzado:', bracketData);
    mostrarBracket();
}

function generarBracketAleatorio() {
    console.log('generarBracketAleatorio ejecutada');
    if (equiposIniciales.length < 2) {
        alert('Se necesitan al menos 2 equipos para generar un bracket.');
        return;
    }

    const cantidad = equiposIniciales.length;
    bracketData = [];
    const numRondas = Math.ceil(Math.log2(cantidad));
    let numPartidosEnRonda = cantidad / 2;
    const equiposAleatorios = shuffleArray([...equiposIniciales]); // Mezclar una copia del array
    const partidosAleatorios = [];

    // Emparejar los equipos aleatoriamente en la primera ronda
    for (let i = 0; i < Math.floor(cantidad / 2); i++) {
        partidosAleatorios.push({ equipo1Ref: { id: equiposAleatorios[i * 2].id }, equipo2Ref: { id: equiposAleatorios[i * 2 + 1].id } });
    }

    let partidosRondaActual = partidosAleatorios;

    for (let i = 0; i < numRondas; i++) {
        const ronda = { partidos: [] };
        partidosRondaActual.forEach(partido => {
            ronda.partidos.push({ ...partido, ganadorRef: null }); // Clona el partido de la ronda anterior
        });
        bracketData.push(ronda);
        partidosRondaActual = ronda.partidos.map(partido => ({ equipo1Ref: partido.ganadorRef, equipo2Ref: null })); // Preparar para la siguiente ronda
        numPartidosEnRonda /= 2;
    }

    console.log('bracketData después de generar aleatorio:', bracketData);
    mostrarBracket();
}

function shuffleArray(array) {
    const newArray = [...array]; // Crear una copia para no modificar el original directamente
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}