// encuentros_cruzados.js

document.addEventListener('DOMContentLoaded', async function() {
    
   // --- 1. Cargar el índice de equipos ---
    let listaEquipos;
    try {
        const indexResponse = await fetch('/assets/temporadas/actual/equipos-index.json');
        if (!indexResponse.ok) throw new Error(`Error al cargar equipos-index.json: ${indexResponse.status}`);
        listaEquipos = await indexResponse.json(); // array de nombres de archivos
    } catch (error) {
        console.error("Error al cargar el índice de equipos:", error);
        return; // o manejar error como prefieras
    }

    // --- 2. Leer cada archivo y clasificar por grupo ---
    const teamFilesNorte = [];
    const teamFilesSur = [];

    for (const archivo of listaEquipos) {
        try {
            const ruta = `/assets/temporadas/actual/${archivo}`;
            const res = await fetch(ruta);
            if (!res.ok) {
                console.warn(`Archivo no encontrado o inválido: ${ruta}`);
                continue;
            }
            const data = await res.json();
            if (data.grupo === 'NORTH') {
                teamFilesNorte.push(ruta);
            } else if (data.grupo === 'SOUTH') {
                teamFilesSur.push(ruta);
            } else {
                console.warn(`Equipo sin grupo válido en: ${archivo}`, data.grupo);
            }
        } catch (err) {
            console.error(`Error al procesar ${archivo}:`, err);
        }
    }

    // --- 3. Cargar Rankings ---
    const rankingNorte = await loadAndDisplayRanking('grupoNorte', teamFilesNorte, 'NORTH');
    const rankingSur = await loadAndDisplayRanking('grupoSur', teamFilesSur, 'SOUTH');

     // --- NUEVO: Cargar el JSON de ganadores simulados ---
    let ganadoresSimulados = {};
    try {
        const response = await fetch('/assets/temporadas/actual/ganadoresIndigo.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        ganadoresSimulados = await response.json();
    } catch (error) {
        console.error("Error al cargar ganadores_simulados.json:", error);
        // Establecer valores por defecto si el archivo no se carga
        ganadoresSimulados = {
            cuartos_final: {
                QF1: { nombre: "Ganador QF1", tag: "TBD" },
                QF2: { nombre: "Ganador QF2", tag: "TBD" },
                QF3: { nombre: "Ganador QF3", tag: "TBD" },
                QF4: { nombre: "Ganador QF4", tag: "TBD" }
            },
            semifinales: {
                SF1: { nombre: "Ganador SF1", tag: "TBD" },
                SF2: { nombre: "Ganador SF2", tag: "TBD" }
            },
            final: {
                F1: { nombre: "Ganador F1", tag: "TBD" }
            }
        };
    }

    function generarEncuentrosCruzados(norte, sur) {
        const encuentros = [];
        const mensajesAdvertencia = [];

        if (norte.length < 4 || sur.length < 4) {
            mensajesAdvertencia.push("Advertencia: No hay suficientes equipos en ambos grupos para generar los 4tos de final completos.");
            if (norte.length < 4) {
                mensajesAdvertencia.push(`Grupo Norte tiene solo ${norte.length} equipos.`);
            }
            if (sur.length < 4) {
                mensajesAdvertencia.push(`Grupo Sur tiene solo ${sur.length} equipos.`);
            }
        }

        // Importante: Definimos los datos de los partidos simulados aquí.
        // El orden de estos objetos debe corresponder al orden en que se generan los cruces.
        // Si no se genera un cruce (ej. no hay 4to Sur), su objeto partidoSimulado asociado no se usará.
        const datosPartidosSimulados = [
            // Datos para el cruce "1 Norte vs 4 Sur"
            { resultado: 'QF1', stream: true, fecha: '20-OCT', hora: '21:30' },
            // Datos para el cruce "2 Norte vs 3 Sur"
            { resultado: 'QF2', stream: true, fecha: '20-OCT', hora: '22:30' },
            // Datos para el cruce "1 Sur vs 4 Norte"
            { resultado: 'QF3', stream: true, fecha: '21-OCT', hora: '21:30' }, 
            // Datos para el cruce "2 Sur vs 3 Norte"
            { resultado: 'QF4', stream: true, fecha: '21-OCT', hora: '22:30' }
        ];

        let partidoIndex = 0; // Para asignar el dato de partido correcto a cada cruce

        // 1 Norte vs 4 Sur
        if (norte[0] && sur[3]) {
            encuentros.push({ equipo1: norte[0], equipo2: sur[3], tipo: '1N-4S', partidoInfo: datosPartidosSimulados[partidoIndex++] });
        }

        // 2 Norte vs 3 Sur
        if (norte[1] && sur[2]) {
            encuentros.push({ equipo1: norte[1], equipo2: sur[2], tipo: '2N-3S', partidoInfo: datosPartidosSimulados[partidoIndex++] });
        }

        // 1 Sur vs 4 Norte
        if (sur[0] && norte[3]) {
            encuentros.push({ equipo1: sur[0], equipo2: norte[3], tipo: '1S-4N', partidoInfo: datosPartidosSimulados[partidoIndex++] });
        }

        // 2 Sur vs 3 Norte
        if (sur[1] && norte[2]) {
            encuentros.push({ equipo1: sur[1], equipo2: norte[2], tipo: '2S-3N', partidoInfo: datosPartidosSimulados[partidoIndex++] });
        }

        return { encuentros: encuentros, mensajesAdvertencia: mensajesAdvertencia };
    }

    const { encuentros: misEncuentros4tos, mensajesAdvertencia } = generarEncuentrosCruzados(rankingNorte, rankingSur);



    const datosPartidosSimuladosSF = [
        // Semifinal 1 (Ganador QF1 vs Ganador QF4)
        {
            equipo1: { team: ganadoresSimulados.cuartos_final.QF1.nombre, tag: ganadoresSimulados.cuartos_final.QF1.tag, link: '#' },
            equipo2: { team: ganadoresSimulados.cuartos_final.QF4.nombre, tag: ganadoresSimulados.cuartos_final.QF4.tag, link: '#' },
            partidoInfo: { resultado: 'SF1', stream: true, fecha: '24 NOV', hora: '21:00' },
            tipo: 'Semifinal 1'
        },
        // Semifinal 2 (Ganador QF2 vs Ganador QF3)
        {
            equipo1: { team: ganadoresSimulados.cuartos_final.QF2.nombre, tag: ganadoresSimulados.cuartos_final.QF2.tag, link: '#' },
            equipo2: { team: ganadoresSimulados.cuartos_final.QF3.nombre, tag: ganadoresSimulados.cuartos_final.QF3.tag, link: '#' },
            partidoInfo: { resultado: 'SF2', stream: true, fecha: '24 NOV', hora: '21:50' },
            tipo: 'Semifinal 2'
        }
    ];

    const datosPartidosSimuladosFinal = [
        // Gran Final (Ganador SF1 vs Ganador SF2)
        {
            equipo1: { team: ganadoresSimulados.semifinales.SF1.nombre, tag: ganadoresSimulados.semifinales.SF1.tag, link: '#' },
            equipo2: { team: ganadoresSimulados.semifinales.SF2.nombre, tag: ganadoresSimulados.semifinales.SF2.tag, link: '#' },
            partidoInfo: { resultado: 'LAST DANCE', stream: true, fecha: '24 NOV', hora: '22:30' },
            tipo: 'Gran Final'
        }
    ];
    


    const encuentrosContainer4tos = document.getElementById('encuentrosCruzadosContainer');
    const encuentrosContainerSF = document.getElementById('semifinalesContainer'); // Nuevo contenedor para SF
    const encuentrosContainerFinal = document.getElementById('finalContainer');
    
      // --- RENDERIZADO DE CUARTOS DE FINAL (código existente) ---
    if (encuentrosContainer4tos) {
        encuentrosContainer4tos.innerHTML = ''; // Limpiar contenido previo

         // Usa 'mensajesAdvertencia' aquí
        if (mensajesAdvertencia.length > 0) {  
            mensajesAdvertencia.forEach(msg => {
                const p = document.createElement('p');
                p.classList.add('text-warning');
                p.textContent = msg;
                encuentrosContainer4tos.appendChild(p);
            });
        }

        if (misEncuentros4tos.length > 0) {
            const encuentrosRow4tos = document.createElement('div');
            encuentrosRow4tos.classList.add('row');
            misEncuentros4tos.forEach(partidoData => {
                const colDiv = document.createElement('div');
                colDiv.classList.add('col-12', 'col-md-6', 'col-lg-12', 'mb-1');
                // Llama a una nueva función para crear la card, para evitar duplicación de código
                colDiv.appendChild(createMatchCard(partidoData));
                encuentrosRow4tos.appendChild(colDiv);
            });
            encuentrosContainer4tos.appendChild(encuentrosRow4tos);
        } else if (mensajesAdvertencia4tos.length === 0) {
            encuentrosContainer4tos.textContent = "No se generaron encuentros de Cuartos de Final.";
        }
    }

    // --- RENDERIZADO DE SEMIFINALES ---
    if (encuentrosContainerSF) {
        encuentrosContainerSF.innerHTML = ''; // Limpiar contenido previo
        const encuentrosRowSF = document.createElement('div');
        encuentrosRowSF.classList.add('row', 'justify-content-center'); // Centrar las cards si son pocas

        if (datosPartidosSimuladosSF.length > 0) {
             datosPartidosSimuladosSF.forEach(partidoData => {
                const colDiv = document.createElement('div');
                // Semifinales son 2 partidos, col-6 para cada uno en pantallas medianas y grandes
                colDiv.classList.add('col-12', 'col-md-12', 'mb-1');
                colDiv.appendChild(createMatchCard(partidoData));
                encuentrosRowSF.appendChild(colDiv);
            });
            encuentrosContainerSF.appendChild(encuentrosRowSF);
        } else {
            encuentrosContainerSF.textContent = "No se generaron encuentros de Semifinales.";
        }
    }

    // --- RENDERIZADO DE LA GRAN FINAL ---
    if (encuentrosContainerFinal) {
        encuentrosContainerFinal.innerHTML = ''; // Limpiar contenido previo
        const encuentrosRowFinal = document.createElement('div');
        encuentrosRowFinal.classList.add('row', 'justify-content-center'); // Centrar la card de la final

        if (datosPartidosSimuladosFinal.length > 0) {
            datosPartidosSimuladosFinal.forEach(partidoData => {
                const colDiv = document.createElement('div');
                // La final es 1 partido, col-6 o col-4 para que no sea demasiado ancha
                colDiv.classList.add('col-12', 'col-md-6', 'col-lg-12', 'mb-1');
                colDiv.appendChild(createMatchCard(partidoData));
                encuentrosRowFinal.appendChild(colDiv);
            });
            encuentrosContainerFinal.appendChild(encuentrosRowFinal);
        } else {
            encuentrosContainerFinal.textContent = "No se generó el encuentro de la Gran Final.";
        }
    }
});

function createMatchCard(partidoData) {
    const bracketRoundListDiv = document.createElement('div');
    bracketRoundListDiv.classList.add('bracket-round-copa');

    // Determinar la imagen y el enlace del equipo, con manejo de "TBD"
    const getTeamImageAndLink = (teamInfo) => {
        let imgSrc = `/assets/logos/${teamInfo.tag}.webp`;
        let teamLink = teamInfo.link || '#'; // Enlace por defecto

        // Si el tag es 'TBD', usar la imagen de LIGA-INDIGO y no poner enlace de equipo
        if (teamInfo.tag === 'TBD') {
            imgSrc = '/assets/logos/LIGA-INDIGO.webp';
            teamLink = '#'; // No hay enlace a equipo específico para TBD
        } else if (!teamInfo.link) {
            teamLink = `/teams/${teamInfo.tag}`; // Enlace por defecto si no viene en data
        }
        return { imgSrc, teamLink };
    };

    // Equipo 1 (Izquierda)
    const bracketRoundTeam1Div = document.createElement('div');
    bracketRoundTeam1Div.classList.add('bracket-round-team');
    const link1 = document.createElement('a');
    const { imgSrc: imgSrc1, teamLink: teamLink1 } = getTeamImageAndLink(partidoData.equipo1);
    link1.href = teamLink1;
    const img1 = document.createElement('img');
    img1.src = imgSrc1;
    img1.alt = `Logo de ${partidoData.equipo1.team}`;
    img1.classList.add('img-fluid');
    link1.appendChild(img1);
    bracketRoundTeam1Div.appendChild(link1);
    bracketRoundListDiv.appendChild(bracketRoundTeam1Div);

    // Centro del partido (Nombres, resultado, stream/fecha/hora)
    const roundTitlesDiv = document.createElement('div');
    roundTitlesDiv.classList.add('round-titles');

    const cardRoundPromoLeftDiv = document.createElement('div');
    cardRoundPromoLeftDiv.classList.add('card-round-promo', 'left');
    const h6_1 = document.createElement('h6');
    h6_1.textContent = partidoData.equipo1.team.substring(0, 12); // Mantener el truncado
    cardRoundPromoLeftDiv.appendChild(h6_1);
    roundTitlesDiv.appendChild(cardRoundPromoLeftDiv);

    const cardRoundPromoMxDiv = document.createElement('div');
    cardRoundPromoMxDiv.classList.add('card-round-promo', 'mx-2');

    const currentPartidoInfo = partidoData.partidoInfo;

    let promoContent = '';
    // El texto "TBD" ahora viene del nombre del equipo en el JSON, no se genera aquí
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
    h6_2.textContent = partidoData.equipo2.team.substring(0, 12); // Mantener el truncado
    cardRoundPromoRightDiv.appendChild(h6_2);
    roundTitlesDiv.appendChild(cardRoundPromoRightDiv);

    bracketRoundListDiv.appendChild(roundTitlesDiv);

    // Equipo 2 (Derecha)
    const bracketRoundTeam2Div = document.createElement('div');
    bracketRoundTeam2Div.classList.add('bracket-round-team-right');
    const link2 = document.createElement('a');
    const { imgSrc: imgSrc2, teamLink: teamLink2 } = getTeamImageAndLink(partidoData.equipo2);
    link2.href = teamLink2;
    const img2 = document.createElement('img');
    img2.src = imgSrc2;
    img2.alt = `Logo de ${partidoData.equipo2.team}`;
    img2.classList.add('img-fluid');
    link2.appendChild(img2);
    bracketRoundTeam2Div.appendChild(link2);
    bracketRoundListDiv.appendChild(bracketRoundTeam2Div);

    // Card Back (colores de fondo) - MODIFICADO para TBD
    const cardBackDiv = document.createElement('div');
    cardBackDiv.classList.add('card-back');
    
    // Si el equipo es TBD, usamos una clase CSS genérica o un color específico
    const cardColorLeftClass = partidoData.equipo1.tag === 'TBD' ? 'color-tbd' : (partidoData.equipo1.tag === '7Z' ? 'S7Z' : partidoData.equipo1.tag);
    const cardColorRightClass = partidoData.equipo2.tag === 'TBD' ? 'color-tbd' : (partidoData.equipo2.tag === '7Z' ? 'S7Z' : partidoData.equipo2.tag);

    const cardColorLeftDiv = document.createElement('div');
    cardColorLeftDiv.classList.add('card-color-left', cardColorLeftClass);
    const cardColorRightDiv = document.createElement('div');
    cardColorRightDiv.classList.add('card-color-right', cardColorRightClass);
    
    cardBackDiv.appendChild(cardColorLeftDiv);
    cardBackDiv.appendChild(cardColorRightDiv);
    bracketRoundListDiv.appendChild(cardBackDiv);

    return bracketRoundListDiv; 
}