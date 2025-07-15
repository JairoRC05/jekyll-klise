document.addEventListener('DOMContentLoaded', function () {
  const streamContainer = document.getElementById('partidos-con-stream-container');
  if (!streamContainer) return;

  const archivosJson = [
    '/assets/temporadas/julio2025/psur.json',
    '/assets/temporadas/julio2025/pnorte.json'
  ];

  Promise.all(archivosJson.map(url => fetch(url).then(res => res.json())))
    .then(jsons => {
      const partidosConStream = jsons.flatMap(data => {
        const zona = data[0].zona || 'Zona desconocida';
        return data[0].rondas.flatMap(r =>
          (r.partidos || []).filter(p => p.stream === true)
            .map(p => ({ ...p, ronda: r.ronda, zona }))
        );
      });

      // Ordenar por fecha y hora
      partidosConStream.sort((a, b) => {
        const dateA = new Date(`${a.dia}T${a.hora}`);
        const dateB = new Date(`${b.dia}T${b.hora}`);
        return dateA - dateB;
      });

      if (partidosConStream.length === 0) {
        streamContainer.innerHTML = '<p class="text-muted">No hay partidos con stream disponibles.</p>';
        return;
      }

      streamContainer.innerHTML = `
        <h5 class="mb-3">Partidos Vía Stream</h5>
        ${partidosConStream.map(generarScheduleItemStream).join('')}
      `;
    })
    .catch(err => {
      console.error('Error al cargar archivos JSON de partidos con stream:', err);
      streamContainer.innerHTML = '<p class="text-danger">Error al cargar los partidos con stream.</p>';
    });

  function generarScheduleItemStream(partido) {
    const fecha = new Date(`${partido.dia}T${partido.hora}`);
    const ahora = new Date();

    const diferenciaMin = (fecha - ahora) / 60000; // Diferencia en minutos

    let estado = 'futuro';
    if (diferenciaMin < -60) {
      estado = 'pasado'; // ya terminó
    } else if (diferenciaMin >= -60 && diferenciaMin <= 15) {
      estado = 'vivo'; // está ocurriendo
    }

    let botonHTML = '';
    if (estado === 'pasado') {
      botonHTML = `<a href="https://twitch.tv/hollywoodforze" target="_blank" class="pay-button blue">Ver Repetición</a>`;
    } else if (estado === 'vivo') {
      botonHTML = `<span class="status-tag">🟢 En Curso</span>`;
    } else {
      botonHTML = `<a href="https://twitch.tv/hollywoodforze" target="_blank" class="pay-button blue">Ver Stream</a>`;
    }

    const mes = fecha.toLocaleString('default', { month: 'short' }).toUpperCase();
    const dia = fecha.getDate();

    return `
      <div class="schedule-item">
        <div class="schedule-item-date">
          <span class="month">${mes}</span>
          <span class="day green">${dia}</span>
        </div>
        <div class="schedule-item-details">
          <div class="time-and-ref">
          <span>${partido.ronda} | ${partido.hora}</span>
         
          </div>
          <div class="title">
            ${partido.equipo1} vs ${partido.equipo2} 
          </div>
          <div class="location"><i class="bi bi-twitch"></i> Hollywood Forze</div>
          <div class="payment-info">
            <div>
              <div class="total">Transmisión</div>
              <div class="amount">${estado === 'pasado' ? 'Finalizado' : estado === 'vivo' ? 'En Vivo' : 'Próximamente'}</div>
            </div>
            ${botonHTML}
          </div>
        </div>
      </div>
    `;
  }
});
