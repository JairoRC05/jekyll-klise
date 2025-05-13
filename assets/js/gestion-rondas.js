document.addEventListener('DOMContentLoaded', () => {
    const archivoSelector = document.getElementById('archivo-selector');
    const gestionRondasDiv = document.getElementById('gestion-rondas');
     console.log("gestionRondasDiv (dentro DOMContentLoaded):", gestionRondasDiv);
    const formularioEdicion = document.getElementById('formulario-edicion-partido');
    const equipo1InputEdit = document.getElementById('equipo1-edit');
    const equipo2InputEdit = document.getElementById('equipo2-edit');
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


 function descargarJSONModificado() {
    console.log("Archivo actual al descargar:", archivoActual);
    console.log("Contenido de partidosData al descargar:", partidosData);
    const dataParaDescargar = [{ "rondas": partidosData[archivoActual]?.rondas || [] }]; // Creamos un array con un objeto que tiene la propiedad "rondas"
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
            mostrarRondas(data);
        }
    });

    descargarJsonBtn.addEventListener('click', descargarJSONModificado);

    

    async function cargarPartidos(archivo) {
        try {
       const response = await fetch(`assets/partidos/${archivo}.json`);
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
    gestionRondasDiv.innerHTML = ''; // Limpiar el contenedor de rondas
    if (!data || !data.rondas || data.rondas.length === 0) {
        gestionRondasDiv.innerHTML = '<p>No hay rondas disponibles para este archivo.</p>';
                
        return;
    }

    const navTabs = document.createElement('ul');
    navTabs.classList.add('nav', 'nav-tabs');
    navTabs.setAttribute('role', 'tablist');
    console.log("Se creó navTabs:", navTabs);

    const tabContent = document.createElement('div');
    tabContent.classList.add('tab-content');
    console.log("Se creó tabContent:", tabContent);

    data.rondas.forEach((ronda, index) => {
        console.log(`Iterando ronda ${index}:`, ronda);
        const tabId = `ronda-${index}`;
        const isActive = index === 0;

        // Crear la pestaña (li)
        const listItem = document.createElement('li');
        listItem.classList.add('nav-item');
        listItem.setAttribute('role', 'presentation');
        console.log(`Ronda ${index}: Se creó listItem:`, listItem);

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
        console.log(`Ronda ${index}: Se creó botón:`, button);
        console.log(`Ronda ${index}: navTabs después de appendChild:`, navTabs);

        // Crear el contenido de la pestaña (div)
        const tabPane = document.createElement('div');
        tabPane.classList.add('tab-pane', 'fade');
        if (isActive) {
            tabPane.classList.add('show', 'active');
        }
        tabPane.setAttribute('id', tabId);
        tabPane.setAttribute('role', 'tabpanel');
        tabPane.setAttribute('aria-labelledby', `${tabId}-tab`);

        // Crear el contenedor de la fila para los partidos
        const partidosRow = document.createElement('div');
        partidosRow.classList.add('row', 'mt-3');

        ronda.partidos.forEach((partido, partidoIndex) => {
            // Crear el contenedor de cada partido (col-lg-4)
            const partidoCol = document.createElement('div');
            partidoCol.classList.add('col-lg-4', 'mb-3', 'partido-card'); // Añadí mb-3 para un poco de margen inferior
            partidoCol.dataset.rondaIndex = index; // Guardamos el índice de la ronda
            partidoCol.dataset.partidoIndex = partidoIndex; // Guardamos el índice del partido

            // Construir el HTML para cada partido
            partidoCol.innerHTML = `
            <div class="bracket-round-list  ">
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
         console.log(`Ronda ${index}: Se creó tabPane:`, tabPane);
    console.log(`Ronda ${index}: tabContent después de appendChild:`, tabContent);
    });

    gestionRondasDiv.appendChild(navTabs);
    gestionRondasDiv.appendChild(tabContent);
    console.log("gestionRondasDiv después de agregar navTabs:", gestionRondasDiv);
    console.log("gestionRondasDiv después de agregar tabContent:", gestionRondasDiv);


     const tarjetasPartido = document.querySelectorAll('.partido-card');
        tarjetasPartido.forEach(tarjeta => {
            tarjeta.addEventListener('click', mostrarFormularioEdicion);
        });


}

    function mostrarFormularioEdicion(event) {
    console.log('Se mostro una tarjeta de partido');
    const tarjetaPartido = event.currentTarget;
    console.log('tarjetaPartido:', tarjetaPartido);
    const rondaIndex = parseInt(tarjetaPartido.dataset.rondaIndex);
    console.log('rondaIndex:', rondaIndex);
    const partidoIndex = parseInt(tarjetaPartido.dataset.partidoIndex);
    console.log('partidoIndex:', partidoIndex);

    if (partidosData[archivoActual] && partidosData[archivoActual].rondas && partidosData[archivoActual].rondas[rondaIndex] && partidosData[archivoActual].rondas[rondaIndex].partidos && partidosData[archivoActual].rondas[rondaIndex].partidos[partidoIndex]) {
        partidoSeleccionado = partidosData[archivoActual].rondas[rondaIndex].partidos[partidoIndex];
        console.log('partidoSeleccionado:', partidoSeleccionado);

        // Precargar los datos en el formulario
        equipo1InputEdit.value = partidoSeleccionado.equipo1;
        equipo2InputEdit.value = partidoSeleccionado.equipo2;
        streamSelectEdit.value = partidoSeleccionado.stream ? 'true' : 'false';
        resultadoSelectEdit.value = partidoSeleccionado.resultado || 'VS';
        fechaInputEdit.value = partidoSeleccionado.fecha || '';
        horaInputEdit.value = partidoSeleccionado.hora === "SI" ? '21:40' : (partidoSeleccionado.hora === "NO" ? '22:20' : partidoSeleccionado.hora || '');
        logoLocalEdit.src = `/assets/logos/${partidoSeleccionado.tag1}.webp`;
        logoVisitanteEdit.src = `/assets/logos/${partidoSeleccionado.tag2}.webp`;

        formularioEdicion.style.display = 'block';
        console.log('formularioEdicion.style.display:', formularioEdicion.style.display);
    } else {
        console.error('No se pudo encontrar el partido seleccionado en los datos.');
    }
   }


    function guardarEdicionPartido() {
        if (partidoSeleccionado) {
            partidoSeleccionado.equipo1 = equipo1InputEdit.value;
            partidoSeleccionado.equipo2 = equipo2InputEdit.value;
            partidoSeleccionado.stream = streamSelectEdit.value === 'true';
            partidoSeleccionado.resultado = resultadoSelectEdit.value;
            partidoSeleccionado.fecha = fechaInputEdit.value;
            partidoSeleccionado.hora = horaInputEdit.value === '21:40' ? 'SI' : (horaInputEdit.value === '22:20' ? 'NO' : horaInputEdit.value);

            // Volver a renderizar las rondas para mostrar los cambios
            mostrarRondas(partidosData[archivoActual]);
            formularioEdicion.style.display = 'none';
            partidoSeleccionado = null;
        }
    }

    function cancelarEdicionPartido() {
        formularioEdicion.style.display = 'none';
        partidoSeleccionado = null;
    }

    archivoSelector.addEventListener('change', async (event) => {
        archivoActual = event.target.value;
        const data = await cargarPartidos(archivoActual);
        if (data) {
            mostrarRondas(data);
        }
    });

    guardarEdicionBtn.addEventListener('click', guardarEdicionPartido);
    cancelarEdicionBtn.addEventListener('click', cancelarEdicionPartido);

    // Cargar el primer archivo por defecto al cargar la página
    cargarPartidos(archivoSelector.value).then(data => {
        if (data) {
            mostrarRondas(data);
        }
    });

});