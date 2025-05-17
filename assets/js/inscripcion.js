
        $(document).ready(function () {
            let equipos = [];
            let tablaEquipos;
            let modalEquipo = new bootstrap.Modal(document.getElementById('modalEquipo'));
            const formEquipo = document.getElementById('formEquipo');
            const btnGuardarEquipo = document.getElementById('btnGuardarEquipo');
            const btnAgregarJugador = document.getElementById('btnAgregarJugador');
            const jugadoresContainer = document.getElementById('jugadoresContainer');
            let contadorJugadores = 0;
            let equipoEditandoId = null;

            // Función para cargar datos desde localStorage
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
                            "partidos": {
                                "M1": "1",
                                "M2": "1",
                                "M3": "2",
                                "M4": "3",
                                "M5": "3",
                                "M6": "3",
                                "M7": "3",
                                "M8": "2",
                                "M9": "3",
                                "M10": "3",
                                "M11": "3",
                                "M12": "2"
                            },
                            "jugadores": [
                                { "nickname": "龍・Toro", "ID": "RNCXGAK", "avatar": "male1" },
                                { "nickname": "龍・Light光", "ID": "43LKYHQ", "avatar": "male1" },
                                { "nickname": "龍・Kraft", "ID": "2NNA9P4", "avatar": "male1" },
                                { "nickname": "龍・Vicleo", "ID": "446HY4X", "avatar": "male1" },
                                { "nickname": "龍・Ji9star", "ID": "83AFR37", "avatar": "male1" },
                                { "nickname": "Amailu", "ID": "95R97RL", "avatar": "female1" },
                                { "nickname": "Máx・獅", "ID": "CY9PT5", "avatar": "male1" }
                        ]
                    }
                    ];
                    guardarDatos(); // Guardar el array inicial en localStorage
                }
                actualizarTabla();
            }

            // Función para guardar datos en localStorage
            function guardarDatos() {
                localStorage.setItem('equipos', JSON.stringify(equipos));
            }

            // Función para actualizar la tabla DataTables
            function actualizarTabla() {
                if ($.fn.DataTable.isDataTable('#tablaEquipos')) {
                    tablaEquipos.destroy();
                }
                tablaEquipos = $('#tablaEquipos').DataTable({
                    data: equipos,
                    columns: [
                        { data: 'tag' },
                        { data: 'team' },
                        { data: 'capitan' },
                        { data: 'region' },
                        {
                            data: 'activo',
                            render: function (data) {
                                return data
                                    ? '<i class="fas fa-check text-success"></i>'
                                    : '<i class="fas fa-times text-danger"></i>';
                            }
                        },
                        {
                            data: null,
                            render: function (data, type, row) {
                                return `
                                    <button class="btn btn-sm btn-warning btn-editar" data-id="${equipos.indexOf(row)}"><i class="ti ti-shield-code"></i></button>
                                    <button class="btn btn-sm btn-toggle-activo ${row.activo ? 'btn-danger' : 'btn-success'}" data-id="${equipos.indexOf(row)}">
                                        ${row.activo ? '<i class="ti ti-shield-lock"></i>' : '<i class="ti ti-shield-lock-filled"></i>'}
                                    </button>
                                     <button class="btn btn-sm btn-info btn-descargar-equipo" data-id="${equipos.indexOf(row)}"><i class="ti ti-shield-down"></i></button>
                                `;
                            }
                        }
                    ]
                });
            }

            // Función para agregar dinámicamente campos de jugador al formulario
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

            // Evento para agregar un nuevo campo de jugador
            btnAgregarJugador.addEventListener('click', agregarCampoJugador);

            // Evento para eliminar un campo de jugador
            jugadoresContainer.addEventListener('click', function (event) {
                if (event.target.classList.contains('btn-eliminar-jugador')) {
                    event.target.closest('.jugador-item').remove();
                }
            });

            // Función para obtener los datos del formulario
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

                // Obtener datos de partidos
                $('#partidosContainer input').each(function () {
                    equipo.partidos[this.id] = this.value;
                });

                // Obtener datos de jugadores
                $('.jugador-item').each(function () {
                    const nickname = $(this).find('input')[0].value;
                    const id = $(this).find('input')[1].value;
                    const avatar = $(this).find('input')[2].value;
                    equipo.jugadores.push({ nickname, ID: id, avatar });
                });
                return equipo;
            }

            // Evento para mostrar el modal de nuevo equipo
            $('#btnNuevoEquipo').on('click', function () {
                equipoEditandoId = null;
                $('#modalEquipoLabel').text('Crear Nuevo Equipo');
                formEquipo.reset();
                jugadoresContainer.innerHTML = '';
                contadorJugadores = 0;
                agregarCampoJugador();
                modalEquipo.show();
            });

            // Evento para editar un equipo
            $('#tablaEquipos tbody').on('click', '.btn-editar', function () {
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

            // Evento para activar/desactivar un equipo
            $('#tablaEquipos tbody').on('click', '.btn-toggle-activo', function () {
                const id = $(this).data('id');
                const equipo = equipos[id];
                equipo.activo = !equipo.activo;
                guardarDatos(); // Guardar el cambio de estado
                actualizarTabla();
            });

            // Evento para descargar equipo
            $('#tablaEquipos tbody').on('click', '.btn-descargar-equipo', function () {
                const id = $(this).data('id');
                const equipo = equipos[id];
                const json = JSON.stringify([equipo], null, 2); // Envolver el objeto del equipo en un array
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

            // Evento para guardar el equipo (nuevo o editado)
            btnGuardarEquipo.addEventListener('click', function (event) {
                event.preventDefault();

                const equipo = obtenerDatosFormulario();

                if (equipoEditandoId !== null) {
                    equipos[equipoEditandoId] = equipo;
                } else {
                    equipos.push(equipo);
                }
                guardarDatos(); // Guardar los datos del equipo
                actualizarTabla();
                modalEquipo.hide();
                formEquipo.reset();
                equipoEditandoId = null;
                contadorJugadores = 0;
                jugadoresContainer.innerHTML = '';
            });

            // Evento para descargar el JSON
            $('#btnDescargarJson').on('click', function () {
                const json = JSON.stringify(equipos, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'equipos.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });

            // Cargar datos iniciales al cargar la página
            cargarDatosIniciales();
        });
