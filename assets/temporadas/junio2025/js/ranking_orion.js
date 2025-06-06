// ranking_orion.js

document.addEventListener('DOMContentLoaded', function() {
    const teamFilesNorte = [
        '/assets/temporadas/junio2025/aep.json',
        '/assets/temporadas/junio2025/amt.json',
        '/assets/temporadas/junio2025/lb.json',
        '/assets/temporadas/junio2025/magma.json',
        '/assets/temporadas/junio2025/obs.json',
        '/assets/temporadas/junio2025/pkr.json',
        '/assets/temporadas/junio2025/pl.json',
        '/assets/temporadas/junio2025/quartz.json',
        '/assets/temporadas/junio2025/sapphire.json',
        '/assets/temporadas/junio2025/stmn.json',
        '/assets/temporadas/junio2025/tae.json',
        '/assets/temporadas/junio2025/tut.json',
        '/assets/temporadas/junio2025/tutw.json'
    ];

    // Llama a la función genérica para el grupo NORTE
    loadAndDisplayRanking('grupoNorte', teamFilesNorte, 'NORTH');
});