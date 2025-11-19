// 📁 Archivo: /assets/js/modules/data-fetch.js

/**
 * Carga todos los datos estáticos (JSONs) necesarios para el perfil.
 * Retorna un objeto con las 3 listas listas para usar.
 */
export async function cargarListasGlobales() {
    try {
        // Ejecutamos las 3 peticiones al mismo tiempo (Paralelismo)
        const [pokemons, teams, regiones, badwords] = await Promise.all([
            fetch('/assets/data/pokemons.json').then(r => r.json()),
            fetch('/assets/data/teams.json').then(r => r.json()),
            fetch('/assets/data/regiones.json').then(r => r.json()),
            fetch('/assets/data/badwords.json').then(r => r.json()).catch(() => []) // Si falla, retorna array vacío
        ]);

        // Llenar Datalists en el DOM automáticamente
        llenarDatalist('pokemon-list', pokemons, (p) => p.nombre || p); // Soporta array de strings u objetos
        llenarDatalist('teams-list', teams, (t) => t.team);
        llenarDatalist('paises-america', regiones, (r) => r.pais);

        return { 
            pokemons: pokemons.map(p => p.nombre || p), // Normalizamos a lista de nombres
            teams, 
            regiones,
            badwords 
        };

    } catch (err) {
        console.error("❌ Error crítico cargando datos:", err);
        return { pokemons: [], teams: [], regiones: [], badwords: [] };
    }
}

/**
 * Helper interno para llenar <datalist>
 */
function llenarDatalist(idElemento, datos, extractorValor) {
    const datalist = document.getElementById(idElemento);
    if (!datalist) return;
    
    datalist.innerHTML = datos.map(item => {
        const val = extractorValor(item);
        return `<option value="${val}">`;
    }).join('');
}