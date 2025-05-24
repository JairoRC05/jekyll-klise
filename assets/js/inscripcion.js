$(document).ready(function () {
    let equipos = [];
    let tablaEquiposActivos; // New DataTable instance for active teams
    let tablaEquiposInactivos; // New DataTable instance for inactive teams
    let modalEquipo = new bootstrap.Modal(document.getElementById('modalEquipo'));
    const formEquipo = document.getElementById('formEquipo');
    const btnGuardarEquipo = document.getElementById('btnGuardarEquipo');
    const btnAgregarJugador = document.getElementById('btnAgregarJugador');
    const jugadoresContainer = document.getElementById('jugadoresContainer');
    let contadorJugadores = 0;
    let equipoEditandoId = null;

    // Function to load data from localStorage
    function cargarDatosIniciales() {
        const equiposGuardados = localStorage.getItem('equipos');
        if (equiposGuardados) {
            equipos = JSON.parse(equiposGuardados);
        } else {
            equipos = [
                {
                    "tag": "DTY",
                    "team": "DINASTY",
                    "org": null,
                    "activo": true,
                    "capitan": "LIGHT",
                    "region": "LAN",
                    "teamNombreAnterior": "",
                    "teamNuevoNombre": "",
                    "seguro": true,
                    "link": "/equipos/dinasty",
                    "grupo": "NORTE",
                    "partidos": { "M1": "1", "M2": "1", "M3": "2", "M4": "3", "M5": "3", "M6": "3", "M7": "3", "M8": "2", "M9": "3", "M10": "3", "M11": "3", "M12": "2" },
                    "jugadores": [
                        { "nickname": "龍・Toro", "ID": "RNCXGAK", "avatar": "male1" },
                        { "nickname": "龍・Light光", "ID": "43LKYHQ", "avatar": "male1" },
                        { "nickname": "龍・Kraft", "ID": "2NNA9P4", "avatar": "male1" },
                        { "nickname": "龍・Vicleo", "ID": "446HY4X", "avatar": "male1" },
                        { "nickname": "龍・Ji9star", "ID": "83AFR37", "avatar": "male1" },
                        { "nickname": "Amailu", "ID": "95R97RL", "avatar": "female1" },
                        { "nickname": "Máx・獅", "ID": "CY9PT5", "avatar": "male1" }
                    ]
                },
                {
                    "tag": "INV",
                    "team": "INVINCIBLE",
                    "org": "Org Test",
                    "activo": false, // Example of an inactive team
                    "capitan": "SHADOW",
                    "region": "LAS",
                    "teamNombreAnterior": "",
                    "teamNuevoNombre": "",
                    "seguro": false,
                    "link": "/equipos/invincible",
                    "grupo": "SUR",
                    "partidos": { "M1": "0", "M2": "0", "M3": "1", "M4": "1", "M5": "0", "M6": "1", "M7": "0", "M8": "1", "M9": "0", "M10": "1", "M11": "0", "M12": "1" },
                    "jugadores": [
                        { "nickname": "Ghost", "ID": "GHOSTID", "avatar": "male1" },
                        { "nickname": "Spectra", "ID": "SPECTRAID", "avatar": "female1" }
                    ]
                }
            ];
            guardarDatos(); // Save the initial array to localStorage
        }
        actualizarTabla();
    }

    // Function to save data to localStorage
    function guardarDatos() {
        localStorage.setItem('equipos', JSON.stringify(equipos));
    }

    // Function to update the DataTables
    function actualizarTabla() {
        // Destroy existing DataTables instances if they exist
        if ($.fn.DataTable.isDataTable('#tablaEquiposActivos')) {
            tablaEquiposActivos.destroy();
        }
        if ($.fn.DataTable.isDataTable('#tablaEquiposInactivos')) {
            tablaEquiposInactivos.destroy();
        }

        const equiposActivos = equipos.filter(equipo => equipo.activo === true);
        const equiposInactivos = equipos.filter(equipo => equipo.activo === false);

        tablaEquiposActivos = $('#tablaEquiposActivos').DataTable({
            data: equiposActivos,
            columns: [
                { data: 'tag' },
                { data: 'team' },
                { data: 'capitan' },
                { data: 'region' },
                {
                    data: 'activo',
                    render: function (data) {
                        return data ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `
                        <div class="d-flex justify-content-center align-items-center">
                           <button class="btn btn-sm btn-warning btn-editar" data-id="${equipos.indexOf(row)}"><i class="ti ti-shield-code"></i></button>
                           <button class="btn btn-sm btn-toggle-activo ${row.activo ? 'btn-danger' : 'btn-success'}" data-id="${equipos.indexOf(row)}">
                                ${row.activo ? '<i class="ti ti-shield-lock"></i>' : '<i class="ti ti-shield-lock-filled"></i>'}
                           </button>
                           <button class="btn btn-sm btn-info btn-descargar-equipo" data-id="${equipos.indexOf(row)}"><i class="ti ti-shield-down"></i></button>
                        </div>
                        `;
                    }
                }
            ]
        });

        tablaEquiposInactivos = $('#tablaEquiposInactivos').DataTable({
            data: equiposInactivos,
            columns: [
                { data: 'tag' },
                { data: 'team' },
                { data: 'capitan' },
                { data: 'region' },
                {
                    data: 'activo',
                    render: function (data) {
                        return data ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>';
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `
                        <div class="d-flex justify-content-center align-items-center">
                           <button class="btn btn-sm btn-warning btn-editar" data-id="${equipos.indexOf(row)}"><i class="ti ti-shield-code"></i></button>
                           <button class="btn btn-sm btn-toggle-activo ${row.activo ? 'btn-danger' : 'btn-success'}" data-id="${equipos.indexOf(row)}">
                                ${row.activo ? '<i class="ti ti-shield-lock"></i>' : '<i class="ti ti-shield-lock-filled"></i>'}
                           </button>
                           <button class="btn btn-sm btn-info btn-descargar-equipo" data-id="${equipos.indexOf(row)}"><i class="ti ti-shield-down"></i></button>
                        </div>
                        `;
                    }
                }
            ]
        });
    }

    // Function to dynamically add player fields to the form
    function agregarCampoJugador(jugador = null) {
        const jugadorDiv = document.createElement('div');
        jugadorDiv.classList.add('row', 'mb-2', 'jugador-item');
        jugadorDiv.innerHTML = `
            <div class="col-md-4">
                <label for="nickname-${contadorJugadores}" class="form-label">Nickname</label>
                <input type="text" class="form-control" id="nickname-${contadorJugadores}" value="${jugador ? jugador.nickname : ''}">
            </div>
            <div class="col-md-4">
                <label for="ID-${contadorJugadores}" class="form-label">ID</label>
                <input type="text" class="form-control" id="ID-${contadorJugadores}" value="${jugador ? jugador.ID : ''}">
            </div>
            <div class="col-md-3">
                <label for="avatar-${contadorJugadores}" class="form-label">Avatar</label>
                <input type="text" class="form-control" id="avatar-${contadorJugadores}" value="${jugador ? jugador.avatar : ''}">
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger btn-sm btn-eliminar-jugador mt-4">X</button>
            </div>
        `;
        jugadoresContainer.appendChild(jugadorDiv);
        contadorJugadores++;
    }

    // Event to add a new player field
    btnAgregarJugador.addEventListener('click', agregarCampoJugador);

    // Event to remove a player field
    jugadoresContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('btn-eliminar-jugador')) {
            event.target.closest('.jugador-item').remove();
        }
    });

    // Function to get form data
    function obtenerDatosFormulario() {
        const equipo = {
            tag: $('#tag').val(),
            team: $('#team').val(),
            org: $('#org').val(),
            activo: $('#activo').val() === 'true',
            capitan: $('#capitan').val(),
            region: $('#region').val(),
            teamNombreAnterior: $('#teamNombreAnterior').val(),
            teamNuevoNombre: $('#teamNuevoNombre').val(),
            seguro: $('#seguro').val() === 'true',
            link: $('#link').val(),
            grupo: $('#grupo').val(),
            partidos: {},
            jugadores: []
            };

        // Get match data
        $('#partidosContainer input').each(function () {
            equipo.partidos[this.id] = this.value;
        });

        // Get player data
        $('.jugador-item').each(function () {
            const nickname = $(this).find('input')[0].value;
            const id = $(this).find('input')[1].value;
            const avatar = $(this).find('input')[2].value;
            equipo.jugadores.push({ nickname, ID: id, avatar });
        });
        return equipo;
    }

    // Event to show new team modal
    $('#btnNuevoEquipo').on('click', function () {
        equipoEditandoId = null;
        $('#modalEquipoLabel').text('Crear Nuevo Equipo');
        formEquipo.reset();
        jugadoresContainer.innerHTML = '';
        contadorJugadores = 0;
        agregarCampoJugador();
        modalEquipo.show();
    });

    // Event to edit a team (listen on both table bodies)
    $('#tablaEquiposActivos tbody, #tablaEquiposInactivos tbody').on('click', '.btn-editar', function () {
        const id = $(this).data('id');
        equipoEditandoId = id;
        const equipo = equipos[id];
        $('#modalEquipoLabel').text('Editar Equipo');

        $('#tag').val(equipo.tag);
        $('#team').val(equipo.team);
        $('#org').val(equipo.org);
        $('#activo').val(equipo.activo.toString());
        $('#capitan').val(equipo.capitan);
        $('#region').val(equipo.region);
        $('#teamNombreAnterior').val(equipo.teamNombreAnterior);
        $('#teamNuevoNombre').val(equipo.teamNuevoNombre);
        $('#seguro').val(equipo.seguro.toString());
        $('#link').val(equipo.link);
        $('#grupo').val(equipo.grupo);

        for (const partido in equipo.partidos) {
            if (equipo.partidos.hasOwnProperty(partido)) {
                $(`#${partido}`).val(equipo.partidos[partido]);
            }
        }

        jugadoresContainer.innerHTML = '';
        contadorJugadores = 0;
        equipo.jugadores.forEach(jugador => {
            agregarCampoJugador(jugador);
        });

        modalEquipo.show();
    });

    // Event to toggle team status (listen on both table bodies)
    $('#tablaEquiposActivos tbody, #tablaEquiposInactivos tbody').on('click', '.btn-toggle-activo', function () {
        const id = $(this).data('id');
        const equipo = equipos[id];
        equipo.activo = !equipo.activo;
        guardarDatos(); // Save the status change
        actualizarTabla(); // Re-render both tables
    });

    // Event to download team (listen on both table bodies)
    $('#tablaEquiposActivos tbody, #tablaEquiposInactivos tbody').on('click', '.btn-descargar-equipo', function () {
        const id = $(this).data('id');
        const equipo = equipos[id];
        const json = JSON.stringify([equipo], null, 2); // Wrap the team object in an array
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${equipo.team}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Event to save the team (new or edited)
    btnGuardarEquipo.addEventListener('click', function (event) {
        event.preventDefault();

        const equipo = obtenerDatosFormulario();

        if (equipoEditandoId !== null) {
            equipos[equipoEditandoId] = equipo;
        } else {
            equipos.push(equipo);
        }
        guardarDatos(); // Save team data
        actualizarTabla(); // Re-render both tables
        modalEquipo.hide();
        formEquipo.reset();
        equipoEditandoId = null;
        contadorJugadores = 0;
        jugadoresContainer.innerHTML = '';
    });

    // Event to download the JSON (only active teams)
$('#btnDescargarJson').on('click', function () {
    // Filter the 'equipos' array to include only active teams
    const equiposActivos = equipos.filter(equipo => equipo.activo === true);

    const json = JSON.stringify(equiposActivos, null, 2); // Use the filtered array
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'incripciones.json'; // Suggest a more descriptive filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

    // Load initial data when the page loads
    cargarDatosIniciales();
});