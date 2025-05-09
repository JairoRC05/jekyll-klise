document.addEventListener('DOMContentLoaded', () => {
    const equiposContainer = document.getElementById('equipos-container');
    const tierSS = document.getElementById('tier-ss');
    const tierS = document.getElementById('tier-s');
    const tierAA = document.getElementById('tier-aa');
    const tierA = document.getElementById('tier-a');
    const tierB = document.getElementById('tier-b');
    const tierC = document.getElementById('tier-c');
    const tierD = document.getElementById('tier-d');
    const tierF = document.getElementById('tier-f');
    const tierLists = [equiposContainer, tierSS, tierS, tierA, tierAA, tierB, tierC, tierD, tierF];

    const equiposData = [
        { tag: 'STMN', nombre: 'STAMINA' },
        { tag: 'AD', nombre: 'AD GAMING' },
        { tag: 'SPACE', nombre: 'SPACE VAL' },
        { tag: 'NEK', nombre: 'NEKOMA' },
        { tag: 'PLAGA', nombre: 'HOENN PLAGA' },
        { tag: 'RNTX', nombre: 'RNT XAPULOVERS' },
        { tag: 'TAE', nombre: 'TEAM AETHER' },
        { tag: 'TAD', nombre: 'TAQUITOS CAMPECHANOS' },
        { tag: 'SL', nombre: 'SANTOS LAGUNA' },
        { tag: 'ENIGMA', nombre: 'SPC ENIGMA' },
        { tag: 'DTY', nombre: 'DINASTY' },
        { tag: 'ZC', nombre: 'ZIQS CARMA' },
        { tag: 'PAP', nombre: 'LOS PAPUL0VERS' },
        { tag: 'NS', nombre: 'NO SMITES' },
        { tag: 'TUT', nombre: 'UNOWN TEAM' },
        { tag: 'TM', nombre: 'TEAM MANICOMIO' }
    ];

    let draggedItem = null;
    let sourceContainer = null;


    function crearEquipoElemento(equipo) {
        const item = document.createElement('div');
        item.classList.add('list-group-item', 'draggable');
        item.setAttribute('draggable', true);
        item.dataset.tag = equipo.tag;
        item.dataset.nombre = equipo.nombre;

        item.innerHTML = `
            <div class="card-round-tierlist">
                <div class="card-round-team">
                    <a href="/">
                        <img src="/assets/logos/${equipo.tag}.webp" alt="${equipo.nombre}" class="img-fluid">
                    </a>
                    <div class="card-round-title">
                        <h2>${equipo.nombre}</h2>
                    </div>
                </div>
                <div class="card-back">
                    <div class="card-color-left ${equipo.tag}"></div>
                </div>
            </div>
        `;
        return item;
    }


    equiposData.forEach(equipo => {
        const equipoElemento = crearEquipoElemento(equipo);
        equiposContainer.appendChild(equipoElemento);
    });


    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('draggable')) {
            draggedItem = e.target;
            sourceContainer = e.target.parentNode;
            e.dataTransfer.setData('text/plain', null);
        } else if (e.target.closest('.draggable')) {
            draggedItem = e.target.closest('.draggable');
            sourceContainer = draggedItem.parentNode;
            e.dataTransfer.setData('text/plain', null);
        }
    });

    tierLists.forEach(container => {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedItem && container.classList.contains('list-group')) {
                container.appendChild(draggedItem);
                draggedItem = null;
                sourceContainer = null;
            }
        });
    });


    const descargarBtn = document.getElementById('descargarBtn');
    const nombreModal = new bootstrap.Modal(document.getElementById('nombreModal'));
    const nombreCreadorInput = document.getElementById('nombreCreador');
    const confirmarNombreBtn = document.getElementById('confirmarNombre');
    const descargarElemento = document.getElementById('descargar');
    const nickPlaceholder = 'FORZE';

    let tierlistCreador = nickPlaceholder;

    descargarBtn.addEventListener('click', () => {
        nombreModal.show();
    });


    confirmarNombreBtn.addEventListener('click', () => {
        const nombreIngresado = nombreCreadorInput.value.trim();
        if (nombreIngresado) {
            tierlistCreador = nombreIngresado.toUpperCase(); // Convertir a mayúsculas como en el ejemplo
        } else {
            tierlistCreador = nickPlaceholder; // Si no ingresa nada, usar el nick por defecto
        }
        nombreModal.hide();
        generarYDescargarImagen();
    });


function generarYDescargarImagen() {
        const bannerTextSpan = descargarElemento.querySelector('.bannerText span:nth-child(2)');
        if (bannerTextSpan) {
            bannerTextSpan.textContent = `TIERLIST POR ${tierlistCreador} | `;
        }

        html2canvas(descargarElemento).then(canvas => {
            const link = document.createElement('a');
            link.download = `tierlist_${tierlistCreador}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // Revertir el texto a "FORZE" después de la descarga (opcional)
            if (bannerTextSpan) {
                bannerTextSpan.textContent = `TIERLIST POR ${nickPlaceholder} | `;
            }
        });
    }



});