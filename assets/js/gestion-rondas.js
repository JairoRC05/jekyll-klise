document.addEventListener('DOMContentLoaded', () => {
    const archivoSelector = document.getElementById('archivo-selector');
    const gestionRondasDiv = document.getElementById('gestion-rondas');
    const formularioEdicionModal = new bootstrap.Modal(document.getElementById('formulario-edicion-partido')); // Instancia del modal
    const equipo1InputEdit = document.getElementById('equipo1-edit');
    const equipo2InputEdit = document.getElementById('equipo2-edit');
    const tag1InputEdit = document.getElementById('tag1-edit'); // Nuevo: input para tag1
    const tag2InputEdit = document.getElementById('tag2-edit'); // Nuevo: input para tag2
    const streamSelectEdit = document.getElementById('stream-edit');
    const resultadoSelectEdit = document.getElementById('resultado-edit');
    const fechaInputEdit = document.getElementById('fecha-edit');
    const horaInputEdit = document.getElementById('hora-edit');
    const logoLocalEdit = document.getElementById('logo-local-edit');
    const logoVisitanteEdit = document.getElementById('logo-visitante-edit');
    const guardarEdicionBtn = document.getElementById('guardar-edicion-btn');
    const cancelarEdicionBtn = document.getElementById('cancelar-edicion-btn');
    const descargarJsonBtn = document.getElementById('descargar-json-modificado');
    let partidosData = {};
    let partidoSeleccionado = null; // Para almacenar el partido que se está editando
    let archivoActual = archivoSelector.value; // Para saber qué archivo se está mostrando
    let activeTabId = null; // Variable para almacenar el ID de la pestaña activa

    function descargarJSONModificado() {
        console.log("Archivo actual al descargar:", archivoActual);
        console.log("Contenido de partidosData al descargar:", partidosData);
        const dataParaDescargar = [{ "rondas": partidosData[archivoActual]?.rondas || [] }];
        console.log("Datos para descargar:", dataParaDescargar);
        const jsonString = JSON.stringify(dataParaDescargar, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${archivoActual}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    archivoSelector.addEventListener('change', async (event) => {
        archivoActual = event.target.value;
        const data = await cargarPartidos(archivoActual);
        if (data) {
            activeTabId = null;
            mostrarRondas(data);
        }
    });

    descargarJsonBtn.addEventListener('click', descargarJSONModificado);

    async function cargarPartidos(archivo) {
        try {
            const response = await fetch(`/assets/temporadas/actual/${archivo}.json`);
            if (!response.ok) {
                console.error(`Error al cargar ${archivo}: ${response.status} ${response.statusText}`);
                return null;
            }
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0 && data[0].rondas) {
                partidosData[archivo] = data[0];
                return data[0];
            } else {
                console.warn(`El archivo ${archivo} no tiene la estructura esperada.`);
                return null;
            }
        } catch (error) {
            console.error(`Error al procesar ${archivo}:`, error);
            return null;
        }
    }

    function mostrarRondas(data) {
        gestionRondasDiv.innerHTML = '';
        if (!data || !data.rondas || data.rondas.length === 0) {
            gestionRondasDiv.innerHTML = '<p>No hay rondas disponibles para este archivo.</p>';
            return;
        }

        const navTabs = document.createElement('ul');
        navTabs.classList.add('nav', 'nav-tabs');
        navTabs.setAttribute('role', 'tablist');

        const tabContent = document.createElement('div');
        tabContent.classList.add('tab-content');

        data.rondas.forEach((ronda, index) => {
            const tabId = `ronda-${index}`;
            const isActive = activeTabId ? (tabId === activeTabId) : (index === 0);

            const listItem = document.createElement('li');
            listItem.classList.add('nav-item');
            listItem.setAttribute('role', 'presentation');

            const button = document.createElement('button');
            button.classList.add('nav-link');
            if (isActive) {
                button.classList.add('active');
            }
            button.setAttribute('id', `${tabId}-tab`);
            button.setAttribute('data-bs-toggle', 'tab');
            button.setAttribute('data-bs-target', `#${tabId}`);
            button.setAttribute('type', 'button');
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-controls', tabId);
            button.setAttribute('aria-selected', isActive);
            button.textContent = ronda.ronda;

            listItem.appendChild(button);
            navTabs.appendChild(listItem);

            const tabPane = document.createElement('div');
            tabPane.classList.add('tab-pane', 'fade');
            if (isActive) {
                tabPane.classList.add('show', 'active');
            }
            tabPane.setAttribute('id', tabId);
            tabPane.setAttribute('role', 'tabpanel');
            tabPane.setAttribute('aria-labelledby', `${tabId}-tab`);

            const partidosRow = document.createElement('div');
            partidosRow.classList.add('row', 'mt-3');

            ronda.partidos.forEach((partido, partidoIndex) => {
                const partidoCol = document.createElement('div');
                partidoCol.classList.add('col-lg-4', 'mb-3', 'partido-card');
                partidoCol.dataset.rondaIndex = index;
                partidoCol.dataset.partidoIndex = partidoIndex;
                partidoCol.dataset.tabId = tabId;

                partidoCol.innerHTML = `
                    <div class="bracket-round-list">
                        <div class="bracket-round-team">
                            <a href="/teams/${partido.equipo1}">
                                <img src="/assets/logos/${partido.tag1}.webp" alt="" class="img-fluid">
                            </a>
                        </div>
                        <div class="round-titles">
                            <div class="card-round-promo left">
                                <h6>${partido.equipo1.substring(0, 12)}</h6>
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
                                <h6>${partido.equipo2.substring(0, 12)}</h6>
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
                    </div>
                `;
                partidosRow.appendChild(partidoCol);
            });

            tabPane.appendChild(partidosRow);
            tabContent.appendChild(tabPane);
        });

        gestionRondasDiv.appendChild(navTabs);
        gestionRondasDiv.appendChild(tabContent);

        const tarjetasPartido = document.querySelectorAll('.partido-card');
        tarjetasPartido.forEach(tarjeta => {
            tarjeta.addEventListener('click', mostrarFormularioEdicion);
        });
    }

    function mostrarFormularioEdicion(event) {
        const tarjetaPartido = event.currentTarget;
        const rondaIndex = parseInt(tarjetaPartido.dataset.rondaIndex);
        const partidoIndex = parseInt(tarjetaPartido.dataset.partidoIndex);

        activeTabId = tarjetaPartido.dataset.tabId;

        if (partidosData[archivoActual] && partidosData[archivoActual].rondas && partidosData[archivoActual].rondas[rondaIndex] && partidosData[archivoActual].rondas[rondaIndex].partidos && partidosData[archivoActual].rondas[rondaIndex].partidos[partidoIndex]) {
            partidoSeleccionado = partidosData[archivoActual].rondas[rondaIndex].partidos[partidoIndex];

            // Precargar los datos en el formulario
            equipo1InputEdit.value = partidoSeleccionado.equipo1;
            tag1InputEdit.value = partidoSeleccionado.tag1; // Nuevo: precargar tag1
            equipo2InputEdit.value = partidoSeleccionado.equipo2;
            tag2InputEdit.value = partidoSeleccionado.tag2; // Nuevo: precargar tag2
            streamSelectEdit.value = partidoSeleccionado.stream ? 'true' : 'false';
            resultadoSelectEdit.value = partidoSeleccionado.resultado || 'VS';
            fechaInputEdit.value = partidoSeleccionado.fecha || '';
            horaInputEdit.value = partidoSeleccionado.hora === "SI" ? '21:40' : (partidoSeleccionado.hora === "NO" ? '22:20' : partidoSeleccionado.hora || '');
            logoLocalEdit.src = `/assets/logos/${partidoSeleccionado.tag1}.webp`;
            logoVisitanteEdit.src = `/assets/logos/${partidoSeleccionado.tag2}.webp`;

            formularioEdicionModal.show(); // Mostrar el modal
        } else {
            console.error('No se pudo encontrar el partido seleccionado en los datos.');
        }
    }

    function guardarEdicionPartido() {
        if (partidoSeleccionado) {
            partidoSeleccionado.equipo1 = equipo1InputEdit.value;
            partidoSeleccionado.tag1 = tag1InputEdit.value; // Nuevo: guardar tag1
            partidoSeleccionado.equipo2 = equipo2InputEdit.value;
            partidoSeleccionado.tag2 = tag2InputEdit.value; // Nuevo: guardar tag2
            partidoSeleccionado.stream = streamSelectEdit.value === 'true';
            partidoSeleccionado.resultado = resultadoSelectEdit.value;
            partidoSeleccionado.fecha = fechaInputEdit.value;
            partidoSeleccionado.hora = horaInputEdit.value === '21:40' ? 'SI' : (horaInputEdit.value === '22:20' ? 'NO' : horaInputEdit.value);

            // Volver a renderizar las rondas para mostrar los cambios
            mostrarRondas(partidosData[archivoActual]);
            formularioEdicionModal.hide(); // Ocultar el modal
            partidoSeleccionado = null;

            // Reactivar la pestaña que estaba activa
            if (activeTabId) {
                const tabButton = document.getElementById(`${activeTabId}-tab`);
                if (tabButton) {
                    tabButton.click();
                }
            }
        }
    }

    function cancelarEdicionPartido() {
        formularioEdicionModal.hide(); // Ocultar el modal
        partidoSeleccionado = null;
        if (activeTabId) {
            const tabButton = document.getElementById(`${activeTabId}-tab`);
            if (tabButton) {
                tabButton.click();
            }
        }
    }

    guardarEdicionBtn.addEventListener('click', guardarEdicionPartido);
    cancelarEdicionBtn.addEventListener('click', cancelarEdicionPartido);

    cargarPartidos(archivoSelector.value).then(data => {
        if (data) {
            mostrarRondas(data);
        }
    });
});