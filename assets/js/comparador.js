document.addEventListener('DOMContentLoaded', function () {
    const select1 = document.getElementById('equipo1-select');
    const select2 = document.getElementById('equipo2-select');
    const btnComparar = document.getElementById('comparar-btn');
    const resultadoDiv = document.getElementById('resultado-comparacion');

    let equipos = [];

    // Cargar equipos desde JSON
    fetch('/assets/temporadas/sep2025/equipos.json')
        .then(response => response.json())
        .then(data => {
            equipos = data;

            // Llenar selects
            equipos.forEach(eq => {
                const opt1 = new Option(`${eq.equipo} (${eq.categoria.toUpperCase()})`, eq.tag);
                const opt2 = new Option(`${eq.equipo} (${eq.categoria.toUpperCase()})`, eq.tag);
                select1.appendChild(opt1);
                select2.appendChild(opt2);
            });
        })
        .catch(err => {
            console.error('Error al cargar equipos.json:', err);
            resultadoDiv.innerHTML = '<p>Error cargando datos de equipos.</p>';
        });

    // Función para obtener equipo por tag
    const getEquipo = (tag) => equipos.find(e => e.tag === tag);

    // Función para comparar
    const compararEquipos = (eq1, eq2) => {
        if (!eq1 || !eq2) return null;

        const categoriaOrden = { oro: 4, platino: 3, plata: 2, bronce: 1 };

        const cat1 = categoriaOrden[eq1.categoria];
        const cat2 = categoriaOrden[eq2.categoria];

        if (cat1 > cat2) {
            return { ganador: eq1, motivo: `Superioridad de categoría: ${eq1.categoria.toUpperCase()} > ${eq2.categoria.toUpperCase()}` };
        } else if (cat2 > cat1) {
            return { ganador: eq2, motivo: `Superioridad de categoría: ${eq2.categoria.toUpperCase()} > ${eq1.categoria.toUpperCase()}` };
        } else {
            // Misma categoría → comparar por peso
            if (eq1.peso_equipo > eq2.peso_equipo) {
                return { ganador: eq1, motivo: `Más peso en misma categoría (${eq1.peso_equipo} > ${eq2.peso_equipo})` };
            } else if (eq2.peso_equipo > eq1.peso_equipo) {
                return { ganador: eq2, motivo: `Más peso en misma categoría (${eq2.peso_equipo} > ${eq1.peso_equipo})` };
            } else {
                return { ganador: null, motivo: `Empate técnico: misma categoría y peso.` };
            }
        }
    };

    // Evento del botón
    btnComparar.addEventListener('click', () => {
        const tag1 = select1.value;
        const tag2 = select2.value;

        if (!tag1 || !tag2) {
            resultadoDiv.innerHTML = '<div class="alert alert-warning">Selecciona ambos equipos.</div>';
            return;
        }

        if (tag1 === tag2) {
            resultadoDiv.innerHTML = '<div class="alert alert-info">No puedes comparar un equipo consigo mismo.</div>';
            return;
        }

        const eq1 = getEquipo(tag1);
        const eq2 = getEquipo(tag2);

        const resultado = compararEquipos(eq1, eq2);

        if (!resultado) {
            resultadoDiv.innerHTML = '<p>Error en la comparación.</p>';
            return;
        }

        const { ganador, motivo } = resultado;

        resultadoDiv.innerHTML = `
            <div class="card border-${ganador ? 'success' : 'warning'}">
                <div class="card-body">
                    <h5 class="card-title">Resultado de la comparación</h5>
                    <div class="row">
                        <div class="col-5 text-center">
                            <img src="/assets/logos/${eq1.tag}.webp" alt="${eq1.equipo}" class="img-fluid rounded" style="max-height: 60px;">
                            <p class="mb-0 mt-2"><strong>${eq1.equipo}</strong><br>
                            <small>${eq1.categoria.toUpperCase()} | Peso: ${eq1.peso_equipo}</small></p>
                        </div>
                        <div class="col-2 d-flex align-items-center justify-content-center">
                            <span class="h3">🆚</span>
                        </div>
                        <div class="col-5 text-center">
                            <img src="/assets/logos/${eq2.tag}.webp" alt="${eq2.equipo}" class="img-fluid rounded" style="max-height: 60px;">
                            <p class="mb-0 mt-2"><strong>${eq2.equipo}</strong><br>
                            <small>${eq2.categoria.toUpperCase()} | Peso: ${eq2.peso_equipo}</small></p>
                        </div>
                    </div>
                    <hr>
                    <p><strong>Ganador:</strong> 
                        ${ganador 
                            ? `<span class="text-success">${ganador.equipo}</span>` 
                            : '<span class="text-warning">Empate</span>'
                        }
                    </p>
                    <p><strong>Motivo:</strong> ${motivo}</p>
                </div>
            </div>
        `;
    });
});