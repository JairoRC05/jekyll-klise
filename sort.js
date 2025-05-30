document.addEventListener('DOMContentLoaded', () => {
    // Función auxiliar para obtener la ruta del logo
    const getLogoPath = (tag) => {
        if (!tag || tag.trim() === '') {
            return 'assets/logos/default.webp'; // Logo por defecto si no hay tag
        }
        return `assets/logos/${tag.toUpperCase()}.webp`;
    };

    // Array inicial de equipos. ¡Ahora está vacío por defecto!
    let teams = []; // CAMBIO AQUÍ

    // availableTeams contendrá solo los equipos que aún no han sido sorteados en la ronda actual.
    // Se inicializa como una copia de 'teams'.
    let availableTeams = [...teams];
    const winners = []; // Lista de equipos ganadores

    // Elementos del DOM para el sorteo
    const carouselInner = document.getElementById('carouselInner');
    const drawButton = document.getElementById('drawButton');
    const resetButton = document.getElementById('resetButton');
    const currentWinnerDisplay = document.getElementById('currentWinner');
    const winnersList = document.getElementById('winnersList');

    // Elementos del DOM para la gestión de equipos
    const newTeamNameInput = document.getElementById('newTeamName');
    const newTeamTagInput = document.getElementById('newTeamTag');
    const addTeamButton = document.getElementById('addTeamButton');
    const currentTeamsList = document.getElementById('currentTeamsList');

    let bootstrapCarousel; // Variable para la instancia del carrusel de Bootstrap

    // Función para renderizar los equipos en el carrusel
    function renderTeamsInCarousel() {
        carouselInner.innerHTML = ''; // Limpiar carrusel
        if (availableTeams.length === 0) {
            carouselInner.classList.add('no-teams');
            carouselInner.innerHTML = '<div class="text-center p-5">¡No hay equipos para sortear! Añade algunos en la sección de gestión.</div>';
            drawButton.disabled = true;
            return;
        } else {
            carouselInner.classList.remove('no-teams');
            drawButton.disabled = false;
        }

        availableTeams.forEach((team, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');
            if (index === 0) {
                carouselItem.classList.add('active'); // El primer elemento es activo por defecto
            }

            const logoSrc = getLogoPath(team.tag);

            carouselItem.innerHTML = `
                <img src="${logoSrc}" class="d-block mx-auto team-logo" alt="${team.name} Logo" onerror="this.onerror=null;this.src='assets/logos/default.webp';">
                <p class="team-name">${team.name}</p>
            `;
            carouselInner.appendChild(carouselItem);
        });

        // Reiniciar la instancia del carrusel de Bootstrap después de actualizar los items
        if (bootstrapCarousel) {
            bootstrapCarousel.dispose(); // Eliminar la instancia anterior
        }
        bootstrapCarousel = new bootstrap.Carousel(document.getElementById('teamCarousel'), {
            interval: 3000, // Intervalo de tiempo para el carrusel automático
            wrap: true // Permite que el carrusel se repita
        });
    }

    // Función para renderizar la lista de ganadores
    function renderWinners() {
        winnersList.innerHTML = ''; // Limpiar la lista de ganadores
        if (winners.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.classList.add('list-group-item', 'text-muted');
            emptyItem.textContent = 'Ningún equipo ha sido sorteado aún.';
            winnersList.appendChild(emptyItem);
        } else {
            winners.forEach((winner, index) => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item', 'd-flex', 'align-items-center');
                const logoSrc = getLogoPath(winner.tag);
                listItem.innerHTML = `
                    <strong>${index + 1}.</strong> ${winner.name}
                    <img src="${logoSrc}" alt="Logo de ${winner.name}" class="ms-2" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;" onerror="this.onerror=null;this.src='assets/logos/default.webp';">
                `;
                winnersList.appendChild(listItem);
            });
        }
    }

    // Función para renderizar la lista de equipos en la sección de gestión
    function renderCurrentTeamsList() {
        currentTeamsList.innerHTML = ''; // Limpiar la lista
        if (teams.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.classList.add('list-group-item', 'text-muted');
            emptyItem.textContent = 'No hay equipos registrados. ¡Añade algunos!';
            currentTeamsList.appendChild(emptyItem);
        } else {
            teams.forEach(team => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                const logoSrc = getLogoPath(team.tag);

                listItem.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${logoSrc}" alt="Logo de ${team.name}" class="me-2" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;" onerror="this.onerror=null;this.src='assets/logos/default.webp';">
                        <span>${team.name} ${team.tag ? `(${team.tag})` : ''}</span>
                    </div>
                    <button class="btn btn-danger btn-sm remove-team-btn" data-team-name="${team.name}">Eliminar</button>
                `;
                currentTeamsList.appendChild(listItem);
            });

            // Añadir event listeners a los botones de eliminar
            document.querySelectorAll('.remove-team-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const teamNameToRemove = event.target.dataset.teamName;
                    removeTeam(teamNameToRemove);
                });
            });
        }
    }

    // Función para añadir un nuevo equipo
    addTeamButton.addEventListener('click', () => {
        const newName = newTeamNameInput.value.trim();
        const newTag = newTeamTagInput.value.trim().toUpperCase(); // Aseguramos que el tag sea mayúsculas

        if (newName === '') {
            alert('Por favor, ingresa el nombre del equipo.');
            return;
        }

        // Verificar si el equipo ya existe (por nombre)
        const teamExists = teams.some(team => team.name.toLowerCase() === newName.toLowerCase());
        if (teamExists) {
            alert('Este equipo ya existe en la lista.');
            return;
        }

        const newTeam = { name: newName, tag: newTag }; // Almacenamos el tag
        teams.push(newTeam); // Añadir al array maestro
        availableTeams.push(newTeam); // Añadir también a los disponibles para la ronda actual

        newTeamNameInput.value = ''; // Limpiar el input
        newTeamTagInput.value = ''; // Limpiar el input del tag

        // Volver a renderizar todas las listas y el carrusel
        renderCurrentTeamsList();
        renderTeamsInCarousel();
        drawButton.disabled = availableTeams.length === 0; // Habilitar/deshabilitar botón de sorteo
    });

    // Función para eliminar un equipo
    function removeTeam(nameToRemove) {
        // Filtrar el array maestro de equipos
        teams = teams.filter(team => team.name !== nameToRemove);
        // Filtrar también los equipos disponibles para el sorteo actual
        availableTeams = availableTeams.filter(team => team.name !== nameToRemove);

        // Volver a renderizar todas las listas y el carrusel
        renderCurrentTeamsList();
        renderTeamsInCarousel();
        drawButton.disabled = availableTeams.length === 0; // Habilitar/deshabilitar botón de sorteo
    }


    // Función para realizar el sorteo
    drawButton.addEventListener('click', () => {
        if (availableTeams.length === 0) {
            currentWinnerDisplay.textContent = "¡Todos los equipos han sido sorteados!"; // O "No hay equipos para sortear" si se sortea el último
            drawButton.disabled = true;
            return;
        }

        drawButton.disabled = true; // Deshabilitar botón durante el sorteo
        currentWinnerDisplay.textContent = "Seleccionando ganador...";

        // Simular un "giro" rápido del carrusel antes de detenerse
        const spinDuration = 2000; // 2 segundos de "giro"
        const spinInterval = 100; // Intervalo para cambiar de slide
        let spinCount = 0;

        const intervalId = setInterval(() => {
            // Solo intentar mover el carrusel si hay más de 1 equipo
            if (availableTeams.length > 1) {
                bootstrapCarousel.next();
            }
            spinCount++;
            if (spinCount * spinInterval >= spinDuration) {
                clearInterval(intervalId); // Detener el "giro"

                // Seleccionar un ganador aleatorio
                const randomIndex = Math.floor(Math.random() * availableTeams.length);
                const winner = availableTeams[randomIndex];

                // Mover el carrusel al ganador seleccionado
                const winnerIndexInCarousel = availableTeams.indexOf(winner);
                if (winnerIndexInCarousel !== -1 && availableTeams.length > 1) {
                    bootstrapCarousel.to(winnerIndexInCarousel);
                }


                setTimeout(() => {
                    const logoSrc = getLogoPath(winner.tag);
                    currentWinnerDisplay.innerHTML = `¡Felicidades, ${winner.name}! <img src="${logoSrc}" alt="Logo de ${winner.name}" style="width: 40px; height: 40px; border-radius: 50%; margin-left: 10px; object-fit: cover;" onerror="this.onerror=null;this.src='assets/logos/default.webp';">`;

                    winners.push(winner); // Añadir a la lista de ganadores
                    availableTeams.splice(randomIndex, 1); // Quitar del array de equipos disponibles

                    renderWinners(); // Actualizar la lista de ganadores
                    renderTeamsInCarousel(); // Volver a renderizar el carrusel sin el equipo ganador

                    drawButton.disabled = false; // Habilitar botón de nuevo
                    resetButton.style.display = 'inline-block'; // Mostrar botón de reinicio
                }, 1000); // Pequeña pausa después de que el carrusel se detenga
            }
        }, spinInterval);
    });

    // Función para reiniciar el sorteo
    resetButton.addEventListener('click', () => {
        availableTeams = [...teams]; // Restaurar equipos originales del array maestro
        winners.length = 0; // Vaciar la lista de ganadores

        renderTeamsInCarousel();
        renderWinners();
        renderCurrentTeamsList(); // También refrescar la lista de gestión

        currentWinnerDisplay.textContent = "Aún no hay ganador.";
        // El botón de sorteo se habilita/deshabilita en renderTeamsInCarousel
        // drawButton.disabled = false; // Esta línea ya no es estrictamente necesaria aquí
        resetButton.style.display = 'none'; // Ocultar botón de reinicio
    });

    // Inicializar el carrusel, la lista de ganadores y la lista de gestión al cargar la página
    renderTeamsInCarousel();
    renderWinners();
    renderCurrentTeamsList();
});