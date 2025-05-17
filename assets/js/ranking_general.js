// ranking_general.js

document.addEventListener('DOMContentLoaded', function() {
    const rankingGeneralDiv = document.getElementById('rankingGeneral');
    const equiposDataGeneral = [];

    const teamFilesGeneral = [
        'assets/equipos/ad.json', 'assets/equipos/dbo.json', 'assets/equipos/dty.json', 'assets/equipos/neo.json',
        'assets/equipos/ovg.json', 'assets/equipos/pe.json', 'assets/equipos/plaga.json', 'assets/equipos/rk.json',
        'assets/equipos/sm.json', 'assets/equipos/stmn.json', 'assets/equipos/tm.json', 'assets/equipos/zafiro.json',
        'assets/equipos/amt.json', 'assets/equipos/aogiri.json', 'assets/equipos/cl.json', 'assets/equipos/enigma.json',
        'assets/equipos/gx.json', 'assets/equipos/ns.json', 'assets/equipos/obs.json', 'assets/equipos/space.json',
        'assets/equipos/tad.json', 'assets/equipos/rntx.json', 'assets/equipos/tut.json', 'assets/equipos/tutw.json'
    ].filter((value, index, self) => self.indexOf(value) === index);

    async function obtenerDatosEquipos(file) {
        try {
            const response = await fetch('/' + file);
            if (!response.ok) {
                console.warn(`No se pudo cargar el archivo de equipo: ${file} (status: ${response.status})`);
                return null;
            }
            const data = await response.json();
            if (data && data.length > 0) {
                const equipo = data[0];
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

    const ARCHIVOS_DE_PARTIDOS_GENERALES = []; // Debes llenar esto con tus archivos de partidos

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
                    if (data.partidos) rondas = [{ partidos: data.partidos }]; else continue;
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

            if (grupoDeEquiposConMismosPuntos.length > 1) {
                grupoDeEquiposConMismosPuntos.sort((equipoA, equipoB) => {
                    const desempateA = equipoA.posicionDesempate;
                    const desempateB = equipoB.posicionDesempate;
                    if (typeof desempateA === 'boolean' && typeof desempateB === 'boolean') {
                        if (desempateA === true && desempateB === false) return -1;
                        if (desempateA === false && desempateB === true) return 1;
                    } else if (typeof desempateA === 'boolean' && desempateA === true) return -1;
                    else if (typeof desempateB === 'boolean' && desempateB === true) return 1;

                    if (equipoA.diferenciaGolesTotal !== undefined && equipoB.diferenciaGolesTotal !== undefined) {
                        if (equipoA.diferenciaGolesTotal !== equipoB.diferenciaGolesTotal) {
                            return equipoB.diferenciaGolesTotal - equipoA.diferenciaGolesTotal;
                        }
                    }

                    if (equipoA.golesAFavorTotal !== undefined && equipoB.golesAFavorTotal !== undefined) {
                        if (equipoA.golesAFavorTotal !== equipoB.golesAFavorTotal) {
                            return equipoB.golesAFavorTotal - equipoA.golesAFavorTotal;
                        }
                    }

                    return equipoA.team.localeCompare(equipoB.team);
                });
            }

            rankDisplay++;

            for (const equipo of grupoDeEquiposConMismosPuntos) {
                if (tipoRanking === 'GENERAL' && overallIndex >= 8) {
                    // Si quieres limitar a los 8 primeros, puedes poner un 'break;' aquí
                }

                const colDiv = document.createElement('div');
                colDiv.classList.add('col-12', 'col-md-6', 'col-lg-6', 'col-xl-4');
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
                    if (overallIndex < 8) {
                        const vipLogo = document.createElement('i');
                        vipLogo.classList.add('ti', 'ti-vip');
                        vipLogo.style.color = 'blue';
                        titleH2.appendChild(document.createTextNode(' '));
                        titleH2.appendChild(vipLogo);
                    }
                    if (overallIndex < 16) {
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
                placeSpan.textContent = rankDisplay < 10 ? `0${rankDisplay}` : rankDisplay;
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

    Promise.all(teamFilesGeneral.map(obtenerDatosEquipos))
        .then(resultados => {
            const equiposFiltrados = resultados.filter(equipo => equipo !== null);
            equiposDataGeneral.push(...equiposFiltrados);

            equiposDataGeneral.sort((a, b) => b.suma - a.suma);
            console.log("Equipos cargados para ranking general:", equiposDataGeneral);

            if (rankingGeneralDiv) {
                mostrarEquipos(equiposDataGeneral, rankingGeneralDiv, 'GENERAL', true);
            }

            const descargarRankingBtn = document.getElementById('descargarRankingGeneral');
            if (descargarRankingBtn) {
                descargarRankingBtn.addEventListener('click', () => {
                    const rankingParaDescargar = equiposDataGeneral.map((equipo, index) => ({
                        tag: equipo.tag,
                        team: equipo.team,
                        posicionCalculada: index + 1,
                        suma: equipo.suma,
                        // Incluye otras propiedades que quieras en el JSON descargado
                    }));
                    descargarJSON(rankingParaDescargar, 'ranking_general.json');
                });
            }
        })
        .catch(error => console.error("Error al obtener los datos de los equipos para el ranking general:", error));
});