// utils_admin.js

let equiposPorTag = {};

async function cargarEquiposConGrupos(rutaTemporada) {
    const res = await fetch(`${rutaTemporada}/equipos-index.json`);
    const archivos = await res.json();

    const promesas = archivos.map(async nombre => {
        const r = await fetch(`${rutaTemporada}/${nombre}`);
        const d = await r.json();
        return { tag: d.tag, grupo: d.grupo };
    });

    const lista = await Promise.all(promesas);
    const map = {};
    lista.forEach(e => { if (e.tag) map[e.tag] = e.grupo; });
    equiposPorTag = map;
    return map;
}

function obtenerGrupoPartido(tag1, tag2) {
    const g1 = equiposPorTag[tag1];
    const g2 = equiposPorTag[tag2];
    if (!g1 || !g2) return null;
    if (g1 !== g2) return "CRUZADO";
    return g1;
}

function filtrarPartidosPorGrupo(rondas, grupoObjetivo) {
    return rondas.map(ronda => ({
        ...ronda,
        partidos: ronda.partidos.filter(p => {
            if (p.tag1 === "BYE" || p.tag2 === "BYE") return false;
            return obtenerGrupoPartido(p.tag1, p.tag2) === grupoObjetivo;
        })
    })).filter(r => r.partidos.length > 0);
}

function renderizarRondas(rondas, contenedor) {
    contenedor.innerHTML = '';

    rondas.forEach(ronda => {
        const card = document.createElement('div');
        card.classList.add('card', 'mb-3');

        const body = document.createElement('div');
        body.classList.add('card-body');

        const title = document.createElement('h5');
        title.classList.add('card-title');
        title.textContent = ronda.ronda;
        body.appendChild(title);

        const table = document.createElement('table');
        table.classList.add('table', 'table-sm');

        const thead = document.createElement('thead');
        thead.innerHTML = `
          <tr>
            <th>Eq1</th><th></th><th>Res</th><th></th><th>Eq2</th>
          </tr>`;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        ronda.partidos.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${p.equipo1}</td>
              <td><img src="/assets/logos/${p.tag1}.webp" width="30"></td>
              <td>
                <input type="text" value="${p.resultado}" 
                       data-match="${p.match_number}" 
                       class="form-control form-control-sm resultado-input"
                       placeholder="3-0">
              </td>
              <td><img src="/assets/logos/${p.tag2}.webp" width="30"></td>
              <td>${p.equipo2}</td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        body.appendChild(table);
        card.appendChild(body);
        contenedor.appendChild(card);
    });
}

// Guardar cambios
document.getElementById?.('guardar-cambios')?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.resultado-input');
    const nuevoCalendario = JSON.parse(JSON.stringify(window.calendarioOriginal));

    inputs.forEach(input => {
        const matchNum = input.dataset.match;
        const nuevoResultado = input.value.trim();

        for (const ronda of nuevoCalendario[0].rondas) {
            const partido = ronda.partidos.find(p => p.match_number == matchNum);
            if (partido) partido.resultado = nuevoResultado;
        }
    });

    const blob = new Blob([JSON.stringify(nuevoCalendario, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendario.json';
    a.click();
    URL.revokeObjectURL(url);
    alert("✅ Archivo guardado. Sube 'calendario.json' al servidor.");
});

// Calcular ranking combinado
async function calcularRankingPorGrupos(rutaTemporada) {
    equiposPorTag = await cargarEquiposConGrupos(rutaTemporada);

    const res = await fetch(`${rutaTemporada}/calendario.json`);
    const data = await res.json();
    const rondas = data[0]?.rondas || [];

    const puntos = { NORTH: {}, SOUTH: {} };

    for (const ronda of rondas) {
        for (const p of ronda.partidos) {
            if (p.tag1 === "BYE" || p.tag2 === "BYE") continue;
            const grupo = obtenerGrupoPartido(p.tag1, p.tag2);
            if (!grupo || grupo === "CRUZADO") continue;
            if (!p.resultado.includes('-')) continue;

            const [p1, p2] = p.resultado.split('-').map(Number);
            puntos[grupo][p.tag1] = (puntos[grupo][p.tag1] || 0) + (isNaN(p1) ? 0 : p1);
            puntos[grupo][p.tag2] = (puntos[grupo][p.tag2] || 0) + (isNaN(p2) ? 0 : p2);
        }
    }

    const indexRes = await fetch(`${rutaTemporada}/equipos-index.json`);
    const archivos = await indexRes.json();

    const equiposData = [];
    for (const nombre of archivos) {
        const r = await fetch(`${rutaTemporada}/${nombre}`);
        const data = await r.json();
        if (!data.tag) return;

        const suma = puntos[data.grupo]?.[data.tag] || 0;
        equiposData.push({ ...data, suma });
    }

    const north = equiposData.filter(e => e.grupo === "NORTH")
                             .sort((a,b) => b.suma - a.suma);
    const south = equiposData.filter(e => e.grupo === "SOUTH")
                             .sort((a,b) => b.suma - a.suma);

    return { north, south };
}