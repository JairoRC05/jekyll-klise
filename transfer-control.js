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
        jugadoresBajaGlobal: {},
        // Los equipos se añadirán dinámicamente
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
 * Permite:
 *   - Jugadores nuevos (no existentes en ningún equipo)
 *   - Jugadores en SIN_EQUIPO
 * Bloquea:
 *   - Jugadores ya en otro equipo activo (≠ SIN_EQUIPO)
 *   - Jugadores en jugadoresBajaGlobal
 */
function registrarAlta(teamTag, playerId, nickname, avatar = 'male1') {
    const log = getTransferLog();

    // 1. ¿Fue dado de baja globalmente? (prohibido reingresar)
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
    let jugadorEnEquipoActivoTag = null;

    for (const team of allTeamData) {
        const jugador = team.jugadores.find(p => p.ID === playerId);
        if (jugador) {
            if (team.tag === 'SIN_EQUIPO') {
                jugadorEnSinEquipo = jugador;
            } else if (team.activo) {
                jugadorEnOtroEquipoActivo = true;
                jugadorEnEquipoActivoTag = team.tag;
            }
            // Nota: si está en un equipo inactivo (≠ SIN_EQUIPO), lo tratamos como "disponible"
            // porque los equipos inactivos no compiten.
        }
    }

    if (jugadorEnOtroEquipoActivo) {
        return {
            success: false,
            message: `El jugador "${nickname}" ya está inscrito en el equipo activo "${jugadorEnEquipoActivoTag}".`
        };
    }

    // 3. Inicializar registro del equipo si no existe
    if (!log[teamTag]) {
        log[teamTag] = { altas: [], bajas: [] };
    }

    // 4. ¿Máximo de 3 altas alcanzado?
    if (log[teamTag].altas.length >= 3) {
        return {
            success: false,
            message: `El equipo "${teamTag}" ya ha realizado sus 3 altas permitidas.`
        };
    }

    // 5. Registrar alta en el log
    const now = new Date().toISOString();
    log[teamTag].altas.push({ playerId, nickname, fecha: now });
    saveTransferLog(log);

    // 6. Asegurar que el equipo destino exista
    const targetTeam = allTeamData.find(t => t.tag === teamTag);
    if (!targetTeam) {
        return {
            success: false,
            message: `Equipo "${teamTag}" no encontrado.`
        };
    }

    // 7. Asegurar que exista el equipo SIN_EQUIPO (por si acaso)
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

    // 8. Añadir/mover jugador
    if (jugadorEnSinEquipo) {
        // Mover desde SIN_EQUIPO
        sinEquipo.jugadores = sinEquipo.jugadores.filter(p => p.ID !== playerId);
        targetTeam.jugadores.push(jugadorEnSinEquipo);
    } else {
        // Es un jugador nuevo o estaba en un equipo inactivo (lo tratamos como nuevo)
        targetTeam.jugadores.push({ ID: playerId, nickname, avatar });
    }

    localStorage.setItem('allTeamData', JSON.stringify(allTeamData));

    return {
        success: true,
        message: `Alta registrada: ${nickname} en ${teamTag}.`
    };
}

/**
 * Registra una BAJA de un jugador de un equipo.
 * @param {string} teamTag - Tag del equipo.
 * @param {string} playerId - ID único del jugador.
 * @param {string} nickname - Nombre del jugador.
 * @returns {{ success: boolean, message: string }}
 */
function registrarBaja(teamTag, playerId, nickname) {
    const log = getTransferLog();

    // Inicializar registro del equipo si no existe
    if (!log[teamTag]) {
        log[teamTag] = { altas: [], bajas: [] };
    }

    // ¿Máximo de 3 bajas alcanzado?
    if (log[teamTag].bajas.length >= 3) {
        return {
            success: false,
            message: `El equipo "${teamTag}" ya ha realizado sus 3 bajas permitidas.`
        };
    }

    // Registrar baja
    const now = new Date().toISOString();
    log[teamTag].bajas.push({ playerId, nickname, fecha: now });

    // Marcar jugador como prohibido globalmente
    log.jugadoresBajaGlobal[playerId] = true;

    saveTransferLog(log);
    return {
        success: true,
        message: `Baja registrada: ${nickname} de ${teamTag}. Ya no puede volver a inscribirse.`
    };
}

/**
 * Exporta un informe completo de altas y bajas en formato JSON descargable.
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

/**
 * (Opcional) Verifica si un jugador puede ser dado de alta en un equipo.
 * Útil para integrar con tu interfaz actual.
 */
function puedeDarAlta(teamTag, playerId, nickname) {
    return registrarAlta(teamTag, playerId, nickname);
}

/**
 * (Opcional) Verifica si un jugador puede ser dado de baja.
 */
function puedeDarBaja(teamTag, playerId, nickname) {
    return registrarBaja(teamTag, playerId, nickname);
}

// --- NUEVO: Función para renderizar la tabla de control de transferencias ---
function renderTransfersTable() {
    const tableBody = $('#transfersTable tbody');
    if (tableBody.length === 0) return; // Si no existe el contenedor, no hacer nada

    const allTeamData = JSON.parse(localStorage.getItem('allTeamData') || '[]');
    const log = getTransferLog();

    tableBody.empty();

    // Filtrar solo equipos activos y excluyendo SIN_EQUIPO
    const activeTeams = allTeamData.filter(team => team.activo && team.tag !== 'SIN_EQUIPO');

    activeTeams.forEach(team => {
        const teamLog = log[team.tag] || { altas: [], bajas: [] };
        const altasCount = teamLog.altas.length;
        const bajasCount = teamLog.bajas.length;

      
const row = `
    <tr>
        <td><strong>${team.tag}</strong></td>
        <td>${team.team}</td>
        <td>
            <span class="badge ${altasCount >= 3 ? 'bg-danger' : 'bg-success'}">
                ${altasCount}/3
            </span>
        </td>
        <td>
            <span class="badge ${bajasCount >= 3 ? 'bg-danger' : 'bg-warning'}">
                ${bajasCount}/3
            </span>
        </td>
        <td>
            <button class="btn btn-sm btn-outline-success me-1 ${altasCount >= 3 ? 'disabled' : ''}"
                    onclick="openAltaModal('${team.tag}')"
                    title="${altasCount >= 3 ? 'Límite alcanzado' : 'Registrar alta'}">
                <i class="bi bi-person-plus"></i> Alta
            </button>
            <button class="btn btn-sm btn-outline-danger me-1 ${bajasCount >= 3 ? 'disabled' : ''}"
                    onclick="openBajaModal('${team.tag}')"
                    title="${bajasCount >= 3 ? 'Límite alcanzado' : 'Registrar baja'}">
                <i class="bi bi-person-x"></i> Baja
            </button>
            <button class="btn btn-sm btn-outline-info me-1"
                    onclick="showTransferHistory('${team.tag}')"
                    title="Ver historial">
                <i class="bi bi-clock-history"></i>
            </button>
            <!-- NUEVO: Botón de Reset -->
            <button class="btn btn-sm btn-outline-secondary"
                    onclick="resetTeamTransfers('${team.tag}')"
                    title="Reiniciar contadores de altas/bajas">
                <i class="bi bi-arrow-clockwise"></i>
            </button>
        </td>
    </tr>
   `;
        tableBody.append(row);
    });
}

// --- NUEVO: Modal para registrar ALTA ---
function openAltaModal(teamTag) {
    // Crear modal dinámico si no existe
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
                                <label class="form-label">ID del Jugador (1-7 caracteres)</label>
                                <input type="text" id="altaPlayerID" class="form-control" maxlength="7">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Nickname (1-12 caracteres)</label>
                                <input type="text" id="altaPlayerNickname" class="form-control" maxlength="12">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Avatar (ej: male1)</label>
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

    if (!playerId || !nickname) {
        Swal.fire('Error', 'ID y Nickname son obligatorios.', 'error');
        return;
    }
    if (playerId.length > 7 || nickname.length > 12) {
        Swal.fire('Error', 'Longitud inválida.', 'error');
        return;
    }

    const resultado = registrarAlta(teamTag, playerId, nickname, avatar); // ← pasa avatar
    if (resultado.success) {
        Swal.fire('Éxito', resultado.message, 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('altaModal'));
        modal.hide();
        renderTransfersTable();
    } else {
        Swal.fire('Alta denegada', resultado.message, 'error');
    }
}

// --- NUEVO: Modal para registrar BAJA ---
function openBajaModal(teamTag) {
    // Obtener jugadores del equipo
    const allTeamData = JSON.parse(localStorage.getItem('allTeamData') || '[]');
    const team = allTeamData.find(t => t.tag === teamTag);
    if (!team || team.jugadores.length === 0) {
        Swal.fire('Sin jugadores', `El equipo ${teamTag} no tiene jugadores para dar de baja.`, 'info');
        return;
    }

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
    team.jugadores.forEach(p => {
        select.append(`<option value="${p.ID}">${p.nickname} (ID: ${p.ID})</option>`);
    });

    const modal = new bootstrap.Modal(document.getElementById('bajaModal'));
    modal.show();
}

function confirmBaja(teamTag) {
    const playerId = $('#bajaPlayerSelect').val();
    if (!playerId) {
        Swal.fire('Error', 'Selecciona un jugador.', 'error');
        return;
    }

    // Buscar jugador para obtener su nickname
    const allTeamData = JSON.parse(localStorage.getItem('allTeamData') || '[]');
    let nickname = 'Desconocido';
    for (const team of allTeamData) {
        const player = team.jugadores.find(p => p.ID === playerId);
        if (player) {
            nickname = player.nickname;
            break;
        }
    }

    const resultado = registrarBaja(teamTag, playerId, nickname);
    if (resultado.success) {
        // Eliminar jugador de allTeamData y mover a SIN_EQUIPO
        movePlayerToNoTeamInTransferModule(playerId);
        Swal.fire('Éxito', resultado.message, 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('bajaModal'));
        modal.hide();
        renderTransfersTable();
    } else {
        Swal.fire('Baja denegada', resultado.message, 'error');
    }
}

// Función auxiliar para mover jugador a SIN_EQUIPO (sin SweetAlert ni confirmación)
function movePlayerToNoTeamInTransferModule(playerID) {
    const allTeamData = JSON.parse(localStorage.getItem('allTeamData') || '[]');
    let playerObj = null;
    // Buscar y remover del equipo actual
    for (let i = 0; i < allTeamData.length; i++) {
        const team = allTeamData[i];
        const idx = team.jugadores.findIndex(p => p.ID === playerID);
        if (idx !== -1) {
            playerObj = team.jugadores.splice(idx, 1)[0];
            break;
        }
    }
    if (playerObj) {
        // Asegurar equipo SIN_EQUIPO
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
        noTeam.jugadores.push(playerObj);
        localStorage.setItem('allTeamData', JSON.stringify(allTeamData));
    }
}

// --- NUEVO: Mostrar historial detallado ---
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

    Swal.fire({
        title: 'Historial de Transferencias',
        html: html,
        icon: 'info',
        width: '600px'
    });
}

/**
 * Reinicia los contadores de altas y bajas para un equipo específico.
 * NO elimina jugadores ni afecta a jugadoresBajaGlobal.
 * @param {string} teamTag - Tag del equipo a reiniciar.
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
            // Reiniciar solo el registro del equipo
            log[teamTag] = { altas: [], bajas: [] };
            saveTransferLog(log);
            Swal.fire({
                icon: 'success',
                title: '¡Reiniciado!',
                text: `Los contadores de altas/bajas del equipo ${teamTag} han sido restablecidos.`,
                timer: 2000,
                showConfirmButton: false
            });
            renderTransfersTable(); // Actualizar vista
        }
    });
}


// --- Inicializar tabla al cargar la pestaña ---
$(document).on('shown.bs.tab', 'button[data-bs-target="#transfersTab"]', function () {
    renderTransfersTable();
});

// --- Exponer funciones globales ---
window.TransferControl = {
    ...window.TransferControl,
    renderTransfersTable,
    openAltaModal,
    confirmAlta,
    openBajaModal,
    confirmBaja,
    showTransferHistory,
    resetTeamTransfers, 
    exportTransferReport
};