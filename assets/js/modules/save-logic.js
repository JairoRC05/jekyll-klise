// 📁 Archivo: /assets/js/modules/save-logic.js

import { validarTextoSeguro, verificarCooldownNickname } from './validation.js';

/**
 * Maneja el proceso completo de guardado del perfil.
 * @param {Event} e - El evento submit del formulario.
 * @param {Object} user - El objeto usuario de Firebase Auth.
 * @param {Object} db - La instancia de Firestore.
 * @param {Object} dataGlobal - Los datos originales del usuario (para comparar cambios).
 * @param {String} avatarSeleccionado - El avatar actual seleccionado en la UI.
 */
export async function guardarPerfil(e, user, db, dataGlobal, avatarSeleccionado) {
    e.preventDefault();

    if (!user) return;

    // 1. RECOLECCIÓN DE DATOS DEL DOM
    // Usamos optional chaining (?.) para seguridad
    const nuevoNickname = document.getElementById('nickname').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const equipo = document.getElementById('equipo-input').value.trim();
    const cumple = document.getElementById('cumpleaños').value;
    const disponibilidad = document.getElementById('disponibilidad').value;
    const buscandoEquipo = document.getElementById('buscando-equipo').checked;
    const horarioJuego = document.getElementById('horario-juego').value;


    // Recolectar Tags
    const estilosJuego = [];
    document.querySelectorAll('.tag-check:checked').forEach(chk => estilosJuego.push(chk.value));

    // Recolectar Picks
    const picks = [];
    document.querySelectorAll('#picks-container input').forEach(input => {
        if (input.value.trim()) picks.push(input.value.trim());
    });

    // 2. VALIDACIONES VISUALES (SweetAlert)

    // A. Validar Groserías (Usando el módulo validation.js)
    const valNick = validarTextoSeguro(nuevoNickname, "Nickname");
    if (!valNick.esValido) return Swal.fire('Atención', valNick.mensaje, 'warning');

    const valBio = validarTextoSeguro(descripcion, "Descripción");
    if (!valBio.esValido) return Swal.fire('Atención', valBio.mensaje, 'warning');

    if (equipo && equipo !== 'Disponible' && equipo !== 'No disponible') {
        const valEquipo = validarTextoSeguro(equipo, "Nombre de Equipo");
        if (!valEquipo.esValido) return Swal.fire('Atención', valEquipo.mensaje, 'warning');
    }

    // B. Validaciones de Lógica de Negocio
    if (disponibilidad === 'solo-torneos') {
        if (!buscandoEquipo && (!equipo || equipo === 'Disponible' || equipo === 'No disponible')) {
            return Swal.fire('Falta información', 'Para torneos debes tener equipo o buscar uno.', 'warning');
        }
    }

    if (buscandoEquipo && !horarioJuego) {
        return Swal.fire('Horario requerido', 'Si buscas equipo, indica tu horario de juego.', 'warning');
    }

    // 3. CONFIRMACIÓN
    const result = await Swal.fire({
        title: '¿Guardar cambios?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    // Loading...
    Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() });

    try {
        // 4. VERIFICACIONES DE BACKEND (Async)
        const nickActual = dataGlobal.nickname || '';
        const haCambiadoNick = nuevoNickname !== nickActual;

        if (haCambiadoNick) {
            // A. Unicidad
            const snapshot = await db.collection('jugadores_publicos')
                .where('nickname', '==', nuevoNickname).limit(1).get();

            if (!snapshot.empty && snapshot.docs[0].id !== user.uid) {
                throw new Error('Este nickname ya está en uso.');
            }

            // B. Cooldown (Usando módulo validation.js)
            await verificarCooldownNickname(user.uid, db);
        }
        
        const planUsuario = dataGlobal.plan || 'free';
        const esFree = planUsuario === 'free';
        const roles = dataGlobal.roles || {}; 

        const updatesPrivado = {
            nickname: nuevoNickname,
            mains: document.getElementById('main-input').value.trim(),
            rol: document.getElementById('rol').value,
            discord: document.getElementById('discord').value.trim(),
            partidas: document.getElementById('partidas').value,
            descripcion: descripcion,
            avatar: avatarSeleccionado, // Pasado como argumento
            plan: planUsuario,
            // Conversión a números para evitar errores de tipo
            winRate: parseInt(document.getElementById('win-rate').value) || null,
            licencias: parseInt(document.getElementById('licencias').value) || null,
            vecesMaestro: parseInt(document.getElementById('veces-maestro').value) || null,
            rachaMaestro: parseInt(document.getElementById('racha-maestro').value) || null,
            telefono: document.getElementById('telefono')?.value.replace(/\s/g, '') || null,
            disponibilidad: disponibilidad,
            equipo: buscandoEquipo ? 'Disponible' : (disponibilidad === 'no' ? 'No disponible' : equipo),
            horarioJuego: horarioJuego,
            picks: picks,
            estilosJuego: estilosJuego
        };

        // Cumpleaños (Solo si es nuevo)
        if (!dataGlobal.cumpleaños && cumple) {
            updatesPrivado.cumpleaños = new Date(cumple);
        }

        // Redes Sociales (No Free)
        if (!esFree) {
            updatesPrivado.instagram = document.getElementById('instagram')?.value.trim() || '';
            updatesPrivado.x = document.getElementById('x')?.value.trim() || '';
            updatesPrivado.facebook = document.getElementById('facebook')?.value.trim() || '';
            updatesPrivado.pais = document.getElementById('pais')?.value.trim() || null;
            updatesPrivado.region = document.getElementById('region')?.value.trim() || null;
        }

        // Streamer
        if (roles.isStreamer) {
            updatesPrivado.perfilStreamer = {
                twitch: document.getElementById('twitch').value.trim(),
                youtube: document.getElementById('youtube').value.trim(),
                kick: document.getElementById('kick').value.trim(),
                clips: [
                    document.getElementById('clip1').value.trim(),
                    document.getElementById('clip2').value.trim(),
                    document.getElementById('clip3').value.trim()
                ],
                horario: document.getElementById('horario-stream').value,
                categorias: document.getElementById('categorias')?.value.trim() || '',
                seguidores: parseInt(document.getElementById('seguidores')?.value) || 0
            };
        }

        // Coach
        if (roles.isCoach) {
            const bioCoach = document.getElementById('coach-bio').value.trim();
            const valCoach = validarTextoSeguro(bioCoach, "Bio Coach");

            if (!valCoach.esValido) throw new Error(valCoach.mensaje);

            updatesPrivado.perfilCoach = {
                verificado: dataGlobal.perfilCoach?.verificado || false, // Mantenemos lo que había
                logros: dataGlobal.perfilCoach?.logros || [],
                paypal: document.getElementById('coach-paypal').value.trim(),
                biografiaExtensa: bioCoach,
                horario: document.getElementById('horario-coach').value
            };
        }

        // 6. ESCRITURA EN FIREBASE
        await db.collection('usuarios').doc(user.uid).update(updatesPrivado);

        // Historial Nicks
        if (haCambiadoNick) {
            await db.collection('usuarios').doc(user.uid).collection('historial_nicks').add({
                nickname: nuevoNickname,
                fecha: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // Actualizar Perfil Público
        const nicksSnap = await db.collection('usuarios').doc(user.uid).collection('historial_nicks').get();
        const historialNicks = [];
        nicksSnap.forEach(doc => historialNicks.push(doc.data()));

        const updatesPublico = {
            ...updatesPrivado,
            historial_nicks: historialNicks,
            logros: dataGlobal.logros || [],
            trayectoria: dataGlobal.trayectoria || [],
            id_juego: dataGlobal.id_juego || '',
        };
        // Datos sensibles fuera
        delete updatesPublico.telefono;
        delete updatesPublico.cumpleaños;

        await db.collection('jugadores_publicos').doc(user.uid).set(updatesPublico);

        // 7. FINALIZACIÓN
        // Actualizamos el dataGlobal local para que no pida refrescar página
        Object.assign(dataGlobal, updatesPrivado);

        Swal.fire({
            icon: 'success',
            title: '¡Perfil Actualizado!',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (err) {
        console.error("Error saving:", err);
        Swal.fire('Error', err.message || 'Ocurrió un error inesperado.', 'error');
    }
}