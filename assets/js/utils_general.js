// utils_ranking.js

async function mostrarEquipos(equipos, contenedor, tipoRanking = 'GENERAL', mostrarIconos = true) {
    contenedor.innerHTML = '';

    const resultadoMapeo = {
        3: 'V', 2: 'V', 1: 'V', 'R': 'R', 'Z': 'Z', 0: 'D'
    };

    // Agrupar equipos por puntos
    const equiposPorPuntos = equipos.reduce((acc, equipo) => {
        acc[equipo.suma] = acc[equipo.suma] || [];
        acc[equipo.suma].push(equipo);
        return acc;
    }, {});

    const puntosOrdenados = Object.keys(equiposPorPuntos)
        .map(Number)
        .sort((a, b) => b - a); // Puntos de mayor a menor

    let rankDisplay = 0; // Para el número de ranking que se muestra (puede haber empates en el número)
    let overallIndex = 0; // Índice secuencial para iconos y límite de visualización (ej. top 8)

    for (const puntos of puntosOrdenados) {
        let grupoDeEquiposConMismosPuntos = equiposPorPuntos[puntos];

        if (grupoDeEquiposConMismosPuntos.length > 1) {
            // Aplicar criterios de desempate
            grupoDeEquiposConMismosPuntos.sort((equipoA, equipoB) => {
                // Criterio 1: Propiedad 'posicionDesempate' (booleana)
                // Un equipo con 'posicionDesempate = true' gana a uno con 'false' o sin la propiedad.
                // Si ambos son true o ambos false (o no existe), se pasa al siguiente criterio.
                const desempateA = equipoA.posicionDesempate;
                const desempateB = equipoB.posicionDesempate;
                if (typeof desempateA === 'boolean' && typeof desempateB === 'boolean') {
                    if (desempateA === true && desempateB === false) return -1; // A primero
                    if (desempateA === false && desempateB === true) return 1;  // B primero
                } else if (typeof desempateA === 'boolean' && desempateA === true) {
                    return -1; // A primero si B no tiene la propiedad o no es booleana
                } else if (typeof desempateB === 'boolean' && desempateB === true) {
                    return 1; // B primero si A no tiene la propiedad o no es booleana
                }

                // Criterio 2: Diferencia de goles total (numérica, mayor es mejor)
                // (Asegúrate de que esta propiedad exista en tus objetos 'equipo' si quieres usarla)
                if (equipoA.diferenciaGolesTotal !== undefined && equipoB.diferenciaGolesTotal !== undefined) {
                    if (equipoA.diferenciaGolesTotal !== equipoB.diferenciaGolesTotal) {
                        return equipoB.diferenciaGolesTotal - equipoA.diferenciaGolesTotal;
                    }
                }

                // Criterio 3: Más goles a favor totales (numérica, mayor es mejor)
                // (Asegúrate de que esta propiedad exista)
                if (equipoA.golesAFavorTotal !== undefined && equipoB.golesAFavorTotal !== undefined) {
                     if (equipoA.golesAFavorTotal !== equipoB.golesAFavorTotal) {
                        return equipoB.golesAFavorTotal - equipoA.golesAFavorTotal;
                    }
                }

                // Criterio 4: Alfabético por nombre de equipo como último recurso
                return equipoA.team.localeCompare(equipoB.team);
            });
        }

        rankDisplay++; // Incrementa el número de ranking para este bloque de puntos

        for (const equipo of grupoDeEquiposConMismosPuntos) {
            if (tipoRanking === 'GENERAL' && overallIndex >= 8) { // Si solo quieres mostrar los 8 primeros del general
                 // break; // Si quieres cortar después de los 8. O puedes seguir y no aplicar estilos.
            }

            const colDiv = document.createElement('div');
            colDiv.classList.add('col-12', 'col-md-6', 'col-lg-6', 'col-xl-4');
            // ... (resto de la creación de elementos HTML para la card del equipo, igual que antes)
            // Solo asegúrate de que 'rank' usado para el display sea 'rankDisplay'
            // y los iconos VIP/Shield se basen en 'overallIndex'

            const cardRoundListDiv = document.createElement('div');
            cardRoundListDiv.classList.add('card-round-list');
            const cardRoundTeamDiv = document.createElement('div');
            cardRoundTeamDiv.classList.add('card-round-team');
            const link = document.createElement('a');
            link.href = equipo.link || '#'; // Enlace del equipo
            const img = document.createElement('img');
            img.src = `/assets/logos/${equipo.tag}.webp`; // Logo del equipo
            img.alt = equipo.team;
            img.classList.add('img-fluid');
            link.appendChild(img);
            cardRoundTeamDiv.appendChild(link);
            const cardRoundTitleDiv = document.createElement('div');
            cardRoundTitleDiv.classList.add('card-round-title');
            const titleH2 = document.createElement('h2');
            titleH2.textContent = equipo.team;

            if (mostrarIconos && tipoRanking === 'GENERAL') { // Aplicar iconos solo al ranking general
                if (overallIndex < 4) { // Top 4 VIP
                    const vipLogo = document.createElement('i');
                    vipLogo.classList.add('ti', 'ti-vip'); // Asegúrate de tener estos iconos CSS
                    vipLogo.style.color = 'blue';
                    titleH2.appendChild(document.createTextNode(' '));
                    titleH2.appendChild(vipLogo);
                }
                if (overallIndex < 8) { // Top 8 Shield
                    const shieldLogo = document.createElement('i');
                    shieldLogo.classList.add('ti', 'ti-shield-up'); // Asegúrate de tener estos iconos CSS
                    shieldLogo.style.color = 'orange';
                    titleH2.appendChild(document.createTextNode(' '));
                    titleH2.appendChild(shieldLogo);
                }
            }

            cardRoundTitleDiv.appendChild(titleH2);
            cardRoundTeamDiv.appendChild(cardRoundTitleDiv);
            const cardRoundRecordDiv = document.createElement('div');
            cardRoundRecordDiv.classList.add('card-round-record');

            if (equipo.partidos) {
                Object.values(equipo.partidos).forEach(resultado => {
                    const spanRecord = document.createElement('span');
                    spanRecord.classList.add('record');
                    const resultadoNum = parseInt(resultado);
                    let claseCss = '';
                    let textoSpan = resultadoMapeo[resultado] || resultado; // Usa el mapeo o el valor original

                    if (resultadoMapeo.hasOwnProperty(resultadoNum)) { // Si es un número mapeable (3,2,1,0)
                        textoSpan = resultadoMapeo[resultadoNum];
                        if (resultadoNum === 3) claseCss = 'sup';
                        else if (resultadoNum === 2) claseCss = 'win';
                        else if (resultadoNum === 1) claseCss = 'one';
                        else if (resultadoNum === 0) claseCss = 'loss';
                    } else if (resultado === 'R') { // Para 'R' y 'Z' directamente
                        claseCss = 'rea';
                    } else if (resultado === 'Z') {
                        claseCss = 'des';
                    }
                    if (claseCss) spanRecord.classList.add(claseCss);
                    spanRecord.textContent = textoSpan;
                    cardRoundRecordDiv.appendChild(spanRecord);
                });
            }

            cardRoundTitleDiv.appendChild(cardRoundRecordDiv);
            cardRoundTeamDiv.appendChild(cardRoundTitleDiv);
            const cardRoundPtsDiv = document.createElement('div');
            cardRoundPtsDiv.classList.add('card-round-pts');
            const ptsH6 = document.createElement('h6');
            ptsH6.textContent = `${equipo.suma} pts`;
            cardRoundPtsDiv.appendChild(ptsH6);
            const cardRoundPlaceDiv = document.createElement('div');
            cardRoundPlaceDiv.classList.add('card-round-place');
            const placeSpan = document.createElement('span');
            // Usar rankDisplay para el número de posición (permite empates en el número)
            // O usar (overallIndex + 1) para una secuencia estricta
            placeSpan.textContent = rankDisplay < 10 ? `0${rankDisplay}` : rankDisplay;
            cardRoundPlaceDiv.appendChild(placeSpan);
            const cardBackDiv = document.createElement('div');
            cardBackDiv.classList.add('card-back');
            const colorLeftDiv = document.createElement('div');
            colorLeftDiv.classList.add('card-color-left', equipo.tag); // Usa el tag del equipo para el color
            cardBackDiv.appendChild(colorLeftDiv);
            cardRoundListDiv.appendChild(cardRoundTeamDiv);
            cardRoundListDiv.appendChild(cardRoundPtsDiv);
            cardRoundListDiv.appendChild(cardRoundPlaceDiv);
            cardRoundListDiv.appendChild(cardBackDiv);
            colDiv.appendChild(cardRoundListDiv);
            contenedor.appendChild(colDiv);

            overallIndex++; // Incrementar para el siguiente equipo en la lista general
        }
    }
}


// Lista de archivos de PARTIDOS donde buscar enfrentamientos directos.
// DEBES ACTUALIZAR ESTA LISTA con los nombres de tus archivos de partidos.
// Estos archivos deben contener detalles de los partidos, ej: equipoA vs equipoB, resultado.
const ARCHIVOS_DE_PARTIDOS_GENERALES = [
    '/assets/partidos/pnorte.json',
    '/assets/partidos/psur.json',
    '/assets/partidos/cruces.json'
];

async function buscarResultadosDirectosGeneral(equipoTagA, equipoTagB, listaArchivosPartidos) {
    console.log(`Buscando resultados directos entre ${equipoTagA} y ${equipoTagB}`);
    const resultados = { victoriasA: 0, derrotasA: 0, empates: 0 }; // Desde la perspectiva de equipoA

    if (!listaArchivosPartidos || listaArchivosPartidos.length === 0) {
        console.warn("No se proporcionaron archivos de partidos para buscarResultadosDirectosGeneral.");
        return resultados; // Devuelve ceros si no hay dónde buscar
    }

    for (const archivoPartidos of listaArchivosPartidos) {
        try {
            const response = await fetch(archivoPartidos);
            if (!response.ok) {
                console.warn(`No se pudo cargar ${archivoPartidos} (status: ${response.status})`);
                continue;
            }
            const data = await response.json();
            let rondas = [];
            // Ajusta esto según la estructura de tus JSON de partidos
            if (Array.isArray(data) && data.length > 0 && data[0] && data[0].rondas) {
                rondas = data[0].rondas;
            } else if (data && data.rondas) {
                rondas = data.rondas;
            } else if (Array.isArray(data)) { // Si el JSON es un array de partidos directamente
                 // Aquí necesitarías adaptar cómo iteras si no hay "rondas"
                 // Por ejemplo, si 'data' es un array de objetos 'partido'
                 // rondas = [{ partidos: data }]; // Envuelve para que el bucle de abajo funcione
                 console.warn(`Estructura de rondas no encontrada en ${archivoPartidos}, adaptando...`);
                 // Temporalmente, para evitar errores, si no hay rondas, procesamos partidos si están en la raíz.
                 if (data.partidos) rondas = [{partidos: data.partidos}]; else continue;

            } else {
                console.warn(`Estructura inesperada en ${archivoPartidos}.`);
                continue;
            }

            for (const ronda of rondas) {
                if (ronda.partidos) {
                    for (const partido of ronda.partidos) {
                        // Asegúrate de que tus objetos 'partido' tengan 'tag1', 'tag2', y 'resultado' (ej: "2-1")
                        const tagEquipo1 = partido.tag1;
                        const tagEquipo2 = partido.tag2;
                        const resultadoPartido = partido.resultado; // ej: "2-1"

                        if (!tagEquipo1 || !tagEquipo2 || typeof resultadoPartido !== 'string' || !resultadoPartido.includes('-')) {
                            continue; // Datos incompletos del partido
                        }

                        if ((tagEquipo1 === equipoTagA && tagEquipo2 === equipoTagB) ||
                            (tagEquipo1 === equipoTagB && tagEquipo2 === equipoTagA)) {
                            
                            const [puntosStr1, puntosStr2] = resultadoPartido.split('-');
                            const puntos1 = parseInt(puntosStr1);
                            const puntos2 = parseInt(puntosStr2);

                            if (isNaN(puntos1) || isNaN(puntos2)) continue;

                            if (tagEquipo1 === equipoTagA) { // equipoA es equipo1
                                if (puntos1 > puntos2) resultados.victoriasA++;
                                else if (puntos1 < puntos2) resultados.derrotasA++;
                                else resultados.empates++;
                            } else { // equipoA es equipo2
                                if (puntos2 > puntos1) resultados.victoriasA++;
                                else if (puntos2 < puntos1) resultados.derrotasA++;
                                else resultados.empates++;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Error al procesar resultados directos en ${archivoPartidos}:`, error);
        }
    }
    console.log(`Resultados directos finales para ${equipoTagA} vs ${equipoTagB}:`, resultados);
    return resultados; // { victoriasA: X, derrotasA: Y, empates: Z }
}

// ... (tus otras funciones como invertirResultado, compararRankings, etc., pueden necesitar ajustes si las usas para el ranking general)