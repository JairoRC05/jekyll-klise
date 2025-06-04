// js/tables.js

// Referencias a las instancias de DataTables
let playersDataTable;
let teamsDataTable;
let tablaGrupoNorte;
let tablaGrupoSur;

// Inicializa las tablas de puntos de grupo (Norte y Sur)
function initializePointsTables(equiposNorte, equiposSur) {
    const numPartidos = 14;

    const matchColumns = [];
    for (let i = 1; i <= numPartidos; i++) {
        matchColumns.push({
            data: `partidos.M${i}`,
            title: `M${i}`,
            className: 'editable-points text-center',
            render: function(data, type, row) {
                return data === undefined ? '0' : data;
            }
        });
    }

    const baseColumns = [{ data: 'team', title: 'Nombre Equipo' }, { data: 'tag', title: 'Tag' }];
    const totalPointsColumn = { data: 'puntosTotales', title: 'Puntos Totales', className: 'fw-bold text-center' };

    const norteColumns = [...baseColumns, ...matchColumns, totalPointsColumn];
    const surColumns = [...baseColumns, ...matchColumns, totalPointsColumn];

    if (tablaGrupoNorte) { tablaGrupoNorte.destroy(); }
    tablaGrupoNorte = $('#tablaGrupoNorte').DataTable({
        data: equiposNorte,
        columns: norteColumns,
        paging: false, info: false, searching: false, ordering: false, scrollX: true,
        columnDefs: [{ width: '150px', targets: [0, 1] }, { width: '60px', targets: '_all' }],
        rowCallback: function(row, data) { $(row).attr('data-team-tag', data.tag); }
    });

    if (tablaGrupoSur) { tablaGrupoSur.destroy(); }
    tablaGrupoSur = $('#tablaGrupoSur').DataTable({
        data: equiposSur,
        columns: surColumns,
        paging: false, info: false, searching: false, ordering: false, scrollX: true,
        columnDefs: [{ width: '150px', targets: [0, 1] }, { width: '60px', targets: '_all' }],
        rowCallback: function(row, data) { $(row).attr('data-team-tag', data.tag); }
    });

    setupEditableCells(tablaGrupoNorte, numPartidos);
    setupEditableCells(tablaGrupoSur, numPartidos);
}

// Habilita la edición en línea para las celdas de marcadores
function setupEditableCells(dataTableInstance, numPartidos) {
    const editableColsStart = 2; // Columnas donde empiezan los partidos
    const editableColsEnd = editableColsStart + numPartidos - 1;

    dataTableInstance.cells().every(function() {
        const cell = this;
        const colIndex = cell.index().column;

        if (colIndex >= editableColsStart && colIndex <= editableColsEnd) {
            $(cell.node()).on('click', function() {
                const originalContent = cell.data();
                const input = $('<input type="text" class="form-control form-control-sm text-center" value="' + originalContent + '">');

                $(this).html(input);
                input.focus();

                input.on('blur change', function() {
                    let newValue = $(this).val().trim().toUpperCase();
                    const validScores = ['3', '2', '1', '0', 'R', 'D', 'NJ', ''];
                    if (!validScores.includes(newValue) && !isNaN(parseInt(newValue)) && parseInt(newValue) >= 0) {
                        newValue = String(parseInt(newValue));
                    } else if (!validScores.includes(newValue)) {
                        newValue = originalContent;
                        Swal.fire({
                            icon: 'warning', title: 'Entrada Inválida', text: 'Valor de marcador no válido. Usar números (0-3), R, D, o NJ.',
                            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
                        });
                    }
                    cell.data(newValue).draw();
                    $(cell.node()).addClass('modified-cell');
                }).on('keypress', function(e) {
                    if (e.which == 13) { $(this).blur(); }
                });
            });
        }
    });
}

// Función para inicializar la tabla principal de jugadores
function initializePlayersTable() {
    playersDataTable = $('#playersTable').DataTable({
        data: window.getFlatPlayersData(),
        columns: [
            { data: 'nickname', title: 'Nickname' }, // Columna 0
            { data: 'ID', title: 'ID' },           // Columna 1
            {
                data: 'avatar',                     // Columna 2
                title: 'Avatar',
                render: function(data, type, row) {
                    return data ? `<img src="${data}" alt="Avatar" class="player-avatar">` : 'N/A';
                }
            },
            { data: 'teamTag', title: 'Tag Equipo' },   // <-- CAMBIO CRUCIAL: Columna 3, usa 'teamTag'
            { data: 'teamName', title: 'Nombre Equipo' }, // <-- Columna 4, usa 'teamName'
            {
                data: 'teamActivo',
                title: 'Estado Equipo',
                render: function(data, type, row) {
                    return data ? '<span class="badge bg-success"><i class="bi bi-check-circle-fill"></i> Activo</span>' : '<span class="badge bg-danger"><i class="bi bi-x-circle-fill"></i> Inactivo</span>';
                }
            },
            {
                data: null,
                title: 'Acciones',
                render: function(data, type, row) {
                    return `<button class="btn btn-sm btn-danger" onclick="window.removePlayer('${row.ID}')" title="Eliminar Jugador"><i class="bi bi-trash-fill"></i></button>`;
                },
                orderable: false,
                searchable: false
            }
        ],
        responsive: true,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json'
        }
    });
    window.playersDataTable = playersDataTable;
}

// Función para inicializar la tabla principal de equipos
function initializeTeamsTable() {
    // Asegúrate de que allTeamData está accesible globalmente (ej. window.allTeamData)
    teamsDataTable = $('#teamsTable').DataTable({
        data: window.allTeamData,
        columns: [
            { data: 'tag', title: 'Tag', className: 'editable-team' },
            { data: 'team', title: 'Nombre del Equipo', className: 'editable-team' },
            { data: 'capitan', title: 'Capitán', className: 'editable-team' },
            {
                data: null,
                title: '# Jugadores',
                className: 'player-count-cell',
                render: function(data, type, row) {
                    return row.jugadores ? row.jugadores.length : 0;
                }
            },
            { data: 'region', title: 'Región', className: 'editable-team' },
            {
                data: 'activo',
                title: 'Estado',
                render: function(data, type, row) {
                    return data ? '<span class="badge bg-success"><i class="bi bi-check-circle-fill"></i> Activo</span>' : '<span class="badge bg-danger"><i class="bi bi-x-circle-fill"></i> Inactivo</span>';
                }
            },
            {
                data: 'puntosTotales',
                title: 'Puntos Totales',
                className: 'fw-bold text-center'
            },
            {
                data: null,
                title: 'Acciones',
                render: function(data, type, row) {
                    const statusButton = row.activo ?
                        `<button class="btn btn-sm btn-warning me-1" onclick="window.toggleTeamStatus('${row.tag}')" title="Desactivar Equipo"><i class="bi bi-toggle-off"></i></button>` :
                        `<button class="btn btn-sm btn-success me-1" onclick="window.toggleTeamStatus('${row.tag}')" title="Activar Equipo"><i class="bi bi-toggle-on"></i></button>`;

                    const downloadButton = `<button class="btn btn-sm btn-outline-primary me-1" onclick="window.downloadTeamJson('${row.tag}')" title="Descargar JSON del Equipo"><i class="bi bi-download"></i></button>`;

                    const editDetailsButton = `<button class="btn btn-sm btn-info me-1" onclick="window.openEditTeamModal('${row.tag}')" title="Editar Detalles Avanzados"><i class="bi bi-pencil-square"></i></button>`;

                    const reportPdfButton = `<button class="btn btn-sm btn-danger me-1" onclick="window.generateTeamPlayersPdf('${row.tag}')" title="Generar Reporte PDF de Jugadores"><i class="bi bi-file-earmark-pdf"></i></button>`;
                    const reportCsvButton = `<button class="btn btn-sm btn-success" onclick="window.generateTeamPlayersCsv('${row.tag}')" title="Generar Reporte CSV de Jugadores"><i class="bi bi-file-earmark-spreadsheet"></i></button>`;

                    if (row.tag === 'SIN_EQUIPO') {
                        return `<button class="btn btn-sm btn-secondary me-1" disabled title="No se puede desactivar"><i class="bi bi-slash-circle"></i></button>` + downloadButton;
                    }
                    return statusButton + downloadButton + editDetailsButton + reportPdfButton + reportCsvButton;
                },
                orderable: false,
                searchable: false
            }
        ],
        responsive: true,
        createdRow: function (row, data, dataIndex) {
          $(row).find('.editable-team').each(function() {
                    const cell = this;
                    $(cell).on('click', function() {
                        if ($(this).find('input').length > 0) { // Evita múltiples inputs
                            return;
                        }
                        const originalValue = $(this).text();
                        const columnName = teamsDataTable.column(cell).dataSrc(); // Obtiene el nombre de la columna (ej. 'team', 'tag')

                        const input = $('<input type="text" class="form-control form-control-sm" value="' + originalValue + '">');
                        $(this).html(input);
                        input.focus();

                        input.on('blur keypress', function(e) {
                            if (e.type === 'blur' || e.which === 13) { // Blur o Enter
                                let newValue = $(this).val().trim();
                                // Aquí puedes añadir validaciones específicas para team, tag, capitan, region
                                if (newValue === '') { // No permitir valores vacíos
                                    newValue = originalValue;
                                    Swal.fire({
                                        icon: 'warning', title: 'Campo Vacío', text: 'El campo no puede estar vacío.',
                                        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000
                                    });
                                }

                                // Actualizar el dato en el objeto allTeamData
                                const teamIndex = window.allTeamData.findIndex(t => t.tag === data.tag);
                                if (teamIndex !== -1) {
                                    if (columnName === 'tag') {
                                        // Si el tag cambia, asegúrate de actualizar todas las referencias
                                        // Esto es más complejo y podrías necesitar un método para ello
                                        // Por ahora, simplemente actualiza
                                        window.allTeamData[teamIndex][columnName] = newValue;
                                    } else {
                                        window.allTeamData[teamIndex][columnName] = newValue;
                                    }
                                    window.saveAllTeamData();
                                    window.refreshTables(); // Refrescar las tablas
                                }
                                $(cell).text(newValue); // Restaurar el texto en la celda
                            }
                        });
                    });
                });
        }
    });
    
    window.teamsDataTable = teamsDataTable;
}

// Refresco general de todas las tablas
function refreshTables() {
    // Este console.log es fundamental para ver qué datos recibe refreshTables
    console.log("Refrescando tablas. allTeamData para teamsDataTable:", window.allTeamData);

     // REFRESCAR LA TABLA DE JUGADORES
    if (window.playersDataTable) { // Verifica si la tabla de jugadores ya está inicializada
        const currentPlayersData = window.getFlatPlayersData(); // Obtiene los últimos datos de jugadores
        console.log("Datos para playersDataTable:", currentPlayersData);
        window.playersDataTable.clear().rows.add(currentPlayersData).draw();
        console.log("playersDataTable refrescada.");
    } else {
        console.warn("playersDataTable no está inicializada al intentar refrescar. Inicializando ahora.");
        window.initializePlayersTable();
        // Si se inicializa aquí, asegúrate de que también se dibujan los datos
        window.playersDataTable.clear().rows.add(window.getFlatPlayersData()).draw();
    }

    // Recalcula puntos antes de refrescar la tabla de equipos
    window.allTeamData.forEach(team => {
        team.puntosTotales = window.calculateTotalPoints(team);
    });

    if (window.teamsDataTable) {
        // Limpia los datos existentes y añade los nuevos de allTeamData
        window.teamsDataTable.clear().rows.add(window.allTeamData).draw();
        console.log("teamsDataTable refrescada con:", window.allTeamData);
    } else {
        console.warn("teamsDataTable no está inicializada al intentar refrescar.");
        // Si no está inicializada, intenta inicializarla aquí como último recurso
        window.initializeTeamsTable();
        window.teamsDataTable.clear().rows.add(window.allTeamData).draw();
    }

    // ... (refresco de tablas de puntos y otras estadísticas) ...
    const { equiposNorte, equiposSur } = window.allTeamData.reduce((acc, team) => {
        if (window.grupoNorteTags.includes(team.tag.toUpperCase())) {
            acc.equiposNorte.push(team);
        } else if (team.tag !== 'SIN_EQUIPO') { // Excluir SIN_EQUIPO del grupo Sur si no lo deseas allí
            acc.equiposSur.push(team);
        }
        return acc;
    }, { equiposNorte: [], equiposSur: [] });

    if (window.tablaGrupoNorte && window.tablaGrupoSur) {
        window.tablaGrupoNorte.clear().rows.add(equiposNorte).draw();
        window.tablaGrupoSur.clear().rows.add(equiposSur).draw();
    } else {
        console.warn("Tablas de grupo no inicializadas al intentar refrescar. Inicializando ahora.");
        window.initializePointsTables(equiposNorte, equiposSur);
    }

    window.populateTeamDatalist();
    window.updateGlobalStats();
}

// Exportar instancias de DataTables y funciones de inicialización
window.playersDataTable = playersDataTable;
window.teamsDataTable = teamsDataTable;
window.tablaGrupoNorte = tablaGrupoNorte;
window.tablaGrupoSur = tablaGrupoSur;
window.initializePlayersTable = initializePlayersTable;
window.initializeTeamsTable = initializeTeamsTable;
window.initializePointsTables = initializePointsTables;
window.setupEditableCells = setupEditableCells;
window.refreshTables = refreshTables;