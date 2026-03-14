/**
 * Calculate the current moon phase (0–1) using a simplified lunation algorithm.
 * 0 = new moon, 0.25 = first quarter, 0.5 = full moon, 0.75 = last quarter
 * Based on a known new moon reference date and the synodic month (29.53059 days).
 */
function getMoonPhase(): number {
  const now = new Date();
  // Known new moon: January 6, 2000, 18:14 UTC
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const synodicMonth = 29.53059;

  const daysSinceKnown = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const lunations = daysSinceKnown / synodicMonth;
  const phase = lunations - Math.floor(lunations); // 0..1

  return phase;
}

function getPhaseName(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return "New Moon";
  if (phase < 0.22) return "Waxing Crescent";
  if (phase < 0.28) return "First Quarter";
  if (phase < 0.47) return "Waxing Gibbous";
  if (phase < 0.53) return "Full Moon";
  if (phase < 0.72) return "Waning Gibbous";
  if (phase < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

export function initMoon() {
  const hero = document.querySelector(".hero") as HTMLElement;
  if (!hero) return;

  const phase = getMoonPhase();

  const moon = document.createElement("div");
  moon.classList.add("hero-moon");

  // Phase shadow overlay — creates the illuminated/dark split
  const phaseOverlay = document.createElement("div");
  phaseOverlay.classList.add("hero-moon-phase");
  moon.appendChild(phaseOverlay);

  // Apply phase shadow
  // phase 0 = new (fully dark), 0.5 = full (fully lit)
  // The shadow sweeps from right to left (waxing), then left to right (waning)
  applyPhase(phaseOverlay, phase);

  // Crater texture layer
  const craters = document.createElement("div");
  craters.classList.add("hero-moon-craters");
  moon.appendChild(craters);

  // Film grain overlay
  const grain = document.createElement("div");
  grain.classList.add("hero-moon-grain");
  moon.appendChild(grain);

  // Inner glow ring
  const glow = document.createElement("div");
  glow.classList.add("hero-moon-glow");
  moon.appendChild(glow);

  // Surface light
  const surface = document.createElement("div");
  surface.classList.add("hero-moon-surface");
  moon.appendChild(surface);

  // Corona / outer halo
  const corona = document.createElement("div");
  corona.classList.add("hero-moon-corona");
  moon.appendChild(corona);

  // Phase label
  const label = document.createElement("div");
  label.classList.add("hero-moon-label");
  label.textContent = getPhaseName(phase);
  moon.appendChild(label);

  hero.insertBefore(moon, hero.firstChild);

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let clickEnergy = 0;
  let clickDecay = 0;

  document.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    mouseX = (e.clientX - centerX) / (rect.width / 2);
    mouseY = (e.clientY - centerY) / (rect.height / 2);

    mouseX = Math.max(-1, Math.min(1, mouseX));
    mouseY = Math.max(-1, Math.min(1, mouseY));
  });

  // Click interaction
  moon.style.pointerEvents = "auto";
  moon.style.cursor = "pointer";

  moon.addEventListener("click", () => {
    clickEnergy = 1;
    clickDecay = 0;

    // Shockwave ripple element
    const ripple = document.createElement("div");
    ripple.classList.add("hero-moon-ripple");
    moon.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());

    // Particle burst
    for (let i = 0; i < 16; i++) {
      const particle = document.createElement("div");
      particle.classList.add("hero-moon-particle");
      const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.4;
      const dist = 120 + Math.random() * 160;
      const size = 2 + Math.random() * 4;
      const duration = 600 + Math.random() * 600;

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
      particle.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
      particle.style.animationDuration = `${duration}ms`;

      const colors = ["#f9c440", "#fff394", "#cc3b02"];
      particle.style.background = colors[i % 3];

      moon.appendChild(particle);
      particle.addEventListener("animationend", () => particle.remove());
    }
  });

  function animate() {
    currentX += (mouseX - currentX) * 0.06;
    currentY += (mouseY - currentY) * 0.06;

    if (clickEnergy > 0) {
      clickDecay += 0.025;
      clickEnergy = Math.max(0, 1 - clickDecay);
    }

    const moveX = currentX * 24;
    const moveY = currentY * 24;

    moon.style.transform = `translate(${-moveX}px, ${-moveY}px)`;

    const lightDistance = Math.sqrt(currentX ** 2 + currentY ** 2);
    const shadowX = currentX * 40;
    const shadowY = currentY * 40;

    surface.style.background = `radial-gradient(
      circle at ${50 + currentX * 30}% ${50 + currentY * 30}%,
      rgba(249, 196, 64, ${0.10 + clickEnergy * 0.12}) 0%,
      rgba(255, 243, 148, ${0.03 + clickEnergy * 0.05}) 35%,
      transparent 65%
    )`;

    const glowIntensity = 0.08 + lightDistance * 0.05 + clickEnergy * 0.15;

    glow.style.boxShadow = `
      ${shadowX}px ${shadowY}px ${70 + lightDistance * 40}px rgba(249, 196, 64, ${glowIntensity}),
      0 0 120px rgba(249, 196, 64, ${0.04 + clickEnergy * 0.08})
    `;

    corona.style.opacity = `${0.05 + clickEnergy * 0.1}`;

    grain.style.opacity = clickEnergy > 0.3 ? `${0.12 + clickEnergy * 0.1}` : "0.1";

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

/**
 * Apply the moon phase as a shadow overlay using CSS gradients.
 * Uses an ellipse technique to simulate the terminator (day/night boundary).
 *
 * phase 0..0.5: waxing (shadow recedes from right to left)
 * phase 0.5..1: waning (shadow advances from right to left)
 */
function applyPhase(el: HTMLElement, phase: number) {
  // illumination: 0 at new, 1 at full
  const illumination = 1 - Math.abs(2 * phase - 1);

  // Terminator position as a percentage of the diameter
  // Maps illumination 0..1 to the ellipse width
  const terminatorWidth = Math.abs(illumination * 2 - 1) * 50; // 0..50%
  const isWaxing = phase <= 0.5;
  const isPastHalf = illumination > 0.5;

  let bg: string;

  if (illumination < 0.02) {
    // New moon — almost fully dark
    bg = `radial-gradient(circle, rgba(140,213,255,0.25) 0%, rgba(140,213,255,0.3) 100%)`;
  } else if (illumination > 0.98) {
    // Full moon — no shadow
    bg = "none";
  } else if (isWaxing) {
    if (isPastHalf) {
      // Waxing gibbous — small shadow on the left
      bg = `linear-gradient(to right, rgba(140,213,255,0.25) 0%, rgba(140,213,255,0.18) ${50 - terminatorWidth}%, transparent ${50}%, transparent 100%)`;
    } else {
      // Waxing crescent — large shadow, lit on right
      bg = `linear-gradient(to right, rgba(140,213,255,0.25) 0%, rgba(140,213,255,0.22) ${50 + terminatorWidth}%, transparent ${50 + terminatorWidth + 10}%, transparent 100%)`;
    }
  } else {
    if (isPastHalf) {
      // Waning gibbous — small shadow on the right
      bg = `linear-gradient(to left, rgba(140,213,255,0.25) 0%, rgba(140,213,255,0.18) ${50 - terminatorWidth}%, transparent ${50}%, transparent 100%)`;
    } else {
      // Waning crescent — large shadow, lit on left
      bg = `linear-gradient(to left, rgba(140,213,255,0.25) 0%, rgba(140,213,255,0.22) ${50 + terminatorWidth}%, transparent ${50 + terminatorWidth + 10}%, transparent 100%)`;
    }
  }

  el.style.background = bg;
}
