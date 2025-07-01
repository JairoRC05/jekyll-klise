
  const sliderContent = document.getElementById('slider-content');

  const detectarIcono = (url) => {
    if (!url) return "";
    if (url.includes("twitch.tv")) return "bi-twitch";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "bi-youtube";
    if (url.includes("discord.gg") || url.includes("discord.com")) return "bi-discord";
    if (url.includes("twitter.com") || url.includes("x.com")) return "bi-twitter-x";
    if (url.includes("instagram.com")) return "bi-instagram";
    if (url.includes("facebook.com")) return "bi-facebook";
    return "";
  };

  fetch('/assets/banners/banners.json')
    .then(response => response.json())
    .then(banners => {
      const bannersActivos = banners.filter(item => item.activo);
      if (bannersActivos.length === 0) {
        sliderContent.innerHTML = `<p class="text-white">No hay banners activos</p>`;
        return;
      }

      bannersActivos.forEach((item, index) => {
        const isActive = index === 0 ? 'active' : '';
        const iconClass = detectarIcono(item.boton?.url);
        const iconHTML = iconClass ? `<i class="bi ${iconClass}"></i>` : '';

        sliderContent.innerHTML += `
          <div class="carousel-item ${isActive}">
            <div class="hero-banner" style="background-image: url('${item.imagen}');">
              <div class="hero-banner-content">
                <h2>${item.titulo}</h2>
                <p>${item.descripcion}</p>
                ${item.boton ? `
                  <div class="hero-banner-buttons">
                    <a class="btn btn-dark-custom" href="${item.boton.url}" target="_blank">
                      ${iconHTML} ${item.boton.texto}
                    </a>
                  </div>` : ''}
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch(error => {
      console.error("Error al cargar banners:", error);
      sliderContent.innerHTML = `<p class="text-danger">Error al cargar banners</p>`;
    });

