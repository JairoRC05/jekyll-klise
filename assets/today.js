document.addEventListener('DOMContentLoaded', () => {
    // Simula que obtienes los datos del JSON (en un caso real, harías un fetch)
    const matchesData = [
        {
            "id": "match1",
            "team1": {
                "name": "TUT OC",
                "shortName": "TUTW", // Nuevo campo
                "link": "/equipos/theunownteam--warriors",
                "colorClass": "TUTW"
            },
            "team2": {
                "name": "IM AMT",
                "shortName": "AMT", // Nuevo campo
                "link": "/imperio-mexa/--amatista",
                "colorClass": "AMT"
            },
            "round": "QF",
            "date": "CXF",
            "time": "21:00"
        },
        {
            "id": "match2",
            "team1": {
                "name": "FTB",
                "shortName": "FTB", // Nuevo campo
                "link": "/equipos/frostbite",
                "colorClass": "FTB"
            },
            "team2": {
                "name": "HG SM",
                "shortName": "SM", // Nuevo campo
                "link": "/house-of-ghost/--salario-minimo",
                "colorClass": "SM"
            },
            "round": "QF",
            "date": "CXF",
            "time": "21:50"
        },
        {
            "id": "match3",
            "team1": {
                "name": "PØĄ",
                "shortName": "PØĄ", // Nuevo campo
                "link": "/equipos/phobius-aura",
                "colorClass": "PØĄ"
            },
            "team2": {
                "name": "TUT OC",
                "shortName": "TUT", // Nuevo campo
                "link": "/equipos/theunownteam--warriors",
                "colorClass": "TUTW"
            },
            "round": "QF",
            "date": "CXF",
            "time": "22:15"
        }
        
    ];

    const resultsListContainer = document.querySelector('.results-list .match-item .teams-info');

    if (resultsListContainer) {
        matchesData.forEach(match => {
            // Genera la ruta del logo usando el shortName
            const team1LogoPath = `/assets/logos/${match.team1.shortName}.webp`;
            const team2LogoPath = `/assets/logos/${match.team2.shortName}.webp`;

            const cardHTML = `
                <div class="bracket-round-home" id="${match.id}">
                    <div class="bracket-round-team">
                        <a href="${match.team1.link}">
                            <img src="${team1LogoPath}" alt="Logo de ${match.team1.name}" class="img-fluid">
                        </a>
                    </div>
                    <div class="round-titles">
                        <div class="card-round-promo left">
                            <h6>${match.team1.name}</h6>
                        </div>
                        <div class="card-round-promo mx-2">
                            <h6>${match.round}</h6>
                            <span>${match.date}</span>
                            <span>${match.time}</span>
                        </div>
                        <div class="card-round-promo right">
                            <h6>${match.team2.name}</h6>
                        </div>
                    </div>
                    <div class="bracket-round-team-right">
                        <a href="${match.team2.link}">
                            <img src="${team2LogoPath}" alt="Logo de ${match.team2.name}" class="img-fluid">
                        </a>
                    </div>
                    <div class="card-back">
                        <div class="card-color-left ${match.team1.colorClass}"></div>
                        <div class="card-color-right ${match.team2.colorClass}"></div>
                    </div>
                </div>
            `;
            resultsListContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    } else {
        console.error('El contenedor ".results-list .match-item .teams-info" no se encontró.');
    }
});