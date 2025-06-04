// js/main.js

$(document).ready(function() {
    // 1. Inicializar modales
    window.initializeModals();

    // 2. Cargar todos los datos de equipos
    // loadAllTeamData es asíncrona, así que usamos .then()
    console.log("Iniciando carga de datos de equipos...");
    window.loadAllTeamData().then(({ equiposNorte, equiposSur }) => {
        // 3. Este bloque se ejecuta UNA VEZ que loadAllTeamData haya terminado.
        console.log("Datos de equipos cargados. allTeamData en main.js:", window.allTeamData);
        console.log("equiposNorte:", equiposNorte);
        console.log("equiposSur:", equiposSur);

        // 4. Inicializar las tablas DataTables (solo si no están ya inicializadas)
        // Estas llamadas deben ocurrir *después* de que allTeamData esté poblado.
        if (!window.playersDataTable) { // Verifica si ya está inicializada
            window.initializePlayersTable();
        }
        if (!window.teamsDataTable) { // Verifica si ya está inicializada
            window.initializeTeamsTable();
        }

        // 5. Siempre llama a initializePointsTables ya que sus datos pueden cambiar
        // y refreshTables, ya que estas funciones son las que actualizan los datos mostrados.
        window.initializePointsTables(equiposNorte, equiposSur);
        window.refreshTables(); // <-- ¡Esta línea es CRUCIAL para mostrar los datos!
        window.populateTeamDatalist();
        console.log("Tablas inicializadas y refrescadas.");

    }).catch(error => {
        console.error("Error en la carga inicial de la aplicación:", error);
        // Si hay un error al cargar los datos, inicializa las tablas vacías
        if (!window.playersDataTable) { window.initializePlayersTable(); }
        if (!window.teamsDataTable) { window.initializeTeamsTable(); }
        window.initializePointsTables([], []); // Pasa arrays vacíos
        window.refreshTables();
    });

    // NOTA: Los manejadores de eventos específicos de botones/formularios
    // se cargarán automáticamente desde 'events.js' si están dentro de su propio $(document).ready
});