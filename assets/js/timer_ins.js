
    const deadline = new Date("2025-07-08T23:59:59").getTime();

    const countdown = document.getElementById("countdown");

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline - now;

      if (distance < 0) {
        clearInterval(interval);
        countdown.innerHTML = "Inscripciones cerradas";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdown.innerHTML = `Finaliza en: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);

    //estrellas
    const canvas = document.getElementById('starIndigo');
    const ctx = canvas.getContext('2d');
    const stars = [];
    const numStars = 100;

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createStars() {
      stars.length = 0;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random(),
          delta: Math.random() * 0.02
        });
      }
    }

    function drawStars() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
        star.alpha += star.delta;
        if (star.alpha <= 0 || star.alpha >= 1) star.delta *= -1;
      }
      requestAnimationFrame(drawStars);
    }

    window.addEventListener('resize', () => {
      resizeCanvas();
      createStars();
    });

    resizeCanvas();
    createStars();
    drawStars();