// transfer-control.js
// Módulo independiente para control de altas/bajas con límite de 3 por equipo
// Basado únicamente en localStorage

const TRANSFER_LOG_KEY = 'transferLog';

/**
 * Inicializa o recupera el registro de transferencias desde localStorage.
 */
function getTransferLog() {
    const stored = localStorage.getItem(TRANSFER_LOG_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.warn('Formato inválido en transferLog. Reiniciando.');
        }
    }
    return {
        jugadoresBajaGlobal: {}
    };
}

/**
 * Guarda el registro de transferencias en localStorage.
 */
function saveTransferLog(log) {
    localStorage.setItem(TRANSFER_LOG_KEY, JSON.stringify(log));
}

/**
 * Registra una ALTA de un jugador en un equipo.
 */
function registrarAlta(teamTag, playerId, nickname, avatar = 'male1') {
    const log = getTransferLog();

    // 1. ¿Fue dado de baja globalmente?
    if (log.jugadoresBajaGlobal[playerId]) {
        return {
            success: false,
            message: `El jugador "${nickname}" (ID: ${playerId}) fue dado de baja y no puede volver a inscribirse.`
        };
    }

    // 2. Buscar al jugador en allTeamData
    const allTeamData = JSON.parse(localStorage.getItem('allTeamData') || '[]');
    let jugadorEnOtroEquipoActivo = false;
    let jugadorEnSinEquipo = null;

    for (const team of allTeamData) {
        const jugador = team.jugadores.find(p => p.ID === playerId);
        if (jugador) {
            if (team.tag === 'SIN_EQUIPO') {
                jugadorEnSinEquipo = jugador;
            } else if (team.activo) {
                jugadorEnOtroEquipoActivo = true;
            }
        }
    }

    if (jugadorEnOtroEquipoActivo) {
        return {
            success: false,
            message: `El jugador "${nickname}" ya está inscrito en otro equipo activo.`
        };
    }

    // 3. Inicializar registro del equipo
    if (!log[teamTag]) {
        log[teamTag] = { altas: [], bajas: [] };
    }

    // 4. ¿Máximo de 3 altas?
    if (log[teamTag].altas.length >= 3) {
        return {
            success: false,
            message: `El equipo "${teamTag}" ya ha realizado sus 3 altas permitidas.`
        };
    }

    // 5. Registrar alta
    const now = new Date().toISOString();
    log[teamTag].altas.push({ playerId, nickname, fecha: now });
    saveTransferLog(log);

    // 6. Asegurar existencia de equipos
    const targetTeam = allTeamData.find(t => t.tag === teamTag);
    if (!targetTeam) {
        return { success: false, message: `Equipo "${teamTag}" no encontrado.` };
    }

    let sinEquipo = allTeamData.find(t => t.tag === 'SIN_EQUIPO');
    if (!sinEquipo) {
        sinEquipo = {
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
        allTeamData.push(sinEquipo);
    }

    // 7. Añadir/mover jugador
    if (jugadorEnSinEquipo) {
        sinEquipo.jugadores = sinEquipo.jugadores.filter(p => p.ID !== playerId);
        targetTeam.jugadores.push(jugadorEnSinEquipo);
    } else {
        targetTeam.jugadores.push({ ID: playerId, nickname, avatar });
    }

    localStorage.setItem('allTeamData', JSON.stringify(allTeamData));
    return { success: true, message: `Alta registrada: ${nickname} en ${teamTag}.` };
}

/**
 * Registra una BAJA de un jugador.
 */
function registrarBaja(teamTag, playerId, nickname) {
    const log = getTransferLog();
    if (!log[teamTag]) {
        log[teamTag] = { altas: [], bajas: [] };
    }

    if (log[teamTag].bajas.length >= 3) {
        return {
            success: false,
            message: `El equipo "${teamTag}" ya ha realizado sus 3 bajas permitidas.`
        };
    }

    const now = new Date().toISOString();
    log[teamTag].bajas.push({ playerId, nickname, fecha: now });
    log.jugadoresBajaGlobal[playerId] = true;
    saveTransferLog(log);

    // Mover jugador a SIN_EQUIPO
    const allTeamData = JSON.parse(localStorage.getItem('allTeamData') || '[]');
    let jugadorObj = null;
    for (const team of allTeamData) {
        const idx = team.jugadores.findIndex(p => p.ID === playerId);
        if (idx !== -1) {
            jugadorObj = team.jugadores.splice(idx, 1)[0];
            break;
        }
    }

    if (jugadorObj) {
        let sinEquipo = allTeamData.find(t => t.tag === 'SIN_EQUIPO');
        if (!sinEquipo) {
            sinEquipo = {
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
            allTeamData.push(sinEquipo);
        }
        sinEquipo.jugadores.push(jugadorObj);
        localStorage.setItem('allTeamData', JSON.stringify(allTeamData));
    }

    return {
        success: true,
        message: `Baja registrada: ${nickname} de ${teamTag}. Ya no puede volver a inscribirse.`
    };
}

/**
 * Reinicia los contadores de altas/bajas para un equipo (NO toca jugadores).
 */
function resetTeamTransfers(teamTag) {
    Swal.fire({
        title: '¿Reiniciar altas y bajas?',
        html: `Esto restablecerá los contadores de <strong>altas y bajas</strong> del equipo <strong>${teamTag}</strong> a 0/3.<br>
               <small class="text-muted">Los jugadores actuales no se verán afectados. Las bajas previas seguirán prohibidas.</small>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6c757d',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, reiniciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const log = getTransferLog();
            log[teamTag] = { altas: [], bajas: [] };
            saveTransferLog(log);
            Swal.fire({ icon: 'success', title: '¡Reiniciado!', text: `Contadores del equipo ${teamTag} restablecidos.`, timer: 2000, showConfirmButton: false });
            renderTransfersTable();
        }
    });
}

/**
 * Exporta el reporte completo de transferencias.
 */
function exportTransferReport() {
    const log = getTransferLog();
    const dataStr = JSON.stringify(log, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `reporte_altas_bajas_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- INTERFAZ VISUAL ---
function renderTransfersTable() {
    const tableBody = $('#transfersTable tbody');
    if (tableBody.length === 0) return;

    const allTeamData = JSON.parse(localStorage.getItem('allTeamData') || '[]');
    const log = getTransferLog();
    const activeTeams = allTeamData.filter(team => team.activo && team.tag !== 'SIN_EQUIPO');

    tableBody.empty();
    activeTeams.forEach(team => {
        const teamLog = log[team.tag] || { altas: [], bajas: [] };
        const altas = teamLog.altas.length;
        const bajas = teamLog.bajas.length;

        const row = `
            <tr>
                <td><strong>${team.tag}</strong></td>
                <td>${team.team}</td>
                <td><span class="badge ${altas >= 3 ? 'bg-danger' : 'bg-success'}">${altas}/3</span></td>
                <td><span class="badge ${bajas >= 3 ? 'bg-danger' : 'bg-warning'}">${bajas}/3</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-success me-1 ${altas >= 3 ? 'disabled' : ''}" onclick="openAltaModal('${team.tag}')"><i class="bi bi-person-plus"></i> Alta</button>
                    <button class="btn btn-sm btn-outline-danger me-1 ${bajas >= 3 ? 'disabled' : ''}" onclick="openBajaModal('${team.tag}')"><i class="bi bi-person-x"></i> Baja</button>
                    <button class="btn btn-sm btn-outline-info me-1" onclick="showTransferHistory('${team.tag}')"><i class="bi bi-clock-history"></i></button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="resetTeamTransfers('${team.tag}')"><i class="bi bi-arrow-clockwise"></i></button>
                </td>
            </tr>
        `;
        tableBody.append(row);
    });
}

// --- MODALES ---
function openAltaModal(teamTag) {
    if ($('#altaModal').length === 0) {
        $('body').append(`
            <div class="modal fade" id="altaModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Registrar Alta en <span id="altaTeamTag"></span></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">ID del Jugador (1-7)</label>
                                <input type="text" id="altaPlayerID" class="form-control" maxlength="7">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Nickname (1-12)</label>
                                <input type="text" id="altaPlayerNickname" class="form-control" maxlength="12">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Avatar</label>
                                <input type="text" id="altaPlayerAvatar" class="form-control" value="male1">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" onclick="confirmAlta('${teamTag}')">Registrar Alta</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
    $('#altaTeamTag').text(teamTag);
    $('#altaPlayerID, #altaPlayerNickname, #altaPlayerAvatar').val('');
    const modal = new bootstrap.Modal(document.getElementById('altaModal'));
    modal.show();
}

function confirmAlta(teamTag) {
    const playerId = $('#altaPlayerID').val().trim();
    const nickname = $('#altaPlayerNickname').val().trim();
    const avatar = $('#altaPlayerAvatar').val().trim() || 'male1';
    if (!playerId || !nickname) return Swal.fire('Error', 'ID y Nickname son obligatorios.', 'error');
    if (playerId.length > 7 || nickname.length > 12) return Swal.fire('Error', 'Longitud inválida.', 'error');

    const res = registrarAlta(teamTag, playerId, nickname, avatar);
    if (res.success) {
        Swal.fire('Éxito', res.message, 'success');
        bootstrap.Modal.getInstance(document.getElementById('altaModal')).hide();
        renderTransfersTable();
    } else {
        Swal.fire('Alta denegada', res.message, 'error');
    }
}

function openBajaModal(teamTag) {
    const allTeamData = JSON.parse(localStorage.getItem('allTeamData') || '[]');
    const team = allTeamData.find(t => t.tag === teamTag);
    if (!team || team.jugadores.length === 0) return Swal.fire('Sin jugadores', `El equipo ${teamTag} no tiene jugadores para dar de baja.`, 'info');

    if ($('#bajaModal').length === 0) {
        $('body').append(`
            <div class="modal fade" id="bajaModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Registrar Baja en <span id="bajaTeamTag"></span></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Seleccionar Jugador</label>
                                <select id="bajaPlayerSelect" class="form-select"></select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" onclick="confirmBaja('${teamTag}')">Registrar Baja</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    $('#bajaTeamTag').text(teamTag);
    const select = $('#bajaPlayerSelect');
    select.empty();
    team.jugadores.forEach(p => select.append(`<option value="${p.ID}">${p.nickname} (ID: ${p.ID})</option>`));

    const modal = new bootstrap.Modal(document.getElementById('bajaModal'));
    modal.show();
}

function confirmBaja(teamTag) {
    const playerId = $('#bajaPlayerSelect').val();
    if (!playerId) return Swal.fire('Error', 'Selecciona un jugador.', 'error');

    const allTeamData = JSON.parse(localStorage.getItem('allTeamData') || '[]');
    let nickname = 'Desconocido';
    for (const team of allTeamData) {
        const p = team.jugadores.find(x => x.ID === playerId);
        if (p) { nickname = p.nickname; break; }
    }

    const res = registrarBaja(teamTag, playerId, nickname);
    if (res.success) {
        Swal.fire('Éxito', res.message, 'success');
        bootstrap.Modal.getInstance(document.getElementById('bajaModal')).hide();
        renderTransfersTable();
    } else {
        Swal.fire('Baja denegada', res.message, 'error');
    }
}

function showTransferHistory(teamTag) {
    const log = getTransferLog();
    const teamLog = log[teamTag] || { altas: [], bajas: [] };
    let html = `<h5>Historial de ${teamTag}</h5>`;
    if (teamLog.altas.length === 0 && teamLog.bajas.length === 0) {
        html += '<p class="text-muted">Sin movimientos registrados.</p>';
    } else {
        if (teamLog.altas.length > 0) {
            html += '<h6>Altas:</h6><ul>';
            teamLog.altas.forEach(a => {
                const date = new Date(a.fecha).toLocaleString();
                html += `<li><strong>${a.nickname}</strong> (${a.playerId}) - ${date}</li>`;
            });
            html += '</ul>';
        }
        if (teamLog.bajas.length > 0) {
            html += '<h6>Bajas:</h6><ul>';
            teamLog.bajas.forEach(b => {
                const date = new Date(b.fecha).toLocaleString();
                html += `<li><strong>${b.nickname}</strong> (${b.playerId}) - ${date}</li>`;
            });
            html += '</ul>';
        }
    }
    Swal.fire({ title: 'Historial de Transferencias', html, icon: 'info', width: '600px' });
}

// --- INICIALIZACIÓN ---
$(document).ready(function () {
    if ($('#transfersTable').length > 0) {
        renderTransfersTable();
    }
});

// --- EXPOSICIÓN GLOBAL ---
window.TransferControl = {
    renderTransfersTable,
    exportTransferReport,
    resetTeamTransfers
};