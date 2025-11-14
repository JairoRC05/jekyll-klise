

let planUsuario = 'free';
let avatarSeleccionado = 'female1';
const loadingEl = document.getElementById('loading');
const formEl = document.getElementById('profileForm');
const mensajeEl = document.getElementById('mensaje');
const PICKS_MAX = { free: 3, premium: 7, coach: 7, streamer: 7 };

// Avatares por plan
const AVATARES_POR_PLAN = {
    free: ['female1', 'female2', 'male1', 'male2'],
    premium: ['female1', 'female2', 'male1', 'male2', 'female3', 'male3', 'female4'],
    coach: ['female1', 'female2', 'male1', 'male2', 'female3', 'male3', 'female4'],
    streamer: [
        'female1', 'female2', 'male1', 'male2',
        'female3', 'male3', 'female4',
        'pikachu', 'blastoise', 'venusaur', 'charizard'
    ]
};


function renderLogros(logros = []) {
    const cont = document.getElementById('logros-lista');
    if (!logros.length) {
        cont.innerHTML = '<p>No hay logros verificados aún.</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
    logros.forEach(l => {
        html += `
      <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border-bottom: 1px solid #f0f0f0;">
        <img src="${l.equipoLogo || '/assets/placeholder-team.webp'}" 
             alt="Equipo" width="40" height="40" style="border-radius:4px; object-fit:cover;">
        <div><strong>${l.posicion || '—'}</strong></div>
        <img src="${l.torneoLogo || '/assets/placeholder-tournament.webp'}" 
             alt="Torneo" width="40" height="40" style="border-radius:4px; object-fit:cover;">
        <div>
          <div><strong>${l.torneoNombre || 'Torneo'}</strong></div>
          <div><small>${l.fecha || '—'}</small></div>
        </div>
      </div>
    `;
    });
    html += '</div>';
    cont.innerHTML = html;
}

function renderTrayectoria(trayectoria = []) {
    const cont = document.getElementById('trayectoria-lista');
    if (!trayectoria.length) {
        cont.innerHTML = '<p>No hay trayectoria registrada.</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
    trayectoria.forEach(t => {
        html += `
      <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border-bottom: 1px solid #f0f0f0;">
        <img src="${t.equipoLogo || '/assets/placeholder-team.webp'}" 
             alt="Equipo" width="40" height="40" style="border-radius:4px; object-fit:cover;">
        <div>
          <div><strong>${t.equipoNombre || 'Equipo'}</strong></div>
          <div>${t.rol || '—'} • ${t.tiempo || '—'}</div>
        </div>
      </div>
    `;
    });
    html += '</div>';
    cont.innerHTML = html;
}



function renderAvatares(seleccionado = 'female1', plan = 'free') {
    const lista = AVATARES_POR_PLAN[plan] || AVATARES_POR_PLAN.free;
    const container = document.getElementById('avatarSelector');
    container.innerHTML = '';
    lista.forEach(nombre => {
        const img = document.createElement('img');
        img.src = `/assets/avatars/${nombre}.webp`;
        img.alt = nombre;
        img.className = (nombre === seleccionado) ? 'selected' : '';
        img.onclick = () => {
            avatarSeleccionado = nombre;
            renderAvatares(nombre, plan);
        };
        container.appendChild(img);
    });
}


function renderPicks(picks = [], plan = 'free') {
    const max = PICKS_MAX[plan] || 3;
    const container = document.getElementById('picks-container');
    container.innerHTML = '';
    for (let i = 0; i < max; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Pick ${i + 1}`;
        input.value = picks[i] || '';
        input.style.marginTop = '5px';
        input.dataset.index = i;
        container.appendChild(input);
    }
}

function mostrarSeccionesPorPlan(plan) {
    const esFree = plan === 'free';
    const esStreamer = plan === 'streamer';

    // Redes sociales
    document.getElementById('redes-section').style.display = esFree ? 'none' : 'block';

    // Stream (solo streamer)
    document.getElementById('stream-section').style.display = esStreamer ? 'block' : 'none';
    document.getElementById('streamer-extra').style.display = esStreamer ? 'block' : 'none';
}


// Escuchar autenticación
auth.onAuthStateChanged(user => {




    if (!user) {
        window.location.href = '/iniciar-sesion';
        return;
    }

    db.collection('usuarios').doc(user.uid).get()
        .then(doc => {
            loadingEl.style.display = 'none';
            formEl.style.display = 'block';

            if (doc.exists) {

                const data = doc.data();
                planUsuario = data.plan || 'free';

                // Campos editables
                document.getElementById('nickname').value = data.nickname || '';
                document.getElementById('mains').value = data.mains || '';
                document.getElementById('rol').value = data.rol || '';
                document.getElementById('discord').value = data.discord || '';
                document.getElementById('equipo').value = data.equipo || '';
                document.getElementById('partidas').value = data.partidas || '';
                if (data.cumpleaños) {
                    const fecha = new Date(data.cumpleaños.seconds * 1000);
                    document.getElementById('cumpleaños').value = fecha.toISOString().split('T')[0];
                }
                document.getElementById('descripcion').value = data.descripcion || '';

                // Avatar
                avatarSeleccionado = data.avatar || 'female1';
                renderAvatares(avatarSeleccionado, planUsuario);

                // Picks
                renderPicks(data.picks || [], planUsuario);
                // Renderizar logros y trayectoria (solo lectura para el jugador)
                renderLogros(data.logros || []);
                renderTrayectoria(data.trayectoria || []);

                // Mostrar secciones si hay datos
                document.getElementById('logros-section').style.display =
                    (data.logros && data.logros.length) ? 'block' : 'none';

                document.getElementById('trayectoria-section').style.display =
                    (data.trayectoria && data.trayectoria.length) ? 'block' : 'none';

                // Redes sociales
                if (!esFree) {
                    document.getElementById('instagram').value = data.instagram || '';
                    document.getElementById('x').value = data.x || '';
                    document.getElementById('facebook').value = data.facebook || '';
                }


                // Streamer
                if (esStreamer) {
                    document.getElementById('twitch').value = data.twitch || '';
                    document.getElementById('youtube').value = data.youtube || '';
                    document.getElementById('kick').value = data.kick || '';
                    document.getElementById('horario').value = data.horario || '';
                    document.getElementById('seguidores').value = data.seguidores || '';
                    document.getElementById('clip1').value = data.clip1 || '';
                    document.getElementById('clip2').value = data.clip2 || '';
                    document.getElementById('clip3').value = data.clip3 || '';
                    document.getElementById('clip_yt').value = data.clip_yt || '';
                    document.getElementById('categorias').value = data.categorias || '';
                }

                // Mostrar/ocultar secciones
                mostrarSeccionesPorPlan(planUsuario);

                // 🪙 Monedas (solo lectura)
                document.getElementById('saldo-monedas').textContent = data.monedas || 0;
            } else {
                renderAvatares('female1');
                document.getElementById('saldo-monedas').textContent = 0;
            }
        })
        .catch(err => {
            mensajeEl.className = 'error';
            mensajeEl.textContent = 'Error al cargar tu perfil: ' + err.message;
        });

    // Cargar historial de monedas
    const historialRef = db.collection('usuarios').doc(user.uid).collection('historial_monedas');
    historialRef.orderBy('fecha', 'desc').limit(10).get()
        .then(snapshot => {
            const historialEl = document.getElementById('historial-monedas');
            if (snapshot.empty) {
                historialEl.innerHTML = '<p><em>No hay transacciones aún.</em></p>';
                return;
            }

            let html = '<ul style="list-style: none; padding: 0;">';
            snapshot.forEach(doc => {
                const t = doc.data();
                const fecha = new Date(t.fecha.seconds * 1000).toLocaleDateString();
                const signo = t.cantidad >= 0 ? '+' : '';
                html += `
        <li style="padding: 6px 0; border-bottom: 1px solid #eee;">
          <strong>${signo}${t.cantidad}</strong> 
          — ${t.motivo || 'Sin motivo'} 
          <small>(${fecha})</small>
        </li>
      `;
            });
            html += '</ul>';
            historialEl.innerHTML = html;
        })
        .catch(err => {
            console.warn("No se pudo cargar historial:", err);
            document.getElementById('historial-monedas').innerHTML = '<p><em>Error al cargar historial.</em></p>';
        });


});

// Guardar cambios
document.getElementById('profileForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    const updates = {
        nickname: document.getElementById('nickname').value.trim(),
        mains: document.getElementById('mains').value,
        rol: document.getElementById('rol').value,
        discord: document.getElementById('discord').value.trim(),
        equipo: document.getElementById('equipo').value.trim() || 'Disponible',
        partidas: document.getElementById('partidas').value,
        descripcion: document.getElementById('descripcion').value.trim(),
        avatar: avatarSeleccionado
    };

    // Siempre guardar picks
    const picks = [];
    document.querySelectorAll('#picks-container input').forEach(input => {
        if (input.value.trim()) picks.push(input.value.trim());
    });
    updates.picks = picks;

    // Solo guardar redes si no es free
    if (planUsuario !== 'free') {
        updates.instagram = document.getElementById('instagram')?.value.trim() || '';
        updates.x = document.getElementById('x')?.value.trim() || '';
        updates.facebook = document.getElementById('facebook')?.value.trim() || '';
    }


    // Solo guardar datos de streamer si es streamer
    if (planUsuario === 'streamer') {
        updates.twitch = document.getElementById('twitch')?.value.trim() || '';
        updates.youtube = document.getElementById('youtube')?.value.trim() || '';
        updates.kick = document.getElementById('kick')?.value.trim() || '';
        updates.horario = document.getElementById('horario')?.value.trim() || '';
        updates.seguidores = parseInt(document.getElementById('seguidores')?.value) || 0;
        updates.clip1 = document.getElementById('clip1')?.value.trim() || '';
        updates.clip2 = document.getElementById('clip2')?.value.trim() || '';
        updates.clip3 = document.getElementById('clip3')?.value.trim() || '';
        updates.clip_yt = document.getElementById('clip_yt')?.value.trim() || '';
        updates.categorias = document.getElementById('categorias')?.value.trim() || '';
    }

    const cumple = document.getElementById('cumpleaños').value;
    if (cumple) {
        updates.cumpleaños = new Date(cumple);
    }

    db.collection('usuarios').doc(user.uid).update(updates)
        .then(() => {
            mensajeEl.className = 'exito';
            mensajeEl.textContent = '¡Perfil actualizado!';
            setTimeout(() => mensajeEl.textContent = '', 3000);
        })
        .catch(err => {
            mensajeEl.className = 'error';
            mensajeEl.textContent = 'Error: ' + err.message;
        });
});
