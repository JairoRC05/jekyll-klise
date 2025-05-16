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
        console.log(`Equipos con ${puntos} puntos:`, grupoDeEquipos.map(equipo => `${equipo.team} (${equipo.tag})`));
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
            colDiv.classList.add('col-12', 'col-md-6', 'col-lg-6','col-xl-4');
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
                    const vipLogo = document.createElement('i');
                    vipLogo.classList.add('ti', 'ti-vip');
                    vipLogo.style.color = 'blue';
                    titleH2.appendChild(document.createTextNode(' '));
                    titleH2.appendChild(vipLogo);
                }
                if (overallIndex < 8) {
                    const shieldLogo = document.createElement('i');
                    shieldLogo.classList.add('ti', 'ti-shield-up');
                    shieldLogo.style.color = 'orange';
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



function compararRankings(rankingAnterior, equiposData, contenedorGrupo) {
    if (!contenedorGrupo) return;
    const equiposOrdenados = Array.from(contenedorGrupo.querySelectorAll('.card-round-list'));
    const rankingAnteriorMap = new Map(rankingAnterior.map(equipo => [equipo.tag, equipo.posicion]));

    equiposOrdenados.forEach((cardElement, index) => {
        const equipoTag = cardElement.querySelector('.card-color-left').classList[1];
        const posicionActual = index + 1;
        const posicionAnterior = rankingAnteriorMap.get(equipoTag);

        if (posicionAnterior !== undefined) {
            const cambio = posicionAnterior - posicionActual;
            let indicador = '';
            let claseIcono = '';

            if (cambio > 0) {
                indicador = 'SUBE';
                claseIcono = 'fas fa-caret-up text-success';
            } else if (cambio < 0) {
                indicador = 'BAJA';
                claseIcono = 'fas fa-caret-down text-danger';
            } else {
                indicador = 'MANTIENE';
                claseIcono = 'fa-solid fa-equals text-primary';
            }

            const cambioSpan = document.createElement('span');
            cambioSpan.classList.add('cambio-posicion');
            cambioSpan.innerHTML = `<i class="${claseIcono}"></i>`;
            const cardRoundRecordDiv = cardElement.querySelector('.card-round-record');
            if (cardRoundRecordDiv) {
                cardRoundRecordDiv.appendChild(document.createTextNode(' '));
                cardRoundRecordDiv.appendChild(cambioSpan);
            }
        } else {
            const nuevoSpan = document.createElement('span');
            nuevoSpan.classList.add('cambio-posicion', 'text-info');
            nuevoSpan.innerHTML = '<i class="fas fa-star"></i> NUEVO';
            const cardRoundRecordDiv = cardElement.querySelector('.card-round-record');
            if (cardRoundRecordDiv) {
                cardRoundRecordDiv.appendChild(document.createTextNode(' '));
                cardRoundRecordDiv.appendChild(nuevoSpan);
            }
        }
    });
}

function descargarRanking(equiposDataNorte, equiposDataSur) {
    const rankingActual = {
        norte: equiposDataNorte.map((equipo, index) => ({
            tag: equipo.tag,
            team: equipo.team,
            posicion: index + 1,
            suma: equipo.suma
        })),
        sur: equiposDataSur.map((equipo, index) => ({
            tag: equipo.tag,
            team: equipo.team,
            posicion: index + 1,
            suma: equipo.suma
        }))
    };
    const json = JSON.stringify(rankingActual, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ranking_actual.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}