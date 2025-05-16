document.addEventListener('DOMContentLoaded', function () {
  fetch('/assets/partidos/faseFinal.json')
    .then(response => response.json())
    .then(data => {
      const rondas = data[0].rondas;

      function formatearFecha(fechaString) {
        if (!fechaString) {
          return '';
        }
        const fecha = new Date(fechaString);
        const dia = fecha.getDate();
        const opciones = { month: 'short' };
        const mes = new Intl.DateTimeFormat('es-MX', opciones).format(fecha).toUpperCase();
        return `${dia} ${mes}`;
      }



      rondas.forEach(ronda => {
        const nombreRonda = ronda.ronda;
        const partidos = ronda.partidos;

        const rondaDiv = document.createElement('div');
        rondaDiv.classList.add('tournament-bracket__round');
        rondaDiv.classList.add(`tournament-bracket__round--${nombreRonda.toLowerCase().replace(/ /g, '')}`);

        const tituloRonda = document.createElement('h3');
        tituloRonda.classList.add('tournament-bracket__round-title');
        tituloRonda.textContent = nombreRonda;
        rondaDiv.appendChild(tituloRonda);

        const listaPartidos = document.createElement('ul');
        listaPartidos.classList.add('tournament-bracket__list');

        partidos.forEach(partido => {
          const partidoLi = document.createElement('li');
          partidoLi.classList.add('tournament-bracket__item');

          const partidoDiv = document.createElement('div');
          partidoDiv.classList.add('tournament-bracket__match');
          partidoDiv.setAttribute('tabindex', '0');

          if (partido.active) {

            const bracketRoundListDiv = document.createElement('div');
            bracketRoundListDiv.classList.add('bracket-round-final');



            const construirEnlace = (equipo, org) => {
              const nombreEquipoCodificado = equipo.replace(/ /g, '%20');
              if (org) {
                return `/equipos/${org}--${nombreEquipoCodificado}`;
              } else {
                return `/equipos/${nombreEquipoCodificado}`;
              }
            };

            // Equipo 1
            const equipo1Div = document.createElement('div');
            equipo1Div.classList.add('bracket-round-team');
            const equipo1Link = document.createElement('a');
            equipo1Link.href = partido.link1 || construirEnlace(partido.equipo1, partido.org1);
            const equipo1Img = document.createElement('img');
            equipo1Img.src = `/assets/logos/${partido.tag1}.webp`;
            equipo1Img.alt = partido.equipo1;
            equipo1Img.classList.add('img-fluid');
            equipo1Link.appendChild(equipo1Img);
            equipo1Div.appendChild(equipo1Link);
            bracketRoundListDiv.appendChild(equipo1Div);

            // Contenedor de títulos
            const roundTitlesDiv = document.createElement('div');
            roundTitlesDiv.classList.add('round-titles');

            const cardRoundPromoLeft = document.createElement('div');
            cardRoundPromoLeft.classList.add('card-round-equipoLocal');
            const equipo1Titulo = document.createElement('h6');
            equipo1Titulo.classList.add('equipoLocal');
            equipo1Titulo.textContent = partido.equipo1;
            cardRoundPromoLeft.appendChild(equipo1Titulo);
            roundTitlesDiv.appendChild(cardRoundPromoLeft);

            const cardRoundPromoMid = document.createElement('div');
            cardRoundPromoMid.classList.add('card-round-promo', 'mx-1', 'text-center'); // Añadí text-center para alinear el contenido
            const llaveActivoSpan = document.createElement('span');
            llaveActivoSpan.classList.add('llave');
            llaveActivoSpan.textContent = partido.llave;
            cardRoundPromoMid.appendChild(llaveActivoSpan);

            // Mostrar la fecha si existe partido.fecha
            if (partido.fecha) {
              const fechaActivoSpan = document.createElement('span');
              fechaActivoSpan.textContent = formatearFecha(partido.fecha);
              cardRoundPromoMid.appendChild(fechaActivoSpan);
            }
            const resultadoH6 = document.createElement('h6');
            resultadoH6.textContent = partido.resultado || '';
            cardRoundPromoMid.appendChild(resultadoH6);
            // Mostrar la hora si existe partido.hora
            if (partido.hora) {
              const horaActivoSpan = document.createElement('span');
              horaActivoSpan.textContent = partido.hora;
              cardRoundPromoMid.appendChild(horaActivoSpan);
            }

            const infoAdicionalSpan = document.createElement('span');
            infoAdicionalSpan.classList.add('info'); // Puedes añadir una clase para estilizar
            infoAdicionalSpan.textContent = partido.posiciones; // Reemplaza con la propiedad que quieras mostrar
            cardRoundPromoMid.appendChild(infoAdicionalSpan);
            roundTitlesDiv.appendChild(cardRoundPromoMid);



            roundTitlesDiv.appendChild(cardRoundPromoMid);

            const cardRoundPromoRight = document.createElement('div');
            cardRoundPromoRight.classList.add('card-round-equipoVisitante');
            const equipo2Titulo = document.createElement('h6');
            equipo2Titulo.classList.add('equipoVisitante');
            equipo2Titulo.textContent = partido.equipo2;
            cardRoundPromoRight.appendChild(equipo2Titulo);
            roundTitlesDiv.appendChild(cardRoundPromoRight);

            bracketRoundListDiv.appendChild(roundTitlesDiv);

            // Equipo 2
            const equipo2Div = document.createElement('div');
            equipo2Div.classList.add('bracket-round-team-right');
            const equipo2Link = document.createElement('a');
            equipo2Link.href = partido.link2 || construirEnlace(partido.equipo2, partido.org2);
            const equipo2Img = document.createElement('img');
            equipo2Img.src = `/assets/logos/${partido.tag2}.webp`;
            equipo2Img.alt = partido.equipo2;
            equipo2Img.classList.add('img-fluid');
            equipo2Link.appendChild(equipo2Img);
            equipo2Div.appendChild(equipo2Link);
            bracketRoundListDiv.appendChild(equipo2Div);

            // Card Back
            const cardBackDiv = document.createElement('div');
            cardBackDiv.classList.add('card-back');
            const cardColorLeftDiv = document.createElement('div');
            cardColorLeftDiv.classList.add('card-color-left', partido.tag1);
            const cardColorRightDiv = document.createElement('div');
            cardColorRightDiv.classList.add('card-color-right', partido.tag2);
            cardBackDiv.appendChild(cardColorLeftDiv);
            cardBackDiv.appendChild(cardColorRightDiv);
            bracketRoundListDiv.appendChild(cardBackDiv);

            partidoDiv.appendChild(bracketRoundListDiv);


          } else {
            const cardRoundList = document.createElement('div');
            cardRoundList.classList.add('card-round-list', 'mb-0');

            const cardRoundTeam = document.createElement('div');
            cardRoundTeam.classList.add('card-round-team');
            const teamLink = document.createElement('a');
            teamLink.href = '/liga-indigo-dashboard'; // Reemplaza con el enlace correcto si es dinámico
            const teamImg = document.createElement('img');
            teamImg.src = '/assets/logos/LIGA-INDIGO.webp';
            teamImg.alt = '';
            teamImg.classList.add('img-fluid');
            teamLink.appendChild(teamImg);
            cardRoundTeam.appendChild(teamLink);

            const cardRoundTitle = document.createElement('div');
            cardRoundTitle.classList.add('card-round-title');
            const p1Element = document.createElement('p');
            p1Element.textContent = partido.p1;
            const p2Element = document.createElement('p');
            p2Element.textContent = partido.p2;
            cardRoundTitle.appendChild(p1Element);
            cardRoundTitle.appendChild(p2Element);
            cardRoundTeam.appendChild(cardRoundTitle);
            cardRoundList.appendChild(cardRoundTeam);

            const cardRoundPlace = document.createElement('div');
            cardRoundPlace.classList.add('card-round-place');
            const llaveInactivoSpan = document.createElement('span');
            llaveInactivoSpan.classList.add('llave');
            llaveInactivoSpan.textContent = partido.llave;
            const diaParrafo = document.createElement('p');
            // Utiliza la función formatearFecha si partido.fecha existe, sino usa ronda.fecha_inicio si existe, sino una cadena vacía
            diaParrafo.textContent = partido.fecha ? formatearFecha(partido.fecha) : (ronda.fecha_inicio ? formatearFecha(ronda.fecha_inicio) : '');
            const fechaParrafo = document.createElement('p');
            fechaParrafo.textContent = partido.hora ? `(${partido.hora})` : '';
            cardRoundPlace.appendChild(diaParrafo);
            cardRoundPlace.appendChild(fechaParrafo);
            cardRoundList.appendChild(cardRoundPlace);

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back', 'bg-cham');
            const cardColorLeft = document.createElement('div');
            cardColorLeft.classList.add('card-color-left');
            cardBack.appendChild(cardColorLeft);
            cardRoundList.appendChild(cardBack);

            partidoDiv.appendChild(cardRoundList);
          }

          partidoLi.appendChild(partidoDiv);
          listaPartidos.appendChild(partidoLi);
        });

        rondaDiv.appendChild(listaPartidos);

        const bracketContainer = document.querySelector('.tournament-bracket');
        bracketContainer.appendChild(rondaDiv);
      });
    })
    .catch(error => console.error('Error al cargar el JSON:', error));
});