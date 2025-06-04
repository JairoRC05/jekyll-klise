// js/utils.js

// Ejemplo: Llenar el datalist de equipos para reasignación
function populateTeamDatalist() {
    const datalist = $('#teamDatalist');
    datalist.empty();
    window.allTeamData.forEach(team => {
        if (team.tag !== 'SIN_EQUIPO') {
            datalist.append(`<option value="${team.tag} - ${team.team}">`);
        }
    });
    console.log("Datalist de equipos populado.");
}

// Ejemplo: Actualizar las estadísticas globales
function updateGlobalStats() {
    let totalPlayers = 0;
    let totalActiveTeams = 0;
    let totalPuntosGlobales = 0;

    window.allTeamData.forEach(team => {
        if (team.tag !== 'SIN_EQUIPO' && team.activo) {
            totalActiveTeams++;
            totalPlayers += team.jugadores ? team.jugadores.length : 0;
            totalPuntosGlobales += team.puntosTotales || 0;
        }
    });

    $('#totalTeams').text(window.allTeamData.filter(t => t.tag !== 'SIN_EQUIPO').length);
    $('#activeTeams').text(totalActiveTeams);
    $('#totalPlayers').text(totalPlayers);
    $('#globalPoints').text(totalPuntosGlobales);
}

/**
 * Genera y descarga el archivo JSON para un equipo específico.
 * @param {string} teamTag - El tag del equipo a descargar.
 */
// Funciones para descargar JSON/CSV/PDF (si existen en tu código)
function downloadTeamJson(teamTag) {
    const teamToDownload = allTeamData.find(team => team.tag === teamTag);

    if (!teamToDownload) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Descarga',
            text: `No se encontró el equipo con el tag: ${teamTag}`,
        });
        return;
    }

    const dataStr = JSON.stringify([teamToDownload], null, 4); // El '4' es para una indentación bonita
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    // Nombre del archivo: NOMBRE_DEL_EQUIPO_TAG.json
    a.download = `${teamToDownload.team.replace(/\s/g, '_')}_${teamTag}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Libera la URL del objeto

    Swal.fire({
        icon: 'success',
        title: 'Descarga Exitosa',
        text: `El JSON de "${teamToDownload.team}" ha sido descargado.`,
        timer: 2000,
        showConfirmButton: false
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

    const filename = `Reporte_${team.tag}_Jugadores_${new Date().toISOString().slice(0,10)}.pdf`;
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
    const filename = `Reporte_${team.tag}_Jugadores_${new Date().toISOString().slice(0,10)}.csv`;
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
 * Valida la longitud de un campo de texto.
 * @param {string} value El valor del campo.
 * @param {number} minLength La longitud mínima permitida.
 * @param {number} maxLength La longitud máxima permitida.
 * @returns {boolean} True si la longitud es válida, false en caso contrario.
 */
function isValidLength(value, min, max) {
    if (typeof value !== 'string') return false;
    const length = value.trim().length;
    return length >= min && length <= max;
}


/**
 * Aplica las clases de validación de Bootstrap a un campo.
 * @param {jQuery} element El elemento jQuery del campo de entrada.
 * @param {boolean} isValid True para 'is-valid', false para 'is-invalid'.
 */
function applyValidationClass(element, isValid) {
    if (isValid) {
        $(element).removeClass('is-invalid').addClass('is-valid');
    } else {
        $(element).removeClass('is-valid').addClass('is-invalid');
    }
}




// Función para cambiar el estado de un equipo
function toggleTeamStatus(teamTag) {
    Swal.fire({
        title: 'Confirmar cambio de estado',
        text: "¿Estás seguro de que quieres cambiar el estado de este equipo?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const team = window.allTeamData.find(t => t.tag === teamTag);
            if (team) {
                team.activo = !team.activo;
                window.saveAllTeamData();
                window.refreshTables(); // Refrescar la UI
                Swal.fire('¡Cambiado!', 'El estado del equipo ha sido actualizado.', 'success');
            }
        }
    });
}

// Exportar funciones de utilidad
window.isValidLength = isValidLength;
window.applyValidationClass = applyValidationClass;
window.populateTeamDatalist = populateTeamDatalist;
window.updateGlobalStats = updateGlobalStats;
window.downloadTeamJson = downloadTeamJson;
window.generateTeamPlayersPdf = generateTeamPlayersPdf;
window.generateTeamPlayersCsv = generateTeamPlayersCsv;
window.toggleTeamStatus = toggleTeamStatus;