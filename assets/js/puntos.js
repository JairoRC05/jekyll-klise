const teamFiles = [
    'assets/equipos/ad.json',
    'assets/equipos/amt.json',
    'assets/equipos/aogiri.json',
    'assets/equipos/cl.json',
    'assets/equipos/dbo.json',
    'assets/equipos/dty.json',
    'assets/equipos/enigma.json',
    'assets/equipos/gx.json',
    'assets/equipos/neo.json',
    'assets/equipos/ns.json',
    'assets/equipos/obs.json',
    'assets/equipos/ovg.json',
    'assets/equipos/pe.json',
    'assets/equipos/plaga.json',
    'assets/equipos/rk.json',
    'assets/equipos/rntx.json',
    'assets/equipos/sm.json',
    'assets/equipos/space.json',
    'assets/equipos/stmn.json',
    'assets/equipos/tad.json',
    'assets/equipos/tm.json',
    'assets/equipos/tut.json',
    'assets/equipos/tutw.json',
    'assets/equipos/zafiro.json'
];

let equiposData = {};
let equipoSeleccionado = null;
let jugadorEditandoIndex = null;
let partidosData = []; 

async function cargarEquipos() {
    const selectEquipo = document.getElementById('equipo-select');
    for (const file of teamFiles) {
        try {
            const response = await fetch(file);
            const data = await response.json();
            if (data && data.length > 0) {
                const equipo = data[0];
                equiposData[equipo.tag] = equipo;
                const option = document.createElement('option');
                option.value = equipo.tag;
                option.textContent = equipo.team;
                selectEquipo.appendChild(option);
            }
        } catch (error) {
            console.error(`Error al cargar ${file}:`, error);
        }
    }
}

async function cargarPartidos() {
    try {
        const response = await fetch('assets/partidos/pnorte.json'); // Asegúrate de que la ruta al archivo de partidos sea correcta
        partidosData = await response.json();
        console.log('Datos de partidos cargados:', partidosData);
    } catch (error) {
        console.error('Error al cargar el archivo de partidos:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarEquipos();
    await cargarPartidos(); // Cargar los datos de los partidos
    const selectEquipo = document.getElementById('equipo-select');
    const equipoDetallesDiv = document.getElementById('equipo-detalles');

    selectEquipo.addEventListener('change', () => {
        equipoSeleccionado = selectEquipo.value;
        if (equipoSeleccionado) {
            mostrarDetallesEquipo(equiposData[equipoSeleccionado]);
            equipoDetallesDiv.style.display = 'block';
        } else {
            equipoDetallesDiv.style.display = 'none';
        }
    });

    if (Object.keys(equiposData).length > 0) {
        const primerEquipoTag = Object.keys(equiposData)[0];
        selectEquipo.value = primerEquipoTag;
        equipoSeleccionado = primerEquipoTag;
        mostrarDetallesEquipo(equiposData[primerEquipoTag]);
        equipoDetallesDiv.style.display = 'block';
    }
});

function mostrarDetallesEquipo(equipo) {
    document.getElementById('nombre-equipo').textContent = equipo.team;

    // Mostrar jugadores
    const listaJugadores = document.getElementById('lista-jugadores');
    listaJugadores.innerHTML = '';
    equipo.jugadores.forEach((jugador, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'jugador-item');
        listItem.innerHTML = `
            <span>${jugador.nickname} (${jugador.ID})</span>
            <div>
                <button class="btn btn-sm btn-info me-2" onclick="editarJugador(${index})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="eliminarJugador(${index})">Eliminar</button>
            </div>
        `;
        listaJugadores.appendChild(listItem);

        const editForm = document.createElement('div');
        editForm.classList.add('edit-form');
        editForm.innerHTML = `
            <div class="mb-2">
                <input type="text" class="form-control form-control-sm" id="edit-nickname-${index}" placeholder="Nickname" value="${jugador.nickname}">
            </div>
            <div class="mb-2">
                <input type="text" class="form-control form-control-sm" id="edit-id-${index}" placeholder="ID" value="${jugador.ID}">
            </div>
             <div class="mb-2">
                <input type="text" class="form-control form-control-sm" id="edit-avatar-${index}" placeholder="Avatar" value="${jugador.avatar}">
            </div>
            <button class="btn btn-sm btn-success me-2" onclick="guardarEdicionJugador(${index})">Guardar</button>
            <button class="btn btn-sm btn-secondary" onclick="cancelarEdicionJugador(${index})">Cancelar</button>
        `;
        listItem.appendChild(editForm);
    });

    // Mostrar puntos por partido como tarjetas
    const partidosContainer = document.getElementById('partidos-container');
    partidosContainer.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
        const partidoKey = `M${i}`;
        const puntos = equipo.partidos[partidoKey] === ' ' ? 0 : parseInt(equipo.partidos[partidoKey]) || 0;

        const card = document.createElement('div');
        card.classList.add('card', 'mb-2', 'p-2');
        card.innerHTML = `
            <h6 class="card-title">Partido ${i}</h6>
            <div class="mb-1">
                <label for="puntos-${i}" class="form-label form-label-sm">Puntos:</label>
                <input type="number" class="form-control form-control-sm" id="puntos-${i}" value="${puntos}" style="width: 80px;">
            </div>
        `;

        const inputPuntos = card.querySelector(`#puntos-${i}`);
        inputPuntos.addEventListener('change', (event) => {
            actualizarPuntos(partidoKey, parseInt(event.target.value));
            calcularYMostrarSumaPuntos(equipo);
        });

        partidosContainer.appendChild(card);
    }

    calcularYMostrarSumaPuntos(equipo);

    // Mostrar partidos del equipo seleccionado
    const partidosEquipoContainer = document.getElementById('partidos-equipo-container');
    partidosEquipoContainer.innerHTML = '';

    if (partidosData && partidosData.length > 0) {
        const equipoTag = equipo.tag;
        partidosData[0].rondas.forEach(ronda => {
            const divRonda = document.createElement('div');
            divRonda.classList.add('mb-3', 'border', 'p-2');
            divRonda.innerHTML += `<h4>${ronda.ronda} - ${ronda.fecha} (${ronda.hora || 'Sin hora'})</h4>`;

            const listaPartidosRonda = document.createElement('ul');
            listaPartidosRonda.classList.add('list-unstyled');

            ronda.partidos.forEach(partido => {
                if (partido.tag1 === equipoTag || partido.tag2 === equipoTag) {
                    const listItemPartido = document.createElement('li');
                    listItemPartido.textContent = `${partido.equipo1} (${partido.tag1}) vs ${partido.equipo2} (${partido.tag2}) - Resultado: ${partido.resultado || 'Pendiente'}`;
                    listaPartidosRonda.appendChild(listItemPartido);
                }
            });

            if (listaPartidosRonda.children.length > 0) {
                divRonda.appendChild(listaPartidosRonda);
                partidosEquipoContainer.appendChild(divRonda);
            } else if (partidosEquipoContainer.innerHTML === '') {
                partidosEquipoContainer.textContent = 'Este equipo no tiene partidos programados o jugados aún.';
            }
        });
    } else {
        partidosEquipoContainer.textContent = 'No se pudieron cargar los datos de los partidos.';
    }
}

function agregarJugador() {
    if (!equipoSeleccionado) return;
    const nickname = document.getElementById('nuevo-jugador-nickname').value.trim();
    const id = document.getElementById('nuevo-jugador-id').value.trim();
     const avatar = document.getElementById('nuevo-jugador-avatar').value.trim();

    if (nickname && id) {
        equiposData[equipoSeleccionado].jugadores.push({ nickname, ID: id, avatar });
        mostrarDetallesEquipo(equiposData[equipoSeleccionado]);
        document.getElementById('nuevo-jugador-nickname').value = '';
        document.getElementById('nuevo-jugador-id').value = '';
        document.getElementById('nuevo-jugador-avatar').value = '';
        guardarCambios();
    } else {
        alert('Por favor, ingresa el nickname e ID del jugador.');
    }
}

function eliminarJugador(index) {
    if (!equipoSeleccionado) return;
    if (confirm('¿Estás seguro de eliminar a este jugador?')) {
        equiposData[equipoSeleccionado].jugadores.splice(index, 1);
        mostrarDetallesEquipo(equiposData[equipoSeleccionado]);
        guardarCambios();
    }
}

function editarJugador(index) {
    jugadorEditandoIndex = index;
    const listItem = document.querySelector(`#lista-jugadores li:nth-child(${index + 1})`);
    const editForm = listItem.querySelector('.edit-form');
    editForm.style.display = 'block';
}

function guardarEdicionJugador(index) {
    if (!equipoSeleccionado) return;
    const nicknameInput = document.getElementById(`edit-nickname-${index}`);
    const idInput = document.getElementById(`edit-id-${index}`);
     const avatarInput = document.getElementById(`edit-avatar-${index}`);

    if (nicknameInput && idInput) {
        equiposData[equipoSeleccionado].jugadores[index].nickname = nicknameInput.value.trim();
        equiposData[equipoSeleccionado].jugadores[index].ID = idInput.value.trim();
        equiposData[equipoSeleccionado].jugadores[index].avatar = avatarInput.value.trim();
        jugadorEditandoIndex = null;
        mostrarDetallesEquipo(equiposData[equipoSeleccionado]);
        guardarCambios();
    } else {
        alert('Por favor, ingresa el nickname e ID del jugador.');
    }
}

function cancelarEdicionJugador(index) {
    jugadorEditandoIndex = null;
    const listItem = document.querySelector(`#lista-jugadores li:nth-child(${index + 1})`);
    const editForm = listItem.querySelector('.edit-form');
    editForm.style.display = 'none';
}

function actualizarPuntos(partido, puntos) {
    if (!equipoSeleccionado) return;
    equiposData[equipoSeleccionado].partidos[partido] = puntos;
    // No llamamos a guardarCambios() aquí para evitar guardados innecesarios al cambiar cada punto.
    // Los cambios se guardarán cuando se cambie de equipo o se realice otra acción.
}

function calcularYMostrarSumaPuntos(equipo) {
    let suma = 0;
    for (let i = 1; i <= 12; i++) {
        const partido = `M${i}`;
        const puntos = parseInt(equipo.partidos[partido]);
        if (!isNaN(puntos)) {
            suma += puntos;
        }
    }
    document.getElementById('suma-puntos').textContent = `Suma de Puntos: ${suma}`;
}

async function guardarCambios() {
    if (!equipoSeleccionado) return;
    const equipoActualizado = [equiposData[equipoSeleccionado]];
    const archivoGuardar = teamFiles.find(file => file.includes(`/${equipoSeleccionado.toLowerCase()}.json`));

    if (archivoGuardar) {
        try {
            const response = await fetch(archivoGuardar, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(equipoActualizado, null, 4)
            });
            console.log(`Cambios guardados en ${archivoGuardar}`);
        } catch (error) {
            console.error(`Error al guardar cambios en ${archivoGuardar}:`, error);
            alert('Error al guardar los cambios.');
        }
    } else {
        console.error(`No se encontró el archivo para el equipo ${equipoSeleccionado}`);
        alert('No se pudo guardar el archivo del equipo.');
    }
}

function descargarJson() {
    if (!equipoSeleccionado) return;
    const equipoParaDescargar = [equiposData[equipoSeleccionado]];
    const jsonString = JSON.stringify(equipoParaDescargar, null, 4);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${equipoSeleccionado.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
