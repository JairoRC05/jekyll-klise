// Variable global para almacenar los datos de todos los equipos y jugadores.
// Se inicializa desde localStorage si hay datos guardados, de lo contrario, inicia vacío.
let allTeamData = JSON.parse(localStorage.getItem('allTeamData')) || [];

// Variables para las instancias de DataTables
let playersDataTable;
let teamsDataTable;

// --- Funciones de Utilidad ---

async function loadExternalMatchData() {
    const filePaths = ['/assets/partidos/pnorte.json', '/assets/partidos/psur.json', '/assets/partidos/cruces.json'];
    const fetchPromises = filePaths.map(path =>
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${path}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Error al cargar ${path}:`, error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Carga',
                    text: `No se pudo cargar el archivo de partidos: ${path}. Asegúrate de que existe y es accesible.`,
                    confirmButtonText: 'Entendido'
                });
                return null; // Devuelve null para que Promise.all no falle por un archivo
            })
    );

    try {
        const results = await Promise.all(fetchPromises);
        allExternalMatches = []; // Limpiar antes de poblar
        results.forEach((data, index) => {
            if (data && Array.isArray(data)) {
                const sourceFile = filePaths[index].split('/').pop(); // Obtener el nombre del archivo (e.g., pnorte.json)
                data.forEach(group => {
                    if (group.rondas && Array.isArray(group.rondas)) {
                        group.rondas.forEach(ronda => {
                            if (ronda.partidos && Array.isArray(ronda.partidos)) {
                                ronda.partidos.forEach(partido => {
                                    // Añade una referencia al archivo de origen para depuración/información
                                    partido.sourceFile = sourceFile;
                                    allExternalMatches.push(partido);
                                });
                            }
                        });
                    }
                });
            }
        });
        console.log('Partidos externos cargados:', allExternalMatches.length, 'partidos.');
    } catch (error) {
        console.error('Error general al procesar archivos de partidos:', error);
    }
}

/**
 * Guarda el array allTeamData en localStorage.
 */
function saveAllTeamData() {
    localStorage.setItem('allTeamData', JSON.stringify(allTeamData));
}

/**
 * Normaliza y devuelve un array plano de todos los jugadores de todos los equipos.
 * Cada objeto jugador tendrá una propiedad 'teamTag' para identificar a su equipo.
 * Esto es necesario para la tabla global de jugadores.
 */
function getFlatPlayersData() {
    const flatPlayers = [];
    allTeamData.forEach(team => {
        team.jugadores.forEach(player => {
            flatPlayers.push({
                ID: player.ID,
                nickname: player.nickname,
                avatar: player.avatar || 'male1', // Asegura un avatar por defecto
                teamTag: team.tag // Añade la referencia al equipo del jugador
            });
        });
    });
    return flatPlayers;
}

/**
 * Rellena el datalist de selección de equipo en el formulario "Añadir Jugador".
 * Incluye solo equipos activos y que tengan menos de 8 jugadores, excluyendo el equipo "SIN_EQUIPO".
 */
function populateTeamDatalist() {
    const datalistElement = $('#datalistOptions');
    datalistElement.empty();

    allTeamData.forEach(team => {
        if (team.activo && team.tag !== 'SIN_EQUIPO' && team.jugadores.length < 8) {
            datalistElement.append(`<option value="${team.tag}">${team.team} (${team.tag})</option>`);
        }
    });
}


/**
 * NUEVO: Rellena el datalist de selección de equipo en el modal "Reasignar Jugador".
 * Incluye solo equipos activos y que tengan menos de 8 jugadores, excluyendo el equipo "SIN_EQUIPO"
 * y el equipo actual del jugador que se está reasignando.
 * @param {string} currentPlayerTeamTag El tag del equipo actual del jugador que se reasigna.
 */
function populateReassignTeamDatalist(currentPlayerTeamTag) {
    const datalistElement = $('#reassignDatalistOptions');
    datalistElement.empty();

    allTeamData.forEach(team => {
        // Excluir "SIN_EQUIPO" y el equipo actual del jugador, y solo equipos activos con espacio
        if (team.activo && team.tag !== 'SIN_EQUIPO' && team.tag !== currentPlayerTeamTag && team.jugadores.length < 8) {
            datalistElement.append(`<option value="${team.tag}">${team.team} (${team.tag})</option>`);
        }
    });
}

/**
 * NUEVO: Abre el modal de reasignación de jugador y precarga los datos del jugador.
 * @param {string} playerID El ID del jugador a reasignar.
 */
function openReassignPlayerModal(playerID) {
    // Buscar al jugador
    let playerObj = null;
    let currentTeamTag = null;
    for (const team of allTeamData) {
        playerObj = team.jugadores.find(p => p.ID === playerID);
        if (playerObj) {
            currentTeamTag = team.tag; // Guardamos el tag del equipo actual
            break;
        }
    }

    if (!playerObj) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo encontrar el jugador para reasignar.',
        });
        return;
    }

    // Pre-rellenar el modal
    $('#reassignPlayerNickname').text(playerObj.nickname);
    $('#reassignPlayerID').val(playerID); // Campo oculto para el ID
    $('#reassignTeamTagInput').val(''); // Limpiar el input del datalist
    applyValidationClass($('#reassignTeamTagInput'), true); // Resetear estado de validación

    // Poblar el datalist con equipos disponibles (excluyendo el equipo actual del jugador)
    populateReassignTeamDatalist(currentTeamTag);

    // Abrir el modal
    const reassignModal = new bootstrap.Modal(document.getElementById('reassignPlayerModal'));
    reassignModal.show();
}

/**
 * Genera y descarga el archivo JSON de todos los datos (equipos y jugadores).
 */
function exportAllData() {
    if (allTeamData.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No hay datos para exportar',
            text: 'Crea algunos equipos y jugadores antes de intentar exportar.',
        });
        return;
    }

    const dataStr = JSON.stringify(allTeamData, null, 4); // El '4' es para una indentación bonita
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const date = new Date();
    const filename = `gestor_equipos_jugadores_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}.json`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Libera la URL del objeto

    Swal.fire({
        icon: 'success',
        title: 'Exportación Exitosa',
        text: `Todos los datos han sido descargados en "${filename}".`,
        timer: 2000,
        showConfirmButton: false
    });
}

/**
 * Procesa el archivo JSON seleccionado por el usuario para importar datos.
 * @param {File} file El objeto File del archivo JSON.
 */
function importAllData(file) {
    if (!file) {
        Swal.fire({
            icon: 'error',
            title: 'Archivo no seleccionado',
            text: 'Por favor, selecciona un archivo JSON para importar.',
        });
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const importedData = JSON.parse(event.target.result);

            // Validación básica para asegurar que el formato es similar al esperado
            if (!Array.isArray(importedData) || importedData.some(team => !team.tag || !team.jugadores || !Array.isArray(team.jugadores))) {
                Swal.fire({
                    icon: 'error',
                    title: 'Formato de archivo inválido',
                    text: 'El archivo JSON no parece tener el formato correcto de datos de equipos y jugadores. Asegúrate de que sea un archivo exportado previamente por esta aplicación.',
                });
                return;
            }

            Swal.fire({
                title: '¿Estás seguro?',
                html: 'Importar datos **reemplazará** todos los equipos y jugadores actuales. Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, importar y reemplazar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    allTeamData = importedData; // Reemplaza los datos actuales
                    saveAllTeamData();
                    refreshTables(); // Vuelve a dibujar las tablas con los nuevos datos
                    Swal.fire(
                        '¡Importado!',
                        'Los datos han sido importados exitosamente.',
                        'success'
                    );
                } else {
                    Swal.fire(
                        'Importación Cancelada',
                        'Los datos actuales no fueron modificados.',
                        'info'
                    );
                }
            });

        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error al leer el archivo',
                text: 'Asegúrate de que el archivo seleccionado es un JSON válido. ' + e.message,
            });
        }
    };

    reader.onerror = function () {
        Swal.fire({
            icon: 'error',
            title: 'Error de lectura',
            text: 'No se pudo leer el archivo.',
        });
    };

    reader.readAsText(file); // Lee el contenido del archivo como texto
}

/**
 * NUEVO: Abre el modal de edición avanzada de equipo y precarga los datos.
 * @param {string} teamTag El tag del equipo a editar.
 */
function openEditTeamModal(teamTag) {
    const teamToEdit = allTeamData.find(team => team.tag === teamTag);

    if (!teamToEdit) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo encontrar el equipo para editar.',
        });
        return;
    }

    // Pre-rellenar el modal con los datos del equipo
    $('#editTeamTagSpan').text(teamToEdit.tag); // Mostrar el tag en el título del modal
    $('#editTeamOriginalTag').val(teamToEdit.tag); // Guardar el tag original en un campo oculto

    $('#editTeamOrg').val(teamToEdit.org || '');
    $('#editTeamNombreAnterior').val(teamToEdit.teamNombreAnterior || '');
    $('#editTeamNuevoNombre').val(teamToEdit.teamNuevoNombre || teamToEdit.team); // Muestra el nombre actual
    $('#editTeamSeguro').val(teamToEdit.seguro ? 'true' : 'false'); // Convertir booleano a string para el select
    $('#editTeamLink').val(teamToEdit.link || '');
    $('#editTeamGrupo').val(teamToEdit.grupo || 'SIN ASIGNAR');
    $('#editTeamPosicionDesempate').val(teamToEdit.posicionDesempate ? 'true' : 'false'); // Convertir booleano a string para el select

    // Limpiar clases de validación al abrir el modal
    $('#editTeamForm .form-control, #editTeamForm .form-select').removeClass('is-valid is-invalid');

    // Abrir el modal
    const editModal = new bootstrap.Modal(document.getElementById('editTeamModal'));
    editModal.show();
}


// --- NUEVA FUNCIÓN PARA ESTADÍSTICAS ---

/**
 * Calcula y muestra las estadísticas básicas de equipos y jugadores.
 */
function updateGlobalStats() {
    const totalTeams = allTeamData.length - 1; // Excluir el equipo "SIN_EQUIPO"
    const totalPlayers = getFlatPlayersData().length;
    const activeTeams = allTeamData.filter(team => team.activo && team.tag !== 'SIN_EQUIPO').length;
    const playersNoTeam = allTeamData.find(team => team.tag === 'SIN_EQUIPO')?.jugadores.length || 0;

    $('#statTotalTeams').text(totalTeams);
    $('#statTotalPlayers').text(totalPlayers);
    $('#statActiveTeams').text(activeTeams);
    $('#statPlayersNoTeam').text(playersNoTeam);
}

/**
 * Actualiza ambas tablas de DataTables y los datalists de equipos.
 * También limpia las clases de validación de los formularios de modal.
 */
function refreshTables() {
    // Actualizar tabla de jugadores
    if (playersDataTable) {
        playersDataTable.clear().rows.add(getFlatPlayersData()).draw();
    }

    // Actualizar tabla de equipos
    if (teamsDataTable) {
        teamsDataTable.clear().rows.add(allTeamData).draw();
    }

    // Vuelve a poblar los datalists
    populateTeamDatalist();
    // populateReassignTeamDatalist() se llamará al abrir el modal específico

    // Limpiar clases de validación en todos los formularios modales
    // Limpiar clases de validación en todos los formularios modales
    $('#newTeamForm .form-control, #addPlayerForm .form-control, #reassignPlayerForm .form-control, #editTeamForm .form-control, #editTeamForm .form-select').removeClass('is-valid is-invalid');
    initializeTeamsTable();
    // NUEVO: Actualizar estadísticas cada vez que los datos cambian
    updateGlobalStats();

}

/**
 * Genera y descarga el archivo JSON para un equipo específico.
 * @param {string} teamTag - El tag del equipo a descargar.
 */
function downloadTeamJson(teamTag) {
    const team = allTeamData.find(t => t.tag === teamTag);
    if (team) {
        console.log('--- En downloadTeamJson ---');
        console.log('Equipo que se va a descargar:', JSON.parse(JSON.stringify(team))); // Verifica los datos justo antes de descargar

        const teamJson = JSON.stringify(team, null, 2); // Indentado para legibilidad
        const blob = new Blob([teamJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${team.team.replace(/\s/g, '_')}_${team.tag}_data.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Equipo no encontrado para descargar.',
        });
    }
}

/**
 * Asigna un jugador a estado "sin equipo".
 * @param {string} playerID - El ID del jugador a mover.
 */
function movePlayerToNoTeam(playerID) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Este jugador será puesto 'Sin Equipo' y no podrá ser editado directamente aquí. Tendrás que reasignarlo.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, poner sin equipo',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            let playerFound = false;
            let playerObj = null;
            let sourceTeamTag = null;

            // Encontrar al jugador y el equipo de origen
            for (let i = 0; i < allTeamData.length; i++) {
                const team = allTeamData[i];
                const playerIndex = team.jugadores.findIndex(p => p.ID === playerID);
                if (playerIndex !== -1) {
                    playerObj = team.jugadores[playerIndex];
                    sourceTeamTag = team.tag;
                    // Eliminar al jugador de su equipo actual
                    team.jugadores.splice(playerIndex, 1);
                    playerFound = true;
                    break;
                }
            }

            if (playerFound) {
                // Asegurar que el equipo "SIN_EQUIPO" existe
                let noTeam = allTeamData.find(t => t.tag === 'SIN_EQUIPO');
                if (!noTeam) {
                    noTeam = {
                        tag: "SIN_EQUIPO",
                        team: "Sin Equipo",
                        org: "",
                        activo: true, // El equipo 'sin equipo' siempre se considera activo para ser funcional
                        capitan: "N/A",
                        region: "N/A",
                        teamNombreAnterior: "",
                        teamNuevoNombre: "Sin Equipo",
                        seguro: false,
                        link: "/equipos/sin-equipo",
                        grupo: "N/A",
                        partidos: {},
                        jugadores: []
                    };
                    allTeamData.push(noTeam);
                }

                // Asignar el jugador al equipo "SIN_EQUIPO"
                // No asignar el teamTag al jugador directamente, se manejará en getFlatPlayersData
                noTeam.jugadores.push(playerObj);

                saveAllTeamData();
                refreshTables();
                Swal.fire(
                    '¡Movido!',
                    'El jugador ha sido puesto "Sin Equipo".',
                    'success'
                );
            } else {
                Swal.fire(
                    'Error',
                    'No se pudo encontrar al jugador para moverlo.',
                    'error'
                );
            }
        }
    });
}

/**
 * Cambia el estado de un equipo (activo/inactivo).
 * @param {string} teamTag - El tag del equipo a modificar.
 */
function toggleTeamStatus(teamTag) {
    const team = allTeamData.find(t => t.tag === teamTag);

    if (!team) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `No se encontró el equipo con el tag: ${teamTag}`,
        });
        return;
    }

    // No permitir desactivar el equipo "SIN_EQUIPO"
    if (team.tag === 'SIN_EQUIPO') {
        Swal.fire({
            icon: 'info',
            title: 'Acción No Permitida',
            text: 'El equipo "Sin Equipo" no puede ser desactivado.',
        });
        return;
    }

    const newStatus = !team.activo;
    const actionText = newStatus ? 'activar' : 'desactivar';
    const confirmIcon = newStatus ? 'question' : 'warning';
    const confirmButtonColor = newStatus ? '#28a745' : '#dc3545'; // Green for activate, Red for deactivate

    Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas ${actionText} el equipo "${team.team}"?`,
        icon: confirmIcon,
        showCancelButton: true,
        confirmButtonColor: confirmButtonColor,
        cancelButtonColor: '#6c757d', // Gris para cancelar
        confirmButtonText: `Sí, ${actionText}`,
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Si se desactiva un equipo, sus jugadores deben pasar a "SIN_EQUIPO"
            if (!newStatus && team.jugadores.length > 0) {
                let noTeam = allTeamData.find(t => t.tag === 'SIN_EQUIPO');
                if (!noTeam) {
                    noTeam = {
                        tag: "SIN_EQUIPO",
                        team: "Sin Equipo",
                        org: "",
                        activo: true,
                        capitan: "N/A",
                        region: "N/A",
                        teamNombreAnterior: "",
                        teamNuevoNombre: "Sin Equipo",
                        seguro: false,
                        link: "/equipos/sin-equipo",
                        grupo: "N/A",
                        partidos: {},
                        jugadores: []
                    };
                    allTeamData.push(noTeam);
                }
                // Mover todos los jugadores del equipo desactivado a "SIN_EQUIPO"
                noTeam.jugadores.push(...team.jugadores);
                team.jugadores = []; // Vaciar el array de jugadores del equipo desactivado
            }

            team.activo = newStatus;
            saveAllTeamData();
            refreshTables();
            Swal.fire(
                '¡Actualizado!',
                `El equipo "${team.team}" ahora está ${newStatus ? 'activo' : 'inactivo'}.`,
                'success'
            );
        }
    });
}


// --- Lógica Principal (cuando el DOM esté listo) ---

/**
 * Valida la longitud de un campo de texto.
 * @param {string} value El valor del campo.
 * @param {number} minLength La longitud mínima permitida.
 * @param {number} maxLength La longitud máxima permitida.
 * @returns {boolean} True si la longitud es válida, false en caso contrario.
 */
function isValidLength(value, minLength, maxLength) {
    const len = value.length;
    return len >= minLength && len <= maxLength;
}

/**
 * Aplica las clases de validación de Bootstrap a un campo.
 * @param {jQuery} element El elemento jQuery del campo de entrada.
 * @param {boolean} isValid True para 'is-valid', false para 'is-invalid'.
 */
function applyValidationClass(element, isValid) {
    element.removeClass('is-valid is-invalid');
    if (isValid) {
        element.addClass('is-valid');
    } else {
        element.addClass('is-invalid');
    }
}

/**
 * NUEVO: Procesa múltiples archivos JSON, cada uno representando un equipo, y los une a allTeamData.
 * Maneja duplicados de tags de equipo y IDs de jugadores.
 * @param {FileList} files La lista de objetos File seleccionados por el usuario.
 */
async function importMultipleTeams(files) {
    if (files.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No hay archivos seleccionados',
            text: 'Por favor, selecciona uno o más archivos JSON de equipo para importar.',
        });
        return;
    }

    const newTeams = [];
    const duplicatedTags = [];
    const duplicatedPlayerIDs = [];

    // Usamos Promise.all para esperar a que todos los archivos se lean
    const readPromises = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const fileContent = JSON.parse(event.target.result);
                    // Los JSON de equipo están en un array con un solo objeto de equipo
                    // Asegúrate de que el formato sea '[{...equipo...}]'
                    if (Array.isArray(fileContent) && fileContent.length === 1 && typeof fileContent[0] === 'object' && fileContent[0].tag) {
                        newTeams.push(fileContent[0]);
                        resolve();
                    } else {
                        // Si el archivo no tiene el formato esperado, lo saltamos
                        Swal.fire({
                            icon: 'warning',
                            title: 'Formato de archivo incorrecto',
                            text: `El archivo "${file.name}" no parece ser un JSON de equipo válido. Se omitirá.`,
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000
                        });
                        resolve(); // Resolvemos para que Promise.all no se detenga
                    }
                } catch (e) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de lectura',
                        text: `No se pudo leer el archivo "${file.name}". Asegúrate de que es un JSON válido.`,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                    resolve(); // Resolvemos para que Promise.all no se detenga
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    });

    // Esperar a que todos los archivos se hayan leído y procesado
    await Promise.all(readPromises);

    // Ahora procesar los equipos leídos y añadir a allTeamData
    newTeams.forEach(importedTeam => {
        // Normalizar el tag a mayúsculas
        importedTeam.tag = importedTeam.tag.toUpperCase();

        // Evitar importar el equipo SIN_EQUIPO
        if (importedTeam.tag === 'SIN_EQUIPO') {
            Swal.fire({
                icon: 'warning',
                title: 'Tag Reservado',
                text: `El equipo con tag "SIN_EQUIPO" no puede ser importado. Se omitirá.`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        const existingTeamIndex = allTeamData.findIndex(team => team.tag === importedTeam.tag);

        if (existingTeamIndex !== -1) {
            // Equipo ya existe, preguntar si desea reemplazar o fusionar jugadores
            duplicatedTags.push(importedTeam.tag);

            // Decidamos aquí la estrategia: no fusionar jugadores si el tag del equipo es duplicado.
            // Para simplificar, si el tag ya existe, no importamos ese equipo.
            // Si queremos fusionar o reemplazar, la lógica sería más compleja y requeriría otro modal.
            // Por ahora, simplemente lo saltamos.
            Swal.fire({
                icon: 'info',
                title: 'Equipo Duplicado',
                text: `El equipo con tag "${importedTeam.tag}" ya existe. Se omitirá la importación de este equipo.`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000
            });
            return;
        }

        // Antes de añadir el equipo, revisar IDs de jugadores duplicados
        const teamPlayersWithDuplicatedIDs = [];
        importedTeam.jugadores = importedTeam.jugadores.filter(player => {
            const isIDDuplicateGlobally = allTeamData.some(existingTeam =>
                existingTeam.jugadores.some(p => p.ID === player.ID)
            );
            if (isIDDuplicateGlobally) {
                duplicatedPlayerIDs.push({ nickname: player.nickname, ID: player.ID, teamTag: importedTeam.tag });
                return false; // No incluir este jugador
            }
            return true; // Incluir el jugador
        });

        // Asegurarse de que el equipo tenga una propiedad 'jugadores' (para el caso de archivos sin jugadores)
        if (!importedTeam.jugadores) {
            importedTeam.jugadores = [];
        }

        allTeamData.push(importedTeam);
    });

    saveAllTeamData();
    refreshTables();

    // Mostrar resumen de la importación
    let summaryText = 'Se han importado los equipos seleccionados.';
    if (duplicatedTags.length > 0) {
        summaryText += `<br><br>⚠️ **Advertencia:** Los siguientes equipos no se importaron porque su tag ya existe: <ul>${duplicatedTags.map(tag => `<li>${tag}</li>`).join('')}</ul>`;
    }
    if (duplicatedPlayerIDs.length > 0) {
        summaryText += `<br><br>⚠️ **Advertencia:** Los siguientes jugadores no se importaron porque su ID ya existe globalmente: <ul>${duplicatedPlayerIDs.map(p => `<li>${p.nickname} (ID: ${p.ID}) del equipo ${p.teamTag}</li>`).join('')}</ul>`;
    }

    Swal.fire({
        icon: 'success',
        title: 'Importación de Equipos Finalizada',
        html: summaryText,
        confirmButtonText: 'Entendido'
    });
}


/**
 * Genera un reporte PDF de los jugadores de un equipo específico.
 * @param {string} teamTag El tag del equipo.
 */
function generateTeamPlayersPdf(teamTag) {
    const team = allTeamData.find(t => t.tag === teamTag);
    if (!team || !team.jugadores || team.jugadores.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Sin jugadores',
            text: `El equipo "${teamTag}" no tiene jugadores para generar un reporte PDF.`,
        });
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Reporte de Jugadores - ${team.team} (${team.tag})`, 14, 22);

    doc.setFontSize(12);
    doc.text(`Capitán: ${team.capitan || 'N/A'}`, 14, 30);
    doc.text(`Región: ${team.region || 'N/A'}`, 14, 37);
    doc.text(`Estado: ${team.activo ? 'Activo' : 'Inactivo'}`, 14, 44);

    const tableColumn = ["Nickname", "ID", "Avatar"];
    const tableRows = [];

    team.jugadores.forEach(player => {
        const playerData = [
            player.nickname,
            player.ID,
            player.avatar
        ];
        tableRows.push(playerData);
    });

    doc.autoTable(tableColumn, tableRows, {
        startY: 55,
        headStyles: { fillColor: [33, 37, 41] }, // Dark color for table header
        alternateRowStyles: { fillColor: [242, 242, 242] }, // Light gray for alternate rows
        styles: { fontSize: 10, cellPadding: 3, overflow: 'linebreak' },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' }
        },
        didDrawPage: function (data) {
            // Footer (page number)
            doc.setFontSize(10);
            const pageCount = doc.internal.getNumberOfPages();
            doc.text(`Página ${data.pageNumber} de ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
    });

    const filename = `Reporte_${team.tag}_Jugadores_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);

    Swal.fire({
        icon: 'success',
        title: 'Reporte PDF Generado',
        text: `"${filename}" ha sido descargado.`,
        timer: 2000,
        showConfirmButton: false
    });
}

/**
 * Genera un reporte CSV de los jugadores de un equipo específico.
 * @param {string} teamTag El tag del equipo.
 */
function generateTeamPlayersCsv(teamTag) {
    const team = allTeamData.find(t => t.tag === teamTag);
    if (!team || !team.jugadores || team.jugadores.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Sin jugadores',
            text: `El equipo "${teamTag}" no tiene jugadores para generar un reporte CSV.`,
        });
        return;
    }

    const headers = ["Nickname", "ID", "Avatar", "Equipo"];
    const rows = team.jugadores.map(player => [
        `"${player.nickname.replace(/"/g, '""')}"`, // Escapar comillas dobles
        `"${player.ID.replace(/"/g, '""')}"`,
        `"${player.avatar.replace(/"/g, '""')}"`,
        `"${team.team.replace(/"/g, '""')} (${team.tag})"`
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach(row => {
        csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `Reporte_${team.tag}_Jugadores_${new Date().toISOString().slice(0, 10)}.csv`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Swal.fire({
        icon: 'success',
        title: 'Reporte CSV Generado',
        text: `"${filename}" ha sido descargado.`,
        timer: 2000,
        showConfirmButton: false
    });
}

/**
 * Inicializa y configura la tabla de equipos usando DataTables.
 * Los datos se cargan desde allTeamData.
 */
function initializeTeamsTable() {
    if (teamsDataTable) {
        teamsDataTable.destroy(); // Destruye la instancia existente para reinicializar
    }

    const activeTeams = allTeamData.filter(team => team.activo);

    teamsDataTable = $('#teamsTable').DataTable({
        data: activeTeams,
        columns: [
            { data: 'tag', title: 'Tag' },
            { data: 'team', title: 'Nombre Equipo' },
            {
                data: 'activo',
                title: 'Activo',
                render: function (data) {
                    return data ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-danger">No</span>';
                }
            },
            { data: 'capitan', title: 'Capitán' },
            { data: 'region', title: 'Región' },
            {
                data: 'seguro',
                title: 'Seguro',
                render: function (data) {
                    return data ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-danger">No</span>';
                }
            },
            { data: 'grupo', title: 'Grupo' },
            { // **NUEVA COLUMNA PARA "Partidos"**
                data: null,
                title: 'Partidos',
                render: function (data, type, row) {
                    return `<button class="btn btn-info btn-sm view-matches-btn" data-tag="${row.tag}"><i class="bi bi-eye"></i></button>`;
                },
                orderable: false,
                searchable: false // Agregado para que no se pueda buscar en esta columna
            },
            { // **COLUMNA DE "Acciones" (asegúrate de que esté correcta y al final)**
                data: null,
                title: 'Acciones',
                render: function (data, type, row) {
                    const statusButton = row.activo ?
                        `<button class="btn btn-sm btn-warning me-1" onclick="toggleTeamStatus('${row.tag}')" title="Desactivar Equipo"><i class="bi bi-toggle-off"></i></button>` :
                        `<button class="btn btn-sm btn-success me-1" onclick="toggleTeamStatus('${row.tag}')" title="Activar Equipo"><i class="bi bi-toggle-on"></i></button>`;

                    const downloadButton = `<button class="btn btn-sm btn-outline-primary me-1" onclick="downloadTeamJson('${row.tag}')" title="Descargar JSON del Equipo"><i class="bi bi-download"></i></button>`;

                    const editDetailsButton = `<button class="btn btn-sm btn-info me-1" onclick="openEditTeamModal('${row.tag}')" title="Editar Detalles Avanzados"><i class="bi bi-pencil-square"></i></button>`;

                    // NUEVO: Botones para reportes
                    const reportPdfButton = `<button class="btn btn-sm btn-danger me-1" onclick="generateTeamPlayersPdf('${row.tag}')" title="Generar Reporte PDF de Jugadores"><i class="bi bi-file-earmark-pdf"></i></button>`;
                    const reportCsvButton = `<button class="btn btn-sm btn-success" onclick="generateTeamPlayersCsv('${row.tag}')" title="Generar Reporte CSV de Jugadores"><i class="bi bi-file-earmark-spreadsheet"></i></button>`;

                    // Deshabilitar el botón de estado y edición para el equipo "SIN_EQUIPO"
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
        autoWidth: false,
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    });

    // Event listener for "Ver Partidos" button
    // IMPORTANT: This event listener needs to be inside initializeTeamsTable()
    // or called after the table is initialized, but ensure it's not duplicated
    // if initializeTeamsTable() is called multiple times without destroying previous listeners.
    $('#teamsTable tbody').off('click', '.view-matches-btn').on('click', '.view-matches-btn', function () {
        const teamTag = $(this).data('tag');
        showMatchesModal(teamTag);
    });


    // Existing event listeners for edit and delete buttons...
    $('#teamsTable tbody').off('click', '.edit-team-btn').on('click', '.edit-team-btn', function () {
        const teamTag = $(this).data('tag');
        openEditTeamModal(teamTag);
    });

    $('#teamsTable tbody').off('click', '.delete-team-btn').on('click', '.delete-team-btn', function () {
        const teamTag = $(this).data('tag');
        deleteTeam(teamTag);
    });
}

/**
 * Muestra un modal con los detalles de los partidos de un equipo y permite editarlos.
 * También muestra partidos encontrados en archivos externos para referencia.
 * @param {string} teamTag - El tag del equipo cuyos partidos se van a mostrar.
 */
function showMatchesModal(teamTag) {
    const team = allTeamData.find(t => t.tag === teamTag);

    if (team && team.partidos) {
        $('#matchesTeamName').text(team.team); // Establece el título del modal con el nombre del equipo
        $('#editMatchesTeamTag').val(team.tag); // Guarda el tag del equipo en el campo oculto

        const matchesInputList = $('#matchesInputList');
        matchesInputList.empty(); // Limpia el contenido anterior de la edición manual

        // Genera dinámicamente campos de entrada para cada partido de la edición manual
         const matchKeys = Object.keys(team.partidos).sort((a, b) => {
            const numA = parseInt(a.replace('M', ''), 10);
            const numB = parseInt(b.replace('M', ''), 10);
            return numA - numB;
        });

        matchKeys.forEach(matchKey => {
            // Obtenemos el valor tal cual está guardado.
            // Si es null o undefined, lo convertimos a una cadena vacía para facilitar la comparación.
            const matchValue = team.partidos[matchKey] === null || team.partidos[matchKey] === undefined ? '' : String(team.partidos[matchKey]);

            let displayValue = '';
            // Si matchValue NO es una cadena vacía, entonces construimos el texto del input.
            // Si es una cadena vacía, displayValue se queda como "", lo que dejará el input en blanco.
            if (matchValue !== '') {
                displayValue = `${matchValue}`;
            }

            matchesInputList.append(`
                <div class="col-md-4 mb-3">
                    <label for="match-${matchKey}" class="form-label">${matchKey}</label>
                    <input type="text" class="form-control" id="match-${matchKey}" data-match-key="${matchKey}" value="${displayValue}">
                </div>
            `);
        });

        // --- Novedad: Mostrar Partidos Encontrados en Archivos Externos ---
        const externalMatchesList = $('#externalMatchesList');
        externalMatchesList.empty(); // Limpia el contenido anterior

        // Filtra los partidos externos que involucran al equipo actual
        const teamExternalMatches = allExternalMatches.filter(match =>
            match.tag1 === teamTag || match.tag2 === teamTag
        );

        if (teamExternalMatches.length > 0) {
            // Ordenar los partidos externos por número de ronda y número de partido para una mejor visualización
            teamExternalMatches.sort((a, b) => {
                if (a.round_number !== b.round_number) {
                    return a.round_number - b.round_number;
                }
                return a.match_number - b.match_number;
            });

            teamExternalMatches.forEach(match => {
                const isTeam1 = match.tag1 === teamTag;
                const teamName1 = isTeam1 ? `<strong>${match.equipo1}</strong>` : match.equipo1;
                const teamName2 = !isTeam1 ? `<strong>${match.equipo2}</strong>` : match.equipo2;
                const matchResult = match.resultado === "VS" ? "VS" : `Resultado: ${match.resultado}`; // Muestra "VS" si no hay resultado

                externalMatchesList.append(`
                    <div class="card mb-2">
                        <div class="card-body py-2">
                            <h6 class="card-title mb-1">Ronda ${match.round_number} - Partido ${match.match_number}</h6>
                            <p class="card-text mb-1">
                                ${teamName1} vs ${teamName2} 
                            </p>
                            <p class="card-text mb-0">
                                <small class="text-muted">
                                    ${matchResult}
                                </small>
                            </p>
                            <small class="text-secondary">Origen: ${match.sourceFile}</small>
                        </div>
                    </div>
                `);
            });
        } else {
            externalMatchesList.append('<p class="text-muted">No se encontraron partidos para este equipo en los archivos externos.</p>');
        }

        const viewMatchesModal = new bootstrap.Modal(document.getElementById('viewMatchesModal'));
        viewMatchesModal.show();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontraron datos de partidos para este equipo.',
        });
    }
}

function saveMatchesChanges() {
    const teamTag = $('#editMatchesTeamTag').val();
    const teamToUpdate = allTeamData.find(t => t.tag === teamTag);

    if (teamToUpdate) {
        console.log('--- Antes de guardar cambios de partidos ---');
        console.log('Equipo actual (antes de actualizar):', JSON.parse(JSON.stringify(teamToUpdate))); // Copia profunda para ver el estado antes

        // Recorre todos los inputs con data-match-key y actualiza los valores
        $('#matchesInputList input[data-match-key]').each(function () {
            const matchKey = $(this).data('matchKey');
            const newMatchValue = $(this).val().trim();
            teamToUpdate.partidos[matchKey] = newMatchValue;
        });

        console.log('--- Después de actualizar en memoria ---');
        console.log('Equipo actualizado en memoria:', JSON.parse(JSON.stringify(teamToUpdate))); // Ve el estado después de la actualización en memoria

        saveAllTeamData(); // Guarda los cambios en localStorage
        console.log('Datos guardados en localStorage.');

        const viewMatchesModal = bootstrap.Modal.getInstance(document.getElementById('viewMatchesModal'));
        if (viewMatchesModal) {
            viewMatchesModal.hide(); // Oculta el modal
        }

        Swal.fire({
            icon: 'success',
            title: '¡Partidos Actualizados!',
            text: `Los partidos de "${teamToUpdate.team}" han sido guardados.`,
            timer: 2000,
            showConfirmButton: false
        });

    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: 'No se pudo encontrar el equipo para actualizar los partidos.',
        });
    }
}


$(document).ready(function () {

    loadExternalMatchData();
    // 1. Inicializar DataTable de Jugadores
    playersDataTable = $('#playersTable').DataTable({
        data: getFlatPlayersData(),
        columns: [
            { data: 'ID', title: 'ID', searchable: true },
            { data: 'nickname', title: 'Nickname', searchable: true, className: 'editable' },
            { data: 'avatar', title: 'Avatar', searchable: false, className: 'editable' },
            { data: 'teamTag', title: 'Equipo', searchable: true },
            {
                // Columna de acciones para jugador
                data: null,
                title: 'Acciones',
                render: function (data, type, row) {
                    const moveNoTeamButton = row.teamTag && row.teamTag !== 'SIN_EQUIPO' ?
                        `<button class="btn btn-sm btn-outline-danger me-1" onclick="movePlayerToNoTeam('${row.ID}')" title="Mover a Sin Equipo"><i class="bi bi-person-x-fill"></i></button>` :
                        ''; // No mostrar si ya está sin equipo

                    // NUEVO: Botón Reasignar
                    const reassignButton = `<button class="btn btn-sm btn-primary" onclick="openReassignPlayerModal('${row.ID}')" title="Reasignar Jugador"><i class="bi bi-shuffle"></i></button>`;

                    return moveNoTeamButton + reassignButton;
                },
                orderable: false,
                searchable: false
            }
        ],
        // Añadir una clase a la fila si el jugador no tiene equipo
        rowCallback: function (row, data) {
            if (data.teamTag === 'SIN_EQUIPO') {
                $(row).addClass('player-no-team');
            } else {
                $(row).removeClass('player-no-team');
            }
        }
    });

    // 2. Manejo de edición en línea para la tabla de jugadores
    $('#playersTable').on('click', '.editable', function () {
        const cell = $(this);
        const originalValue = cell.text();
        const column = playersDataTable.column(cell.index()).dataSrc();
        const rowData = playersDataTable.row(cell.parent()).data();
        const playerID = rowData.ID;
        const playerTeamTag = rowData.teamTag; // Obtener el tag del equipo del jugador

        // No permitir edición de jugadores en el equipo "SIN_EQUIPO" directamente desde aquí
        if (playerTeamTag === 'SIN_EQUIPO') {
            Swal.fire({
                icon: 'info',
                title: 'Edición Restringida',
                text: 'Los jugadores en el estado "Sin Equipo" no se pueden editar directamente. Debes reasignarlos a un equipo para modificarlos.',
            });
            return;
        }

        const input = $(`<input type="text" class="form-control form-control-sm" value="${originalValue}" style="width: 100%;" />`);
        cell.html(input);
        input.focus();

        const blurHandler = function () {
            const newValue = input.val().trim();
            if (newValue !== originalValue) {
                let playerFound = false;
                // Buscar al jugador en su equipo específico para eficiencia
                const team = allTeamData.find(t => t.tag === playerTeamTag);
                if (team) {
                    const playerIndex = team.jugadores.findIndex(p => p.ID === playerID);
                    if (playerIndex !== -1) {
                        team.jugadores[playerIndex][column] = newValue;
                        playerFound = true;
                    }
                }

                if (playerFound) {
                    saveAllTeamData();
                    refreshTables();
                    Swal.fire({
                        icon: 'success',
                        title: '¡Actualizado!',
                        text: `"${column}" del jugador "${rowData.nickname}" actualizado a "${newValue}".`,
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    cell.text(originalValue);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo encontrar al jugador para actualizar.',
                    });
                }
            } else {
                cell.text(originalValue); // Restaurar el valor original si no hubo cambios
            }
            input.off('blur keydown', blurHandler); // Eliminar el evento para evitar múltiples enlaces
        };

        input.on('blur', blurHandler);
        input.on('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur(); // Forzar el blur para activar el guardado
            }
        });
    });

    // 3. Inicializar DataTable de Equipos
    teamsDataTable = $('#teamsTable').DataTable({
        data: allTeamData,
        columns: [
            { data: 'tag', title: 'Tag', className: 'editable-team' },
            { data: 'team', title: 'Nombre Equipo', className: 'editable-team' },
            {
                data: 'activo',
                title: 'Activo',
                render: function (data) {
                    return data ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-danger">No</span>';
                }
            },
            { data: 'capitan', title: 'Capitán', className: 'editable-team' },
            { data: 'region', title: 'Región', className: 'editable-team' },
            {
                data: 'seguro',
                title: 'Seguro',
                render: function (data) {
                    return data ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-danger">No</span>';
                }
            },
            { data: 'grupo', title: 'Grupo' },
            { 
                data: null,
                title: 'Partidos',
                render: function (data, type, row) {
                    return `<button class="btn btn-info btn-sm view-matches-btn" data-tag="${row.tag}"><i class="bi bi-eye"></i></button>`;
                },
                orderable: false,
                searchable: false
            },
            { 
                data: null,
                title: 'Acciones',
                render: function (data, type, row) {
                    const statusButton = row.activo ?
                        `<button class="btn btn-sm btn-warning me-1" onclick="toggleTeamStatus('${row.tag}')" title="Desactivar Equipo"><i class="bi bi-toggle-off"></i></button>` :
                        `<button class="btn btn-sm btn-success me-1" onclick="toggleTeamStatus('${row.tag}')" title="Activar Equipo"><i class="bi bi-toggle-on"></i></button>`;

                    const downloadButton = `<button class="btn btn-sm btn-outline-primary me-1" onclick="downloadTeamJson('${row.tag}')" title="Descargar JSON del Equipo"><i class="bi bi-download"></i></button>`;

                    const editDetailsButton = `<button class="btn btn-sm btn-info me-1" onclick="openEditTeamModal('${row.tag}')" title="Editar Detalles Avanzados"><i class="bi bi-pencil-square"></i></button>`;

                    const reportPdfButton = `<button class="btn btn-sm btn-danger me-1" onclick="generateTeamPlayersPdf('${row.tag}')" title="Generar Reporte PDF de Jugadores"><i class="bi bi-file-earmark-pdf"></i></button>`;
                    const reportCsvButton = `<button class="btn btn-sm btn-success" onclick="generateTeamPlayersCsv('${row.tag}')" title="Generar Reporte CSV de Jugadores"><i class="bi bi-file-earmark-spreadsheet"></i></button>`;

                    if (row.tag === 'SIN_EQUIPO') {
                        return `<button class="btn btn-sm btn-secondary me-1" disabled title="No se puede desactivar"><i class="bi bi-slash-circle"></i></button>` + downloadButton;
                    }

                    return statusButton + downloadButton + editDetailsButton + reportPdfButton + reportCsvButton;
                },
                orderable: false,
                searchable: false

            }
        ],
        rowCallback: function (row, data) {
            if (!data.activo) {
                $(row).addClass('team-inactive');
            } else {
                $(row).removeClass('team-inactive');
            }
        }
    });

    $('#teamsTable').on('click', '.editable-team', function () {
        const cell = $(this);
        const originalValue = cell.text();
        const column = teamsDataTable.column(cell.index()).dataSrc();
        const rowData = teamsDataTable.row(cell.parent()).data();
        const currentTeamTag = rowData.tag; // El tag original del equipo

        // No permitir edición si el equipo está inactivo o es el equipo "SIN_EQUIPO"
        if (!rowData.activo || currentTeamTag === 'SIN_EQUIPO') {
            Swal.fire({
                icon: 'info',
                title: 'Edición Restringida',
                text: 'No se puede editar equipos inactivos o el equipo "Sin Equipo" directamente desde aquí. Primero activa el equipo si lo deseas editar.',
            });
            return;
        }

        const input = $(`<input type="text" class="form-control form-control-sm" value="${originalValue}" style="width: 100%;" />`);
        cell.html(input);
        input.focus();

        const blurHandler = function () {
            const newValue = input.val().trim();
            if (newValue !== originalValue) {
                // Si la columna que se edita es el 'tag'
                if (column === 'tag') {
                    const newTag = newValue.toUpperCase(); // Convertir a mayúsculas para tags

                    // Validar que el nuevo tag no esté vacío
                    if (!newTag) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Tag Inválido',
                            text: 'El tag del equipo no puede estar vacío.',
                        });
                        cell.text(originalValue);
                        return;
                    }

                    // Validar que el nuevo tag no sea "SIN_EQUIPO"
                    if (newTag === 'SIN_EQUIPO') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Tag No Permitido',
                            text: `El Tag "${newTag}" está reservado para jugadores sin equipo. Por favor, elige uno diferente.`,
                        });
                        cell.text(originalValue);
                        return;
                    }

                    // Validar unicidad del nuevo tag (excluyendo el equipo actual)
                    const isTagDuplicate = allTeamData.some(team =>
                        team.tag === newTag && team.tag !== currentTeamTag
                    );
                    if (isTagDuplicate) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Tag Duplicado',
                            text: `El Tag "${newTag}" ya está en uso por otro equipo.`,
                        });
                        cell.text(originalValue);
                        return;
                    }

                    // Confirmar el cambio de tag con SweetAlert
                    Swal.fire({
                        title: '¿Estás seguro?',
                        html: `Estás a punto de cambiar el Tag del equipo de <b>${currentTeamTag}</b> a <b>${newTag}</b>.<br>Esto actualizará a todos los jugadores vinculados.`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Sí, cambiar tag',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const teamToUpdate = allTeamData.find(team => team.tag === currentTeamTag);
                            if (teamToUpdate) {
                                // 1. Actualizar el tag del equipo
                                teamToUpdate.tag = newTag;
                                // 2. Actualizar el teamTag de todos los jugadores de ese equipo
                                teamToUpdate.jugadores.forEach(player => {
                                    player.teamTag = newTag; // Aunque getFlatPlayersData lo maneja, es buena práctica mantener la consistencia aquí
                                });

                                saveAllTeamData();
                                refreshTables(); // Refrescar ambas tablas
                                Swal.fire({
                                    icon: 'success',
                                    title: '¡Tag Actualizado!',
                                    text: `El Tag de "${rowData.team}" ha cambiado de "${currentTeamTag}" a "${newTag}".`,
                                    timer: 2000,
                                    showConfirmButton: false
                                });
                            } else {
                                cell.text(originalValue);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'No se pudo encontrar el equipo para actualizar el tag.',
                                });
                            }
                        } else {
                            cell.text(originalValue); // El usuario canceló, restaurar el valor original
                        }
                    });

                } else { // Si la columna no es 'tag' (es 'team', 'capitan', 'region')
                    const teamToUpdate = allTeamData.find(team => team.tag === currentTeamTag);

                    if (teamToUpdate) {
                        teamToUpdate[column] = newValue; // Actualizar la propiedad específica
                        saveAllTeamData();
                        refreshTables();
                        Swal.fire({
                            icon: 'success',
                            title: '¡Actualizado!',
                            text: `"${column}" del equipo "${teamToUpdate.team}" actualizado a "${newValue}".`,
                            timer: 1500,
                            showConfirmButton: false
                        });
                    } else {
                        cell.text(originalValue);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo encontrar el equipo para actualizar.',
                        });
                    }
                }
            } else {
                cell.text(originalValue); // Restaurar el valor original si no hubo cambios
            }
            input.off('blur keydown', blurHandler);
        };

        input.on('blur', blurHandler);
        input.on('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            }
        });
    });

    $(document).ready(function () {
        refreshTables();
        populateTeamDatalist();

        // Event listeners para los formularios
        $('#addTeamForm').on('submit', function (e) {
            e.preventDefault();
            addTeam();
        });

        $('#editTeamForm').on('submit', function (e) {
            e.preventDefault();
        });

        $('#addPlayerForm').on('submit', function (e) {
            e.preventDefault();
            addPlayer();
        });

        $('#editPlayerForm').on('submit', function (e) {
            e.preventDefault();
        });

        // ¡NUEVO! Event listener para el formulario de edición de partidos
        $('#editMatchesForm').on('submit', function (e) {
            e.preventDefault();
            saveMatchesChanges();
        });

        // Event listener para los clicks en las pestañas
        $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
            const targetTab = $(e.target).attr('data-bs-target');
            if (targetTab === '#teamsTab') {
                if (teamsDataTable) {
                    teamsDataTable.columns.adjust().responsive.recalc();
                }
            } else if (targetTab === '#playersTab') {
                if (playersDataTable) {
                    playersDataTable.columns.adjust().responsive.recalc();
                }
            }
        });

    });


    // 4. Manejo del formulario para Crear Nuevo Equipo (dentro del modal)
    $('#newTeamForm').on('submit', function (e) {
        e.preventDefault();

        const newTeamTagInput = $('#newTeamTag');
        const newTeamNameInput = $('#newTeamName');
        const newTeamCaptainInput = $('#newTeamCaptain');
        const newTeamRegionInput = $('#newTeamRegion');

        const newTeamTag = newTeamTagInput.val().trim().toUpperCase();
        const newTeamName = newTeamNameInput.val().trim();
        const newTeamCaptain = newTeamCaptainInput.val().trim();
        const newTeamRegion = newTeamRegionInput.val().trim();

        let isValidForm = true; // Bandera para controlar la validez del formulario

        // Validación Tag
        if (!newTeamTag || !isValidLength(newTeamTag, 1, 7)) { // Tag max 7 caracteres
            applyValidationClass(newTeamTagInput, false);
            isValidForm = false;
        } else {
            applyValidationClass(newTeamTagInput, true);
        }

        // Validación Nombre de Equipo
        if (!newTeamName || !isValidLength(newTeamName, 1, 25)) { // Equipo max 25 caracteres
            applyValidationClass(newTeamNameInput, false);
            isValidForm = false;
        } else {
            applyValidationClass(newTeamNameInput, true);
        }

        // Validación Capitán
        if (!newTeamCaptain) { // No hay restricción de longitud específica, solo que no esté vacío
            applyValidationClass(newTeamCaptainInput, false);
            isValidForm = false;
        } else {
            applyValidationClass(newTeamCaptainInput, true);
        }

        // Validación Región
        if (!newTeamRegion) { // No hay restricción de longitud específica, solo que no esté vacío
            applyValidationClass(newTeamRegionInput, false);
            isValidForm = false;
        } else {
            applyValidationClass(newTeamRegionInput, true);
        }

        if (!isValidForm) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos Incompletos o Inválidos',
                text: 'Por favor, corrige los errores en los campos resaltados.',
            });
            return;
        }

        // Validaciones de lógica de negocio (duplicados, tags reservados)
        if (newTeamTag === 'SIN_EQUIPO') {
            applyValidationClass(newTeamTagInput, false); // Marca el campo como inválido
            Swal.fire({
                icon: 'error',
                title: 'Tag No Permitido',
                text: `El Tag "${newTeamTag}" está reservado para jugadores sin equipo. Por favor, elige uno diferente.`,
            });
            return;
        }

        if (allTeamData.some(team => team.tag === newTeamTag)) {
            applyValidationClass(newTeamTagInput, false); // Marca el campo como inválido
            Swal.fire({
                icon: 'error',
                title: 'Tag Duplicado',
                text: `El Tag de equipo "${newTeamTag}" ya existe. Por favor, elige uno diferente.`,
            });
            return;
        }

        // Si todas las validaciones pasan, procede a crear el equipo
        const newTeam = {
            tag: newTeamTag,
            team: newTeamName,
            org: "",
            activo: true,
            capitan: newTeamCaptain,
            region: newTeamRegion,
            teamNombreAnterior: "",
            teamNuevoNombre: newTeamName,
            seguro: false,
            link: `/equipos/${newTeamName.toLowerCase().replace(/\s/g, '-')}`,
            grupo: "SIN ASIGNAR",
            partidos: { "M1": "0", "M2": "0", "M3": "0", "M4": "0", "M5": "0", "M6": "0", "M7": "0", "M8": "0", "M9": "0", "M10": "0", "M11": "0", "M12": "0" },
            jugadores: []
        };

        allTeamData.push(newTeam);
        saveAllTeamData();
        refreshTables();
        $('#newTeamForm')[0].reset(); // Limpia el formulario
        // Eliminar las clases de validación después de un reseteo exitoso
        $('.form-control').removeClass('is-valid is-invalid');

        const newTeamModal = bootstrap.Modal.getInstance(document.getElementById('newTeamModal'));
        if (newTeamModal) {
            newTeamModal.hide();
        }

        Swal.fire({
            icon: 'success',
            title: '¡Equipo Creado!',
            text: `El equipo "${newTeamName}" ha sido creado exitosamente.`,
            timer: 2000,
            showConfirmButton: false
        });
    });

    // 5. Manejo del formulario para Añadir Jugador (dentro del modal)
    $('#addPlayerForm').on('submit', function (e) {
        e.preventDefault();

        const playerNicknameInput = $('#playerNickname');
        const playerIDInput = $('#playerID');
        const playerAvatarInput = $('#playerAvatar');
        const playerTeamTagInput = $('#playerTeamTagInput'); // Input del datalist

        const playerNickname = playerNicknameInput.val().trim();
        const playerID = playerIDInput.val().trim();
        const playerAvatar = playerAvatarInput.val().trim();
        const playerTeamTag = playerTeamTagInput.val().trim().toUpperCase();

        let isValidForm = true; // Bandera para controlar la validez del formulario

        // Validación Nickname
        if (!playerNickname || !isValidLength(playerNickname, 1, 12)) { // Nickname max 12 caracteres
            applyValidationClass(playerNicknameInput, false);
            isValidForm = false;
        } else {
            applyValidationClass(playerNicknameInput, true);
        }

        // Validación ID
        if (!playerID || !isValidLength(playerID, 1, 7)) { // ID max 7 caracteres
            applyValidationClass(playerIDInput, false);
            isValidForm = false;
        } else {
            applyValidationClass(playerIDInput, true);
        }

        // Validación Avatar (solo no vacío, si hay un valor por defecto no es estrictamente necesario)
        if (!playerAvatar) {
            applyValidationClass(playerAvatarInput, false);
            isValidForm = false;
        } else {
            applyValidationClass(playerAvatarInput, true);
        }


        // Validación Equipo (datalist)
        // No validamos longitud aquí, sino que el valor exista en la lista de tags válidos
        if (!playerTeamTag) {
            applyValidationClass(playerTeamTagInput, false);
            isValidForm = false;
        } else {
            // Se validará la existencia del equipo más adelante
            applyValidationClass(playerTeamTagInput, true); // Asume válido inicialmente
        }

        if (!isValidForm) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos Incompletos o Inválidos',
                text: 'Por favor, corrige los errores en los campos resaltados.',
            });
            return;
        }

        // Validaciones de lógica de negocio (duplicados, equipo existente, etc.)
        const isDuplicateID = allTeamData.some(team =>
            team.jugadores.some(player => player.ID === playerID)
        );
        if (isDuplicateID) {
            applyValidationClass(playerIDInput, false); // Marca el campo ID como inválido
            Swal.fire({
                icon: 'error',
                title: 'ID de Jugador Duplicado',
                text: `El ID de jugador "${playerID}" ya está en uso por otro jugador.`,
            });
            return;
        }

        const targetTeam = allTeamData.find(team => team.tag === playerTeamTag);
        if (!targetTeam || !targetTeam.activo || targetTeam.tag === 'SIN_EQUIPO') {
            applyValidationClass(playerTeamTagInput, false); // Marca el campo de equipo como inválido
            Swal.fire({
                icon: 'error',
                title: 'Equipo no Válido',
                text: `El equipo con Tag "${playerTeamTag}" no existe, está inactivo, o no es seleccionable. Por favor, elige uno de la lista.`,
            });
            return;
        }

        if (targetTeam.jugadores.length >= 8) {
            applyValidationClass(playerTeamTagInput, false); // Marca el campo de equipo como inválido
            Swal.fire({
                icon: 'warning',
                title: 'Equipo Lleno',
                text: `El equipo "${targetTeam.team}" ya tiene el máximo de 8 jugadores.`,
            });
            return;
        }

        // Si todas las validaciones pasan, procede a añadir el jugador
        const newPlayer = {
            nickname: playerNickname,
            ID: playerID,
            avatar: playerAvatar
        };

        targetTeam.jugadores.push(newPlayer);
        saveAllTeamData();
        refreshTables();
        $('#addPlayerForm')[0].reset(); // Limpia el formulario
        // Eliminar las clases de validación después de un reseteo exitoso
        $('.form-control').removeClass('is-valid is-invalid');


        const addPlayerModal = bootstrap.Modal.getInstance(document.getElementById('addPlayerModal'));
        if (addPlayerModal) {
            addPlayerModal.hide();
        }

        Swal.fire({
            icon: 'success',
            title: '¡Jugador Añadido!',
            text: `"${playerNickname}" ha sido añadido a "${targetTeam.team}".`,
            timer: 2000,
            showConfirmButton: false
        });
    });

    $('#newTeamTag, #newTeamName, #newTeamCaptain, #newTeamRegion').on('input', function () {
        const inputElement = $(this);
        const value = inputElement.val().trim();
        const id = inputElement.attr('id');

        // Aplicar validaciones de longitud y no vacío en tiempo real
        let isValid = true;
        if (id === 'newTeamTag') {
            isValid = value.length > 0 && isValidLength(value, 1, 7);
        } else if (id === 'newTeamName') {
            isValid = value.length > 0 && isValidLength(value, 1, 25);
        } else if (id === 'newTeamCaptain' || id === 'newTeamRegion') {
            isValid = value.length > 0;
        }

        // Aquí no podemos validar unicidad o tags reservados en tiempo real con solo 'input'
        // Esas validaciones se hacen en el submit.
        applyValidationClass(inputElement, isValid);
    });

    $('#playerNickname, #playerID, #playerAvatar, #playerTeamTagInput').on('input', function () {
        const inputElement = $(this);
        const value = inputElement.val().trim();
        const id = inputElement.attr('id');

        let isValid = true;
        if (id === 'playerNickname') {
            isValid = value.length > 0 && isValidLength(value, 1, 12);
        } else if (id === 'playerID') {
            isValid = value.length > 0 && isValidLength(value, 1, 7);
        } else if (id === 'playerAvatar') {
            isValid = value.length > 0;
        } else if (id === 'playerTeamTagInput') {
            isValid = value.length > 0; // Solo valida que no esté vacío, la existencia del equipo se valida en submit
        }
        applyValidationClass(inputElement, isValid);
    });

    // 6. Carga inicial de datos al iniciar la página

    // NUEVO: 7. Manejo del formulario para Reasignar Jugador (dentro del modal)
    $('#reassignPlayerForm').on('submit', function (e) {
        e.preventDefault();

        const playerIDToReassign = $('#reassignPlayerID').val();
        const newTeamTagInput = $('#reassignTeamTagInput');
        const newTeamTag = newTeamTagInput.val().trim().toUpperCase();

        let isValidForm = true;

        // Validar que se haya seleccionado un equipo
        if (!newTeamTag) {
            applyValidationClass(newTeamTagInput, false);
            isValidForm = false;
        } else {
            applyValidationClass(newTeamTagInput, true);
        }

        if (!isValidForm) {
            Swal.fire({
                icon: 'warning',
                title: 'Selección Inválida',
                text: 'Por favor, selecciona un equipo válido de la lista.',
            });
            return;
        }

        // Buscar el jugador actual y su equipo
        let playerObj = null;
        let originalTeam = null;
        for (let i = 0; i < allTeamData.length; i++) {
            const team = allTeamData[i];
            const playerIndex = team.jugadores.findIndex(p => p.ID === playerIDToReassign);
            if (playerIndex !== -1) {
                playerObj = team.jugadores[playerIndex];
                originalTeam = team;
                // Importante: Eliminar al jugador de su equipo actual ANTES de añadirlo al nuevo
                originalTeam.jugadores.splice(playerIndex, 1);
                break;
            }
        }

        if (!playerObj) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Jugador',
                text: 'No se pudo encontrar el jugador para reasignar.',
            });
            return;
        }

        // Buscar el nuevo equipo
        const targetTeam = allTeamData.find(team => team.tag === newTeamTag);

        // Validaciones del nuevo equipo
        if (!targetTeam || !targetTeam.activo || targetTeam.tag === 'SIN_EQUIPO') {
            applyValidationClass(newTeamTagInput, false);
            // Si el jugador fue movido del equipo original y no se asigna a uno válido, devolverlo.
            if (originalTeam && originalTeam.tag !== 'SIN_EQUIPO') {
                originalTeam.jugadores.push(playerObj); // Devuelve el jugador al equipo original
            }
            Swal.fire({
                icon: 'error',
                title: 'Equipo Destino No Válido',
                text: `El equipo con Tag "${newTeamTag}" no existe, está inactivo, o no es un equipo válido para reasignar jugadores.`,
            });
            return;
        }

        if (targetTeam.jugadores.length >= 8) {
            applyValidationClass(newTeamTagInput, false);
            // Si el jugador fue movido del equipo original y el nuevo está lleno, devolverlo.
            if (originalTeam && originalTeam.tag !== 'SIN_EQUIPO') {
                originalTeam.jugadores.push(playerObj); // Devuelve el jugador al equipo original
            }
            Swal.fire({
                icon: 'warning',
                title: 'Equipo Destino Lleno',
                text: `El equipo "${targetTeam.team}" ya tiene el máximo de 8 jugadores.`,
            });
            return;
        }

        // Si todo es válido, añadir el jugador al nuevo equipo
        targetTeam.jugadores.push(playerObj);

        saveAllTeamData();
        refreshTables();
        $('#reassignPlayerForm')[0].reset(); // Limpia el formulario
        // Eliminar las clases de validación después de un reseteo exitoso
        $('.form-control').removeClass('is-valid is-invalid');

        // Cerrar el modal
        const reassignPlayerModal = bootstrap.Modal.getInstance(document.getElementById('reassignPlayerModal'));
        if (reassignPlayerModal) {
            reassignPlayerModal.hide();
        }

        Swal.fire({
            icon: 'success',
            title: '¡Jugador Reasignado!',
            text: `"${playerObj.nickname}" ha sido reasignado a "${targetTeam.team}".`,
            timer: 2000,
            showConfirmButton: false
        });
    });

    // Actualizar listeners para validación en tiempo real (solo para el nuevo input del modal)
    $('#reassignTeamTagInput').on('input', function () {
        const inputElement = $(this);
        const value = inputElement.val().trim();
        let isValid = value.length > 0;
        applyValidationClass(inputElement, isValid);
    });

    // NUEVO: Manejo de botones de Exportar/Importar
    $('#exportAllDataBtn').on('click', function () {
        exportAllData();
    });

    $('#importAllDataBtn').on('click', function () {
        $('#importFileInput').click(); // Simula un clic en el input de tipo archivo
    });

    $('#importFileInput').on('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            importAllData(file);
        }
        // Limpiar el valor del input file para que el evento 'change' se dispare
        // de nuevo si se selecciona el mismo archivo varias veces.
        $(this).val('');
    });

    // NUEVO: Manejo de botón y input para importar múltiples archivos de equipo
    $('#importTeamsBtn').on('click', function () {
        $('#importTeamsFileInput').click(); // Simula un clic en el input de tipo archivo múltiple
    });

    $('#importTeamsFileInput').on('change', async function (event) {
        const files = event.target.files;
        if (files.length > 0) {
            await importMultipleTeams(files); // Llama a la nueva función asíncrona
        }
        // Limpiar el valor del input file después de la selección
        $(this).val('');
    });


    // NUEVO: Manejo del formulario para Edición Avanzada de Equipo
    $('#editTeamForm').on('submit', function (e) {
        e.preventDefault();

        const originalTag = $('#editTeamOriginalTag').val();
        const teamToUpdate = allTeamData.find(team => team.tag === originalTag);

        if (!teamToUpdate) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo encontrar el equipo original para actualizar.',
            });
            return;
        }

        // Obtener los nuevos valores de los campos
        const newOrg = $('#editTeamOrg').val().trim();
        const newNombreAnterior = $('#editTeamNombreAnterior').val().trim();
        const newSeguro = $('#editTeamSeguro').val() === 'true'; // Convertir a booleano
        let newLink = $('#editTeamLink').val().trim();
        const newGrupo = $('#editTeamGrupo').val().trim();
        const newPosicionDesempate = $('#editTeamPosicionDesempate').val() === 'true'; // Convertir a booleano

        // Validación básica (puedes añadir más si lo deseas)
        let isValidForm = true;
        if (newOrg.length > 50) { // Ejemplo de validación de longitud para Org
            applyValidationClass($('#editTeamOrg'), false);
            isValidForm = false;
        } else {
            applyValidationClass($('#editTeamOrg'), true);
        }
        // Repite validaciones para otros campos si es necesario
        // Por ahora, asumimos que si no es crítico, solo se guardan los valores.

        if (!isValidForm) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos Inválidos',
                text: 'Por favor, corrige los errores en los campos resaltados.',
            });
            return;
        }

        // Si el campo 'link' está vacío, regenerarlo basado en el nombre actual del equipo
        if (!newLink) {
            newLink = `/equipos/${teamToUpdate.team.toLowerCase().replace(/\s/g, '-')}`;
        }


        // Actualizar las propiedades del equipo
        teamToUpdate.org = newOrg;
        teamToUpdate.teamNombreAnterior = newNombreAnterior;
        // teamNuevoNombre se actualiza con el nombre actual del equipo, no con un input
        teamToUpdate.teamNuevoNombre = teamToUpdate.team;
        teamToUpdate.seguro = newSeguro;
        teamToUpdate.link = newLink;
        teamToUpdate.grupo = newGrupo;
        teamToUpdate.posicionDesempate = newPosicionDesempate;

        saveAllTeamData();
        refreshTables(); // Refrescar para que los cambios se reflejen si alguna propiedad visible fue afectada

        const editTeamModal = bootstrap.Modal.getInstance(document.getElementById('editTeamModal'));
        if (editTeamModal) {
            editTeamModal.hide();
        }

        Swal.fire({
            icon: 'success',
            title: '¡Detalles Actualizados!',
            text: `Los detalles de "${teamToUpdate.team}" (${teamToUpdate.tag}) han sido guardados.`,
            timer: 2000,
            showConfirmButton: false
        });
    });


    populateTeamDatalist(); // Asegúrate de llamar a la nueva función
    refreshTables();      // Dibuja las tablas con los datos iniciales de localStorage
});