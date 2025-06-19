// utils_ranking.js

async function mostrarEquipos(equipos, contenedor, grupo, mostrarIconos = true) {
    contenedor.innerHTML = '';

    const resultadoMapeo = {
        3: 'V',
        2: 'V',
        1: 'V',
        'R': 'R',
        'Z': 'Z',
        0: 'D'
    };

    const equiposPorPuntos = equipos.reduce((acc, equipo) => {
        acc[equipo.suma] = acc[equipo.suma] || [];
        acc[equipo.suma].push(equipo);
        return acc;
    }, {});

    const puntosOrdenados = Object.keys(equiposPorPuntos)
        .map(Number)
        .sort((a, b) => b - a);

    let rank = 0;
    let overallIndex = 0;

    for (const puntos of puntosOrdenados) {
        let grupoDeEquipos = equiposPorPuntos[puntos];

        // Desempate por enfrentamiento directo
        // console.log(`Equipos con ${puntos} puntos:`, grupoDeEquipos.map(equipo => `${equipo.team} (${equipo.tag})`));
        if (grupoDeEquipos.length > 1) {
            grupoDeEquipos.sort((equipoA, equipoB) => {
                // Primero, verifica la propiedad posicionDesempate
                if (equipoA.posicionDesempate === true && equipoB.posicionDesempate !== true) {
                    return -1; // equipoA va primero
                }
                if (equipoA.posicionDesempate !== true && equipoB.posicionDesempate === true) {
                    return 1; // equipoB va primero
                }
                // Si ambos tienen la misma propiedad (o ninguna), entonces mantiene el orden actual
                return 0;
            });
            // Esperar a que se completen todas las promesas del sort
            //   grupoDeEquipos = await Promise.all(grupoDeEquipos);
        }

        rank++;

        grupoDeEquipos.forEach(equipo => {
            const colDiv = document.createElement('div');
            colDiv.classList.add('col-12', 'col-md-6', 'col-lg-6', 'col-xl-4');
            // Añadir el tag como un data-attribute para fácil referencia
            colDiv.dataset.teamTag = equipo.tag;

            const cardRoundListDiv = document.createElement('div');
            cardRoundListDiv.classList.add('card-round-list');
            const cardRoundTeamDiv = document.createElement('div');
            cardRoundTeamDiv.classList.add('card-round-team');
            const link = document.createElement('a');
            link.href = equipo.link;
            const img = document.createElement('img');
            img.src = `/assets/logos/${equipo.tag}.webp`;
            img.alt = '';
            img.classList.add('img-fluid');
            link.appendChild(img);
            cardRoundTeamDiv.appendChild(link);
            const cardRoundTitleDiv = document.createElement('div');
            cardRoundTitleDiv.classList.add('card-round-title');
            const titleH2 = document.createElement('h2');
            titleH2.textContent = equipo.team;

            if (mostrarIconos) {
                if (overallIndex < 4) {
                    const indigoLogo = document.createElement('img');
                    indigoLogo.src = '/assets/logos/LIGA-INDIGO.svg'; 
                    indigoLogo.alt = 'Escudo de seguridad'; 
                    indigoLogo.style.width = '20px'; 
                    indigoLogo.style.height = '20px'; 
                    indigoLogo.style.marginBottom = '3px'
                    titleH2.appendChild(document.createTextNode(' '));
                    titleH2.appendChild(indigoLogo);
                }
                if (overallIndex < 8) {
                    const shieldLogo = document.createElement('img');
                    shieldLogo.src = '/assets/logos/COPA XFORCE.svg'; 
                    shieldLogo.alt = 'Escudo de seguridad'; 
                    shieldLogo.style.width = '20px'; 
                    shieldLogo.style.height = '20px'; 
                    shieldLogo.style.marginBottom = '3px'
                    titleH2.appendChild(document.createTextNode(' '));
                    titleH2.appendChild(shieldLogo);
                }
            }

            cardRoundTitleDiv.appendChild(titleH2);
            cardRoundTeamDiv.appendChild(cardRoundTitleDiv);
            const cardRoundRecordDiv = document.createElement('div');
            cardRoundRecordDiv.classList.add('card-round-record');
            const partidos = equipo.partidos;
            const partidosKeys = Object.keys(partidos);
            partidosKeys.forEach(key => {
                const resultado = partidos.hasOwnProperty(key) ? partidos[key] : null;
                const spanRecord = document.createElement('span');
                spanRecord.classList.add('record');
                if (resultado === 3) {
                    spanRecord.classList.add('sup');
                    spanRecord.textContent = resultadoMapeo[resultado];
                } else if (resultado === 2) {
                    spanRecord.classList.add('win');
                    spanRecord.textContent = resultadoMapeo[resultado];
                } else if (resultado === 1) {
                    spanRecord.classList.add('one');
                    spanRecord.textContent = resultadoMapeo[resultado];
                } else if (resultado === 'R') {
                    spanRecord.classList.add('rea');
                    spanRecord.textContent = resultadoMapeo[resultado];
                } else if (resultado === 'Z') {
                    spanRecord.classList.add('des');
                    spanRecord.textContent = resultadoMapeo[resultado];
                } else if (resultado === 0) {
                    spanRecord.classList.add('loss');
                    spanRecord.textContent = resultadoMapeo[resultado];
                } else {
                    spanRecord.textContent = resultado;
                }
                cardRoundRecordDiv.appendChild(spanRecord);
            });
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
            placeSpan.textContent = rank < 10 ? `0${rank}` : rank;
            cardRoundPlaceDiv.appendChild(placeSpan);
            const cardBackDiv = document.createElement('div');
            cardBackDiv.classList.add('card-back');
            const colorLeftDiv = document.createElement('div');
            colorLeftDiv.classList.add('card-color-left', equipo.tag);
            cardBackDiv.appendChild(colorLeftDiv);
            cardRoundListDiv.appendChild(cardRoundTeamDiv);
            cardRoundListDiv.appendChild(cardRoundPtsDiv);
            cardRoundListDiv.appendChild(cardRoundPlaceDiv);
            cardRoundListDiv.appendChild(cardBackDiv);
            colDiv.appendChild(cardRoundListDiv);
            contenedor.appendChild(colDiv);
            overallIndex++;
        });
    }
}

async function buscarResultadosDirectos(equipoTagA, equipoTagB, grupo) {
    console.log(`Buscando resultados directos entre ${equipoTagA} y ${equipoTagB} del grupo ${grupo}`);
    const resultados = { victorias: 0, derrotas: 0 };
    const archivoPartidos = `/assets/partidos/p${grupo.toLowerCase()}.json`;

    try {
        const response = await fetch(archivoPartidos);
        const data = await response.json();
        const rondas = data[0].rondas; // Accedemos al array de rondas directamente

        for (const ronda of rondas) {
            if (ronda.partidos) {
                for (const partido of ronda.partidos) {
                    const tagEquipo1 = partido.tag1;
                    const tagEquipo2 = partido.tag2;

                    console.log(`Comparando: ${equipoTagA} vs ${equipoTagB}`);
                    console.log(`Partido en JSON: ${partido.equipo1} (${tagEquipo1}) vs ${partido.equipo2} (${tagEquipo2}) - Resultado: ${partido.resultado}`);

                    if (
                        (tagEquipo1 === equipoTagA && tagEquipo2 === equipoTagB) ||
                        (tagEquipo1 === equipoTagB && tagEquipo2 === equipoTagA)
                    ) {
                        const resultadoPartido = partido.resultado;
                        const [puntos1, puntos2] = resultadoPartido.split('-');
                        let puntosA, puntosB;

                        if (tagEquipo1 === equipoTagA) {
                            puntosA = parseInt(puntos1);
                            puntosB = parseInt(puntos2);
                        } else {
                            puntosA = parseInt(puntos2);
                            puntosB = parseInt(puntos1);
                        }

                        console.log(`Resultado para ${equipoTagA}: ${puntosA}-${puntosB}`);

                        if (!isNaN(puntosA) && !isNaN(puntosB)) {
                            if (puntosA > puntosB) {
                                resultados.victorias++;
                            } else if (puntosA < puntosB) {
                                resultados.derrotas++;
                            }
                            console.log(`Resultados acumulados para ${equipoTagA} vs ${equipoTagB}:`, resultados);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error al buscar resultados directos en ${archivoPartidos}:`, error);
    }

    return resultados;
}

function invertirResultado(resultado) {
    if (!resultado) return '0-0';
    const [p1, p2] = resultado.split('-');
    return `${p2}-${p1}`;
}


function compararProgresoEquipos(previousTeamPoints, currentEquiposData, contenedorGrupo) {
    if (!contenedorGrupo) return;

    // Obtener los elementos de las tarjetas que ya fueron renderizadas en el DOM
    // Ahora usamos el data-team-tag en el colDiv para identificar el equipo
    const equipoElements = Array.from(contenedorGrupo.querySelectorAll('.col-12[data-team-tag]'));

    equipoElements.forEach(colDivElement => {
        const equipoTag = colDivElement.dataset.teamTag;
        const cardRoundRecordDiv = colDivElement.querySelector('.card-round-record');

        // Encontrar los datos actuales de este equipo
        const currentEquipo = currentEquiposData.find(eq => eq.tag === equipoTag);

        if (!currentEquipo) {
            console.warn(`No se encontró data actual para el equipo ${equipoTag}.`);
            return;
        }

        const currentSuma = currentEquipo.suma;
        const previousSuma = previousTeamPoints[equipoTag];

        let indicador = '';
        let claseIcono = '';

        if (previousSuma !== undefined) { // Si el equipo ya tenía puntos registrados
            const cambio = currentSuma - previousSuma; // Cambio en la suma de puntos

            if (cambio > 0) {
                indicador = '';
                claseIcono = 'bi bi-arrow-up-circle-fill';
            } else if (cambio < 0) {
                indicador = '';
                claseIcono = 'bi bi-arrow-down-circle-fill';
            } else {
                indicador = '';
                claseIcono = 'bi bi-arrow-down-up';
            }
        } else {
            // El equipo es "nuevo" en el registro de puntos, o es la primera carga.
            indicador = '';
            claseIcono = 'bi bi-star-fill text-info';
        }

        // Crear y añadir el span para el indicador de progreso
        const progresoSpan = document.createElement('span');
        progresoSpan.classList.add('progreso-individual');
        progresoSpan.innerHTML = `<i class="${claseIcono}"></i> ${indicador}`;

        // Añadirlo al div de records, justo después de los spans de los partidos
        if (cardRoundRecordDiv) {
            // Puedes decidir si quieres un espacio o un separador visual
            const existingSpans = cardRoundRecordDiv.querySelectorAll('span.record');
            if (existingSpans.length > 0) {
                // Añadir un separador visual, por ejemplo una barra vertical
                const separator = document.createElement('span');
                separator.textContent = ' '; // O '&nbsp;&nbsp;'
                cardRoundRecordDiv.appendChild(separator);
            }
            cardRoundRecordDiv.appendChild(progresoSpan);
        }
    });
}


function aplicarDesempate(equipos) {
    const equiposCopiados = [...equipos]; 

    const equiposPorPuntos = equiposCopiados.reduce((acc, equipo) => {
        acc[equipo.suma] = acc[equipo.suma] || [];
        acc[equipo.suma].push(equipo);
        return acc;
    }, {});

    const puntosOrdenados = Object.keys(equiposPorPuntos)
        .map(Number)
        .sort((a, b) => b - a);

    let equiposFinalOrdenados = [];

    for (const puntos of puntosOrdenados) {
        let grupoDeEquipos = equiposPorPuntos[puntos];

        if (grupoDeEquipos.length > 1) {
            grupoDeEquipos.sort((equipoA, equipoB) => {
                // Lógica de desempate por posiciónDesempate
                if (equipoA.posicionDesempate && !equipoB.posicionDesempate) {
                    return -1; // equipoA sube
                }
                if (!equipoA.posicionDesempate && equipoB.posicionDesempate) {
                    return 1; // equipoB sube
                }

              
                if (equipoA.enfrentamientos && equipoB.enfrentamientos) {
                    const resultadoDesempate = mostrarResultadosPartidoDesempate(equipoA, equipoB); // Suponiendo que esta función existe y es accesible
                    if (resultadoDesempate === 1) return -1; // A gana, A sube
                    if (resultadoDesempate === -1) return 1; // B gana, B sube
                }

                if (equipoA.desempateAdicional > equipoB.desempateAdicional) return -1;
                if (equipoA.desempateAdicional < equipoB.desempateAdicional) return 1;

                return 0; // Mantener el orden actual si no hay diferencia
            });
        }
        equiposFinalOrdenados = equiposFinalOrdenados.concat(grupoDeEquipos);
    }
    return equiposFinalOrdenados;
}


async function loadAndDisplayRanking(grupoDivId, teamFiles, grupoNombre) {
    const grupoDiv = document.getElementById(grupoDivId);
    const equiposData = [];

    const fetchPromises = teamFiles.map(file =>
        fetch(file)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${file}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.grupo === grupoNombre) {
                    const equipo = data;
                    let suma = 0;
                    if (equipo.partidos) {
                        for (const partido in equipo.partidos) {
                            suma += parseInt(equipo.partidos[partido]) || 0;
                        }
                    }
                    equiposData.push({ ...equipo, suma: suma });
                }
            })
            .catch(error => console.error(`Error fetching ${file}:`, error))
    );

    await Promise.all(fetchPromises);

    // PASO 1: Ordenar por suma de puntos (orden inicial)
    equiposData.sort((a, b) => b.suma - a.suma);
    console.log(`equiposData ${grupoNombre} (después de suma):`, equiposData);

    // PASO 2: Aplicar la lógica de desempate para refinar el orden
    const equiposRankeadosConDesempate = aplicarDesempate(equiposData);
    console.log(`equiposData ${grupoNombre} (después de desempate):`, equiposRankeadosConDesempate);


    const localStorageKey = `rankingAnteriorPuntos${grupoNombre}`;
    const rankingAnteriorPuntos = localStorage.getItem(localStorageKey);
    let previousTeamPoints = {};
    if (rankingAnteriorPuntos) {
        previousTeamPoints = JSON.parse(rankingAnteriorPuntos);
        console.log(`Ranking anterior (${grupoNombre}) cargado desde localStorage:`, previousTeamPoints);
    } else {
        console.log(`No se encontró ranking anterior de puntos para ${grupoNombre} en localStorage.`);
    }

    if (grupoDiv) {
        // Usa los equipos ya rankeados para mostrar, sin que mostrarEquipos los reordene
        // Necesitas asegurarte de que mostrarEquipos no tenga lógica de ordenamiento interna,
        // o adaptarla para que solo reciba y muestre el array ya ordenado.
        await mostrarEquipos(equiposRankeadosConDesempate, grupoDiv, grupoNombre);
        compararProgresoEquipos(previousTeamPoints, equiposRankeadosConDesempate, grupoDiv);
    }

    const currentTeamPoints = {};
    equiposRankeadosConDesempate.forEach(equipo => { // Guardar el ranking final
        currentTeamPoints[equipo.tag] = equipo.suma;
    });
    localStorage.setItem(localStorageKey, JSON.stringify(currentTeamPoints));
    console.log(`Ranking actual de puntos para ${grupoNombre} guardado en localStorage.`);

    // ¡Devolver los equipos FINALMENTE ordenados y desempatados!
    return equiposRankeadosConDesempate;
}