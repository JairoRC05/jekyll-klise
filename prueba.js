async function mostrarDetallesEquipo(equipo) {
    document.getElementById('nombre-equipo').textContent = equipo.team;
    const listaJugadoresDiv = document.getElementById('lista-jugadores');
    listaJugadoresDiv.innerHTML = '';

    if (equipo.jugadores) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');

        equipo.jugadores.forEach((jugador, index) => {
            const jugadorHTML = `
                 <div class="col-md-6 col-lg-3 col-xl-2 jugador-editable" data-jugador-index="${index}">
                        <div class="card-round-roster">
                            <div class="card-round-team">
                                <a href="#">
                                    <img src="${jugador.avatar ? `/assets/avatars/${jugador.avatar}.webp` : '/assets/avatars/male1.webp'}" alt="${jugador.nickname}" class="img-fluid">
                                </a>
                            </div>
                            <div class="card-round-title">
                                <input type="text" class="form-control form-control-sm edit-nickname" value="${jugador.nickname}">
                                <input type="text" class="form-control form-control-sm edit-id" value="${jugador.ID}">
                                <input type="text" class="form-control form-control-sm edit-avatar" value="${jugador.avatar || ''}">
                            </div>
                            <div class="card-back">
                                <div class="card-color-left ${equipo.tag}"></div>
                                <div class="card-color-right bg-cham"></div>
                                <div class="card-color-logo">
                                    <img src="/assets/logos/LIGA-INDIGO.webp" alt="Liga Indigo">
                                </div>
                            </div>
                        </div>
                    </div>
            `;
            rowDiv.innerHTML += jugadorHTML;
        });

        listaJugadoresDiv.appendChild(rowDiv);

        // Agrega un event listener a cada tarjeta de jugador para la edición
        const jugadorCards = listaJugadoresDiv.querySelectorAll('.jugador-card');
        jugadorCards.forEach(card => {
            card.addEventListener('click', function() {
                const index = this.dataset.jugadorIndex;
                const jugadores = equiposData[equipoSeleccionado]?.jugadores;

                if (jugadores && jugadores[index]) {
                    jugadorSeleccionadoParaEditar = jugadores[index];
                    jugadorEditandoIndex = index;
                    document.getElementById('edit-modal-nickname').value = jugadorSeleccionadoParaEditar.nickname;
                    document.getElementById('edit-modal-id').value = jugadorSeleccionadoParaEditar.ID;
                    document.getElementById('edit-modal-avatar').value = jugadorSeleccionadoParaEditar.avatar || '';
                    document.getElementById('edit-modal-tag').value = equipoSeleccionado; // Puedes usarlo para referencia
                    editarJugadorModal.show();
                } else {
                    console.error('No se encontró el jugador para editar.');
                }
            });
        });

    } else {
        listaJugadoresDiv.innerHTML = '<p>No hay jugadores registrados.</p>';
    }

    const partidosEquipoContainer = document.getElementById('partidos-equipo-container');
    partidosEquipoContainer.innerHTML = '';
    let totalPuntos = 0;
    const puntosPartidosKeys = Object.keys(equipo.partidos).filter(key => key.startsWith('M'));
    let puntosKeyIndex = 0;

    const rowDivPartidos = document.createElement('div');
    rowDivPartidos.classList.add('row');
    partidosEquipoContainer.appendChild(rowDivPartidos);

    const scoreValues = {
        SUP: 3,
        WIN: 2,
        ONE: 1,
        LOSS: 0,
        REA: "R",
        DES: "D",
        NJ: ""
    };

    if (partidosData && partidosData.length > 0) {
        partidosData[0].rondas.forEach(ronda => {
            ronda.partidos.forEach(partido => {
                if (partido.tag1 === equipo.tag || partido.tag2 === equipo.tag) {
                    const colDiv = document.createElement('div');
                    colDiv.classList.add('col-lg-4', 'mb-3');

                    const partidoDiv = document.createElement('div');
                    partidoDiv.classList.add('bracket-round-list');
                    partidoDiv.innerHTML = `
                    <div class="bracket-round-team">
        <a href="/teams/${partido.equipo1}">
            <img src="/assets/logos/${partido.tag1}.webp" alt="" class="img-fluid">
        </a>
    </div>
    <div class="round-titles">
        <div class="card-round-promo left">
            <h6>${partido.equipo1.substring(0, 15)}</h6>
        </div>
        <div class="card-round-promo mx-2">
            ${partido.stream ? `
                <span>TWITCH</span>
                <h6>${partido.resultado || ''}</h6>
                <span>${partido.fecha || ''}</span>
                <span>${partido.hora === "SI" ? '21:40' : (partido.hora === "NO" ? '22:20' : partido.hora || '')}</span>
            ` : (partido.special ? `
                <span>TWITCH</span>
                <h6>${partido.resultado || ''}</h6>
                <span>${partido.hora || ''}</span>
            ` : `
                <h6>${partido.resultado || ''}</h6>
            `)}
        </div>
        <div class="card-round-promo right">
            <h6>${partido.equipo2.substring(0, 15)}</h6>
        </div>
    </div>
    <div class="bracket-round-team-right">
        <a href="/teams/${partido.equipo2}">
            <img src="/assets/logos/${partido.tag2}.webp" alt="" class="img-fluid">
        </a>
    </div>
    <div class="card-back">
        <div class="card-color-left ${partido.equipo1 === "7Z" ? 'S7Z' : partido.tag1}"></div>
        <div class="card-color-right ${partido.equipo2 === "7Z" ? 'S7Z' : partido.tag2}"></div>
    </div>
                    `;
                    colDiv.appendChild(partidoDiv);

                    if (puntosKeyIndex < puntosPartidosKeys.length) {
                        const partidoKey = puntosPartidosKeys[puntosKeyIndex];
                        const valorGuardado = equipo.partidos[partidoKey];

                        const selectDiv = document.createElement('div');
                        selectDiv.classList.add('mt-2', 'd-flex', 'align-items-center', 'justify-content-center');

                        const selectElement = document.createElement('select');
                        selectElement.classList.add('form-select', 'form-select-sm', 'mx-auto');
                        selectElement.id = `score-${partidoKey.toLowerCase()}`;
                        selectElement.style.width = '120px';

                        for (const key in scoreValues) {
                            const option = document.createElement('option');
                            option.value = scoreValues[key];
                            option.textContent = key;
                            const valorComparar = (key === 'REA' ? 'R' : (key === 'DES' ? 'D' : (key === 'NJ' ? '' : scoreValues[key])));
                            option.selected = (valorGuardado == valorComparar);
                            selectElement.appendChild(option);
                        }

                        selectDiv.appendChild(selectElement);
                        colDiv.appendChild(selectDiv);
                        rowDivPartidos.appendChild(colDiv);

                        selectElement.addEventListener('change', (event) => {
                            const selectedValue = event.target.value;
                            actualizarPuntosEquipo(partidoKey, selectedValue);
                            totalPuntos = calcularSumaTotalPuntos(equipo);
                            mostrarSumaPuntos(totalPuntos);
                        });

                        totalPuntos += calcularPuntosPartido(valorGuardado);
                        puntosKeyIndex++;
                    }
                    rowDivPartidos.appendChild(colDiv);
                }
            });
        });
    } else {
        partidosEquipoContainer.innerHTML = '<p>No se pudieron cargar los datos de los partidos.</p>';
    }

    mostrarSumaPuntos(totalPuntos);
}
