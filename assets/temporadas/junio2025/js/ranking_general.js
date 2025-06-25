// ranking_general.js

document.addEventListener('DOMContentLoaded', async function () {
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
        'assets/temporadas/junio2025/tae.json',
        'assets/temporadas/junio2025/tut.json',
        'assets/temporadas/junio2025/tutw.json'
    ].filter((value, index, self) => self.indexOf(value) === index);

    const KNOCKOUT_RESULTS_FILE = 'assets/temporadas/junio2025/partidos/knockout_results.json'; // Todavía útil para resultados finales y detalles
    const KNOCKOUT_PARTICIPANTS_CONFIG_FILE = '/assets/temporadas/junio2025/partidos/knockout_participants_config.json'; // <-- NUEVA CONSTANTE

    let knockoutResults = null;
    let knockoutParticipantsConfig = null;
    let allTeamsMap = new Map();

    // Dentro de ranking_general.js, quizás al principio del script
    class KnockoutParticipant {
        constructor(type, data) {
            this.type = type; // 'team' o 'placeholder'
            this.data = data; // { team: {...}, tag: '...' } o { partidoId: 'Match X' }
        }

        getDisplayInfo() {
            if (this.type === 'team') {
                return {
                    team: this.data.team,
                    tag: this.data.tag,
                    link: this.data.link,
                    logo: `/assets/logos/${this.data.tag}.webp`
                };
            } else {
                // Placeholder for future match winner
                return {
                    team: this.data.partidoId, // e.g., "Ganador R1P1"
                    tag: 'placeholder', // Special tag for placeholder logo
                    link: '#',
                    logo: '/assets/logos/TBD.webp' // A generic "To Be Determined" logo
                };
            }
        }
    }



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
                colDiv.classList.add('col-12', 'col-md-6', 'col-lg-4', 'col-xl-4', 'mb-2');
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
                        const indigoLogo = document.createElement('img');
                        indigoLogo.src = '/assets/logos/LIGA-INDIGO.svg';
                        indigoLogo.alt = 'Escudo de seguridad';
                        indigoLogo.style.width = '20px';
                        indigoLogo.style.height = '20px';
                        indigoLogo.style.marginBottom = '3px'
                        titleH2.appendChild(document.createTextNode(' '));
                        titleH2.appendChild(indigoLogo);
                    }
                    if (currentRank <= 16) {
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



    function generarEncuentros16avos(ranking) {
        const encuentros = [];
        const mensajesAdvertencia = [];
        const ganadoresRonda = [];

        if (ranking.length < 16) {
            mensajesAdvertencia.push(`Advertencia: Se necesitan al menos 16 equipos para generar los 16avos de final. Se encontraron ${ranking.length}.`);
        }

        const datosPartidosSimulados16avos = [
            { resultado: 'ROUND 1', stream: true, fecha: '2-0', hora: 'FINALIZADO' },
            { resultado: 'ROUND 2', stream: true, fecha: '0-2', hora: 'FINALIZADO' },
            { resultado: 'ROUND 3', stream: true, fecha: '2-0', hora: 'FINALIZADO' },
            { resultado: 'ROUND 4', stream: true, fecha: '1-2', hora: 'FINALIZADO' },
            { resultado: 'ROUND 5', stream: true, fecha: '2-0', hora: 'FINALIZADO' },
            { resultado: 'ROUND 6', stream: true, fecha: '2-0', hora: 'FINALIZADO' },
            { resultado: 'ROUND 7', stream: true, fecha: '0-2', hora: 'FINALIZADO' },
            { resultado: 'ROUND 8', stream: true, fecha: '2-0', hora: 'FINALIZADO' }
        ];

        for (let i = 0; i < 8; i++) {
            const equipo1 = ranking[i];
            const equipo2 = ranking[15 - i];

            if (equipo1 && equipo2) {
                const partidoInfo = datosPartidosSimulados16avos[i];
                const partidoId = `ROUND ${i + 1}`;

              
                const participant1 = new KnockoutParticipant('team', equipo1);
                const participant2 = new KnockoutParticipant('team', equipo2);

                encuentros.push({
                    equipo1: participant1.getDisplayInfo(), // Obtiene la info formateada
                    equipo2: participant2.getDisplayInfo(), // Obtiene la info formateada
                    tipo: `16avos - ${i + 1}`,
                    partidoInfo: partidoInfo
                });

              
                ganadoresRonda.push(new KnockoutParticipant('placeholder', { partidoId: partidoId }));

            } else {
                mensajesAdvertencia.push(`Advertencia: No hay suficientes equipos para el cruce ${i + 1} de 16avos.`);
                ganadoresRonda.push(new KnockoutParticipant('placeholder', { partidoId: `Ganador R1P${i + 1} (Faltante)` }));
            }
        }
        return { encuentros, mensajesAdvertencia, ganadoresRonda };
    }


    function obtenerParticipantesRonda(rondaKey, participantesAnteriores, allTeamsMap, knockoutParticipantsConfig) {
        if (knockoutParticipantsConfig && knockoutParticipantsConfig[rondaKey] && knockoutParticipantsConfig[rondaKey].length > 0) {
            console.log(`Usando participantes configurados para ${rondaKey}.`);
            return knockoutParticipantsConfig[rondaKey].map(tag => {
                const team = allTeamsMap.get(tag);
                return team ? new KnockoutParticipant('team', team) : new KnockoutParticipant('placeholder', { partidoId: `${tag}` }); // Equipos 8vos
            });
        } else {
            console.log(`No hay participantes configurados para ${rondaKey}, usando los ganadores simulados de la ronda anterior.`);
            return participantesAnteriores; 
        }
    }


    function generarEncuentrosCuartos(participantes16avosSimulados, knockoutResults, allTeamsMap, knockoutParticipantsConfig) { // Añadidos parámetros
        const encuentros = [];
        const mensajesAdvertencia = [];
        const ganadoresRonda = []; 

        // Determina los participantes reales para Cuartos de Final
        // Si hay una configuración para cuartosDeFinal, la usa. De lo contrario, usa los ganadores simulados de 16avos.
        const participantesCuartosReales = obtenerParticipantesRonda('cuartosDeFinal', participantes16avosSimulados, allTeamsMap, knockoutParticipantsConfig);

        if (participantesCuartosReales.length < 8) {
            mensajesAdvertencia.push(`Advertencia: Se necesitan 8 participantes para cuartos de final. Se encontraron ${participantesCuartosReales.length}.`);
        }

        const datosPartidosSimuladosCuartos = [
            { resultado: 'QF 1', stream: true, fecha: '2-0', hora: 'FINALIZADO' },
            { resultado: 'QF 2', stream: true, fecha: 'MIÉ 25 JUN', hora: '21:00' },
            { resultado: 'QF 3', stream: true, fecha: 'MIÉ 25 JUN', hora: '21:50' },
            { resultado: 'QF 4', stream: true, fecha: 'MIÉ 25 JUN', hora: '22:30' }
        ];

        // Los índices de cruce SIEMPRE son los mismos, lo que cambia es quiénes son los participantes en esas posiciones
        const crucesCuartosIndices = [
            [0, 7], // Participante 1 vs Participante 8
            [1, 6], // Participante 2 vs Participante 7
            [2, 5], // Participante 3 vs Participante 6
            [3, 4]   // Participante 4 vs Participante 5
        ];

        let partidoIndex = 0;
        crucesCuartosIndices.forEach(cruceIndices => {
            const equipo1 = participantesCuartosReales[cruceIndices[0]]; 
            const equipo2 = participantesCuartosReales[cruceIndices[1]];
            const partidoId = `QF ${partidoIndex + 1}`; // ID único para cada partido de Cuartos

            if (equipo1 && equipo2) {
                encuentros.push({
                    equipo1: equipo1.getDisplayInfo(),
                    equipo2: equipo2.getDisplayInfo(),
                    tipo: `Cuartos - ${partidoIndex + 1}`,
                    partidoInfo: datosPartidosSimuladosCuartos[partidoIndex]
                });

                // Ganadores para la siguiente ronda (Semifinales)
                // Aquí, podemos optar por:
                // 1. Usar el knockout_results.json si ya se jugó el partido de Cuartos
                // 2. Si no se ha jugado, es un placeholder.
                let winnerForNextRound = null;
                if (knockoutResults && knockoutResults.rondas && knockoutResults.rondas['cuartos']) {
                    const matchResult = knockoutResults.rondas['cuartos'].find(r => r.partidoId === partidoId);
                    if (matchResult && matchResult.ganadorTag) {
                        const winningTeamData = allTeamsMap.get(matchResult.ganadorTag);
                        if (winningTeamData) {
                            winnerForNextRound = new KnockoutParticipant('team', winningTeamData);
                        }
                    }
                }

                if (winnerForNextRound) {
                    ganadoresRonda.push(winnerForNextRound);
                } else {
                    ganadoresRonda.push(new KnockoutParticipant('placeholder', { partidoId: `${partidoId}` }));
                }
            } else {
                mensajesAdvertencia.push(`Advertencia: No hay suficientes participantes para el cruce de Cuartos ${partidoIndex + 1}.`);
                ganadoresRonda.push(new KnockoutParticipant('placeholder', { partidoId: `${partidoId} (Faltante)` }));
            }
            partidoIndex++;
        });

        return { encuentros, mensajesAdvertencia, ganadoresRonda };
    }

    function generarEncuentrosSemifinales(participantesCuartosSimulados, knockoutResults, allTeamsMap, knockoutParticipantsConfig) { // Añadidos parámetros
        const encuentros = [];
        const mensajesAdvertencia = [];
        const ganadoresRonda = [];

        // Determina los participantes reales para Semifinales
        const participantesSFSReales = obtenerParticipantesRonda('semifinales', participantesCuartosSimulados, allTeamsMap, knockoutParticipantsConfig);


        if (participantesSFSReales.length < 4) {
            mensajesAdvertencia.push(`Advertencia: Se necesitan 4 participantes de Cuartos de Final para generar las semifinales. Se encontraron ${participantesSFSReales.length}.`);
        }

        const datosPartidosSimuladosSF = [
            { resultado: 'SEMIFINAL 1', stream: true, fecha: 'JUE 26 JUN', hora: '21:00' },
            { resultado: 'SEMIFINAL 2', stream: true, fecha: 'JUE 26 JUN', hora: '21:50' }
        ];

        const crucesSFIndices = [
            [0, 3], // Ganador QFP1 vs Ganador QFP4
            [1, 2]  // Ganador QFP2 vs Ganador QFP3
        ];

        let partidoIndex = 0;
        crucesSFIndices.forEach(cruceIndices => {
            const equipo1 = participantesSFSReales[cruceIndices[0]];
            const equipo2 = participantesSFSReales[cruceIndices[1]];
            const partidoId = `SEMIFINAL ${partidoIndex + 1}`;

            if (equipo1 && equipo2) {
                encuentros.push({
                    equipo1: equipo1.getDisplayInfo(),
                    equipo2: equipo2.getDisplayInfo(),
                    tipo: `Semifinal - ${partidoIndex + 1}`,
                    partidoInfo: datosPartidosSimuladosSF[partidoIndex]
                });

                // Ganadores para la final
                let winnerForNextRound = null;
                if (knockoutResults && knockoutResults.rondas && knockoutResults.rondas['semifinales']) {
                    const matchResult = knockoutResults.rondas['semifinales'].find(r => r.partidoId === partidoId);
                    if (matchResult && matchResult.ganadorTag) {
                        const winningTeamData = allTeamsMap.get(matchResult.ganadorTag);
                        if (winningTeamData) {
                            winnerForNextRound = new KnockoutParticipant('team', winningTeamData);
                        }
                    }
                }

                if (winnerForNextRound) {
                    ganadoresRonda.push(winnerForNextRound);
                } else {
                    ganadoresRonda.push(new KnockoutParticipant('placeholder', { partidoId: `${partidoId}` }));
                }
            } else {
                mensajesAdvertencia.push(`Advertencia: No hay suficientes participantes para el cruce de Semifinal ${partidoIndex + 1}.`);
                ganadoresRonda.push(new KnockoutParticipant('placeholder', { partidoId: `LLAVE ${partidoId} (Faltante)` }));
            }
            partidoIndex++;
        });

        return { encuentros, mensajesAdvertencia, ganadoresRonda };
    }


    function generarEncuentroFinal(participantesSFSimulados, knockoutResults, allTeamsMap, knockoutParticipantsConfig) { // Añadidos parámetros
        const encuentros = [];
        const mensajesAdvertencia = [];

        // Determina los participantes reales para la Final
        const participantesFinalReales = obtenerParticipantesRonda('final', participantesSFSimulados, allTeamsMap, knockoutParticipantsConfig);


        if (participantesFinalReales.length < 2) {
            mensajesAdvertencia.push(`Advertencia: Se necesitan 2 participantes de Semifinales para generar la final. Se encontraron ${participantesFinalReales.length}.`);
        }

        const datosPartidoSimuladoFinal = { resultado: 'LLAVE 15', stream: true, fecha: 'JUE 26 JUN', hora: '22:30' };

        const equipo1 = participantesFinalReales[0];
        const equipo2 = participantesFinalReales[1];
        const partidoId = `FINAL`;

        if (equipo1 && equipo2) {
            let finalPartidoInfo = { ...datosPartidoSimuladoFinal };
            // Si la final ya tiene un resultado en knockout_results.json, actualiza el estado
            if (knockoutResults && knockoutResults.rondas && knockoutResults.rondas['final'] && knockoutResults.rondas['final'].partidoId === partidoId) {
                const finalResult = knockoutResults.rondas['final'];
                if (finalResult.ganadorTag) {
                    const winningTeamData = allTeamsMap.get(finalResult.ganadorTag);
                    if (winningTeamData) {
                        finalPartidoInfo.resultado = `${winningTeamData.team} ¡CAMPEÓN!`;
                    }
                }
            }

            encuentros.push({
                equipo1: equipo1.getDisplayInfo(),
                equipo2: equipo2.getDisplayInfo(),
                tipo: 'Gran Final',
                partidoInfo: finalPartidoInfo
            });
        } else {
            mensajesAdvertencia.push("Advertencia: No hay suficientes participantes para la Gran Final.");
        }
        return { encuentros, mensajesAdvertencia };
    }


    function createMatchCard(partidoData) {
        // Asegúrate de que equipo1 y equipo2 tienen la estructura esperada de getDisplayInfo()
        const equipo1Display = partidoData.equipo1; // Ya viene de getDisplayInfo()
        const equipo2Display = partidoData.equipo2; // Ya viene de getDisplayInfo()

        const bracketRoundListDiv = document.createElement('div');
        bracketRoundListDiv.classList.add('bracket-round-copa');

        // Equipo 1
        const bracketRoundTeam1Div = document.createElement('div');
        bracketRoundTeam1Div.classList.add('bracket-round-team');
        const link1 = document.createElement('a');
        link1.href = equipo1Display.link || '#';
        const img1 = document.createElement('img');
        img1.src = equipo1Display.logo; // Usa el logo de display info (TBD.webp si es placeholder)
        img1.alt = equipo1Display.team;
        img1.classList.add('img-fluid');
        link1.appendChild(img1);
        bracketRoundTeam1Div.appendChild(link1);
        bracketRoundListDiv.appendChild(bracketRoundTeam1Div);

        const roundTitlesDiv = document.createElement('div');
        roundTitlesDiv.classList.add('round-titles');

        const cardRoundPromoLeftDiv = document.createElement('div');
        cardRoundPromoLeftDiv.classList.add('card-round-promo', 'left');
        const h6_1 = document.createElement('h6');
        h6_1.textContent = equipo1Display.team.substring(0, 12); // Nombre de equipo o "Ganador R1P1"
        cardRoundPromoLeftDiv.appendChild(h6_1);
        roundTitlesDiv.appendChild(cardRoundPromoLeftDiv);

        const cardRoundPromoMxDiv = document.createElement('div');
        cardRoundPromoMxDiv.classList.add('card-round-promo');

        const currentPartidoInfo = partidoData.partidoInfo;

        let promoContent = '';
        if (currentPartidoInfo.stream) {
            promoContent = `

                <h6>${currentPartidoInfo.resultado}</h6>
                <span>${currentPartidoInfo.fecha}</span>
                <span>${currentPartidoInfo.hora}</span>
            `;
        } else if (currentPartidoInfo.special) {
            promoContent = `
           
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
        h6_2.textContent = equipo2Display.team.substring(0, 12);
        cardRoundPromoRightDiv.appendChild(h6_2);
        roundTitlesDiv.appendChild(cardRoundPromoRightDiv);

        bracketRoundListDiv.appendChild(roundTitlesDiv);

        // Equipo 2
        const bracketRoundTeam2Div = document.createElement('div');
        bracketRoundTeam2Div.classList.add('bracket-round-team-right');
        const link2 = document.createElement('a');
        link2.href = equipo2Display.link || '#';
        const img2 = document.createElement('img');
        img2.src = equipo2Display.logo;
        img2.alt = equipo2Display.team;
        img2.classList.add('img-fluid');
        link2.appendChild(img2);
        bracketRoundTeam2Div.appendChild(link2);
        bracketRoundListDiv.appendChild(bracketRoundTeam2Div);

        const cardBackDiv = document.createElement('div');
        cardBackDiv.classList.add('card-back');
        const cardColorLeftDiv = document.createElement('div');
        // Usamos el tag real del equipo o 'placeholder' para la clase
        cardColorLeftDiv.classList.add('card-color-left', equipo1Display.tag === '7Z' ? 'S7Z' : equipo1Display.tag);
        const cardColorRightDiv = document.createElement('div');
        cardColorRightDiv.classList.add('card-color-right', equipo2Display.tag === '7Z' ? 'S7Z' : equipo2Display.tag);
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

        equiposDataGeneral.sort((a, b) => {
            if (b.suma !== a.suma) {
                return b.suma - a.suma;
            }

            if (a.posicionDesempate && !b.posicionDesempate) {
                return -1;
            }
            if (!a.posicionDesempate && b.posicionDesempate) {
                return 1;
            }

            return a.team.localeCompare(b.team);
        });

        // Crear el mapa de equipos después de cargar y ordenar equiposDataGeneral
        allTeamsMap = new Map(equiposDataGeneral.map(team => [team.tag, team]));

        // --- Cargar los resultados de las eliminatorias (para ganadores de partidos) ---
        try {
            const responseKnockout = await fetch(KNOCKOUT_RESULTS_FILE);
            if (responseKnockout.ok) {
                knockoutResults = await responseKnockout.json();
                console.log("Resultados de eliminatorias (ganadores de partidos) cargados:", knockoutResults);
            } else {
                console.warn("No se pudieron cargar los resultados de eliminatorias. Usando placeholders por defecto.", responseKnockout.status);
            }
        } catch (error) {
            console.error("Error al cargar knockout_results.json:", error);
        }

        // --- Cargar la configuración de participantes por ronda (para activar las rondas) ---
        try {
            const responseKnockoutConfig = await fetch(KNOCKOUT_PARTICIPANTS_CONFIG_FILE);
            if (responseKnockoutConfig.ok) {
                knockoutParticipantsConfig = await responseKnockoutConfig.json();
                console.log("Configuración de participantes de eliminatorias cargada:", knockoutParticipantsConfig);
            } else {
                console.warn("No se pudo cargar la configuración de participantes de eliminatorias. Las rondas avanzarán solo con resultados de partidos o con el ranking inicial.", responseKnockoutConfig.status);
            }
        } catch (error) {
            console.error("Error al cargar knockout_participants_config.json:", error);
        }


        console.log("Equipos cargados para ranking general (finalmente ordenados para brackets):", equiposDataGeneral);

        if (rankingGeneralDiv) {
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
        let participantesParaCuartosSimulados = []; // Estos son los "ganadores" basados puramente en el seeding de 16avos
        if (encuentros16avosContainer) {
            encuentros16avosContainer.innerHTML = '';
            // generarEncuentros16avos ya no necesita knockoutResults ni allTeamsMap para sus propios ganadoresRonda
            // ya que estos son placeholders basados en el seeding inicial.
            const { encuentros: misEncuentros16avos, mensajesAdvertencia: advertencias16avos, ganadoresRonda: g16avos } = generarEncuentros16avos(equiposDataGeneral);
            participantesParaCuartosSimulados = g16avos; // Almacenamos los participantes generados

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
                    colDiv.classList.add('col-12', 'col-md-6', 'col-lg-3', 'mb-1');
                    colDiv.appendChild(createMatchCard(partidoData));
                    encuentrosRow16avos.appendChild(colDiv);
                });
                encuentros16avosContainer.appendChild(encuentrosRow16avos);
            } else if (advertencias16avos.length === 0) {
                encuentros16avosContainer.textContent = "No se generaron encuentros de 16avos de Final.";
            }
        }

        // --- GENERACIÓN Y RENDERIZADO DE CUARTOS DE FINAL ---
        const encuentrosCuartosContainer = document.getElementById('encuentrosCuartosContainer');
        let participantesParaSFSimulados = [];
        if (encuentrosCuartosContainer) {
            encuentrosCuartosContainer.innerHTML = '';
           
            const { encuentros: misEncuentrosCuartos, mensajesAdvertencia: advertenciasCuartos, ganadoresRonda: gCuartos } = generarEncuentrosCuartos(
                participantesParaCuartosSimulados, knockoutResults, allTeamsMap, knockoutParticipantsConfig // Pasamos la nueva config
            );
            participantesParaSFSimulados = gCuartos;

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
                    colDiv.classList.add('col-12', 'col-md-6', 'col-lg-12', 'mb-1');
                    colDiv.appendChild(createMatchCard(partidoData));
                    encuentrosRowCuartos.appendChild(colDiv);
                });
                encuentrosCuartosContainer.appendChild(encuentrosRowCuartos);
            } else if (advertenciasCuartos.length === 0) {
                encuentrosCuartosContainer.textContent = "No se generaron encuentros de Cuartos de Final.";
            }
        }

        // --- GENERACIÓN Y RENDERIZADO DE SEMIFINALES ---
        const encuentrosSemifinalesContainer = document.getElementById('encuentrosSemifinalesContainer');
        let participantesParaFinalSimulados = [];
        if (encuentrosSemifinalesContainer) {
            encuentrosSemifinalesContainer.innerHTML = '';
            const { encuentros: misEncuentrosSF, mensajesAdvertencia: advertenciasSF, ganadoresRonda: gSF } = generarEncuentrosSemifinales(
                participantesParaSFSimulados, knockoutResults, allTeamsMap, knockoutParticipantsConfig // Pasamos la nueva config
            );
            participantesParaFinalSimulados = gSF;

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
                    colDiv.classList.add('col-12', 'col-md-6', 'col-lg-12', 'mb-1');
                    colDiv.appendChild(createMatchCard(partidoData));
                    encuentrosRowSF.appendChild(colDiv);
                });
                encuentrosSemifinalesContainer.appendChild(encuentrosRowSF);
            } else if (advertenciasSF.length === 0) {
                encuentrosSemifinalesContainer.textContent = "No se generaron encuentros de Semifinales.";
            }
        }

        // --- GENERACIÓN Y RENDERIZADO DE LA GRAN FINAL ---
        const encuentroFinalContainer = document.getElementById('encuentroFinalContainer');
        if (encuentroFinalContainer) {
            encuentroFinalContainer.innerHTML = '';
            const { encuentros: misEncuentroFinal, mensajesAdvertencia: advertenciasFinal } = generarEncuentroFinal(
                participantesParaFinalSimulados, knockoutResults, allTeamsMap, knockoutParticipantsConfig // Pasamos la nueva config
            );

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
                    colDiv.classList.add('col-12', 'col-md-6', 'col-lg-12', 'mb-1');
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