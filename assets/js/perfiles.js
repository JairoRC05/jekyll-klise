// 📁 Archivo: /assets/js/perfiles.js

import {
    renderPicks,
    obtenerAvataresDisponibles,
    obtenerLimiteTags
} from './modules/config-juego.js';
import {
    renderAvatares,
    actualizarAvatarPreview,
    renderLogros,
    renderTrayectoria,
    renderLogrosCoach,
    mostrarSeccionesPorRoles,
    renderEstadoNickname,
    renderTags,
    renderInsignias,
    renderHistorialNicks,
} from './modules/ui-render.js';
import { cargarListasGlobales } from './modules/data-fetch.js';
import { iniciarFiltro } from './modules/validation.js';
import { guardarPerfil } from './modules/save-logic.js';


let dataGlobal = null;
let membership = 'free';
let rolesUsuario = { isPlayer: true };
let avatarSeleccionado = 'female1';
let CACHE_POKEMONS = [];
let CACHE_REGIONES = [];
let inputObjetivo = null;
let modalAvatarInstance = null;


document.addEventListener('DOMContentLoaded', async () => {

    const datos = await cargarListasGlobales();
    CACHE_REGIONES = datos.regiones;
    CACHE_POKEMONS = datos.pokemons;
    const btnAvatar = document.getElementById('cambiar-avatar');
    const modalEl = document.getElementById('modalAvatar');

    if (modalEl) {
        modalAvatarInstance = new bootstrap.Modal(modalEl);
    }

    if (btnAvatar) {
        btnAvatar.addEventListener('click', (e) => {
            e.preventDefault(); 
            modalAvatarInstance.show();
        });
    }

    iniciarFiltro(datos.badwords);

    setupFormListeners();
    setupTagListeners();
});


auth.onAuthStateChanged(user => {
    if (!user) { window.location.href = '/iniciar-sesion'; return; }

    const loadingEl = document.getElementById('loading');
    const formEl = document.getElementById('profileForm');

    db.collection('usuarios').doc(user.uid).get().then(doc => {
        if (loadingEl) loadingEl.style.display = 'none';
        if (formEl) formEl.style.display = 'block';

        if (doc.exists) {
            const data = doc.data();
            dataGlobal = data;

            membership = data.membership || 'free';
            rolesUsuario = data.roles || { isPlayer: true };

            const limiteTags = obtenerLimiteTags(membership, rolesUsuario);
            const tagsCount = document.getElementById('tags-count');
            const tagsActivos = document.querySelectorAll('.tag-check:checked').length;
            if (tagsCount) {
                tagsCount.textContent = `${tagsActivos} / ${limiteTags}`;
            }


            const esPremium = membership === 'premium' || rolesUsuario.isCoach || rolesUsuario.isStreamer;
            llenarInputsBasicos(data, esPremium);

            //Avatar
            avatarSeleccionado = data.avatar || 'female1';
            actualizarAvatarPreview(avatarSeleccionado);
            const listaAvatares = obtenerAvataresDisponibles(membership, rolesUsuario);
            renderAvatares(avatarSeleccionado, listaAvatares, (nuevoAvatar) => {
            
            avatarSeleccionado = nuevoAvatar;

            actualizarAvatarPreview(nuevoAvatar);
            
            if (modalAvatarInstance) modalAvatarInstance.hide();
            });

            // Picks & Tags
            renderPicks(data.picks || [], membership, rolesUsuario, CACHE_POKEMONS);
            renderTags(data.estilosJuego || []);

            // Secciones Visuales
            renderInsignias(data.insignias || []);
            renderLogros(data.logros || []);
            renderTrayectoria(data.trayectoria || []);
            renderLogrosCoach(data.perfilCoach?.logros || []);
            renderEstadoNickname(user.uid, db); // Verifica fecha y pinta tooltip
            renderHistorialNicks(data.historial_nicks || []);
            cargarHistorialMonedas(user.uid);

            // Mostrar/Ocultar según rol
            mostrarSeccionesPorRoles(rolesUsuario);


            // Estado del Equipo y horario 
            inicializarHorariosRoles(data);
            inicializarEstadoEquipo(data.equipo, data.disponibilidad);

        } else {
           
            actualizarAvatarPreview('female1');
            const listaAvataresBase = obtenerAvataresDisponibles('free', { isPlayer: true });
            renderAvatares('female1', listaAvataresBase, (nuevo) => {
                avatarSeleccionado = nuevo;
            });
            document.getElementById('saldo-monedas').textContent = 0;
        }
    }).catch(err => console.error("Error carga perfil:", err));
});

document.getElementById('profileForm').addEventListener('submit', (e) => {
    const user = auth.currentUser;
    guardarPerfil(e, user, db, dataGlobal, avatarSeleccionado);
});

function cargarHistorialMonedas(uid) {
    const historialEl = document.getElementById('historial-monedas');
    if (!historialEl) return;

    db.collection('usuarios').doc(uid).collection('historial_monedas')
        .orderBy('fecha', 'desc').limit(10).get()
        .then(snapshot => {
            if (snapshot.empty) {
                historialEl.innerHTML = '<p class="text-muted small">Sin transacciones.</p>';
                return;
            }
            let html = '<ul class="list-unstyled mb-0">';
            snapshot.forEach(doc => {
                const t = doc.data();
                const fecha = t.fecha ? new Date(t.fecha.seconds * 1000).toLocaleDateString() : '';
                const color = t.cantidad >= 0 ? 'text-success' : 'text-danger';
                const signo = t.cantidad >= 0 ? '+' : '';
                html += `
                <li class="border-bottom py-2 d-flex justify-content-between align-items-center">
                  <div>
                    <span class="fw-bold ${color}">${signo}${t.cantidad}</span> 
                    <span class="small text-muted ms-1">${t.motivo}</span>
                  </div>
                  <small class="text-muted" style="font-size:0.7rem">${fecha}</small>
                </li>`;
            });
            html += '</ul>';
            historialEl.innerHTML = html;
        })
        .catch(e => console.error("Error monedas:", e));
}

function llenarInputsBasicos(data, esFree) {
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

    setVal('nickname', data.nickname);
    setVal('main-input', data.mains);
    setVal('rol', data.rol);
    setVal('discord', data.discord);
    setVal('partidas', data.partidas);
    setVal('descripcion', data.descripcion);
    setVal('telefono', data.telefono);
    setVal('win-rate', data.winRate);
    setVal('licencias', data.licencias);
    setVal('veces-maestro', data.vecesMaestro);
    setVal('racha-maestro', data.rachaMaestro);
    setVal('horario-juego', data.horarioJuego);

    if (document.getElementById('saldo-monedas'))
        document.getElementById('saldo-monedas').textContent = data.monedas || 0;

    // Fecha Cumpleaños
    const cumpleInput = document.getElementById('cumpleaños');
    if (data.cumpleaños && cumpleInput) {
        cumpleInput.value = new Date(data.cumpleaños.seconds * 1000).toISOString().split('T')[0];
        cumpleInput.readOnly = true;
    }

    // Redes y Streamer
    if (!esFree) {
        setVal('instagram', data.instagram);
        setVal('x', data.x);
        setVal('facebook', data.facebook);
        setVal('pais', data.pais);
        setVal('region', data.region);
        if (data.pais) document.getElementById('pais')?.dispatchEvent(new Event('input'));
    }

    if (data.roles?.isStreamer) {
        const s = data.perfilStreamer;
        setVal('twitch', s.twitch);
        setVal('youtube', s.youtube);
        setVal('kick', s.kick);
        setVal('clip1', s.clips?.[0]);
        setVal('clip2', s.clips?.[1]);
        setVal('clip3', s.clips?.[2]);
        document.getElementById('stream-section').style.display = 'block';
        setVal('horario-stream', data.perfilStreamer?.horario);
    }

    if (data.roles?.isCoach) {
        setVal('coach-paypal', data.perfilCoach.paypal);
        setVal('coach-bio', data.perfilCoach.biografiaExtensa);
        document.getElementById('coach-inputs-section').style.display = 'block';
        setVal('horario-coach', data.perfilCoach?.horario);
    }
}

function inicializarHorariosRoles(data) {
    // Jugador
    const inputJuego = document.getElementById('horario-juego');
    if (inputJuego) {
        inputJuego.value = data.horarioJuego || '';
        // Disparar evento para actualizar visualmente los botoncitos si hiciste la función "inversa"
        // o simplemente dejar que el componente muestre el texto preview
    }

    // Streamer
    if (data.roles?.isStreamer) {
        const inputStream = document.getElementById('horario-stream');
        if (inputStream) inputStream.value = data.perfilStreamer?.horario || '';
    }

    // Coach
    if (data.roles?.isCoach) {
        const inputCoach = document.getElementById('horario-coach');
        if (inputCoach) inputCoach.value = data.perfilCoach?.horario || '';
    }
}

function inicializarEstadoEquipo(equipoGuardado, disponibilidadGuardada) {
    const inputEq = document.getElementById('equipo-input');
    const checkBuscando = document.getElementById('buscando-equipo');
    const selectDisp = document.getElementById('disponibilidad');

    if (!inputEq) return;

    selectDisp.value = disponibilidadGuardada || 'siempre';

    if (equipoGuardado === 'Disponible') {
        if (checkBuscando) checkBuscando.checked = true;
        inputEq.value = 'Disponible';
    } else if (disponibilidadGuardada === 'no') {
        inputEq.value = 'No disponible';
    } else {
        if (checkBuscando) checkBuscando.checked = false;
        inputEq.value = equipoGuardado || '';
    }
    // Disparamos la lógica visual
    selectDisp.dispatchEvent(new Event('change'));
}

function setupFormListeners() {
    // 1. Autocompletado Región
    document.getElementById('pais')?.addEventListener('input', function () {
        const val = this.value.trim();
        const match = CACHE_REGIONES.find(r => r.pais === val);
        const regInput = document.getElementById('region');
        if (regInput) regInput.value = match ? match.region : '';
    });

    // 2. Formato Teléfono
    const telInput = document.getElementById('telefono');
    if (telInput) {
        telInput.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').substring(0, 10);
            if (x.length > 6) x = `${x.substring(0, 3)} ${x.substring(3, 6)} ${x.substring(6)}`;
            else if (x.length > 3) x = `${x.substring(0, 3)} ${x.substring(3)}`;
            e.target.value = x;
        });
    }

    // 4. Lógica Equipo (Toggle)
    const dispSelect = document.getElementById('disponibilidad');
    const busCheck = document.getElementById('buscando-equipo');
    const eqInput = document.getElementById('equipo-input');
    const hint = document.getElementById('equipo-hint');
    const horarioWrap = document.getElementById('horario-wrapper');
    const seccionAgenteLibre = document.getElementById('seccion-agente-libre');

    const updateEq = () => {
        const disp = dispSelect.value;
        const buscando = busCheck.checked;

        if (seccionAgenteLibre) {
            seccionAgenteLibre.style.display = (disp === 'no') ? 'none' : 'block';
        }


        if (disp === 'no') {
            eqInput.value = 'No disponible';
            eqInput.disabled = true;
            busCheck.disabled = true;
            busCheck.checked = false;
            if (horarioWrap) horarioWrap.style.display = 'none';
            return;
        }
        busCheck.disabled = false;

        if (buscando) {
            eqInput.value = 'Disponible';
            eqInput.disabled = true;
            eqInput.classList.add('bg-light');
            if (hint) hint.innerHTML = '<span class="text-success">✅ Buscando equipo (Agente Libre)</span>';
            if (horarioWrap) horarioWrap.style.display = 'block';
        } else {
            eqInput.disabled = false;
            eqInput.classList.remove('bg-light');
            if (eqInput.value === 'Disponible' || eqInput.value === 'No disponible') eqInput.value = '';
            if (horarioWrap) horarioWrap.style.display = 'none';
            if (hint) hint.textContent = 'Escribe tu equipo actual.';
        }
    };

    dispSelect?.addEventListener('change', updateEq);
    busCheck?.addEventListener('change', updateEq);
}

function setupTagListeners() {
    const checkboxes = document.querySelectorAll('.tag-check');
    const countSpan = document.getElementById('tags-count');

    if (!checkboxes.length) return;

    checkboxes.forEach(chk => {
        // Remover listeners anteriores para evitar duplicados (si llamas esto varias veces)
        // Una forma limpia es clonar el nodo, pero como es simple, asumiremos que se llama una vez.

        chk.addEventListener('change', function () {
            // 1. Calcular el límite ACTUAL en el momento del click
            // Usamos las variables globales 'membership' y 'rolesUsuario'
            const limiteActual = obtenerLimiteTags(membership, rolesUsuario);

            // 2. Contar cuántos hay activos
            const checkedCount = document.querySelectorAll('.tag-check:checked').length;

            // 3. Actualizar contador visual
            if (countSpan) countSpan.textContent = `${checkedCount} / ${limiteActual}`;

            // 4. Validar Límite
            if (checkedCount > limiteActual) {
                this.checked = false; // Desmarcar el último
                if (countSpan) countSpan.textContent = `${limiteActual} / ${limiteActual}`; // Corregir texto

                // Alerta
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
                Toast.fire({
                    icon: 'info',
                    title: `Tu plan permite máximo ${limiteActual} estilos.`
                });
            }
        });
    });
}

function setupHorarioModal() {
    const modalEl = document.getElementById('horarioModal');
    if (!modalEl) return;

    const modalBs = new bootstrap.Modal(modalEl); // Instancia Bootstrap

    // --- Referencias de Inputs del Modal ---
    const checks = modalEl.querySelectorAll('.dia-check-modal');
    const horaIni = document.getElementById('modal-hora-inicio');
    const horaFin = document.getElementById('modal-hora-fin');
    const previewText = document.getElementById('modal-preview-text');
    const btnSave = document.getElementById('modal-save-horario');

    // Función para construir la cadena visual y llenar el preview
    const actualizarPreview = () => {
        const dias = Array.from(checks).filter(c => c.checked).map(c => c.value);
        const ini = horaIni.value;
        const fin = horaFin.value;

        if (!dias.length || !ini || !fin) {
            previewText.textContent = "Sin selección válida";
            return "";
        }
        // Lógica de condensación de días
        let txt = dias.join(", ");
        if (dias.length === 5 && dias.includes('Lun') && dias.includes('Vie')) txt = "Lunes a Viernes";
        if (dias.length === 7) txt = "Todos los días";

        const resultado = `${txt} de ${ini} a ${fin}`;
        previewText.textContent = resultado;
        return resultado;
    };

    // 1. CARGA DE DATOS al ABRIR EL MODAL
    modalEl.addEventListener('show.bs.modal', function (e) {
        // Obtenemos el botón que disparó el evento
        const button = e.relatedTarget;
        const targetInputId = button.getAttribute('data-target-input');

        inputObjetivo = document.getElementById(targetInputId);
        if (!inputObjetivo) return;

        // Limpiar el modal
        checks.forEach(c => c.checked = false);
        horaIni.value = '';
        horaFin.value = '';
        previewText.textContent = '';

        // Cargar datos existentes si los hay
        const valorActual = inputObjetivo.value;
        if (valorActual) {
            // Lógica inversa (muy básica): Intentamos cargar los tiempos
            const [_, diasStr, horaIniStr, horaFinStr] = valorActual.match(/(.*) de (.*) a (.*)/) || [];
            if (diasStr) {
                // Simplificamos la carga: solo se cargan las horas
                horaIni.value = horaIniStr || '';
                horaFin.value = horaFinStr || '';
            }
        }
    });

    // 2. LISTENERS INTERNOS DEL MODAL
    checks.forEach(c => c.addEventListener('change', actualizarPreview));
    horaIni.addEventListener('input', actualizarPreview);
    horaFin.addEventListener('input', actualizarPreview);

    // 3. GUARDAR DATOS Y CERRAR
    btnSave.addEventListener('click', () => {
        const stringFinal = actualizarPreview();
        if (inputObjetivo && stringFinal) {
            inputObjetivo.value = stringFinal; // Guarda en el input oculto

            // Actualizar el texto visible en el formulario principal
            const previewEl = document.getElementById(`preview-${inputObjetivo.id}`);
            if (previewEl) {
                previewEl.textContent = stringFinal;
                previewEl.classList.remove('text-muted');
                previewEl.classList.add('text-success', 'fw-bold');
            }
            modalBs.hide(); // Cierra el modal
        } else {
            Swal.fire('Error', 'Debes seleccionar días y un rango de horas válido.', 'warning');
        }
    });

    // Asegura que los previews de texto se carguen al inicio
    document.querySelectorAll('.preview-texto').forEach(p => {
        const inputId = p.id.replace('preview-', '');
        const input = document.getElementById(inputId);
        if (input && input.value) {
            p.textContent = input.value;
            p.classList.add('text-success', 'fw-bold');
        }
    });
}

document.addEventListener('DOMContentLoaded', setupHorarioModal);