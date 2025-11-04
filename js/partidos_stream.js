document.addEventListener('DOMContentLoaded', function () {
  const streamContainer = document.getElementById('partidos-con-stream-container');
  if (!streamContainer) return;

  const archivosJson = [
    '/assets/temporadas/actual/calendario.json'
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
        
        ${partidosConStream.map(generarScheduleItemStream).join('')}
      `;

      setTimeout(() => {
        const partidoHoy = document.getElementById('partido-hoy');
        if (partidoHoy) {
          if (window.innerWidth >= 768) {
         
            partidoHoy.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
         
          partidoHoy.classList.add('partido-hoy');
        }
      }, 100);



    })
    .catch(err => {
      console.error('Error al cargar archivos JSON de partidos con stream:', err);
      streamContainer.innerHTML = '<p class="text-danger">Error al cargar los partidos con stream.</p>';
    });


  let partidoHoyAsignado = false;

  function generarScheduleItemStream(partido) {
    const fecha = new Date(`${partido.dia}T${partido.hora}`);
    const ahora = new Date();

    const esHoy = fecha.toDateString() === ahora.toDateString();

    const diferenciaMin = (fecha - ahora) / 60000;
    let estado = 'futuro';
    if (diferenciaMin < -60) {
      estado = 'pasado'; // ya terminó
    } else if (diferenciaMin >= -60 && diferenciaMin <= 15) {
      estado = 'vivo'; // está ocurriendo
    }

    let botonHTML = '';
    if (estado === 'pasado') {
      botonHTML = `<a href="https://www.twitch.tv/nacion_unite" target="_blank" class="pay-button blue">Ver Repetición</a>`;
    } else if (estado === 'vivo') {
      botonHTML = `<span class="status-tag">🟢 En Curso</span>`;
    } else {
      botonHTML = `<a href="https://www.twitch.tv/nacion_unite" target="_blank" class="pay-button blue">Ver Stream</a>`;
    }

    const mes = fecha.toLocaleString('default', { month: 'short' }).toUpperCase();
    const dia = fecha.getDate();
    const claseEstado = estado === 'pasado' ? 'pasado' : estado === 'vivo' ? 'vivo' : 'futuro';
    const idHTML = esHoy && !partidoHoyAsignado ? 'id="partido-hoy"' : '';
    if (esHoy && !partidoHoyAsignado) partidoHoyAsignado = true;

    return `
       <div>
            <div class="amount">Transmisión ${estado === 'pasado' ? 'Finalizada' : estado === 'vivo' ? 'En Vivo' : 'Próximamente'}</div>
        </div>
      <div class="schedule-item ${claseEstado}"  ${idHTML}>
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
          <div class="location"><i class="bi bi-twitch"></i> Nacion Unite</div>
          <div class="payment-info">
           
            ${botonHTML}
          </div>
        </div>
      </div>
    `;
  }
});
