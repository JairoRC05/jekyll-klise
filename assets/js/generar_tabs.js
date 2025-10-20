// generar_tabs.js

document.addEventListener('DOMContentLoaded', function() {
    const tabsContainer = document.getElementById('pills-tab');
    const contentContainer = document.getElementById('rondas-league-container');
    const rondaEspecialContainer = document.getElementById('rondaEspecial');
    const ultimosResultadosContainer = document.getElementById('ultimos-resultados-container');

    // Mapeo de imágenes por ronda (si no está en el JSON)
    const nombreImagenPorRonda = {
        'RONDA 1': 'scizor',
        'RONDA 2': 'raichu',
        'RONDA 3': 'goodra',
        'RONDA 4': 'mimikyu',
        'RONDA 5': 'urshifu',
        'RONDA 6': 'gengar',
        'RONDA 7': 'lapras',
        'RONDA 8': 'psyduck',
        'RONDA 9': 'cleafable',
        'RONDA 10': 'espeonEstrella',
        'RONDA 11': 'gyarados'
    };

    function calcularFechasRonda(ronda) {
        const dias = ronda.partidos
            .filter(partido => partido.dia)
            .map(partido => partido.dia);

        if (dias.length === 0) return { fecha_inicio: '', fecha_fin: '' };

        const fechas = dias.map(d => new Date(d));
        const fecha_inicio = new Date(Math.min(...fechas)).toISOString().split('T')[0];
        const fecha_fin = new Date(Math.max(...fechas)).toISOString().split('T')[0];

        return { fecha_inicio, fecha_fin };
    }

    function setActiveTabByDate(roundsData) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let activeTabIndex = 0;

        for (let i = 0; i < roundsData.length; i++) {
            const ronda = roundsData[i];
            const fechaInicio = ronda.fecha_inicio ? new Date(ronda.fecha_inicio) : null;
            const fechaFin = ronda.fecha_fin ? new Date(ronda.fecha_fin) : null;

            if (fechaInicio && fechaFin) {
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin.setHours(23, 59, 59, 999);

                if (today >= fechaInicio && today <= fechaFin) {
                    activeTabIndex = i;
                    break;
                } else if (fechaFin < today) {
                    activeTabIndex = i;
                }
            }
        }

        const tabIdToActivate = `pills-${activeTabIndex + 1}-tab`;
        const tabElement = document.getElementById(tabIdToActivate);
        if (tabElement) {
            const tab = new bootstrap.Tab(tabElement);
            tab.show();

            contentContainer.innerHTML = generarContenidoRonda(roundsData[activeTabIndex]);
        }
    }

    fetch('/assets/temporadas/actual/calendario.json')
        .then(response => response.json())
        .then(data => {
            const rondas = data[0].rondas;

            // Completar cada ronda con fechas e imagen
            const roundSpecificData = rondas.map(ronda => {
                const { fecha_inicio, fecha_fin } = calcularFechasRonda(ronda);
                return {
                    ...ronda,
                    fecha_inicio: fecha_inicio || ronda.fecha_inicio,
                    fecha_fin: fecha_fin || ronda.fecha_fin,
                    nombreImagen: nombreImagenPorRonda[ronda.ronda] || 'default'
                };
            });

            // Crear pestañas
            roundSpecificData.forEach((ronda, index) => {
                const listItem = document.createElement('li');
                listItem.classList.add('nav-item');
                listItem.setAttribute('role', 'presentation');

                const button = document.createElement('button');
                button.classList.add('nav-link');
                button.setAttribute('id', `pills-${index + 1}-tab`);
                button.setAttribute('data-bs-toggle', 'pill');
                button.setAttribute('data-bs-target', `#pills-${index + 1}`);
                button.setAttribute('type', 'button');
                button.setAttribute('role', 'tab');
                button.setAttribute('aria-controls', `pills-${index + 1}`);
                button.setAttribute('aria-selected', 'false');
                button.textContent = ronda.ronda.replace('RONDA ', '');

                button.addEventListener('click', () => {
                    contentContainer.innerHTML = generarContenidoRonda(ronda);
                    const pillEl = document.querySelector(`#pills-${index + 1}-tab`);
                    if (pillEl) {
                        const pill = new bootstrap.Tab(pillEl);
                        pill.show();
                    }
                });

                listItem.appendChild(button);
                tabsContainer.appendChild(listItem);
            });

            // Activar pestaña según fecha
            setActiveTabByDate(roundSpecificData);

            // Ronda especial (HOOPA) – ajusta si existe en otro JSON
            const hoopaRoundData = roundSpecificData.find(data => data.ronda === 'HOOPA');
            if (hoopaRoundData) {
                fetch('/assets/partidos/cruces.json')
                    .then(response => response.json())
                    .then(hoopaData => {
                        rondaEspecialContainer.innerHTML = generarRondaEspecialHTML({
                            ...hoopaData[0].rondas[0],
                            ...hoopaRoundData
                        });
                    })
                    .catch(error => {
                        console.error('Error al cargar cruces.json para la Ronda Hoopa:', error);
                        rondaEspecialContainer.innerHTML = '<p>Error al cargar la Ronda Hoopa.</p>';
                    });
            }

            // Últimos resultados
            if (ultimosResultadosContainer) {
                ultimosResultadosContainer.innerHTML = generarPartidosPendientesHTML(roundSpecificData);
            }

        })
        .catch(error => {
            console.error('Error al cargar calendario.json:', error);
        });
});