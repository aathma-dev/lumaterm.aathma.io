interface Particle {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  drift: number;
  phase: number;
}

export function initSpace() {
  const hero = document.querySelector(".hero") as HTMLElement;
  if (!hero) return;

  const container = document.createElement("div");
  container.classList.add("space-container");
  hero.insertBefore(container, hero.firstChild);

  const particles: Particle[] = [];
  const colors = ["#f9c440", "#fff394", "#cc3b02", "#ffffff", "#f9c440"];

  function spawn() {
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const el = document.createElement("div");
    el.classList.add("dust-particle");

    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 1.5 + Math.random() * 3;

    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.background = color;
    el.style.boxShadow = `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}`;

    container.appendChild(el);

    const x = Math.random() * w;
    const y = Math.random() * h;

    particles.push({
      el,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -0.1 - Math.random() * 0.2,
      life: 0,
      maxLife: 400 + Math.random() * 600,
      size,
      drift: (Math.random() - 0.5) * 0.003,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // Seed initial particles
  for (let i = 0; i < 20; i++) {
    spawn();
    // Randomize initial life so they don't all fade in at once
    particles[particles.length - 1].life = Math.floor(Math.random() * 300);
  }

  function update() {
    // Spawn occasionally
    if (Math.random() < 0.03) spawn();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;

      // Gentle drift with slight sine wobble
      p.vx += p.drift;
      p.x += p.vx + Math.sin(p.life * 0.02 + p.phase) * 0.15;
      p.y += p.vy;

      // Opacity: fade in, twinkle, fade out
      let opacity: number;
      const fadeIn = 60;
      const fadeOut = 80;

      if (p.life < fadeIn) {
        opacity = p.life / fadeIn;
      } else if (p.life > p.maxLife - fadeOut) {
        opacity = (p.maxLife - p.life) / fadeOut;
      } else {
        // Gentle twinkle
        opacity = 0.4 + Math.sin(p.life * 0.05 + p.phase) * 0.3;
      }

      p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      p.el.style.opacity = `${Math.max(0, Math.min(1, opacity))}`;

      if (p.life >= p.maxLife) {
        p.el.remove();
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
