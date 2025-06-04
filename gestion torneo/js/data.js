// js/data.js

// Variables globales para los datos (accedidas por otros módulos)
let allTeamData = [];

// Lista de tags para definir los grupos (puedes mover esto a un archivo de configuración si crece)
const grupoNorteTags = ['AEP', 'AMT', 'LB', 'MAGMA', 'OBS', 'PKR', 'PL', 'QUARTZ', 'SAPPHIRE', 'STMN', 'TAE', 'TUT', 'TUTW'];
const grupoSurTags = ['AMET', 'CD', 'DG', 'DINASTY', 'FTB', 'PLAGA', 'PLATINO', 'POA', 'SM', 'SPACE', 'TRR', 'ZAFIRO'];

// Función para calcular puntos de un partido individual
function calculateMatchPoints(result) {
    const scoreMap = {
        '3': 3, '2': 2, '1': 1, '0': 0, 'R': 0, 'D': 0, '': 0, 'NJ':0 // Added 'NJ' for consistency
    };
    const numResult = parseInt(result);
    if (!isNaN(numResult)) {
        return numResult;
    }
    return scoreMap[result] || 0;
}

// Función para calcular el total de puntos de un equipo
function calculateTotalPoints(team) {
    let suma = 0;
    if (team && team.partidos) {
        for (const partidoKey in team.partidos) {
            if (partidoKey.startsWith('M')) {
                suma += calculateMatchPoints(team.partidos[partidoKey]);
            }
        }
    }
    return suma;
}

// Carga de todos los datos de equipos desde localStorage
async function loadAllTeamData() {
    // 1. Añade este console.log para ver qué hay en localStorage antes de parsear.
    const storedData = localStorage.getItem('allTeamData');
    console.log("Datos brutos de localStorage al cargar:", storedData);

    try {
        // Asegúrate de que esta línea esté presente y correcta
        window.allTeamData = storedData ? JSON.parse(storedData) : [];
        console.log("Datos de equipos cargados desde localStorage (allTeamData en memoria):", window.allTeamData); // Verifica si hay datos aquí

        // ... (resto de la lógica para inicializar 'partidos' y 'puntosTotales'
        // para equipos existentes, lo cual es crucial si los datos antiguos no los tenían) ...
        window.allTeamData.forEach(team => {
            if (!team.partidos) {
                team.partidos = {};
                for (let i = 1; i <= 14; i++) {
                    team.partidos[`M${i}`] = "0";
                }
            } else {
                 // Asegura que los valores sean strings si vienen como números
                for (const key in team.partidos) {
                    if (typeof team.partidos[key] !== 'string') {
                        team.partidos[key] = String(team.partidos[key]);
                    }
                }
            }
            team.puntosTotales = window.calculateTotalPoints(team); // Asegúrate de llamar a calculateTotalPoints con window.
        });

        // Asegúrate de que grupoNorteTags y grupoSurTags son accesibles (window.grupoNorteTags, etc.)
        const equiposNorte = window.allTeamData.filter(team => window.grupoNorteTags.includes(team.tag.toUpperCase()));
        const equiposSur = window.allTeamData.filter(team => window.grupoSurTags.includes(team.tag.toUpperCase()));

        return { equiposNorte, equiposSur };

    } catch (e) {
        console.error("Error al parsear datos de localStorage o inicializar equipos:", e);
        window.allTeamData = []; // Restablece a vacío para evitar más errores
        return { equiposNorte: [], equiposSur: [] };
    }
}

// Guarda todos los datos de equipos en localStorage
function saveAllTeamData() {
    // 1. Añade este console.log para ver qué datos se están intentando guardar.
    console.log("Intentando guardar en localStorage:", window.allTeamData);

    // 2. Asegúrate de que los puntos totales se calculen JUSTO ANTES de guardar.
    // Aunque ya lo haces al cargar, es una buena práctica hacerlo antes de guardar.
    window.allTeamData.forEach(team => {
        team.puntosTotales = calculateTotalPoints(team);
    });

    try {
        // 3. Verifica si window.allTeamData es un array válido y no está vacío.
        if (Array.isArray(window.allTeamData) && window.allTeamData.length > 0) {
            localStorage.setItem('allTeamData', JSON.stringify(window.allTeamData));
            console.log("allTeamData guardado exitosamente en localStorage.");
        } else if (Array.isArray(window.allTeamData) && window.allTeamData.length === 0) {
             localStorage.setItem('allTeamData', JSON.stringify([])); // Guarda un array vacío si no hay datos
             console.log("No hay equipos para guardar. localStorage actualizado a un array vacío.");
        } else {
            console.error("Error: allTeamData no es un array válido para guardar.", window.allTeamData);
        }
    } catch (e) {
        // 4. Captura cualquier error que ocurra durante JSON.stringify o setItem.
        console.error("Error al guardar en localStorage:", e);
        if (e instanceof TypeError) {
            console.error("Posiblemente intentando serializar un objeto circular o datos inválidos.");
        }
    }
}

// Función para obtener los jugadores de todos los equipos de forma plana
function getFlatPlayersData() {
    let allPlayers = [];
    // 1. Añade este console.log para ver qué datos de equipos se están procesando.
    console.log("getFlatPlayersData: Procesando allTeamData:", window.allTeamData);

    window.allTeamData.forEach(team => {
        // Asegúrate de que 'jugadores' existe y es un array
        if (team.jugadores && Array.isArray(team.jugadores)) {
            team.jugadores.forEach(player => {
                // Añade el tag y nombre del equipo al jugador para mostrar en la tabla
                // Esto es crucial para que DataTables pueda mostrar la columna 'equipo'
                allPlayers.push({
                    nickname: player.nickname,
                    ID: player.ID,
                    avatar: player.avatar,
                    teamTag: team.tag,   // <-- Añadir el tag del equipo
                    teamName: team.team, // <-- Añadir el nombre del equipo
                    teamActivo: team.activo // También puede ser útil para la columna de estado
                });
            });
        }
    });
    // 2. Añade este console.log para ver el array final de jugadores "planos".
    console.log("getFlatPlayersData: Jugadores finales para la tabla:", allPlayers);
    return allPlayers;
}

// Exportar funciones y variables que otros módulos necesitarán
// Usamos 'window' para que sean accesibles globalmente, o un patrón de módulos más avanzado
// si tu proyecto crece (Webpack/ESM). Para empezar, 'window' es simple.
window.allTeamData = allTeamData; // Necesario para que otros archivos lo modifiquen
window.getFlatPlayersData = getFlatPlayersData;
window.loadAllTeamData = loadAllTeamData;
window.saveAllTeamData = saveAllTeamData;
window.calculateTotalPoints = calculateTotalPoints; // Necesario para refrescar
window.grupoNorteTags = grupoNorteTags;
window.grupoSurTags = grupoSurTags;