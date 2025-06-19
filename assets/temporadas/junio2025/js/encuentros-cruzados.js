// encuentros_cruzados.js

document.addEventListener('DOMContentLoaded', async function() {
    
    const teamFilesNorte = [
        '/assets/temporadas/junio2025/aep.json',
        '/assets/temporadas/junio2025/amt.json',
        '/assets/temporadas/junio2025/lb.json',
        '/assets/temporadas/junio2025/magma.json',
        '/assets/temporadas/junio2025/obs.json',
        '/assets/temporadas/junio2025/pkr.json',
        '/assets/temporadas/junio2025/pl.json',
        '/assets/temporadas/junio2025/quartz.json',
        '/assets/temporadas/junio2025/sapphire.json',
        '/assets/temporadas/junio2025/stmn.json',
        '/assets/temporadas/junio2025/tae.json',
        '/assets/temporadas/junio2025/tut.json',
        '/assets/temporadas/junio2025/tutw.json'
    ];

    const teamFilesSur = [
        '/assets/temporadas/junio2025/amet.json',
        '/assets/temporadas/junio2025/cd.json',
        '/assets/temporadas/junio2025/dg.json',
        '/assets/temporadas/junio2025/dinasty.json',
        '/assets/temporadas/junio2025/ftb.json',
        '/assets/temporadas/junio2025/plaga.json',
        '/assets/temporadas/junio2025/platino.json',
        '/assets/temporadas/junio2025/poa.json',
        '/assets/temporadas/junio2025/rntes.json',
        '/assets/temporadas/junio2025/sm.json',
        '/assets/temporadas/junio2025/space.json',
        '/assets/temporadas/junio2025/trr.json',
        '/assets/temporadas/junio2025/zafiro.json'
    ];

    const rankingNorte = await loadAndDisplayRanking('grupoNorte', teamFilesNorte, 'NORTH');
    const rankingSur = await loadAndDisplayRanking('grupoSur', teamFilesSur, 'SOUTH');




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
            { resultado: 'Pendiente', stream: true, fecha: 'Jue 27-JUN', hora: '21:15' },
            // Datos para el cruce "2 Norte vs 3 Sur"
            { resultado: 'Pendiente', stream: true, fecha: 'Jue 27-JUN', hora: '22:15' },
            // Datos para el cruce "1 Sur vs 4 Norte"
            { resultado: 'Pendiente', stream: true, fecha: 'Lun 30-JUN', hora: '21:15' }, // Ejemplo sin stream
            // Datos para el cruce "2 Sur vs 3 Norte"
            { resultado: 'Pendiente', stream: true, fecha: 'Lun 30-JUN', hora: '22:15' }
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


     // Encuentro de Semifinal 1 (Ganador 1N-4S vs Ganador 2S-3N)
    const equipoSF1_1 = rankingNorte[0] || { team: 'Ganador QF1', tag: 'GQF1', link: '#' }; // Ejemplo si no hay equipo real
    const equipoSF1_2 = rankingSur[1] || { team: 'Ganador QF4', tag: 'GQF4', link: '#' };

    // Encuentro de Semifinal 2 (Ganador 2N-3S vs Ganador 1S-4N)
    const equipoSF2_1 = rankingNorte[1] || { team: 'Ganador QF2', tag: 'GQF2', link: '#' };
    const equipoSF2_2 = rankingSur[0] || { team: 'Ganador QF3', tag: 'GQF3', link: '#' };


    const datosPartidosSimuladosSF = [
        // Semifinal 1
        {
            equipo1: equipoSF1_1,
            equipo2: equipoSF1_2,
            partidoInfo: { resultado: 'Pendiente', stream: true, fecha: 'Lun 01-JUL', hora: '20:00' },
            tipo: 'Semifinal 1'
        },
        // Semifinal 2
        {
            equipo1: equipoSF2_1,
            equipo2: equipoSF2_2,
            partidoInfo: { resultado: 'Pendiente', stream: true, fecha: 'Mar 02-JUL', hora: '20:00' },
            tipo: 'Semifinal 2'
        }
    ];

    // GANADORES SIMULADOS DE SEMIFINAL (puedes ajustar estos nombres/tags)
    const equipoFinal_1 = equipoSF1_1; // Asumimos que el equipo 1 de la SF1 gana
    const equipoFinal_2 = equipoSF2_1; // Asumimos que el equipo 1 de la SF2 gana

    const datosPartidosSimuladosFinal = [
        // Gran Final
        {
            equipo1: equipoFinal_1,
            equipo2: equipoFinal_2,
            partidoInfo: { resultado: 'Gran Final', stream: true, fecha: 'Vie 05-JUL', hora: '21:00' },
            tipo: 'Gran Final'
        }
    ];

    // --- FIN NUEVAS DEFINICIONES ---


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
                colDiv.classList.add('col-12', 'col-md-6', 'col-lg-3', 'mb-4');
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
                colDiv.classList.add('col-12', 'col-md-6', 'mb-4');
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
                colDiv.classList.add('col-12', 'col-md-6', 'col-lg-4', 'mb-4');
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
    bracketRoundListDiv.classList.add('bracket-round-list');

    // Equipo 1 (Izquierda)
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

    // Centro del partido (Nombres, resultado, stream/fecha/hora)
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

    // Uso de partidoData.partidoInfo
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

    // Equipo 2 (Derecha)
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

    // Card Back (colores de fondo)
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