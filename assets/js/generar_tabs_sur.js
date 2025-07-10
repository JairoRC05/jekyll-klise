// generar_tabs.js

document.addEventListener('DOMContentLoaded', function() {
    const tabsContainer = document.getElementById('pills-tab');
    const contentContainer = document.getElementById('rondas-league-container');
    const rondaEspecialContainer = document.getElementById('rondaEspecial');
    const ultimosResultadosContainer = document.getElementById('ultimos-resultados-container'); 
    
const roundSpecificData = [
        { ronda: 'RONDA 1', fecha_inicio: '2025-07-10', fecha_fin: '2025-07-14', nombreImagen: 'scizor' },
        { ronda: 'RONDA 2', fecha_inicio: '2025-07-15', fecha_fin: '2025-07-16', nombreImagen: 'raichu' }, // <-- Cambia a raichu
        { ronda: 'RONDA 3', fecha_inicio: '2025-07-17', fecha_fin: '2025-07-18', nombreImagen: 'goodra' }, // <-- Cambia a goodra
        { ronda: 'RONDA 4', fecha_inicio: '2025-07-21', fecha_fin: '2025-07-22', nombreImagen: 'mimikyu' }, // <-- Cambia a mimikyu
        { ronda: 'RONDA 5', fecha_inicio: '2025-07-23', fecha_fin: '2025-07-24', nombreImagen: 'urshifu' }, // <-- Cambia a urshifu
        { ronda: 'RONDA 6', fecha: '2025-07-25', nombreImagen: 'gengar' }, // <-- Cambia a gengar
        { ronda: 'RONDA 7', fecha: '2025-07-28', nombreImagen: 'lapras' }, // <-- Cambia a lapras
        { ronda: 'RONDA 8', fecha: '2025-07-29', nombreImagen: 'psyduck' }, // <-- Cambia a psyduck
        { ronda: 'RONDA 9', fecha: '2025-07-30', nombreImagen: 'cleafable' }, // <-- Cambia a cleafable
        { ronda: 'RONDA 10', fecha_inicio: '2025-07-31', fecha_fin: '2025-08-01', nombreImagen: 'espeonEstrella' }, 
        { ronda: 'RONDA 11', fecha: '2025-08-04', nombreImagen: 'gyarados' }, 
        // ... el resto de tu array ...
        // Ejemplo para una ronda de un solo día
        // { ronda: 'RONDA EXTRA', fecha: '2025-07-18', nombreImagen: 'skin_ronda_EXTRA' },
        // { ronda: 'HOOPA', fecha: '2025-07-18', nombreImagen: 'PORTAL' },
        // ... más rondas si es necesario
    ];

    function setActiveTabByDate(roundsData) {
        const today = new Date();
        let activeTabIndex = 0; // Por defecto, la primera pestaña

        for (let i = 0; i < roundsData.length; i++) {
            const fechaInicioStr = roundsData[i].fecha_inicio;
            const fechaFinStr = roundsData[i].fecha_fin;
            const fechaUnicaStr = roundsData[i].fecha;

            if (fechaInicioStr && fechaFinStr) {
                const fechaInicio = new Date(fechaInicioStr);
                const fechaFin = new Date(fechaFinStr);

                today.setHours(0, 0, 0, 0);
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin.setHours(23, 59, 59, 999);

                if (today >= fechaInicio && today <= fechaFin) {
                    activeTabIndex = i;
                    break;
                } else if (fechaFin < today) {
                    activeTabIndex = i;
                }
            } else if (fechaUnicaStr) {
                const fechaUnica = new Date(fechaUnicaStr);
                fechaUnica.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                if (today.getTime() === fechaUnica.getTime()) {
                    activeTabIndex = i;
                    break;
                } else if (fechaUnica < today) {
                    activeTabIndex = i;
                }
            }
        }

        const tabIdToActivate = `pills-${activeTabIndex + 1}-tab`;
        const tabElement = document.getElementById(tabIdToActivate);
        if (tabElement) {
            const tab = new bootstrap.Tab(tabElement);
            tab.show();
            // Find the corresponding round data and pass it to generarContenidoRonda
            const activeRoundData = roundSpecificData[activeTabIndex];
            fetch('/assets/temporadas/julio2025/psur.json')
                .then(response => response.json())
                .then(data => {
                    const rondaEncontrada = data[0].rondas.find(r => r.ronda === activeRoundData.ronda);
                    if (rondaEncontrada) {
                        contentContainer.innerHTML = generarContenidoRonda({ ...rondaEncontrada, ...activeRoundData });
                    }
                });
        }
    }

    fetch('/assets/temporadas/julio2025/psur.json')
        .then(response => response.json())
        .then(data => {
            const rondasDesdeJSON = data[0].rondas.slice(0, 13);

            roundSpecificData.slice(0, 13).forEach((roundData, index) => {
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
                button.setAttribute('aria-selected', false);
                button.textContent = roundData.ronda.replace('RONDA ', '');

                button.addEventListener('click', () => {
                    const roundInfo = roundSpecificData[index];
                    fetch('/assets/temporadas/julio2025/psur.json')
                        .then(response => response.json())
                        .then(data => {
                            const rondaEncontrada = data[0].rondas.find(r => r.ronda === roundInfo.ronda);
                            if (rondaEncontrada) {
                                contentContainer.innerHTML = generarContenidoRonda({ ...rondaEncontrada, ...roundInfo });
                                const pillEl = document.querySelector(`#pills-${index + 1}-tab`);
                                if (pillEl) {
                                    const pill = new bootstrap.Tab(pillEl);
                                    pill.show();
                                }
                            }
                        });
                });

                listItem.appendChild(button);
                tabsContainer.appendChild(listItem);
            });

            setActiveTabByDate(roundSpecificData.slice(0, 13));

            const hoopaRoundData = roundSpecificData.find(data => data.ronda === 'HOOPA');
            if (hoopaRoundData) {
                fetch('/assets/partidos/cruces.json')
                    .then(response => response.json())
                    .then(hoopaData => {
                        // Assuming generarRondaEspecialHTML in utils can handle the nombreImagen
                        rondaEspecialContainer.innerHTML = generarRondaEspecialHTML({ ...hoopaData, 0: { rondas: [{ ...hoopaData[0].rondas[0], ...hoopaRoundData }] } });
                    })
                    .catch(error => {
                        console.error('Error al cargar cruces.json para la Ronda Hoopa:', error);
                        rondaEspecialContainer.innerHTML = '<p>Error al cargar la Ronda Hoopa.</p>';
                    });
            }

           if (ultimosResultadosContainer) {
                ultimosResultadosContainer.innerHTML = generarPartidosPendientesHTML(data[0].rondas);
            }
        })
        .catch(error => {
            console.error('Error al cargar psur.json:', error);
        });
});