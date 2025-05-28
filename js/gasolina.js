// --- Datos de los equipos (similar a tu JSON) ---
const datosEquipos = {
  "equipos": [
    {
      "nombre": "Dinasty",
      "macro": 8,
      "micro": 9,
      "pool": 8,
      "mentalidad": 8,
      "disciplina": 8
    },
    {
      "nombre": "Stamina ES",
      "macro": 9,
      "micro": 8,
      "pool": 8,
      "mentalidad": 9,
      "disciplina": 9
    },
    {
      "nombre": "IM Obsidiana",
      "macro": 8,
      "micro": 9,
      "pool": 7,
      "mentalidad": 8,
      "disciplina": 9
    }
  ]
};

const pesosPropiedadesEquipo = {
    "macro": 0.25,      // Ejemplo: 25% de importancia para macro
    "micro": 0.25,      // Ejemplo: 25% de importancia para micro
    "pool": 0.2,        // Ejemplo: 20% de importancia para pool
    "mentalidad": 0.15, // Ejemplo: 15% de importancia para mentalidad
    "disciplina": 0.15  // Ejemplo: 15% de importancia para disciplina
};


function calcularPuntuacionTotalEquipo(equipo, pesos) {
    let puntuacionTotal = 0;
    for (const prop in pesos) {
        if (equipo.hasOwnProperty(prop)) {
            puntuacionTotal += equipo[prop] * pesos[prop];
        }
    }
    return puntuacionTotal;
}


// Calcular las puntuaciones para todos los equipos una sola vez
const equiposConPuntuacion = datosEquipos.equipos.map(equipo => {
    return {
        ...equipo,
        puntuacionTotal: calcularPuntuacionTotalEquipo(equipo, pesosPropiedadesEquipo)
    };
});

console.log("Puntuaciones totales de los equipos (antes de normalizar):", equiposConPuntuacion.map(e => ({ nombre: e.nombre, puntuacion: e.puntuacionTotal })));


// Encontrar la puntuación máxima y mínima para normalizar los medidores
const puntuacionMaxima = Math.max(...equiposConPuntuacion.map(equipo => equipo.puntuacionTotal));
const puntuacionMinima = Math.min(...equiposConPuntuacion.map(equipo => equipo.puntuacionTotal));
const SCORE_RANGE = puntuacionMaxima - puntuacionMinima;

// --- Clase Meter adaptada para nuestras necesidades ---
let Meter = function Meter($elm, config) {
    let $needle, $value;
    const transitionSpeed = config.transitionSpeed || 0.5; // Default 0.5 segundos

    const steps = (config.valueMax - config.valueMin) / config.valueStep;
    const angleStep = (config.angleMax - config.angleMin) / steps;
    const margin = 10;

    let value2angle = function(value) {
        value = Math.max(config.valueMin, Math.min(config.valueMax, value));
        let angle = ((value - config.valueMin) / (config.valueMax - config.valueMin)) * (config.angleMax - config.angleMin) + config.angleMin;
        return angle;
    };

    // Almacena el valor final para la oscilación
    let targetValue = config.value;
    let currentAnimationTimeout = null; // Para gestionar animaciones
    let oscillationInterval = null; // Para la oscilación continua

    // Nuevo método para establecer el valor con oscilación
    this.setValue = function(v, duration = transitionSpeed) {
        targetValue = v; // Guarda el valor final
        
        // Limpia cualquier animación previa para evitar conflictos
        if (currentAnimationTimeout) {
            clearTimeout(currentAnimationTimeout);
            currentAnimationTimeout = null;
        }
        if (oscillationInterval) {
            clearInterval(oscillationInterval);
            oscillationInterval = null;
        }

        // Mueve la aguja a la posición principal con la duración dada
        $needle.style.transition = `transform ${duration}s ease-out`;
        $needle.style.transform = "translate3d(-50%, 0, 0) rotate(" + Math.round(value2angle(v)) + "deg)";
        $value.innerHTML = config.needleFormat(v);

        // Inicia el efecto de oscilación después de que la transición principal termine
        currentAnimationTimeout = setTimeout(() => {
            this.startOscillation();
        }, duration * 1000 + 50); // Pequeño retardo para asegurar que la transición principal finalice
    };

   this.startOscillation = function() {
        // Rango de oscilación (ej. 1% del rango total del medidor)
        const oscillationRange = (config.valueMax - config.valueMin) * 0.005; // Ajusta este valor para más o menos oscilación
        const oscillationSpeed = 100; // ms, velocidad de la oscilación (más bajo = más rápido)
        let direction = 1; // 1 para adelante, -1 para atrás
        let oscillationStepCount = 0; // Para un patrón de movimiento más sofisticado si se quisiera

        oscillationInterval = setInterval(() => {
            // Calcula el valor actual con la oscilación.
            // Usamos Math.sin para una oscilación más natural (senoidal)
            // Esto crea un movimiento suave de vaivén
            const oscillationOffset = oscillationRange * Math.sin(oscillationStepCount * 0.1); // 0.1 ajusta la frecuencia

            let oscillatingValue = targetValue + oscillationOffset;
            
            // Asegurarse de que no se salga de los límites del medidor
            oscillatingValue = Math.max(config.valueMin, Math.min(config.valueMax, oscillatingValue));

            // Aplicar una transición más corta para la oscilación
            $needle.style.transition = `transform ${oscillationSpeed / 1000}s ease-in-out`;
            $needle.style.transform = "translate3d(-50%, 0, 0) rotate(" + Math.round(value2angle(oscillatingValue)) + "deg)";
            
            oscillationStepCount++; // Incrementa para el patrón senoidal
            // Si quisieras una oscilación simple de "adelante y atrás", usarías:
            // direction *= -1;
            // let offset = oscillationRange * direction;
            // let oscillatingValue = targetValue + offset;

        }, oscillationSpeed); // Este intervalo se ejecutará indefinidamente hasta que se detenga externamente
    };

    // Método para detener la aguja y resetearla a 0
    this.reset = function() {
        if (currentAnimationTimeout) {
            clearTimeout(currentAnimationTimeout);
            currentAnimationTimeout = null;
        }
        if (oscillationInterval) {
            clearInterval(oscillationInterval);
            oscillationInterval = null;
        }
        // Transición rápida de vuelta a 0
        $needle.style.transition = 'transform 0.5s ease-in-out';
        $needle.style.transform = "translate3d(-50%, 0, 0) rotate(" + Math.round(value2angle(config.valueMin)) + "deg)";
        $value.innerHTML = config.needleFormat(config.valueMin);
        targetValue = config.valueMin; // Resetear el valor objetivo
    };
    
    let makeElement = function(parent, className, innerHtml, style) {
        let e = document.createElement('div');
        e.className = className;
        if (innerHtml) { e.innerHTML = innerHtml; }
        if (style) {
            for (var prop in style) { e.style[prop] = style[prop]; }
        }
        parent.appendChild(e);
        return e;
    };

 
      // Label unit
    makeElement($elm, "label label-unit", config.valueUnit);

    for (let n = 0; n < steps + 1; n++) {
        let value = config.valueMin + n * config.valueStep;
        angle = config.angleMin + n * angleStep;
        
        let redzoneClass = "";
        if (config.valueRed && value > config.valueRed) {
            redzoneClass = " redzone";
        }
        
        makeElement($elm, "grad grad--" + n + redzoneClass, config.labelFormat(value), {
            left: (50 - (50 - margin) * Math.sin(angle * (Math.PI / 180))) + "%",
            top: (50 + (50 - margin) * Math.cos(angle * (Math.PI / 180))) + "%"
        });	

        makeElement($elm, "grad-tick grad-tick--" + n + redzoneClass, "", {
            left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
            top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
            transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
        });

        // Add half and quarter ticks only if the step is small enough to warrant them
        if (config.valueStep <= 1000) { // Arbitrary threshold
            let currentAngle = angle;
            // Half tick
            currentAngle += angleStep / 2;
            if (currentAngle < config.angleMax + angleStep / 4) { // Add a small buffer for the last tick
                makeElement($elm, "grad-tick grad-tick--half grad-tick--" + n + redzoneClass, "", {
                    left: (50 - 50 * Math.sin(currentAngle * (Math.PI / 180))) + "%",
                    top: (50 + 50 * Math.cos(currentAngle * (Math.PI / 180))) + "%",
                    transform: "translate3d(-50%, 0, 0) rotate(" + (currentAngle + 180) + "deg)"
                });
            }

            // Quarter ticks
            currentAngle = angle + angleStep / 4;
            if (currentAngle < config.angleMax + angleStep / 8) {
                makeElement($elm, "grad-tick grad-tick--quarter grad-tick--" + n + redzoneClass, "", {
                    left: (50 - 50 * Math.sin(currentAngle * (Math.PI / 180))) + "%",
                    top: (50 + 50 * Math.cos(currentAngle * (Math.PI / 180))) + "%",
                    transform: "translate3d(-50%, 0, 0) rotate(" + (currentAngle + 180) + "deg)"
                });
            }
            currentAngle = angle - angleStep / 4;
            if (currentAngle > config.angleMin - angleStep / 8) {
                 makeElement($elm, "grad-tick grad-tick--quarter grad-tick--" + n + redzoneClass, "", {
                    left: (50 - 50 * Math.sin(currentAngle * (Math.PI / 180))) + "%",
                    top: (50 + 50 * Math.cos(currentAngle * (Math.PI / 180))) + "%",
                    transform: "translate3d(-50%, 0, 0) rotate(" + (currentAngle + 180) + "deg)"
                });
            }
        }
    }
    
    // NEEDLE
    $needle = makeElement($elm, "needle", "", {
        transform: "translate3d(-50%, 0, 0) rotate(" + Math.round(value2angle(config.value)) + "deg)"
    });
    $needle.style.transition = `transform ${transitionSpeed}s ease-out`; // Set initial transition

    let $axle = makeElement($elm, "needle-axle");
    $value = makeElement($elm, "label label-value", "<div>" + config.needleFormat(config.value) + "</div>" + "<span>" + config.labelUnit + "</span>").querySelector("div");
};



// --- Lógica principal al cargar el DOM ---
document.addEventListener("DOMContentLoaded", function() {
    const team1Select = document.getElementById('team1-select');
    const team2Select = document.getElementById('team2-select');
    const compareBtn = document.getElementById('compare-btn');
    const stopBtn = document.getElementById('stop-btn'); // Referencia al nuevo botón

    // Rellenar los selectores
    equiposConPuntuacion.forEach(equipo => {
        const option1 = document.createElement('option');
        option1.value = equipo.nombre;
        option1.textContent = equipo.nombre;
        team1Select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = equipo.nombre;
        option2.textContent = equipo.nombre;
        team2Select.appendChild(option2);
    });

    // Asegurarse de que al menos se selecciona el primer equipo por defecto
    if (equiposConPuntuacion.length > 0) {
        team1Select.value = equiposConPuntuacion[0].nombre;
        // Si hay al menos dos equipos, selecciona el segundo para el equipo 2
        if (equiposConPuntuacion.length > 1) {
            team2Select.value = equiposConPuntuacion[1].nombre;
        } else {
             // Si solo hay un equipo, el segundo selector también lo tendrá
            team2Select.value = equiposConPuntuacion[0].nombre;
        }
    }


    // Inicializar los medidores
    const meterTeam1 = new Meter(document.querySelector(".meter--team1"), {
        value: 0, valueMin: 0, valueMax: 100, valueStep: 10,
        valueUnit: "Puntuación Total", angleMin: 30, angleMax: 330,
        labelUnit: "%", labelFormat: function(v) { return Math.round(v); },
        needleFormat: function(v) { return Math.round(v); },
        valueRed: 85,
        transitionSpeed: 0.5 // Valor inicial, será sobrescrito
    });

    const meterTeam2 = new Meter(document.querySelector(".meter--team2"), {
        value: 0, valueMin: 0, valueMax: 100, valueStep: 10,
        valueUnit: "Puntuación Total", angleMin: 30, angleMax: 330,
        labelUnit: "%", labelFormat: function(v) { return Math.round(v); },
        needleFormat: function(v) { return Math.round(v); },
        valueRed: 85,
        transitionSpeed: 0.5 // Valor inicial, será sobrescrito
    });

    // Evento del botón comparar
    compareBtn.addEventListener('click', function() {
        const selectedTeam1Name = team1Select.value;
        const selectedTeam2Name = team2Select.value;

        const team1 = equiposConPuntuacion.find(e => e.nombre === selectedTeam1Name);
        const team2 = equiposConPuntuacion.find(e => e.nombre === selectedTeam2Name);

        if (team1 && team2) {
            let normalizedScore1, normalizedScore2;

            if (SCORE_RANGE === 0) { // Si todas las puntuaciones son iguales
                normalizedScore1 = 100;
                normalizedScore2 = 100;
            } else {
                normalizedScore1 = ((team1.puntuacionTotal - puntuacionMinima) / SCORE_RANGE) * 100;
                normalizedScore2 = ((team2.puntuacionTotal - puntuacionMinima) / SCORE_RANGE) * 100;
            }
            
            const MIN_TRANSITION_SPEED = 0.2; // s
            const MAX_TRANSITION_SPEED = 1.5; // s

            const team1ScoreRatio = (team1.puntuacionTotal - puntuacionMinima) / SCORE_RANGE;
            const team2ScoreRatio = (team2.puntuacionTotal - puntuacionMinima) / SCORE_RANGE;

            const transitionDuration1 = MIN_TRANSITION_SPEED + (1 - team1ScoreRatio) * (MAX_TRANSITION_SPEED - MIN_TRANSITION_SPEED);
            const transitionDuration2 = MIN_TRANSITION_SPEED + (1 - team2ScoreRatio) * (MAX_TRANSITION_SPEED - MIN_TRANSITION_SPEED);

            const finalDuration1 = Math.min(MAX_TRANSITION_SPEED, Math.max(MIN_TRANSITION_SPEED, transitionDuration1));
            const finalDuration2 = Math.min(MAX_TRANSITION_SPEED, Math.max(MIN_TRANSITION_SPEED, transitionDuration2));

            meterTeam1.setValue(normalizedScore1, finalDuration1);
            meterTeam2.setValue(normalizedScore2, finalDuration2);

            // Opcional: Resaltar el medidor del equipo "ganador"
            if (normalizedScore1 > normalizedScore2) {
                document.querySelector('.meter--team1').style.borderColor = 'gold'; 
                document.querySelector('.meter--team2').style.borderColor = '#ccc';
            } else if (normalizedScore2 > normalizedScore1) {
                document.querySelector('.meter--team2').style.borderColor = 'gold'; 
                document.querySelector('.meter--team1').style.borderColor = '#ccc';
            } else {
                 document.querySelector('.meter--team1').style.borderColor = '#ccc';
                 document.querySelector('.meter--team2').style.borderColor = '#ccc';
            }

        } else {
            alert('Por favor, selecciona dos equipos válidos.');
        }
    });

    // Evento del botón "Detener y Reiniciar"
    stopBtn.addEventListener('click', function() {
        meterTeam1.reset();
        meterTeam2.reset();
        // Quitar el resaltado de los bordes
        document.querySelector('.meter--team1').style.borderColor = '#ccc';
        document.querySelector('.meter--team2').style.borderColor = '#ccc';
    });
});