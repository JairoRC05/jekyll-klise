
  // Obtén los datos de usuarios desde Liquid
  const usuarios = {{ site.data.usuarios | jsonify }};

  document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Usuario ingresado:', username);
    console.log('Contraseña ingresada:', password);
    console.log('Datos de usuarios:', usuarios);

    if (usuarios.usuarios[username] && usuarios.usuarios[username].contrasena === password) {
      console.log('Contraseña almacenada:', usuarios.usuarios[username].contrasena); // Acceso correcto

      if (validarHorario()) {
        document.getElementById('info-equipo').style.display = 'block';
        document.getElementById('login-form').style.display = 'none';
        cargarInfoEquipo('_data/' + usuarios.usuarios[username].equipo + '.yml'); // Carga el archivo YAML del equipo
      } else {
        document.getElementById('mensaje-error').textContent = 'El registro solo está disponible de 2 PM a 5 AM (Ciudad de México).';
      }
    } else {
      document.getElementById('mensaje-error').textContent = 'Usuario o contraseña incorrectos.';
    }
  });

  function validarHorario() {
  const ahora = new Date();
  const zonaHorariaCDMX = 'America/Mexico_City';
  const opciones = {
    timeZone: zonaHorariaCDMX,
    hour: 'numeric',
    minute: 'numeric',
  };
  const horaCDMX = new Intl.DateTimeFormat('es-MX', opciones).format(ahora);
  const [hora, minutos] = horaCDMX.split(':').map(Number);

  // 2 PM a 5 AM
  return (hora >= 14 && hora <= 23) || (hora >= 0 && hora < 5);
}

function cargarInfoEquipo(archivoYAML) {
  console.log('Cargando archivo YAML:', archivoYAML); // Agrega esta línea

  fetch(archivoYAML)
    .then(response => {
      console.log('Respuesta de fetch:', response); // Agrega esta línea
      return response.text();
    })
    .then(yaml => {
      console.log('Contenido YAML:', yaml); // Agrega esta línea

      const equipo = jsyaml.load(yaml);
      console.log('Datos del equipo:', equipo); // Agrega esta línea

      document.getElementById('nombre-equipo').textContent = equipo.team;

      const jugadoresDiv = document.getElementById('jugadores');
      jugadoresDiv.innerHTML = '';

      equipo.jugadores.forEach(jugador => {
        const jugadorDiv = document.createElement('div');
        jugadorDiv.innerHTML = `
          <input type="text" value="${jugador.nickname}">
          <input type="text" value="${jugador.ID}">
          <select>
            <option value="modificacion">Modificación</option>
            <option value="baja">Baja</option>
          </select>
        `;
        jugadoresDiv.appendChild(jugadorDiv);
      });
    });
}

   document.getElementById('alta-jugador').addEventListener('click', () => {
    const jugadorDiv = document.createElement('div');
    jugadorDiv.innerHTML = `
      <input type="text" placeholder="Nickname">
      <input type="text" placeholder="ID">
      <input type="text" value="ALTA" readonly>
    `;
    document.getElementById('jugadores').appendChild(jugadorDiv);
  });
  
  document.getElementById('enviar-correo').addEventListener('click', () => {
    enviarCorreo();
  });

  function enviarCorreo() {
    const jugadores = [];
    const jugadorDivs = document.getElementById('jugadores').children;

    for (let i = 0; i < jugadorDivs.length; i++) {
      const inputs = jugadorDivs[i].querySelectorAll('input');
      const select = jugadorDivs[i].querySelector('select');

      jugadores.push({
        nickname: inputs[0].value,
        id: inputs[1].value,
        tipo: select ? select.value : 'alta', // Si no hay select, asume "alta"
      });
    }

    fetch('https://formspree.io/f/tu_identificador_de_formulario', { // Reemplaza con tu identificador de formulario
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jugadores),
    })
      .then(response => response.text())
      .then(mensaje => alert(mensaje));
  }
  

