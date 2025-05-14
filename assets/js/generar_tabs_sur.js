document.addEventListener('DOMContentLoaded', function() {
  const tabsContainerSur = document.getElementById('pills-tab-sur');
  const contentContainerSur = document.getElementById('rondas-league-container-sur');
  const rondaEspecialContainerSur = document.getElementById('rondaEspecial-sur');

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

    const tabIdToActivate = `pills-sur-${activeTabIndex + 1}-tab`; // ¡CORRECCIÓN AQUÍ!
    const tabElement = document.getElementById(tabIdToActivate);
    if (tabElement) {
      const tab = new bootstrap.Tab(tabElement);
      tab.show();
      contentContainerSur.innerHTML = generarContenidoRonda(rondas[activeTabIndex]); // Asegúrate que generarContenidoRonda esté en utils.js
    }
  }

  fetch('/assets/partidos/psur.json')
    .then(response => response.json())
    .then(data => {
      generarTabs(data[0].rondas.slice(0, 11), tabsContainerSur, contentContainerSur, 'pills-sur-');
      if (data[0].rondas.length > 0) {
        contentContainerSur.innerHTML = generarContenidoRonda(data[0].rondas[0]);
        const firstTabEl = document.querySelector('#pills-sur-1-tab');
        if (firstTabEl) {
          new bootstrap.Tab(firstTabEl).show();
        }
      }

       setActiveTabByDate(data[0].rondas.slice(0, 11));
      cargarRondaHoopa(rondaEspecialContainerSur);
    })
    .catch(error => console.error('Error al cargar psur.json:', error));
});

function generarTabs(rondas, container, contentContainer, prefix) {
  rondas.forEach((ronda, index) => {
    const listItem = document.createElement('li');
    listItem.classList.add('nav-item');
    listItem.setAttribute('role', 'presentation');

    const button = document.createElement('button');
    button.classList.add('nav-link');
    button.setAttribute('id', `${prefix}${index + 1}-tab`);
    button.setAttribute('data-bs-toggle', 'pill');
    button.setAttribute('data-bs-target', `#${prefix}${index + 1}`);
    button.setAttribute('type', 'button');
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `${prefix}${index + 1}`);
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    button.textContent = ronda.ronda.replace('RONDA ', '');

    button.addEventListener('click', () => {
      contentContainer.innerHTML = generarContenidoRonda(ronda);
      const pillEl = document.querySelector(`#${prefix}${index + 1}-tab`);
      if (pillEl) {
        new bootstrap.Tab(pillEl).show();
      }
    });

    listItem.appendChild(button);
    container.appendChild(listItem);
  });
}