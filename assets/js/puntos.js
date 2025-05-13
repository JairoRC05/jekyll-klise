let equiposData = {};
let equipoSeleccionado = null;
let jugadorEditandoIndex = null;
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


document.addEventListener('DOMContentLoaded', async () => {
    await cargarEquipos();
    await cargarPartidos();

    const selectEquipo = document.getElementById('equipo-select');
    const equipoDetallesDiv = document.getElementById('equipo-detalles');
    const listaJugadoresDiv = document.getElementById('lista-jugadores');

    // Asegúrate de que esta línea esté presente y correcta
    const editarJugadorModalElement = document.getElementById('editarJugadorModal');
    const editarJugadorModal = new bootstrap.Modal(editarJugadorModalElement);
    console.log(editarJugadorModalElement);

    let jugadorSeleccionadoParaEditar = null;

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

    // Evento para guardar los cambios realizados en la edición de un jugador
    document.getElementById('guardar-jugador-editado').addEventListener('click', () => {
        if (jugadorSeleccionadoParaEditar && equipoSeleccionado !== null && jugadorEditandoIndex !== null) {
            equiposData[equipoSeleccionado].jugadores[jugadorEditandoIndex].nickname = document.getElementById('edit-modal-nickname').value.trim();
            equiposData[equipoSeleccionado].jugadores[jugadorEditandoIndex].ID = document.getElementById('edit-modal-id').value.trim();
            equiposData[equipoSeleccionado].jugadores[jugadorEditandoIndex].avatar = document.getElementById('edit-modal-avatar').value.trim();
            mostrarDetallesEquipo(equiposData[equipoSeleccionado]);
            guardarCambios();
            editarJugadorModal.hide();
            jugadorSeleccionadoParaEditar = null;
            jugadorEditandoIndex = null;
        }
    });

    // Evento para eliminar un jugador
    document.getElementById('eliminar-jugador').addEventListener('click', () => {
        if (jugadorSeleccionadoParaEditar && equipoSeleccionado !== null && jugadorEditandoIndex !== null && confirm('¿Estás seguro de eliminar a este jugador?')) {
            equiposData[equipoSeleccionado].jugadores.splice(jugadorEditandoIndex, 1);
            mostrarDetallesEquipo(equiposData[equipoSeleccionado]);
            guardarCambios();
            editarJugadorModal.hide();
            jugadorSeleccionadoParaEditar = null;
            jugadorEditandoIndex = null;
        }
    });
});


async function cargarEquipos() {
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
                document.getElementById('equipo-select').appendChild(option);
            }
        } catch (error) {
            console.error(`Error al cargar ${file}:`, error);
        }
    }
}

async function mostrarDetallesEquipo(equipo) {
    const bannerTeamContainer = document.querySelector('.banner-team-container');
    const bannerTeamLogo = bannerTeamContainer.querySelector('img');
    const nombreEquipoTitulo = document.getElementById('nombre-equipo');

    if (equipo && equipo.tag) {
        // Establecer la clase del contenedor con el tag del equipo
        bannerTeamContainer.className = `banner-team-container ${equipo.tag}`;

        // Establecer la ruta del logo
        bannerTeamLogo.src = `/assets/logos/${equipo.tag}.webp`;
        bannerTeamLogo.alt = equipo.team; // Usar el nombre del equipo como texto alternativo

        // Establecer el nombre del equipo
        nombreEquipoTitulo.textContent = equipo.team;
    } else {
        // Si no hay equipo o tag, establecer valores por defecto o limpiar
        bannerTeamContainer.className = 'banner-team-container'; // Clase base
        bannerTeamLogo.src = '/assets/logos/default.webp'; // Reemplaza con tu logo por defecto
        bannerTeamLogo.alt = 'Logo del Equipo';
        nombreEquipoTitulo.textContent = 'Nombre del Equipo';
    }


    const listaJugadoresDiv = document.getElementById('lista-jugadores');
    listaJugadoresDiv.innerHTML = '';

    if (equipo.jugadores) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');

        equipo.jugadores.forEach((jugador, index) => {
            const jugadorHTML = `
                 <div class="col-md-6 col-lg-3 col-xl-2 jugador-card-container" >
            
                    <div class="card-round-roster" data-jugador-index="${index}">
                            <div class="card-round-team">
                                <a href="#">
                                    <img src="${jugador.avatar ? `/assets/avatars/${jugador.avatar}.webp` : '/assets/avatars/male1.webp'}" alt="${jugador.nickname}" class="img-fluid">
                                </a>
                            </div>
                            <div class="card-round-title">
                                 <h2> ${jugador.nickname}</h2>
                                 <span>${jugador.ID}</span>
                            </div>
                            <div class="card-back">
                                <div class="card-color-left ${equipo.tag}"></div>
                                <div class="card-color-right bg-cham"></div>
                                <div class="card-color-logo">
                                    <img src="/assets/logos/LIGA-INDIGO.webp" alt="Liga Indigo">
                                </div>
                            </div>
                        </div>
                 </div>`;
            rowDiv.innerHTML += jugadorHTML;
        });

        listaJugadoresDiv.appendChild(rowDiv);

        // Agrega un event listener a cada tarjeta de jugador para la edición
        const jugadorContainers = listaJugadoresDiv.querySelectorAll('.jugador-card-container > div');
        jugadorContainers.forEach(container => {
            container.addEventListener('click', function () {
                const index = parseInt(this.dataset.jugadorIndex, 10);
                const jugadores = equiposData[equipoSeleccionado]?.jugadores;


                if (jugadores && jugadores[index]) {
                    jugadorEditandoIndex = index; // Guardar el índice para la edición

                    // Llenar los campos de entrada
                    document.getElementById('nuevo-jugador-nickname').value = jugadores[index].nickname;
                    document.getElementById('nuevo-jugador-id').value = jugadores[index].ID;
                    document.getElementById('nuevo-jugador-avatar').value = jugadores[index].avatar || '';

                    // Cambiar el título y los botones
                    document.getElementById('editar-agregar-jugador-titulo').textContent = 'Editar Jugador:';
                    const formContainer = document.getElementById('editar-agregar-jugador-form');
                    formContainer.innerHTML = `
                        <input type="text" class="form-control" id="nuevo-jugador-nickname" placeholder="Nickname" value="${jugadores[index].nickname}">
                        <input type="text" class="form-control" id="nuevo-jugador-id" placeholder="ID" value="${jugadores[index].ID}">
                        <input type="text" class="form-control" id="nuevo-jugador-avatar" placeholder="Avatar" value="${jugadores[index].avatar || ''}">
                        <button class="btn btn-success" onclick="guardarJugadorEditadoEnLinea()">Guardar</button>
                        <button class="btn btn-danger" onclick="eliminarJugadorEnLinea()">Eliminar</button>
                    `;
                } else {
                    console.error('No se encontró el jugador para editar.');
                }
            });
        });

    } else {
        listaJugadoresDiv.innerHTML = '<p>No hay jugadores registrados.</p>';
    }

    const partidosEquipoContainer = document.getElementById('partidos-equipo-container');
    partidosEquipoContainer.innerHTML = '';
    let totalPuntos = 0;
    const puntosPartidosKeys = Object.keys(equipo.partidos).filter(key => key.startsWith('M'));
    let puntosKeyIndex = 0;

    const rowDivPartidos = document.createElement('div');
    rowDivPartidos.classList.add('row');
    partidosEquipoContainer.appendChild(rowDivPartidos);

    const scoreValues = {
        SUP: 3,
        WIN: 2,
        ONE: 1,
        LOSS: 0,
        REA: "R",
        DES: "D",
        NJ: ""
    };

    if (partidosData && partidosData.length > 0) {
        partidosData.forEach(grupoPartidos => { // Iterar sobre cada archivo de partidos
            grupoPartidos.rondas.forEach(ronda => {
                ronda.partidos.forEach(partido => {
                    if (partido.tag1 === equipo.tag || partido.tag2 === equipo.tag) {
                        const colDiv = document.createElement('div');
                        colDiv.classList.add('col-lg-4', 'mb-3');

                        const partidoDiv = document.createElement('div');
                        partidoDiv.classList.add('bracket-round-list');
                        partidoDiv.innerHTML = `
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
                <h6>${partido.resultado || ''}</h6>
                <span>${partido.fecha || ''}</span>
                <span>${partido.hora === "SI" ? '21:40' : (partido.hora === "NO" ? '22:20' : partido.hora || '')}</span>
            ` : (partido.special ? `
                <span>TWITCH</span>
                <h6>${partido.resultado || ''}</h6>
                <span>${partido.hora || ''}</span>
            ` : `
                <h6>${partido.resultado || ''}</h6>
            `)}
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
        <div class="card-color-left ${partido.equipo1 === "7Z" ? 'S7Z' : partido.tag1}"></div>
        <div class="card-color-right ${partido.equipo2 === "7Z" ? 'S7Z' : partido.tag2}"></div>
    </div>
                    `;
                        colDiv.appendChild(partidoDiv);

                        if (puntosKeyIndex < puntosPartidosKeys.length) {
                            const partidoKey = puntosPartidosKeys[puntosKeyIndex];
                            const valorGuardado = equipo.partidos[partidoKey];

                            const selectDiv = document.createElement('div');
                            selectDiv.classList.add('mt-2', 'd-flex', 'align-items-center', 'justify-content-center');

                            const selectElement = document.createElement('select');
                            selectElement.classList.add('form-select', 'form-select-sm', 'mx-auto');
                            selectElement.id = `score-${partidoKey.toLowerCase()}`;
                            selectElement.style.width = '120px';

                            for (const key in scoreValues) {
                                const option = document.createElement('option');
                                option.value = scoreValues[key];
                                option.textContent = key;
                                const valorComparar = (key === 'REA' ? 'R' : (key === 'DES' ? 'D' : (key === 'NJ' ? '' : scoreValues[key])));
                                option.selected = (valorGuardado == valorComparar);
                                selectElement.appendChild(option);
                            }

                            selectDiv.appendChild(selectElement);
                            colDiv.appendChild(selectDiv);
                            rowDivPartidos.appendChild(colDiv);

                            selectElement.addEventListener('change', (event) => {
                                const selectedValue = event.target.value;
                                actualizarPuntosEquipo(partidoKey, selectedValue);
                                totalPuntos = calcularSumaTotalPuntos(equipo);
                                mostrarSumaPuntos(totalPuntos);
                            });

                            totalPuntos += calcularPuntosPartido(valorGuardado);
                            puntosKeyIndex++;
                        }
                        rowDivPartidos.appendChild(colDiv);
                    }
                });
            });
        });
    } else {
        partidosEquipoContainer.innerHTML = '<p>No se pudieron cargar los datos de los partidos.</p>';
    }

    mostrarSumaPuntos(totalPuntos);
}



function guardarJugadorEditadoEnLinea() {
    if (equipoSeleccionado !== null && jugadorEditandoIndex !== null) {
        equiposData[equipoSeleccionado].jugadores[jugadorEditandoIndex].nickname = document.getElementById('nuevo-jugador-nickname').value.trim();
        equiposData[equipoSeleccionado].jugadores[jugadorEditandoIndex].ID = document.getElementById('nuevo-jugador-id').value.trim();
        equiposData[equipoSeleccionado].jugadores[jugadorEditandoIndex].avatar = document.getElementById('nuevo-jugador-avatar').value.trim();
        mostrarDetallesEquipo(equiposData[equipoSeleccionado]); // Re-renderizar la lista
        jugadorEditandoIndex = null;
        // Restablecer la sección "Agregar Jugador" a su estado original (opcional)
        document.getElementById('editar-agregar-jugador-titulo').textContent = 'Agregar Jugador:';
        const formContainer = document.getElementById('editar-agregar-jugador-form');
        formContainer.innerHTML = `
            <input type="text" class="form-control" id="nuevo-jugador-nickname" placeholder="Nickname">
            <input type="text" class="form-control" id="nuevo-jugador-id" placeholder="ID">
            <input type="text" class="form-control" id="nuevo-jugador-avatar" placeholder="Avatar">
            <button class="btn btn-primary" onclick="agregarJugador()">Agregar</button>
        `;
        guardarCambios(); // Guardar los cambios generales
    }
}

function eliminarJugadorEnLinea() {
    if (equipoSeleccionado !== null && jugadorEditandoIndex !== null && confirm('¿Estás seguro de eliminar a este jugador?')) {
        equiposData[equipoSeleccionado].jugadores.splice(jugadorEditandoIndex, 1);
        mostrarDetallesEquipo(equiposData[equipoSeleccionado]); // Re-renderizar la lista
        jugadorEditandoIndex = null;
        // Restablecer la sección "Agregar Jugador" a su estado original (opcional)
        document.getElementById('editar-agregar-jugador-titulo').textContent = 'Agregar Jugador:';
        const formContainer = document.getElementById('editar-agregar-jugador-form');
        formContainer.innerHTML = `
            <input type="text" class="form-control" id="nuevo-jugador-nickname" placeholder="Nickname">
            <input type="text" class="form-control" id="nuevo-jugador-id" placeholder="ID">
            <input type="text" class="form-control" id="nuevo-jugador-avatar" placeholder="Avatar">
            <button class="btn btn-primary" onclick="agregarJugador()">Agregar</button>
        `;
        guardarCambios(); // Guardar los cambios generales
    }
}


async function cargarPartidos() {
    const archivosPartidos = [
        'assets/partidos/pnorte.json',
        'assets/partidos/psur.json',
        'assets/partidos/cruces.json'
    ];
    partidosData = [];

    for (const archivo of archivosPartidos) {
        try {
            const response = await fetch(archivo);
            if (!response.ok) {
                console.error(`Error al cargar ${archivo}: ${response.status} ${response.statusText}`);
                continue;
            }
            const data = await response.json();
            // Acceder a la propiedad 'rondas' del primer elemento del array
            if (Array.isArray(data) && data.length > 0 && data[0].rondas) {
                partidosData.push(data[0]);
            } else {
                console.warn(`El archivo ${archivo} no tiene la estructura esperada.`);
            }
        } catch (error) {
            console.error(`Error al procesar ${archivo}:`, error);
        }
    }
    console.log("Datos de partidos cargados:", partidosData);
}

function actualizarPuntosEquipo(partidoKey, valor) {
    if (!equipoSeleccionado) return;
    equiposData[equipoSeleccionado].partidos[partidoKey] = valor;
}

function calcularPuntosPartido(valor) {
    const scoreMap = {
        '3': 3,
        '2': 2,
        '1': 1,
        '0': 0,
        'R': 0,
        'D': 0,
        '': 0 // Para "NJ"
    };
    return scoreMap[valor] || 0;
}

function calcularSumaTotalPuntos(equipo) {
    let suma = 0;
    if (equipo && equipo.partidos) {
        for (const partidoKey in equipo.partidos) {
            if (partidoKey.startsWith('M')) {
                suma += calcularPuntosPartido(equipo.partidos[partidoKey]);
            }
        }
    }
    return suma;
}

function mostrarSumaPuntos(suma) {
    document.getElementById('suma-puntos').textContent = `${suma} PTS`;
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
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log(`Cambios guardados en ${archivoGuardar}`);
            alert('Cambios guardados exitosamente.');
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