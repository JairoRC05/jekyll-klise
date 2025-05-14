document.addEventListener('DOMContentLoaded', function() {
  const tabsContainer = document.getElementById('pills-tab');
  const contentContainer = document.getElementById('rondas-league-container');
  const rondaEspecialContainer = document.getElementById('rondaEspecial');

  function setActiveTabByDate(rondas) {
    const today = new Date();
    let activeTabIndex = 0; // Por defecto, la primera pestaña

    for (let i = 0; i < rondas.length; i++) {
      const fechaInicioStr = rondas[i].fecha_inicio;
      const fechaFinStr = rondas[i].fecha_fin;

      if (fechaInicioStr && fechaFinStr) {
        const fechaInicio = new Date(fechaInicioStr);
        const fechaFin = new Date(fechaFinStr);

        // Ajustar las fechas al inicio del día para comparaciones precisas
        today.setHours(0, 0, 0, 0);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(23, 59, 59, 999); // Incluir todo el día de fin

        if (today >= fechaInicio && today <= fechaFin) {
          activeTabIndex = i;
          break;
        } else if (fechaFin < today) {
          activeTabIndex = i; // Mantener la última ronda pasada como activa
        }
      } else if (rondas[i].fecha) { // Si aún tienes una propiedad 'fecha' para un solo día
        const fechaUnica = new Date(rondas[i].fecha);
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
      contentContainer.innerHTML = generarContenidoRonda(rondas[activeTabIndex]); // Asegúrate que generarContenidoRonda esté en utils.js
    }
  }

  fetch('/assets/partidos/pnorte.json')
    .then(response => response.json())
    .then(data => {
      const rondas = data[0].rondas.slice(0, 11);
      rondas.forEach((ronda, index) => {
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
        button.setAttribute('aria-selected', false); // Inicialmente todas no seleccionadas
        button.textContent = ronda.ronda.replace('RONDA ', '');

        button.addEventListener('click', () => {
          contentContainer.innerHTML = generarContenidoRonda(ronda); // Asegúrate que generarContenidoRonda esté en utils.js
          const pillEl = document.querySelector(`#pills-${index + 1}-tab`);
          if (pillEl) {
            const pill = new bootstrap.Tab(pillEl);
            pill.show();
          }
        });

        listItem.appendChild(button);
        tabsContainer.appendChild(listItem);
      });

      setActiveTabByDate(data[0].rondas.slice(0, 11));

      cargarRondaHoopa(rondaEspecialContainer); // Asegúrate que cargarRondaHoopa esté en utils.js
    })
    .catch(error => {
      console.error('Error al cargar pnorte.json:', error);
    });
});