let allMatchesData = []; // Contendrá todas las rondas consolidadas y sus partidos
let currentSelectedRound = null; // Guardará el objeto de la ronda actualmente seleccionada
let currentRoundMatches = []; // Guardará solo los partidos de la ronda actual, aplanados
let currentStreamMatch = null; // Variable para el partido actualmente en el stream

// Función para cargar los datos de los partidos
async function loadMatchData() {
    try {
        const responseNorte = await fetch('/assets/partidos/pnorte.json');
        const dataNorte = await responseNorte.json();

        const responseSur = await fetch('/assets/partidos/psur.json');
        const dataSur = await responseSur.json();

        const rondasNorte = dataNorte[0]?.rondas || [];
        const rondasSur = dataSur[0]?.rondas || [];

        const combinedRoundsMap = new Map();

        [...rondasNorte, ...rondasSur].forEach(ronda => {
            const roundName = ronda.ronda;
            if (combinedRoundsMap.has(roundName)) {
                const existingRonda = combinedRoundsMap.get(roundName);
                existingRonda.partidos = [...(existingRonda.partidos || []), ...(ronda.partidos || [])];
            } else {
                combinedRoundsMap.set(roundName, { ...ronda });
            }
        });

        allMatchesData = Array.from(combinedRoundsMap.values());

        allMatchesData.sort((a, b) => {
            const roundNumA = parseInt(a.ronda.match(/(\d+)/)?.[1] || 0);
            const roundNumB = parseInt(b.ronda.match(/(\d+)/)?.[1] || 0);
            return roundNumA - roundNumB;
        });

        console.log("Datos de partidos cargados y rondas consolidadas:", allMatchesData);
        populateRoundSelector();

    } catch (error) {
        console.error("Error al cargar los datos de partidos:", error);
        throw error;
    }
}

// Llenar el <select> de rondas
function populateRoundSelector() {
    const $selector = $('#round-selector');
    $selector.empty();

    if (allMatchesData.length === 0) {
        $selector.append('<option value="">No hay rondas disponibles</option>');
        $selector.prop('disabled', true);
        return;
    }

    $selector.prop('disabled', false);
    $selector.append('<option value="">Selecciona una Ronda</option>');

    allMatchesData.forEach(ronda => {
        const roundNumberMatch = ronda.ronda.match(/(\d+)/);
        if (roundNumberMatch) {
            const roundNum = roundNumberMatch[1];
            $selector.append(`<option value="${roundNum}">${ronda.ronda}</option>`);
        }
    });

    if (allMatchesData.length > 0) {
        const firstRoundNum = parseInt(allMatchesData[0].ronda.match(/(\d+)/)?.[1]);
        if (firstRoundNum) {
            $selector.val(firstRoundNum).trigger('change');
        }
    }
}

// updateStreamMatchDisplay
function updateStreamMatchDisplay(match) {
    // --- CORRECCIÓN CLAVE AQUÍ: Asignar el partido al currentStreamMatch ---
    currentStreamMatch = match; 

    if (!match) {
        $('#stream-local-logo').attr('src', 'placeholder.png');
        $('#stream-local-name').text('Equipo Local');
        $('#stream-match-round-label').text('RONDA N/A');
        $('.scoreLocal').text('0');
        $('.scoreOut').text('0');
        $('#stream-match-now').text('SET 1');
        $('#stream-match-label').text('MATCH N/A');
        $('#stream-away-name').text('Equipo Visitante');
        $('#stream-away-logo').attr('src', 'placeholder.png');
        
        // Limpiar y resetear nombres en el panel de control
        $('#control-team1-name').text('Equipo Local');
        $('#control-team2-name').text('Equipo Visitante');
        $('#control-score1').val('0');
        $('#control-score2').val('0');
        return;
    }

    const logo1Path = match.tag1 ? `/assets/logos/${match.tag1}.webp` : 'placeholder.png';
    const logo2Path = match.tag2 ? `/assets/logos/${match.tag2}.webp` : 'placeholder.png';

    $('#stream-local-logo').attr('src', logo1Path);
    $('#stream-local-name').text(match.equipo1 || 'Equipo Local');

    $('#stream-match-round-label').text(currentSelectedRound.ronda || 'RONDA N/A');

    const scoreLocal = match.puntuacion1 !== undefined ? match.puntuacion1 : 0;
    const scoreOut = match.puntuacion2 !== undefined ? match.puntuacion2 : 0;

    $('.scoreLocal').text(scoreLocal);
    $('.scoreOut').text(scoreOut);

    // Actualiza los inputs y nombres en el panel de control
    $('#control-score1').val(scoreLocal);
    $('#control-score2').val(scoreOut);
    $('#control-team1-name').text(match.equipo1 || 'Equipo Local');
    $('#control-team2-name').text(match.equipo2 || 'Equipo Visitante');

    let setLabel = 'SET 1';

    // Lógica para determinar la etiqueta del SET
    if ((scoreLocal === 0 && scoreOut === 0) || (scoreLocal === 1 && scoreOut === 0) || (scoreLocal === 0 && scoreOut === 1)) {
        setLabel = 'SET 1';
    } else if ((scoreLocal === 1 && scoreOut === 1) || (scoreLocal === 2 && scoreOut === 0) || (scoreLocal === 0 && scoreOut === 2)) {
        setLabel = 'SET 2';
    } else if ((scoreLocal === 2 && scoreOut === 1) || (scoreLocal === 1 && scoreOut === 2) || (scoreLocal === 3 && scoreOut === 0) || (scoreLocal === 0 && scoreOut === 3)) {
        setLabel = 'SET 3';
    } else if ((scoreLocal === 3 && scoreOut === 1) || (scoreLocal === 1 && scoreOut === 3) || (scoreLocal === 4 && scoreOut === 0)) { // Removí 2-2 de aquí
        setLabel = 'SET 4';
    } else if ((scoreLocal === 2 && scoreOut === 2) || (scoreLocal === 3 && scoreOut === 2) || (scoreLocal === 2 && scoreOut === 4) || (scoreLocal === 4 && scoreOut === 2)) { // Agregué 4-2 y 2-4
        setLabel = 'SET 5';
    }
    // Consideración de 2-2: Si 2-2 debe ser SET 4, ya está cubierto arriba.
    // Si 2-2 debe ser SET 5, entonces la condición del SET 4 debe excluirlo.
    // He ajustado para que 2-2 sea SET 5. Si quieres que 2-2 sea SET 4, avísame.

    $('#stream-match-now').text(setLabel);

    $('#stream-match-label').text(`MATCH ${match.match_number || 'N/A'}`);

    $('#stream-away-name').text(match.equipo2 || 'Equipo Visitante');
    $('#stream-away-logo').attr('src', logo2Path);
}

// updateRoundMatchesContainer (sin cambios)
function updateRoundMatchesContainer(excludeMatchIndex = -1) {
    const $container = $('#round-matches-container');
    $container.empty();

    $('#current-round-label').text(currentSelectedRound ? currentSelectedRound.ronda : 'RONDA N/A');

    if (!currentRoundMatches || currentRoundMatches.length === 0) {
        $container.append('<p class="text-muted text-center">No hay partidos en esta ronda.</p>');
        return;
    }

    currentRoundMatches.forEach((match, index) => {
        const logo1Path = match.tag1 ? `/assets/logos/${match.tag1}.webp` : 'placeholder.png';
        const logo2Path = match.tag2 ? `/assets/logos/${match.tag2}.webp` : 'placeholder.png';

        const matchHtml = `
            <div class="round match-mini-card">
                <img src="${logo1Path}" alt="${match.equipo1 || 'Equipo 1'}">
                <span class="score">${match.resultado || 'VS'}</span>
                <img src="${logo2Path}" alt="${match.equipo2 || 'Equipo 2'}">
            </div>
        `;
        $container.append(matchHtml);
    });
}

// generateMatchSelectionButtons (sin cambios)
function generateMatchSelectionButtons() {
    const $container = $('#match-selection-buttons-container');
    $container.empty();

    if (!currentRoundMatches || currentRoundMatches.length === 0) {
        $container.append('<p class="text-muted">No hay partidos para seleccionar en esta ronda.</p>');
        return;
    }

    currentRoundMatches.forEach((match, index) => {
        const buttonHtml = `
            <button type="button" class="btn btn-outline-primary match-slot-btn"
                    data-match-index="${index}">${match.ronda_nombre || 'MATCH'} ${match.match_number || (index + 1)}</button>
        `;
        $container.append(buttonHtml);
    });
}

// Bloque document.ready
$(document).ready(function () {
    loadMatchData().then(() => {
        // La inicialización del selector y la primera ronda se maneja dentro de populateRoundSelector()
    }).catch(error => {
        console.error("Error al inicializar la aplicación:", error);
        updateStreamMatchDisplay(null);
        updateRoundMatchesContainer();
    });

    $('#round-selector').on('change', function () {
        const selectedRoundNum = $(this).val();
        if (selectedRoundNum) {
            currentSelectedRound = allMatchesData.find(ronda =>
                ronda.ronda.includes(`RONDA ${selectedRoundNum}`)
            );

            if (currentSelectedRound && currentSelectedRound.partidos) {
                currentRoundMatches = currentSelectedRound.partidos.sort((a, b) => (a.match_number || 0) - (b.match_number || 0));
                console.log(`Partidos para RONDA ${selectedRoundNum}:`, currentRoundMatches);

                generateMatchSelectionButtons();
                updateRoundMatchesContainer();

                if (currentRoundMatches.length > 0) {
                    $('#match-selection-buttons-container .match-slot-btn').first().trigger('click');
                } else {
                    updateStreamMatchDisplay(null);
                }
            } else {
                console.warn(`No se encontraron partidos para la Ronda ${selectedRoundNum}.`);
                currentSelectedRound = null;
                currentRoundMatches = [];
                generateMatchSelectionButtons();
                updateStreamMatchDisplay(null);
                updateRoundMatchesContainer();
            }
        } else {
            currentSelectedRound = null;
            currentRoundMatches = [];
            generateMatchSelectionButtons();
            updateStreamMatchDisplay(null);
            updateRoundMatchesContainer();
        }
    });

    $('#match-selection-buttons-container').on('click', '.match-slot-btn', function () {
        const $this = $(this);
        const matchIndex = parseInt($this.data('match-index'));

        $('#match-selection-buttons-container .match-slot-btn').removeClass('active');
        $this.addClass('active');

        if (currentRoundMatches && currentRoundMatches.length > matchIndex) {
            const selectedMatch = currentRoundMatches[matchIndex];
            updateStreamMatchDisplay(selectedMatch);
        } else {
            console.warn(`No hay partido en la posición ${matchIndex} para la ronda actual.`);
            updateStreamMatchDisplay(null);
        }
    });

    $('.score-btn').on('click', function() {
        // Ahora currentStreamMatch ya se asignará cuando se selecciona un partido
        if (!currentStreamMatch) {
            console.warn("No hay partido en stream para actualizar el marcador. Selecciona un partido primero.");
            return;
        }

        const team = $(this).data('team');
        const action = $(this).data('action');

        if (team === 1) {
            if (action === 'increment') {
                currentStreamMatch.puntuacion1 = (currentStreamMatch.puntuacion1 || 0) + 1;
            } else {
                currentStreamMatch.puntuacion1 = Math.max(0, (currentStreamMatch.puntuacion1 || 0) - 1);
            }
        } else if (team === 2) {
            if (action === 'increment') {
                currentStreamMatch.puntuacion2 = (currentStreamMatch.puntuacion2 || 0) + 1;
            } else {
                currentStreamMatch.puntuacion2 = Math.max(0, (currentStreamMatch.puntuacion2 || 0) - 1);
            }
        }

        updateStreamMatchDisplay(currentStreamMatch);
    });

    $('#reset-scores-btn').on('click', function() {
        if (currentStreamMatch) {
            currentStreamMatch.puntuacion1 = 0;
            currentStreamMatch.puntuacion2 = 0;
            updateStreamMatchDisplay(currentStreamMatch);
        }
    });
});