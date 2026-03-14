import { throttle } from "/assets/js/utils.js";

export function createParticleSystem(canvas, options = {}) {
  if (!canvas) {
    return { destroy() {} };
  }

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  const particleOptions = {
    dayDesktop: 260,
    nightDesktop: 180,
    dayMobile: 110,
    nightMobile: 70,
    ...(options.particles || {}),
  };
  let currentTheme = document.body.dataset.theme === "day" ? "day" : "night";
  let particleCount = 0;
  const particles = [];
  let rafId = null;
  const pointer = { x: -2000, y: -2000 };

  function syncParticleCount() {
    if (reducedMotion) {
      particleCount = 0;
      return;
    }
    if (currentTheme === "day") {
      particleCount = isMobile ? particleOptions.dayMobile : particleOptions.dayDesktop;
      return;
    }
    particleCount = isMobile ? particleOptions.nightMobile : particleOptions.nightDesktop;
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function makeParticle() {
    return {
      x: random(0, canvas.width),
      y: random(0, canvas.height),
      vx: random(-0.25, 0.25),
      vy: random(-0.25, 0.25),
      size: random(1.2, 2.8),
      alpha: random(0.2, 0.8),
    };
  }

  function initParticles() {
    syncParticleCount();
    particles.length = 0;
    for (let i = 0; i < particleCount; i += 1) {
      particles.push(makeParticle());
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      const dx = pointer.x - p.x;
      const dy = pointer.y - p.y;
      const distance = Math.hypot(dx, dy) || 1;

      if (distance < 220) {
        p.vx += (dx / distance) * 0.016;
        p.vy += (dy / distance) * 0.016;
      }

      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      p.x = Math.max(0, Math.min(canvas.width, p.x));
      p.y = Math.max(0, Math.min(canvas.height, p.y));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      const alphaBoost = currentTheme === "day" ? Math.min(1, p.alpha + 0.2) : p.alpha;
      const color = currentTheme === "day" ? "74, 184, 255" : "115, 226, 255";
      ctx.fillStyle = `rgba(${color}, ${alphaBoost})`;
      ctx.fill();
    }

    rafId = requestAnimationFrame(render);
  }

  const onPointerMove = throttle((event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, 16);

  resize();
  initParticles();

  window.addEventListener("theme:change", (event) => {
    currentTheme = event.detail === "day" ? "day" : "night";
    initParticles();
  });

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", onPointerMove, { passive: true });
  window.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    pointer.x = touch.clientX;
    pointer.y = touch.clientY;
  }, { passive: true });

  if (!reducedMotion) {
    render();
  }

  return {
    destroy() {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onPointerMove);
      if (rafId) cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
