// ranking_general.js

document.addEventListener('DOMContentLoaded', async function() {
    const rankingGeneralDiv = document.getElementById('rankingGeneral');
    const equiposDataGeneral = [];

    const teamFilesGeneral = [
        'assets/temporadas/junio2025/amet.json',
        'assets/temporadas/junio2025/cd.json',
        'assets/temporadas/junio2025/dg.json',
        'assets/temporadas/junio2025/dinasty.json',
        'assets/temporadas/junio2025/ftb.json',
        'assets/temporadas/junio2025/plaga.json',
        'assets/temporadas/junio2025/platino.json',
        'assets/temporadas/junio2025/poa.json',
        'assets/temporadas/junio2025/rntes.json',
        'assets/temporadas/junio2025/sm.json',
        'assets/temporadas/junio2025/space.json',
        'assets/temporadas/junio2025/trr.json',
        'assets/temporadas/junio2025/zafiro.json',
        'assets/temporadas/junio2025/aep.json',
        'assets/temporadas/junio2025/amt.json',
        'assets/temporadas/junio2025/lb.json',
        'assets/temporadas/junio2025/magma.json',
        'assets/temporadas/junio2025/obs.json',
        'assets/temporadas/junio2025/pkr.json',
        'assets/temporadas/junio2025/pl.json',
        'assets/temporadas/junio2025/quartz.json',
        'assets/temporadas/junio2025/sapphire.json',
        'assets/temporadas/junio2025/stmn.json',
        'assets/temporadas/junio2025/tae.json', // TAE aquí
        'assets/temporadas/junio2025/tut.json', // TUT aquí
        'assets/temporadas/junio2025/tutw.json'
    ].filter((value, index, self) => self.indexOf(value) === index); // Filtra duplicados

    const ARCHIVOS_DE_PARTIDOS_GENERALES = [
        // Ejemplo: '/assets/partidos/partido_semana1.json',
        // Asegúrate de que estos archivos contengan los datos necesarios para buscarResultadosDirectosGeneral
    ];

    async function obtenerDatosEquipos(file) {
        try {
            const response = await fetch('/' + file);
            if (!response.ok) {
                console.warn(`No se pudo cargar el archivo de equipo: ${file} (status: ${response.status})`);
                return null;
            }
            const data = await response.json();

            let equipo;
            if (Array.isArray(data) && data.length > 0) {
                equipo = data[0];
            } else if (typeof data === 'object' && data !== null) {
                equipo = data;
            } else {
                console.warn(`Estructura de datos inesperada en ${file}. Se esperaba un objeto o un array de objetos.`);
                return null;
            }

            if (equipo) {
                let sumaPuntos = 0;
                if (equipo.partidos) {
                    for (const resultadoPuntos of Object.values(equipo.partidos)) {
                        sumaPuntos += parseInt(resultadoPuntos) || 0;
                    }
                }
                return { ...equipo, suma: sumaPuntos };
            }
            return null;
        } catch (error) {
            console.error(`Error procesando ${file}:`, error);
            return null;
        }
    }

    async function buscarResultadosDirectosGeneral(equipoTagA, equipoTagB, listaArchivosPartidos) {
        console.log(`Buscando resultados directos entre ${equipoTagA} y ${equipoTagB}`);
        const resultados = { victoriasA: 0, derrotasA: 0, empates: 0 };

        if (!listaArchivosPartidos || listaArchivosPartidos.length === 0) {
            console.warn("No se proporcionaron archivos de partidos para buscarResultadosDirectosGeneral.");
            return resultados;
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

                if (Array.isArray(data) && data.length > 0 && data[0] && data[0].rondas) {
                    rondas = data[0].rondas;
                } else if (data && data.rondas) {
                    rondas = data.rondas;
                } else if (Array.isArray(data)) {
                     if (data.length > 0 && data[0].tag1 && data[0].tag2) {
                         rondas = [{ partidos: data }];
                    } else {
                        console.warn(`Estructura de array inesperada en ${archivoPartidos}.`);
                        continue;
                    }
                } else {
                    console.warn(`Estructura inesperada en ${archivoPartidos}.`);
                    continue;
                }

                for (const ronda of rondas) {
                    if (ronda.partidos) {
                        for (const partido of ronda.partidos) {
                            const tagEquipo1 = partido.tag1;
                            const tagEquipo2 = partido.tag2;
                            const resultadoPartido = partido.resultado;

                            if (!tagEquipo1 || !tagEquipo2 || typeof resultadoPartido !== 'string' || !resultadoPartido.includes('-')) {
                                continue;
                            }

                            if ((tagEquipo1 === equipoTagA && tagEquipo2 === equipoTagB) ||
                                (tagEquipo1 === equipoTagB && tagEquipo2 === equipoTagA)) {
                                const [puntosStr1, puntosStr2] = resultadoPartido.split('-');
                                const puntos1 = parseInt(puntosStr1);
                                const puntos2 = parseInt(puntosStr2);

                                if (isNaN(puntos1) || isNaN(puntos2)) continue;

                                if (tagEquipo1 === equipoTagA) {
                                    if (puntos1 > puntos2) resultados.victoriasA++;
                                    else if (puntos1 < puntos2) resultados.derrotasA++;
                                    else resultados.empates++;
                                } else {
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
        return resultados;
    }

    async function mostrarEquipos(equipos, contenedor, tipoRanking = 'GENERAL', mostrarIconos = true) {
        contenedor.innerHTML = '';

        const resultadoMapeo = { 3: 'V', 2: 'V', 1: 'V', 'R': 'R', 'Z': 'Z', 0: 'D' };

        // Aquí la agrupación por puntos sigue siendo útil para la presentación visual del ranking
        // donde varios equipos con el mismo puntaje comparten una posición (ej. "Tied for 2nd")
        const equiposPorPuntos = equipos.reduce((acc, equipo) => {
            acc[equipo.suma] = acc[equipo.suma] || [];
            acc[equipo.suma].push(equipo);
            return acc;
        }, {});

        const puntosOrdenados = Object.keys(equiposPorPuntos).map(Number).sort((a, b) => b - a);

        let rankDisplay = 0;
        let overallIndex = 0;

        for (const puntos of puntosOrdenados) {
            let grupoDeEquiposConMismosPuntos = equiposPorPuntos[puntos];

            // Aunque el array principal ya estará ordenado, este sort asegura que
            // dentro del grupo con los mismos puntos, el desempate se mantenga para la visualización.
            // Es una capa de seguridad para la presentación.
            if (grupoDeEquiposConMismosPuntos.length > 1) {
                grupoDeEquiposConMismosPuntos.sort((equipoA, equipoB) => {
                    if (equipoA.posicionDesempate && !equipoB.posicionDesempate) {
                        return -1;
                    }
                    if (!equipoA.posicionDesempate && equipoB.posicionDesempate) {
                        return 1;
                    }
                    return equipoA.team.localeCompare(equipoB.team);
                });
            }

            rankDisplay++;

            for (const equipo of grupoDeEquiposConMismosPuntos) {
                const currentRank = overallIndex + 1;

                const colDiv = document.createElement('div');
                colDiv.classList.add('col-12', 'col-md-6', 'col-lg-4', 'col-xl-3', 'mb-4');
                const cardRoundListDiv = document.createElement('div');
                cardRoundListDiv.classList.add('card-round-list');
                const cardRoundTeamDiv = document.createElement('div');
                cardRoundTeamDiv.classList.add('card-round-team');
                const link = document.createElement('a');
                link.href = equipo.link || '#';
                const img = document.createElement('img');
                img.src = `/assets/logos/${equipo.tag}.webp`;
                img.alt = equipo.team;
                img.classList.add('img-fluid');
                link.appendChild(img);
                cardRoundTeamDiv.appendChild(link);
                const cardRoundTitleDiv = document.createElement('div');
                cardRoundTitleDiv.classList.add('card-round-title');
                const titleH2 = document.createElement('h2');
                titleH2.textContent = equipo.team;

                if (mostrarIconos && tipoRanking === 'GENERAL') {
                    if (currentRank <= 8) {
                        const vipLogo = document.createElement('i');
                        vipLogo.classList.add('ti', 'ti-vip');
                        vipLogo.style.color = 'blue';
                        titleH2.appendChild(document.createTextNode(' '));
                        titleH2.appendChild(vipLogo);
                    }
                    if (currentRank <= 16) {
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

                if (equipo.partidos) {
                    Object.values(equipo.partidos).forEach(resultado => {
                        const spanRecord = document.createElement('span');
                        spanRecord.classList.add('record');
                        const resultadoNum = parseInt(resultado);
                        let claseCss = '';
                        let textoSpan = resultadoMapeo[resultado] || resultado;

                        if (resultadoMapeo.hasOwnProperty(resultadoNum)) {
                            textoSpan = resultadoMapeo[resultadoNum];
                            if (resultadoNum === 3) claseCss = 'sup';
                            else if (resultadoNum === 2) claseCss = 'win';
                            else if (resultadoNum === 1) claseCss = 'one';
                            else if (resultadoNum === 0) claseCss = 'loss';
                        } else if (resultado === 'R') claseCss = 'rea';
                        else if (resultado === 'Z') claseCss = 'des';

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
                placeSpan.textContent = currentRank < 10 ? `0${currentRank}` : currentRank;
                cardRoundPlaceDiv.appendChild(placeSpan);
                const cardBackDiv = document.createElement('div');
                cardBackDiv.classList.add('card-back');
                const colorLeftDiv = document.createElement('div');
                colorLeftDiv.classList.add('card-color-left', equipo.tag === '7Z' ? 'S7Z' : equipo.tag);
                cardBackDiv.appendChild(colorLeftDiv);
                cardRoundListDiv.appendChild(cardRoundTeamDiv);
                cardRoundListDiv.appendChild(cardRoundPtsDiv);
                cardRoundListDiv.appendChild(cardRoundPlaceDiv);
                cardRoundListDiv.appendChild(cardBackDiv);
                colDiv.appendChild(cardRoundListDiv);
                contenedor.appendChild(colDiv);

                overallIndex++;
            }
        }
    }

    function descargarJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // --- NUEVAS FUNCIONES PARA GENERAR CRUCES DE ELIMINATORIAS ---

    function generarEncuentros16avos(ranking) {
        const encuentros = [];
        const mensajesAdvertencia = [];

        if (ranking.length < 16) {
            mensajesAdvertencia.push(`Advertencia: Se necesitan al menos 16 equipos para generar los 16avos de final. Se encontraron ${ranking.length}.`);
        }

        const datosPartidosSimulados16avos = [
            { resultado: 'Pendiente', stream: true, fecha: 'VIE 19 JUN', hora: '22:30' },
            { resultado: 'Pendiente', stream: true, fecha: 'VIE 19 JUN', hora: '21:50' },
            { resultado: 'Pendiente', stream: true, fecha: 'VIE 19 JUN', hora: '21:00' },
            { resultado: 'Pendiente', stream: true, fecha: 'LUN 23 JUN', hora: '22:30' },
            { resultado: 'Pendiente', stream: true, fecha: 'LUN 23 JUN', hora: '21:50' },
            { resultado: 'Pendiente', stream: true, fecha: 'LUN 23 JUN', hora: '21:00' },
            { resultado: 'Pendiente', stream: true, fecha: 'MAR 24 JUN', hora: '21:00' },
            { resultado: 'Pendiente', stream: true, fecha: 'MAR 24 JUN', hora: '21:50' }
        ];

        for (let i = 0; i < 8; i++) {
            const equipo1 = ranking[i];
            const equipo2 = ranking[15 - i];

            if (equipo1 && equipo2) {
                encuentros.push({
                    equipo1: equipo1,
                    equipo2: equipo2,
                    tipo: `16avos - ${i + 1}`,
                    partidoInfo: datosPartidosSimulados16avos[i]
                });
            } else {
                mensajesAdvertencia.push(`Advertencia: No hay suficientes equipos para el cruce ${i + 1} de 16avos.`);
            }
        }
        return { encuentros, mensajesAdvertencia };
    }

    function generarEncuentrosCuartos(ganadores16avos) {
        const encuentros = [];
        const mensajesAdvertencia = [];

        if (ganadores16avos.length < 8) {
            mensajesAdvertencia.push(`Advertencia: Se necesitan 8 ganadores de 16avos para generar los cuartos de final. Se encontraron ${ganadores16avos.length}.`);
        }

        const datosPartidosSimuladosCuartos = [
            { resultado: 'Pendiente', stream: true, fecha: 'Dom 07-JUL', hora: '20:00' },
            { resultado: 'Pendiente', stream: true, fecha: 'Dom 07-JUL', hora: '21:00' },
            { resultado: 'Pendiente', stream: true, fecha: 'Lun 08-JUL', hora: '20:00' },
            { resultado: 'Pendiente', stream: true, fecha: 'Lun 08-JUL', hora: '21:00' }
        ];

        const crucesCuartos = [
            [ganadores16avos[0], ganadores16avos[7]],
            [ganadores16avos[1], ganadores16avos[6]],
            [ganadores16avos[2], ganadores16avos[5]],
            [ganadores16avos[3], ganadores16avos[4]]
        ];

        let partidoIndex = 0;
        crucesCuartos.forEach(cruce => {
            const equipo1 = cruce[0];
            const equipo2 = cruce[1];
            if (equipo1 && equipo2) {
                encuentros.push({
                    equipo1: equipo1,
                    equipo2: equipo2,
                    tipo: `Cuartos - ${partidoIndex + 1}`,
                    partidoInfo: datosPartidosSimuladosCuartos[partidoIndex]
                });
            } else {
                mensajesAdvertencia.push(`Advertencia: No hay suficientes equipos para el cruce de Cuartos ${partidoIndex + 1}.`);
            }
            partidoIndex++;
        });

        return { encuentros, mensajesAdvertencia };
    }

    function generarEncuentrosSemifinales(ganadoresCuartos) {
        const encuentros = [];
        const mensajesAdvertencia = [];

        if (ganadoresCuartos.length < 4) {
            mensajesAdvertencia.push(`Advertencia: Se necesitan 4 ganadores de Cuartos de Final para generar las semifinales. Se encontraron ${ganadoresCuartos.length}.`);
        }

        const datosPartidosSimuladosSF = [
            { resultado: 'Pendiente', stream: true, fecha: 'Mié 10-JUL', hora: '20:00' },
            { resultado: 'Pendiente', stream: true, fecha: 'Mié 10-JUL', hora: '21:00' }
        ];

        const crucesSF = [
            [ganadoresCuartos[0], ganadoresCuartos[3]],
            [ganadoresCuartos[1], ganadoresCuartos[2]]
        ];

        let partidoIndex = 0;
        crucesSF.forEach(cruce => {
            const equipo1 = cruce[0];
            const equipo2 = cruce[1];
            if (equipo1 && equipo2) {
                encuentros.push({
                    equipo1: equipo1,
                    equipo2: equipo2,
                    tipo: `Semifinal - ${partidoIndex + 1}`,
                    partidoInfo: datosPartidosSimuladosSF[partidoIndex]
                });
            } else {
                mensajesAdvertencia.push(`Advertencia: No hay suficientes equipos para el cruce de Semifinal ${partidoIndex + 1}.`);
            }
            partidoIndex++;
        });

        return { encuentros, mensajesAdvertencia };
    }

    function generarEncuentroFinal(ganadoresSF) {
        const encuentros = [];
        const mensajesAdvertencia = [];

        if (ganadoresSF.length < 2) {
            mensajesAdvertencia.push(`Advertencia: Se necesitan 2 ganadores de Semifinales para generar la final. Se encontraron ${ganadoresSF.length}.`);
        }

        const datosPartidoSimuladoFinal = { resultado: 'Gran Final', stream: true, fecha: 'Sáb 13-JUL', hora: '21:00' };

        const equipo1 = ganadoresSF[0];
        const equipo2 = ganadoresSF[1];
        if (equipo1 && equipo2) {
            encuentros.push({
                equipo1: equipo1,
                equipo2: equipo2,
                tipo: 'Gran Final',
                partidoInfo: datosPartidoSimuladoFinal
            });
        } else {
            mensajesAdvertencia.push("Advertencia: No hay suficientes equipos para la Gran Final.");
        }

        return { encuentros, mensajesAdvertencia };
    }

    function createMatchCard(partidoData) {
        const bracketRoundListDiv = document.createElement('div');
        bracketRoundListDiv.classList.add('bracket-round-list');

        const bracketRoundTeam1Div = document.createElement('div');
        bracketRoundTeam1Div.classList.add('bracket-round-team');
        const link1 = document.createElement('a');
        link1.href = `/teams/${partidoData.equipo1.tag}`;
        const img1 = document.createElement('img');
        img1.src = `/assets/logos/${partidoData.equipo1.tag}.webp`;
        img1.alt = `Logo de ${partidoData.equipo1.team}`;
        img1.classList.add('img-fluid');
        link1.appendChild(img1);
        bracketRoundTeam1Div.appendChild(link1);
        bracketRoundListDiv.appendChild(bracketRoundTeam1Div);

        const roundTitlesDiv = document.createElement('div');
        roundTitlesDiv.classList.add('round-titles');

        const cardRoundPromoLeftDiv = document.createElement('div');
        cardRoundPromoLeftDiv.classList.add('card-round-promo', 'left');
        const h6_1 = document.createElement('h6');
        h6_1.textContent = partidoData.equipo1.team.substring(0, 12);
        cardRoundPromoLeftDiv.appendChild(h6_1);
        roundTitlesDiv.appendChild(cardRoundPromoLeftDiv);

        const cardRoundPromoMxDiv = document.createElement('div');
        cardRoundPromoMxDiv.classList.add('card-round-promo', 'mx-2');

        const currentPartidoInfo = partidoData.partidoInfo;

        let promoContent = '';
        if (currentPartidoInfo.stream) {
            promoContent = `
                <span>TWITCH</span>
                <h6>${currentPartidoInfo.resultado}</h6>
                <span>${currentPartidoInfo.fecha}</span>
                <span>${currentPartidoInfo.hora}</span>
            `;
        } else if (currentPartidoInfo.special) {
            promoContent = `
                <span>TWITCH</span>
                <h6>${currentPartidoInfo.resultado}</h6>
                <span>${currentPartidoInfo.hora}</span>
            `;
        } else {
            promoContent = `<h6>${currentPartidoInfo.resultado}</h6>`;
        }
        cardRoundPromoMxDiv.innerHTML = promoContent;
        roundTitlesDiv.appendChild(cardRoundPromoMxDiv);

        const cardRoundPromoRightDiv = document.createElement('div');
        cardRoundPromoRightDiv.classList.add('card-round-promo', 'right');
        const h6_2 = document.createElement('h6');
        h6_2.textContent = partidoData.equipo2.team.substring(0, 12);
        cardRoundPromoRightDiv.appendChild(h6_2);
        roundTitlesDiv.appendChild(cardRoundPromoRightDiv);

        bracketRoundListDiv.appendChild(roundTitlesDiv);

        const bracketRoundTeam2Div = document.createElement('div');
        bracketRoundTeam2Div.classList.add('bracket-round-team-right');
        const link2 = document.createElement('a');
        link2.href = `/teams/${partidoData.equipo2.tag}`;
        const img2 = document.createElement('img');
        img2.src = `/assets/logos/${partidoData.equipo2.tag}.webp`;
        img2.alt = `Logo de ${partidoData.equipo2.team}`;
        img2.classList.add('img-fluid');
        link2.appendChild(img2);
        bracketRoundTeam2Div.appendChild(link2);
        bracketRoundListDiv.appendChild(bracketRoundTeam2Div);

        const cardBackDiv = document.createElement('div');
        cardBackDiv.classList.add('card-back');
        const cardColorLeftDiv = document.createElement('div');
        cardColorLeftDiv.classList.add('card-color-left', partidoData.equipo1.tag === '7Z' ? 'S7Z' : partidoData.equipo1.tag);
        const cardColorRightDiv = document.createElement('div');
        cardColorRightDiv.classList.add('card-color-right', partidoData.equipo2.tag === '7Z' ? 'S7Z' : partidoData.equipo2.tag);
        cardBackDiv.appendChild(cardColorLeftDiv);
        cardBackDiv.appendChild(cardColorRightDiv);
        bracketRoundListDiv.appendChild(cardBackDiv);

        return bracketRoundListDiv;
    }

    // --- LÓGICA PRINCIPAL DE CARGA Y GENERACIÓN DE CRUCES ---
    try {
        const resultadosObtencionEquipos = await Promise.all(teamFilesGeneral.map(obtenerDatosEquipos));
        const equiposFiltrados = resultadosObtencionEquipos.filter(equipo => equipo !== null);
        equiposDataGeneral.push(...equiposFiltrados);

        // APLICAR ORDENACIÓN COMPLETA AQUÍ PARA ASEGURAR QUE equipDataGeneral ESTÁ CORRECTAMENTE ORDENADO
        equiposDataGeneral.sort((a, b) => {
            // 1. Ordenar por puntos (suma) de forma descendente
            if (b.suma !== a.suma) {
                return b.suma - a.suma;
            }

            // 2. Si los puntos son iguales, usar posicionDesempate
            // Los equipos con posicionDesempate: true vienen antes que aquellos con false/undefined
            if (a.posicionDesempate && !b.posicionDesempate) {
                return -1;
            }
            if (!a.posicionDesempate && b.posicionDesempate) {
                return 1;
            }

            // 3. Si puntos y posicionDesempate son iguales, ordenar alfabéticamente por nombre del equipo
            return a.team.localeCompare(b.team);
        });

        console.log("Equipos cargados para ranking general (finalmente ordenados para brackets):", equiposDataGeneral);

        if (rankingGeneralDiv) {
            // mostrarEquipos usará el array ya ordenado, y su sort interno actuará como doble verificación
            await mostrarEquipos(equiposDataGeneral, rankingGeneralDiv, 'GENERAL', true);
        }

        const descargarRankingBtn = document.getElementById('descargarRankingGeneral');
        if (descargarRankingBtn) {
            descargarRankingBtn.addEventListener('click', () => {
                const rankingParaDescargar = equiposDataGeneral.map((equipo, index) => ({
                    tag: equipo.tag,
                    team: equipo.team,
                    posicionCalculada: index + 1,
                    suma: equipo.suma,
                }));
                descargarJSON(rankingParaDescargar, 'ranking_general.json');
            });
        }

        // --- GENERACIÓN Y RENDERIZADO DE LOS 16AVOS DE FINAL ---
        const encuentros16avosContainer = document.getElementById('encuentros16avosContainer');
        if (encuentros16avosContainer) {
            encuentros16avosContainer.innerHTML = '';
            const { encuentros: misEncuentros16avos, mensajesAdvertencia: advertencias16avos } = generarEncuentros16avos(equiposDataGeneral);

            if (advertencias16avos.length > 0) {
                advertencias16avos.forEach(msg => {
                    const p = document.createElement('p');
                    p.classList.add('text-warning');
                    p.textContent = msg;
                    encuentros16avosContainer.appendChild(p);
                });
            }

            if (misEncuentros16avos.length > 0) {
                const encuentrosRow16avos = document.createElement('div');
                encuentrosRow16avos.classList.add('row');
                misEncuentros16avos.forEach(partidoData => {
                    const colDiv = document.createElement('div');
                    colDiv.classList.add('col-12', 'col-md-6', 'col-lg-3', 'mb-4');
                    colDiv.appendChild(createMatchCard(partidoData));
                    encuentrosRow16avos.appendChild(colDiv);
                });
                encuentros16avosContainer.appendChild(encuentrosRow16avos);
            } else if (advertencias16avos.length === 0) {
                encuentros16avosContainer.textContent = "No se generaron encuentros de 16avos de Final.";
            }
        }

        // --- SIMULACIÓN DE GANADORES PARA LA SIGUIENTE RONDA ---
        const ganadores16avosSimulados = equiposDataGeneral.slice(0, 8);

        // --- GENERACIÓN Y RENDERIZADO DE CUARTOS DE FINAL ---
        const encuentrosCuartosContainer = document.getElementById('encuentrosCuartosContainer');
        if (encuentrosCuartosContainer) {
            encuentrosCuartosContainer.innerHTML = '';
            const { encuentros: misEncuentrosCuartos, mensajesAdvertencia: advertenciasCuartos } = generarEncuentrosCuartos(ganadores16avosSimulados);

            if (advertenciasCuartos.length > 0) {
                advertenciasCuartos.forEach(msg => {
                    const p = document.createElement('p');
                    p.classList.add('text-warning');
                    p.textContent = msg;
                    encuentrosCuartosContainer.appendChild(p);
                });
            }

            if (misEncuentrosCuartos.length > 0) {
                const encuentrosRowCuartos = document.createElement('div');
                encuentrosRowCuartos.classList.add('row', 'justify-content-center');
                misEncuentrosCuartos.forEach(partidoData => {
                    const colDiv = document.createElement('div');
                    colDiv.classList.add('col-12', 'col-md-6', 'col-lg-4', 'mb-4');
                    colDiv.appendChild(createMatchCard(partidoData));
                    encuentrosRowCuartos.appendChild(colDiv);
                });
                encuentrosCuartosContainer.appendChild(encuentrosRowCuartos);
            } else if (advertenciasCuartos.length === 0) {
                encuentrosCuartosContainer.textContent = "No se generaron encuentros de Cuartos de Final.";
            }
        }

        // --- SIMULACIÓN DE GANADORES PARA SEMIFINALES ---
        const ganadoresCuartosSimulados = equiposDataGeneral.slice(0, 4);

        // --- GENERACIÓN Y RENDERIZADO DE SEMIFINALES ---
        const encuentrosSemifinalesContainer = document.getElementById('encuentrosSemifinalesContainer');
        if (encuentrosSemifinalesContainer) {
            encuentrosSemifinalesContainer.innerHTML = '';
            const { encuentros: misEncuentrosSF, mensajesAdvertencia: advertenciasSF } = generarEncuentrosSemifinales(ganadoresCuartosSimulados);

            if (advertenciasSF.length > 0) {
                advertenciasSF.forEach(msg => {
                    const p = document.createElement('p');
                    p.classList.add('text-warning');
                    p.textContent = msg;
                    encuentrosSemifinalesContainer.appendChild(p);
                });
            }

            if (misEncuentrosSF.length > 0) {
                const encuentrosRowSF = document.createElement('div');
                encuentrosRowSF.classList.add('row', 'justify-content-center');
                misEncuentrosSF.forEach(partidoData => {
                    const colDiv = document.createElement('div');
                    colDiv.classList.add('col-12', 'col-md-6', 'col-lg-4', 'mb-4');
                    colDiv.appendChild(createMatchCard(partidoData));
                    encuentrosRowSF.appendChild(colDiv);
                });
                encuentrosSemifinalesContainer.appendChild(encuentrosRowSF);
            } else if (advertenciasSF.length === 0) {
                encuentrosSemifinalesContainer.textContent = "No se generaron encuentros de Semifinales.";
            }
        }

        // --- SIMULACIÓN DE GANADORES PARA LA FINAL ---
        const ganadoresSFSimulados = equiposDataGeneral.slice(0, 2);

        // --- GENERACIÓN Y RENDERIZADO DE LA GRAN FINAL ---
        const encuentroFinalContainer = document.getElementById('encuentroFinalContainer');
        if (encuentroFinalContainer) {
            encuentroFinalContainer.innerHTML = '';
            const { encuentros: misEncuentroFinal, mensajesAdvertencia: advertenciasFinal } = generarEncuentroFinal(ganadoresSFSimulados);

            if (advertenciasFinal.length > 0) {
                advertenciasFinal.forEach(msg => {
                    const p = document.createElement('p');
                    p.classList.add('text-warning');
                    p.textContent = msg;
                    encuentroFinalContainer.appendChild(p);
                });
            }

            if (misEncuentroFinal.length > 0) {
                const encuentrosRowFinal = document.createElement('div');
                encuentrosRowFinal.classList.add('row', 'justify-content-center');
                misEncuentroFinal.forEach(partidoData => {
                    const colDiv = document.createElement('div');
                    colDiv.classList.add('col-12', 'col-md-6', 'col-lg-4', 'mb-4');
                    colDiv.appendChild(createMatchCard(partidoData));
                    encuentrosRowFinal.appendChild(colDiv);
                });
                encuentroFinalContainer.appendChild(encuentrosRowFinal);
            } else if (advertenciasFinal.length === 0) {
                encuentroFinalContainer.textContent = "No se generó el encuentro de la Gran Final.";
            }
        }

    } catch (error) {
        console.error("Error general en el script ranking_general.js:", error);
        if (rankingGeneralDiv) {
            rankingGeneralDiv.innerHTML = `<p class="text-danger">Error al cargar o procesar el ranking general: ${error.message}</p>`;
        }
    }
});