// Archivo: /assets/js/modules/ui-render.js


export function actualizarAvatarPreview(nombreAvatar) {
    const imgPreview = document.getElementById('avatar-preview');
    const topAvatar = document.getElementById('top-avatar'); 
    
    if (imgPreview) imgPreview.src = `/assets/avatars/${nombreAvatar}.webp`;
    if (topAvatar) topAvatar.src = `/assets/avatars/${nombreAvatar}.webp`;
}
/**
 * Renderiza la lista de avatares seleccionables.
 * @param {String} avatarActual - El nombre del archivo del avatar actual.
 * @param {Array} listaAvataresDisponibles - ¡La lista CALCULADA!
 * @param {Function} onAvatarClick - Callback para notificar la selección.
 */
export function renderAvatares(avatarActual = 'female1', listaAvataresDisponibles, onAvatarClick) {
    const cont = document.getElementById('avatars-grid-modal');
    if (!cont) return;

    cont.innerHTML = '';

    const lista = listaAvataresDisponibles || [];

    lista.forEach(avatar => {
        const img = document.createElement('img');
        img.src = `/assets/avatars/${avatar}.webp`; // Asegúrate que la ruta coincida con tu estructura
        img.alt = avatar;
        img.className = 'avatar-opcion'; 
        img.style.width = '70px';
        img.style.height = '70px';
        img.style.objectFit = 'cover';
        img.style.cursor = 'pointer';
        
        // Borde destacado si es el seleccionado
        if (avatar === avatarActual) {
            img.style.border = '3px solid #ffcc00';
            img.style.transform = 'scale(1.1)';
            img.classList.add('selected');
        } else {
            img.style.border = '2px solid transparent';
        }

        img.addEventListener('click', () => {
            // Ejecutamos la función que nos pasó el archivo principal
            if (onAvatarClick) onAvatarClick(avatar);
            
            document.querySelectorAll('.avatar-opcion').forEach(el => el.classList.remove('selected'));
            img.classList.add('selected');
        });

        cont.appendChild(img);
    });
}

/**
 * Pinta la lista de logros/torneos ganados (Jugador).
 */
export function renderLogros(logros = []) {
    const cont = document.getElementById('logros-lista');
    if (!cont) return;

    if (!logros.length) {
        cont.innerHTML = '<p class="text-muted small">No hay logros verificados aún.</p>';
        return;
    }

    let html = '<div class="d-flex flex-column gap-2">';
    logros.forEach(l => {
        html += `
        <div class="d-flex align-items-center p-2 border rounded bg-white">
            <img src="${l.equipoLogo || '/assets/placeholder-team.webp'}" 
                 class="rounded me-2" width="40" height="40" style="object-fit:cover;">
            
            <div class="me-auto">
                <div class="fw-bold text-dark" style="font-size: 0.9rem;">${l.torneoNombre || 'Torneo'}</div>
                <small class="text-muted">${l.fecha || '—'}</small>
            </div>
            
            <div class="text-end">
                <span class="badge bg-warning text-dark border border-warning">${l.posicion || '🏆'}</span>
            </div>
        </div>`;
    });
    html += '</div>';
    cont.innerHTML = html;
}

/**
 * Pinta la lista de logros como Coach.
 */
export function renderLogrosCoach(logrosCoach = []) {
    const contenedor = document.getElementById('lista-logros-coach');
    const seccion = document.getElementById('seccion-logros-coach');

    // Control de visibilidad de la sección entera
    if (!contenedor || !seccion) return;

    if (!logrosCoach || logrosCoach.length === 0) {
        seccion.style.display = 'none';
        return;
    }

    seccion.style.display = 'block';
    contenedor.innerHTML = ''; 

    let html = '';
    logrosCoach.forEach(logro => {
        html += `
            <div class="list-group-item d-flex justify-content-between align-items-center bg-light mb-2 rounded border-0 p-2">
                <div class="d-flex align-items-center gap-3">
                    <div class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                        <i class="bi bi-clipboard-check"></i>
                    </div>
                    <div>
                        <div class="fw-bold text-dark small">${logro.torneo || 'Torneo'}</div>
                        <small class="text-muted" style="font-size: 0.75rem;">
                            Coach de: <strong>${logro.equipo || '?'}</strong>
                        </small>
                    </div>
                </div>
                <div class="text-end">
                    <span class="badge bg-primary rounded-pill">${logro.posicion || 'Ganador'}</span>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
}

/**
 * Pinta la trayectoria de equipos anteriores.
 */
export function renderTrayectoria(trayectoria = []) {
    const cont = document.getElementById('trayectoria-lista');
    if (!cont) return;

    if (!trayectoria.length) {
        cont.innerHTML = '<p class="text-muted small">No hay trayectoria registrada.</p>';
        return;
    }

    let html = '<div class="d-flex flex-column gap-2">';
    trayectoria.forEach(t => {
        html += `
        <div class="d-flex align-items-center p-2 border-bottom">
            <img src="${t.equipoLogo || '/assets/placeholder-team.webp'}" 
                 class="rounded-circle me-2 border" width="35" height="35" style="object-fit:cover;">
            <div>
                <div class="fw-bold small">${t.equipoNombre || 'Equipo'}</div>
                <div class="text-muted" style="font-size: 0.75rem;">${t.rol || 'Player'} • ${t.tiempo || '—'}</div>
            </div>
        </div>`;
    });
    html += '</div>';
    cont.innerHTML = html;
}

/**
 * Muestra u oculta secciones del DOM según los roles activos.
 * @param {Object} roles - Objeto { isStreamer: true, isCoach: false, ... }
 */
export function mostrarSeccionesPorRoles(roles = {}) {
    // Helpers seguros
    const elStream = document.getElementById('stream-section'); // Inputs de Twitch
    const elCoach = document.getElementById('coach-inputs-section'); // Inputs de Coach
    const elRegion = document.getElementById('region-section'); // Inputs de Pais/Region (Premium)

    // 1. Lógica Streamer
    if (elStream) {
        elStream.style.display = roles.isStreamer ? 'block' : 'none';
    }

    // 2. Lógica Coach
    if (elCoach) {
        elCoach.style.display = roles.isCoach ? 'block' : 'none';
    }

    // 3. Lógica Premium Global (Si tiene CUALQUIER rol de pago o es premium)
    // Asumimos que si es streamer o coach, también merece ver la sección de región
    const esPremium = roles.isStreamer || roles.isCoach || roles.isPremium; 
    if (elRegion) {
        elRegion.style.display = esPremium ? 'block' : 'none';
    }
    
    // Si tienes sección de redes sociales que solo ven los premium:
    const elRedes = document.getElementById('redes-section');
    if(elRedes) elRedes.style.display = esPremium ? 'block' : 'none';
}


export async function renderEstadoNickname(uid, db) {
    const nickInput = document.getElementById('nickname');
    const statusIcon = document.getElementById('nick-status-icon');
    if (!nickInput || !statusIcon) return;

    const actualizarTooltip = (mensaje, colorIcono) => {
        statusIcon.style.color = colorIcono;
        // Bootstrap 5 Tooltip
        let tooltip = bootstrap.Tooltip.getInstance(statusIcon);
        if (!tooltip) tooltip = new bootstrap.Tooltip(statusIcon);
        statusIcon.setAttribute('data-bs-original-title', mensaje);
        tooltip.setContent({ '.tooltip-inner': mensaje });
    };

    try {
        const snapshot = await db.collection('usuarios').doc(uid)
            .collection('historial_nicks').orderBy('fecha', 'desc').limit(1).get();

        if (snapshot.empty) {
            nickInput.disabled = false;
            actualizarTooltip("✅ Puedes cambiar tu nickname.", "#198754");
            return;
        }

        const data = snapshot.docs[0].data();
        const ultimaFecha = data.fecha.toDate();
        const ahora = new Date();
        const horasPasadas = Math.abs(ahora - ultimaFecha) / (1000 * 60 * 60);

        if (horasPasadas < 72) {
            nickInput.disabled = true;
            const fechaDesbloqueo = new Date(ultimaFecha);
            fechaDesbloqueo.setDate(fechaDesbloqueo.getDate() + 3);
            const fechaStr = fechaDesbloqueo.toLocaleDateString();
            actualizarTooltip(`🔒 Bloqueado hasta el ${fechaStr}`, "#dc3545");
        } else {
            nickInput.disabled = false;
            actualizarTooltip("✅ Cambio disponible.", "#198754");
        }
    } catch (error) {
        console.error("Error UI Nick:", error);
    }
}

/**
 * Marca los checkboxes de los Tags según lo guardado.
 */
export function renderTags(tagsGuardados = []) {
    const checkboxes = document.querySelectorAll('.tag-check');
    const countSpan = document.getElementById('tags-count');
    
    if(!checkboxes.length) return;

    checkboxes.forEach(c => c.checked = false); // Limpiar
    
    tagsGuardados.forEach(tagValue => {
        const input = document.querySelector(`.tag-check[value="${tagValue}"]`);
        if (input) input.checked = true;
    });

    if(countSpan) countSpan.textContent = document.querySelectorAll('.tag-check:checked').length;
}


/**
 * Renderiza las insignias desde un array del perfil principal.
 */
export function renderInsignias(insignias = []) {
    const cont = document.getElementById('mis-insignias');
    if (!cont) return;

    if (!insignias || insignias.length === 0) {
        cont.innerHTML = '<p class="text-muted small">No tienes insignias aún.</p>';
        return;
    }

    let html = '';
    insignias.forEach(b => {
        // Verificamos si es timestamp de Firestore o fecha string/Date
        let fechaTexto = '';
        if (b.fecha && b.fecha.seconds) {
             fechaTexto = new Date(b.fecha.seconds * 1000).toLocaleDateString();
        } else if (b.fecha) {
             fechaTexto = new Date(b.fecha).toLocaleDateString();
        }

        html += `
        <div class="text-center position-relative" title="${b.nombre}">
          <img src="/assets/insignias/${b.imagen}.webp" 
               width="60" height="60" 
               class="mb-1"
               style="object-fit: contain; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));">
          <div style="line-height:1.1;"><small class="fw-bold" style="font-size:0.7rem">${b.nombre}</small></div>
          <div class="text-muted" style="font-size:0.65rem">${fechaTexto}</div>
        </div>
      `;
    });
    cont.innerHTML = html;
}

/**
 * Renderiza historial de nicks desde array.
 */
export function renderHistorialNicks(historial = []) {
    const cont = document.getElementById('historial-nicks-mi-perfil');
    if (!cont) return;

    if (!historial.length) {
        cont.textContent = 'Sin cambios.';
        return;
    }
    // Crear lista única de nicks (Set) para evitar duplicados visuales
    const unicos = [...new Set(historial.map(h => h.nickname))];
    cont.textContent = unicos.join(', ');
}