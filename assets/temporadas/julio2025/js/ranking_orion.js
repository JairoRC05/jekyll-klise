// ranking_orion.js

document.addEventListener('DOMContentLoaded', function() {
    const teamFilesNorte = [
      
        '/assets/temporadas/julio2025/obs.json',
        '/assets/temporadas/julio2025/platino.json',
    ];

    // Llama a la función genérica para el grupo NORTE
    loadAndDisplayRanking('grupoNorte', teamFilesNorte, 'NORTH');
});