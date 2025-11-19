// Archivo: /assets/js/modules/config-juego.js

// 1. CONSTANTES (Configuración)
const LIMITES = {
    free: 3,
    premium: 7
};


const BASE_AVATARES = {
    standard: ['female1', 'female2', 'male1', 'male2'],
    premium_extra: ['female3', 'male3', 'female4', 'male4'],
    streamer_extra: ['pikachu', 'blastoise', 'venusaur', 'charizard']
};

// Función para calcular el límite real según roles
export function obtenerLimitePicks(membership, roles) {
    // Si tiene membresía premium O es Coach O es Streamer -> Límite alto
    if (membership === 'premium' || roles.isCoach || roles.isStreamer) {
        return LIMITES.premium;
    }
    return LIMITES.free;
}


export function obtenerAvataresDisponibles(membership, roles) {
    let lista = [...BASE_AVATARES.standard];

    // Si es Premium o tiene rol de pago, agregamos más
    if (membership === 'premium' || roles.isCoach || roles.isStreamer) {
       lista = [...lista, ...BASE_AVATARES.premium_extra];
    }

    // Si ES Streamer específicamente, agregamos los de Pokémon
    if (roles.isStreamer) {
        lista = [...lista, ...BASE_AVATARES.streamer_extra];
    }

    return lista;
}

// FUNCIÓN DE RENDERIZADO (Picks)
/**
 * Genera los inputs para seleccionar Pokémones favoritos.
 * @param {Array} picks - Array de strings con los picks actuales del usuario.
 * @param {String} plan - El plan del usuario ('free', 'premium', etc).
 * @param {Array} listaPokemon - La lista completa de pokémones cargada desde el JSON.
 */
export function renderPicks(picks = [], membership = 'free', roles = {}, listaPokemon = []) {
    const max = obtenerLimitePicks(membership, roles);
    const container = document.getElementById('picks-container');

    if (!container) return; // Seguridad: si no existe el div, no hacemos nada

    container.innerHTML = '';

    for (let i = 0; i < max; i++) {

        const wrap = document.createElement('div');
        wrap.className = 'd-flex align-items-center mt-2'; // Usando clases Bootstrap para limpiar CSS inline

        const icon = document.createElement('img');
        icon.className = 'poke-icon ms-2';
        icon.style.width = '35px';
        icon.style.height = '35px';
        icon.style.display = 'none';

        const input = document.createElement('input');
        input.className = 'form-control';
        input.placeholder = `Pick ${i + 1}`;
        input.value = picks[i] || '';
        input.setAttribute('list', 'pokemon-list');

        // Lógica interna para mostrar icono si ya tiene valor
        const checkIcon = (val) => {
            if (listaPokemon.includes(val)) {
                icon.src = `/assets/licencias/${val.toLowerCase()}.webp`;
                icon.style.display = 'block';
            } else {
                icon.style.display = 'none';
            }
        };

        // Evento Input
        checkIcon(input.value);
        input.addEventListener('input', () => {
            const nombre = input.value.trim();

            // 1. Si no es un pokemon válido de la lista
            if (!listaPokemon.includes(nombre)) {
                icon.style.display = 'none';
                return;
            }

            // 2. Validar Repetidos
            const todos = [...container.querySelectorAll('input')]
                .map(x => x.value.trim())
                .filter(x => x !== '');

            // Filtramos cuántas veces aparece el nombre actual
            const repetidos = todos.filter(p => p === nombre).length > 1;

            if (repetidos) {
                // Usamos SweetAlert si está disponible, si no alert normal
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'warning', title: 'Repetido', text: `Ya agregaste a ${nombre}.` });
                } else {
                    alert(`Ya agregaste ${nombre}.`);
                }
                input.value = '';
                icon.style.display = 'none';
                return;
            }

            // 3. Éxito: Mostrar icono
            icon.src = `/assets/licencias/${nombre.toLowerCase()}.webp`;
            icon.style.display = 'block';
        });

        wrap.appendChild(icon);
        wrap.appendChild(input);
        container.appendChild(wrap);
    }
}