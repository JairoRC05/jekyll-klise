document.addEventListener('DOMContentLoaded', function() {
  fetch('/assets/partidos/faseFinal.json')
    .then(response => response.json())
    .then(data => {
      const rondas = data[0].rondas;

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
            // Mostrar la información del partido
            const bracketKey = document.createElement('div');
            bracketKey.classList.add('bracket-key');
            const llaveSpan = document.createElement('span');
            llaveSpan.textContent = partido.llave;
            bracketKey.appendChild(llaveSpan);
            partidoDiv.appendChild(bracketKey);

            const bracketRoundList = document.createElement('div');
            bracketRoundList.classList.add('bracket-round-list');

            // Equipo 1
            const equipo1Div = document.createElement('div');
            equipo1Div.classList.add('bracket-round-team');
            const equipo1Link = document.createElement('a');
            equipo1Link.href = '/link'; // Reemplaza con el enlace correcto
            const equipo1Img = document.createElement('img');
            equipo1Img.src = `/assets/logos/${partido.tag1}.webp`;
            equipo1Img.alt = partido.equipo1;
            equipo1Img.classList.add('img-fluid');
            equipo1Link.appendChild(equipo1Img);
            equipo1Div.appendChild(equipo1Link);
            bracketRoundList.appendChild(equipo1Div);

            const cardRoundPromo = document.createElement('div');
            cardRoundPromo.classList.add('card-round-promo');
            const fechaSpan = document.createElement('span');
            fechaSpan.textContent = ronda.fecha_inicio || partido.fecha;
            const nombresEquipos = document.createElement('h6');
            nombresEquipos.textContent = `${partido.equipo1} vs ${partido.equipo2}`;
            const horaSpan = document.createElement('span');
            horaSpan.textContent = ronda.hora || partido.hora;
            cardRoundPromo.appendChild(fechaSpan);
            cardRoundPromo.appendChild(nombresEquipos);
            cardRoundPromo.appendChild(horaSpan);
            bracketRoundList.appendChild(cardRoundPromo);

            // Equipo 2
            const equipo2Div = document.createElement('div');
            equipo2Div.classList.add('bracket-round-team-right');
            const equipo2Link = document.createElement('a');
            equipo2Link.href = '/link'; // Reemplaza con el enlace correcto
            const equipo2Img = document.createElement('img');
            equipo2Img.src = `/assets/logos/${partido.tag2}.webp`;
            equipo2Img.alt = partido.equipo2;
            equipo2Img.classList.add('img-fluid');
            equipo2Link.appendChild(equipo2Img);
            equipo2Div.appendChild(equipo2Link);
            bracketRoundList.appendChild(equipo2Div);

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');
            const cardColorLeft = document.createElement('div');
            cardColorLeft.classList.add('card-color-left', `(${partido.tag1})`);
            const cardColorRight = document.createElement('div');
            cardColorRight.classList.add('card-color-right', `(${partido.tag2})`);
            cardBack.appendChild(cardColorLeft);
            cardBack.appendChild(cardColorRight);
            bracketRoundList.appendChild(cardBack);

            partidoDiv.appendChild(bracketRoundList);

            if (partido.stream) {
              const bracketStream = document.createElement('div');
              bracketStream.classList.add('bracket-stream');
              const streamSpan = document.createElement('span');
              streamSpan.textContent = 'STREAM';
              bracketStream.appendChild(streamSpan);
              partidoDiv.appendChild(bracketStream);
            }
          } else {
            // Mostrar la tarjeta informativa
            const cardRoundList = document.createElement('div');
            cardRoundList.classList.add('card-round-list', 'mb-0');

            const cardRoundTeam = document.createElement('div');
            cardRoundTeam.classList.add('card-round-team');
            const teamLink = document.createElement('a');
            teamLink.href = '/liga-indigo-dashboard'; // Reemplaza con el enlace correcto
            const teamImg = document.createElement('img');
            teamImg.src = '/assets/logos/LIGA-INDIGO.webp';
            teamImg.alt = ''; // Puedes agregar un texto alternativo si es necesario
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
            const diaParrafo = document.createElement('p');
            diaParrafo.textContent = ''; // Agrega la lógica para el día si lo tienes
            const fechaParrafo = document.createElement('p');
            fechaParrafo.textContent = ronda.fecha_inicio; // Puedes usar otra propiedad si es necesario
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