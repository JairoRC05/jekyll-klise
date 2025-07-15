
function truncate(str, maxLength = 22, suffix = "...") {
  return str.length > maxLength ? str.slice(0, maxLength - suffix.length) + suffix : str;
}

function aplicarTruncadoResponsive() {
  const titulos = document.querySelectorAll('.title-league');
  titulos.forEach(el => {
    const fullTitle = el.dataset.title || "";
    let maxLength = 45; // por defecto para escritorio

    if (window.innerWidth < 576) {
      maxLength = 16; // móviles
    } else if (window.innerWidth < 768) {
      maxLength = 22; // tablets
    }

    el.textContent = truncate(fullTitle, maxLength);
  });
}

window.addEventListener('load', aplicarTruncadoResponsive);
window.addEventListener('resize', aplicarTruncadoResponsive);

