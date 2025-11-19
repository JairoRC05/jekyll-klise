// 📁 Archivo: /assets/js/modules/validation.js

let filtroGroserias = null;

/**
 * Inicializa el filtro con las palabras cargadas.
 * @param {Array} listaProhibida - Array de strings desde el JSON.
 */
export function iniciarFiltro(listaProhibida) {
    if (typeof LeoProfanity === 'undefined') {
        console.warn("⚠️ Librería LeoProfanity no encontrada.");
        return;
    }
    filtroGroserias = LeoProfanity;
    filtroGroserias.clearList(); // Limpiar inglés por defecto
    filtroGroserias.add(listaProhibida);
    console.log("✅ Filtro de seguridad activo.");
}

/**
 * Verifica si un texto contiene groserías.
 * Retorna objeto: { esValido: boolean, mensaje: string }
 */
export function validarTextoSeguro(texto, contexto = "texto") {
    if (!texto) return { esValido: true };
    
    if (filtroGroserias && filtroGroserias.check(texto)) {
        return { 
            esValido: false, 
            mensaje: `El campo '${contexto}' contiene lenguaje inapropiado.` 
        };
    }
    return { esValido: true };
}

/**
 * Verifica si el usuario puede cambiar su nick (Cooldown de 3 días).
 */
export async function verificarCooldownNickname(uid, db) {
    try {
        const snapshot = await db.collection('usuarios').doc(uid)
            .collection('historial_nicks')
            .orderBy('fecha', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) return true; // Nunca ha cambiado

        const ultimaFecha = snapshot.docs[0].data().fecha.toDate();
        const ahora = new Date();
        const diffDias = Math.floor((ahora - ultimaFecha) / (1000 * 60 * 60 * 24));

        if (diffDias < 3) {
            const fechaStr = ultimaFecha.toLocaleDateString();
            throw new Error(`Solo puedes cambiar tu nickname cada 3 días. Último cambio: ${fechaStr}`);
        }
        return true;

    } catch (error) {
        throw error; // Re-lanzamos para manejarlo en el UI
    }
}