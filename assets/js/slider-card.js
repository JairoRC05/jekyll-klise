 document.addEventListener("DOMContentLoaded", () => {


    const carrusel = document.getElementById("contenedor-cards");
    const btnIzq = document.getElementById("slide-left");
    const btnDer = document.getElementById("slide-right");

    const scrollBy = 300; // Puedes ajustar según tamaño de card

    btnIzq.addEventListener("click", () => {
      carrusel.scrollBy({ left: -scrollBy, behavior: "smooth" });
    });

    btnDer.addEventListener("click", () => {
      carrusel.scrollBy({ left: scrollBy, behavior: "smooth" });
    });
  });   