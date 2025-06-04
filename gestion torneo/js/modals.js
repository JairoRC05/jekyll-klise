// js/modals.js

let newTeamModal;
let addPlayerModal;
let reassignPlayerModal;
let editTeamModal;

function initializeModals() {
    newTeamModal = new bootstrap.Modal(document.getElementById('newTeamModal'));
    addPlayerModal = new bootstrap.Modal(document.getElementById('addPlayerModal'));
    reassignPlayerModal = new bootstrap.Modal(document.getElementById('reassignPlayerModal'));
    editTeamModal = new bootstrap.Modal(document.getElementById('editTeamModal'));
}

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

// Exportar instancias de modales y funciones relacionadas
window.newTeamModal = newTeamModal;
window.addPlayerModal = addPlayerModal;
window.reassignPlayerModal = reassignPlayerModal;
window.editTeamModal = editTeamModal;
window.initializeModals = initializeModals;
window.openReassignPlayerModal = openReassignPlayerModal;
window.openEditTeamModal = openEditTeamModal;