// js/events.js

$(document).ready(function() {
    // Evento para el botón de guardar marcadores
    $('#guardarTodosMarcadores').on('click', function() {
        Swal.fire({
            title: '¿Guardar todos los marcadores?',
            text: "Esto actualizará los puntos de los equipos y se guardará en tu sistema.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                saveAllMatchPoints(); // Esta función estará en 'data.js' o 'tables.js'
            }
        });
    });

    // Función para guardar los cambios de marcadores (Mover aquí si se va a disparar solo por el botón)
    // O mantener en tables.js si es un helper de las tablas. Si la quieres aquí, asegúrate de que tablaGrupoNorte y Sur
    // y allTeamData sean accesibles (usando 'window.').
    function saveAllMatchPoints() {
        let changesMade = false;

        const processTableData = (dataTableInstance) => {
            dataTableInstance.rows().every(function() {
                const rowData = this.data();
                const teamTag = rowData.tag;
                const teamIndex = window.allTeamData.findIndex(t => t.tag === teamTag);

                if (teamIndex !== -1) {
                    const currentTeam = window.allTeamData[teamIndex];
                    let teamChangesMade = false;

                    for (let i = 1; i <= 14; i++) {
                        const matchKey = `M${i}`;
                        const currentTableValue = rowData.partidos[matchKey];
                        const originalTeamValue = currentTeam.partidos[matchKey];

                        if (currentTableValue !== undefined && currentTableValue !== originalTeamValue) {
                            currentTeam.partidos[matchKey] = currentTableValue;
                            teamChangesMade = true;
                            changesMade = true;
                        }
                    }
                    if (teamChangesMade) {
                        currentTeam.puntosTotales = window.calculateTotalPoints(currentTeam);
                    }
                }
            });
        };

        if (window.tablaGrupoNorte) processTableData(window.tablaGrupoNorte);
        if (window.tablaGrupoSur) processTableData(window.tablaGrupoSur);

        if (changesMade) {
            window.saveAllTeamData();
            window.refreshTables();
            Swal.fire({
                icon: 'success', title: 'Marcadores Guardados', text: 'Todos los marcadores y puntos totales han sido actualizados y guardados.',
                timer: 2500, showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: 'info', title: 'Sin Cambios', text: 'No se detectaron cambios en los marcadores para guardar.',
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
            });
        }
    }

    window.saveAllMatchPoints = saveAllMatchPoints; // Hacerla global

    // ... (Todos los demás manejadores de eventos que tenías en tu app.js,
    //      ej. submit de formularios, clics de botones, etc.) ...
    // $('#addTeamForm').on('submit', function(e) { ... });
    // $('#addPlayerForm').on('submit', function(e) { ... });
    // $('#reassignPlayerForm').on('submit', function(e) { ... });
    // $('#editTeamForm').on('submit', function(e) { ... });

      $('#newTeamForm').on('submit', function(e) {
        e.preventDefault();

        const newTeamTagInput = $('#newTeamTag');
        const newTeamNameInput = $('#newTeamName');
        const newTeamCaptainInput = $('#newTeamCaptain');
        const newTeamRegionInput = $('#newTeamRegion');

        const newTeamTag = newTeamTagInput.val().trim().toUpperCase();
        const newTeamName = newTeamNameInput.val().trim();
        const newTeamCaptain = newTeamCaptainInput.val().trim();
        const newTeamRegion = newTeamRegionInput.val().trim();

        let isValidForm = true;

        // Validación Tag
        // CAMBIO AQUÍ: Usar window.isValidLength y window.applyValidationClass
        if (!newTeamTag || !window.isValidLength(newTeamTag, 1, 7)) {
            window.applyValidationClass(newTeamTagInput, false);
            isValidForm = false;
        } else {
            window.applyValidationClass(newTeamTagInput, true);
        }

        // Validación Nombre de Equipo
        // CAMBIO AQUÍ
        if (!newTeamName || !window.isValidLength(newTeamName, 1, 25)) {
            window.applyValidationClass(newTeamNameInput, false);
            isValidForm = false;
        } else {
            window.applyValidationClass(newTeamNameInput, true);
        }

        // Validación Capitán
        // CAMBIO AQUÍ
        if (!newTeamCaptain) {
            window.applyValidationClass(newTeamCaptainInput, false);
            isValidForm = false;
        } else {
            window.applyValidationClass(newTeamCaptainInput, true);
        }

        // Validación Región
        // CAMBIO AQUÍ
        if (!newTeamRegion) {
            window.applyValidationClass(newTeamRegionInput, false);
            isValidForm = false;
        } else {
            window.applyValidationClass(newTeamRegionInput, true);
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
            window.applyValidationClass(newTeamTagInput, false); // CAMBIO AQUÍ
            Swal.fire({
                icon: 'error',
                title: 'Tag No Permitido',
                text: `El Tag "${newTeamTag}" está reservado para jugadores sin equipo. Por favor, elige uno diferente.`,
            });
            return;
        }

        // CAMBIO AQUÍ: Usar window.allTeamData
        if (window.allTeamData.some(team => team.tag === newTeamTag)) {
            window.applyValidationClass(newTeamTagInput, false); // CAMBIO AQUÍ
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
            // Asegúrate de que los partidos son siempre 14 para consistencia con DataTables.
            // Si tu antigua lógica tenía 12, considera extender a 14.
            partidos: {
                "M1": "0", "M2": "0", "M3": "0", "M4": "0", "M5": "0", "M6": "0", "M7": "0",
                "M8": "0", "M9": "0", "M10": "0", "M11": "0", "M12": "0", "M13": "0", "M14": "0"
            },
            jugadores: []
        };

        // CAMBIO AQUÍ: Usar window.allTeamData
        window.allTeamData.push(newTeam);
        console.log("Antes de llamar a saveAllTeamData. allTeamData en memoria:", window.allTeamData);
        window.saveAllTeamData();
        console.log("Después de llamar a saveAllTeamData."); 
        window.refreshTables();

        $('#newTeamForm')[0].reset();
        $('.form-control').removeClass('is-valid is-invalid');

        // CAMBIO AQUÍ: Acceder a newTeamModal desde el objeto window (inicializado en modals.js)
        // Puedes usar window.newTeamModal directamente si ya lo tienes inicializado así.
        // O: const newTeamModal = new bootstrap.Modal(document.getElementById('newTeamModal')); (si lo inicializas localmente)
        if (window.newTeamModal) { // Verifica que el modal exista antes de intentar ocultarlo
            window.newTeamModal.hide();
        } else {
            // Fallback si newTeamModal no es accesible globalmente, intenta obtenerlo de nuevo
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('newTeamModal'));
            if (modalInstance) {
                modalInstance.hide();
            }
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
      $('#addPlayerForm').on('submit', function(e) {
        e.preventDefault();

        const playerNicknameInput = $('#playerNickname');
        const playerIDInput = $('#playerID');
        const playerAvatarInput = $('#playerAvatar');
        const playerTeamTagInput = $('#playerTeamTagInput'); // Input del datalist

        const playerNickname = playerNicknameInput.val().trim();
        const playerID = playerIDInput.val().trim();
        const playerAvatar = playerAvatarInput.val().trim();
        const playerTeamInputValue = playerTeamTagInput.val().trim(); // Mantener el valor original del input para parsing

        let isValidForm = true; // Bandera para controlar la validez del formulario

        // Validación Nickname
        if (!playerNickname || !window.isValidLength(playerNickname, 1, 12)) {
            window.applyValidationClass(playerNicknameInput, false);
            isValidForm = false;
        } else {
            window.applyValidationClass(playerNicknameInput, true);
        }

        // Validación ID
        if (!playerID || !window.isValidLength(playerID, 1, 7)) {
            window.applyValidationClass(playerIDInput, false);
            isValidForm = false;
        } else {
            window.applyValidationClass(playerIDInput, true);
        }

        // Validación Avatar (solo no vacío, si hay un valor por defecto no es estrictamente necesario)
        if (!playerAvatar) {
            window.applyValidationClass(playerAvatarInput, false); // CAMBIO: window.applyValidationClass
            isValidForm = false;
        } else {
            window.applyValidationClass(playerAvatarInput, true); // CAMBIO: window.applyValidationClass
        }

        // **AÑADE ESTO PARA DEPURAR:**
        console.log("Validando formulario de jugador. Valor de equipo:", playerTeamInputValue);

        // Validación Equipo (datalist) - Lógica de búsqueda mejorada
        let targetTeam = null;
        let extractedTag = '';

        // Intentar parsear el formato "TAG - Nombre del Equipo"
        const tagMatch = playerTeamInputValue.match(/^([A-Za-z0-9_]+)\s*-\s*(.*)$/);
        if (tagMatch && tagMatch[1]) {
            extractedTag = tagMatch[1].toUpperCase();
            console.log("Tag extraído del input (formato 'TAG - Nombre'):", extractedTag);
        } else {
            // Si no coincide con el formato, asume que es solo el TAG o el Nombre
            extractedTag = playerTeamInputValue.toUpperCase();
            console.log("Valor de input usado como Tag/Nombre (sin formato 'TAG - Nombre'):", extractedTag);
        }

        // Buscar el equipo usando el TAG extraído/asumido
        targetTeam = window.allTeamData.find(team => team.tag.toUpperCase() === extractedTag);

        // Si no se encuentra por TAG, intentar por Nombre (solo si el input no tenía formato TAG - Nombre)
        if (!targetTeam && !tagMatch) { // Si no se encontró por tag y el input no era un formato "TAG - Nombre"
             targetTeam = window.allTeamData.find(team => team.team.toUpperCase() === extractedTag);
        }


        // **AÑADE ESTO PARA DEPURAR:**
        console.log("Equipo encontrado (targetTeam):", targetTeam);


        // Validación si el campo de equipo está vacío o si el equipo no fue encontrado
        if (!playerTeamInputValue || !targetTeam) {
            window.applyValidationClass(playerTeamTagInput, false);
            isValidForm = false;
            Swal.fire({
                icon: 'warning',
                title: 'Equipo no Encontrado',
                text: 'Por favor, selecciona un equipo de la lista o verifica el nombre/tag del equipo.',
            });
            return; // Salir si el equipo no se encontró o el campo estaba vacío
        } else {
            window.applyValidationClass(playerTeamTagInput, true);
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
        // CAMBIO AQUÍ: Usar window.allTeamData
        const isDuplicateID = window.allTeamData.some(team =>
            team.jugadores.some(player => player.ID === playerID)
        );
        if (isDuplicateID) {
            window.applyValidationClass(playerIDInput, false); // CAMBIO: window.applyValidationClass
            Swal.fire({
                icon: 'error',
                title: 'ID de Jugador Duplicado',
                text: `El ID de jugador "${playerID}" ya está en uso por otro jugador.`,
            });
            return;
        }

        // La validación de targetTeam ya se hizo arriba.
        // Pero esta es la validación si el equipo está inactivo o es 'SIN_EQUIPO'
        if (!targetTeam.activo || targetTeam.tag === 'SIN_EQUIPO') {
            window.applyValidationClass(playerTeamTagInput, false); // CAMBIO: window.applyValidationClass
            Swal.fire({
                icon: 'error',
                title: 'Equipo no Válido',
                text: `El equipo "${targetTeam.team}" (${targetTeam.tag}) está inactivo o no es seleccionable.`,
            });
            return;
        }

        if (targetTeam.jugadores.length >= 8) {
            window.applyValidationClass(playerTeamTagInput, false); // CAMBIO: window.applyValidationClass
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

        // Ahora que targetTeam es el objeto equipo real, añadimos el jugador a su array
        if (!targetTeam.jugadores) { // Asegurarse de que el array de jugadores existe
            targetTeam.jugadores = [];
        }
        targetTeam.jugadores.push(newPlayer);

        // CAMBIO AQUÍ: Usar window.saveAllTeamData()
        window.saveAllTeamData();
        // CAMBIO AQUÍ: Usar window.refreshTables()
        window.refreshTables();

        $('#addPlayerForm')[0].reset();
        // CAMBIO AQUÍ: Limpiar clases de validación de todos los inputs del formulario
        $(this).find('.form-control').removeClass('is-valid is-invalid');


        // CAMBIO AQUÍ: Acceder a addPlayerModal desde el objeto window (si lo tienes inicializado en modals.js)
        if (window.addPlayerModal) {
            window.addPlayerModal.hide();
        } else {
            // Fallback si no es accesible globalmente, intenta obtenerlo de nuevo
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('addPlayerModal'));
            if (modalInstance) {
                modalInstance.hide();
            }
        }

        Swal.fire({
            icon: 'success',
            title: '¡Jugador Añadido!',
            text: `"${playerNickname}" ha sido añadido a "${targetTeam.team}".`,
            timer: 2000,
            showConfirmButton: false
        });
    });

     $('#newTeamTag, #newTeamName, #newTeamCaptain, #newTeamRegion').on('input', function() {
        const inputElement = $(this);
        const value = inputElement.val().trim();
        const id = inputElement.attr('id');

        // Aplicar validaciones de longitud y no vacío en tiempo real
        let isValid = true;
        if (id === 'newTeamTag') {
            isValid = value.length > 0 && window.isValidLength(value, 1, 7); // <-- Aquí el cambio
        } else if (id === 'newTeamName') {
            isValid = value.length > 0 && window.isValidLength(value, 1, 25); // <-- Aquí el cambio
        } else if (id === 'newTeamCaptain' || id === 'newTeamRegion') {
            isValid = value.length > 0;
        }
        window.applyValidationClass(this, isValid); // <-- Aquí el cambio
    });

    $('#playerNickname, #playerID, #playerAvatar, #playerTeamTagInput').on('input', function() {
        const inputElement = $(this);
        const value = inputElement.val().trim();
        const id = inputElement.attr('id');
          let isValid = true;
     
        if (id === 'playerNickname') {
            isValid = value.length > 0 && window.isValidLength(value, 1, 12); // <-- Aquí el cambio
        } else if (id === 'playerID') {
            isValid = value.length > 0 && window.isValidLength(value, 1, 7); // <-- Aquí el cambio
        } else if (id === 'playerAvatar') {
            isValid = value.length > 0;
        } else if (id === 'playerTeamTagInput') {
             isValid = value.length > 0;
        }
        window.applyValidationClass(this, isValid); // <-- Aquí el cambio
    });

    // 6. Carga inicial de datos al iniciar la página

     // NUEVO: 7. Manejo del formulario para Reasignar Jugador (dentro del modal)
    $('#reassignPlayerForm').on('submit', function(e) {
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
    $('#reassignTeamTagInput').on('input', function() {
        const inputElement = $(this);
        const value = inputElement.val().trim();
        let isValid = value.length > 0;
        applyValidationClass(inputElement, isValid);
    });

     // NUEVO: Manejo de botones de Exportar/Importar
    $('#exportAllDataBtn').on('click', function() {
        exportAllData();
    });

    $('#importAllDataBtn').on('click', function() {
        $('#importFileInput').click(); // Simula un clic en el input de tipo archivo
    });

    $('#importFileInput').on('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            importAllData(file);
        }
        // Limpiar el valor del input file para que el evento 'change' se dispare
        // de nuevo si se selecciona el mismo archivo varias veces.
        $(this).val('');
    });

      // NUEVO: Manejo de botón y input para importar múltiples archivos de equipo
    $('#importTeamsBtn').on('click', function() {
        $('#importTeamsFileInput').click(); // Simula un clic en el input de tipo archivo múltiple
    });

    $('#importTeamsFileInput').on('change', async function(event) {
        const files = event.target.files;
        if (files.length > 0) {
            await importMultipleTeams(files); // Llama a la nueva función asíncrona
        }
        // Limpiar el valor del input file después de la selección
        $(this).val('');
    });


     // NUEVO: Manejo del formulario para Edición Avanzada de Equipo
    $('#editTeamForm').on('submit', function(e) {
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

});