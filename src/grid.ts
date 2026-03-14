export function initGrid() {
  const canvas = document.createElement("canvas");
  canvas.id = "grid-canvas";
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d")!;
  const SPACING = 28;
  const DOT_RADIUS = 1.2;
  const BASE_ALPHA = 0.12;
  const INFLUENCE_RADIUS = 160;
  const PUSH_STRENGTH = 14;
  const CHROMATIC_OFFSET = 3;

  let mouseX = -1000;
  let mouseY = -1000;
  let scrollY = 0;
  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;
  let dpr = 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(width / SPACING) + 1;
    rows = Math.ceil(height / SPACING) + 1;
  }

  resize();
  window.addEventListener("resize", resize);

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener("mouseleave", () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
  }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const offsetX = -(scrollY * 0) % SPACING;
    const offsetY = -(scrollY % SPACING);

    for (let r = -1; r <= rows; r++) {
      for (let c = -1; c <= cols; c++) {
        const baseX = c * SPACING + offsetX;
        const baseY = r * SPACING + offsetY;

        let drawX = baseX;
        let drawY = baseY;
        let alpha = BASE_ALPHA;
        let radius = DOT_RADIUS;

        const dx = baseX - mouseX;
        const dy = baseY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let chromatic = 0;

        if (dist < INFLUENCE_RADIUS) {
          const t = 1 - dist / INFLUENCE_RADIUS;
          const eased = t * t;
          const angle = Math.atan2(dy, dx);
          drawX += Math.cos(angle) * PUSH_STRENGTH * eased;
          drawY += Math.sin(angle) * PUSH_STRENGTH * eased;
          alpha = BASE_ALPHA + 0.35 * eased;
          radius = DOT_RADIUS + 0.8 * eased;
          chromatic = CHROMATIC_OFFSET * eased;
        }

        if (chromatic > 0.1) {
          const angle = Math.atan2(dy, dx);
          const perp = angle + Math.PI / 2;
          const cx = Math.cos(perp) * chromatic;
          const cy = Math.sin(perp) * chromatic;

          ctx.globalCompositeOperation = "lighter";
          ctx.beginPath();
          ctx.arc(drawX - cx, drawY - cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,60,60,${alpha})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(60,255,60,${alpha})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(drawX + cx, drawY + cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(60,60,255,${alpha})`;
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";
        } else {
          ctx.beginPath();
          ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fill();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}
