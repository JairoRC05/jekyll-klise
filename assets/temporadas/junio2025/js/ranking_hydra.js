// ranking_hydra.js

document.addEventListener('DOMContentLoaded', function() {
    const teamFilesSur = [
        '/assets/temporadas/junio2025/amet.json',
        '/assets/temporadas/junio2025/cd.json',
        '/assets/temporadas/junio2025/dg.json',
        '/assets/temporadas/junio2025/dinasty.json',
        '/assets/temporadas/junio2025/ftb.json',
        '/assets/temporadas/junio2025/plaga.json',
        '/assets/temporadas/junio2025/platino.json',
        '/assets/temporadas/junio2025/poa.json',
        '/assets/temporadas/junio2025/rntes.json',
        '/assets/temporadas/junio2025/sm.json',
        '/assets/temporadas/junio2025/space.json',
        '/assets/temporadas/junio2025/trr.json',
        '/assets/temporadas/junio2025/zafiro.json'
    ];

    // Llama a la función genérica para el grupo SUR
    loadAndDisplayRanking('grupoSur', teamFilesSur, 'SOUTH');
});